/*
# Add study_type column to study_sessions

1. Changes
- Adds `study_type` column to `study_sessions` table.
- Type: text, NOT NULL, default 'teoria'.
- Allowed values: 'teoria', 'questoes', 'revisao'.
- Backfills existing rows to 'teoria' (though default handles this).
2. Security
- No RLS policy changes — existing policies on study_sessions remain unchanged.
3. Notes
- This is additive only; no data is lost.
- Existing sessions default to 'teoria' since they were recorded before this field existed.
*/

ALTER TABLE study_sessions
  ADD COLUMN IF NOT EXISTS study_type text NOT NULL DEFAULT 'teoria';

-- Optional: add a check constraint for valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'study_sessions_study_type_check'
  ) THEN
    ALTER TABLE study_sessions
      ADD CONSTRAINT study_sessions_study_type_check
      CHECK (study_type IN ('teoria', 'questoes', 'revisao'));
  END IF;
END $$;
