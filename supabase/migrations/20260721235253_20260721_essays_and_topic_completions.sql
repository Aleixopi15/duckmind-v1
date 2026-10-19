/*
# Add essays table, topic_completions table, and storage bucket

## Summary
This migration adds two new tables to support:
1. Redação (Essay) tracking - users can save their ENEM essays with an optional uploaded file (image or PDF),
   a grade (0-1000), and comments/feedback.
2. Topic completions - users can manually "check" a topic as completed, independent of study sessions.
   This drives the progress bars in the Edital and Stats tabs.

## New Tables

### essays
- `id` (uuid, primary key)
- `user_id` (uuid, FK to auth.users, defaults to auth.uid())
- `title` (text, not null) — essay title/identifier (e.g. "Simulado 3 - Maio")
- `prompt` (text) — the essay theme/prompt
- `grade` (numeric 0-1000) — grade received
- `comments` (text) — teacher/self feedback
- `file_path` (text) — path in Supabase Storage bucket "essays"
- `file_type` (text) — 'image' | 'pdf'
- `written_at` (date) — date the essay was written
- `created_at` (timestamptz)

### topic_completions
- `id` (uuid, primary key)
- `user_id` (uuid, FK to auth.users, defaults to auth.uid())
- `topic_id` (uuid, FK to topics)
- `completed_at` (timestamptz)
Unique constraint on (user_id, topic_id) so each topic can only be marked done once per user.

## Security
- RLS enabled on both tables.
- Owner-scoped CRUD policies (authenticated users see/modify only their own rows).
*/

-- Essays table
CREATE TABLE IF NOT EXISTS essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  prompt text NOT NULL DEFAULT '',
  grade numeric(6,2),
  comments text NOT NULL DEFAULT '',
  file_path text,
  file_type text,
  written_at date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_essays" ON essays;
CREATE POLICY "select_own_essays" ON essays FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_essays" ON essays;
CREATE POLICY "insert_own_essays" ON essays FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_essays" ON essays;
CREATE POLICY "update_own_essays" ON essays FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_essays" ON essays;
CREATE POLICY "delete_own_essays" ON essays FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Topic completions table
CREATE TABLE IF NOT EXISTS topic_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE topic_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_topic_completions" ON topic_completions;
CREATE POLICY "select_own_topic_completions" ON topic_completions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_topic_completions" ON topic_completions;
CREATE POLICY "insert_own_topic_completions" ON topic_completions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_topic_completions" ON topic_completions;
CREATE POLICY "delete_own_topic_completions" ON topic_completions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for essays
INSERT INTO storage.buckets (id, name, public)
VALUES ('essays', 'essays', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "essays_upload" ON storage.objects;
CREATE POLICY "essays_upload" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'essays' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "essays_read" ON storage.objects;
CREATE POLICY "essays_read" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'essays' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "essays_delete" ON storage.objects;
CREATE POLICY "essays_delete" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'essays' AND (storage.foldername(name))[1] = auth.uid()::text);
