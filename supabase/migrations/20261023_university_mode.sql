-- ==============================================================================
-- DUCKMIND: MIGRAÇÃO PARA O "MODO UNIVERSITÁRIO" COM ISOLAMENTO RIGOROSO DE DADOS
-- ==============================================================================
-- Este script deve ser executado no SQL Editor do Supabase Dashboard.
-- Ele atualiza a tabela de perfil com a coluna do toggle e cria todas as tabelas
-- do Modo Universitário com Foreign Keys referenciando auth.users(id), índices
-- de performance e políticas RLS (Row Level Security) garantindo isolamento total.

-- 1. ATUALIZAÇÃO DA TABELA DE PERFIL DE USUÁRIO (TOGGLE DE MODO)
ALTER TABLE IF EXISTS public.user_profiles
ADD COLUMN IF NOT EXISTS current_mode TEXT DEFAULT 'vestibular';

-- Garante que o valor só possa ser 'vestibular' ou 'universitario'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_current_mode_check'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_current_mode_check
    CHECK (current_mode IN ('vestibular', 'universitario'));
  END IF;
END $$;


-- 2. TABELA DE DISCIPLINAS UNIVERSITÁRIAS
CREATE TABLE IF NOT EXISTS public.university_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  professor TEXT,
  room TEXT,
  schedule TEXT,
  credits INTEGER DEFAULT 4,
  target_hours_weekly NUMERIC DEFAULT 4,
  color TEXT DEFAULT '#6F00D6',
  icon TEXT DEFAULT 'BookOpen',
  semester TEXT DEFAULT '2026.1',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uni_subjects_user_id ON public.university_subjects(user_id);


-- 3. TABELA DE PROVAS E NOTAS (CALCULADORA DE MÉDIAS E PESOS)
CREATE TABLE IF NOT EXISTS public.university_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.university_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  score NUMERIC,
  max_score NUMERIC NOT NULL DEFAULT 10.0,
  date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uni_grades_user_id ON public.university_grades(user_id);
CREATE INDEX IF NOT EXISTS idx_uni_grades_subject_id ON public.university_grades(subject_id);


-- 4. TABELA DE PRAZOS E ENTREGAS (KANBAN DE TRABALHOS ACADÊMICOS)
CREATE TABLE IF NOT EXISTS public.university_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.university_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uni_tasks_user_id ON public.university_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_uni_tasks_subject_id ON public.university_tasks(subject_id);


-- 5. TABELA DE SESSÕES DE ESTUDO UNIVERSITÁRIO (INTEGRADO AO CRONÔMETRO)
CREATE TABLE IF NOT EXISTS public.university_study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.university_subjects(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  session_type TEXT NOT NULL DEFAULT 'estudo' CHECK (session_type IN ('estudo', 'aula', 'revisao', 'projeto', 'exercicios')),
  studied_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uni_sessions_user_id ON public.university_study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_uni_sessions_subject_id ON public.university_study_sessions(subject_id);


-- 6. TABELA DE RESUMOS E FLASHCARDS UNIVERSITÁRIOS
CREATE TABLE IF NOT EXISTS public.university_flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.university_subjects(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  summary_topic TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'revisando', 'dominado')),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uni_flashcards_user_id ON public.university_flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_uni_flashcards_subject_id ON public.university_flashcards(subject_id);


-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE ACESSO ISOLADO POR USUÁRIO
-- ==============================================================================

-- Habilita RLS em todas as tabelas universitárias
ALTER TABLE public.university_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_flashcards ENABLE ROW LEVEL SECURITY;

-- Políticas para university_subjects
DROP POLICY IF EXISTS "Users can view their own university subjects" ON public.university_subjects;
CREATE POLICY "Users can view their own university subjects"
ON public.university_subjects FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own university subjects" ON public.university_subjects;
CREATE POLICY "Users can insert their own university subjects"
ON public.university_subjects FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own university subjects" ON public.university_subjects;
CREATE POLICY "Users can update their own university subjects"
ON public.university_subjects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own university subjects" ON public.university_subjects;
CREATE POLICY "Users can delete their own university subjects"
ON public.university_subjects FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para university_grades
DROP POLICY IF EXISTS "Users can view their own university grades" ON public.university_grades;
CREATE POLICY "Users can view their own university grades"
ON public.university_grades FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own university grades" ON public.university_grades;
CREATE POLICY "Users can insert their own university grades"
ON public.university_grades FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own university grades" ON public.university_grades;
CREATE POLICY "Users can update their own university grades"
ON public.university_grades FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own university grades" ON public.university_grades;
CREATE POLICY "Users can delete their own university grades"
ON public.university_grades FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para university_tasks
DROP POLICY IF EXISTS "Users can view their own university tasks" ON public.university_tasks;
CREATE POLICY "Users can view their own university tasks"
ON public.university_tasks FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own university tasks" ON public.university_tasks;
CREATE POLICY "Users can insert their own university tasks"
ON public.university_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own university tasks" ON public.university_tasks;
CREATE POLICY "Users can update their own university tasks"
ON public.university_tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own university tasks" ON public.university_tasks;
CREATE POLICY "Users can delete their own university tasks"
ON public.university_tasks FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para university_study_sessions
DROP POLICY IF EXISTS "Users can view their own university sessions" ON public.university_study_sessions;
CREATE POLICY "Users can view their own university sessions"
ON public.university_study_sessions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own university sessions" ON public.university_study_sessions;
CREATE POLICY "Users can insert their own university sessions"
ON public.university_study_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own university sessions" ON public.university_study_sessions;
CREATE POLICY "Users can update their own university sessions"
ON public.university_study_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own university sessions" ON public.university_study_sessions;
CREATE POLICY "Users can delete their own university sessions"
ON public.university_study_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para university_flashcards
DROP POLICY IF EXISTS "Users can view their own university flashcards" ON public.university_flashcards;
CREATE POLICY "Users can view their own university flashcards"
ON public.university_flashcards FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own university flashcards" ON public.university_flashcards;
CREATE POLICY "Users can insert their own university flashcards"
ON public.university_flashcards FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own university flashcards" ON public.university_flashcards;
CREATE POLICY "Users can update their own university flashcards"
ON public.university_flashcards FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own university flashcards" ON public.university_flashcards;
CREATE POLICY "Users can delete their own university flashcards"
ON public.university_flashcards FOR DELETE
USING (auth.uid() = user_id);
