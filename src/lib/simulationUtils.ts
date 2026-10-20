import type { Simulation, SimulationType, SimulationTargetArea, StudySession } from './supabase';

export interface SimulationSubjectBreakdown {
  subject_id: string;
  subject_name: string;
  questions_total: number;
  questions_correct: number;
}

export interface SimulationMeta {
  type: SimulationType;
  target_area?: SimulationTargetArea | null;
  duration_minutes?: number | null;
  exam_source?: string | null;
  questions_total?: number | null;
  questions_correct?: number | null;
  difficulty?: 'facil' | 'medio' | 'dificil' | 'muito_dificil' | null;
  area_correct?: Record<string, number>;
  area_tri?: Record<string, number>;
  total_tri?: number | null;
  essay_competencies?: [number, number, number, number, number];
  error_reasons?: string[];
  subjects_breakdown?: SimulationSubjectBreakdown[];
}

export function parseSimulationData(s: Simulation): {
  cleanNotes: string;
  meta: SimulationMeta;
} {
  let cleanNotes = s.notes ? String(s.notes) : '';
  const meta: SimulationMeta = {
    type: s.simulation_type || 'completo',
    target_area: s.target_area,
    duration_minutes: s.duration_minutes,
    exam_source: s.exam_source,
    questions_total: s.questions_total,
    questions_correct: s.questions_correct,
    difficulty: s.perceived_difficulty,
    total_tri: s.total_score,
  };

  // Check for embedded JSON tag in notes
  const tagMatch = cleanNotes.match(/<!-- ENEM_META:(\{.*?\}) -->/s);
  if (tagMatch) {
    try {
      const parsed = JSON.parse(tagMatch[1]);
      if (parsed.type && !s.simulation_type) meta.type = parsed.type;
      if (parsed.target_area && !s.target_area) meta.target_area = parsed.target_area;
      if (parsed.duration_minutes && !s.duration_minutes) meta.duration_minutes = parsed.duration_minutes;
      if (parsed.exam_source && !s.exam_source) meta.exam_source = parsed.exam_source;
      if (parsed.questions_total && !s.questions_total) meta.questions_total = parsed.questions_total;
      if (parsed.questions_correct && !s.questions_correct) meta.questions_correct = parsed.questions_correct;
      if (parsed.difficulty && !s.perceived_difficulty) meta.difficulty = parsed.difficulty;
      if (parsed.essay_competencies) meta.essay_competencies = parsed.essay_competencies;
      if (parsed.error_reasons) meta.error_reasons = parsed.error_reasons;
      if (parsed.area_tri) meta.area_tri = parsed.area_tri;
      if (parsed.total_tri && s.total_score === null) meta.total_tri = parsed.total_tri;
      if (Array.isArray(parsed.subjects_breakdown)) meta.subjects_breakdown = parsed.subjects_breakdown;
      cleanNotes = cleanNotes.replace(/<!-- ENEM_META:(\{.*?\}) -->/s, '').trim();
    } catch {
      // ignore JSON parse error
    }
  }

  return { cleanNotes, meta };
}

export interface ParsedSimulationQuestions {
  total: number;
  correct: number;
  wrong: number;
  date: string;
  type: SimulationType;
  subjectsBreakdown: SimulationSubjectBreakdown[];
}

