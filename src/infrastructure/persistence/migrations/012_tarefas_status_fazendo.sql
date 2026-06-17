-- Migration 012: Add 'fazendo' to the tarefas status CHECK constraint
-- The original constraint only included 'pendente', 'concluida', 'atrasada'.
-- Kanban 'Fazendo' column requires this status to be persisted.

DO $$
DECLARE
  v_constraint_name text;
BEGIN
  SELECT c.conname INTO v_constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_attribute a ON a.attrelid = t.oid
  WHERE t.relname = 'tarefas'
    AND c.contype = 'c'
    AND a.attnum = ANY(c.conkey)
    AND a.attname = 'status';

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE tarefas DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $$;

ALTER TABLE tarefas
  ADD CONSTRAINT tarefas_status_check
  CHECK (status = ANY (ARRAY['pendente', 'concluida', 'atrasada', 'fazendo']));
