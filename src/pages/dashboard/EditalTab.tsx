import { useState } from 'react';
import Modal from '../../components/Modal';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Plus } from 'lucide-react';
import { getSubjectSimulationQuestions } from '../../lib/simulationUtils';
import { cn } from '../../lib/theme';

type Props = {
  onOpenSubject: (id: string) => void;
  onOpenErrorNotebook?: (subjectId: string, topicId?: string) => void;
};

export default function EditalTab({ onOpenSubject, onOpenErrorNotebook }: Props) {
  const { subjects, topics, sessions, simulations, topicCompletions, errorNotebook, refreshData } = useApp();
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
    const sessionQuestionsAnswered = questionsCorrect + questionsWrong;

    // Questões provenientes de simulados para esta matéria
    const simSubQuestions = simulations.reduce((acc, sim) => {
      const q = getSubjectSimulationQuestions(sim, sub.id, sub.name, sub.area);
      return {
        total: acc.total + q.total,
        correct: acc.correct + q.correct,
      };
    }, { total: 0, correct: 0 });

    const totalQuestionsCorrect = questionsCorrect + simSubQuestions.correct;
    const totalQuestionsAnswered = sessionQuestionsAnswered + simSubQuestions.total;
    const accuracy = totalQuestionsAnswered > 0
      ? Math.round((totalQuestionsCorrect / totalQuestionsAnswered) * 100)
      : null;
    return {
      ...sub, subTopics, progress, sessionCount,
      completedCount: completedTopicIds.size, errorCount,
      questionsAnswered: totalQuestionsAnswered, accuracy,
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

  const [selectedArea, setSelectedArea] = useState<string>('Todas');

  const visibleAreas = selectedArea === 'Todas'
    ? areas
    : areas.filter(a => a.toLowerCase().includes(selectedArea.toLowerCase()) || selectedArea.toLowerCase().includes(a.toLowerCase()));

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
            Edital ENEM
          </h1>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Acompanhe o preenchimento de cada matéria com retenção e precisão.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Adicionar tópico</span>
        </button>
      </div>

      {/* Pílulas de filtro de Área (conforme screenshot Mobile e Web) */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['Todas', ...areas].map(area => {
          const active = selectedArea === area;
          // Shorten label for clean pills if needed: "Linguagens, Códigos e suas Tecnologias" -> "Linguagens"
          const displayLabel = area === 'Todas'
            ? 'Todas'
            : area.includes('Linguagens')
            ? 'Linguagens'
            : area.includes('Natureza')
            ? 'Natureza'
            : area.includes('Humanas')
            ? 'Humanas'
            : area.includes('Matemática')
            ? 'Matemática'
            : area;

          return (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                active
                  ? 'bg-[#00D64B]/15 text-[#008E32] border border-[#00D64B]/40 dark:text-[#19E85F] shadow-xs'
                  : 'bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-[#645F78] dark:text-[#9D96B8] hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {visibleAreas.map(area => (
        <section key={area} className="mb-8">
          {/* Cabeçalho da área */}
          <div className="mb-3.5 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: areaColor(area) }}
            />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              {area}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topicsBySubject.filter(s => s.area === area).map(sub => (
              <article
                key={sub.id}
                onClick={() => onOpenSubject(sub.id)}
                className="group flex flex-col justify-between rounded-[22px] bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer border border-slate-200/70 dark:border-white/5 dark:bg-[#151826]"
              >
                <div>
                  {/* Top row: dot + title + percentage pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: sub.color }}
                      />
                      <h3 className="truncate font-display text-base font-bold text-[#14102A] group-hover:text-[#008E32] dark:text-white dark:group-hover:text-[#19E85F] transition-colors">
                        {sub.name}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold',
                        sub.progress > 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-400'
                      )}
                    >
                      {sub.progress}%
                    </span>
                  </div>

                  {/* Progress Bar (vivid neon green) */}
                  <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#00D64B] dark:bg-[#19E85F]"
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>

                  {/* Stats text */}
                  <div className="mt-3.5 space-y-1">
                    <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                      {sub.subTopics.length} {sub.subTopics.length === 1 ? 'tópico' : 'tópicos'} · {sub.sessionCount} {sub.sessionCount === 1 ? 'sessão' : 'sessões'}
                    </p>
                    <p className="text-xs font-semibold text-[#14102A] dark:text-white">
                      Questões: <span className="font-bold">{sub.questionsAnswered}</span>
                      {sub.accuracy !== null && (
                        <>
                          <span className="mx-1 text-[#645F78] dark:text-[#9D96B8] font-normal">·</span>
                          <span className="font-bold">{sub.accuracy}%</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Erros pendentes tag */}
                {sub.errorCount > 0 && (
                  <div className="mt-3.5 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenErrorNotebook) onOpenErrorNotebook(sub.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/15 transition-colors"
                    >
                      <span>{sub.errorCount} {sub.errorCount === 1 ? 'erro pendente' : 'erros pendentes'}</span>
                    </button>
                  </div>
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
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddTopic}
              disabled={saving || !newTopicName.trim() || !selectedSubject}
              className="px-5 py-2 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-sm font-bold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando…' : 'Adicionar'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="nova-materia" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Matéria
            </label>
            <select
              id="nova-materia"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
            >
              <option value="">Selecione uma matéria…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="novo-topico" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Nome do tópico
            </label>
            <input
              id="novo-topico"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
              placeholder="Ex: Funções do 2º grau"
            />
          </div>
          <div>
            <label htmlFor="novo-topico-desc" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Descrição <span className="font-normal opacity-70">(opcional)</span>
            </label>
            <textarea
              id="novo-topico-desc"
              value={newTopicDesc}
              onChange={e => setNewTopicDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B] min-h-[70px] resize-y"
              placeholder="Ex: Estudo de funções quadráticas, raízes, vértice e gráficos…"
              rows={2}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
