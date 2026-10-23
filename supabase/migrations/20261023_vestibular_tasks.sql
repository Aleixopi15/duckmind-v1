-- ==============================================================================
-- DUCKMIND - MODO VESTIBULAR: TABELA DE TAREFAS (ISOLADA DO MODO UNIVERSITÁRIO)
-- Script SQL para execução no SQL Editor do Supabase
-- ==============================================================================

-- 1. Criação da tabela vestibular_tasks
CREATE TABLE IF NOT EXISTS public.vestibular_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_vestibular_tasks_user_id ON public.vestibular_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_vestibular_tasks_subject_id ON public.vestibular_tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_vestibular_tasks_status ON public.vestibular_tasks(status);
CREATE INDEX IF NOT EXISTS idx_vestibular_tasks_due_date ON public.vestibular_tasks(due_date);

-- 3. Habilitação de Row Level Security (RLS)
ALTER TABLE public.vestibular_tasks ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança (RLS) por Usuário
DROP POLICY IF EXISTS "Users can view their own vestibular tasks" ON public.vestibular_tasks;
CREATE POLICY "Users can view their own vestibular tasks"
    ON public.vestibular_tasks
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own vestibular tasks" ON public.vestibular_tasks;
CREATE POLICY "Users can insert their own vestibular tasks"
    ON public.vestibular_tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vestibular tasks" ON public.vestibular_tasks;
CREATE POLICY "Users can update their own vestibular tasks"
    ON public.vestibular_tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vestibular tasks" ON public.vestibular_tasks;
CREATE POLICY "Users can delete their own vestibular tasks"
    ON public.vestibular_tasks
    FOR DELETE
    USING (auth.uid() = user_id);
