import { useState } from 'react';
import Modal from '../../components/Modal';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Plus, ChevronRight, AlertCircle } from 'lucide-react';

type Props = {
  onOpenSubject: (id: string) => void;
  onOpenErrorNotebook?: (subjectId: string, topicId?: string) => void;
};

export default function EditalTab({ onOpenSubject, onOpenErrorNotebook }: Props) {
  const { subjects, topics, sessions, topicCompletions, errorNotebook, refreshData } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [saving, setSaving] = useState(false);

  const errorCountBySubject = new Map<string, number>();
  errorNotebook.forEach(e => {
    errorCountBySubject.set(e.subject_id, (errorCountBySubject.get(e.subject_id) ?? 0) + 1);
  });

  const topicsBySubject = subjects.map(sub => {
    const subTopics = topics.filter(t => t.subject_id === sub.id);
    const completedTopicIds = new Set(
      topicCompletions
        .filter(tc => subTopics.some(t => t.id === tc.topic_id))
        .map(tc => tc.topic_id)
    );
    const progress = subTopics.length > 0
      ? Math.round((completedTopicIds.size / subTopics.length) * 100)
      : 0;
    const sessionCount = sessions.filter(s => s.subject_id === sub.id).length;
    const errorCount = errorCountBySubject.get(sub.id) ?? 0;
    const subjectQuestions = sessions.filter(s =>
      s.subject_id === sub.id && (s.study_type === 'questoes' || s.study_type === 'revisao')
    );
    const questionsCorrect = subjectQuestions.reduce((sum, s) => sum + s.questions_correct, 0);
    const questionsWrong = subjectQuestions.reduce((sum, s) => sum + s.questions_wrong, 0);
    const questionsAnswered = questionsCorrect + questionsWrong;
    const accuracy = questionsAnswered > 0
      ? Math.round((questionsCorrect / questionsAnswered) * 100)
      : null;
    return {
      ...sub, subTopics, progress, sessionCount,
      completedCount: completedTopicIds.size, errorCount,
      questionsAnswered, accuracy,
    };
  });

  const areas = [...new Set(subjects.map(s => s.area))];

  const areaColor = (area: string) => {
    const first = subjects.find(s => s.area === area);
    return first?.color ?? '#6F00D6';
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim() || !selectedSubject) return;
    setSaving(true);
    const maxOrder = topics.filter(t => t.subject_id === selectedSubject).length;
    await supabase.from('topics').insert({
      subject_id: selectedSubject,
      name: newTopicName.trim(),
      order_index: maxOrder,
      description: newTopicDesc.trim() || null,
    });
    setNewTopicName(''); setNewTopicDesc(''); setDialogOpen(false);
    await refreshData();
    setSaving(false);
  };

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      {/* Cabeçalho */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-papel sm:text-[2.6rem]">
            Edital ENEM
          </h1>
          <p className="mt-1 text-[17px] font-semibold text-muted dark:text-papel/70">
            Acompanhe o preenchimento de cada matéria com retenção e precisão.
          </p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="btn shrink-0 bg-pato px-5 py-2.5 text-tinta dark:border-papel">
          <Plus size={18} strokeWidth={3} /> Adicionar tópico
        </button>
      </div>

      {areas.map(area => (
        <section key={area} className="mb-7">
          {/* Cabeçalho da área */}
          <div className="mb-3.5 flex items-center gap-2.5">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-tinta dark:border-papel"
              style={{ background: areaColor(area) }}
            />
            <h2 className="text-[13px] font-extrabold uppercase tracking-[0.09em] text-tinta dark:text-papel">
              {area}
            </h2>
            <span className="dm-rule" style={{ opacity: 0.35 }} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topicsBySubject.filter(s => s.area === area).map(sub => (
              <article
                key={sub.id}
                onClick={() => onOpenSubject(sub.id)}
                className="card card-hover flex cursor-pointer flex-col gap-2.5 p-4"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-tinta dark:border-papel"
                    style={{ background: sub.color }}
                  />
                  <h3 className="min-w-0 flex-1 truncate font-display text-xl font-bold text-tinta dark:text-papel">
                    {sub.name}
                  </h3>
                  <span className="shrink-0 rounded-[12px] border-[3px] border-tinta bg-papel px-2 py-0.5 font-display text-sm font-bold text-tinta dark:border-papel dark:bg-transparent dark:text-papel">
                    {sub.progress}%
                  </span>
                </div>

                <div className="track w-full" style={{ height: 12 }}>
                  <div style={{ width: `${sub.progress}%`, background: sub.color }} />
                </div>

                <p className="text-sm font-semibold text-muted dark:text-papel/60">
                  {sub.subTopics.length} tópicos · {sub.completedCount} concluídos · {sub.sessionCount} {sub.sessionCount === 1 ? 'sessão' : 'sessões'}
                </p>

                <p className="text-sm font-semibold text-tinta dark:text-papel/80">
                  Questões: <b className="font-display">{sub.questionsAnswered}</b>
                  <span className="mx-1.5 text-muted dark:text-papel/40">·</span>
                  Aproveitamento: <b className="font-display">{sub.accuracy !== null ? `${sub.accuracy}%` : '–'}</b>
                </p>

                {sub.errorCount > 0 && onOpenErrorNotebook && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenErrorNotebook(sub.id); }}
                    className="mt-1 flex w-full items-center gap-2 rounded-[12px] border-[3px] border-tinta bg-bico px-2.5 py-1.5 text-[13px] font-bold text-tinta transition-transform hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] dark:border-papel"
                  >
                    <AlertCircle size={14} strokeWidth={2.8} className="shrink-0" />
                    <span>{sub.errorCount} {sub.errorCount === 1 ? 'erro pendente' : 'erros pendentes'}</span>
                    <ChevronRight size={14} strokeWidth={3} className="ml-auto" />
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Novo Tópico"
        size="sm"
        footer={
          <>
            <button onClick={() => setDialogOpen(false)} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
              Cancelar
            </button>
            <button
              onClick={handleAddTopic}
              disabled={saving || !newTopicName.trim() || !selectedSubject}
              className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel"
            >
              {saving ? 'Salvando…' : 'Adicionar'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="nova-materia" className="mb-1.5 block text-sm font-bold">Matéria</label>
            <select id="nova-materia" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="input">
              <option value="">Selecione…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="novo-topico" className="mb-1.5 block text-sm font-bold">Nome do tópico</label>
            <input
              id="novo-topico"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              className="input"
              placeholder="Ex: Funções do 2º grau"
            />
          </div>
          <div>
            <label htmlFor="novo-topico-desc" className="mb-1.5 block text-sm font-bold">
              Descrição <span className="font-semibold text-muted dark:text-papel/50">(opcional)</span>
            </label>
            <textarea
              id="novo-topico-desc"
              value={newTopicDesc}
              onChange={e => setNewTopicDesc(e.target.value)}
              className="input min-h-[70px] resize-y"
              placeholder="Ex: Estudo de funções quadráticas, raízes, vértice e gráficos…"
              rows={2}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
