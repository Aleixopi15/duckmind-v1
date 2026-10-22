import { useState, useEffect } from 'react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import DuckMascot from './DuckMascot';
import { CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../lib/theme';

import type { StudyType } from '../lib/supabase';

type SessionForm = {
  subject_id: string;
  topic_id: string;
  study_type: StudyType;
  flashcards_count: string;
  studied_at: string;
  duration_hours: string;
  duration_minutes: string;
  duration_seconds: string;
  questions_correct: string;
  questions_wrong: string;
  notes: string;
};

const emptyForm: SessionForm = {
  subject_id: '', topic_id: '',
  study_type: 'teoria', flashcards_count: '',
  studied_at: new Date().toISOString().split('T')[0],
  duration_hours: '', duration_minutes: '', duration_seconds: '',
  questions_correct: '', questions_wrong: '', notes: '',
};

export const STUDY_TYPES: { value: StudyType; label: string; emoji: string }[] = [
  { value: 'teoria', label: 'Teoria', emoji: '📖' },
  { value: 'questoes', label: 'Questões', emoji: '✏️' },
  { value: 'revisao', label: 'Revisão', emoji: '🔄' },
  { value: 'flashcards', label: 'Flashcards', emoji: '🗂️' },
];

export function studyTypeLabel(type: StudyType): string {
  return STUDY_TYPES.find(t => t.value === type)?.label ?? type;
}

export function studyTypeEmoji(type: StudyType): string {
  return STUDY_TYPES.find(t => t.value === type)?.emoji ?? '📚';
}

export function studyTypeColor(type: StudyType): string {
  switch (type) {
    case 'teoria': return 'bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]';
    case 'questoes': return 'bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]';
    case 'revisao': return 'bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#9B3DFF]';
    case 'flashcards': return 'bg-gray-100 text-tinta dark:bg-white/10 dark:text-texto';
    default: return 'bg-gray-100 text-tinta dark:bg-white/10 dark:text-texto';
  }
}

export function minutesToHMS(totalMinutes: number) {
  const totalSeconds = Math.round(totalMinutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h: String(h), m: String(m), s: String(s) };
}

export function hmsToMinutes(h: string, m: string, s: string) {
  return Math.round((parseInt(h) || 0) * 60 + (parseInt(m) || 0) + (parseInt(s) || 0) / 60);
}

export function formatDuration(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  const s = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type Props = { open: boolean; onClose: () => void; initialMinutes?: number };

export default function LogStudyDialog({ open, onClose, initialMinutes = 0 }: Props) {
  const { subjects, topics, refreshData, updateStreak, user } = useApp();
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  useEffect(() => {
    if (open && initialMinutes > 0) {
      const hms = minutesToHMS(initialMinutes);
      setForm(f => ({ ...f, duration_hours: hms.h, duration_minutes: hms.m, duration_seconds: hms.s }));
    } else if (open) {
      setForm(emptyForm); setError('');
    }
  }, [open, initialMinutes]);

  const filteredTopics = topics.filter(t => t.subject_id === form.subject_id);

  const handleSave = async () => {
    const totalMins = hmsToMinutes(form.duration_hours, form.duration_minutes, form.duration_seconds);
    if (!form.subject_id) { setError('Selecione a matéria.'); return; }
    if (totalMins <= 0) { setError('Informe um tempo de estudo válido.'); return; }
    if (form.study_type === 'flashcards' && (parseInt(form.flashcards_count) || 0) <= 0) { setError('Informe quantos flashcards foram estudados.'); return; }
    setError(''); setSaving(true);

    const qCorrect = parseInt(form.questions_correct) || 0;
    const qWrong = parseInt(form.questions_wrong) || 0;

    const payload = {
      ...(user?.id ? { user_id: user.id } : {}),
      subject_id: form.subject_id,
      topic_id: form.topic_id || null,
      study_type: form.study_type,
      duration_minutes: totalMins,
      questions_correct: qCorrect,
      questions_wrong: qWrong,
      flashcards_count: form.study_type === 'flashcards' ? (parseInt(form.flashcards_count) || 0) : 0,
      notes: form.notes.trim() || null,
      studied_at: `${form.studied_at}T12:00:00`,
    };

    const { error: insertErr } = await supabase.from('study_sessions').insert(payload);
    if (insertErr) {
      setError(insertErr.message); setSaving(false); return;
    }

    const xp = Math.round(totalMins * 1.5 + qCorrect * 5 + (form.study_type === 'flashcards' ? (parseInt(form.flashcards_count) || 0) * 0.5 : 0));
    setEarnedXp(xp);
    setSuccess(true);
    setSaving(false);
    await refreshData();
    await updateStreak();
    setTimeout(() => { setSuccess(false); onClose(); }, 1400);
  };

  const totalMinsDisplay = hmsToMinutes(form.duration_hours, form.duration_minutes, form.duration_seconds);

  if (success) {
    return (
      <Modal open={open} onClose={() => {}} size="sm">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <DuckMascot size={80} mood="celebrating" animate showAccessoryBadge />
          <div className="flex items-center gap-2 font-display text-xl font-bold text-tinta dark:text-texto">
            <CheckCircle2 size={20} strokeWidth={2.8} className="text-[#00D64B] dark:text-[#19E85F]" />
            Sessão registrada!
          </div>
          {earnedXp > 0 && (
            <div className="inline-flex animate-scale-in items-center gap-1.5 rounded-full bg-amber-500/15 px-3.5 py-1 font-display text-xs font-bold text-[#D68200] dark:text-[#FFB84D]">
              <Zap size={14} strokeWidth={2.8} /> +{earnedXp} XP ganhos!
            </div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerLeft={<DuckMascot size={26} mood="happy" />}
      title="Registrar Estudo"
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 hover:bg-slate-200 text-[#14102A] dark:bg-[#1E1B2E] dark:text-white dark:hover:bg-[#28243D] px-7 py-2.5 text-sm font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] font-bold px-7 py-2.5 text-sm shadow-[0_4px_16px_rgba(0,214,75,0.35)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar sessão'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Tipo de Estudo (pílulas fiéis aos anexos: sem emoji, estilo cápsula moderna) */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Tipo de estudo *
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STUDY_TYPES.map(t => {
              const active = form.study_type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, study_type: t.value }))}
                  className={cn(
                    'rounded-2xl py-2.5 px-3 font-display text-xs sm:text-sm font-bold transition-all text-center',
                    active
                      ? 'bg-[#00D64B] text-[#14102A] shadow-[0_4px_14px_rgba(0,214,75,0.3)]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 dark:bg-[#1E1B2E] dark:text-slate-200 dark:hover:bg-[#28243D]'
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data e Matéria */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="log-data" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Data do estudo *
            </label>
            <input
              id="log-data"
              type="date"
              value={form.studied_at}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, studied_at: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="log-materia" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Matéria *
            </label>
            <select
              id="log-materia"
              value={form.subject_id}
              onChange={e => setForm(f => ({ ...f, subject_id: e.target.value, topic_id: '' }))}
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white"
            >
              <option value="">Selecione…</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tópico (opcional) */}
        <div>
          <label htmlFor="log-topico" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Tópico <span className="font-normal opacity-70">(opcional)</span>
          </label>
          <select
            id="log-topico"
            value={form.topic_id}
            onChange={e => setForm(f => ({ ...f, topic_id: e.target.value }))}
            disabled={!form.subject_id}
            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white disabled:opacity-50"
          >
            <option value="">Nenhum</option>
            {filteredTopics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Tempo de Estudo */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Tempo de estudo *
            </label>
            <span className="rounded-full bg-[#6F00D6]/15 dark:bg-[#6F00D6]/30 px-3 py-0.5 font-display text-xs font-bold text-[#6F00D6] dark:text-[#B26BFF]">
              {formatDuration(totalMinsDisplay)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <input
              type="number"
              min={0}
              max={99}
              placeholder="HH"
              value={form.duration_hours}
              aria-label="Horas"
              onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/70 py-3 text-center font-display text-base font-bold text-[#14102A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white"
            />
            <input
              type="number"
              min={0}
              max={59}
              placeholder="MM"
              value={form.duration_minutes}
              aria-label="Minutos"
              onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/70 py-3 text-center font-display text-base font-bold text-[#14102A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white"
            />
            <input
              type="number"
              min={0}
              max={59}
              placeholder="SS"
              value={form.duration_seconds}
              aria-label="Segundos"
              onChange={e => setForm(f => ({ ...f, duration_seconds: e.target.value }))}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/70 py-3 text-center font-display text-base font-bold text-[#14102A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white"
            />
          </div>
        </div>

        {form.study_type === 'flashcards' ? (
          <div>
            <label htmlFor="log-cards" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Flashcards estudados *
            </label>
            <input
              id="log-cards"
              type="number"
              min={1}
              value={form.flashcards_count}
              onChange={e => setForm(f => ({ ...f, flashcards_count: e.target.value }))}
              placeholder="Ex: 40"
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white"
            />
            <p className="mt-1 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
              Informe quantos cartões você revisou nesta sessão.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="log-certas" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Questões certas
              </label>
              <input
                id="log-certas"
                type="number"
                min={0}
                value={form.questions_correct}
                onChange={e => setForm(f => ({ ...f, questions_correct: e.target.value }))}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="log-erradas" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Questões erradas
              </label>
              <input
                id="log-erradas"
                type="number"
                min={0}
                value={form.questions_wrong}
                onChange={e => setForm(f => ({ ...f, questions_wrong: e.target.value }))}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="log-obs" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Observações <span className="font-normal opacity-70">(opcional)</span>
          </label>
          <textarea
            id="log-obs"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Ex: Revisar lei de Faraday"
            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm font-medium text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/5 dark:bg-[#1C182E] dark:text-white resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
