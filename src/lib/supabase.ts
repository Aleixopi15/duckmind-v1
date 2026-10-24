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

export function isSecretKey(key: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.startsWith('sb_secret_') || trimmed.startsWith('sbp_')) return true;
  try {
    const parts = trimmed.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload?.role === 'service_role';
    }
  } catch {
    // ignore
  }
  return false;
}

export const isSecretKeyDetected = isSecretKey(supabaseAnonKey);

export const isRealSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder') &&
  !isSecretKeyDetected
);

function initSupabase(): SupabaseClient {
  if (isRealSupabaseConfigured) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('[Supabase] Falha ao inicializar cliente real do Supabase:', err);
      return createMockSupabaseClient() as unknown as SupabaseClient;
    }
  }
  return createMockSupabaseClient() as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = initSupabase();

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

export type SimulationSubjectBreakdown = {
  subject_id: string;
  subject_name: string;
  questions_total: number;
  questions_correct: number;
};

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

export type VestibularTaskPriority = 'low' | 'medium' | 'high';
export type VestibularTaskStatus = 'todo' | 'in_progress' | 'done';

export type VestibularTask = {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description: string;
  status: VestibularTaskStatus;
  priority: VestibularTaskPriority;
  due_date: string | null;
  delivered_at: string | null;
  created_at: string;
};

export type UserMode = 'vestibular' | 'universitario';

export type UserProfile = {
  id: string;
  display_name: string;
  current_streak: number;
  longest_streak: number;
  uni_current_streak?: number;
  uni_longest_streak?: number;
  last_study_date: string | null;
  total_study_minutes: number;
  avatar_emoji: string;
  bio: string;
  goal_daily_minutes: number;
  goal_weekly_minutes: number;
  goal_weekly_questions: number;
  notifications_enabled: boolean;
  current_mode?: UserMode;
  created_at: string;
};

export type UniversitySubject = {
  id: string;
  user_id: string;
  name: string;
  code?: string | null;
  professor?: string | null;
  room?: string | null;
  schedule?: string | null;
  credits: number;
  target_hours_weekly: number;
  color: string;
  icon: string;
  semester: string;
  created_at: string;
};

export type UniversityGrade = {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  weight: number;
  score: number | null;
  max_score: number;
  date: string | null;
  notes: string;
  created_at: string;
};

export type UniversityTaskPriority = 'low' | 'medium' | 'high';
export type UniversityTaskStatus = 'todo' | 'in_progress' | 'done';

export type UniversityTask = {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description: string;
  status: UniversityTaskStatus;
  priority: UniversityTaskPriority;
  due_date: string | null;
  delivered_at: string | null;
  created_at: string;
};

export type UniversitySessionType = 'estudo' | 'aula' | 'revisao' | 'projeto' | 'exercicios';

export type UniversityStudySession = {
  id: string;
  user_id: string;
  subject_id: string;
  duration_minutes: number;
  notes: string;
  session_type: UniversitySessionType;
  studied_at: string;
  created_at: string;
};

export type UniversityFlashcardStatus = 'novo' | 'revisando' | 'dominado';

export type UniversityFlashcard = {
  id: string;
  user_id: string;
  subject_id: string;
  front: string;
  back: string;
  summary_topic: string;
  status: UniversityFlashcardStatus;
  last_reviewed_at: string | null;
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