export function getSimulationQuestions(s: Simulation): ParsedSimulationQuestions {
  const { meta } = parseSimulationData(s);
  const type = s.simulation_type || meta.type || 'completo';
  const subjectsBreakdown: SimulationSubjectBreakdown[] = meta.subjects_breakdown || [];

  let total = 0;
  let correct = 0;

  if (type === 'personalizado' && subjectsBreakdown.length > 0) {
    total = subjectsBreakdown.reduce((sum, b) => sum + (Number(b.questions_total) || 0), 0);
    correct = subjectsBreakdown.reduce((sum, b) => sum + (Number(b.questions_correct) || 0), 0);
  } else if (s.questions_total !== null && s.questions_total !== undefined && s.questions_total > 0) {
    total = s.questions_total;
    correct = s.questions_correct ?? 0;
  } else if (meta.questions_total !== null && meta.questions_total !== undefined && meta.questions_total > 0) {
    total = meta.questions_total;
    correct = meta.questions_correct ?? 0;
  } else if (type === 'dia_1') {
    total = 90;
    correct = (s.score_languages ?? 0) + (s.score_humanities ?? 0);
  } else if (type === 'dia_2') {
    total = 90;
    correct = (s.score_natural_sciences ?? 0) + (s.score_math ?? 0);
  } else if (type === 'area_unica') {
    if (s.target_area === 'essay' || meta.target_area === 'essay') {
      total = 0;
      correct = 0;
    } else {
      total = 45;
      const area = s.target_area || meta.target_area;
      if (area === 'languages') correct = s.score_languages ?? 0;
      else if (area === 'humanities') correct = s.score_humanities ?? 0;
      else if (area === 'natural_sciences') correct = s.score_natural_sciences ?? 0;
      else if (area === 'math') correct = s.score_math ?? 0;
    }
  } else {
    // completo ou padrão
    total = 180;
    correct =
      (s.score_languages ?? 0) +
      (s.score_humanities ?? 0) +
      (s.score_natural_sciences ?? 0) +
      (s.score_math ?? 0);
  }

  // Ensure correct does not exceed total
  correct = Math.min(total, Math.max(0, correct));
  const wrong = Math.max(0, total - correct);

  return {
    total,
    correct,
    wrong,
    date: s.simulation_date || (s.created_at ? s.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    type,
    subjectsBreakdown,
  };
}

/**
 * Returns question counts from a simulation that belong to a specific subject (by id or normalized name/area).
 */
export function getSubjectSimulationQuestions(
  s: Simulation,
  subjectId: string,
  subjectName: string,
  subjectArea?: string
): { total: number; correct: number } {
  const parsed = getSimulationQuestions(s);
  const normSubName = subjectName.trim().toLowerCase();

  // 1. If simulation is personalizado and has subject breakdown
  if (parsed.subjectsBreakdown.length > 0) {
    const match = parsed.subjectsBreakdown.find(b => {
      if (b.subject_id && b.subject_id === subjectId) return true;
      const bName = b.subject_name.trim().toLowerCase();
      return bName === normSubName || normSubName.includes(bName) || bName.includes(normSubName);
    });
    if (match) {
      return {
        total: Number(match.questions_total) || 0,
        correct: Number(match.questions_correct) || 0,
      };
    }
    return { total: 0, correct: 0 };
  }

  // 2. If standard simulation, map based on subject area or exact name
  const isMath = normSubName.includes('matemática') || normSubName === 'matematica';
  const isNature = ['física', 'fisica', 'química', 'quimica', 'biologia'].some(n => normSubName.includes(n));
  const isHuman = ['história', 'historia', 'geografia', 'filosofia', 'sociologia'].some(n => normSubName.includes(n));
  const isLang = ['português', 'portugues', 'literatura', 'inglês', 'ingles', 'espanhol', 'artes'].some(n => normSubName.includes(n));

  if (isMath) {
    if (parsed.type === 'dia_2' || parsed.type === 'completo' || (parsed.type === 'area_unica' && (s.target_area === 'math' || parsed.target_area === 'math'))) {
      const score = s.score_math ?? 0;
      return { total: 45, correct: Math.min(45, score) };
    }
  }

  if (isNature) {
    if (parsed.type === 'dia_2' || parsed.type === 'completo' || (parsed.type === 'area_unica' && (s.target_area === 'natural_sciences' || parsed.target_area === 'natural_sciences'))) {
      const score = s.score_natural_sciences ?? 0;
      const subTotal = 15;
      return { total: subTotal, correct: Math.min(subTotal, Math.round((score / 45) * subTotal)) };
    }
  }

  if (isHuman) {
    if (parsed.type === 'dia_1' || parsed.type === 'completo' || (parsed.type === 'area_unica' && (s.target_area === 'humanities' || parsed.target_area === 'humanities'))) {
      const score = s.score_humanities ?? 0;
      const subTotal = 11;
      return { total: subTotal, correct: Math.min(subTotal, Math.round((score / 45) * subTotal)) };
    }
  }

  if (isLang) {
    if (parsed.type === 'dia_1' || parsed.type === 'completo' || (parsed.type === 'area_unica' && (s.target_area === 'languages' || parsed.target_area === 'languages'))) {
      const score = s.score_languages ?? 0;
      const subTotal = 15;
      return { total: subTotal, correct: Math.min(subTotal, Math.round((score / 45) * subTotal)) };
    }
  }

  return { total: 0, correct: 0 };
}

/**
 * Calculates overall questions stats combining study sessions AND simulations.
 */
export function calculateOverallQuestions(
  sessions: StudySession[],
  simulations: Simulation[],
  dateFilter?: (isoDate: string) => boolean
) {
  let sessionTotal = 0;
  let sessionCorrect = 0;
  let simTotal = 0;
  let simCorrect = 0;

  sessions.forEach(s => {
    const isoDate = s.studied_at.split('T')[0];
    if (dateFilter && !dateFilter(isoDate)) return;
    const correct = s.questions_correct || 0;
    const wrong = s.questions_wrong || 0;
    sessionTotal += correct + wrong;
    sessionCorrect += correct;
  });

  simulations.forEach(sim => {
    const q = getSimulationQuestions(sim);
    if (dateFilter && !dateFilter(q.date)) return;
    simTotal += q.total;
    simCorrect += q.correct;
  });

  const totalQuestions = sessionTotal + simTotal;
  const totalCorrect = sessionCorrect + simCorrect;
  const totalWrong = Math.max(0, totalQuestions - totalCorrect);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    totalCorrect,
    totalWrong,
    accuracy,
    sessionTotal,
    sessionCorrect,
    simTotal,
    simCorrect,
  };
}
