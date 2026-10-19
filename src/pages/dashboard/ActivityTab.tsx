import { useState, useMemo } from 'react';
import Modal from '../../components/Modal';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { formatDuration, hmsToMinutes, minutesToHMS, studyTypeLabel, studyTypeEmoji, studyTypeColor, STUDY_TYPES } from '../../components/LogStudyDialog';
import { cn } from '../../lib/theme';
import type { StudySession, StudyType } from '../../lib/supabase';
import { Search, Edit2, Trash2, History, Filter } from 'lucide-react';

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
  const { sessions, subjects, topics, refreshData } = useApp();
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

  const totalMinutes = filteredSessions.reduce((a, s) => a + s.duration_minutes, 0);
  const totalCorrect = filteredSessions.reduce((a, s) => a + s.questions_correct, 0);
  const totalWrong = filteredSessions.reduce((a, s) => a + s.questions_wrong, 0);

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

  const filteredTopics = editForm ? topics.filter(t => t.subject_id === editForm.subject_id) : [];

  const stats = [
    { value: String(filteredSessions.length), label: 'Sessões', accent: true },
    { value: `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`, label: 'Tempo total', accent: false },
    { value: String(totalCorrect), label: 'Acertos', accent: false },
    { value: String(totalWrong), label: 'Erros', accent: 'bico' as const },
  ];

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      <div className="mb-5">
        <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-papel sm:text-[2.6rem]">
          Atividade
        </h1>
        <p className="mt-1 text-[17px] font-semibold text-muted dark:text-papel/70">
          Histórico completo das suas sessões de estudo
        </p>
      </div>

      {/* Métricas */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {stats.map(s => (
          <div
            key={s.label}
            className={cn('stat min-w-0', s.accent === true && 'bg-pato', s.accent === 'bico' && 'bg-bico')}
          >
            <div className="stat-value truncate">{s.value}</div>
            <div className="stat-label mt-0.5 truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card mb-5 flex flex-wrap items-center gap-2.5 p-3.5">
        <span className="flex shrink-0 items-center gap-1.5 font-display text-lg font-bold">
          <Filter size={16} strokeWidth={3} /> Filtros
        </span>

        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          aria-label="Filtrar por matéria"
          className="input w-auto min-w-[170px] shrink-0 py-1.5 text-sm font-bold"
          style={{ borderRadius: 9999 }}
        >
          <option value="">Todas as matérias</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div className="flex shrink-0 gap-2">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setFilterPeriod(p.id)}
              className={cn(
                'rounded-[14px] border-[3px] border-tinta px-3 py-1 text-sm font-bold transition-transform dark:border-papel',
                filterPeriod === p.id
                  ? 'bg-pato text-tinta'
                  : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[140px] flex-1">
          <Search size={16} strokeWidth={3} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-papel/50" />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="input bg-papel py-1.5 pl-9 text-sm dark:bg-surface-dark"
            placeholder="Buscar…"
          />
        </div>
      </div>

      {/* Sessões */}
      {filteredSessions.length === 0 ? (
        <div className="card p-10 text-center">
          <History size={56} strokeWidth={2} className="mx-auto mb-3 text-muted/50 dark:text-papel/30" />
          <h3 className="mb-1 font-display text-xl font-bold">Nenhuma sessão encontrada</h3>
          <p className="text-sm font-semibold text-muted dark:text-papel/60">
            {sessions.length === 0 ? 'Registre sua primeira sessão de estudo.' : 'Tente ajustar os filtros.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSessions.map(s => {
            const sub = subjects.find(sb => sb.id === s.subject_id);
            const topic = topics.find(t => t.id === s.topic_id);
            const total = s.questions_correct + s.questions_wrong;
            const acc = total > 0 ? Math.round((s.questions_correct / total) * 100) : null;
            const subjectColor = sub?.color ?? '#6F00D6';
            return (
              <article key={s.id} className="card group flex items-start gap-3.5 p-3.5 sm:items-center">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-tinta text-xl dark:border-papel"
                  style={{ background: subjectColor }}
                >
                  {studyTypeEmoji(s.study_type ?? 'teoria')}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className="font-display text-lg font-bold text-tinta dark:text-papel">
                      {sub?.name ?? 'Matéria'}
                    </h3>
                    {topic && <span className="text-sm font-semibold text-muted dark:text-papel/60">{topic.name}</span>}
                  </div>

                  {s.notes && (
                    <p className="mt-0.5 truncate text-[13px] font-semibold italic text-muted dark:text-papel/50">
                      {s.notes}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={cn('chip', studyTypeColor(s.study_type ?? 'teoria'))}>
                      {studyTypeEmoji(s.study_type ?? 'teoria')} {studyTypeLabel(s.study_type ?? 'teoria')}
                    </span>
                    <span className="chip bg-white text-tinta dark:border-papel dark:bg-transparent dark:text-papel">
                      {formatDuration(s.duration_minutes)}
                    </span>
                    {s.study_type === 'flashcards' && s.flashcards_count > 0 && (
                      <span className="chip bg-bico text-tinta dark:border-papel">{s.flashcards_count} cards</span>
                    )}
                    {s.questions_correct > 0 && <span className="chip bg-pato text-tinta dark:border-papel">{s.questions_correct} certas</span>}
                    {s.questions_wrong > 0 && <span className="chip bg-bico text-tinta dark:border-papel">{s.questions_wrong} erradas</span>}
                    {acc !== null && (
                      <span className="chip bg-white text-tinta dark:border-papel dark:bg-transparent dark:text-papel">{acc}% acerto</span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="whitespace-nowrap font-display text-sm font-bold text-muted dark:text-papel/60">
                    {new Date(s.studied_at).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                    <button
                      onClick={() => handleEdit(s)}
                      title="Editar sessão"
                      aria-label="Editar sessão"
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-tinta bg-white text-tinta hover:bg-pato dark:border-papel dark:bg-transparent dark:text-papel"
                    >
                      <Edit2 size={13} strokeWidth={2.8} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      title="Excluir sessão"
                      aria-label="Excluir sessão"
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-tinta bg-white text-tinta hover:bg-bico dark:border-papel dark:bg-transparent dark:text-papel"
                    >
                      <Trash2 size={13} strokeWidth={2.8} />
                    </button>
                  </div>
                </div>
              </article>
            );
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
            <button onClick={() => setEditOpen(false)} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
              Cancelar
            </button>
            <button onClick={handleSaveEdit} disabled={saving} className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </>
        }
      >
        {error && (
          <div className="mb-3 rounded-[14px] border-[3px] border-tinta bg-bico px-3.5 py-2.5 text-sm font-bold text-tinta dark:border-papel">
            {error}
          </div>
        )}
        {editForm && (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-materia" className="mb-1.5 block text-sm font-bold">Matéria</label>
                <select
                  id="edit-materia"
                  value={editForm.subject_id}
                  onChange={e => setEditForm(f => ({ ...f!, subject_id: e.target.value, topic_id: '' }))}
                  className="input"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-topico" className="mb-1.5 block text-sm font-bold">Tópico</label>
                <select
                  id="edit-topico"
                  value={editForm.topic_id}
                  onChange={e => setEditForm(f => ({ ...f!, topic_id: e.target.value }))}
                  className="input"
                >
                  <option value="">Nenhum</option>
                  {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold">Tipo de estudo</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {STUDY_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f!, study_type: t.value }))}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-[14px] border-[3px] border-tinta py-2 font-display text-sm font-bold transition-transform dark:border-papel',
                      editForm.study_type === t.value
                        ? 'bg-pato text-tinta shadow-brutal-sm'
                        : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
                    )}
                  >
                    <span className="text-base">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold">Tempo de estudo</label>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={99} value={editForm.duration_hours} aria-label="Horas" onChange={e => setEditForm(f => ({ ...f!, duration_hours: e.target.value }))} className="input text-center font-display text-lg font-bold" />
                <span className="font-display text-xl font-bold text-muted dark:text-papel/50">:</span>
                <input type="number" min={0} max={59} value={editForm.duration_minutes} aria-label="Minutos" onChange={e => setEditForm(f => ({ ...f!, duration_minutes: e.target.value }))} className="input text-center font-display text-lg font-bold" />
                <span className="font-display text-xl font-bold text-muted dark:text-papel/50">:</span>
                <input type="number" min={0} max={59} value={editForm.duration_seconds} aria-label="Segundos" onChange={e => setEditForm(f => ({ ...f!, duration_seconds: e.target.value }))} className="input text-center font-display text-lg font-bold" />
              </div>
            </div>

            {editForm.study_type === 'flashcards' ? (
              <div>
                <label htmlFor="edit-cards" className="mb-1.5 block text-sm font-bold">Flashcards estudados</label>
                <input id="edit-cards" type="number" min={1} value={editForm.flashcards_count} onChange={e => setEditForm(f => ({ ...f!, flashcards_count: e.target.value }))} className="input" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-certas" className="mb-1.5 block text-sm font-bold">Certas</label>
                  <input id="edit-certas" type="number" min={0} value={editForm.questions_correct} onChange={e => setEditForm(f => ({ ...f!, questions_correct: e.target.value }))} className="input" />
                </div>
                <div>
                  <label htmlFor="edit-erradas" className="mb-1.5 block text-sm font-bold">Erradas</label>
                  <input id="edit-erradas" type="number" min={0} value={editForm.questions_wrong} onChange={e => setEditForm(f => ({ ...f!, questions_wrong: e.target.value }))} className="input" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="edit-data" className="mb-1.5 block text-sm font-bold">Data</label>
              <input
                id="edit-data"
                type="date"
                value={editForm.studied_at}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setEditForm(f => ({ ...f!, studied_at: e.target.value }))}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="edit-obs" className="mb-1.5 block text-sm font-bold">Observações</label>
              <textarea id="edit-obs" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f!, notes: e.target.value }))} rows={2} className="input resize-none" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
