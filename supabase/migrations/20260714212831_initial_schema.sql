/*
# Initial Schema - Pato Estuda (ENEM Study System)

## Summary
Creates the full multi-user schema for a gamified ENEM study platform.

## New Tables

### user_profiles
Stores public profile and gamification data per user.
- id (uuid, FK to auth.users)
- display_name (text)
- current_streak (int) - consecutive study days
- longest_streak (int)
- last_study_date (date) - used to calculate streak continuity
- total_study_minutes (int)
- created_at

### subjects
Pre-seeded ENEM subject areas (shared, read-only for all users).
- id, name, color, icon

### topics
User-created syllabus topics linked to subjects.
- id, user_id, subject_id, name, order_index

### study_sessions
Each study session logged by a user.
- id, user_id, subject_id, topic_id
- duration_minutes (int)
- questions_correct (int)
- questions_wrong (int)
- notes (text)
- studied_at (timestamptz)

### simulations
Full ENEM simulation results.
- id, user_id, title, simulation_date
- score_languages, score_humanities, score_natural_sciences, score_math, score_essay
- total_score, notes

## Security
- RLS enabled on all tables
- user_profiles, topics, study_sessions, simulations: owner-scoped (authenticated only)
- subjects: public read (anon + authenticated)
*/

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_study_date date,
  total_study_minutes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON user_profiles;
CREATE POLICY "delete_own_profile" ON user_profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Subjects (shared, seeded)
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#1976d2',
  icon text NOT NULL DEFAULT 'School',
  area text NOT NULL DEFAULT 'Geral',
  display_order int NOT NULL DEFAULT 0
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_subjects" ON subjects;
CREATE POLICY "public_read_subjects" ON subjects FOR SELECT
  TO anon, authenticated USING (true);

-- Topics (user-defined syllabus items)
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_topics" ON topics;
CREATE POLICY "select_own_topics" ON topics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_topics" ON topics;
CREATE POLICY "insert_own_topics" ON topics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_topics" ON topics;
CREATE POLICY "update_own_topics" ON topics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_topics" ON topics;
CREATE POLICY "delete_own_topics" ON topics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  duration_minutes int NOT NULL DEFAULT 0,
  questions_correct int NOT NULL DEFAULT 0,
  questions_wrong int NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  studied_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_studied_at_idx ON study_sessions(studied_at);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON study_sessions;
CREATE POLICY "select_own_sessions" ON study_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON study_sessions;
CREATE POLICY "insert_own_sessions" ON study_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sessions" ON study_sessions;
CREATE POLICY "update_own_sessions" ON study_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON study_sessions;
CREATE POLICY "delete_own_sessions" ON study_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Simulations
CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  simulation_date date NOT NULL DEFAULT CURRENT_DATE,
  score_languages numeric(5,1),
  score_humanities numeric(5,1),
  score_natural_sciences numeric(5,1),
  score_math numeric(5,1),
  score_essay numeric(5,1),
  total_score numeric(5,1),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS simulations_user_id_idx ON simulations(user_id);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_simulations" ON simulations;
CREATE POLICY "select_own_simulations" ON simulations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_simulations" ON simulations;
CREATE POLICY "insert_own_simulations" ON simulations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_simulations" ON simulations;
CREATE POLICY "update_own_simulations" ON simulations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_simulations" ON simulations;
CREATE POLICY "delete_own_simulations" ON simulations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Seed ENEM subjects
INSERT INTO subjects (name, color, icon, area, display_order) VALUES
  ('Matemática', '#1565C0', 'Calculate', 'Ciências da Natureza e Matemática', 1),
  ('Física', '#0277BD', 'Science', 'Ciências da Natureza e Matemática', 2),
  ('Química', '#00838F', 'Biotech', 'Ciências da Natureza e Matemática', 3),
  ('Biologia', '#2E7D32', 'EcoOutlined', 'Ciências da Natureza e Matemática', 4),
  ('Língua Portuguesa', '#6A1B9A', 'MenuBook', 'Linguagens, Códigos e suas Tecnologias', 5),
  ('Literatura', '#7B1FA2', 'AutoStories', 'Linguagens, Códigos e suas Tecnologias', 6),
  ('Redação', '#880E4F', 'Edit', 'Linguagens, Códigos e suas Tecnologias', 7),
  ('Inglês/Espanhol', '#AD1457', 'Language', 'Linguagens, Códigos e suas Tecnologias', 8),
  ('História', '#BF360C', 'HistoryEdu', 'Ciências Humanas e suas Tecnologias', 9),
  ('Geografia', '#4E342E', 'Public', 'Ciências Humanas e suas Tecnologias', 10),
  ('Filosofia', '#37474F', 'Psychology', 'Ciências Humanas e suas Tecnologias', 11),
  ('Sociologia', '#455A64', 'Groups', 'Ciências Humanas e suas Tecnologias', 12)
ON CONFLICT DO NOTHING;
