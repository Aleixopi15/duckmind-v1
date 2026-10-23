import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/theme';
import Modal from '../../../components/Modal';
import {
  Calculator,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type { UniversityGrade } from '../../../lib/supabase';

export default function ProvasENotasTab() {
  const {
    universitySubjects,
    universityGrades,
    addUniversityGrade,
    updateUniversityGrade,
    deleteUniversityGrade,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<UniversityGrade | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [weight, setWeight] = useState('1.0');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('10.0');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Passing cutoff threshold (default 6.0 or 7.0 standard Brazilian university grade)
  const passingGrade = 6.0;

  const openNew = (defaultSubId?: string) => {
    setEditingGrade(null);
    setSubjectId(defaultSubId || (universitySubjects[0]?.id ?? ''));
    setTitle('');
    setWeight('1.0');
    setScore('');
    setMaxScore('10.0');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setModalOpen(true);
  };

  const openEdit = (grade: UniversityGrade) => {
    setEditingGrade(grade);
    setSubjectId(grade.subject_id);
    setTitle(grade.title);
    setWeight(String(grade.weight ?? 1.0));
    setScore(grade.score !== null ? String(grade.score) : '');
    setMaxScore(String(grade.max_score ?? 10.0));
    setDate(grade.date || '');
    setNotes(grade.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !title.trim()) return;

    setSaving(true);
    const parsedScore = score.trim() === '' ? null : parseFloat(score);

    if (editingGrade) {
      await updateUniversityGrade(editingGrade.id, {
        subject_id: subjectId,
        title: title.trim(),
        weight: parseFloat(weight) || 1.0,
        score: parsedScore,
        max_score: parseFloat(maxScore) || 10.0,
        date: date || null,
        notes: notes.trim(),
      });
    } else {
      await addUniversityGrade({
        subject_id: subjectId,
        title: title.trim(),
        weight: parseFloat(weight) || 1.0,
        score: parsedScore,
        max_score: parseFloat(maxScore) || 10.0,
        date: date || null,
        notes: notes.trim(),
      });
    }
    setSaving(false);
    setModalOpen(false);
  };

  // Overall calculations across all disciplines
  const subjectsWithGrades = universitySubjects.map(sub => {
    const grades = universityGrades.filter(g => g.subject_id === sub.id);
    const completedGrades = grades.filter(g => g.score !== null);
    const pendingGrades = grades.filter(g => g.score === null);

    const sumWeightedScore = completedGrades.reduce((acc, g) => acc + (g.score || 0) * (g.weight || 1), 0);
    const sumCompletedWeights = completedGrades.reduce((acc, g) => acc + (g.weight || 1), 0);
    const sumTotalWeights = grades.reduce((acc, g) => acc + (g.weight || 1), 0);

    const currentAverage = sumCompletedWeights > 0 ? sumWeightedScore / sumCompletedWeights : null;

    // Remaining weight needed to reach passing grade
    const pendingWeight = sumTotalWeights - sumCompletedWeights;
    let scoreNeeded: number | null = null;
    if (pendingWeight > 0 && currentAverage !== null) {
      // (sumWeightedScore + scoreNeeded * pendingWeight) / sumTotalWeights >= passingGrade
      // scoreNeeded = (passingGrade * sumTotalWeights - sumWeightedScore) / pendingWeight
      scoreNeeded = (passingGrade * sumTotalWeights - sumWeightedScore) / pendingWeight;
      scoreNeeded = Math.max(0, Math.round(scoreNeeded * 10) / 10);
    }

    return {
      sub,
      grades,
      completedGrades,
      pendingGrades,
      currentAverage,
      scoreNeeded,
      sumTotalWeights,
    };
  });

  // Global weighted average (GPA)
  const allCompletedGrades = universityGrades.filter(g => g.score !== null);
  const globalSumScore = allCompletedGrades.reduce((acc, g) => acc + (g.score || 0) * (g.weight || 1), 0);
  const globalSumWeights = allCompletedGrades.reduce((acc, g) => acc + (g.weight || 1), 0);
  const globalGpa = globalSumWeights > 0 ? (globalSumScore / globalSumWeights).toFixed(2) : '--';

  // Next upcoming exam
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingGrades = universityGrades
    .filter(g => g.date && g.date >= todayStr && g.score === null)
    .sort((a, b) => (a.date! > b.date! ? 1 : -1));
  const nextExam = upcomingGrades[0];
  const nextExamSubject = nextExam ? universitySubjects.find(s => s.id === nextExam.subject_id) : null;

  const getDaysDiff = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff > 1) return `Em ${diff} dias`;
    return `${Math.abs(diff)} dias atrás`;
  };

  return (
    <div className="w-full max-w-5xl min-w-0 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
            Provas e Notas
          </h1>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Calculadora inteligente de médias ponderadas, notas necessárias e calendário de avaliações.
          </p>
        </div>

        <button
          onClick={() => openNew()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00D64B] px-5 py-2.5 text-xs font-bold text-[#14102A] shadow-[0_4px_16px_rgba(25,232,95,0.3)] transition-all hover:bg-[#19E85F] active:scale-[0.98] dark:bg-[#19E85F] dark:hover:bg-[#25f46c]"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Nova Avaliação</span>
        </button>
      </div>

      {/* Top Banner & KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card Média Global */}
        <div className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Média Ponderada Global</span>
            <Calculator size={18} className="text-[#6F00D6] dark:text-[#9B3DFF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-bold text-[#14102A] dark:text-white">
              {globalGpa}
            </span>
            <span className="text-xs font-medium text-muted">/ 10.0</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {globalGpa !== '--' && parseFloat(globalGpa) >= passingGrade ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-[#008E32] dark:text-[#19E85F]">
                <CheckCircle2 size={12} strokeWidth={2.4} /> Acima da nota de corte ({passingGrade.toFixed(1)})
              </span>
            ) : globalGpa !== '--' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-[#D68200] dark:text-[#FFB84D]">
                <AlertCircle size={12} strokeWidth={2.4} /> Atenção com a média ({passingGrade.toFixed(1)})
              </span>
            ) : (
              <span className="text-xs text-muted">Lance sua primeira nota</span>
            )}
          </div>
        </div>

        {/* Card Próxima Avaliação */}
        <div className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Próxima Prova</span>
            <Calendar size={18} className="text-[#00D64B] dark:text-[#19E85F]" />
          </div>
          {nextExam && nextExamSubject ? (
            <div className="mt-3">
              <div className="font-display text-base font-bold text-[#14102A] dark:text-white line-clamp-1">
                {nextExam.title}
              </div>
              <div className="mt-0.5 text-xs text-muted truncate">
                {nextExamSubject.name}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#6F00D6]/15 px-3 py-1 text-xs font-bold text-[#6F00D6] dark:text-[#9B3DFF]">
                <Clock size={12} strokeWidth={2.4} />
                {getDaysDiff(nextExam.date!)} ({nextExam.date?.split('-').reverse().join('/')})
              </div>
            </div>
          ) : (
            <div className="mt-4 text-xs text-muted">
              Nenhuma prova agendada pendente no momento.
            </div>
          )}
        </div>

        {/* Card Resumo do Semestre */}
        <div className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Status das Avaliações</span>
            <TrendingUp size={18} className="text-amber-500" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted">Provas realizadas:</span>
            <span className="font-bold text-[#14102A] dark:text-white">{allCompletedGrades.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted">Provas a realizar:</span>
            <span className="font-bold text-[#14102A] dark:text-white">
              {universityGrades.filter(g => g.score === null).length}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted">Critério de aprovação:</span>
            <span className="font-bold text-[#008E32] dark:text-[#19E85F]">Média ≥ {passingGrade.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Seletor de Filtro de Matéria */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all',
            selectedSubjectId === 'all'
              ? 'bg-[#14102A] text-white dark:bg-white dark:text-[#14102A] shadow-xs'
              : 'bg-white text-muted hover:text-tinta dark:bg-[#131024] dark:hover:text-white border border-slate-200/80 dark:border-white/5'
          )}
        >
          Todas as Matérias ({universityGrades.length})
        </button>
        {universitySubjects.map(sub => {
          const count = universityGrades.filter(g => g.subject_id === sub.id).length;
          const isSelected = selectedSubjectId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all border',
                isSelected
                  ? 'border-transparent text-white shadow-xs'
                  : 'bg-white text-muted hover:text-tinta dark:bg-[#131024] dark:hover:text-white border-slate-200/80 dark:border-white/5'
              )}
              style={isSelected ? { background: sub.color || '#6F00D6' } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: sub.color || '#6F00D6' }}
              />
              <span>{sub.name}</span>
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Calculadoras por Disciplina */}
      <div className="space-y-6">
        {subjectsWithGrades
          .filter(item => selectedSubjectId === 'all' || item.sub.id === selectedSubjectId)
          .map(({ sub, grades, currentAverage, scoreNeeded, pendingGrades }) => {
            const hasGrades = grades.length > 0;
            const isApproved = currentAverage !== null && currentAverage >= passingGrade;

            return (
              <div
                key={sub.id}
                className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-xs transition-all dark:border-white/5 dark:bg-[#131024]"
              >
                {/* Header da Matéria com Resumo de Média */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-sm font-bold text-white shadow-xs"
                      style={{ background: sub.color || '#6F00D6' }}
                    >
                      {sub.code ? sub.code.slice(0, 3) : sub.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          {sub.code || 'Graduação'} · {sub.credits} créditos
                        </span>
                        {currentAverage !== null && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-bold',
                              isApproved
                                ? 'bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]'
                                : 'bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]'
                            )}
                          >
                            {isApproved ? 'Na Média de Aprovação' : 'Abaixo da Média'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#14102A] dark:text-white">
                        {sub.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Média Atual
                      </div>
                      <div className="font-display text-2xl font-bold text-[#14102A] dark:text-white">
                        {currentAverage !== null ? currentAverage.toFixed(1) : '--'}
                        <span className="text-xs font-normal text-muted"> / 10.0</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openNew(sub.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-[#14102A] hover:bg-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <Plus size={14} strokeWidth={2.6} /> Prova
                    </button>
                  </div>
                </div>

                {/* Previsão de Nota Necessária */}
                {scoreNeeded !== null && pendingGrades.length > 0 && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-amber-500/10 p-3.5 text-xs text-[#14102A] dark:bg-amber-500/15 dark:text-[#FFB84D]">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-amber-500" />
                      <span>
                        Você precisa de média <strong>{scoreNeeded.toFixed(1)}</strong> nas próximas avaliações para aprovação direta (≥ {passingGrade.toFixed(1)}).
                      </span>
                    </div>
                    <span className="font-bold">{pendingGrades.length} pendente(s)</span>
                  </div>
                )}

                {/* Tabela de Avaliações */}
                <div className="mt-4">
                  {!hasGrades ? (
                    <div className="py-6 text-center text-xs text-muted">
                      Nenhuma avaliação registrada para esta matéria ainda.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {grades.map(grade => {
                        const isDone = grade.score !== null;
                        return (
                          <div
                            key={grade.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2 group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                                  isDone
                                    ? 'bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]'
                                    : 'bg-slate-100 text-muted dark:bg-white/10 dark:text-white/60'
                                )}
                              >
                                {isDone ? <CheckCircle2 size={16} /> : <Clock size={15} />}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-[#14102A] dark:text-white flex items-center gap-2">
                                  <span>{grade.title}</span>
                                  <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] text-muted">
                                    Peso: {grade.weight}
                                  </span>
                                </div>
                                <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                                  {grade.date && (
                                    <span>
                                      {grade.date.split('-').reverse().join('/')} · {getDaysDiff(grade.date)}
                                    </span>
                                  )}
                                  {grade.notes && <span className="truncate">· {grade.notes}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                              <div className="text-right">
                                {isDone ? (
                                  <span className="font-display text-sm font-bold text-[#008E32] dark:text-[#19E85F]">
                                    Nota: {grade.score} / {grade.max_score}
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-muted bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                                    Ainda não realizada
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEdit(grade)}
                                  title="Editar nota"
                                  className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-tinta dark:hover:bg-white/10 dark:hover:text-white"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Excluir ${grade.title}?`)) {
                                      deleteUniversityGrade(grade.id);
                                    }
                                  }}
                                  title="Excluir nota"
                                  className="rounded-lg p-1 text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal Nova / Editar Avaliação */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGrade ? 'Editar Prova / Nota' : 'Nova Prova ou Atividade Avaliativa'}
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
                  {sub.name} ({sub.code || 'Sem código'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Título da Avaliação *
            </label>
            <input
              required
              type="text"
              placeholder="Ex: P1 - Prova Semestral, Trabalho Prático, Seminário"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Peso
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Nota Obtida
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="Vazio se pendente"
                value={score}
                onChange={e => setScore(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Nota Máxima
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="100"
                value={maxScore}
                onChange={e => setMaxScore(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Data da Prova / Avaliação
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Observações / Conteúdo Cobrado
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Capítulos 1 a 4 do livro texto; focar em demonstrações."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
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
              {saving ? 'Salvando...' : editingGrade ? 'Salvar Alterações' : 'Adicionar Avaliação'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
