/*
# Remove AI fields dependency and add manual subtopic support for error notebook

1. Changes to error_notebook_entries table:
- Add `custom_subtopic` text column (NOT NULL DEFAULT '') for manually-entered subtopic names
  that don't exist in the edital topics system. This lets users type a free-form subtopic when
  adding an error, without creating a new topic in the edital.
- Make `topic_id` nullable so an error entry can exist without a linked edital topic.
  The FK constraint is dropped and recreated with ON DELETE SET NULL instead of CASCADE,
  so deleting a topic in the edital no longer silently deletes the user's error entries.

2. Important notes:
- This does NOT remove the AI-related columns (materia_sugerida, topico_sugerido, enunciado_latex,
  diagnostico_erro, resolucao_passos, dica_flashcard). Dropping columns is a destructive operation
  that can lose user data. Instead, the frontend simply stops populating them. They remain as
  empty strings for backward compatibility with any existing rows.
- The status CHECK constraint keeps 'processando' as a valid value so existing rows with that
  status don't violate the constraint, but the frontend will no longer create entries with
  'processando' status — new entries will be 'pendente' immediately.
*/

ALTER TABLE error_notebook_entries ADD COLUMN IF NOT EXISTS custom_subtopic text NOT NULL DEFAULT '';

-- Make topic_id nullable and change FK to ON DELETE SET NULL
ALTER TABLE error_notebook_entries DROP CONSTRAINT IF EXISTS error_notebook_entries_topic_id_fkey;
ALTER TABLE error_notebook_entries ALTER COLUMN topic_id DROP NOT NULL;
ALTER TABLE error_notebook_entries
  ADD CONSTRAINT error_notebook_entries_topic_id_fkey
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;
