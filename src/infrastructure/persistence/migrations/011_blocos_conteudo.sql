-- Migration 011: Add conteudo column to blocos for per-block text persistence
-- Enables document text blocks to be stored as individual DB rows (notebook mode)
-- instead of serialized as a single JSON blob in configuracoes.content

ALTER TABLE blocos ADD COLUMN IF NOT EXISTS conteudo text;

-- Drop and recreate the FTS index from 010 — now that conteudo actually exists
DROP INDEX IF EXISTS idx_blocos_conteudo_fts;

CREATE INDEX IF NOT EXISTS idx_blocos_conteudo_fts
  ON blocos USING gin(to_tsvector('portuguese', COALESCE(conteudo, '') || ' ' || COALESCE(titulo, '')))
  WHERE deleted_at IS NULL;