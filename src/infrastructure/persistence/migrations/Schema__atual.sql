-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.__EFMigrationsHistory (
  MigrationId character varying NOT NULL,
  ProductVersion character varying NOT NULL,
  CONSTRAINT __EFMigrationsHistory_pkey PRIMARY KEY (MigrationId)
);
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  acao character varying,
  metadata jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.ai_context (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  last_summary text,
  preferred_style character varying,
  last_interaction timestamp without time zone,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_context_pkey PRIMARY KEY (id),
  CONSTRAINT ai_context_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.ai_insights (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  nucleo_id uuid,
  insight_type character varying,
  mensagem text,
  priority integer DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  applied boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_insights_pkey PRIMARY KEY (id),
  CONSTRAINT ai_insights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT ai_insights_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id)
);
CREATE TABLE public.ai_interactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  mensagem text,
  resposta text,
  contexto jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT ai_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.bloco_calculos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bloco_id uuid UNIQUE,
  tipo_operacao character varying NOT NULL,
  campo character varying DEFAULT 'valor_total'::character varying,
  agrupar_por character varying,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT bloco_calculos_pkey PRIMARY KEY (id),
  CONSTRAINT bloco_calculos_bloco_id_fkey FOREIGN KEY (bloco_id) REFERENCES public.blocos(id)
);
CREATE TABLE public.blocos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nucleo_id uuid NOT NULL,
  tipo character varying NOT NULL,
  titulo character varying,
  posicao integer,
  configuracoes jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  deleted_at timestamp without time zone,
  parent_id uuid,
  path text,
  depth integer DEFAULT 0,
  is_canvas boolean DEFAULT false,
  CONSTRAINT blocos_pkey PRIMARY KEY (id),
  CONSTRAINT blocos_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id),
  CONSTRAINT blocos_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.blocos(id)
);
CREATE TABLE public.calendario_eventos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nucleo_id uuid NOT NULL,
  titulo character varying,
  descricao text,
  data_evento timestamp without time zone,
  duracao_minutos integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT calendario_eventos_pkey PRIMARY KEY (id),
  CONSTRAINT calendario_eventos_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id)
);
CREATE TABLE public.campos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  colecao_id uuid NOT NULL,
  nome character varying,
  tipo_campo character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT campos_pkey PRIMARY KEY (id),
  CONSTRAINT campos_colecao_id_fkey FOREIGN KEY (colecao_id) REFERENCES public.colecoes(id)
);
CREATE TABLE public.categorias (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lista_id uuid NOT NULL,
  nome character varying NOT NULL,
  cor character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT categorias_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_lista_id_fkey FOREIGN KEY (lista_id) REFERENCES public.listas(id)
);
CREATE TABLE public.colecoes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bloco_id uuid NOT NULL,
  nome character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT colecoes_pkey PRIMARY KEY (id),
  CONSTRAINT colecoes_bloco_id_fkey FOREIGN KEY (bloco_id) REFERENCES public.blocos(id)
);
CREATE TABLE public.conquistas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome character varying NOT NULL,
  descricao text,
  icone_url text,
  tipo character varying,
  condicao jsonb,
  xp_recompensa integer DEFAULT 100,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT conquistas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.desafios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  titulo character varying NOT NULL,
  descricao text,
  tipo character varying NOT NULL,
  objetivo jsonb NOT NULL,
  recompensa_xp integer DEFAULT 50,
  recompensa_titulo character varying,
  ativo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT desafios_pkey PRIMARY KEY (id)
);
CREATE TABLE public.energy_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  nucleo_id uuid,
  energy_amount integer,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT energy_logs_pkey PRIMARY KEY (id),
  CONSTRAINT energy_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT energy_logs_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id)
);
CREATE TABLE public.habitos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bloco_id uuid NOT NULL,
  nome character varying NOT NULL,
  frequencia character varying NOT NULL CHECK (frequencia::text = ANY (ARRAY['diaria'::character varying, 'semanal'::character varying, 'personalizada'::character varying]::text[])),
  dias_semana ARRAY,
  meta_vezes integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT habitos_pkey PRIMARY KEY (id),
  CONSTRAINT habitos_bloco_id_fkey FOREIGN KEY (bloco_id) REFERENCES public.blocos(id)
);
CREATE TABLE public.habitos_registros (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  habito_id uuid NOT NULL,
  data date NOT NULL,
  vezes_completadas integer DEFAULT 1,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT habitos_registros_pkey PRIMARY KEY (id),
  CONSTRAINT habitos_registros_habito_id_fkey FOREIGN KEY (habito_id) REFERENCES public.habitos(id)
);
CREATE TABLE public.item_valores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL,
  campo_id uuid NOT NULL,
  valor_texto text,
  valor_numerico numeric,
  valor_data timestamp without time zone,
  valor_booleano boolean,
  CONSTRAINT item_valores_pkey PRIMARY KEY (id),
  CONSTRAINT item_valores_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.itens(id),
  CONSTRAINT item_valores_campo_id_fkey FOREIGN KEY (campo_id) REFERENCES public.campos(id)
);
CREATE TABLE public.itens (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  colecao_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT itens_pkey PRIMARY KEY (id),
  CONSTRAINT itens_colecao_id_fkey FOREIGN KEY (colecao_id) REFERENCES public.colecoes(id)
);
CREATE TABLE public.itens_lista (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lista_id uuid NOT NULL,
  categoria_id uuid,
  nome character varying NOT NULL,
  quantidade numeric DEFAULT 1,
  valor_unitario numeric,
  checked boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  deleted_at timestamp without time zone,
  valor_total numeric DEFAULT (quantidade * valor_unitario),
  CONSTRAINT itens_lista_pkey PRIMARY KEY (id),
  CONSTRAINT itens_lista_lista_id_fkey FOREIGN KEY (lista_id) REFERENCES public.listas(id),
  CONSTRAINT itens_lista_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);
