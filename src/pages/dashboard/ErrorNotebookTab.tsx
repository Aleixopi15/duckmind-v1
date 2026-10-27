import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/theme';
import DuckMascot from '../../components/DuckMascot';
import ErrorNotebookDialog from '../../components/ErrorNotebookDialog';
import {
  Plus, Filter, Trash2, CheckCircle2, Clock, X, ChevronRight, BookOpen,
  Pencil, Save, Maximize2, ZoomIn, ZoomOut, RotateCcw, Bookmark,
} from 'lucide-react';
import type { ErrorNotebookEntry } from '../../lib/supabase';

type Props = {
  filterSubjectId?: string;
  filterTopicId?: string;
  onClearFilter?: () => void;
};

export default function ErrorNotebookTab({ filterSubjectId, filterTopicId, onClearFilter }: Props) {
  const { errorNotebook, subjects, topics, refreshData } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState(filterSubjectId ?? '');
  const [filterTopic, setFilterTopic] = useState(filterTopicId ?? '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'revisado'>('all');
  const [selectedEntry, setSelectedEntry] = useState<ErrorNotebookEntry | null>(null);
  const [acting, setActing] = useState(false);
  const [editingObs, setEditingObs] = useState(false);
  const [obsValue, setObsValue] = useState('');
  const [subtopicValue, setSubtopicValue] = useState('');
  const [savingObs, setSavingObs] = useState(false);

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const topicMap = useMemo(() => new Map(topics.map(t => [t.id, t])), [topics]);

  const effectiveFilterSubject = filterSubjectId ?? filterSubject;
  const effectiveFilterTopic = filterTopicId ?? filterTopic;

  const filtered = useMemo(() => {
    return errorNotebook.filter(e => {
      if (effectiveFilterSubject && e.subject_id !== effectiveFilterSubject) return false;
      if (effectiveFilterTopic && e.topic_id !== effectiveFilterTopic) return false;
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      return true;
    });
  }, [errorNotebook, effectiveFilterSubject, effectiveFilterTopic, filterStatus]);

  const pendingCount = errorNotebook.filter(e => e.status === 'pendente').length;
  const reviewedCount = errorNotebook.filter(e => e.status === 'revisado').length;

  const availableFilterTopics = topics.filter(t => t.subject_id === effectiveFilterSubject);

  const handleMarkReviewed = async (entry: ErrorNotebookEntry) => {
    setActing(true);
    const { error } = await supabase
      .from('error_notebook_entries')
      .update({ status: 'revisado', reviewed_at: new Date().toISOString() })
      .eq('id', entry.id);
    if (!error) {
      await refreshData();
      setSelectedEntry(null);
    }
    setActing(false);
  };

  const handleDelete = async (entry: ErrorNotebookEntry) => {
    setActing(true);
    const { error } = await supabase
      .from('error_notebook_entries')
      .delete()
      .eq('id', entry.id);
    if (!error) {
      await refreshData();
      setSelectedEntry(null);
    }
    setActing(false);
  };

  const handleSaveObs = async () => {
    if (!selectedEntry) return;
    setSavingObs(true);
    const updatedObs = obsValue.trim();
    const updatedSubtopic = subtopicValue.trim();
    const { error } = await supabase
      .from('error_notebook_entries')
      .update({
        observacoes: updatedObs,
        custom_subtopic: updatedSubtopic,
      })
      .eq('id', selectedEntry.id);
    if (!error) {
      await refreshData();
      setSelectedEntry(prev => prev ? {
        ...prev,
        observacoes: updatedObs,
        custom_subtopic: updatedSubtopic,
      } : prev);
      setEditingObs(false);
    }
    setSavingObs(false);
  };

  const startEditDetails = () => {
    if (!selectedEntry) return;
    setObsValue(selectedEntry.observacoes);
    setSubtopicValue(selectedEntry.custom_subtopic || '');
    setEditingObs(true);
  };

  const hasEditalFilter = filterSubjectId || filterTopicId;

  const STATUS_LABELS: Record<string, string> = {
    pendente: 'Pendente',
    revisado: 'Revisado',
  };

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
              Caderno de Erros
            </h1>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-[#D68200] dark:text-[#FFB84D]">
              Revisão ativa
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Transforme cada erro em um degrau rumo aos 800+ no ENEM
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Nova questão</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-white">
            {errorNotebook.length}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Total
          </div>
        </div>
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#D68200] dark:text-[#FFB84D]">
            {pendingCount}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Pendentes
          </div>
        </div>
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#008E32] dark:text-[#19E85F]">
            {reviewedCount}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Revisados
          </div>
        </div>
      </div>

      {/* Banner de filtro vindo do edital */}
      {hasEditalFilter && (
        <div className="mb-5 flex items-center gap-3 rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-3.5 shadow-xs dark:border-emerald-500/10">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#008E32] shadow-xs dark:bg-white/10 dark:text-[#19E85F]">
            <BookOpen size={16} strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-bold text-[#14102A] dark:text-white">
            Filtrando do edital: {subjectMap.get(filterSubjectId ?? '')?.name ?? ''}
            {filterTopicId && topicMap.get(filterTopicId) ? ` · ${topicMap.get(filterTopicId)?.name}` : ''}
          </span>
          <button
            onClick={() => { setFilterSubject(''); setFilterTopic(''); onClearFilter?.(); }}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#14102A] shadow-xs hover:bg-slate-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <X size={12} strokeWidth={2.6} /> Limpar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="flex shrink-0 items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
          <Filter size={14} strokeWidth={2.4} />
          <span>Filtros</span>
        </div>
        <select
          value={effectiveFilterSubject}
          onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic(''); }}
          disabled={!!filterSubjectId}
          aria-label="Filtrar por matéria"
          className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="">Todas as matérias</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={effectiveFilterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          disabled={!!filterTopicId || !effectiveFilterSubject}
          aria-label="Filtrar por tópico"
          className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="">Todos os tópicos</option>
          {availableFilterTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pendente', 'revisado'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all',
                filterStatus === st
                  ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                  : 'bg-slate-100 text-[#645F78] hover:bg-slate-200/70 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:bg-white/10'
              )}
            >
              {st === 'all' ? 'Todos' : STATUS_LABELS[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-[24px] border border-slate-200/80 bg-white p-10 text-center shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <DuckMascot size={80} mood="sad" animate />
          <h2 className="mb-1 mt-4 font-display text-lg font-bold text-[#14102A] dark:text-white">
            {errorNotebook.length === 0 ? 'Seu caderno de erros está vazio' : 'Nenhum resultado para este filtro'}
          </h2>
          <p className="mb-4 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
            {errorNotebook.length === 0
              ? 'Tire foto de uma questão que você errou e registre para revisar depois.'
              : 'Tente ajustar os filtros acima.'}
          </p>
          {errorNotebook.length === 0 && (
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all"
            >
              <Plus size={16} strokeWidth={3} /> Adicionar primeira questão
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(entry => {
            const subject = subjectMap.get(entry.subject_id);
            const editalTopicName = entry.topic_id && topicMap.has(entry.topic_id)
              ? topicMap.get(entry.topic_id)!.name
              : null;

            return (
              <article
                key={entry.id}
                className="group flex cursor-pointer gap-4 rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/5 dark:bg-[#151826]"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="relative shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                  <img
                    src={entry.image_data}
                    alt="Questão registrada"
                    className="h-24 w-20 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 size={16} strokeWidth={2.4} />
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: subject?.color ?? '#6F00D6' }}
                    >
                      {subject?.name ?? '—'}
                    </span>
                    {entry.status === 'pendente' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-[#D68200] dark:text-[#FFB84D]">
                        <Clock size={10} strokeWidth={2.6} /> Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-[#008E32] dark:text-[#19E85F]">
                        <CheckCircle2 size={10} strokeWidth={2.6} /> Revisado
                      </span>
                    )}
                  </div>

                  <h3 className="truncate font-display text-base font-bold text-[#14102A] dark:text-white">
                    {editalTopicName ?? (entry.custom_subtopic ? 'Observação específica' : 'Questão')}
                  </h3>

                  <p className="text-xs font-semibold text-[#14102A] dark:text-white/80">
                    Sua: <span className="font-bold text-amber-600 dark:text-amber-400">{entry.student_answer}</span>
                    <span className="mx-1.5 opacity-40">→</span>
                    Gabarito: <span className="font-bold text-emerald-600 dark:text-emerald-400">{entry.correct_answer}</span>
                  </p>

                  {entry.custom_subtopic && (
                    <p className="flex items-center gap-1 truncate rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#645F78] dark:bg-white/5 dark:text-white/60">
                      <Bookmark size={11} strokeWidth={2.4} className="shrink-0" />
                      <span className="truncate">{entry.custom_subtopic}</span>
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[11px] font-medium text-[#645F78] dark:text-[#9D96B8]">
                    <span>{new Date(entry.created_at).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-0.5 font-bold text-[#008E32] dark:text-[#19E85F] group-hover:translate-x-0.5 transition-transform">
                      Ver detalhes <ChevronRight size={13} strokeWidth={2.6} />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Detalhe Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 animate-fade-in sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => { setSelectedEntry(null); setEditingObs(false); }}
          />
          <div
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-[28px] border border-slate-200/80 bg-white shadow-2xl animate-scale-in dark:border-white/10 dark:bg-[#151826]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-6 py-4 dark:border-white/5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: subjectMap.get(selectedEntry.subject_id)?.color ?? '#6F00D6' }}
                >
                  {subjectMap.get(selectedEntry.subject_id)?.name ?? '—'}
                </span>
                {selectedEntry.status === 'pendente' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-[#D68200] dark:text-[#FFB84D]">
                    <Clock size={12} strokeWidth={2.4} /> Pendente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                    <CheckCircle2 size={12} strokeWidth={2.4} /> Revisado
                  </span>
                )}
              </div>
              <button
                onClick={() => { setSelectedEntry(null); setEditingObs(false); }}
                aria-label="Fechar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              <div className="group relative flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 dark:border-white/5 dark:bg-white/5">
                <img
                  src={selectedEntry.image_data}
                  alt="Questão"
                  className="max-h-72 w-full cursor-zoom-in object-contain p-2"
                  onClick={() => { setFullscreenImage(selectedEntry.image_data); setZoomLevel(1); }}
                />
                <button
                  onClick={() => { setFullscreenImage(selectedEntry.image_data); setZoomLevel(1); }}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs transition-colors hover:bg-black"
                  title="Expandir imagem"
                >
                  <Maximize2 size={13} strokeWidth={2.4} /> Expandir
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">Sua resposta</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 font-display text-sm font-bold text-[#D68200] dark:text-[#FFB84D]">
                    {selectedEntry.student_answer}
                  </span>
                </div>
                <div className="h-5 w-px bg-slate-200 dark:bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">Gabarito</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 font-display text-sm font-bold text-[#008E32] dark:text-[#19E85F]">
                    {selectedEntry.correct_answer}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/5">
                  <h4 className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                    <BookOpen size={12} strokeWidth={2.4} /> Tópico do edital
                  </h4>
                  <p className="text-xs font-bold text-[#14102A] dark:text-white">
                    {selectedEntry.topic_id && topicMap.has(selectedEntry.topic_id)
                      ? topicMap.get(selectedEntry.topic_id)!.name
                      : 'Sem vínculo direto ao edital'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/5">
                  <h4 className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                    <Bookmark size={12} strokeWidth={2.4} /> Subtópico
                  </h4>
                  <p className="text-xs font-bold text-[#14102A] dark:text-white">
                    {selectedEntry.custom_subtopic || 'Nenhum subtópico adicionado'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                    <Pencil size={12} strokeWidth={2.4} /> Anotações
                  </h4>
                  {!editingObs && (
                    <button
                      onClick={startEditDetails}
                      className="text-xs font-bold text-[#008E32] dark:text-[#19E85F] hover:underline"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {editingObs ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="erro-sub" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                        Subtópico específico
                      </label>
                      <input
                        id="erro-sub"
                        value={subtopicValue}
                        onChange={(e) => setSubtopicValue(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151826] px-3 py-2 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                        placeholder="Ex: Teorema de Tales, Lei dos Gases…"
                      />
                    </div>
                    <div>
                      <label htmlFor="erro-obs-detail" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                        Observações e motivo do erro
                      </label>
                      <textarea
                        id="erro-obs-detail"
                        value={obsValue}
                        onChange={(e) => setObsValue(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151826] p-3 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B] min-h-[80px] resize-y"
                        placeholder="Suas anotações pessoais sobre esta questão…"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingObs(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#645F78] dark:text-[#9D96B8] hover:bg-slate-200/60 dark:hover:bg-white/10"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveObs}
                        disabled={savingObs}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                      >
                        <Save size={13} strokeWidth={2.6} /> {savingObs ? 'Salvando…' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={cn(
                    'whitespace-pre-wrap text-xs font-medium leading-relaxed',
                    selectedEntry.observacoes ? 'text-[#14102A] dark:text-white' : 'italic text-[#645F78] dark:text-white/40',
                  )}>
                    {selectedEntry.observacoes || 'Nenhuma observação extra registrada.'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/5">
              <button
                onClick={() => handleDelete(selectedEntry)}
                disabled={acting}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <Trash2 size={14} strokeWidth={2.4} /> Excluir
              </button>
              {selectedEntry.status === 'pendente' && (
                <button
                  onClick={() => handleMarkReviewed(selectedEntry)}
                  disabled={acting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all"
                >
                  <CheckCircle2 size={14} strokeWidth={2.6} /> Marcar como revisado
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visualizador em tela cheia */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[1200] flex select-none flex-col items-center justify-center bg-tinta/95 p-4 animate-fade-in"
          onClick={() => { setFullscreenImage(null); setZoomLevel(1); }}
        >
          <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-4 py-1.5 font-display text-xs font-bold text-white">
              <span>Visualizador</span>
              <span className="text-white/40">|</span>
              <span>{Math.round(zoomLevel * 100)}%</span>
            </div>

            <div className="flex items-center gap-2">
              {[
                { icon: ZoomOut, action: () => setZoomLevel(z => Math.max(0.5, z - 0.25)), label: 'Diminuir zoom' },
                { icon: ZoomIn, action: () => setZoomLevel(z => Math.min(3, z + 0.25)), label: 'Aumentar zoom' },
                { icon: RotateCcw, action: () => setZoomLevel(1), label: 'Tamanho original' },
              ].map(({ icon: Icon, action, label }) => (
                <button
                  key={label}
                  onClick={action}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 active:scale-95"
                >
                  <Icon size={18} strokeWidth={2.4} />
                </button>
              ))}
              <button
                onClick={() => { setFullscreenImage(null); setZoomLevel(1); }}
                aria-label="Fechar visualização"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-all active:scale-95"
              >
                <X size={20} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="flex max-h-full max-w-full items-center justify-center overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <img
              src={fullscreenImage}
              alt="Questão ampliada"
              className="max-h-[85vh] max-w-[90vw] cursor-zoom-in rounded-2xl border border-white/10 shadow-2xl object-contain transition-transform duration-150"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={() => setZoomLevel(z => (z === 1 ? 1.75 : 1))}
            />
          </div>

          <p className="absolute bottom-4 rounded-full border border-white/15 bg-black/60 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-white/90">
            Clique na imagem para alternar zoom · clique fora para fechar
          </p>
        </div>
      )}

      <ErrorNotebookDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialSubjectId={filterSubjectId ?? undefined}
        initialTopicId={filterTopicId ?? undefined}
      />
    </div>
  );
}
