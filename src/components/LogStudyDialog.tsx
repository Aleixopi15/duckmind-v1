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

export const STUDY_TYPES: { value: StudyType; label: string; emoji: string; color: string }[] = [
  { value: 'teoria', label: 'Teoria', emoji: '📖', color: 'bg-pato text-tinta' },
  { value: 'questoes', label: 'Questões', emoji: '✏️', color: 'bg-bico text-tinta' },
  { value: 'revisao', label: 'Revisão', emoji: '🔄', color: 'bg-mente text-papel' },
  { value: 'flashcards', label: 'Flashcards', emoji: '🗂️', color: 'bg-tinta text-papel' },
];

export function studyTypeLabel(type: StudyType): string {
  return STUDY_TYPES.find(t => t.value === type)?.label ?? type;
}

export function studyTypeEmoji(type: StudyType): string {
  return STUDY_TYPES.find(t => t.value === type)?.emoji ?? '📚';
}

export function studyTypeColor(type: StudyType): string {
  return STUDY_TYPES.find(t => t.value === type)?.color ?? 'bg-mente text-papel';
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
  const { subjects, topics, refreshData, updateStreak } = useApp();
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
    const calculatedXp = (totalMins * 2) + ((qCorrect + qWrong) * 10) + (qCorrect * 5);
    setEarnedXp(calculatedXp);

    const { error: err } = await supabase.from('study_sessions').insert({
      subject_id: form.subject_id, topic_id: form.topic_id || null,
      duration_minutes: totalMins,
      study_type: form.study_type,
      questions_correct: qCorrect,
      questions_wrong: qWrong,
      flashcards_count: form.study_type === 'flashcards' ? parseInt(form.flashcards_count) || 0 : 0,
      notes: form.notes,
      studied_at: `${form.studied_at}T12:00:00`,
    });
    if (err) setError('Erro ao salvar sessão.');
    else {
      setSuccess(true); setForm(emptyForm);
      await refreshData(); await updateStreak();
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    }
    setSaving(false);
  };

  const totalMinsDisplay = hmsToMinutes(form.duration_hours, form.duration_minutes, form.duration_seconds);

  if (success) {
    return (
      <Modal open={open} onClose={onClose} size="sm">
        <div className="flex flex-col items-center gap-3 py-7 text-center">
          <DuckMascot size={84} mood="celebrating" animate showAccessoryBadge />
          <div className="flex items-center gap-2 font-display text-xl font-bold text-tinta dark:text-papel">
            <CheckCircle2 size={20} strokeWidth={2.8} className="text-pato" /> Sessão registrada!
          </div>
          {earnedXp > 0 && (
            <div className="inline-flex animate-scale-in items-center gap-1.5 rounded-full border-[3px] border-tinta bg-bico px-3 py-1 font-display text-sm font-bold text-tinta dark:border-papel">
              <Zap size={15} strokeWidth={2.8} /> +{earnedXp} XP ganhos!
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
      title="Registrar Estudo"
      size="md"
      footer={
        <>
          <button onClick={onClose} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn bg-pato px-5 py-2 text-sm text-tinta dark:border-papel">
            {saving ? 'Salvando…' : 'Salvar sessão'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="rounded-[14px] border-[3px] border-tinta bg-bico px-3.5 py-2.5 text-sm font-bold text-tinta dark:border-papel">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-bold">Tipo de estudo *</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STUDY_TYPES.map(t => {
              const active = form.study_type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, study_type: t.value }))}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-[14px] border-[3px] border-tinta py-2 font-display text-sm font-bold transition-transform',
                    active
                      ? 'bg-pato text-tinta shadow-brutal-sm dark:border-papel'
                      : 'bg-white text-tinta hover:-translate-y-px dark:border-papel dark:bg-transparent dark:text-papel',
                  )}
                >
                  <span className="text-lg">{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="log-data" className="mb-1.5 block text-sm font-bold">Data do estudo *</label>
          <input
            id="log-data"
            type="date"
            value={form.studied_at}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setForm(f => ({ ...f, studied_at: e.target.value }))}
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="log-materia" className="mb-1.5 block text-sm font-bold">Matéria *</label>
            <select
              id="log-materia"
              value={form.subject_id}
              onChange={e => setForm(f => ({ ...f, subject_id: e.target.value, topic_id: '' }))}
              className="input"
            >
              <option value="">Selecione…</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="log-topico" className="mb-1.5 block text-sm font-bold">
              Tópico <span className="font-semibold text-muted dark:text-papel/50">(opcional)</span>
            </label>
            <select
              id="log-topico"
              value={form.topic_id}
              onChange={e => setForm(f => ({ ...f, topic_id: e.target.value }))}
              disabled={!form.subject_id}
              className="input"
            >
              <option value="">Nenhum</option>
              {filteredTopics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-sm font-bold">Tempo de estudo *</label>
            <span className="rounded-[12px] border-[3px] border-tinta bg-mente px-2.5 py-0.5 font-display text-sm font-bold text-papel dark:border-papel">
              {formatDuration(totalMinsDisplay)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} max={99} placeholder="HH" value={form.duration_hours} aria-label="Horas"
              onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))}
              className="input min-w-0 flex-1 text-center font-display text-xl font-bold"
            />
            <span className="font-display text-xl font-bold text-muted dark:text-papel/50">:</span>
            <input
              type="number" min={0} max={59} placeholder="MM" value={form.duration_minutes} aria-label="Minutos"
              onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
              className="input min-w-0 flex-1 text-center font-display text-xl font-bold"
            />
            <span className="font-display text-xl font-bold text-muted dark:text-papel/50">:</span>
            <input
              type="number" min={0} max={59} placeholder="SS" value={form.duration_seconds} aria-label="Segundos"
              onChange={e => setForm(f => ({ ...f, duration_seconds: e.target.value }))}
              className="input min-w-0 flex-1 text-center font-display text-xl font-bold"
            />
          </div>
        </div>

        {form.study_type === 'flashcards' ? (
          <div>
            <label htmlFor="log-cards" className="mb-1.5 block text-sm font-bold">Flashcards estudados *</label>
            <input
              id="log-cards"
              type="number" min={1} value={form.flashcards_count}
              onChange={e => setForm(f => ({ ...f, flashcards_count: e.target.value }))}
              placeholder="Ex: 40" className="input"
            />
            <p className="mt-1 text-xs font-semibold text-muted dark:text-papel/55">
              Informe quantos cartões você revisou nesta sessão.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="log-certas" className="mb-1.5 block text-sm font-bold">Questões certas</label>
              <input
                id="log-certas"
                type="number" min={0} value={form.questions_correct}
                onChange={e => setForm(f => ({ ...f, questions_correct: e.target.value }))}
                className="input shadow-[3px_3px_0_#00D64B] dark:shadow-none"
              />
            </div>
            <div>
              <label htmlFor="log-erradas" className="mb-1.5 block text-sm font-bold">Questões erradas</label>
              <input
                id="log-erradas"
                type="number" min={0} value={form.questions_wrong}
                onChange={e => setForm(f => ({ ...f, questions_wrong: e.target.value }))}
                className="input shadow-[3px_3px_0_#D68200] dark:shadow-none"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="log-obs" className="mb-1.5 block text-sm font-bold">
            Observações <span className="font-semibold text-muted dark:text-papel/50">(opcional)</span>
          </label>
          <textarea
            id="log-obs"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Ex: Revisar lei de Faraday"
            className="input resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
