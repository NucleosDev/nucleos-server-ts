-- =============================================================
-- Migration 014: DBE2 — Stored Procedures, Triggers e Views
-- Disciplina: Banco de Dados Empresariais 2 / BD2
-- Projeto: Nucleos Backend
-- Data: 2026-06-22
-- =============================================================
-- Objetivo: Demonstrar transações complexas com atomicidade,
-- stored procedures, triggers e views analíticas com subqueries.
-- =============================================================


-- =============================================================
-- SEÇÃO 1: TRIGGER — fn_set_updated_at
-- Função genérica reutilizável: atualiza automaticamente a
-- coluna updated_at em qualquer tabela (BEFORE UPDATE).
-- Aplicada via DO-block em todas as tabelas elegíveis.
-- =============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o trigger em todas as tabelas com coluna updated_at
-- sem sobrescrever triggers já existentes.
DO $$
DECLARE
  tbl text;
  tbl_list text[] := ARRAY[
    'blocos', 'calendario_eventos', 'campos', 'colecoes',
    'desafios', 'habitos', 'itens', 'itens_lista', 'listas',
    'metas', 'nucleos', 'rankings', 'streaks', 'tarefas',
    'timers', 'user_desafios', 'user_levels', 'user_preferences',
    'user_profiles'
  ];
  trigger_name text;
BEGIN
  FOREACH tbl IN ARRAY tbl_list LOOP
    trigger_name := 'trg_' || tbl || '_updated_at';
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = trigger_name
        AND tgrelid = tbl::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
        trigger_name, tbl
      );
    END IF;
  END LOOP;
END $$;


-- =============================================================
-- SEÇÃO 2: TRIGGER — fn_audit_tarefa_status
-- Registra em activity_logs toda alteração de status de tarefa.
-- Demonstra: trigger AFTER UPDATE OF coluna específica,
-- JOIN dentro de trigger function e jsonb_build_object.
-- =============================================================

