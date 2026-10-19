/*
# Create the Intelligent Error Notebook

1. New table: `error_notebook_entries`
- `id`: unique identifier for an error entry.
- `user_id`: authenticated owner, filled automatically from the current session.
- `subject_id`: required link to an existing Edital subject.
- `topic_id`: required link to an existing Edital topic.
- `image_data`: the cropped question image as a data URL.
- `student_answer` and `correct_answer`: selected alternatives A-E.
- `materia_sugerida` and `topico_sugerido`: the AI's suggested Edital classification.
- `enunciado_latex`: transcribed question statement.
- `diagnostico_erro`: didactic explanation of the mistake and distractor.
- `resolucao_passos`: step-by-step resolution.
- `dica_flashcard`: memorization concept.
- `status`: `pendente` or `revisado`.
- `reviewed_at` and `created_at`: review and creation timestamps.
2. Security
- Enables RLS and gives authenticated users separate SELECT, INSERT, UPDATE, and DELETE policies restricted to their own rows.
- Foreign keys ensure every entry remains connected to an existing subject and topic.
3. Important notes
- Existing data is not modified.
- The image is stored with the user's private entry so the error card can display its thumbnail and detail view after reload.
*/

CREATE TABLE IF NOT EXISTS error_notebook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  image_data text NOT NULL,
  student_answer text NOT NULL CHECK (student_answer IN ('A', 'B', 'C', 'D', 'E')),
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
  materia_sugerida text NOT NULL DEFAULT '',
  topico_sugerido text NOT NULL DEFAULT '',
  enunciado_latex text NOT NULL DEFAULT '',
  diagnostico_erro text NOT NULL DEFAULT '',
  resolucao_passos text NOT NULL DEFAULT '',
  dica_flashcard text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'revisado')),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS error_notebook_user_idx ON error_notebook_entries(user_id);
CREATE INDEX IF NOT EXISTS error_notebook_subject_idx ON error_notebook_entries(subject_id);
CREATE INDEX IF NOT EXISTS error_notebook_topic_idx ON error_notebook_entries(topic_id);
CREATE INDEX IF NOT EXISTS error_notebook_status_idx ON error_notebook_entries(status);

ALTER TABLE error_notebook_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_error_notebook" ON error_notebook_entries;
CREATE POLICY "select_own_error_notebook" ON error_notebook_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_error_notebook" ON error_notebook_entries;
CREATE POLICY "insert_own_error_notebook" ON error_notebook_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_error_notebook" ON error_notebook_entries;
CREATE POLICY "update_own_error_notebook" ON error_notebook_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_error_notebook" ON error_notebook_entries;
CREATE POLICY "delete_own_error_notebook" ON error_notebook_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
