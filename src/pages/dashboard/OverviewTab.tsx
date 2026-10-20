import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/theme';
import { formatDuration } from '../../components/LogStudyDialog';
import EnemCountdown from '../../components/EnemCountdown';
import { Plus, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { getSimulationQuestions } from '../../lib/simulationUtils';

type Props = {
  onNavigate: (tab: string) => void;
  onLogStudy: (minutes?: number) => void;
  onOpenTimer: () => void;
  onOpenStreak: () => void;
};

function formatHMS(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Barra de progresso com contorno de 3px em Tinta. */
function Track({ pct, color, height = 14 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="track w-full" style={{ height }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  );
}

export default function OverviewTab({ onNavigate, onLogStudy, onOpenStreak }: Props) {
  const { profile, sessions, simulations, subjects, topics, topicCompletions } = useApp();
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const streak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const dailyGoal = profile?.goal_daily_minutes ?? 120;
  const weeklyMinutesGoal = profile?.goal_weekly_minutes ?? 600;
  const weeklyQuestionsGoal = profile?.goal_weekly_questions ?? 300;

  // Semana corrente (início no domingo)
  const weekStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  })();
  const weekSessions = sessions.filter(s => s.studied_at.split('T')[0] >= weekStart);
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  // Questões das sessões na semana
  const weekSessionQuestions = weekSessions.reduce((acc, s) => acc + s.questions_correct + s.questions_wrong, 0);

  // Questões dos simulados na semana
  const weekSims = simulations.filter(s => getSimulationQuestions(s).date >= weekStart);
  const weekSimQuestions = weekSims.reduce((acc, s) => acc + getSimulationQuestions(s).total, 0);
  const weekQuestions = weekSessionQuestions + weekSimQuestions;

  const weekMinutesPct = weeklyMinutesGoal > 0 ? Math.min(100, Math.round((weekMinutes / weeklyMinutesGoal) * 100)) : 0;
  const weekQuestionsPct = weeklyQuestionsGoal > 0 ? Math.min(100, Math.round((weekQuestions / weeklyQuestionsGoal) * 100)) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayMinutes = sessions
    .filter(s => s.studied_at.split('T')[0] === today)
    .reduce((acc, s) => acc + s.duration_minutes, 0);

  // Questões gerais: Sessões + Simulados
  const sessionQuestionsTotal = sessions.reduce((acc, s) => acc + s.questions_correct + s.questions_wrong, 0);
  const sessionCorrectTotal = sessions.reduce((acc, s) => acc + s.questions_correct, 0);

  const simQuestionsTotal = simulations.reduce((acc, s) => acc + getSimulationQuestions(s).total, 0);
  const simCorrectTotal = simulations.reduce((acc, s) => acc + getSimulationQuestions(s).correct, 0);

  const totalQuestions = sessionQuestionsTotal + simQuestionsTotal;
  const totalCorrect = sessionCorrectTotal + simCorrectTotal;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const goalProgress = dailyGoal > 0 ? Math.min(100, Math.round((todayMinutes / dailyGoal) * 100)) : 0;

  const completedTopicIdSet = new Set(topicCompletions.map(tc => tc.topic_id));
  const topicsBySubject = subjects.map(sub => {
    const subTopics = topics.filter(t => t.subject_id === sub.id);
    const completedCount = subTopics.filter(t => completedTopicIdSet.has(t.id)).length;
    const progress = subTopics.length > 0 ? Math.round((completedCount / subTopics.length) * 100) : 0;
    return { ...sub, progress, topicCount: subTopics.length, completedCount };
  });

  const sortedTopicsBySubject = [...topicsBySubject].sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress;
    if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  const totalEditalTopics = topics.length;
  const totalCompletedEditalTopics = topics.filter(t => completedTopicIdSet.has(t.id)).length;
  const totalEditalProgress = totalEditalTopics > 0 ? Math.round((totalCompletedEditalTopics / totalEditalTopics) * 100) : 0;

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const tick = useCallback(() => setElapsed(e => e + 1), []);
  const toggleStopwatch = () => {
    if (stopwatchRunning) {
      setStopwatchRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setStopwatchRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    }
  };
  const resetStopwatch = () => {
    setStopwatchRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
  };

  const stats = [
    { label: 'Esta semana', value: `${Math.floor(weekMinutes / 60)}h${weekMinutes % 60}m`, accent: true },
    { label: 'Aproveitamento', value: `${accuracy}%`, accent: false },
    { label: 'Questões', value: String(totalQuestions), accent: false },
    { label: 'Recorde', value: `${longestStreak}d`, accent: 'bico' as const },
  ];

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      {/* Saudação + contagem regressiva */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex flex-1 flex-col justify-center gap-2">
          <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-papel sm:text-[2.6rem]">
            Olá, {profile?.display_name || 'Estudante'}!
          </h1>
          <p className="text-[17px] font-semibold text-muted dark:text-papel/70">
            {streak === 0 ? (
              'Bora mergulhar nos estudos de hoje!'
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenStreak}
                  className="mr-1.5 rounded-[10px] border-2 border-tinta bg-bico px-2 py-0.5 text-sm font-bold text-tinta transition-transform hover:-translate-y-px dark:border-papel"
                >
                  {streak} {streak === 1 ? 'dia' : 'dias'} seguidos
                </button>
                {streak >= 7 ? 'Sequência espetacular, continua assim!' : 'Mantém o foco e avança no edital!'}
              </>
            )}
          </p>
        </div>

        <EnemCountdown />
      </div>

      {/* Métricas principais */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {stats.map(s => (
          <div
            key={s.label}
            className={cn(
              'stat min-w-0',
              s.accent === true && 'bg-pato',
              s.accent === 'bico' && 'bg-bico',
            )}
          >
            <div className="stat-value truncate">{s.value}</div>
            <div className="stat-label mt-0.5 truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Colunas */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Coluna esquerda */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Metas da semana */}
          <section className="card min-w-0 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-tinta dark:text-papel sm:text-2xl">Metas da semana</h2>
              <button
                onClick={() => onNavigate('settings')}
                className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-mente hover:underline dark:text-papel"
              >
                Ajustar <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-[15px] font-bold">
                  <span>Tempo de estudo</span>
                  <span className="whitespace-nowrap font-display">
                    {Math.floor(weekMinutes / 60)}h{weekMinutes % 60}m / {Math.floor(weeklyMinutesGoal / 60)}h
                  </span>
                </div>
                <Track pct={weekMinutesPct} color="#00D64B" height={18} />
                <p className="mt-1.5 text-sm font-semibold text-muted dark:text-papel/60">
                  {weekMinutesPct >= 100 ? 'Meta atingida! 🎉' : `${weekMinutesPct}% concluído · ${Math.max(0, weeklyMinutesGoal - weekMinutes)}m restantes`}
                </p>
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-[15px] font-bold">
                  <span>Questões</span>
                  <span className="whitespace-nowrap font-display">
                    {weekQuestions} / {weeklyQuestionsGoal}
                  </span>
                </div>
                <Track pct={weekQuestionsPct} color="#6F00D6" height={18} />
                <p className="mt-1.5 text-sm font-semibold text-muted dark:text-papel/60">
                  {weekQuestionsPct >= 100 ? 'Meta atingida! 🎯' : `${weekQuestionsPct}% concluído · ${Math.max(0, weeklyQuestionsGoal - weekQuestions)} restantes`}
                </p>
              </div>
            </div>
          </section>

          {/* Progresso no edital */}
          <section className="card min-w-0 p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold text-tinta dark:text-papel sm:text-2xl">Progresso no Edital</h2>
                <p className="mt-0.5 text-sm font-semibold text-muted dark:text-papel/60">
                  {totalCompletedEditalTopics} de {totalEditalTopics} tópicos concluídos
                </p>
              </div>
              <span className="shrink-0 rounded-[12px] border-[3px] border-tinta bg-pato px-2.5 py-0.5 font-display text-sm font-bold text-tinta dark:border-papel">
                {totalEditalProgress}% geral
              </span>
            </div>

            {sortedTopicsBySubject.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-muted dark:text-papel/60">
                Nenhuma matéria cadastrada ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {(showAllSubjects ? sortedTopicsBySubject : sortedTopicsBySubject.slice(0, 6)).map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onNavigate('edital')}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-tinta"
                      style={{ background: sub.progress > 0 ? '#00D64B' : '#6F00D6' }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-tinta dark:text-papel">
                      {sub.name}
                    </span>
                    <span className="w-[34%] shrink-0">
                      <Track pct={sub.progress} color={sub.progress > 0 ? '#00D64B' : '#6F00D6'} height={14} />
                    </span>
                    <span className="hidden w-[70px] shrink-0 text-right text-sm font-semibold text-muted dark:text-papel/60 lg:inline">
                      {sub.completedCount}/{sub.topicCount} tóp.
                    </span>
                    <span className="w-10 shrink-0 text-right font-display text-sm font-bold">{sub.progress}%</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2 border-t-[3px] border-tinta/15 pt-3 dark:border-papel/15">
              <button
                onClick={() => onNavigate('edital')}
                className="text-sm font-bold text-mente hover:underline dark:text-papel"
              >
                Ver edital completo
              </button>
              {sortedTopicsBySubject.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllSubjects(prev => !prev)}
                  className="text-sm font-bold text-muted hover:underline dark:text-papel/60"
                >
                  {showAllSubjects ? 'Mostrar menos' : `+${sortedTopicsBySubject.length - 6} matérias`}
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Coluna direita */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Cronômetro */}
          <section className={cn('card min-w-0 p-5', stopwatchRunning && 'bg-pato/10')}>
            <h2 className="mb-3 font-display text-xl font-bold text-tinta dark:text-papel">Cronômetro</h2>

            <div className="rounded-[18px] border-[3px] border-tinta bg-papel px-3 py-3.5 text-center dark:border-papel/60 dark:bg-surface-dark">
              <div className="font-display text-[2.6rem] font-bold leading-none tracking-tight text-tinta dark:text-papel">
                {formatHMS(elapsed)}
              </div>
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-muted dark:text-papel/60">
              {stopwatchRunning ? 'Sessão em andamento…' : elapsed > 0 ? 'Pausado' : 'Pronto para começar'}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={toggleStopwatch}
                className="btn flex-1 bg-pato py-2.5 text-tinta dark:border-papel"
              >
                {stopwatchRunning ? <><Pause size={18} strokeWidth={2.6} /> Pausar</> : <><Play size={18} strokeWidth={2.6} /> {elapsed > 0 ? 'Continuar' : 'Iniciar'}</>}
              </button>
              <button
                type="button"
                onClick={resetStopwatch}
                disabled={elapsed === 0 && !stopwatchRunning}
                aria-label="Reiniciar cronômetro"
                className="btn shrink-0 bg-white px-3 py-2.5 text-tinta disabled:opacity-40 dark:border-papel dark:bg-transparent dark:text-papel"
              >
                <RotateCcw size={18} strokeWidth={2.6} />
              </button>
            </div>

            {elapsed > 0 && !stopwatchRunning && (
              <button
                type="button"
                onClick={() => { const mins = Math.round(elapsed / 60); resetStopwatch(); onLogStudy(mins); }}
                className="mt-2 w-full rounded-[14px] border-[3px] border-tinta bg-mente py-2 font-display text-sm font-bold text-papel transition-transform hover:-translate-y-px dark:border-papel"
              >
                Registrar {Math.max(1, Math.round(elapsed / 60))} min
              </button>
            )}

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm font-bold">
                <span>Meta de hoje</span>
                <span className="font-display">{todayMinutes}/{dailyGoal}m</span>
              </div>
              <Track pct={goalProgress} color="#00D64B" height={14} />
            </div>
          </section>

          {/* Últimas sessões */}
          <section className="card min-w-0 p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-tinta dark:text-papel">Últimas sessões</h2>
              {sessions.length > 0 && (
                <button
                  onClick={() => onNavigate('activity')}
                  className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-mente hover:underline dark:text-papel"
                >
                  Ver tudo <ChevronRight size={14} strokeWidth={3} />
                </button>
              )}
            </div>

            {sessions.length === 0 ? (
              <p className="py-6 text-center text-sm font-semibold text-muted dark:text-papel/60">
                Nenhuma sessão registrada ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {sessions.slice(0, 5).map(s => {
                  const sub = subjects.find(sb => sb.id === s.subject_id);
                  const total = s.questions_correct + s.questions_wrong;
                  const acc = total > 0 ? Math.round((s.questions_correct / total) * 100) : null;
                  return (
                    <div key={s.id} className="flex items-center gap-2.5 text-sm">
                      <span className="h-3 w-3 shrink-0 rounded-full border-[3px] border-tinta" style={{ background: sub?.color ?? '#6F00D6' }} />
                      <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-tinta dark:text-papel">
                        {sub?.name ?? 'Matéria'}
                      </span>
                      <span className="shrink-0 font-display text-sm">{formatDuration(s.duration_minutes)}</span>
                      {acc !== null && (
                        <span className="shrink-0 rounded-[10px] border-2 border-tinta bg-pato px-1.5 text-[13px] font-bold text-tinta dark:border-papel">
                          {acc}%
                        </span>
                      )}
                      <span className="shrink-0 text-[13px] font-semibold text-muted dark:text-papel/55">
                        {new Date(s.studied_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Ação principal no mobile */}
      <button
        type="button"
        onClick={() => onLogStudy()}
        className="btn mt-5 w-full bg-pato py-3 text-tinta dark:border-papel sm:hidden"
      >
        <Plus size={18} strokeWidth={3} /> Registrar Estudo
      </button>
    </div>
  );
}
