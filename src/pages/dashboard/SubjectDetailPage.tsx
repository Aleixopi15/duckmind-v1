import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Plus, Check, Trash2, Pencil, Save, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/theme';
import Modal from '../../components/Modal';
import { getSubjectSimulationQuestions } from '../../lib/simulationUtils';

type Props = { subjectId: string; onBack: () => void };

export default function SubjectDetailPage({ subjectId, onBack }: Props) {
  const { user, subjects, topics, sessions, simulations, topicCompletions, toggleTopicCompletion, refreshData } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editDescValue, setEditDescValue] = useState('');
  const [savingDesc, setSavingDesc] = useState(false);
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);

  const subject = subjects.find(s => s.id === subjectId);
  const deleteTopic = topics.find(t => t.id === deleteTopicId);

  if (!subject) {
    return (
      <div className="animate-fade-in">
        <button onClick={onBack} className="btn mb-4 bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
          <ArrowLeft size={16} strokeWidth={2.8} /> Voltar
        </button>
        <p className="font-semibold text-muted dark:text-papel/60">Matéria não encontrada.</p>
      </div>
    );
  }

  const subTopics = topics.filter(t => t.subject_id === subjectId).sort((a, b) => a.order_index - b.order_index);
  const completedTopicIds = new Set(topicCompletions.filter(tc => subTopics.some(t => t.id === tc.topic_id)).map(tc => tc.topic_id));
  const progress = subTopics.length > 0 ? Math.round((completedTopicIds.size / subTopics.length) * 100) : 0;
  const subSessions = sessions.filter(s => s.subject_id === subjectId);

  const subjectQuestions = subSessions.filter(s => s.study_type === 'questoes' || s.study_type === 'revisao');
  const sessionQuestionsCorrect = subjectQuestions.reduce((a, s) => a + s.questions_correct, 0);
  const sessionQuestionsWrong = subjectQuestions.reduce((a, s) => a + s.questions_wrong, 0);
  const sessionQuestionsAnswered = sessionQuestionsCorrect + sessionQuestionsWrong;

  // Questões provenientes de simulados para esta matéria
  const simSubQuestions = simulations.reduce((acc, sim) => {
    const q = getSubjectSimulationQuestions(sim, subjectId, subject.name, subject.area);
    return {
      total: acc.total + q.total,
      correct: acc.correct + q.correct,
    };
  }, { total: 0, correct: 0 });

  const subjectQuestionsCorrect = sessionQuestionsCorrect + simSubQuestions.correct;
  const subjectQuestionsAnswered = sessionQuestionsAnswered + simSubQuestions.total;
  const subjectAccuracy = subjectQuestionsAnswered > 0 ? Math.round((subjectQuestionsCorrect / subjectQuestionsAnswered) * 100) : null;

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    setSaving(true);
    await supabase.from('topics').insert({
      ...(user?.id ? { user_id: user.id } : {}),
      subject_id: subjectId,
      name: newTopicName.trim(),
      order_index: subTopics.length,
      description: newTopicDesc.trim() || null,
    });
    setNewTopicName(''); setNewTopicDesc(''); setAddOpen(false);
    await refreshData();
    setSaving(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTopicId) return;
    await supabase.from('topics').delete().eq('id', deleteTopicId);
    await refreshData();
    setDeleteTopicId(null);
  };

  const handleSaveDesc = async (topicId: string) => {
    setSavingDesc(true);
    await supabase.from('topics').update({ description: editDescValue.trim() || null }).eq('id', topicId);
    await refreshData();
    setEditingTopicId(null);
    setSavingDesc(false);
  };

  const startEditDesc = (topicId: string, currentDesc: string | null) => {
    setEditingTopicId(topicId);
    setEditDescValue(currentDesc ?? '');
  };

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      {/* Botão Voltar */}
      <button
        onClick={onBack}
        className="group mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs font-bold text-[#14102A] shadow-xs transition-all hover:bg-slate-50 dark:border-white/5 dark:bg-[#151826] dark:text-white dark:hover:bg-white/10"
      >
        <ArrowLeft size={14} strokeWidth={2.6} className="transition-transform group-hover:-translate-x-0.5" />
        <span>Voltar ao Edital</span>
      </button>

      {/* Cabeçalho da matéria */}
      <section className="mb-6 rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/5 dark:bg-[#151826] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-[220px] flex-1 items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs"
              style={{ background: `${subject.color}18` }}
            >
              <span className="h-4 w-4 rounded-full" style={{ background: subject.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                {subject.area}
              </p>
              <h1 className="truncate font-display text-2xl sm:text-3xl font-bold text-[#14102A] dark:text-white">
                {subject.name}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 gap-2 sm:gap-3">
            {[
              { value: subTopics.length, label: 'tópicos' },
              { value: completedTopicIds.size, label: 'concluídos' },
              { value: subjectQuestionsAnswered, label: 'questões' },
            ].map(box => (
              <div
                key={box.label}
                className="rounded-2xl border border-slate-200/60 bg-slate-50/80 px-4 py-2 text-center dark:border-white/5 dark:bg-white/5 min-w-[80px]"
              >
                <div className="font-display text-xl sm:text-2xl font-bold text-[#14102A] dark:text-white">{box.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">{box.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progresso da matéria */}
        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-white/5">
          <div className="mb-2 flex items-center justify-between text-xs font-bold">
            <span className="text-[#645F78] dark:text-[#9D96B8]">Progresso do edital</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{progress}% concluído</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#00D64B] dark:bg-[#19E85F]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {subjectAccuracy !== null && (
            <p className="mt-3 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
              Aproveitamento em simulados/exercícios: <span className="font-bold text-emerald-600 dark:text-emerald-400">{subjectAccuracy}%</span>{' '}
              <span className="opacity-70">({subjectQuestionsCorrect} acertos de {subjectQuestionsAnswered} respondidas)</span>
            </p>
          )}
        </div>
      </section>

      {/* Seção Tópicos */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#14102A] dark:text-white">
            Tópicos do Edital
          </h2>
          <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
            Marque os conteúdos conforme for dominando a matéria
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={3} />
          <span>Adicionar tópico</span>
        </button>
      </div>

      {subTopics.length === 0 ? (
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-10 text-center shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <p className="mb-4 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Nenhum tópico cadastrado para esta matéria ainda.
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all"
          >
            <Plus size={15} strokeWidth={3} />
            <span>Adicionar primeiro tópico</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subTopics.map(topic => {
            const isCompleted = completedTopicIds.has(topic.id);
            const topicSessions = sessions.filter(s => s.topic_id === topic.id);
            const topicQuestions = topicSessions.filter(s => s.study_type === 'questoes' || s.study_type === 'revisao');
            const topicQCorrect = topicQuestions.reduce((a, s) => a + s.questions_correct, 0);
            const topicQWrong = topicQuestions.reduce((a, s) => a + s.questions_wrong, 0);
            const topicQTotal = topicQCorrect + topicQWrong;
            const topicAcc = topicQTotal > 0 ? Math.round((topicQCorrect / topicQTotal) * 100) : null;
            const isEditingDesc = editingTopicId === topic.id;
            return (
              <article
                key={topic.id}
                className={cn(
                  'group flex items-center gap-3.5 rounded-[20px] border p-4 shadow-xs transition-all',
                  isCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 dark:border-emerald-500/10'
                    : 'border-slate-200/70 bg-white hover:border-slate-300 dark:border-white/5 dark:bg-[#151826] dark:hover:border-white/10'
                )}
              >
                <button
                  onClick={() => toggleTopicCompletion(topic.id)}
                  aria-label={isCompleted ? 'Desmarcar tópico' : 'Marcar como concluído'}
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95',
                    isCompleted
                      ? 'border-emerald-500 bg-[#00D64B] text-[#14102A] shadow-xs'
                      : 'border-slate-300 bg-white hover:border-[#00D64B] dark:border-white/20 dark:bg-white/5'
                  )}
                >
                  {isCompleted && <Check size={14} strokeWidth={3.2} />}
                </button>

                <div className="min-w-0 flex-1">
                  <h3
                    className={cn(
                      'font-display text-base font-bold transition-all',
                      isCompleted
                        ? 'text-[#645F78] line-through dark:text-white/40'
                        : 'text-[#14102A] dark:text-white'
                    )}
                  >
                    {topic.name}
                  </h3>

                  {isEditingDesc ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        value={editDescValue}
                        onChange={(e) => setEditDescValue(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B] min-h-[56px] resize-y"
                        placeholder="Descrição do tópico…"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveDesc(topic.id)}
                          disabled={savingDesc}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00D64B] text-[#14102A] text-xs font-bold"
                        >
                          <Save size={12} strokeWidth={2.8} /> {savingDesc ? '…' : 'Salvar'}
                        </button>
                        <button
                          onClick={() => setEditingTopicId(null)}
                          className="px-3 py-1 rounded-full text-xs font-semibold text-[#645F78] dark:text-[#9D96B8] hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                          <X size={12} strokeWidth={2.8} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {topic.description ? (
                        <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">{topic.description}</span>
                      ) : (
                        <button
                          onClick={() => startEditDesc(topic.id, topic.description)}
                          className="text-xs font-medium text-emerald-600/80 hover:text-emerald-600 dark:text-emerald-400/80 dark:hover:text-emerald-400"
                        >
                          + adicionar descrição
                        </button>
                      )}
                      {topic.description && (
                        <button
                          onClick={() => startEditDesc(topic.id, topic.description)}
                          aria-label="Editar descrição"
                          className="shrink-0 rounded p-0.5 text-muted hover:text-tinta dark:text-white/40 dark:hover:text-white"
                        >
                          <Pencil size={11} strokeWidth={2.4} />
                        </button>
                      )}
                    </div>
                  )}

                  <p className="mt-1 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                    {topicSessions.length > 0
                      ? `${topicSessions.length} sessõe${topicSessions.length !== 1 ? 's' : 'ão'} · ${Math.floor(topicSessions.reduce((a, s) => a + s.duration_minutes, 0))}min`
                      : 'Não estudado'}
                    {topicQTotal > 0 && (
                      <>
                        <span className="mx-1.5 opacity-40">·</span>
                        Questões: <span className="font-bold text-[#14102A] dark:text-white">{topicQTotal}</span>
                        <span className="mx-1.5 opacity-40">·</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{topicAcc}%</span>
                      </>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => setDeleteTopicId(topic.id)}
                  aria-label="Excluir tópico"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <Trash2 size={14} strokeWidth={2.4} />
                </button>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Adicionar Tópico */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Novo Tópico"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddTopic}
              disabled={saving || !newTopicName.trim()}
              className="px-5 py-2 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Adicionar'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="topico-nome" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Nome do tópico
            </label>
            <input
              id="topico-nome"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
              placeholder="Ex: Funções do 2º grau"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="topico-desc" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Descrição <span className="font-normal opacity-70">(opcional)</span>
            </label>
            <textarea
              id="topico-desc"
              value={newTopicDesc}
              onChange={e => setNewTopicDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B] min-h-[70px] resize-y"
              placeholder="Ex: Estudo de funções quadráticas, raízes, vértice e gráficos…"
              rows={2}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Excluir Tópico */}
      <Modal
        open={deleteTopicId !== null}
        onClose={() => setDeleteTopicId(null)}
        title="Excluir Tópico"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTopicId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              Excluir
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400">
            <AlertTriangle size={18} strokeWidth={2.4} />
            <span>Tem certeza que deseja excluir este tópico?</span>
          </div>
          <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8] leading-relaxed">
            O tópico <strong className="text-[#14102A] dark:text-white">{deleteTopic?.name}</strong> será removido do edital. As questões do caderno de erros vinculadas a ele perderão o vínculo, mas não serão excluídas.
          </p>
        </div>
      </Modal>
    </div>
  );
}
