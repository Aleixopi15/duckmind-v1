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
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-papel sm:text-[2.6rem]">
              Caderno de Erros
            </h1>
            <span className="chip bg-bico text-tinta dark:border-papel">Revisão ativa</span>
          </div>
          <p className="mt-1 text-[17px] font-semibold text-muted dark:text-papel/70">
            Transforme cada erro em um degrau rumo aos 800+ no ENEM
          </p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="btn shrink-0 bg-pato px-5 py-2.5 text-tinta dark:border-papel">
          <Plus size={18} strokeWidth={3} /> Nova questão
        </button>
      </div>

      {/* Métricas */}
      <div className="mb-5 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="stat min-w-0">
          <div className="stat-value truncate">{errorNotebook.length}</div>
          <div className="stat-label mt-0.5 truncate">Total</div>
        </div>
        <div className="stat min-w-0 bg-bico">
          <div className="stat-value truncate">{pendingCount}</div>
          <div className="stat-label mt-0.5 truncate">Pendentes</div>
        </div>
        <div className="stat min-w-0 bg-pato">
          <div className="stat-value truncate">{reviewedCount}</div>
          <div className="stat-label mt-0.5 truncate">Revisados</div>
        </div>
      </div>

      {/* Banner de filtro vindo do edital */}
      {hasEditalFilter && (
        <div className="card mb-4 flex items-center gap-3 bg-pato/20 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[3px] border-tinta bg-white text-tinta dark:border-papel dark:bg-transparent dark:text-papel">
            <BookOpen size={16} strokeWidth={2.8} />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-tinta dark:text-papel">
            Filtrando do edital: {subjectMap.get(filterSubjectId ?? '')?.name ?? ''}
            {filterTopicId && topicMap.get(filterTopicId) ? ` · ${topicMap.get(filterTopicId)?.name}` : ''}
          </span>
          <button
            onClick={() => { setFilterSubject(''); setFilterTopic(''); onClearFilter?.(); }}
            className="btn shrink-0 bg-white px-3 py-1.5 text-sm dark:border-papel dark:bg-transparent dark:text-papel"
          >
            <X size={14} strokeWidth={3} /> Limpar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <span className="flex shrink-0 items-center gap-1.5 font-display text-lg font-bold">
          <Filter size={16} strokeWidth={3} />
        </span>
        <select
          value={effectiveFilterSubject}
          onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic(''); }}
          disabled={!!filterSubjectId}
          aria-label="Filtrar por matéria"
          className="input w-auto min-w-[160px] py-1.5 text-sm font-bold"
          style={{ borderRadius: 9999 }}
        >
          <option value="">Todas as matérias</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={effectiveFilterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          disabled={!!filterTopicId || !effectiveFilterSubject}
          aria-label="Filtrar por tópico"
          className="input w-auto min-w-[160px] py-1.5 text-sm font-bold"
          style={{ borderRadius: 9999 }}
        >
          <option value="">Todos os tópicos</option>
          {availableFilterTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div className="flex flex-wrap gap-2">
          {(['all', 'pendente', 'revisado'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                'rounded-[14px] border-[3px] border-tinta px-3 py-1 font-display text-sm font-bold transition-transform dark:border-papel',
                filterStatus === st
                  ? 'bg-pato text-tinta'
                  : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
              )}
            >
              {st === 'all' ? 'Todos' : STATUS_LABELS[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center p-8 text-center">
          <DuckMascot size={92} mood="sad" animate />
          <h2 className="mb-1 mt-4 font-display text-xl font-bold text-tinta dark:text-papel">
            {errorNotebook.length === 0 ? 'Seu caderno de erros está vazio' : 'Nenhum resultado para este filtro'}
          </h2>
          <p className="mb-4 text-sm font-semibold text-muted dark:text-papel/60">
            {errorNotebook.length === 0
              ? 'Tire foto de uma questão que você errou e registre para revisar depois.'
              : 'Tente ajustar os filtros acima.'}
          </p>
          {errorNotebook.length === 0 && (
            <button onClick={() => setDialogOpen(true)} className="btn bg-pato px-4 py-2.5 text-tinta dark:border-papel">
              <Plus size={18} strokeWidth={3} /> Adicionar primeira questão
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
                className="card card-hover group flex cursor-pointer gap-3.5 p-3.5"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="relative shrink-0">
                  <img
                    src={entry.image_data}
                    alt="Questão registrada"
                    className="h-24 w-[84px] rounded-[12px] border-[3px] border-tinta object-cover dark:border-papel"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-tinta/45 text-papel opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 size={16} strokeWidth={2.8} />
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className="chip text-tinta dark:border-papel"
                      style={{ backgroundColor: subject?.color ?? '#6F00D6' }}
                    >
                      {subject?.name ?? '—'}
                    </span>
                    {entry.status === 'pendente' ? (
                      <span className="chip gap-1 bg-bico text-tinta dark:border-papel">
                        <Clock size={10} strokeWidth={3} /> Pendente
                      </span>
                    ) : (
                      <span className="chip gap-1 bg-pato text-tinta dark:border-papel">
                        <CheckCircle2 size={10} strokeWidth={3} /> Revisado
                      </span>
                    )}
                  </div>

                  <h3 className="truncate font-display text-lg font-bold leading-tight text-tinta dark:text-papel">
                    {editalTopicName ?? (entry.custom_subtopic ? 'Observação específica' : 'Questão')}
                  </h3>

                  <p className="text-sm font-semibold text-tinta dark:text-papel/80">
                    Sua: <b className="font-display">{entry.student_answer}</b>
                    <span className="mx-1.5 text-muted dark:text-papel/40">→</span>
                    Gab: <b className="font-display">{entry.correct_answer}</b>
                  </p>

                  {entry.custom_subtopic && (
                    <p className="flex items-center gap-1 truncate rounded-[10px] border-2 border-tinta bg-bico/25 px-2 py-0.5 text-[13px] font-bold text-tinta dark:border-papel dark:text-papel">
                      <Bookmark size={11} strokeWidth={3} className="shrink-0" />
                      <span className="truncate">{entry.custom_subtopic}</span>
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[13px] font-semibold text-muted dark:text-papel/50">
                    <span>{new Date(entry.created_at).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-0.5 font-bold text-tinta transition-transform group-hover:translate-x-0.5 dark:text-papel">
                      Ver detalhes <ChevronRight size={14} strokeWidth={3} />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Detalhe */}
      {selectedEntry && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 animate-fade-in sm:p-4">
          <div
            className="absolute inset-0 bg-tinta/65"
            onClick={() => { setSelectedEntry(null); setEditingObs(false); }}
          />
          <div
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col border-[3px] border-tinta bg-papel animate-scale-in dark:border-papel dark:bg-surface-dark-card"
            style={{ borderRadius: 28, boxShadow: '8px 8px 0 #00D64B' }}
          >
            <div className="flex items-center justify-between gap-2 border-b-[3px] border-tinta px-5 pb-3 pt-4 dark:border-papel/50 sm:px-6">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="chip text-tinta dark:border-papel"
                  style={{ backgroundColor: subjectMap.get(selectedEntry.subject_id)?.color ?? '#6F00D6' }}
                >
                  {subjectMap.get(selectedEntry.subject_id)?.name ?? '—'}
                </span>
                {selectedEntry.status === 'pendente' ? (
                  <span className="chip gap-1 bg-bico text-tinta dark:border-papel">
                    <Clock size={12} strokeWidth={3} /> Pendente
                  </span>
                ) : (
                  <span className="chip gap-1 bg-pato text-tinta dark:border-papel">
                    <CheckCircle2 size={12} strokeWidth={3} /> Revisado
                  </span>
                )}
              </div>
              <button
                onClick={() => { setSelectedEntry(null); setEditingObs(false); }}
                aria-label="Fechar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-tinta bg-white text-tinta transition-transform active:translate-x-[2px] active:translate-y-[2px] dark:border-papel dark:bg-transparent dark:text-papel"
              >
                <X size={18} strokeWidth={2.8} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="group relative flex items-center justify-center overflow-hidden rounded-[18px] border-[3px] border-tinta bg-white dark:border-papel/50 dark:bg-transparent">
                <img
                  src={selectedEntry.image_data}
                  alt="Questão"
                  className="max-h-72 w-full cursor-zoom-in object-contain"
                  onClick={() => { setFullscreenImage(selectedEntry.image_data); setZoomLevel(1); }}
                />
                <button
                  onClick={() => { setFullscreenImage(selectedEntry.image_data); setZoomLevel(1); }}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-[14px] border-[3px] border-papel bg-tinta px-3 py-1.5 font-display text-xs font-bold text-papel"
                  title="Expandir imagem"
                >
                  <Maximize2 size={14} strokeWidth={3} /> Expandir
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-5 rounded-[16px] border-[3px] border-tinta bg-white p-3 dark:border-papel/50 dark:bg-transparent">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted dark:text-papel/60">Sua resposta</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border-[3px] border-tinta bg-bico font-display text-sm font-bold text-tinta dark:border-papel">
                    {selectedEntry.student_answer}
                  </span>
                </div>
                <div className="h-6 w-[3px] bg-tinta/20 dark:bg-papel/20" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted dark:text-papel/60">Gabarito</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border-[3px] border-tinta bg-pato font-display text-sm font-bold text-tinta dark:border-papel">
                    {selectedEntry.correct_answer}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[16px] border-[3px] border-tinta bg-white p-3 dark:border-papel/50 dark:bg-transparent">
                  <h4 className="mb-1 flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide text-muted dark:text-papel/50">
                    <BookOpen size={12} strokeWidth={3} /> Tópico do edital
                  </h4>
                  <p className="text-sm font-bold text-tinta dark:text-papel">
                    {selectedEntry.topic_id && topicMap.has(selectedEntry.topic_id)
                      ? topicMap.get(selectedEntry.topic_id)!.name
                      : 'Sem vínculo direto ao edital'}
                  </p>
                </div>

                <div className="rounded-[16px] border-[3px] border-tinta bg-bico/25 p-3 dark:border-papel/50 dark:bg-transparent">
                  <h4 className="mb-1 flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide text-tinta dark:text-papel/60">
                    <Bookmark size={12} strokeWidth={3} /> Subtópico
                  </h4>
                  <p className="text-sm font-bold text-tinta dark:text-papel">
                    {selectedEntry.custom_subtopic || 'Nenhum subtópico adicionado'}
                  </p>
                </div>
              </div>

              <div className="rounded-[16px] border-[3px] border-tinta bg-white p-3.5 dark:border-papel/50 dark:bg-transparent">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted dark:text-papel/50">
                    <Pencil size={13} strokeWidth={3} /> Anotações
                  </h4>
                  {!editingObs && (
                    <button
                      onClick={startEditDetails}
                      className="text-xs font-bold text-mente hover:underline dark:text-pato"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {editingObs ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="erro-sub" className="mb-1 block text-xs font-bold">Subtópico específico</label>
                      <input
                        id="erro-sub"
                        value={subtopicValue}
                        onChange={(e) => setSubtopicValue(e.target.value)}
                        className="input py-1.5 text-sm"
                        placeholder="Ex: Teorema de Tales, Lei dos Gases…"
                      />
                    </div>
                    <div>
                      <label htmlFor="erro-obs-detail" className="mb-1 block text-xs font-bold">Observações e motivo do erro</label>
                      <textarea
                        id="erro-obs-detail"
                        value={obsValue}
                        onChange={(e) => setObsValue(e.target.value)}
                        className="input min-h-[80px] resize-y text-sm"
                        placeholder="Suas anotações pessoais sobre esta questão…"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingObs(false)} className="btn bg-white px-3 py-1.5 text-xs dark:border-papel dark:bg-transparent dark:text-papel">
                        Cancelar
                      </button>
                      <button onClick={handleSaveObs} disabled={savingObs} className="btn bg-pato px-3 py-1.5 text-xs text-tinta dark:border-papel">
                        <Save size={14} strokeWidth={3} /> {savingObs ? 'Salvando…' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={cn(
                    'whitespace-pre-wrap text-sm font-semibold leading-relaxed',
                    selectedEntry.observacoes ? 'text-tinta dark:text-papel' : 'italic text-muted dark:text-papel/40',
                  )}>
                    {selectedEntry.observacoes || 'Nenhuma observação extra registrada.'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t-[3px] border-tinta px-5 py-3.5 dark:border-papel/50 sm:px-6">
              <button
                onClick={() => handleDelete(selectedEntry)}
                disabled={acting}
                className="btn bg-white px-3 py-2 text-sm text-tinta hover:bg-bico dark:border-papel dark:bg-transparent dark:text-papel"
              >
                <Trash2 size={16} strokeWidth={2.8} /> Excluir
              </button>
              {selectedEntry.status === 'pendente' && (
                <button
                  onClick={() => handleMarkReviewed(selectedEntry)}
                  disabled={acting}
                  className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel"
                >
                  <CheckCircle2 size={16} strokeWidth={2.8} /> Marcar como revisado
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
            <div className="flex items-center gap-2 rounded-[14px] border-[3px] border-papel bg-tinta px-3.5 py-1.5 font-display text-xs font-bold text-papel">
              <span>Visualizador</span>
              <span className="text-papel/40">|</span>
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-papel bg-tinta text-papel transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <Icon size={18} strokeWidth={2.8} />
                </button>
              ))}
              <button
                onClick={() => { setFullscreenImage(null); setZoomLevel(1); }}
                aria-label="Fechar visualização"
                className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-papel bg-bico text-tinta"
              >
                <X size={20} strokeWidth={2.8} />
              </button>
            </div>
          </div>

          <div className="flex max-h-full max-w-full items-center justify-center overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <img
              src={fullscreenImage}
              alt="Questão ampliada"
              className="max-h-[85vh] max-w-[90vw] cursor-zoom-in rounded-[16px] border-[3px] border-papel object-contain transition-transform duration-150"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={() => setZoomLevel(z => (z === 1 ? 1.75 : 1))}
            />
          </div>

          <p className="absolute bottom-4 rounded-full border-[3px] border-papel bg-tinta px-4 py-1.5 text-xs font-bold text-papel">
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