CREATE OR REPLACE FUNCTION fn_audit_tarefa_status()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Sem mudança de status: ignora
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Descobre o dono via bloco → nucleo (subquery dentro de trigger)
  SELECT n.user_id INTO v_user_id
  FROM blocos b
  JOIN nucleos n ON n.id = b.nucleo_id
  WHERE b.id = NEW.bloco_id;

  INSERT INTO activity_logs (user_id, acao, metadata)
  VALUES (
    v_user_id,
    'tarefa_status_alterado',
    jsonb_build_object(
      'tarefa_id',   NEW.id,
      'titulo',      NEW.titulo,
      'status_de',   OLD.status,
      'status_para', NEW.status,
      'alterado_em', NOW()
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tarefas_audit_status ON tarefas;
CREATE TRIGGER trg_tarefas_audit_status
  AFTER UPDATE OF status ON tarefas
  FOR EACH ROW EXECUTE FUNCTION fn_audit_tarefa_status();


-- =============================================================
-- SEÇÃO 3: TRIGGER — fn_recalcula_streak_habito
-- Disparado após INSERT em habitos_registros.
-- Recalcula o streak de dias consecutivos diretamente no BD
-- usando ROW_NUMBER() para detectar sequências contínuas.
-- Demonstra: CTE recursiva, window function, upsert manual.
-- =============================================================

CREATE OR REPLACE FUNCTION fn_recalcula_streak_habito()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id       uuid;
  v_nucleo_id     uuid;
  v_streak_atual  integer := 0;
  v_max_streak    integer := 0;
  v_existe_streak boolean;
BEGIN
  -- Resolve user_id e nucleo_id a partir do habito
  SELECT n.user_id, n.id
  INTO v_user_id, v_nucleo_id
  FROM habitos h
  JOIN blocos  b ON b.id = h.bloco_id
  JOIN nucleos n ON n.id = b.nucleo_id
  WHERE h.id = NEW.habito_id;

  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calcula streak atual: dias consecutivos terminando na data mais recente
  -- Técnica: subtrai o ROW_NUMBER da data → dias do mesmo grupo têm o mesmo resultado
  WITH dias AS (
    SELECT DISTINCT data
    FROM habitos_registros
    WHERE habito_id = NEW.habito_id
    ORDER BY data DESC
  ),
  grupos AS (
    SELECT
      data,
      data - (ROW_NUMBER() OVER (ORDER BY data))::integer AS grp
    FROM dias
  ),
  contagem_grupos AS (
    SELECT grp, COUNT(*) AS total
    FROM grupos
    GROUP BY grp
  ),
  ultima_data AS (
    SELECT grp FROM grupos ORDER BY data DESC LIMIT 1
  )
  SELECT cg.total INTO v_streak_atual
  FROM contagem_grupos cg
  JOIN ultima_data ud ON ud.grp = cg.grp;

  v_streak_atual := COALESCE(v_streak_atual, 1);

  -- Verifica se já existe streak para este usuário/nucleo/tipo
  SELECT EXISTS(
    SELECT 1 FROM streaks
    WHERE user_id = v_user_id
      AND nucleo_id = v_nucleo_id
      AND streak_type = 'habito'
  ) INTO v_existe_streak;

  IF v_existe_streak THEN
    UPDATE streaks
    SET current_streak     = v_streak_atual,
        max_streak         = GREATEST(max_streak, v_streak_atual),
        last_activity_date = NEW.data,
        updated_at         = NOW()
    WHERE user_id    = v_user_id
      AND nucleo_id  = v_nucleo_id
      AND streak_type = 'habito';
  ELSE
    INSERT INTO streaks (user_id, nucleo_id, streak_type, current_streak, max_streak, last_activity_date)
    VALUES (v_user_id, v_nucleo_id, 'habito', v_streak_atual, v_streak_atual, NEW.data);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_habitos_registros_streak ON habitos_registros;
CREATE TRIGGER trg_habitos_registros_streak
  AFTER INSERT ON habitos_registros
  FOR EACH ROW EXECUTE FUNCTION fn_recalcula_streak_habito();


-- =============================================================
-- SEÇÃO 4: STORED PROCEDURE — sp_completar_tarefa
-- Transação atômica com subtransação implícita (BEGIN...EXCEPTION...END):
--   1. Valida tarefa com SELECT ... FOR UPDATE (lock pessimista)
--   2. Atualiza status → 'concluida'
--   3. Bloco BEGIN...EXCEPTION isola XP (falha no XP não reverte a conclusão)
--   4. Concede XP por prioridade + recalcula nível
--   5. Registra no xp_logs
-- Demonstra: procedure com parâmetros, subtransação implícita, FOR UPDATE,
--            WHILE loop, RAISE EXCEPTION, tratamento de erro.
-- =============================================================

CREATE OR REPLACE PROCEDURE sp_completar_tarefa(
  p_tarefa_id uuid,
  p_user_id   uuid
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tarefa      RECORD;
  v_nucleo_id   uuid;
  v_xp_ganho    integer;
  v_xp_atual    integer;
  v_xp_proximo  integer;
  v_nivel_atual integer;
  v_total_xp    integer;
  v_novo_xp     integer;
  v_novo_nivel  integer;
  v_novo_prox   integer;
  v_nivel_count integer;
BEGIN

  -- ── 1. Busca e valida a tarefa (lock pessimista FOR UPDATE) ──
  SELECT t.id, t.titulo, t.status, t.prioridade, b.nucleo_id
  INTO v_tarefa
  FROM tarefas  t
  JOIN blocos   b ON b.id = t.bloco_id
  JOIN nucleos  n ON n.id = b.nucleo_id
  WHERE t.id          = p_tarefa_id
    AND n.user_id     = p_user_id
    AND t.deleted_at IS NULL
  FOR UPDATE OF t;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Tarefa não encontrada ou acesso negado (tarefa_id=%, user_id=%)',
      p_tarefa_id, p_user_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_tarefa.status = 'concluida' THEN
    RAISE EXCEPTION
      'Tarefa já está concluída (id=%)', p_tarefa_id
      USING ERRCODE = 'P0003';
  END IF;

  v_nucleo_id := v_tarefa.nucleo_id;

  -- ── 2. Marca a tarefa como concluída ──
  UPDATE tarefas
  SET status       = 'concluida',
      concluida_em = NOW(),
      updated_at   = NOW()
  WHERE id = p_tarefa_id;

  -- ── 3. XP por prioridade ──
  v_xp_ganho := CASE v_tarefa.prioridade
    WHEN 'alta'  THEN 30
    WHEN 'media' THEN 20
    ELSE 10
  END;

  -- Subtransação implícita: BEGIN...EXCEPTION...END cria um savepoint automático.
  -- Se o bloco de XP falhar, o PostgreSQL reverte apenas este bloco,
  -- preservando o UPDATE da tarefa feito acima.
  BEGIN
    -- ── 4. Lê nível atual (SELECT ... FOR UPDATE para evitar race) ──
    SELECT current_xp, next_level_xp, level, total_xp_earned
    INTO v_xp_atual, v_xp_proximo, v_nivel_atual, v_total_xp
    FROM user_levels
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'user_levels não encontrado para user_id=%', p_user_id;
    END IF;

    v_novo_xp    := v_xp_atual    + v_xp_ganho;
    v_novo_nivel := v_nivel_atual;
    v_novo_prox  := v_xp_proximo;
    v_nivel_count := 0;

    -- ── 5. Sobe de nível enquanto XP >= próximo nível ──
    WHILE v_novo_xp >= v_novo_prox LOOP
      v_novo_xp    := v_novo_xp - v_novo_prox;
      v_novo_nivel := v_novo_nivel + 1;
      v_novo_prox  := FLOOR(v_novo_prox * 1.5)::integer;
      v_nivel_count := v_nivel_count + 1;
    END LOOP;

    -- ── 6. Persiste novo estado de nível ──
    UPDATE user_levels
    SET level           = v_novo_nivel,
        current_xp      = v_novo_xp,
        next_level_xp   = v_novo_prox,
        total_xp_earned = v_total_xp + v_xp_ganho,
        updated_at      = NOW()
    WHERE user_id = p_user_id;

    -- ── 7. Log de XP ──
    INSERT INTO xp_logs (user_id, nucleo_id, xp_amount, source)
    VALUES (p_user_id, v_nucleo_id, v_xp_ganho, 'tarefa_concluida');

    -- ── 8. Log de subida de nível (se aconteceu) ──
    IF v_nivel_count > 0 THEN
      INSERT INTO activity_logs (user_id, acao, metadata)
      VALUES (p_user_id, 'nivel_aumentado', jsonb_build_object(
        'nivel_anterior', v_nivel_atual,
        'nivel_novo',     v_novo_nivel,
        'xp_ganho',       v_xp_ganho,
        'tarefa_id',      p_tarefa_id
      ));
    END IF;

  EXCEPTION WHEN OTHERS THEN
    -- PostgreSQL reverteu automaticamente o bloco acima (subtransação implícita).
    -- A conclusão da tarefa (UPDATE externo) é preservada.
    INSERT INTO activity_logs (user_id, acao, metadata)
    VALUES (p_user_id, 'xp_grant_falhou', jsonb_build_object(
      'tarefa_id', p_tarefa_id,
      'erro',      SQLERRM,
      'errcode',   SQLSTATE
    ));
  END;

END;
$$;


-- =============================================================
-- SEÇÃO 5: STORED PROCEDURE — sp_registrar_habito_diario
-- Idempotente (1 registro por habito/data).
-- Usa subconsulta aninhada para validar propriedade.
-- Ao inserir novo registro, o trigger trg_habitos_registros_streak
-- é disparado automaticamente (integração trigger + procedure).
-- Demonstra: subconsulta EXISTS, UPDATE condicional, LEAST/COALESCE.
-- =============================================================

CREATE OR REPLACE PROCEDURE sp_registrar_habito_diario(
  p_habito_id uuid,
  p_user_id   uuid,
  p_data      date    DEFAULT CURRENT_DATE,
  p_vezes     integer DEFAULT 1
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_owner_ok boolean;
  v_meta     integer;
  v_existe   boolean;
BEGIN

  -- ── 1. Valida propriedade via subconsulta EXISTS aninhada ──
  SELECT EXISTS (
    SELECT 1
    FROM habitos h
    JOIN blocos  b ON b.id = h.bloco_id
    JOIN nucleos n ON n.id = b.nucleo_id
    WHERE h.id    = p_habito_id
      AND n.user_id = p_user_id
  ) INTO v_owner_ok;

  IF NOT v_owner_ok THEN
    RAISE EXCEPTION
      'Hábito não encontrado ou acesso negado (habito_id=%, user_id=%)',
      p_habito_id, p_user_id
      USING ERRCODE = 'P0002';
  END IF;

  -- ── 2. Lê meta de vezes do hábito ──
  SELECT meta_vezes INTO v_meta
  FROM habitos
  WHERE id = p_habito_id;

  -- ── 3. Idempotência: verifica registro existente ──
  SELECT EXISTS (
    SELECT 1 FROM habitos_registros
    WHERE habito_id = p_habito_id AND data = p_data
  ) INTO v_existe;

  IF v_existe THEN
    -- Incrementa sem exceder a meta
    UPDATE habitos_registros
    SET vezes_completadas = LEAST(
          vezes_completadas + p_vezes,
          COALESCE(v_meta, 9999)
        )
    WHERE habito_id = p_habito_id
      AND data      = p_data;
  ELSE
    -- Novo registro — dispara trigger fn_recalcula_streak_habito
    INSERT INTO habitos_registros (habito_id, data, vezes_completadas)
    VALUES (
      p_habito_id,
      p_data,
      LEAST(p_vezes, COALESCE(v_meta, 9999))
    );
  END IF;

END;
$$;


-- =============================================================
-- SEÇÃO 6: STORED PROCEDURE — sp_relatorio_produtividade
-- Consulta analítica com múltiplos JOINs e subqueries para
-- gerar um snapshot de produtividade de um usuário num período.
-- Retorna via RAISE NOTICE (para demonstração) e tabela temporária.
-- Demonstra: procedure com lógica analítica, INTERVAL, DATE_TRUNC,
--            múltiplas subconsultas escalares, tabela temporária.
-- =============================================================

CREATE OR REPLACE PROCEDURE sp_relatorio_produtividade(
  p_user_id    uuid,
  p_dias       integer DEFAULT 30
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_inicio         timestamptz := NOW() - (p_dias || ' days')::interval;
  v_nome           text;
  v_nivel          integer;
  v_total_tarefas  integer;
  v_concluidas     integer;
  v_atrasadas      integer;
  v_xp_periodo     integer;
  v_habitos_dias   integer;
  v_streak_max     integer;
  v_nucleos_ativos integer;
  v_taxa           numeric;
BEGIN

  -- Nome do usuário
  SELECT up.full_name, ul.level
  INTO v_nome, v_nivel
  FROM user_profiles up
  JOIN user_levels   ul ON ul.user_id = up.user_id
  WHERE up.user_id = p_user_id;

  -- Tarefas criadas no período (subconsulta com JOIN em 3 tabelas)
  SELECT COUNT(*) INTO v_total_tarefas
  FROM tarefas t
  JOIN blocos  b ON b.id = t.bloco_id
  JOIN nucleos n ON n.id = b.nucleo_id
  WHERE n.user_id    = p_user_id
    AND t.created_at >= v_inicio
    AND t.deleted_at IS NULL;

  -- Concluídas no período
  SELECT COUNT(*) INTO v_concluidas
  FROM tarefas t
  JOIN blocos  b ON b.id = t.bloco_id
  JOIN nucleos n ON n.id = b.nucleo_id
  WHERE n.user_id      = p_user_id
    AND t.concluida_em >= v_inicio
    AND t.status       = 'concluida';

  -- Atrasadas
  SELECT COUNT(*) INTO v_atrasadas
  FROM tarefas t
  JOIN blocos  b ON b.id = t.bloco_id
  JOIN nucleos n ON n.id = b.nucleo_id
  WHERE n.user_id   = p_user_id
    AND t.status    = 'atrasada'
    AND t.deleted_at IS NULL;

  -- XP ganho no período
  SELECT COALESCE(SUM(xp_amount), 0) INTO v_xp_periodo
  FROM xp_logs
  WHERE user_id    = p_user_id
    AND created_at >= v_inicio;

  -- Dias com pelo menos 1 hábito registrado
  SELECT COUNT(DISTINCT hr.data) INTO v_habitos_dias
  FROM habitos_registros hr
  JOIN habitos h  ON h.id = hr.habito_id
  JOIN blocos  b  ON b.id = h.bloco_id
  JOIN nucleos n  ON n.id = b.nucleo_id
  WHERE n.user_id    = p_user_id
    AND hr.data >= v_inicio::date;

  -- Streak máximo global
  SELECT COALESCE(MAX(current_streak), 0) INTO v_streak_max
  FROM streaks
  WHERE user_id = p_user_id;

  -- Núcleos ativos
  SELECT COUNT(*) INTO v_nucleos_ativos
  FROM nucleos
  WHERE user_id    = p_user_id
    AND deleted_at IS NULL;

  -- Taxa de conclusão
  v_taxa := CASE
    WHEN v_total_tarefas = 0 THEN 0
    ELSE ROUND(v_concluidas::numeric / v_total_tarefas * 100, 1)
  END;

  -- Persiste resultado em tabela temporária para o chamador consumir
  CREATE TEMP TABLE IF NOT EXISTS tmp_relatorio_produtividade (
    campo text,
    valor text
  ) ON COMMIT DROP;

  TRUNCATE tmp_relatorio_produtividade;

  INSERT INTO tmp_relatorio_produtividade VALUES
    ('usuario',          v_nome),
    ('nivel',            v_nivel::text),
    ('periodo_dias',     p_dias::text),
    ('nucleos_ativos',   v_nucleos_ativos::text),
    ('tarefas_periodo',  v_total_tarefas::text),
    ('concluidas',       v_concluidas::text),
    ('atrasadas',        v_atrasadas::text),
    ('taxa_conclusao',   v_taxa::text || '%'),
    ('xp_periodo',       v_xp_periodo::text),
    ('dias_com_habitos', v_habitos_dias::text),
    ('streak_maximo',    v_streak_max::text);

  RAISE NOTICE '=== Relatório de Produtividade — % dias ===', p_dias;
  RAISE NOTICE 'Usuário: % (Nível %)', v_nome, v_nivel;
  RAISE NOTICE 'Núcleos ativos: %', v_nucleos_ativos;
  RAISE NOTICE 'Tarefas no período: % | Concluídas: % | Atrasadas: %',
    v_total_tarefas, v_concluidas, v_atrasadas;
  RAISE NOTICE 'Taxa de conclusão: %', v_taxa;
  RAISE NOTICE 'XP ganho: %  |  Dias com hábitos: %  |  Streak máx: %',
    v_xp_periodo, v_habitos_dias, v_streak_max;

END;
$$;


-- =============================================================
-- SEÇÃO 7: VIEW — v_dashboard_usuario
-- View analítica com múltiplas subconsultas correlacionadas
-- e cálculo de taxa de conclusão.
-- Demonstra: subqueries escalares correlacionadas, CASE/WHEN,
--            ROUND, múltiplos JOINs.
-- =============================================================

CREATE OR REPLACE VIEW v_dashboard_usuario AS
SELECT
  u.id                                                              AS user_id,
  up.full_name,
  up.nickname,
  up.avatar_url,
  ul.level,
  ul.current_xp,
  ul.next_level_xp,
  ul.total_xp_earned,

  (SELECT COUNT(*)
   FROM nucleos n
   WHERE n.user_id    = u.id
     AND n.deleted_at IS NULL)                                      AS total_nucleos,

  (SELECT COUNT(*)
   FROM tarefas t
   JOIN blocos b  ON b.id = t.bloco_id
   JOIN nucleos n ON n.id = b.nucleo_id
   WHERE n.user_id    = u.id
     AND t.deleted_at IS NULL
     AND t.status     = 'pendente')                                 AS tarefas_pendentes,

  (SELECT COUNT(*)
   FROM tarefas t
   JOIN blocos b  ON b.id = t.bloco_id
   JOIN nucleos n ON n.id = b.nucleo_id
   WHERE n.user_id    = u.id
     AND t.deleted_at IS NULL
     AND t.status     = 'concluida')                                AS tarefas_concluidas,

  (SELECT COUNT(*)
   FROM tarefas t
   JOIN blocos b  ON b.id = t.bloco_id
   JOIN nucleos n ON n.id = b.nucleo_id
   WHERE n.user_id    = u.id
     AND t.deleted_at IS NULL
     AND t.status     = 'atrasada')                                 AS tarefas_atrasadas,

  -- Taxa de conclusão (%)
  CASE WHEN (
    SELECT COUNT(*) FROM tarefas t
    JOIN blocos b  ON b.id = t.bloco_id
    JOIN nucleos n ON n.id = b.nucleo_id
    WHERE n.user_id = u.id AND t.deleted_at IS NULL
  ) = 0 THEN 0::numeric
  ELSE ROUND(
    (SELECT COUNT(*)::numeric FROM tarefas t
     JOIN blocos b  ON b.id = t.bloco_id
     JOIN nucleos n ON n.id = b.nucleo_id
     WHERE n.user_id = u.id AND t.deleted_at IS NULL
       AND t.status  = 'concluida')
    /
    (SELECT COUNT(*)::numeric FROM tarefas t
     JOIN blocos b  ON b.id = t.bloco_id
     JOIN nucleos n ON n.id = b.nucleo_id
     WHERE n.user_id = u.id AND t.deleted_at IS NULL)
    * 100, 1)
  END                                                               AS taxa_conclusao_pct,

  (SELECT COALESCE(MAX(s.current_streak), 0)
   FROM streaks s
   WHERE s.user_id = u.id)                                         AS maior_streak_ativo,

  (SELECT COALESCE(SUM(xl.xp_amount), 0)
   FROM xp_logs xl
   WHERE xl.user_id    = u.id
     AND xl.created_at >= NOW() - INTERVAL '7 days')               AS xp_ultimos_7_dias,

  (SELECT COUNT(DISTINCT hr.habito_id)
   FROM habitos_registros hr
   JOIN habitos h ON h.id  = hr.habito_id
   JOIN blocos  b ON b.id  = h.bloco_id
   JOIN nucleos n ON n.id  = b.nucleo_id
   WHERE n.user_id = u.id
     AND hr.data   = CURRENT_DATE)                                  AS habitos_concluidos_hoje,

  (SELECT COUNT(*)
   FROM user_conquistas uc
   WHERE uc.user_id = u.id)                                        AS total_conquistas,

  us.last_login,
  u.created_at                                                      AS membro_desde

FROM users         u
JOIN user_profiles up ON up.user_id = u.id
JOIN user_levels   ul ON ul.user_id = u.id
JOIN user_security us ON us.user_id = u.id
WHERE u.deleted_at IS NULL
  AND u.active = true;


-- =============================================================
-- SEÇÃO 8: VIEW — v_ranking_semanal
-- Ranking semanal com CTE (WITH), GROUP BY, FILTER e
-- window function RANK() OVER.
-- Demonstra: CTE múltiplas, COUNT FILTER, RANK(), COALESCE,
--            DATE_TRUNC, LEFT JOIN.
-- =============================================================

CREATE OR REPLACE VIEW v_ranking_semanal AS
WITH xp_semana AS (
  SELECT
    user_id,
    SUM(xp_amount)  AS total_xp
  FROM xp_logs
  WHERE created_at >= DATE_TRUNC('week', NOW())
    AND created_at <  DATE_TRUNC('week', NOW()) + INTERVAL '7 days'
  GROUP BY user_id
),
tarefas_semana AS (
  SELECT
    n.user_id,
    COUNT(*) FILTER (WHERE t.status = 'concluida') AS concluidas
  FROM tarefas  t
  JOIN blocos   b ON b.id = t.bloco_id
  JOIN nucleos  n ON n.id = b.nucleo_id
  WHERE t.concluida_em >= DATE_TRUNC('week', NOW())
  GROUP BY n.user_id
),
habitos_semana AS (
  SELECT
    n.user_id,
    COUNT(DISTINCT hr.data) AS dias_com_habito
  FROM habitos_registros hr
  JOIN habitos  h ON h.id = hr.habito_id
  JOIN blocos   b ON b.id = h.bloco_id
  JOIN nucleos  n ON n.id = b.nucleo_id
  WHERE hr.data >= DATE_TRUNC('week', NOW())::date
  GROUP BY n.user_id
)
SELECT
  u.id                                                              AS user_id,
  up.full_name,
  up.avatar_url,
  ul.level,
  COALESCE(xs.total_xp,          0)                                AS xp_semana,
  COALESCE(ts.concluidas,        0)                                AS tarefas_concluidas,
  COALESCE(hs.dias_com_habito,   0)                                AS dias_com_habito,
  RANK() OVER (ORDER BY COALESCE(xs.total_xp, 0) DESC)            AS posicao,
  DATE_TRUNC('week', NOW())::date                                  AS semana_inicio,
  (DATE_TRUNC('week', NOW()) + INTERVAL '6 days')::date            AS semana_fim
FROM users         u
JOIN user_profiles up ON up.user_id = u.id
JOIN user_levels   ul ON ul.user_id = u.id
LEFT JOIN xp_semana     xs ON xs.user_id = u.id
LEFT JOIN tarefas_semana ts ON ts.user_id = u.id
LEFT JOIN habitos_semana hs ON hs.user_id = u.id
WHERE u.deleted_at IS NULL
  AND u.active = true
ORDER BY posicao;


-- =============================================================
-- EXEMPLOS DE USO (comentados — para documentação da entrega)
-- =============================================================

-- Chamar procedure para completar tarefa atomicamente:
--   CALL sp_completar_tarefa('<tarefa_id>', '<user_id>');

-- Registrar hábito diário (idempotente):
--   CALL sp_registrar_habito_diario('<habito_id>', '<user_id>');

-- Gerar relatório de produtividade (últimos 30 dias):
--   CALL sp_relatorio_produtividade('<user_id>', 30);
--   SELECT * FROM tmp_relatorio_produtividade;

-- Consultar dashboard do usuário:
--   SELECT * FROM v_dashboard_usuario WHERE user_id = '<user_id>';

-- Consultar ranking semanal:
--   SELECT * FROM v_ranking_semanal LIMIT 10;