CREATE TABLE public.listas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bloco_id uuid NOT NULL,
  nome character varying NOT NULL,
  tipo_lista character varying DEFAULT 'generica'::character varying CHECK (tipo_lista::text = ANY (ARRAY['generica'::character varying, 'compras'::character varying, 'financeiro'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  deleted_at timestamp without time zone,
  CONSTRAINT listas_pkey PRIMARY KEY (id),
  CONSTRAINT listas_bloco_id_fkey FOREIGN KEY (bloco_id) REFERENCES public.blocos(id)
);
CREATE TABLE public.metas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nucleo_id uuid NOT NULL,
  titulo character varying NOT NULL,
  descricao text,
  tipo character varying,
  valor_meta numeric CHECK (valor_meta > 0::numeric),
  valor_atual numeric DEFAULT 0,
  data_inicio date,
  data_fim date,
  concluida boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT metas_pkey PRIMARY KEY (id),
  CONSTRAINT metas_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  titulo character varying,
  mensagem text,
  read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.nucleo_achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nucleo_id uuid,
  achievement_type character varying,
  current_value integer DEFAULT 0,
  target_value integer,
  unlocked_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT nucleo_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT nucleo_achievements_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id)
);
CREATE TABLE public.nucleo_compartilhamentos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nucleo_id uuid NOT NULL,
  owner_user_id uuid NOT NULL,
  shared_with_user_id uuid NOT NULL,
  permission_level character varying DEFAULT 'view'::character varying CHECK (permission_level::text = ANY (ARRAY['view'::character varying, 'edit'::character varying, 'admin'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT nucleo_compartilhamentos_pkey PRIMARY KEY (id),
  CONSTRAINT nucleo_compartilhamentos_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id),
  CONSTRAINT nucleo_compartilhamentos_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id),
  CONSTRAINT nucleo_compartilhamentos_shared_with_user_id_fkey FOREIGN KEY (shared_with_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.nucleo_icons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying UNIQUE,
  icon_url text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT nucleo_icons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.nucleo_relations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  source_nucleo_id uuid NOT NULL,
  target_nucleo_id uuid NOT NULL,
  relation_type character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT nucleo_relations_pkey PRIMARY KEY (id),
  CONSTRAINT nucleo_relations_source_nucleo_id_fkey FOREIGN KEY (source_nucleo_id) REFERENCES public.nucleos(id),
  CONSTRAINT nucleo_relations_target_nucleo_id_fkey FOREIGN KEY (target_nucleo_id) REFERENCES public.nucleos(id)
);
CREATE TABLE public.nucleos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  icon_id uuid,
  nome character varying NOT NULL,
  descricao text,
  tipo character varying DEFAULT 'pessoal'::character varying,
  cor_destaque character varying,
  imagem_capa text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  deleted_at timestamp without time zone,
  CONSTRAINT nucleos_pkey PRIMARY KEY (id),
  CONSTRAINT nucleos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT nucleos_icon_id_fkey FOREIGN KEY (icon_id) REFERENCES public.nucleo_icons(id)
);
CREATE TABLE public.password_resets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  token text NOT NULL,
  expires_at timestamp without time zone NOT NULL,
  used boolean DEFAULT false,
  CONSTRAINT password_resets_pkey PRIMARY KEY (id),
  CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  max_nucleos integer,
  price numeric DEFAULT 0 CHECK (price >= 0::numeric),
  created_at timestamp without time zone DEFAULT now(),
  max_blocos_por_nucleo integer DEFAULT 10,
  max_membros_por_nucleo integer DEFAULT 5,
  features jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rankings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  period_type character varying NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  score_type character varying NOT NULL,
  position integer NOT NULL,
  score_value integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT rankings_pkey PRIMARY KEY (id),
  CONSTRAINT rankings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.streak_rewards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  streak_days integer NOT NULL UNIQUE,
  xp_reward integer NOT NULL,
  title character varying,
  badge_id character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT streak_rewards_pkey PRIMARY KEY (id)
);
CREATE TABLE public.streaks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  nucleo_id uuid,
  streak_type character varying NOT NULL,
  current_streak integer DEFAULT 0 CHECK (current_streak >= 0),
  max_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT streaks_pkey PRIMARY KEY (id),
  CONSTRAINT streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT streaks_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  started_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone,
  is_active boolean DEFAULT true,
  cancel_at_period_end boolean DEFAULT false,
  stripe_subscription_id text,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.tarefas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bloco_id uuid NOT NULL,
  titulo character varying NOT NULL,
  descricao text,
  prioridade character varying DEFAULT 'media'::character varying CHECK (prioridade::text = ANY (ARRAY['baixa'::character varying, 'media'::character varying, 'alta'::character varying]::text[])),
  status character varying DEFAULT 'pendente'::character varying CHECK (status::text = ANY (ARRAY['pendente'::character varying, 'concluida'::character varying, 'atrasada'::character varying]::text[])),
  data_vencimento date,
  concluida_em timestamp without time zone,
  posicao integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  deleted_at timestamp without time zone,
  CONSTRAINT tarefas_pkey PRIMARY KEY (id),
  CONSTRAINT tarefas_bloco_id_fkey FOREIGN KEY (bloco_id) REFERENCES public.blocos(id)
);
CREATE TABLE public.timers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nucleo_id uuid NOT NULL,
  titulo character varying,
  inicio timestamp without time zone,
  fim timestamp without time zone,
  duracao_segundos integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  modo character varying DEFAULT 'crescente'::character varying,
  CONSTRAINT timers_pkey PRIMARY KEY (id),
  CONSTRAINT timers_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id)
);
CREATE TABLE public.user_conquistas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  conquista_id uuid NOT NULL,
  desbloqueado_em timestamp without time zone DEFAULT now(),
  CONSTRAINT user_conquistas_pkey PRIMARY KEY (id),
  CONSTRAINT user_conquistas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_conquistas_conquista_id_fkey FOREIGN KEY (conquista_id) REFERENCES public.conquistas(id)
);
CREATE TABLE public.user_desafios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  desafio_id uuid NOT NULL,
  progresso_atual integer DEFAULT 0,
  completado boolean DEFAULT false,
  completado_em timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_desafios_pkey PRIMARY KEY (id),
  CONSTRAINT user_desafios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_desafios_desafio_id_fkey FOREIGN KEY (desafio_id) REFERENCES public.desafios(id)
);
CREATE TABLE public.user_levels (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  level integer DEFAULT 1,
  current_xp integer DEFAULT 0,
  next_level_xp integer DEFAULT 100,
  total_xp_earned integer DEFAULT 0,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_levels_pkey PRIMARY KEY (id),
  CONSTRAINT user_levels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_preferences (
  user_id uuid NOT NULL,
  theme character varying DEFAULT 'system'::character varying,
  language character varying DEFAULT 'pt-BR'::character varying,
  notifications jsonb DEFAULT '{"push": true, "email": true, "streaks": true}'::jsonb,
  shortcuts jsonb DEFAULT '{}'::jsonb,
  dashboard_layout jsonb,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  full_name character varying NOT NULL,
  nickname character varying,
  avatar_url text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  role character varying DEFAULT 'user'::character varying,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_security (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  last_login timestamp without time zone,
  failed_attempts integer DEFAULT 0,
  password_updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_security_pkey PRIMARY KEY (id),
  CONSTRAINT user_security_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_titles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title_id character varying NOT NULL,
  title_name character varying NOT NULL,
  unlocked_at timestamp without time zone DEFAULT now(),
  active boolean DEFAULT false,
  CONSTRAINT user_titles_pkey PRIMARY KEY (id),
  CONSTRAINT user_titles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE CHECK (email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  phone character varying NOT NULL,
  cpf character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email_verified boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.xp_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  nucleo_id uuid,
  xp_amount integer,
  source character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT xp_logs_pkey PRIMARY KEY (id),
  CONSTRAINT xp_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT xp_logs_nucleo_id_fkey FOREIGN KEY (nucleo_id) REFERENCES public.nucleos(id)
);