import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDuration } from '../../components/LogStudyDialog';
import EnemCountdown from '../../components/EnemCountdown';
import { Clock, BarChart3, FileText, Trophy, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { getSimulationQuestions, getSimulationDuration, getSimulationDate, formatISODateSafe } from '../../lib/simulationUtils';

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

/** Anel de progresso circular para as metas semanais (DuckMind 2.0) */
function ProgressRing({
  pct,
  color,
  size = 76,
  strokeWidth = 7,
}: {
  pct: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, pct));
  const offset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-display text-[15px] font-bold text-tinta dark:text-texto">
        {clampedPct}%
      </span>
    </div>
  );
}

/** Barra de progresso fina moderna */
function ThinTrack({ pct, color, height = 6 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
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

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Semana corrente (início no domingo)
  const weekStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return formatLocalDate(d);
  })();
  const weekSessions = sessions.filter(s => s.studied_at.split('T')[0] >= weekStart);
  const weekSessionMinutes = weekSessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  // Questões e tempo dos simulados na semana
  const weekSims = simulations.filter(s => getSimulationDate(s) >= weekStart);
  const weekSimMinutes = weekSims.reduce((acc, s) => acc + getSimulationDuration(s), 0);
  const weekMinutes = weekSessionMinutes + weekSimMinutes;

  const weekSessionQuestions = weekSessions.reduce((acc, s) => acc + s.questions_correct + s.questions_wrong, 0);
  const weekSimQuestions = weekSims.reduce((acc, s) => acc + getSimulationQuestions(s).total, 0);
  const weekQuestions = weekSessionQuestions + weekSimQuestions;

  const weekMinutesPct = weeklyMinutesGoal > 0 ? Math.min(100, Math.round((weekMinutes / weeklyMinutesGoal) * 100)) : 0;
  const weekQuestionsPct = weeklyQuestionsGoal > 0 ? Math.min(100, Math.round((weekQuestions / weeklyQuestionsGoal) * 100)) : 0;

  const today = formatLocalDate(new Date());
  const todaySessionMinutes = sessions
    .filter(s => s.studied_at.split('T')[0] === today)
    .reduce((acc, s) => acc + s.duration_minutes, 0);
  const todaySimMinutes = simulations
    .filter(s => getSimulationDate(s) === today)
    .reduce((acc, s) => acc + getSimulationDuration(s), 0);
  const todayMinutes = todaySessionMinutes + todaySimMinutes;

  // Questões gerais: Sessões + Simulados
  const sessionQuestionsTotal = sessions.reduce((acc, s) => acc + s.questions_correct + s.questions_wrong, 0);
  const sessionCorrectTotal = sessions.reduce((acc, s) => acc + s.questions_correct, 0);

  const simQuestionsTotal = simulations.reduce((acc, s) => acc + getSimulationQuestions(s).total, 0);
  const simCorrectTotal = simulations.reduce((acc, s) => acc + getSimulationQuestions(s).correct, 0);

  const totalQuestions = sessionQuestionsTotal + simQuestionsTotal;
  const totalCorrect = sessionCorrectTotal + simCorrectTotal;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const goalProgress = dailyGoal > 0 ? Math.min(100, Math.round((todayMinutes / dailyGoal) * 100)) : 0;

  // Atividades recentes combinadas (sessões de estudo + simulados)
  type UnifiedRecentActivity =
    | { kind: 'session'; session: (typeof sessions)[0]; date: string }
    | { kind: 'simulation'; simulation: (typeof simulations)[0]; date: string };

  const recentActivities: UnifiedRecentActivity[] = (() => {
    const list: UnifiedRecentActivity[] = [];
    sessions.forEach(s => list.push({ kind: 'session', session: s, date: s.studied_at }));
    simulations.forEach(sim => {
      const simDate = getSimulationDate(sim);
      const dateStr = `${simDate}T12:00:00`;
      list.push({ kind: 'simulation', simulation: sim, date: dateStr });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  })();

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

  const firstName = (profile?.display_name || 'Pedro').split(' ')[0];

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in pb-10">
      {/* Saudação + Contagem Regressiva (DuckMind 2.0) */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col justify-center text-left items-start">
          <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-texto sm:text-[2.5rem] text-left">
            Olá, {firstName}
          </h1>
          <p className="mt-1 text-[15px] font-medium text-muted dark:text-gray-400 text-left">
            {streak > 0 ? (
              <button
                type="button"
                onClick={onOpenStreak}
                className="inline-flex items-center gap-1 text-muted hover:text-tinta dark:text-gray-300 dark:hover:text-white transition-colors text-left"
              >
                <span>{streak} {streak === 1 ? 'dia' : 'dias'} de sequência. Bora mergulhar.</span>
              </button>
            ) : (
              'Bora mergulhar nos estudos de hoje.'
            )}
          </p>
        </div>

        <EnemCountdown />
      </div>

      {/* 4 Cards de Métricas Principais (DuckMind 2.0 Grid) */}
      <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {/* Card 1: Tempo na semana */}
        <div className="stat flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#00D64B] dark:text-[#19E85F]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00D64B]/15 dark:bg-[#19E85F]/15">
              <Clock size={16} strokeWidth={2.4} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="stat-value text-[#00D64B] dark:text-[#19E85F]">
              {Math.floor(weekMinutes / 60)}h{weekMinutes % 60}m
            </div>
            <div className="stat-label mt-0.5">Esta semana</div>
          </div>
        </div>

        {/* Card 2: Aproveitamento */}
        <div className="stat flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted dark:text-gray-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 dark:bg-purple-500/20 text-[#6F00D6] dark:text-[#9B3DFF]">
              <BarChart3 size={16} strokeWidth={2.4} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="stat-value text-tinta dark:text-texto">
              {accuracy}%
            </div>
            <div className="stat-label mt-0.5">Aproveitamento</div>
          </div>
        </div>

        {/* Card 3: Questões */}
        <div className="stat flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted dark:text-gray-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-500/10 dark:bg-white/10 text-slate-700 dark:text-gray-300">
              <FileText size={16} strokeWidth={2.4} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="stat-value text-tinta dark:text-texto">
              {totalQuestions}
            </div>
            <div className="stat-label mt-0.5">Questões</div>
          </div>
        </div>

        {/* Card 4: Recorde */}
        <div className="stat flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#D68200] dark:text-[#FFB84D]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]">
              <Trophy size={16} strokeWidth={2.4} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="stat-value text-[#D68200] dark:text-[#FFB84D]">
              {longestStreak}d
            </div>
            <div className="stat-label mt-0.5">Recorde</div>
          </div>
        </div>
      </div>

      {/* Cronômetro Mobile: Visível na primeira dobra da tela (sem necessidade de rolagem) */}
      <section className="mb-4 rounded-[26px] bg-[#14102A] p-4 text-white shadow-card border border-white/5 flex items-center justify-between gap-3 lg:hidden">
        <div>
          <span className="text-xs font-semibold text-white/70 block">Cronômetro</span>
          <span className="font-display text-3xl font-bold tracking-tight text-white select-none">
            {formatHMS(elapsed)}
          </span>
          {elapsed > 0 && !stopwatchRunning && (
            <button
              type="button"
              onClick={() => { const mins = Math.round(elapsed / 60); resetStopwatch(); onLogStudy(mins); }}
              className="text-xs font-bold text-[#19E85F] hover:underline block mt-0.5"
            >
              Salvar {Math.max(1, Math.round(elapsed / 60))}m
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {elapsed > 0 && (
            <button
              type="button"
              onClick={resetStopwatch}
              title="Reiniciar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <RotateCcw size={15} strokeWidth={2.6} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleStopwatch}
            className="px-5 py-2.5 rounded-full bg-[#00D64B] dark:bg-[#19E85F] text-[#14102A] font-bold text-xs shadow-[0_4px_16px_rgba(25,232,95,0.4)] active:scale-95 transition-all flex items-center gap-1.5"
          >
            {stopwatchRunning ? (
              <>
                <Pause size={14} strokeWidth={2.8} /> Pausar
              </>
            ) : (
              <>
                <Play size={14} strokeWidth={2.8} /> {elapsed > 0 ? 'Continuar' : 'Iniciar'}
              </>
            )}
          </button>
        </div>
      </section>

      {/* Grid de Duas Colunas (Principal + Lateral) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
        {/* Coluna Esquerda */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Metas da Semana com Anéis de Progresso (DuckMind 2.0) */}
          <section className="card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-tinta dark:text-texto">
                Metas da semana
              </h2>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs font-semibold text-muted hover:text-mente dark:hover:text-[#9B3DFF] transition-colors"
              >
                Ajustar
              </button>
            </div>

            {/* Layout Mobile conforme V2 · Mobile Início (escuro) */}
            <div className="flex sm:hidden items-center gap-4">
              <ProgressRing pct={weekMinutesPct} color="#00D64B" size={72} strokeWidth={7} />
              <div className="flex-1 min-w-0">
                <span className="font-display text-sm font-bold text-tinta dark:text-texto block">
                  Metas da semana
                </span>
                <span className="text-xs text-muted dark:text-gray-300 font-medium block mt-0.5">
                  {Math.floor(weekMinutes / 60)}h{weekMinutes % 60}m de {Math.floor(weeklyMinutesGoal / 60)}h
                </span>
                <div className="my-2">
                  <ThinTrack pct={weekQuestionsPct} color="#6F00D6" height={5} />
                </div>
                <span className="text-[11px] text-muted/80 dark:text-gray-400 block">
                  Questões {weekQuestions} de {weeklyQuestionsGoal}
                </span>
              </div>
            </div>

            {/* Layout Desktop / Tablet com 2 anéis conforme V2 · Web Início (escuro) */}
            <div className="hidden sm:grid grid-cols-2 gap-6">
              {/* Anel 1: Tempo de estudo */}
              <div className="flex items-center gap-4">
                <ProgressRing pct={weekMinutesPct} color="#00D64B" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-muted dark:text-gray-400">
                    Tempo de estudo
                  </span>
                  <span className="font-display text-base font-bold text-tinta dark:text-texto">
                    {Math.floor(weekMinutes / 60)}h{weekMinutes % 60}m / {Math.floor(weeklyMinutesGoal / 60)}h
                  </span>
                  <span className="text-xs text-muted/80 dark:text-gray-400 mt-0.5">
                    {Math.max(0, weeklyMinutesGoal - weekMinutes)}m restantes
                  </span>
                </div>
              </div>

              {/* Anel 2: Questões */}
              <div className="flex items-center gap-4">
                <ProgressRing pct={weekQuestionsPct} color="#6F00D6" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-muted dark:text-gray-400">
                    Questões
                  </span>
                  <span className="font-display text-base font-bold text-tinta dark:text-texto">
                    {weekQuestions} / {weeklyQuestionsGoal}
                  </span>
                  <span className="text-xs text-muted/80 dark:text-gray-400 mt-0.5">
                    {Math.max(0, weeklyQuestionsGoal - weekQuestions)} restantes
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Progresso no Edital com Barras Finas (DuckMind 2.0) */}
          <section className="card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg sm:text-xl font-bold text-tinta dark:text-texto">
                Progresso no Edital
              </h2>
              <span className="rounded-full bg-[#00D64B]/15 px-3 py-1 font-display text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                {totalEditalProgress}% geral
              </span>
            </div>

            {sortedTopicsBySubject.length === 0 ? (
              <p className="py-8 text-center text-sm font-medium text-muted">
                Nenhuma matéria cadastrada ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {(showAllSubjects ? sortedTopicsBySubject : sortedTopicsBySubject.slice(0, 5)).map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onNavigate('edital')}
                    className="group flex w-full items-center gap-3 text-left transition-opacity hover:opacity-85"
                  >
                    <span className="w-28 sm:w-36 shrink-0 truncate text-[14px] font-semibold text-tinta dark:text-texto">
                      {sub.name}
                    </span>
                    <div className="min-w-0 flex-1">
                      <ThinTrack pct={sub.progress} color="#00D64B" height={7} />
                    </div>
                    <span className="w-20 shrink-0 text-right text-xs font-medium text-muted dark:text-gray-400">
                      {sub.completedCount}/{sub.topicCount} tópicos
                    </span>
                    <span className="w-11 shrink-0 text-right font-display text-[13px] font-bold text-tinta dark:text-texto">
                      {sub.progress}%
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
              <button
                onClick={() => onNavigate('edital')}
                className="text-xs font-bold text-mente dark:text-[#9B3DFF] hover:underline"
              >
                Ver edital completo
              </button>
              {sortedTopicsBySubject.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllSubjects(prev => !prev)}
                  className="text-xs font-semibold text-muted hover:text-tinta dark:hover:text-white"
                >
                  {showAllSubjects ? 'Mostrar menos' : `+${sortedTopicsBySubject.length - 5} matérias`}
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Coluna Direita (Cronômetro no Desktop + Últimas Sessões) */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Card do Cronômetro — Escuro de alto contraste (Apenas Desktop conforme V2 · Web Início) */}
          <section className="hidden lg:block rounded-[26px] bg-[#14102A] p-6 text-white shadow-card">
            <h2 className="font-display text-lg font-bold text-white">Cronômetro</h2>

            <div className="my-5 text-center">
              <div className="font-display text-[3.2rem] font-bold leading-none tracking-tight text-white select-none">
                {formatHMS(elapsed)}
              </div>
              <p className="mt-2 text-xs font-medium text-white/60">
                {stopwatchRunning ? 'Sessão em andamento…' : elapsed > 0 ? 'Pausado' : 'Pronto para começar'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleStopwatch}
                className="btn flex-1 bg-[#00D64B] py-3 text-sm font-bold text-[#14102A] hover:bg-[#19E85F] transition-all"
              >
                {stopwatchRunning ? (
                  <>
                    <Pause size={16} strokeWidth={2.8} /> Pausar
                  </>
                ) : (
                  <>
                    <Play size={16} strokeWidth={2.8} /> {elapsed > 0 ? 'Continuar' : 'Iniciar'}
                  </>
                )}
              </button>
              {elapsed > 0 && (
                <button
                  type="button"
                  onClick={resetStopwatch}
                  title="Reiniciar"
                  aria-label="Reiniciar cronômetro"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <RotateCcw size={16} strokeWidth={2.6} />
                </button>
              )}
            </div>

            {elapsed > 0 && !stopwatchRunning && (
              <button
                type="button"
                onClick={() => { const mins = Math.round(elapsed / 60); resetStopwatch(); onLogStudy(mins); }}
                className="mt-3 w-full rounded-full bg-[#6F00D6] py-2.5 text-xs font-bold text-white hover:bg-[#7D12EC] transition-colors"
              >
                Registrar {Math.max(1, Math.round(elapsed / 60))} min de estudo
              </button>
            )}

            {/* Meta de hoje */}
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-white/80">
                <span>Meta de hoje</span>
                <span className="font-display font-bold text-white">{todayMinutes}/{dailyGoal}m</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00D64B] transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, goalProgress)}%` }}
                />
              </div>
            </div>
          </section>

          {/* Últimas Sessões (DuckMind 2.0) */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-tinta dark:text-texto">
                Últimas sessões
              </h2>
              {recentActivities.length > 0 && (
                <button
                  onClick={() => onNavigate('activity')}
                  className="flex items-center gap-0.5 text-xs font-bold text-mente dark:text-[#9B3DFF] hover:underline"
                >
                  Ver tudo <ChevronRight size={14} strokeWidth={2.4} />
                </button>
              )}
            </div>

            {recentActivities.length === 0 ? (
              <p className="py-6 text-center text-xs font-medium text-muted">
                Nenhuma sessão registrada ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentActivities.map(item => {
                  if (item.kind === 'session') {
                    const s = item.session;
                    const sub = subjects.find(sb => sb.id === s.subject_id);
                    const total = s.questions_correct + s.questions_wrong;
                    const acc = total > 0 ? Math.round((s.questions_correct / total) * 100) : null;
                    return (
                      <div key={`sess-${s.id}`} className="flex items-center gap-3 text-sm">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: sub?.color ?? '#00D64B' }}
                        />
                        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-tinta dark:text-texto">
                          {sub?.name ?? 'Matéria'}
                        </span>
                        <span className="shrink-0 font-display text-xs text-muted dark:text-gray-400">
                          {formatDuration(s.duration_minutes)}
                        </span>
                        {acc !== null && (
                          <span className="shrink-0 rounded-full bg-[#00D64B]/15 px-2 py-0.5 font-display text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                            {acc}%
                          </span>
                        )}
                        <span className="shrink-0 text-xs text-muted/70 dark:text-gray-500">
                          {formatISODateSafe(s.studied_at, { dayMonthOnly: true })}
                        </span>
                      </div>
                    );
                  } else {
                    const sim = item.simulation;
                    const q = getSimulationQuestions(sim);
                    const dur = getSimulationDuration(sim);
                    const acc = q.total > 0 ? Math.round((q.correct / q.total) * 100) : null;
                    return (
                      <button
                        key={`sim-${sim.id}`}
                        type="button"
                        onClick={() => onNavigate('simulados')}
                        className="flex w-full items-center gap-3 text-left transition-opacity hover:opacity-80"
                      >
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D68200]" />
                        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-tinta dark:text-texto">
                          {sim.title || 'Simulado'}
                        </span>
                        {dur > 0 && (
                          <span className="shrink-0 font-display text-xs text-muted dark:text-gray-400">
                            {formatDuration(dur)}
                          </span>
                        )}
                        {acc !== null ? (
                          <span className="shrink-0 rounded-full bg-[#00D64B]/15 px-2 py-0.5 font-display text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                            {acc}%
                          </span>
                        ) : null}
                        <span className="shrink-0 text-xs text-muted/70 dark:text-gray-500">
                          {formatISODateSafe(item.date, { dayMonthOnly: true })}
                        </span>
                      </button>
                    );
                  }
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
