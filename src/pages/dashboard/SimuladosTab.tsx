import { useState, useEffect, useMemo } from 'react';
import Modal from '../../components/Modal';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/theme';
import type { Simulation, SimulationType, SimulationTargetArea } from '../../lib/supabase';
import { parseSimulationData, type SimulationMeta, type SimulationSubjectBreakdown } from '../../lib/simulationUtils';
import { getLocalDateString, formatLocalDateBR } from '../../lib/dateUtils';
import type { ElementType } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ClipboardList,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Landmark,
  PenLine,
  FlaskConical,
  Calculator,
  GraduationCap,
  Target,
  Sliders,
} from 'lucide-react';

export interface EnemAreaConfig {
  key: 'languages' | 'humanities' | 'natural_sciences' | 'math' | 'essay';
  label: string;
  shortLabel: string;
  day: 1 | 2;
  color: string;
  badgeBg: string;
  badgeText: string;
  defaultQuestions: number;
  maxScore: number;
  icon: ElementType;
}

export const ENEM_AREAS: EnemAreaConfig[] = [
  {
    key: 'languages',
    label: 'Linguagens, Códigos e suas Tecnologias',
    shortLabel: 'Linguagens',
    day: 1,
    color: '#3B82F6',
    badgeBg: 'bg-blue-50 dark:bg-blue-500/10',
    badgeText: 'text-blue-700 dark:text-blue-300',
    defaultQuestions: 45,
    maxScore: 1000,
    icon: BookOpen,
  },
  {
    key: 'humanities',
    label: 'Ciências Humanas e suas Tecnologias',
    shortLabel: 'Humanas',
    day: 1,
    color: '#F59E0B',
    badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
    badgeText: 'text-amber-700 dark:text-amber-300',
    defaultQuestions: 45,
    maxScore: 1000,
    icon: Landmark,
  },
  {
    key: 'essay',
    label: 'Redação',
    shortLabel: 'Redação',
    day: 1,
    color: '#EC4899',
    badgeBg: 'bg-pink-50 dark:bg-pink-500/10',
    badgeText: 'text-pink-700 dark:text-pink-300',
    defaultQuestions: 0,
    maxScore: 1000,
    icon: PenLine,
  },
  {
    key: 'natural_sciences',
    label: 'Ciências da Natureza e suas Tecnologias',
    shortLabel: 'Natureza',
    day: 2,
    color: '#10B981',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    defaultQuestions: 45,
    maxScore: 1000,
    icon: FlaskConical,
  },
  {
    key: 'math',
    label: 'Matemática e suas Tecnologias',
    shortLabel: 'Matemática',
    day: 2,
    color: '#8B5CF6',
    badgeBg: 'bg-purple-50 dark:bg-purple-500/10',
    badgeText: 'text-purple-700 dark:text-purple-300',
    defaultQuestions: 45,
    maxScore: 1000,
    icon: Calculator,
  },
];

/**
 * Retorna a cor da barra de porcentagem dos simulados de acordo com o aproveitamento:
 * - >= 80%: Verde (#00D64B)
 * - 65% a 79%: Amarelo (#EAB308)
 * - 50% a 64%: Laranja (#F97316)
 * - < 50%: Vermelho (#EF4444)
 */
export function getSimPercentageColor(pct: number) {
  if (pct >= 80) {
    return {
      hex: '#00D64B',
      text: 'text-[#008E32] dark:text-[#19E85F]',
      bg: 'bg-[#00D64B]',
      lightBg: 'bg-[#00D64B]/15',
      border: 'border-[#00D64B]/30',
      label: 'Excelente',
    };
  }
  if (pct >= 65) {
    return {
      hex: '#EAB308',
      text: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-400',
      lightBg: 'bg-amber-400/15',
      border: 'border-amber-400/30',
      label: 'Bom',
    };
  }
  if (pct >= 50) {
    return {
      hex: '#F97316',
      text: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-500',
      lightBg: 'bg-orange-500/15',
      border: 'border-orange-500/30',
      label: 'Regular',
    };
  }
  return {
    hex: '#EF4444',
    text: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500',
    lightBg: 'bg-red-500/15',
    border: 'border-red-500/30',
    label: 'Atenção',
  };
}

const SIM_TYPE_DETAILS: Record<SimulationType, { label: string; desc: string; officialTime: number; badgeColor: string; icon: ElementType }> = {
  completo: {
    label: 'ENEM Completo',
    desc: '1º e 2º Dia juntos (180 questões + Redação)',
    officialTime: 630, // 10h30 total
    badgeColor: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 border-brand-200 dark:border-brand-500/30',
    icon: GraduationCap,
  },
  dia_1: {
    label: '1º Dia do ENEM',
    desc: 'Linguagens (45q) + Humanas (45q) + Redação',
    officialTime: 330, // 5h30
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    icon: BookOpen,
  },
  dia_2: {
    label: '2º Dia do ENEM',
    desc: 'Ciências da Natureza (45q) + Matemática (45q)',
    officialTime: 300, // 5h00
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    icon: FlaskConical,
  },
  area_unica: {
    label: 'Área Única do ENEM',
    desc: 'Simulado focado em apenas 1 área (45q ou Redação)',
    officialTime: 150, // 2h30
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    icon: Target,
  },
  personalizado: {
    label: 'Personalizado',
    desc: 'Você escolhe as áreas e quantitativo de questões',
    officialTime: 180,
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border-slate-200 dark:border-white/10',
    icon: Sliders,
  },
};

const SUGGESTED_SOURCES = [
  'ENEM Oficial (Inep)',
  'SAS Educação',
  'Bernoulli Sistema de Ensino',
  'Poliedro',
  'Somos Educação / Anglo',
  'Evolucional',
  'Descomplica',
  'Professor Ferretto',
  'Simulado Autoral / Outros',
];


export interface FormSubjectEntry {
  subject_id: string;
  subject_name: string;
  questions_total: string;
  questions_correct: string;
}

interface FormState {
  id: string;
  title: string;
  simulation_date: string;
  simulation_type: SimulationType;
  target_area: SimulationTargetArea;
  duration_hours: string;
  duration_minutes: string;
  exam_source: string;
  perceived_difficulty: 'facil' | 'medio' | 'dificil' | 'muito_dificil' | '';
  error_reasons: string[];
  notes: string;
  // Matérias individuais para Simulado Personalizado
  custom_subjects: FormSubjectEntry[];
  // Area values (questions correct count for objectives, points for essay)
  score_languages: string;
  score_humanities: string;
  score_natural_sciences: string;
  score_math: string;
  score_essay: string;
  // Redação competências 1 a 5 (0 a 200 cada)
  show_essay_details: boolean;
  comp1: number;
  comp2: number;
  comp3: number;
  comp4: number;
  comp5: number;
  // User-provided TRI score (optional)
  user_tri_score: string;
  show_area_tri: boolean;
  tri_languages: string;
  tri_humanities: string;
  tri_natural_sciences: string;
  tri_math: string;
}

const emptyForm: FormState = {
  id: '',
  title: '',
  simulation_date: getLocalDateString(),
  simulation_type: 'completo',
  target_area: 'languages',
  duration_hours: '',
  duration_minutes: '',
  exam_source: '',
  perceived_difficulty: 'medio',
  error_reasons: [],
  notes: '',
  custom_subjects: [],
  score_languages: '',
  score_humanities: '',
  score_natural_sciences: '',
  score_math: '',
  score_essay: '',
  show_essay_details: false,
  comp1: 160,
  comp2: 160,
  comp3: 160,
  comp4: 160,
  comp5: 160,
  user_tri_score: '',
  show_area_tri: false,
  tri_languages: '',
  tri_humanities: '',
  tri_natural_sciences: '',
  tri_math: '',
};

const ERROR_TAGS = [
  'Tempo insuficiente',
  'Cansaço / Falta de atenção',
  'Lacuna teórica',
  'Interpretação de texto',
  'Pegadinha / Distrator',
  'Erro de conta / Cálculo',
  'Falta de estratégia de prova',
];

