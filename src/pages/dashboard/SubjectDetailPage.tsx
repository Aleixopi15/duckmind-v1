import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Plus, Check, Trash2, Pencil, Save, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/theme';
import Modal from '../../components/Modal';

type Props = { subjectId: string; onBack: () => void };

export default function SubjectDetailPage({ subjectId, onBack }: Props) {
  const { subjects, topics, sessions, topicCompletions, toggleTopicCompletion, refreshData } = useApp();
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
  const subjectQuestionsCorrect = subjectQuestions.reduce((a, s) => a + s.questions_correct, 0);
  const subjectQuestionsWrong = subjectQuestions.reduce((a, s) => a + s.questions_wrong, 0);
  const subjectQuestionsAnswered = subjectQuestionsCorrect + subjectQuestionsWrong;
  const subjectAccuracy = subjectQuestionsAnswered > 0 ? Math.round((subjectQuestionsCorrect / subjectQuestionsAnswered) * 100) : null;

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    setSaving(true);
    await supabase.from('topics').insert({
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
      <button
        onClick={onBack}
        className="group mb-5 inline-flex items-center gap-2 rounded-[14px] border-[3px] border-tinta bg-white px-3.5 py-1.5 text-sm font-bold text-tinta transition-transform hover:-translate-x-0.5 dark:border-papel dark:bg-transparent dark:text-papel"
      >
        <ArrowLeft size={16} strokeWidth={2.8} />
        <span>Voltar ao Edital</span>
      </button>

      {/* Cabeçalho da matéria — variante "Sobre Tinta" */}
      <section className="card mb-6 border-tinta bg-tinta p-5 text-papel dark:border-papel sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-[220px] flex-1 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border-[3px] border-papel bg-tinta">
              <span className="h-6 w-6 rounded-full border-[3px] border-papel" style={{ background: subject.color }} />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[13px] font-extrabold uppercase tracking-[0.08em] text-pato">{subject.area}</p>
              <h1 className="truncate font-display text-[2rem] font-bold leading-tight text-papel sm:text-[2.4rem]">
                {subject.name}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 gap-2.5">
            {[
              { value: subTopics.length, label: 'tópicos' },
              { value: completedTopicIds.size, label: 'concluídos' },
              { value: subjectQuestionsAnswered, label: 'questões' },
            ].map(box => (
              <div key={box.label} className="rounded-[16px] border-[3px] border-papel px-3.5 py-1.5 text-center">
                <div className="font-display text-2xl font-bold leading-tight">{box.value}</div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-papel/70">{box.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t-[3px] border-papel/25 pt-4">
          <div className="mb-2 flex items-center justify-between gap-2 text-[15px] font-bold">
            <span>Progresso da matéria</span>
            <span className="text-pato">{progress}%</span>
          </div>
          <div className="track w-full" style={{ height: 16, background: '#17102B', borderColor: '#FFF9EC' }}>
            <div style={{ width: `${progress}%`, background: '#00D64B', borderRightColor: '#FFF9EC' }} />
          </div>
          {subjectAccuracy !== null && (
            <p className="mt-2.5 text-sm font-semibold text-papel/75">
              Aproveitamento em simulados/exercícios: <b className="text-pato">{subjectAccuracy}%</b>{' '}
              <span className="text-papel/50">({subjectQuestionsCorrect} acertos de {subjectQuestionsAnswered})</span>
            </p>
          )}
        </div>
      </section>

      {/* Tópicos */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta dark:text-papel">Tópicos do Edital</h2>
          <p className="text-sm font-semibold text-muted dark:text-papel/60">Marque os conteúdos conforme for dominando</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn shrink-0 bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
          <Plus size={16} strokeWidth={3} /> Adicionar tópico
        </button>
      </div>

      {subTopics.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="mb-3 text-sm font-semibold text-muted dark:text-papel/60">
            Nenhum tópico cadastrado para esta matéria ainda.
          </p>
          <button onClick={() => setAddOpen(true)} className="btn inline-flex bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
            <Plus size={16} strokeWidth={3} /> Adicionar primeiro tópico
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
              <article key={topic.id} className={cn('card flex items-center gap-3.5 p-4', isCompleted && 'bg-pato/10')}>
                <button
                  onClick={() => toggleTopicCompletion(topic.id)}
                  aria-label={isCompleted ? 'Desmarcar tópico' : 'Marcar como concluído'}
                  className={cn(
                    'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[3px] border-tinta transition-transform active:scale-90 dark:border-papel',
                    isCompleted ? 'bg-pato text-tinta' : 'bg-papel dark:bg-transparent',
                  )}
                >
                  {isCompleted && <Check size={16} strokeWidth={3.4} />}
                </button>

                <div className="min-w-0 flex-1">
                  <h3
                    className={cn(
                      'font-display text-lg font-bold transition-all',
                      isCompleted ? 'text-muted line-through dark:text-papel/50' : 'text-tinta dark:text-papel',
                    )}
                  >
                    {topic.name}
                  </h3>

                  {isEditingDesc ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        value={editDescValue}
                        onChange={(e) => setEditDescValue(e.target.value)}
                        className="input min-h-[56px] resize-y text-sm"
                        placeholder="Descrição do tópico…"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        <button onClick={() => handleSaveDesc(topic.id)} disabled={savingDesc} className="btn bg-pato px-3 py-1 text-xs text-tinta dark:border-papel">
                          <Save size={12} strokeWidth={3} /> {savingDesc ? '…' : 'Salvar'}
                        </button>
                        <button onClick={() => setEditingTopicId(null)} className="btn bg-white px-3 py-1 text-xs dark:border-papel dark:bg-transparent dark:text-papel">
                          <X size={12} strokeWidth={3} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {topic.description ? (
                        <span className="text-sm font-semibold text-muted dark:text-papel/60">{topic.description}</span>
                      ) : (
                        <button
                          onClick={() => startEditDesc(topic.id, topic.description)}
                          className="text-sm font-semibold italic text-muted/70 hover:text-mente dark:text-papel/45 dark:hover:text-pato"
                        >
                          + adicionar descrição
                        </button>
                      )}
                      {topic.description && (
                        <button
                          onClick={() => startEditDesc(topic.id, topic.description)}
                          aria-label="Editar descrição"
                          className="shrink-0 rounded p-0.5 text-muted hover:text-mente dark:text-papel/50 dark:hover:text-pato"
                        >
                          <Pencil size={12} strokeWidth={2.8} />
                        </button>
                      )}
                    </div>
                  )}

                  <p className="mt-1 text-sm font-bold text-tinta/80 dark:text-papel/70">
                    {topicSessions.length > 0
                      ? `${topicSessions.length} sessõe${topicSessions.length !== 1 ? 's' : 'ão'} · ${Math.floor(topicSessions.reduce((a, s) => a + s.duration_minutes, 0))}min`
                      : 'Não estudado'}
                    {topicQTotal > 0 && (
                      <>
                        <span className="mx-1.5 text-muted dark:text-papel/40">·</span>
                        Questões: <b className="font-display">{topicQTotal}</b>
                        <span className="mx-1.5 text-muted dark:text-papel/40">·</span>
                        <span className="font-display">{topicAcc}%</span>
                      </>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => setDeleteTopicId(topic.id)}
                  aria-label="Excluir tópico"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-tinta bg-white text-tinta transition-colors hover:bg-bico dark:border-papel dark:bg-transparent dark:text-papel"
                >
                  <Trash2 size={14} strokeWidth={2.8} />
                </button>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Novo Tópico"
        size="sm"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
              Cancelar
            </button>
            <button onClick={handleAddTopic} disabled={saving || !newTopicName.trim()} className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
              {saving ? 'Salvando…' : 'Adicionar'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="topico-nome" className="mb-1.5 block text-sm font-bold">Nome do tópico</label>
            <input
              id="topico-nome"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              className="input"
              placeholder="Ex: Funções do 2º grau"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="topico-desc" className="mb-1.5 block text-sm font-bold">
              Descrição <span className="font-semibold text-muted dark:text-papel/50">(opcional)</span>
            </label>
            <textarea
              id="topico-desc"
              value={newTopicDesc}
              onChange={e => setNewTopicDesc(e.target.value)}
              className="input min-h-[70px] resize-y"
              placeholder="Ex: Estudo de funções quadráticas, raízes, vértice e gráficos…"
              rows={2}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteTopicId !== null}
        onClose={() => setDeleteTopicId(null)}
        title="Excluir Tópico"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteTopicId(null)} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
              Cancelar
            </button>
            <button onClick={handleConfirmDelete} className="btn bg-bico px-4 py-2 text-sm text-tinta dark:border-papel">
              Excluir
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-bold text-tinta dark:text-papel">
            <AlertTriangle size={20} strokeWidth={2.8} />
            <span>Tem certeza que deseja excluir este tópico?</span>
          </div>
          <p className="text-sm font-semibold text-muted dark:text-papel/60">
            O tópico <strong className="text-tinta dark:text-papel">{deleteTopic?.name}</strong> será removido do edital. As questões do caderno de erros vinculadas a ele perderão o vínculo, mas não serão excluídas.
          </p>
        </div>
      </Modal>
    </div>
  );
}
