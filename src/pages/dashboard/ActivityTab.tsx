import { useState, useMemo } from 'react';
import Modal from '../../components/Modal';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { formatDuration, hmsToMinutes, minutesToHMS, studyTypeLabel, studyTypeEmoji, STUDY_TYPES } from '../../components/LogStudyDialog';
import { cn } from '../../lib/theme';
import type { StudySession, StudyType, Simulation } from '../../lib/supabase';
import { Search, Edit2, Trash2, History, Filter } from 'lucide-react';
import { getSimulationQuestions, getSubjectSimulationQuestions, getSimulationDuration, parseSimulationData, getSimulationDate, formatISODateSafe } from '../../lib/simulationUtils';

type EditForm = {
  id: string; subject_id: string; topic_id: string; study_type: StudyType;
  duration_hours: string; duration_minutes: string; duration_seconds: string;
  questions_correct: string; questions_wrong: string; flashcards_count: string; notes: string; studied_at: string;
};

const PERIODS = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'all', label: 'Tudo' },
];

export default function ActivityTab() {
  const { sessions, simulations, subjects, topics, refreshData } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filteredSessions = useMemo(() => {
    let r = [...sessions];
    if (filterSubject) r = r.filter(s => s.subject_id === filterSubject);
    if (filterPeriod !== 'all') {
      const ranges: Record<string, number> = { '7d': 7 * 86400000, '30d': 30 * 86400000, '90d': 90 * 86400000 };
      const cutoff = new Date(Date.now() - (ranges[filterPeriod] ?? 0)).toISOString();
      r = r.filter(s => s.studied_at >= cutoff);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      r = r.filter(s => {
        const sub = subjects.find(sb => sb.id === s.subject_id);
        const topic = topics.find(t => t.id === s.topic_id);
        return sub?.name.toLowerCase().includes(q) || topic?.name.toLowerCase().includes(q) || s.notes.toLowerCase().includes(q);
      });
    }
    return r;
  }, [sessions, subjects, topics, filterSubject, filterPeriod, searchText]);

  const filteredSimulations = useMemo(() => {
    let list = [...simulations];
    if (filterPeriod !== 'all') {
      const ranges: Record<string, number> = { '7d': 7 * 86400000, '30d': 30 * 86400000, '90d': 90 * 86400000 };
      const cutoff = new Date(Date.now() - (ranges[filterPeriod] ?? 0)).toISOString().split('T')[0];
      list = list.filter(s => {
        const q = getSimulationQuestions(s);
        return q.date >= cutoff;
      });
    }
    if (filterSubject) {
      const sub = subjects.find(sb => sb.id === filterSubject);
      list = list.filter(s => {
        const subQ = getSubjectSimulationQuestions(s, filterSubject, sub?.name || '', sub?.area);
        return subQ.total > 0;
      });
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(s => {
        return (
          (s.title && s.title.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q)) ||
          (s.exam_source && s.exam_source.toLowerCase().includes(q))
        );
      });
    }
    return list;
  }, [simulations, filterPeriod, filterSubject, searchText, subjects]);

  const sessionMinutes = filteredSessions.reduce((a, s) => a + s.duration_minutes, 0);
  const simMinutes = filteredSimulations.reduce((a, s) => a + getSimulationDuration(s), 0);
  const totalMinutes = sessionMinutes + simMinutes;

  const sessionCorrect = filteredSessions.reduce((a, s) => a + s.questions_correct, 0);
  const sessionWrong = filteredSessions.reduce((a, s) => a + s.questions_wrong, 0);

  // Considera questões de simulados correspondentes aos filtros
  const simStats = useMemo(() => {
    if (!filterSubject) {
      return filteredSimulations.reduce((acc, s) => {
        const q = getSimulationQuestions(s);
        return { total: acc.total + q.total, correct: acc.correct + q.correct };
      }, { total: 0, correct: 0 });
    } else {
      const sub = subjects.find(sb => sb.id === filterSubject);
      return filteredSimulations.reduce((acc, s) => {
        const q = getSubjectSimulationQuestions(s, filterSubject, sub?.name || '', sub?.area);
        return { total: acc.total + q.total, correct: acc.correct + q.correct };
      }, { total: 0, correct: 0 });
    }
  }, [filteredSimulations, filterSubject, subjects]);

  const simWrong = Math.max(0, simStats.total - simStats.correct);
  const totalCorrect = sessionCorrect + simStats.correct;
  const totalWrong = sessionWrong + simWrong;
  const totalQuestions = totalCorrect + totalWrong;

  type ActivityItem =
    | { kind: 'session'; data: StudySession; timestamp: string }
    | { kind: 'simulation'; data: Simulation; timestamp: string };

  const unifiedActivities = useMemo(() => {
    const combined: ActivityItem[] = [
      ...filteredSessions.map(s => ({ kind: 'session' as const, data: s, timestamp: s.studied_at })),
      ...filteredSimulations.map(sim => {
        const simDate = getSimulationDate(sim);
        const ts = `${simDate}T12:00:00`;
        return { kind: 'simulation' as const, data: sim, timestamp: ts };
      }),
    ];
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [filteredSessions, filteredSimulations]);

  const handleEdit = (s: StudySession) => {
    const hms = minutesToHMS(s.duration_minutes);
    setEditForm({
      id: s.id, subject_id: s.subject_id, topic_id: s.topic_id ?? '', study_type: s.study_type ?? 'teoria',
      duration_hours: hms.h, duration_minutes: hms.m, duration_seconds: hms.s,
      questions_correct: String(s.questions_correct), questions_wrong: String(s.questions_wrong),
      flashcards_count: String(s.flashcards_count ?? 0), notes: s.notes, studied_at: s.studied_at.split('T')[0],
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    setError(''); setSaving(true);
    const totalMins = hmsToMinutes(editForm.duration_hours, editForm.duration_minutes, editForm.duration_seconds);
    const { error: err } = await supabase.from('study_sessions').update({
      subject_id: editForm.subject_id, topic_id: editForm.topic_id || null,
      duration_minutes: totalMins,
      study_type: editForm.study_type,
      questions_correct: editForm.study_type === 'flashcards' ? 0 : parseInt(editForm.questions_correct) || 0,
      questions_wrong: editForm.study_type === 'flashcards' ? 0 : parseInt(editForm.questions_wrong) || 0,
      flashcards_count: editForm.study_type === 'flashcards' ? parseInt(editForm.flashcards_count) || 0 : 0,
      notes: editForm.notes, studied_at: `${editForm.studied_at}T12:00:00`,
    }).eq('id', editForm.id);
    if (err) setError('Erro ao atualizar sessão.');
    else { setEditOpen(false); setEditForm(null); await refreshData(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('study_sessions').delete().eq('id', id);
    await refreshData();
  };

  const handleDeleteSimulation = async (id: string) => {
    await supabase.from('simulations').delete().eq('id', id);
    await refreshData();
  };

  const filteredTopics = editForm ? topics.filter(t => t.subject_id === editForm.subject_id) : [];

  const stats = [
    { value: String(unifiedActivities.length), label: 'Atividades', accent: 'pato' },
    { value: `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`, label: 'Tempo total', accent: 'default' },
    { value: `${totalCorrect} (${totalQuestions}q)`, label: 'Acertos Totais', accent: 'default' },
    { value: String(totalWrong), label: 'Erros Totais', accent: 'bico' },
  ];

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
          Atividade
        </h1>
        <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
          Histórico completo das suas sessões de estudo e simulados
        </p>
      </div>

      {/* Métricas */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {stats.map(s => (
          <div
            key={s.label}
            className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]"
          >
            <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-white">
              {s.value}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="flex shrink-0 items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
          <Filter size={14} strokeWidth={2.4} />
          <span>Filtros</span>
        </div>

        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          aria-label="Filtrar por matéria"
          className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="">Todas as matérias</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div className="flex shrink-0 gap-1.5">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setFilterPeriod(p.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all',
                filterPeriod === p.id
                  ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                  : 'bg-slate-100 text-[#645F78] hover:bg-slate-200/70 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:bg-white/10'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[160px] flex-1">
          <Search size={14} strokeWidth={2.4} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs font-medium text-[#14102A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
            placeholder="Buscar por anotações ou matéria…"
          />
        </div>
      </div>

      {/* Atividades: Sessões e Simulados */}
      {unifiedActivities.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <History size={48} strokeWidth={1.8} className="mx-auto mb-3 text-slate-300 dark:text-white/20" />
          <h3 className="mb-1 font-display text-lg font-bold text-[#14102A] dark:text-white">Nenhuma atividade encontrada</h3>
          <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
            {sessions.length === 0 && simulations.length === 0 ? 'Registre sua primeira sessão ou simulado de estudo.' : 'Tente ajustar os filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {unifiedActivities.map(act => {
            if (act.kind === 'session') {
              const s = act.data;
              const sub = subjects.find(sb => sb.id === s.subject_id);
              const topic = topics.find(t => t.id === s.topic_id);
              const total = s.questions_correct + s.questions_wrong;
              const acc = total > 0 ? Math.round((s.questions_correct / total) * 100) : null;
              const subjectColor = sub?.color ?? '#6F00D6';
              return (
                <article
                  key={`sess-${s.id}`}
                  className="group flex items-start gap-4 rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-xs transition-all hover:border-slate-300 dark:border-white/5 dark:bg-[#151826] dark:hover:border-white/10 sm:items-center"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg shadow-xs"
                    style={{ background: `${subjectColor}18` }}
                  >
                    {studyTypeEmoji(s.study_type ?? 'teoria')}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="font-display text-base font-bold text-[#14102A] dark:text-white">
                        {sub?.name ?? 'Matéria'}
                      </h3>
                      {topic && <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">{topic.name}</span>}
                    </div>

                    {s.notes && (
                      <p className="mt-0.5 truncate text-xs font-medium italic text-[#645F78] dark:text-white/60">
                        {s.notes}
                      </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                        {studyTypeEmoji(s.study_type ?? 'teoria')} {studyTypeLabel(s.study_type ?? 'teoria')}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-300">
                        {formatDuration(s.duration_minutes)}
                      </span>
                      {s.study_type === 'flashcards' && s.flashcards_count > 0 && (
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-[#D68200] dark:text-[#FFB84D]">
                          {s.flashcards_count} cards
                        </span>
                      )}
                      {s.questions_correct > 0 && (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {s.questions_correct} certas
                        </span>
                      )}
                      {s.questions_wrong > 0 && (
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {s.questions_wrong} erradas
                        </span>
                      )}
                      {acc !== null && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#14102A] dark:bg-white/5 dark:text-white">
                          {acc}% acerto
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="whitespace-nowrap font-display text-xs font-bold text-[#645F78] dark:text-[#9D96B8]">
                      {formatISODateSafe(s.studied_at)}
                    </span>
                    <div className="flex gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(s)}
                        title="Editar sessão"
                        aria-label="Editar sessão"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-[#008E32] hover:bg-emerald-50 dark:hover:text-[#19E85F] dark:hover:bg-white/10 transition-colors"
                      >
                        <Edit2 size={13} strokeWidth={2.4} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        title="Excluir sessão"
                        aria-label="Excluir sessão"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <Trash2 size={13} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            } else {
              const sim = act.data;
              const { cleanNotes, meta } = parseSimulationData(sim);
              const q = getSimulationQuestions(sim);
              const dur = getSimulationDuration(sim);
              const acc = q.total > 0 ? Math.round((q.correct / q.total) * 100) : null;
              const simType = sim.simulation_type || meta.type || 'completo';
              const typeLabel =
                simType === 'personalizado' ? 'Simulado Personalizado' :
                simType === 'area_unica' ? 'Simulado por Área' :
                simType === 'dia_1' ? 'ENEM Dia 1 (Ling. e Hum.)' :
                simType === 'dia_2' ? 'ENEM Dia 2 (Nat. e Mat.)' : 'Simulado ENEM Completo';

              return (
                <article
                  key={`sim-${sim.id}`}
                  className="group flex items-start gap-4 rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-xs transition-all hover:border-slate-300 dark:border-white/5 dark:bg-[#151826] dark:hover:border-white/10 sm:items-center"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg shadow-xs bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]"
                  >
                    📝
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="font-display text-base font-bold text-[#14102A] dark:text-white">
                        {sim.title || 'Simulado'}
                      </h3>
                      <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                        {typeLabel} {sim.exam_source ? `• ${sim.exam_source}` : ''}
                      </span>
                    </div>

                    {cleanNotes && (
                      <p className="mt-0.5 truncate text-xs font-medium italic text-[#645F78] dark:text-white/60">
                        {cleanNotes}
                      </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-[#D68200] dark:text-[#FFB84D]">
                        Simulado
                      </span>
                      {dur > 0 && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-300">
                          {formatDuration(dur)}
                        </span>
                      )}
                      {q.total > 0 && (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {q.correct} certas
                        </span>
                      )}
                      {q.wrong > 0 && (
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {q.wrong} erradas
                        </span>
                      )}
                      {acc !== null && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#14102A] dark:bg-white/5 dark:text-white">
                          {acc}% acerto
                        </span>
                      )}
                      {sim.total_score !== null && sim.total_score !== undefined && (
                        <span className="rounded-full bg-[#00D64B]/15 px-2.5 py-0.5 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                          TRI {sim.total_score}
                        </span>
                      )}
                      {meta.difficulty && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-600 dark:bg-white/5 dark:text-slate-400">
                          {meta.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="whitespace-nowrap font-display text-xs font-bold text-[#645F78] dark:text-[#9D96B8]">
                      {formatISODateSafe(getSimulationDate(sim))}
                    </span>
                    <div className="flex gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                      <button
                        onClick={() => handleDeleteSimulation(sim.id)}
                        title="Excluir simulado"
                        aria-label="Excluir simulado"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <Trash2 size={13} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          })}
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Sessão"
        size="md"
        footer={
          <>
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-5 py-2 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </>
        }
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        {editForm && (
          <div className="flex flex-col gap-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-materia" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  Matéria
                </label>
                <select
                  id="edit-materia"
                  value={editForm.subject_id}
                  onChange={e => setEditForm(f => ({ ...f!, subject_id: e.target.value, topic_id: '' }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-topico" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  Tópico
                </label>
                <select
                  id="edit-topico"
                  value={editForm.topic_id}
                  onChange={e => setEditForm(f => ({ ...f!, topic_id: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                >
                  <option value="">Nenhum</option>
                  {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Tipo de estudo
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {STUDY_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f!, study_type: t.value }))}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-2xl border p-2.5 text-xs font-bold transition-all',
                      editForm.study_type === t.value
                        ? 'border-[#00D64B] bg-[#00D64B]/10 text-[#008E32] dark:text-[#19E85F]'
                        : 'border-slate-200/80 bg-white text-[#645F78] hover:border-slate-300 dark:border-white/5 dark:bg-white/5 dark:text-[#9D96B8]'
                    )}
                  >
                    <span className="text-base">{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Tempo de estudo
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={editForm.duration_hours}
                  aria-label="Horas"
                  onChange={e => setEditForm(f => ({ ...f!, duration_hours: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2 text-center font-display text-base font-bold text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                />
                <span className="font-bold text-slate-400">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={editForm.duration_minutes}
                  aria-label="Minutos"
                  onChange={e => setEditForm(f => ({ ...f!, duration_minutes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2 text-center font-display text-base font-bold text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                />
                <span className="font-bold text-slate-400">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={editForm.duration_seconds}
                  aria-label="Segundos"
                  onChange={e => setEditForm(f => ({ ...f!, duration_seconds: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2 text-center font-display text-base font-bold text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                />
              </div>
            </div>

            {editForm.study_type === 'flashcards' ? (
              <div>
                <label htmlFor="edit-cards" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  Flashcards estudados
                </label>
                <input
                  id="edit-cards"
                  type="number"
                  min={1}
                  value={editForm.flashcards_count}
                  onChange={e => setEditForm(f => ({ ...f!, flashcards_count: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-certas" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                    Certas
                  </label>
                  <input
                    id="edit-certas"
                    type="number"
                    min={0}
                    value={editForm.questions_correct}
                    onChange={e => setEditForm(f => ({ ...f!, questions_correct: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                  />
                </div>
                <div>
                  <label htmlFor="edit-erradas" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                    Erradas
                  </label>
                  <input
                    id="edit-erradas"
                    type="number"
                    min={0}
                    value={editForm.questions_wrong}
                    onChange={e => setEditForm(f => ({ ...f!, questions_wrong: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="edit-data" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Data
              </label>
              <input
                id="edit-data"
                type="date"
                value={editForm.studied_at}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setEditForm(f => ({ ...f!, studied_at: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
              />
            </div>

            <div>
              <label htmlFor="edit-obs" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Observações
              </label>
              <textarea
                id="edit-obs"
                value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f!, notes: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B] resize-none"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
