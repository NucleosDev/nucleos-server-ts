-- Migration 010: Performance indexes + full-text search foundation
-- Fixes N+1 query patterns and enables future search capabilities

-- ── Índices críticos em foreign keys (evitam full-table scans) ───────────────

CREATE INDEX IF NOT EXISTS idx_blocos_nucleo_id
  ON blocos(nucleo_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_blocos_parent_id
  ON blocos(parent_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_blocos_nucleo_posicao
  ON blocos(nucleo_id, posicao) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tarefas_bloco_id
  ON tarefas(bloco_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tarefas_bloco_status
  ON tarefas(bloco_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_habitos_bloco_id
  ON habitos(bloco_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_listas_bloco_id
  ON listas(bloco_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_nucleos_user_id
  ON nucleos(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email) WHERE deleted_at IS NULL;

-- ── Canvas: índice para busca rápida do bloco canvas por nucleo ───────────────

CREATE INDEX IF NOT EXISTS idx_blocos_canvas_nucleo
  ON blocos(nucleo_id) WHERE tipo = 'canvas' AND is_canvas = true AND deleted_at IS NULL;

-- ── Full-text search foundation ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_blocos_conteudo_fts
  ON blocos USING gin(to_tsvector('portuguese', COALESCE(conteudo, '') || ' ' || COALESCE(titulo, '')))
  WHERE deleted_at IS NULL;

-- ── Gamification: índices para queries de leaderboard ────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_levels_user_id
  ON user_levels(user_id);

CREATE INDEX IF NOT EXISTS idx_user_levels_xp
  ON user_levels(total_xp DESC);

CREATE INDEX IF NOT EXISTS idx_xp_history_user_id
  ON xp_history(user_id, created_at DESC);

-- ── Notificações: índice para busca por usuário não-lidas ────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
