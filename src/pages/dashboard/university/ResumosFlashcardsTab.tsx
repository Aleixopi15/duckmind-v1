import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/theme';
import Modal from '../../../components/Modal';
import {
  Brain,
  RotateCw,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Search,
} from 'lucide-react';
import type { UniversityFlashcard, UniversityFlashcardStatus } from '../../../lib/supabase';

export default function ResumosFlashcardsTab() {
  const {
    universitySubjects,
    universityFlashcards,
    addUniversityFlashcard,
    updateUniversityFlashcard,
    deleteUniversityFlashcard,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'study' | 'library'>('study');

  // Study Mode state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<UniversityFlashcard | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [summaryTopic, setSummaryTopic] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [status, setStatus] = useState<UniversityFlashcardStatus>('novo');
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingCard(null);
    setSubjectId(universitySubjects[0]?.id ?? '');
    setSummaryTopic('');
    setFront('');
    setBack('');
    setStatus('novo');
    setModalOpen(true);
  };

  const openEdit = (card: UniversityFlashcard) => {
    setEditingCard(card);
    setSubjectId(card.subject_id);
    setSummaryTopic(card.summary_topic || '');
    setFront(card.front);
    setBack(card.back);
    setStatus(card.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !front.trim() || !back.trim()) return;

    setSaving(true);
    if (editingCard) {
      await updateUniversityFlashcard(editingCard.id, {
        subject_id: subjectId,
        summary_topic: summaryTopic.trim(),
        front: front.trim(),
        back: back.trim(),
        status,
      });
    } else {
      await addUniversityFlashcard({
        subject_id: subjectId,
        summary_topic: summaryTopic.trim(),
        front: front.trim(),
        back: back.trim(),
        status,
      });
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleRateCard = async (newStatus: UniversityFlashcardStatus) => {
    const card = studyCards[currentCardIndex];
    if (!card) return;
    await updateUniversityFlashcard(card.id, {
      status: newStatus,
      last_reviewed_at: new Date().toISOString(),
    });
    setIsFlipped(false);
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const filteredCards = universityFlashcards.filter(c => {
    if (selectedSubjectId !== 'all' && c.subject_id !== selectedSubjectId) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        (c.summary_topic && c.summary_topic.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const studyCards = selectedSubjectId === 'all'
    ? universityFlashcards
    : universityFlashcards.filter(c => c.subject_id === selectedSubjectId);

  const currentStudyCard = studyCards[currentCardIndex];
  const activeSubject = currentStudyCard ? universitySubjects.find(s => s.id === currentStudyCard.subject_id) : null;

  const totalMastered = universityFlashcards.filter(c => c.status === 'dominado').length;
  const masteryPct = universityFlashcards.length > 0 ? Math.round((totalMastered / universityFlashcards.length) * 100) : 0;

  return (
    <div className="w-full max-w-5xl min-w-0 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
            Resumos e Flashcards
          </h1>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Repetição espaçada e retenção de teoremas, algoritmos, fórmulas e conceitos universitários.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de Modo */}
          <div className="flex items-center rounded-full bg-slate-100 p-1 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
            <button
              onClick={() => { setActiveView('study'); setIsFlipped(false); }}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                activeView === 'study'
                  ? 'bg-white text-tinta shadow-xs dark:bg-[#131024] dark:text-white'
                  : 'text-muted hover:text-tinta dark:hover:text-white'
              )}
            >
              Modo Estudo
            </button>
            <button
              onClick={() => setActiveView('library')}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                activeView === 'library'
                  ? 'bg-white text-tinta shadow-xs dark:bg-[#131024] dark:text-white'
                  : 'text-muted hover:text-tinta dark:hover:text-white'
              )}
            >
              Biblioteca ({universityFlashcards.length})
            </button>
          </div>

          <button
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00D64B] px-4 py-2 text-xs font-bold text-[#14102A] shadow-[0_4px_16px_rgba(25,232,95,0.3)] transition-all hover:bg-[#19E85F] active:scale-[0.98] dark:bg-[#19E85F]"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Novo Flashcard</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">Total de Cards</div>
          <div className="mt-2 text-2xl font-display font-bold text-[#14102A] dark:text-white">
            {universityFlashcards.length}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">Em todas as matérias</div>
        </div>

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">Taxa de Domínio</div>
          <div className="mt-2 text-2xl font-display font-bold text-[#008E32] dark:text-[#19E85F]">
            {masteryPct}%
          </div>
          <div className="mt-0.5 text-[11px] text-muted">{totalMastered} dominados</div>
        </div>

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">Em Revisão</div>
          <div className="mt-2 text-2xl font-display font-bold text-[#6F00D6] dark:text-[#9B3DFF]">
            {universityFlashcards.filter(c => c.status === 'revisando').length}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">Memorização ativa</div>
        </div>

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">Novos Conceitos</div>
          <div className="mt-2 text-2xl font-display font-bold text-amber-500">
            {universityFlashcards.filter(c => c.status === 'novo').length}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">Para memorizar</div>
        </div>
      </div>

      {/* MODO ESTUDO ATIVO (FLIP CARD INTERATIVO) */}
      {activeView === 'study' ? (
        <div className="space-y-4">
          {/* Seletor de Matéria no Estudo */}
          <div className="flex items-center justify-between">
            <select
              value={selectedSubjectId}
              onChange={e => {
                setSelectedSubjectId(e.target.value);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className="rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-bold text-tinta shadow-xs focus:outline-none dark:border-white/10 dark:bg-[#131024] dark:text-texto"
            >
              <option value="all">Todas as Disciplinas ({universityFlashcards.length})</option>
              {universitySubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({universityFlashcards.filter(c => c.subject_id === sub.id).length})
                </option>
              ))}
            </select>

            <span className="text-xs font-bold text-muted">
              Card {studyCards.length > 0 ? currentCardIndex + 1 : 0} de {studyCards.length}
            </span>
          </div>

          {studyCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 p-12 text-center dark:border-white/10 dark:bg-[#131024]/50">
              <Brain size={48} className="text-[#6F00D6]/60 dark:text-[#9B3DFF]/60" />
              <h3 className="mt-4 font-display text-lg font-bold text-[#14102A] dark:text-white">
                Nenhum flashcard nesta seleção
              </h3>
              <p className="mt-1 max-w-sm text-xs text-[#645F78] dark:text-[#9D96B8]">
                Crie cartões com definições, teoremas, fórmulas e algoritmos para praticar recall ativo antes das provas.
              </p>
              <button
                onClick={openNew}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#00D64B] px-5 py-2 text-xs font-bold text-[#14102A] hover:bg-[#19E85F]"
              >
                <Plus size={15} strokeWidth={3} /> Criar Flashcard
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {/* O Card 3D Flip */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="group relative w-full min-h-[320px] max-w-2xl cursor-pointer select-none rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-lg transition-all hover:border-[#6F00D6]/40 hover:shadow-xl dark:border-white/10 dark:bg-[#131024] flex flex-col justify-between"
              >
                {/* Header do Card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-2xs"
                      style={{ background: activeSubject?.color || '#6F00D6' }}
                    >
                      {activeSubject?.name || 'Matéria'}
                    </span>
                    {currentStudyCard.summary_topic && (
                      <span className="text-xs font-semibold text-muted">
                        · {currentStudyCard.summary_topic}
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-bold text-muted group-hover:text-[#6F00D6] dark:group-hover:text-[#9B3DFF] transition-colors">
                    <RotateCw size={13} /> {isFlipped ? 'Ver Conceito' : 'Virar Card'}
                  </span>
                </div>

                {/* Conteúdo Central */}
                <div className="my-auto py-6 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                    {isFlipped ? 'RESPOSTA / EXPLICAÇÃO' : 'CONCEITO / PERGUNTA'}
                  </span>
                  <div className="mt-3 text-base sm:text-xl font-medium text-[#14102A] dark:text-white leading-relaxed">
                    {isFlipped ? currentStudyCard.back : currentStudyCard.front}
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="flex items-center justify-between text-xs text-muted border-t border-slate-100 dark:border-white/5 pt-3">
                  <span>Toque no card para alternar resposta</span>
                  <span className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                    currentStudyCard.status === 'dominado' ? 'bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]' :
                    currentStudyCard.status === 'revisando' ? 'bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#9B3DFF]' :
                    'bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]'
                  )}>
                    Status: {currentStudyCard.status}
                  </span>
                </div>
              </div>

              {/* Ações de Avaliação do Card */}
              {isFlipped ? (
                <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in">
                  <button
                    onClick={() => handleRateCard('novo')}
                    className="rounded-full bg-red-500/15 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-500/25 dark:text-red-400"
                  >
                    Ainda Difícil (Rever Logo)
                  </button>
                  <button
                    onClick={() => handleRateCard('revisando')}
                    className="rounded-full bg-amber-500/15 px-4 py-2 text-xs font-bold text-[#D68200] hover:bg-amber-500/25 dark:text-[#FFB84D]"
                  >
                    Em Progresso (Revisando)
                  </button>
                  <button
                    onClick={() => handleRateCard('dominado')}
                    className="rounded-full bg-[#00D64B] px-5 py-2 text-xs font-bold text-[#14102A] hover:bg-[#19E85F] shadow-xs"
                  >
                    Dominado! (Fácil)
                  </button>
                </div>
              ) : (
                /* Controles de Navegação */
                <div className="flex items-center gap-3">
                  <button
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setCurrentCardIndex(prev => Math.max(0, prev - 1));
                      setIsFlipped(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200/80 text-tinta shadow-xs hover:bg-slate-50 disabled:opacity-30 dark:border-white/10 dark:bg-[#131024] dark:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="rounded-full bg-[#6F00D6] px-5 py-2 text-xs font-bold text-white hover:bg-[#7D12EC] shadow-xs"
                  >
                    Mostrar Resposta
                  </button>
                  <button
                    disabled={currentCardIndex >= studyCards.length - 1}
                    onClick={() => {
                      setCurrentCardIndex(prev => Math.min(studyCards.length - 1, prev + 1));
                      setIsFlipped(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200/80 text-tinta shadow-xs hover:bg-slate-50 disabled:opacity-30 dark:border-white/10 dark:bg-[#131024] dark:text-white"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* BIBLIOTECA DE CONCEITOS E RESUMOS */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Buscar por conceito, resposta ou tópico..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200/80 bg-white pl-9 pr-4 py-2 text-xs font-semibold text-tinta shadow-xs focus:outline-none dark:border-white/10 dark:bg-[#131024] dark:text-texto"
              />
            </div>

            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-bold text-tinta shadow-xs focus:outline-none dark:border-white/10 dark:bg-[#131024] dark:text-texto"
            >
              <option value="all">Todas as Matérias</option>
              {universitySubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-bold text-tinta shadow-xs focus:outline-none dark:border-white/10 dark:bg-[#131024] dark:text-texto"
            >
              <option value="all">Todos os Status</option>
              <option value="novo">Novo</option>
              <option value="revisando">Revisando</option>
              <option value="dominado">Dominado</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredCards.map(card => {
              const sub = universitySubjects.find(s => s.id === card.subject_id);
              return (
                <div
                  key={card.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: sub?.color || '#6F00D6' }}
                      >
                        {sub?.name || 'Matéria'}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-muted">
                        {card.status}
                      </span>
                    </div>

                    <div className="mt-2.5 font-bold text-xs text-[#14102A] dark:text-white">
                      {card.front}
                    </div>

                    <div className="mt-2 text-[11px] text-[#645F78] dark:text-[#9D96B8] line-clamp-3 bg-slate-50 dark:bg-white/5 p-2 rounded-xl">
                      {card.back}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2">
                    <span className="text-[10px] text-muted">
                      {card.summary_topic || 'Geral'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(card)}
                        className="rounded p-1 text-muted hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteUniversityFlashcard(card.id)}
                        className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Criar / Editar Flashcard */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCard ? 'Editar Flashcard' : 'Novo Resumo ou Flashcard'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Disciplina *
            </label>
            <select
              required
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-[#131024] dark:text-texto"
            >
              {universitySubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Tópico / Eixo Temático
            </label>
            <input
              type="text"
              placeholder="Ex: Derivadas, Grafos, Cinemática, Espaços Vetoriais"
              value={summaryTopic}
              onChange={e => setSummaryTopic(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Frente (Pergunta / Teorema / Conceito) *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Ex: O que é a Regra de L'Hôpital e quando pode ser aplicada?"
              value={front}
              onChange={e => setFront(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Verso (Resposta / Demonstração / Explicação) *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Ex: Aplica-se a formas indeterminadas 0/0 ou ∞/∞: lim f(x)/g(x) = lim f'(x)/g'(x), desde que os limites das derivadas existam."
              value={back}
              onChange={e => setBack(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Status de Domínio
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as UniversityFlashcardStatus)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-[#131024] dark:text-texto"
            >
              <option value="novo">Novo</option>
              <option value="revisando">Revisando (Em progresso)</option>
              <option value="dominado">Dominado (Já fixado)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full px-4 py-2 text-xs font-bold text-muted hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#00D64B] px-5 py-2 text-xs font-bold text-[#14102A] hover:bg-[#19E85F] disabled:opacity-50"
            >
              {saving ? 'Salvando...' : editingCard ? 'Salvar Alterações' : 'Criar Flashcard'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
