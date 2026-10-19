-- Add observacoes column for personal notes on each error entry
ALTER TABLE error_notebook_entries ADD COLUMN IF NOT EXISTS observacoes text NOT NULL DEFAULT '';

-- Add 'processando' to allowed status values
ALTER TABLE error_notebook_entries DROP CONSTRAINT IF EXISTS error_notebook_entries_status_check;
ALTER TABLE error_notebook_entries ADD CONSTRAINT error_notebook_entries_status_check
  CHECK (status IN ('processando', 'pendente', 'revisado'));
