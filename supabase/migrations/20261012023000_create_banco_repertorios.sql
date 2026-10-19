/*
# Create Banco de Repertórios (Custom items & Favorites)

1. New tables:
- `repertorios_custom`: Stores custom ENEM argument repertoires created by students.
- `repertorio_favorites`: Stores student's favorite repertoires (both initial presets and custom).

2. Security:
- Row Level Security (RLS) enabled on both tables.
- Authenticated users can only read, insert, update, and delete their own records.
*/

-- 1. Tabela para Repertórios Customizados do aluno
CREATE TABLE IF NOT EXISTS public.repertorios_custom (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    autor_ou_obra TEXT NOT NULL,
    titulo_conceito TEXT NOT NULL,
    eixo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    ano_ou_origem TEXT,
    conceito TEXT NOT NULL,
    citacao TEXT,
    como_usar TEXT NOT NULL,
    palavras_chave TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS repertorios_custom_user_idx ON public.repertorios_custom(user_id);
CREATE INDEX IF NOT EXISTS repertorios_custom_eixo_idx ON public.repertorios_custom(eixo);

ALTER TABLE public.repertorios_custom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_repertorios_custom" ON public.repertorios_custom;
CREATE POLICY "select_own_repertorios_custom" ON public.repertorios_custom
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_repertorios_custom" ON public.repertorios_custom;
CREATE POLICY "insert_own_repertorios_custom" ON public.repertorios_custom
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_repertorios_custom" ON public.repertorios_custom;
CREATE POLICY "update_own_repertorios_custom" ON public.repertorios_custom
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_repertorios_custom" ON public.repertorios_custom;
CREATE POLICY "delete_own_repertorios_custom" ON public.repertorios_custom
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);


-- 2. Tabela para Repertórios Favoritos do aluno
CREATE TABLE IF NOT EXISTS public.repertorio_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repertorio_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, repertorio_id)
);

CREATE INDEX IF NOT EXISTS repertorio_favorites_user_idx ON public.repertorio_favorites(user_id);

ALTER TABLE public.repertorio_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_repertorio_favorites" ON public.repertorio_favorites;
CREATE POLICY "select_own_repertorio_favorites" ON public.repertorio_favorites
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_repertorio_favorites" ON public.repertorio_favorites;
CREATE POLICY "insert_own_repertorio_favorites" ON public.repertorio_favorites
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_repertorio_favorites" ON public.repertorio_favorites;
CREATE POLICY "delete_own_repertorio_favorites" ON public.repertorio_favorites
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
