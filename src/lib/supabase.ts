import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './mockSupabase';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.SUPABASE_URL as string) ||
  '';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.SUPABASE_ANON_KEY as string) ||
  '';

const isRealSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient = (false && isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient()) as unknown as SupabaseClient;

export type Subject = {
  id: string;
  name: string;
  color: string;
  icon: string;
  area: string;
  display_order: number;
};

export type Topic = {
  id: string;
  user_id: string;
  subject_id: string;
  name: string;
  order_index: number;
  description: string | null;
  created_at: string;
};

export type StudyType = 'teoria' | 'questoes' | 'revisao' | 'flashcards';

export type StudySession = {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id: string | null;
  duration_minutes: number;
  questions_correct: number;
  questions_wrong: number;
  flashcards_count: number;
  notes: string;
  studied_at: string;
  study_type: StudyType;
};

export type SimulationType = 'completo' | 'dia_1' | 'dia_2' | 'area_unica' | 'personalizado';
export type SimulationTargetArea = 'languages' | 'humanities' | 'natural_sciences' | 'math' | 'essay';

export type Simulation = {
  id: string;
  user_id: string;
  title: string;
  simulation_date: string;
  simulation_type?: SimulationType | null;
  target_area?: SimulationTargetArea | null;
  duration_minutes?: number | null;
  exam_source?: string | null;
  questions_total?: number | null;
  questions_correct?: number | null;
  perceived_difficulty?: 'facil' | 'medio' | 'dificil' | 'muito_dificil' | null;
  score_languages: number | null;
  score_humanities: number | null;
  score_natural_sciences: number | null;
  score_math: number | null;
  score_essay: number | null;
  total_score: number | null;
  notes: string;
  created_at: string;
};

export type Essay = {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  grade: number | null;
  comments: string;
  file_path: string | null;
  file_type: string | null;
  written_at: string | null;
  created_at: string;
};

export type TopicCompletion = {
  id: string;
  user_id: string;
  topic_id: string;
  completed_at: string;
};

export type ErrorNotebookEntry = {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id: string | null;
  custom_subtopic: string;
  image_data: string;
  student_answer: string;
  correct_answer: string;
  materia_sugerida: string;
  topico_sugerido: string;
  enunciado_latex: string;
  diagnostico_erro: string;
  resolucao_passos: string;
  dica_flashcard: string;
  status: 'pendente' | 'revisado';
  reviewed_at: string | null;
  created_at: string;
  observacoes: string;
};

export type UserProfile = {
  id: string;
  display_name: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  total_study_minutes: number;
  avatar_emoji: string;
  bio: string;
  goal_daily_minutes: number;
  goal_weekly_minutes: number;
  goal_weekly_questions: number;
  notifications_enabled: boolean;
  created_at: string;
};

export type RepertorioCustomEntry = {
  id: string;
  user_id: string;
  autor_ou_obra: string;
  titulo_conceito: string;
  eixo: string;
  tipo: string;
  ano_ou_origem?: string | null;
  conceito: string;
  citacao?: string | null;
  como_usar: string;
  palavras_chave: string[];
  created_at?: string;
};

export type RepertorioFavoriteEntry = {
  id: string;
  user_id: string;
  repertorio_id: string;
  created_at?: string;
};
