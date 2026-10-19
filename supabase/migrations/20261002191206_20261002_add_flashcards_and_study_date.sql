/*
# Add flashcard study details and selectable study date

1. Changes
- Extends `study_sessions.study_type` with the new value `flashcards`.
- Adds `flashcards_count` to `study_sessions` for the number of flashcards reviewed.
- Keeps `studied_at` as the date/time field used by the app, allowing users to choose the study date while preserving existing timestamps.
2. Existing data
- Existing sessions remain unchanged and continue to use their current type.
- Existing sessions receive `flashcards_count = 0`.
3. Security
- No new table or policy is created.
- Existing owner-scoped RLS policies on `study_sessions` continue to protect all records.
4. Notes
- This migration is additive and does not remove or rename user data.
*/

ALTER TABLE study_sessions
  ADD COLUMN IF NOT EXISTS flashcards_count integer NOT NULL DEFAULT 0;

ALTER TABLE study_sessions
  DROP CONSTRAINT IF EXISTS study_sessions_study_type_check;

ALTER TABLE study_sessions
  ADD CONSTRAINT study_sessions_study_type_check
  CHECK (study_type IN ('teoria', 'questoes', 'revisao', 'flashcards'));