export default function SimuladosTab() {
  const { simulations, refreshData, user, subjects } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | SimulationType>('all');
  const [selectedDetail, setSelectedDetail] = useState<Simulation | null>(null);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  const handleAddCustomSubject = (subjectId?: string, subjectName?: string) => {
    const name = (subjectName || newSubjectInput).trim();
    if (!name) return;
    if (form.custom_subjects.some(cs => cs.subject_name.toLowerCase() === name.toLowerCase())) {
      setNewSubjectInput('');
      return;
    }
    const matchingSubject = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    setForm(prev => ({
      ...prev,
      custom_subjects: [
        ...prev.custom_subjects,
        {
          subject_id: subjectId || matchingSubject?.id || '',
          subject_name: matchingSubject?.name || name,
          questions_total: '15',
          questions_correct: '0',
        },
      ],
    }));
    setNewSubjectInput('');
  };

  const handleAddAllSubjects = () => {
    setForm(prev => {
      const existingNames = new Set(prev.custom_subjects.map(cs => cs.subject_name.toLowerCase()));
      const toAdd = subjects
        .filter(s => !existingNames.has(s.name.toLowerCase()))
        .map(s => ({
          subject_id: s.id,
          subject_name: s.name,
          questions_total: '15',
          questions_correct: '0',
        }));
      return {
        ...prev,
        custom_subjects: [...prev.custom_subjects, ...toAdd],
      };
    });
  };

  const handleUpdateCustomSubject = (index: number, field: keyof FormSubjectEntry, value: string) => {
    setForm(prev => {
      const updated = [...prev.custom_subjects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, custom_subjects: updated };
    });
  };

  const handleRemoveCustomSubject = (index: number) => {
    setForm(prev => ({
      ...prev,
      custom_subjects: prev.custom_subjects.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (open && !form.id) {
      setForm({
        ...emptyForm,
        simulation_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, form.id]);

  // Set official ENEM exam duration with 1 click
  const applyOfficialTime = () => {
    const totalMinutes = SIM_TYPE_DETAILS[form.simulation_type]?.officialTime || 300;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    setForm(prev => ({
      ...prev,
      duration_hours: h.toString(),
      duration_minutes: m.toString().padStart(2, '0'),
    }));
  };

  // Update total essay score when competencies change
  const handleCompChange = (compKey: 'comp1' | 'comp2' | 'comp3' | 'comp4' | 'comp5', value: number) => {
    const updated = { ...form, [compKey]: value };
    const totalComp = updated.comp1 + updated.comp2 + updated.comp3 + updated.comp4 + updated.comp5;
    setForm({ ...updated, score_essay: totalComp.toString() });
  };

  // Toggle error reason tags
  const toggleErrorTag = (tag: string) => {
    setForm(prev => {
      const exists = prev.error_reasons.includes(tag);
      return {
        ...prev,
        error_reasons: exists ? prev.error_reasons.filter(t => t !== tag) : [...prev.error_reasons, tag],
      };
    });
  };

  // Helper to calculate arithmetic average from filled area TRIs
  const calculateAverageTriFromAreas = () => {
    const values: number[] = [];
    if (form.tri_languages.trim()) values.push(parseFloat(form.tri_languages));
    if (form.tri_humanities.trim()) values.push(parseFloat(form.tri_humanities));
    if (form.tri_natural_sciences.trim()) values.push(parseFloat(form.tri_natural_sciences));
    if (form.tri_math.trim()) values.push(parseFloat(form.tri_math));
    if (form.score_essay.trim()) values.push(parseFloat(form.score_essay));

    const valid = values.filter(v => !isNaN(v));
    if (valid.length > 0) {
      const avg = Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
      setForm(prev => ({ ...prev, user_tri_score: avg.toString() }));
    }
  };

  // Calculations for questions and rhythm (no artificial TRI calculation)
  const parsedFormStats = useMemo(() => {
    const l = parseFloat(form.score_languages) || 0;
    const h = parseFloat(form.score_humanities) || 0;
    const n = parseFloat(form.score_natural_sciences) || 0;
    const m = parseFloat(form.score_math) || 0;

    let totalQuestions = 0;
    let totalCorrect = 0;

    const durH = parseInt(form.duration_hours) || 0;
    const durM = parseInt(form.duration_minutes) || 0;
    const totalDurationMinutes = durH * 60 + durM;

    if (form.simulation_type === 'dia_1') {
      totalQuestions = 90;
      totalCorrect = (form.score_languages ? l : 0) + (form.score_humanities ? h : 0);
    } else if (form.simulation_type === 'dia_2') {
      totalQuestions = 90;
      totalCorrect = (form.score_natural_sciences ? n : 0) + (form.score_math ? m : 0);
    } else if (form.simulation_type === 'area_unica') {
      if (form.target_area === 'essay') {
        totalQuestions = 0;
        totalCorrect = 0;
      } else {
        totalQuestions = 45;
        let c = 0;
        if (form.target_area === 'languages') c = l;
        else if (form.target_area === 'humanities') c = h;
        else if (form.target_area === 'natural_sciences') c = n;
        else if (form.target_area === 'math') c = m;
        totalCorrect = c;
      }
    } else if (form.simulation_type === 'personalizado') {
      if (form.custom_subjects.length > 0) {
        totalQuestions = form.custom_subjects.reduce((sum, s) => sum + (parseInt(s.questions_total) || 0), 0);
        totalCorrect = form.custom_subjects.reduce((sum, s) => sum + (parseInt(s.questions_correct) || 0), 0);
      } else {
        totalQuestions = 0;
        totalCorrect = 0;
      }
    } else {
      // completo
      totalQuestions = 180;
      totalCorrect =
        (form.score_languages ? l : 0) +
        (form.score_humanities ? h : 0) +
        (form.score_natural_sciences ? n : 0) +
        (form.score_math ? m : 0);
    }

    const accuracyPct = totalQuestions > 0 ? Math.min(100, Math.round((totalCorrect / totalQuestions) * 100)) : 0;
    const paceSeconds = totalQuestions > 0 && totalDurationMinutes > 0
      ? Math.round((totalDurationMinutes * 60) / totalQuestions)
      : 0;

    return {
      totalQuestions,
      totalCorrect,
      totalDurationMinutes,
      accuracyPct,
      paceSeconds,
    };
  }, [form]);

  // Handle Save with user-specified TRI (if any) and fallback
  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Por favor, informe um título ou identifique o simulado.');
      return;
    }
    if (form.simulation_type === 'personalizado' && form.custom_subjects.length === 0) {
      setError('Adicione pelo menos uma matéria para o simulado personalizado.');
      return;
    }
    setError('');
    setSaving(true);

    const durH = parseInt(form.duration_hours) || 0;
    const durM = parseInt(form.duration_minutes) || 0;
    const totalDuration = durH * 60 + durM > 0 ? durH * 60 + durM : null;

    // Filter which area correct counts apply based on simulation type
    let lVal: number | null = form.score_languages ? parseFloat(form.score_languages) : null;
    let hVal: number | null = form.score_humanities ? parseFloat(form.score_humanities) : null;
    let nVal: number | null = form.score_natural_sciences ? parseFloat(form.score_natural_sciences) : null;
    let mVal: number | null = form.score_math ? parseFloat(form.score_math) : null;
    let eVal: number | null = form.score_essay ? parseFloat(form.score_essay) : null;

    if (form.simulation_type === 'dia_1') {
      nVal = null;
      mVal = null;
    } else if (form.simulation_type === 'dia_2') {
      lVal = null;
      hVal = null;
      eVal = null;
    } else if (form.simulation_type === 'area_unica') {
      if (form.target_area !== 'languages') lVal = null;
      if (form.target_area !== 'humanities') hVal = null;
      if (form.target_area !== 'natural_sciences') nVal = null;
      if (form.target_area !== 'math') mVal = null;
      if (form.target_area !== 'essay') eVal = null;
    } else if (form.simulation_type === 'personalizado') {
      lVal = null;
      hVal = null;
      nVal = null;
      mVal = null;
      eVal = null;
    }

    // User-entered TRI score (if provided by user)
    const finalTriScore = form.user_tri_score.trim() ? parseFloat(form.user_tri_score) : null;

    // Area-level TRIs
    const areaTriMap: Record<string, number> = {};
    if (form.tri_languages.trim()) areaTriMap.languages = parseFloat(form.tri_languages);
    if (form.tri_humanities.trim()) areaTriMap.humanities = parseFloat(form.tri_humanities);
    if (form.tri_natural_sciences.trim()) areaTriMap.natural_sciences = parseFloat(form.tri_natural_sciences);
    if (form.tri_math.trim()) areaTriMap.math = parseFloat(form.tri_math);

    let subjectsBreakdown: SimulationSubjectBreakdown[] | undefined = undefined;
    if (form.simulation_type === 'personalizado') {
      subjectsBreakdown = form.custom_subjects
        .filter(cs => cs.subject_name.trim() && (parseInt(cs.questions_total) || 0) > 0)
        .map(cs => {
          const tot = Math.max(1, parseInt(cs.questions_total) || 0);
          const cor = Math.min(tot, Math.max(0, parseInt(cs.questions_correct) || 0));
          return {
            subject_id: cs.subject_id,
            subject_name: cs.subject_name.trim(),
            questions_total: tot,
            questions_correct: cor,
          };
        });
    }

    // Build embedded metadata tag for backward compatibility & rich details
    const metaPayload: SimulationMeta = {
      type: form.simulation_type,
      target_area: form.simulation_type === 'area_unica' ? form.target_area : null,
      duration_minutes: totalDuration,
      exam_source: form.exam_source.trim() || null,
      questions_total: parsedFormStats.totalQuestions,
      questions_correct: parsedFormStats.totalCorrect,
      difficulty: form.perceived_difficulty || null,
      error_reasons: form.error_reasons.length > 0 ? form.error_reasons : undefined,
      total_tri: finalTriScore,
      area_tri: Object.keys(areaTriMap).length > 0 ? areaTriMap : undefined,
      essay_competencies: form.show_essay_details
        ? [form.comp1, form.comp2, form.comp3, form.comp4, form.comp5]
        : undefined,
      subjects_breakdown: subjectsBreakdown,
    };

    const notesWithMeta = `${form.notes.trim()}\n\n<!-- ENEM_META:${JSON.stringify(metaPayload)} -->`.trim();

    // Full payload with new columns
    const fullPayload = {
      title: form.title.trim(),
      simulation_date: form.simulation_date,
      simulation_type: form.simulation_type,
      target_area: form.simulation_type === 'area_unica' ? form.target_area : null,
      duration_minutes: totalDuration,
      exam_source: form.exam_source.trim() || null,
      questions_total: parsedFormStats.totalQuestions,
      questions_correct: parsedFormStats.totalCorrect,
      perceived_difficulty: form.perceived_difficulty || null,
      score_languages: lVal,
      score_humanities: hVal,
      score_natural_sciences: nVal,
      score_math: mVal,
      score_essay: eVal,
      total_score: finalTriScore, // Saved strictly from user's manual TRI input
      notes: notesWithMeta,
    };

    // Base fallback payload (original schema only)
    const basePayload = {
      title: form.title.trim(),
      simulation_date: form.simulation_date,
      score_languages: lVal,
      score_humanities: hVal,
      score_natural_sciences: nVal,
      score_math: mVal,
      score_essay: eVal,
      total_score: finalTriScore,
      notes: notesWithMeta,
    };

    try {
      if (form.id) {
        // Try update with full payload
        const res = await supabase.from('simulations').update(fullPayload).eq('id', form.id);
        if (res.error) {
          console.warn('Update failed with new columns, retrying with base schema fallback:', res.error);
          const fallbackRes = await supabase.from('simulations').update(basePayload).eq('id', form.id);
          if (fallbackRes.error) throw fallbackRes.error;
        }
      } else {
        // Try insert with full payload
        const insertFull = { ...(user?.id ? { user_id: user.id } : {}), ...fullPayload };
        const insertBase = { ...(user?.id ? { user_id: user.id } : {}), ...basePayload };
        const res = await supabase.from('simulations').insert(insertFull);
        if (res.error) {
          console.warn('Insert failed with new columns, retrying with base schema fallback:', res.error);
          const fallbackRes = await supabase.from('simulations').insert(insertBase);
          if (fallbackRes.error) throw fallbackRes.error;
        }
      }

      setSaving(false);
      setOpen(false);
      setForm(emptyForm);
      await refreshData();
    } catch (err: any) {
      console.error('Error saving simulation:', err);
      setError(err?.message || 'Erro ao salvar simulado. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  };

  const handleEdit = (s: Simulation) => {
    const { cleanNotes, meta } = parseSimulationData(s);
    const durationTotal = s.duration_minutes ?? meta.duration_minutes ?? 0;
    const durH = durationTotal > 0 ? Math.floor(durationTotal / 60) : '';
    const durM = durationTotal > 0 ? (durationTotal % 60).toString() : '';

    const comp = meta.essay_competencies || [160, 160, 160, 160, 160];
    const areaTri = meta.area_tri || {};
    const triVal = s.total_score !== null && s.total_score !== undefined ? s.total_score.toString() : (meta.total_tri?.toString() ?? '');

    setForm({
      id: s.id,
      title: s.title,
      simulation_date: s.simulation_date,
      simulation_type: s.simulation_type || meta.type || 'completo',
      target_area: s.target_area || meta.target_area || 'languages',
      duration_hours: durH ? durH.toString() : '',
      duration_minutes: durM,
      exam_source: s.exam_source || meta.exam_source || '',
      perceived_difficulty: s.perceived_difficulty || meta.difficulty || 'medio',
      error_reasons: meta.error_reasons || [],
      notes: cleanNotes,
      score_languages: s.score_languages?.toString() ?? '',
      score_humanities: s.score_humanities?.toString() ?? '',
      score_natural_sciences: s.score_natural_sciences?.toString() ?? '',
      score_math: s.score_math?.toString() ?? '',
      score_essay: s.score_essay?.toString() ?? '',
      show_essay_details: Boolean(meta.essay_competencies),
      comp1: comp[0] ?? 160,
      comp2: comp[1] ?? 160,
      comp3: comp[2] ?? 160,
      comp4: comp[3] ?? 160,
      comp5: comp[4] ?? 160,
      user_tri_score: triVal,
      show_area_tri: Object.keys(areaTri).length > 0,
      tri_languages: areaTri.languages?.toString() ?? '',
      tri_humanities: areaTri.humanities?.toString() ?? '',
      tri_natural_sciences: areaTri.natural_sciences?.toString() ?? '',
      tri_math: areaTri.math?.toString() ?? '',
      custom_subjects: (meta.subjects_breakdown || []).map(b => ({
        subject_id: b.subject_id,
        subject_name: b.subject_name,
        questions_total: b.questions_total.toString(),
        questions_correct: b.questions_correct.toString(),
      })),
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este simulado?')) return;
    await supabase.from('simulations').delete().eq('id', id);
    if (selectedDetail?.id === id) setSelectedDetail(null);
    await refreshData();
  };

  // Sort and filter simulations
  const sortedSims = useMemo(() => {
    return [...simulations].sort((a, b) => b.simulation_date.localeCompare(a.simulation_date));
  }, [simulations]);

  const filteredSims = useMemo(() => {
    if (activeFilter === 'all') return sortedSims;
    return sortedSims.filter(s => {
      const { meta } = parseSimulationData(s);
      return (s.simulation_type || meta.type) === activeFilter;
    });
  }, [sortedSims, activeFilter]);

  // Aggregate statistics
  const stats = useMemo(() => {
    if (sortedSims.length === 0) {
      return { total: 0, bestScore: null, avgScore: null, totalQuestions: 0, totalCorrect: 0, avgAccuracy: 0, totalHours: 0 };
    }

    const simsWithScore = sortedSims.filter(s => s.total_score !== null && s.total_score !== undefined && s.total_score > 0);
    const bestScore = simsWithScore.length > 0 ? Math.max(...simsWithScore.map(s => s.total_score!)) : null;
    const avgScore = simsWithScore.length > 0
      ? Math.round((simsWithScore.reduce((a, s) => a + s.total_score!, 0) / simsWithScore.length) * 10) / 10
      : null;

    let totalQ = 0;
    let totalC = 0;
    let totalMinutes = 0;

    sortedSims.forEach(s => {
      const { meta } = parseSimulationData(s);
      if (meta.questions_total) totalQ += meta.questions_total;
      if (meta.questions_correct) totalC += meta.questions_correct;
      if (meta.duration_minutes) totalMinutes += meta.duration_minutes;
    });

    const avgAccuracy = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      total: sortedSims.length,
      bestScore,
      avgScore,
      totalQuestions: totalQ,
      totalCorrect: totalC,
      avgAccuracy,
      totalHours,
    };
  }, [sortedSims]);

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
              Simulados ENEM
            </h1>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
              Padrão 2026
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Registre 1º dia, 2º dia, áreas isoladas (45q) e simulado completo
          </p>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Novo simulado</span>
        </button>
      </div>

      {/* KPI Stats cards */}
      {sortedSims.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
            <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-white">
              {stats.total}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Simulados
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
            <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#6F00D6] dark:text-[#B379FF]">
              {stats.bestScore !== null ? stats.bestScore : '–'}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Melhor nota TRI
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
            <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#008E32] dark:text-[#19E85F]">
              {stats.avgAccuracy > 0 ? `${stats.avgAccuracy}%` : '–'}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Aproveitamento
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
            <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#D68200] dark:text-[#FFB84D]">
              {stats.totalHours > 0 ? `${stats.totalHours}h` : '–'}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Horas de prova
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="no-scrollbar mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {([
          { id: 'all', label: `Todos (${sortedSims.length})`, icon: null },
          { id: 'completo', label: 'Completo', icon: GraduationCap },
          { id: 'dia_1', label: '1º dia', icon: BookOpen },
          { id: 'dia_2', label: '2º dia', icon: FlaskConical },
          { id: 'area_unica', label: 'Área única', icon: Target },
          { id: 'personalizado', label: 'Personalizado', icon: Sliders },
        ] as const).map(f => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all',
                activeFilter === f.id
                  ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                  : 'border border-slate-200/80 bg-white text-[#645F78] hover:bg-slate-50 dark:border-white/5 dark:bg-[#151826] dark:text-[#9D96B8] dark:hover:bg-white/5',
              )}
            >
              {Icon && <Icon size={13} strokeWidth={2.4} />}
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Simulations List */}
      {filteredSims.length === 0 ? (
        <div className="flex flex-col items-center rounded-[24px] border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]">
            <ClipboardList size={26} strokeWidth={2.4} />
          </span>
          <h3 className="mb-1 font-display text-lg font-bold text-[#14102A] dark:text-white">
            Nenhum simulado nesta categoria
          </h3>
          <p className="mx-auto mb-5 max-w-sm text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
            Adicione simulados do ENEM (1º dia, 2º dia, áreas isoladas de 45 questões ou completo) para acompanhar sua evolução.
          </p>
          <button
            onClick={() => {
              setForm({
                ...emptyForm,
                simulation_type: activeFilter === 'all' ? 'completo' : activeFilter,
                simulation_date: new Date().toISOString().split('T')[0],
              });
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Adicionar simulado
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filteredSims.map(s => {
            const { cleanNotes, meta } = parseSimulationData(s);
            const simType = s.simulation_type || meta.type || 'completo';
            const typeInfo = SIM_TYPE_DETAILS[simType] || SIM_TYPE_DETAILS.completo;
            const targetAreaConfig = meta.target_area ? ENEM_AREAS.find(a => a.key === meta.target_area) : null;
            const durationTotal = s.duration_minutes ?? meta.duration_minutes ?? null;
            const hours = durationTotal ? Math.floor(durationTotal / 60) : 0;
            const mins = durationTotal ? durationTotal % 60 : 0;

            const TypeIcon = typeInfo.icon;
            const TargetAreaIcon = targetAreaConfig?.icon;

            // Compute correct questions count & pace
            const totalQ = meta.questions_total ?? (simType === 'dia_1' || simType === 'dia_2' ? 90 : simType === 'area_unica' ? 45 : 180);
            const correctQ = meta.questions_correct ?? null;
            const paceSec = durationTotal && totalQ > 0 ? Math.round((durationTotal * 60) / totalQ) : null;

            return (
              <div
                key={s.id}
                className="group rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/5 dark:bg-[#151826]"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6F00D6]/15 px-2.5 py-0.5 text-xs font-bold text-[#6F00D6] dark:text-[#B379FF]">
                        <TypeIcon size={12} strokeWidth={2.4} />
                        <span>{typeInfo.label}</span>
                      </span>

                      {targetAreaConfig && TargetAreaIcon && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#14102A] dark:bg-white/5 dark:text-white/80">
                          <TargetAreaIcon size={12} strokeWidth={2.4} />
                          <span>{targetAreaConfig.shortLabel}</span>
                        </span>
                      )}

                      {(s.exam_source || meta.exam_source) && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#645F78] dark:bg-white/5 dark:text-white/70">
                          {s.exam_source || meta.exam_source}
                        </span>
                      )}

                      {(s.perceived_difficulty || meta.difficulty) && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#645F78] dark:bg-white/5 dark:text-white/70">
                          Nível: {s.perceived_difficulty || meta.difficulty}
                        </span>
                      )}
                    </div>

                    <h3 className="truncate font-display text-lg sm:text-xl font-bold tracking-tight text-[#14102A] dark:text-white">
                      {s.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} strokeWidth={2.4} />
                        {formatLocalDateBR(s.simulation_date)}
                      </span>

                      {durationTotal !== null && durationTotal > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} strokeWidth={2.4} />
                          {hours > 0 ? `${hours}h ${mins}min` : `${mins}min`}
                          {paceSec ? ` (~${Math.floor(paceSec / 60)}m${paceSec % 60}s/q)` : ''}
                        </span>
                      )}

                      {correctQ !== null && totalQ > 0 && (
                        (() => {
                          const accPct = Math.round((correctQ / totalQ) * 100);
                          const colorCfg = getSimPercentageColor(accPct);
                          return (
                            <span className={cn('flex items-center gap-1 font-bold', colorCfg.text)}>
                              <CheckCircle2 size={13} strokeWidth={2.4} />
                              {correctQ}/{totalQ} acertos ({accPct}%)
                            </span>
                          );
                        })()
                      )}
                    </div>
                  </div>

                  {/* Nota TRI + ações */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-display text-2xl sm:text-3xl font-bold leading-none text-[#14102A] dark:text-white">
                        {s.total_score !== null && s.total_score !== undefined ? s.total_score : '–'}
                      </div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                        {s.total_score !== null && s.total_score !== undefined ? 'Nota TRI' : 'Sem TRI'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedDetail(s)}
                        title="Ver análise detalhada"
                        aria-label="Ver análise detalhada"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[#645F78] transition-colors hover:bg-slate-200 hover:text-[#14102A] dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <Info size={14} strokeWidth={2.4} />
                      </button>
                      <button
                        onClick={() => handleEdit(s)}
                        title="Editar simulado"
                        aria-label="Editar simulado"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[#645F78] transition-colors hover:bg-slate-200 hover:text-[#14102A] dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <Edit2 size={14} strokeWidth={2.4} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        title="Excluir simulado"
                        aria-label="Excluir simulado"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[#645F78] transition-colors hover:bg-rose-50 hover:text-rose-600 dark:bg-white/5 dark:text-white/60 dark:hover:bg-rose-500/20 dark:hover:text-rose-400"
                      >
                        <Trash2 size={14} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barra Geral de Aproveitamento do Simulado */}
                {totalQ > 0 && correctQ !== null && (
                  (() => {
                    const accPct = Math.round((correctQ / totalQ) * 100);
                    const colorCfg = getSimPercentageColor(accPct);
                    return (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-[#645F78] dark:text-[#9D96B8]">
                            Aproveitamento Geral do Simulado
                          </span>
                          <span className={cn('font-display font-bold', colorCfg.text)}>
                            {accPct}% · {colorCfg.label}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${accPct}%`,
                              background: colorCfg.hex,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Subject Bars Breakdown */}
                {simType === 'personalizado' && meta.subjects_breakdown && meta.subjects_breakdown.length > 0 ? (
                  <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-white/5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                        Matérias do Simulado ({meta.subjects_breakdown.length})
                      </span>
                      {totalQ > 0 && correctQ !== null && (
                        (() => {
                          const accPct = Math.round((correctQ / totalQ) * 100);
                          const colorCfg = getSimPercentageColor(accPct);
                          return (
                            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', colorCfg.lightBg, colorCfg.text)}>
                              {correctQ}/{totalQ} ({accPct}%)
                            </span>
                          );
                        })()
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {meta.subjects_breakdown.map((sb, sbIdx) => {
                        const sbPct = sb.questions_total > 0 ? Math.round((sb.questions_correct / sb.questions_total) * 100) : 0;
                        const sbColor = getSimPercentageColor(sbPct);
                        return (
                          <div
                            key={sbIdx}
                            className="flex flex-col justify-between rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-white/5 dark:bg-white/[0.03]"
                          >
                            <div className="truncate text-xs font-bold text-[#14102A] dark:text-white">
                              {sb.subject_name}
                            </div>
                            <div className="mt-1 flex items-baseline justify-between font-mono text-xs">
                              <span className="font-bold text-[#14102A] dark:text-white">
                                {sb.questions_correct}/{sb.questions_total}
                              </span>
                              <span className={cn('font-bold', sbColor.text)}>
                                {sbPct}%
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${sbPct}%`,
                                  background: sbColor.hex
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : simType === 'area_unica' && targetAreaConfig ? (
                  <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-white/5">
                    {(() => {
                      const a = targetAreaConfig;
                      const val = s[`score_${a.key}` as keyof Simulation] as number | null;
                      const isEssay = a.key === 'essay';
                      const maxVal = isEssay ? 1000 : 45;
                      const pct = val !== null && val !== undefined ? Math.min(100, (val / maxVal) * 100) : 0;
                      const areaTriVal = meta.area_tri?.[a.key];
                      const areaColorCfg = getSimPercentageColor(Math.round(pct));

                      const AreaIcon = a.icon;

                      return (
                        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03] sm:flex-row sm:items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              <AreaIcon size={20} strokeWidth={2.4} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-[#14102A] dark:text-white">{a.label}</div>
                              <div className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                                Área isolada · {isEssay ? 'Prova de redação' : '45 questões'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-auto">
                            <div className="text-right">
                              <div className="font-display text-base sm:text-lg font-bold text-[#14102A] dark:text-white">
                                {val !== null && val !== undefined ? `${val} ${isEssay ? 'pts' : '/ 45'}` : '–'}
                              </div>
                              {areaTriVal !== undefined && (
                                <div className="font-display text-xs font-bold text-[#6F00D6] dark:text-[#B379FF]">
                                  TRI: {areaTriVal}
                                </div>
                              )}
                            </div>
                            <div className="w-24 sm:w-28">
                              <div className="mb-1 flex justify-between text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">
                                <span>Aprov.</span>
                                <span className={cn('font-bold', areaColorCfg.text)}>{Math.round(pct)}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: areaColorCfg.hex }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3.5 dark:border-white/5 sm:grid-cols-3 lg:grid-cols-5">
                    {ENEM_AREAS.map((a, aIdx) => {
                      const AreaIcon = a.icon;
                      const val = s[`score_${a.key}` as keyof Simulation] as number | null;
                      const isApplicable =
                        simType === 'completo' ||
                        (simType === 'dia_1' && a.day === 1) ||
                        (simType === 'dia_2' && a.day === 2) ||
                        val !== null;

                      if (!isApplicable) {
                        return (
                          <div key={a.key} className="hidden rounded-xl border border-dashed border-slate-200 p-2.5 dark:border-white/10 sm:block">
                            <div className="flex items-center gap-1.5 truncate text-[11px] font-bold text-[#645F78] dark:text-white/40">
                              <AreaIcon size={12} strokeWidth={2.2} /> {a.shortLabel}
                            </div>
                            <div className="mt-1 text-[11px] font-medium italic text-[#645F78]/70 dark:text-white/30">Não se aplica</div>
                          </div>
                        );
                      }

                      const isEssay = a.key === 'essay';
                      const maxVal = isEssay ? 1000 : 45;
                      const pct = val !== null && val !== undefined ? Math.min(100, (val / maxVal) * 100) : 0;
                      const areaTriVal = meta.area_tri?.[a.key];
                      const areaColorCfg = getSimPercentageColor(Math.round(pct));

                      return (
                        <div
                          key={a.key}
                          className={cn(
                            'flex flex-col justify-between rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-white/5 dark:bg-white/[0.03]',
                            simType === 'completo' && aIdx === 4 ? 'col-span-2 sm:col-span-1' : ''
                          )}
                        >
                          <div className="mb-1 flex items-center justify-between gap-1 text-[11px] font-bold text-[#14102A] dark:text-white">
                            <span className="flex flex-1 items-center gap-1.5 truncate">
                              <AreaIcon size={12} strokeWidth={2.2} />
                              <span>{a.shortLabel}</span>
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-[#645F78] dark:text-white/40">{isEssay ? '1000' : '45q'}</span>
                          </div>
                          <div className="flex items-baseline gap-1 font-display text-base font-bold leading-none text-[#14102A] dark:text-white">
                            {val !== null && val !== undefined ? val : '–'}
                            {val !== null && (
                              <span className="font-sans text-[11px] font-semibold text-[#645F78] dark:text-white/50">
                                {isEssay ? 'pts' : 'acertos'}
                              </span>
                            )}
                          </div>
                          {areaTriVal !== undefined && (
                            <div className="mt-0.5 font-display text-[11px] font-bold text-[#6F00D6] dark:text-[#B379FF]">TRI: {areaTriVal}</div>
                          )}
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: areaColorCfg.hex }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Notes and error tags */}
                {(cleanNotes || (meta.error_reasons && meta.error_reasons.length > 0)) && (
                  <div className="mt-3.5 flex flex-col gap-1.5 border-t border-slate-100 pt-3 dark:border-white/5">
                    {meta.error_reasons && meta.error_reasons.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-[#645F78] dark:text-[#9D96B8]">Pontos de atenção:</span>
                        {meta.error_reasons.map((r, i) => (
                          <span key={i} className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                    {cleanNotes && (
                      <p className="line-clamp-2 text-xs font-medium italic text-[#645F78] dark:text-white/60">
                        “{cleanNotes}”
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo / Editar Simulado */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setForm(emptyForm);
        }}
        title={form.id ? 'Editar Simulado' : 'Novo Simulado ENEM'}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <div className="hidden text-xs font-bold text-[#645F78] dark:text-[#9D96B8] sm:block">
              {parsedFormStats.totalQuestions > 0
                ? `${parsedFormStats.totalCorrect}/${parsedFormStats.totalQuestions} acertos (${parsedFormStats.accuracyPct}%)`
                : ''}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setForm(emptyForm);
                }}
                className="rounded-full border border-slate-200/80 bg-white px-5 py-2.5 text-xs font-bold text-[#14102A] transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#00D64B] px-6 py-2.5 text-xs font-bold text-[#14102A] shadow-xs transition-all hover:bg-[#19E85F] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Salvando…' : 'Salvar simulado'}
              </button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* 1. Modalidade de Simulado (ENEM) */}
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              1. Modalidade do simulado *
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {(['completo', 'dia_1', 'dia_2', 'area_unica', 'personalizado'] as SimulationType[]).map(typeKey => {
                const item = SIM_TYPE_DETAILS[typeKey];
                const ItemIcon = item.icon;
                const isSelected = form.simulation_type === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        simulation_type: typeKey,
                      }));
                    }}
                    className={cn(
                      'rounded-2xl border p-3 text-left transition-all',
                      isSelected
                        ? 'border-[#00D64B] bg-[#00D64B]/10 text-[#14102A] shadow-xs dark:bg-[#00D64B]/15 dark:text-white'
                        : 'border-slate-200/80 bg-white text-[#14102A] hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10',
                    )}
                  >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-[#6F00D6] dark:text-[#B379FF]">
                      <ItemIcon size={17} strokeWidth={2.4} />
                    </div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className={cn('mt-1 line-clamp-2 text-[11px] font-medium', isSelected ? 'text-[#14102A]/80 dark:text-white/80' : 'text-[#645F78] dark:text-[#9D96B8]')}>
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor específico caso seja Área Única */}
          {form.simulation_type === 'area_unica' && (
            <div className="animate-fade-in rounded-2xl border border-[#6F00D6]/20 bg-[#6F00D6]/5 p-3.5 dark:border-[#6F00D6]/30 dark:bg-[#6F00D6]/10">
              <span className="mb-2 block text-xs font-bold text-[#14102A] dark:text-white">
                Qual área única do ENEM você realizou?
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {ENEM_AREAS.map(a => {
                  const AreaBtnIcon = a.icon;
                  const isAreaSelected = form.target_area === a.key;
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, target_area: a.key as SimulationTargetArea }))}
                      className={cn(
                        'rounded-xl border p-2.5 text-center transition-all',
                        isAreaSelected
                          ? 'border-[#6F00D6] bg-[#6F00D6] text-white shadow-xs'
                          : 'border-slate-200/80 bg-white text-[#14102A] hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10',
                      )}
                    >
                      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10">
                        <AreaBtnIcon size={15} strokeWidth={2.4} />
                      </div>
                      <div className="mt-0.5 truncate text-xs font-bold">{a.shortLabel}</div>
                      <div className={cn('text-[11px] font-medium', isAreaSelected ? 'text-white/80' : 'text-[#645F78] dark:text-[#9D96B8]')}>
                        {a.key === 'essay' ? '1000 pts' : '45 questões'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Informações Gerais: Título, Data, Tempo, Origem */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Título / Identificação do Simulado *
              </label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input text-sm"
                placeholder="Ex: Simulado SAS #3 2025 - 1º Dia"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Data de Realização
              </label>
              <input
                type="date"
                value={form.simulation_date}
                onChange={e => setForm({ ...form, simulation_date: e.target.value })}
                className="input text-sm"
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, simulation_date: getLocalDateString() }))}
                  className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setForm(prev => ({ ...prev, simulation_date: getLocalDateString(d) }));
                  }}
                  className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  Ontem
                </button>
              </div>
            </div>
          </div>

          {/* Tempo de Realização & Banca/Origem */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock size={13} className="text-brand-600" />
                  Tempo de Realização (Duração)
                </label>
                <button
                  type="button"
                  onClick={applyOfficialTime}
                  className="text-[0.65rem] font-bold text-brand-600 hover:underline"
                >
                  Preencher tempo oficial ENEM
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={form.duration_hours}
                    onChange={e => setForm({ ...form, duration_hours: e.target.value })}
                    className="input text-sm pr-7"
                    placeholder="0"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">h</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={form.duration_minutes}
                    onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
                    className="input text-sm pr-9"
                    placeholder="00"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">min</span>
                </div>
              </div>
              {parsedFormStats.totalDurationMinutes > 0 && parsedFormStats.totalQuestions > 0 && (
                <div className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  ⏱️ Ritmo médio: ~{Math.floor(parsedFormStats.paceSeconds / 60)}m{parsedFormStats.paceSeconds % 60}s por questão
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Banca / Origem do Simulado
              </label>
              <input
                list="bancas-list"
                value={form.exam_source}
                onChange={e => setForm({ ...form, exam_source: e.target.value })}
                className="input text-sm"
                placeholder="Ex: SAS, Bernoulli, ENEM Oficial..."
              />
              <datalist id="bancas-list">
                {SUGGESTED_SOURCES.map((s, idx) => (
                  <option key={idx} value={s} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 3. Matérias do Simulado */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            {form.simulation_type === 'personalizado' ? (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BookOpen size={15} className="text-pato" />
                    3. Matérias do Simulado Personalizado *
                  </label>
                  <p className="text-[11px] font-semibold text-muted dark:text-papel/60 mt-0.5">
                    Defina as matérias presentes no simulado e informe as questões e acertos de cada uma individualmente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAllSubjects}
                  className="rounded-full border border-slate-200/90 bg-white dark:border-white/10 dark:bg-white/5 px-3 py-1 text-xs font-bold text-[#14102A] dark:text-white hover:bg-slate-50 shrink-0 transition-colors"
                >
                  <Plus size={12} strokeWidth={2.4} className="inline mr-1" />
                  Adicionar todas do edital ({subjects.length})
                </button>
              </div>

              {/* Seletor rápido para adicionar matéria */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-3 p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.02]">
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) {
                      const s = subjects.find(sub => sub.id === e.target.value);
                      if (s) handleAddCustomSubject(s.id, s.name);
                    }
                  }}
                  className="input text-xs font-bold py-2 flex-1 min-w-[180px]"
                >
                  <option value="">+ Selecionar matéria do edital...</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.area})
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    value={newSubjectInput}
                    onChange={e => setNewSubjectInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                    placeholder="Ou nome personalizado..."
                    className="input text-xs py-2 min-w-[140px] flex-1 sm:flex-initial"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSubject()}
                    className="inline-flex items-center justify-center rounded-full bg-[#00D64B] px-4 py-2 text-xs font-bold text-[#14102A] shadow-xs hover:bg-[#19E85F] transition-all shrink-0"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de matérias adicionadas */}
              {form.custom_subjects.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.01]">
                  <p className="text-xs font-semibold text-[#645F78] dark:text-[#9D96B8] mb-2">
                    Nenhuma matéria adicionada a este simulado ainda.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddAllSubjects}
                    className="inline-flex items-center justify-center rounded-full bg-[#00D64B] px-4 py-2 text-xs font-bold text-[#14102A] shadow-xs hover:bg-[#19E85F] transition-all"
                  >
                    Adicionar todas as {subjects.length} matérias do edital
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="hidden sm:grid grid-cols-12 gap-2 px-2 text-[11px] font-bold uppercase text-[#645F78] dark:text-[#9D96B8]">
                    <span className="col-span-5">Matéria</span>
                    <span className="col-span-3 text-center">Total Questões</span>
                    <span className="col-span-3 text-center">Acertos</span>
                    <span className="col-span-1 text-center">Ações</span>
                  </div>

                  {form.custom_subjects.map((cs, idx) => {
                    const qTot = parseInt(cs.questions_total) || 0;
                    const qCor = parseInt(cs.questions_correct) || 0;
                    const pct = qTot > 0 ? Math.min(100, Math.round((qCor / qTot) * 100)) : 0;
                    const matchedSub = subjects.find(s => s.id === cs.subject_id || s.name.toLowerCase() === cs.subject_name.toLowerCase());

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 rounded-xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <div className="sm:col-span-5 flex items-center gap-2 min-w-0">
                          <span
                            className="h-3.5 w-3.5 rounded-full shrink-0"
                            style={{ background: matchedSub?.color || '#00D64B' }}
                          />
                          <input
                            value={cs.subject_name}
                            onChange={e => handleUpdateCustomSubject(idx, 'subject_name', e.target.value)}
                            placeholder="Nome da matéria"
                            className="input text-xs font-bold py-1 px-2 border-none bg-transparent shadow-none"
                          />
                        </div>

                        <div className="sm:col-span-3 flex items-center justify-between sm:justify-center gap-2">
                          <span className="text-xs font-bold text-[#645F78] dark:text-[#9D96B8] sm:hidden">Total:</span>
                          <div className="relative w-full max-w-[120px]">
                            <input
                              type="number"
                              min="1"
                              max="200"
                              value={cs.questions_total}
                              onChange={e => handleUpdateCustomSubject(idx, 'questions_total', e.target.value)}
                              className="input text-center text-xs font-bold font-mono py-1 pr-6"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted font-bold">q</span>
                          </div>
                        </div>

                        <div className="sm:col-span-3 flex items-center justify-between sm:justify-center gap-2">
                          <span className="text-xs font-bold text-[#645F78] dark:text-[#9D96B8] sm:hidden">Acertos:</span>
                          <div className="relative w-full max-w-[120px]">
                            <input
                              type="number"
                              min="0"
                              max={qTot || 200}
                              value={cs.questions_correct}
                              onChange={e => handleUpdateCustomSubject(idx, 'questions_correct', e.target.value)}
                              className="input text-center text-xs font-bold font-mono py-1 pr-6"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted font-bold">✓</span>
                          </div>
                          <span className={cn('text-xs font-mono font-bold shrink-0 w-11 text-right', pct >= 70 ? 'text-emerald-600 dark:text-[#00D64B]' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500')}>
                            {pct}%
                          </span>
                        </div>

                        <div className="sm:col-span-1 flex justify-end sm:justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSubject(idx)}
                            aria-label={`Remover ${cs.subject_name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/80 text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:border-white/10 dark:hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={13} strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Barra de totalizador do Simulado Personalizado */}
                  <div className="mt-1 flex items-center justify-between p-3.5 rounded-xl border border-[#00D64B]/30 bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Total ({form.custom_subjects.length} {form.custom_subjects.length === 1 ? 'matéria' : 'matérias'})
                    </span>
                    <span className="font-mono text-sm font-bold">
                      {parsedFormStats.totalCorrect} / {parsedFormStats.totalQuestions} questões acertadas ({parsedFormStats.accuracyPct}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. Acertos nas Áreas do ENEM
                </label>
                <span className="text-[0.7rem] text-slate-400">
                  Padrão ENEM: 45 questões por área
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {ENEM_AREAS.map(a => {
                  const isApplicable =
                    form.simulation_type === 'completo' ||
                    (form.simulation_type === 'dia_1' && a.day === 1) ||
                    (form.simulation_type === 'dia_2' && a.day === 2) ||
                    (form.simulation_type === 'area_unica' && form.target_area === a.key);

                  if (!isApplicable) return null;

                  const isEssay = a.key === 'essay';
                  const fieldKey = `score_${a.key}` as keyof FormState;
                  const currentVal = form[fieldKey] as string;

                  const AreaFieldIcon = a.icon;

                  return (
                    <div
                      key={a.key}
                      className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <AreaFieldIcon size={13} strokeWidth={2.4} />
                          <span>{a.shortLabel}</span>
                        </label>
                        <span className="text-[0.65rem] text-slate-400 font-mono">
                          {isEssay ? '0 a 1000 pts' : 'de 45 questões'}
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          step={isEssay ? '10' : '1'}
                          min="0"
                          max={isEssay ? 1000 : 45}
                          value={currentVal}
                          onChange={e => setForm({ ...form, [fieldKey]: e.target.value })}
                          className="input text-base font-bold font-mono text-center pr-12"
                          placeholder={isEssay ? '0 - 1000' : '0 - 45'}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          {isEssay ? 'pts' : '/ 45'}
                        </span>
                      </div>

                      {/* Essay Competencies Accordion button */}
                      {isEssay && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, show_essay_details: !prev.show_essay_details }))}
                          className="text-[0.7rem] font-bold text-pink-600 dark:text-pink-400 hover:underline mt-2 flex items-center gap-1"
                        >
                          {form.show_essay_details ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {form.show_essay_details ? 'Ocultar competências' : 'Detalhar as 5 Competências do ENEM'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

            {/* Redação: 5 Competências do ENEM (C1 a C5: 0 a 200 pontos cada) */}
            {form.show_essay_details && (form.simulation_type === 'completo' || form.simulation_type === 'dia_1' || (form.simulation_type === 'area_unica' && form.target_area === 'essay')) && (
              <div className="mt-3 p-3.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-500/20 animate-fade-in">
                <div className="font-bold text-xs text-pink-900 dark:text-pink-200 mb-2">
                  Competências Oficiais do ENEM (0 a 200 pontos cada):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'comp1' as const, label: 'C1: Norma culta' },
                    { key: 'comp2' as const, label: 'C2: Tema e repertório' },
                    { key: 'comp3' as const, label: 'C3: Argumentação' },
                    { key: 'comp4' as const, label: 'C4: Coesão textual' },
                    { key: 'comp5' as const, label: 'C5: Proposta intervenção' },
                  ].map((comp, idx) => (
                    <div key={comp.key} className={idx === 4 ? 'col-span-2 sm:col-span-1' : ''}>
                      <label className="block text-[0.65rem] font-semibold text-slate-600 dark:text-slate-300 mb-1 truncate">
                        {comp.label}
                      </label>
                      <select
                        value={form[comp.key]}
                        onChange={e => handleCompChange(comp.key, parseInt(e.target.value))}
                        className="input text-xs font-mono font-bold py-1.5 px-2"
                      >
                        {[200, 160, 120, 80, 40, 0].map(val => (
                          <option key={val} value={val}>
                            {val} pts
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Nota TRI (Inserida pelo usuário se houver) */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Award size={15} className="text-amber-500" />
                  4. Nota TRI (Opcional - se houver)
                </label>
                <p className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5">
                  Se a sua banca ou simulado calculou a TRI, insira sua nota aqui. Se ainda não tiver, pode deixar em branco.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                    Nota TRI Geral / Média do Simulado
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1000"
                      value={form.user_tri_score}
                      onChange={e => setForm({ ...form, user_tri_score: e.target.value })}
                      className="input text-base font-bold font-mono pr-12 bg-white dark:bg-surface-dark border-amber-300 dark:border-amber-500/40"
                      placeholder="Ex: 754.8 (opcional)"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      pts
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, show_area_tri: !prev.show_area_tri }))}
                    className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                  >
                    {form.show_area_tri ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {form.show_area_tri ? 'Ocultar TRIs por Área' : 'Informar TRI individual de cada área'}
                  </button>
                  <span className="text-[0.65rem] text-slate-400 mt-0.5">
                    {form.user_tri_score ? `Nota registrada: ${form.user_tri_score} pts` : 'Sem TRI calculada'}
                  </span>
                </div>
              </div>

              {/* Informar TRI específica de cada área */}
              {form.show_area_tri && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-500/20 animate-fade-in">
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-1">
                    <span className="text-[0.7rem] font-bold text-amber-900 dark:text-amber-200">
                      Notas TRI por Área (boletim detalhado):
                    </span>
                    <button
                      type="button"
                      onClick={calculateAverageTriFromAreas}
                      className="text-[0.65rem] font-bold text-amber-700 dark:text-amber-300 hover:underline"
                    >
                      Calcular média simples das TRIs preenchidas
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="flex items-center gap-1 text-[0.65rem] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <BookOpen size={11} className="text-blue-500" strokeWidth={2.4} /> TRI Linguagens
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1000"
                        value={form.tri_languages}
                        onChange={e => setForm({ ...form, tri_languages: e.target.value })}
                        className="input text-xs font-mono py-1.5"
                        placeholder="Ex: 670.5"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-[0.65rem] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <Landmark size={11} className="text-amber-500" strokeWidth={2.4} /> TRI Humanas
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1000"
                        value={form.tri_humanities}
                        onChange={e => setForm({ ...form, tri_humanities: e.target.value })}
                        className="input text-xs font-mono py-1.5"
                        placeholder="Ex: 715.0"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-[0.65rem] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <FlaskConical size={11} className="text-emerald-500" strokeWidth={2.4} /> TRI Natureza
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1000"
                        value={form.tri_natural_sciences}
                        onChange={e => setForm({ ...form, tri_natural_sciences: e.target.value })}
                        className="input text-xs font-mono py-1.5"
                        placeholder="Ex: 685.2"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-[0.65rem] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <Calculator size={11} className="text-purple-500" strokeWidth={2.4} /> TRI Matemática
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1000"
                        value={form.tri_math}
                        onChange={e => setForm({ ...form, tri_math: e.target.value })}
                        className="input text-xs font-mono py-1.5"
                        placeholder="Ex: 840.4"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumo de Acertos do Simulado */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="text-emerald-500" size={22} />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Resumo de Acertos do Simulado
                </div>
                <div className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                  {parsedFormStats.totalQuestions > 0
                    ? `${parsedFormStats.totalCorrect} de ${parsedFormStats.totalQuestions} questões acertadas`
                    : 'Preencha o número de acertos das áreas'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl md:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {parsedFormStats.totalQuestions > 0 ? `${parsedFormStats.accuracyPct}%` : '-'}
              </div>
              <div className="text-[0.65rem] text-slate-400 font-semibold uppercase">
                {form.user_tri_score ? `TRI: ${form.user_tri_score} pts` : 'Sem TRI'}
              </div>
            </div>
          </div>

          {/* 5. Dificuldade & Diagnóstico de Erros */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Dificuldade Percebida
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { value: 'facil', label: 'Fácil' },
                    { value: 'medio', label: 'Média' },
                    { value: 'dificil', label: 'Difícil' },
                    { value: 'muito_dificil', label: 'Extrema' },
                  ].map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, perceived_difficulty: d.value as any }))}
                      className={cn(
                        'rounded-xl border py-2 text-xs font-bold transition-all',
                        form.perceived_difficulty === d.value
                          ? 'border-2 border-[#00D64B] bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F] shadow-xs'
                          : 'border-slate-200/90 bg-white text-[#645F78] hover:border-slate-300 hover:text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:text-white',
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Pontos de Atenção / Causas de Erro (Tags)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ERROR_TAGS.map(tag => {
                    const selected = form.error_reasons.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleErrorTag(tag)}
                        className={cn(
                          'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                          selected
                            ? 'border-amber-400 bg-amber-500/15 text-[#D68200] dark:border-amber-500/30 dark:text-[#FFB84D] font-bold shadow-xs'
                            : 'border-slate-200/80 bg-white text-[#645F78] hover:border-slate-300 hover:text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:text-white',
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Observações, Estratégia Adotada e Lições
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="input resize-none text-xs"
                placeholder="Ex: Comecei por redação (1h15), depois fiz 30 questões de Humanas. Faltou tempo no final para Matemática..."
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Detalhes do Simulado */}
      <Modal
        open={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        title={selectedDetail ? `Análise: ${selectedDetail.title}` : 'Detalhes do Simulado'}
        size="md"
        footer={
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => {
                if (selectedDetail) {
                  handleEdit(selectedDetail);
                  setSelectedDetail(null);
                }
              }}
              className="btn-secondary px-3.5 py-1.5 text-xs gap-1.5"
            >
              <Edit2 size={13} /> Editar Dados
            </button>
            <button onClick={() => setSelectedDetail(null)} className="btn-primary px-4 py-1.5 text-xs">
              Fechar
            </button>
          </div>
        }
      >
        {(() => {
          if (!selectedDetail) return null;
          const { cleanNotes, meta } = parseSimulationData(selectedDetail);
          const simType = selectedDetail.simulation_type || meta.type || 'completo';
          const typeInfo = SIM_TYPE_DETAILS[simType] || SIM_TYPE_DETAILS.completo;
          const duration = selectedDetail.duration_minutes ?? meta.duration_minutes;
          const hours = duration ? Math.floor(duration / 60) : 0;
          const mins = duration ? duration % 60 : 0;
          const totalQ = meta.questions_total ?? (simType === 'dia_1' || simType === 'dia_2' ? 90 : simType === 'area_unica' ? 45 : 180);
          const correctQ = meta.questions_correct;

          return (
            <div className="flex flex-col gap-4 text-sm">
              {/* Header tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const ModalTypeIcon = typeInfo.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${typeInfo.badgeColor}`}>
                      <ModalTypeIcon size={12} strokeWidth={2.4} />
                      <span>{typeInfo.label}</span>
                    </span>
                  );
                })()}
                {(selectedDetail.exam_source || meta.exam_source) && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    {selectedDetail.exam_source || meta.exam_source}
                  </span>
                )}
                {(selectedDetail.perceived_difficulty || meta.difficulty) && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-500">
                    Dificuldade: {selectedDetail.perceived_difficulty || meta.difficulty}
                  </span>
                )}
              </div>

              {/* Top Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-semibold uppercase">Data</div>
                  <div className="font-bold font-mono text-xs mt-0.5">
                    {formatLocalDateBR(selectedDetail.simulation_date)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-semibold uppercase">Tempo Gasto</div>
                  <div className="font-bold font-mono text-xs mt-0.5">
                    {duration ? `${hours}h ${mins}m` : 'Não reg.'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-semibold uppercase">Acertos</div>
                  <div className="font-bold font-mono text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {correctQ !== null && correctQ !== undefined && totalQ > 0
                      ? `${correctQ}/${totalQ} (${Math.round((correctQ / totalQ) * 100)}%)`
                      : totalQ > 0 ? `${totalQ} questões` : '-'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-semibold uppercase">Nota TRI</div>
                  <div className="font-bold font-mono text-sm text-brand-600 mt-0.5">
                    {selectedDetail.total_score !== null && selectedDetail.total_score !== undefined ? `${selectedDetail.total_score} pts` : 'Não informada'}
                  </div>
                </div>
              </div>

              {/* Desempenho por Matéria ou por Área */}
              {simType === 'personalizado' && meta.subjects_breakdown && meta.subjects_breakdown.length > 0 ? (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Desempenho por Matéria ({meta.subjects_breakdown.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {meta.subjects_breakdown.map((sb, sbIdx) => {
                      const sbPct = sb.questions_total > 0 ? Math.round((sb.questions_correct / sb.questions_total) * 100) : 0;
                      const sbColor = getSimPercentageColor(sbPct);
                      return (
                        <div key={sbIdx} className="p-2.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-tinta dark:text-papel truncate">{sb.subject_name}</span>
                            <span className={cn('font-mono text-xs font-bold shrink-0 ml-2', sbColor.text)}>
                              {sb.questions_correct}/{sb.questions_total} ({sbPct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${sbPct}%`, background: sbColor.hex }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Desempenho por Área</h4>
                  <div className="flex flex-col gap-2">
                    {ENEM_AREAS.map(a => {
                      const val = selectedDetail[`score_${a.key}` as keyof Simulation] as number | null;
                      if (val === null || val === undefined) return null;
                      const isEssay = a.key === 'essay';
                      const maxVal = isEssay ? 1000 : 45;
                      const pct = Math.min(100, Math.round((val / maxVal) * 100));
                      const areaColorCfg = getSimPercentageColor(pct);
                      const areaTriVal = meta.area_tri?.[a.key];

                      const AreaRowIcon = a.icon;

                      return (
                        <div key={a.key} className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                <AreaRowIcon size={13} strokeWidth={2.4} />
                              </span>
                              <span className="font-semibold text-xs">{a.label}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-bold text-xs sm:text-sm">
                                {val} {isEssay ? 'pts' : 'acertos / 45'}
                              </span>
                              <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', areaColorCfg.lightBg, areaColorCfg.text)}>
                                {pct}%
                              </span>
                              {areaTriVal !== undefined && (
                                <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 font-semibold">
                                  TRI: {areaTriVal}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: areaColorCfg.hex }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Redação competências se houver */}
              {meta.essay_competencies && (
                <div className="p-3 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/50">
                  <div className="font-bold text-xs text-pink-900 dark:text-pink-200 mb-1.5">
                    Competências da Redação
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
                    {meta.essay_competencies.map((c, i) => (
                      <div key={i} className="p-1 rounded bg-white dark:bg-surface-dark">
                        <div className="text-[0.6rem] text-slate-400 font-sans">C{i + 1}</div>
                        <div className="font-bold">{c}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pontos de atenção */}
              {meta.error_reasons && meta.error_reasons.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">
                    Pontos de Atenção Diagnosticados
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {meta.error_reasons.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 font-semibold"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              {cleanNotes && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">Observações</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-white/5 p-3 rounded-lg">
                    {cleanNotes}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
