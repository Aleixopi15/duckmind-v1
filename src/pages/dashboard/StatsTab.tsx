import { useMemo, useState, type ReactNode, type ComponentType } from 'react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/theme';
import { STUDY_TYPES } from '../../components/LogStudyDialog';
import {
  Target, Award, TrendingUp, BookOpen, BarChart3,
  Calendar, HelpCircle, Timer, Filter, X,
} from 'lucide-react';
import { getSimulationQuestions, getSubjectSimulationQuestions, getSimulationDuration, getSimulationDate } from '../../lib/simulationUtils';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const diff = date.getDate() - date.getDay();
  date.setDate(diff);
  return date;
}

/** Cabeçalho de seção moderno */
function SectionHead({ icon: Icon, title, right }: { icon: ComponentType<{ size?: number; strokeWidth?: number }>; title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]">
        <Icon size={16} strokeWidth={2.4} />
      </span>
      <h2 className="font-display text-base sm:text-lg font-bold tracking-tight text-[#14102A] dark:text-white">{title}</h2>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

/** Barra de progresso moderna com cantos arredondados */
function Bar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
    </div>
  );
}

/** Linha de resumo rótulo → valor */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs font-medium">
      <span className="text-[#645F78] dark:text-[#9D96B8]">{label}</span>
      <span className="font-display font-bold text-[#14102A] dark:text-white">{children}</span>
    </div>
  );
}

export default function StatsTab() {
  const { sessions, subjects, simulations, topics, topicCompletions, profile } = useApp();
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterTopicId, setFilterTopicId] = useState('');

  const weeklyMinutesGoal = profile?.goal_weekly_minutes ?? 600;
  const weeklyQuestionsGoal = profile?.goal_weekly_questions ?? 300;
  const dailyGoal = profile?.goal_daily_minutes ?? 120;

  const filterTopicSessions = useMemo(() => {
    if (!filterTopicId) return sessions;
    return sessions.filter(s => s.topic_id === filterTopicId);
  }, [sessions, filterTopicId]);

  const simMinutesTotal = !filterTopicId
    ? (!filterSubjectId
        ? simulations.reduce((a, s) => a + getSimulationDuration(s), 0)
        : 0)
    : 0;

  const totalMinutes = filterTopicSessions.reduce((a, s) => a + s.duration_minutes, 0) + simMinutesTotal;

  // Considera simulados se não houver filtro de tópico específico
  const simQuestionsTotal = !filterTopicId
    ? (!filterSubjectId
        ? simulations.reduce((a, s) => a + getSimulationQuestions(s).total, 0)
        : simulations.reduce((a, s) => {
            const sub = subjects.find(sb => sb.id === filterSubjectId);
            return a + getSubjectSimulationQuestions(s, filterSubjectId, sub?.name || '', sub?.area).total;
          }, 0)
      )
    : 0;

  const simCorrectTotal = !filterTopicId
    ? (!filterSubjectId
        ? simulations.reduce((a, s) => a + getSimulationQuestions(s).correct, 0)
        : simulations.reduce((a, s) => {
            const sub = subjects.find(sb => sb.id === filterSubjectId);
            return a + getSubjectSimulationQuestions(s, filterSubjectId, sub?.name || '', sub?.area).correct;
          }, 0)
      )
    : 0;

  const simWrongTotal = Math.max(0, simQuestionsTotal - simCorrectTotal);

  const totalCorrect = filterTopicSessions.reduce((a, s) => a + s.questions_correct, 0) + simCorrectTotal;
  const totalWrong = filterTopicSessions.reduce((a, s) => a + s.questions_wrong, 0) + simWrongTotal;
  const totalQuestions = totalCorrect + totalWrong;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgSimScore = simulations.length > 0
    ? Math.round(simulations.reduce((a, s) => a + (s.total_score ?? 0), 0) / simulations.length)
    : 0;

  const weekStart = startOfWeek(new Date());
  const weekStartIso = formatLocalDate(weekStart);

  const weekSessions = filterTopicSessions.filter(s => s.studied_at.split('T')[0] >= weekStartIso);
  const weekSessionMinutes = weekSessions.reduce((a, s) => a + s.duration_minutes, 0);

  const weekSims = !filterTopicId ? simulations.filter(s => getSimulationDate(s) >= weekStartIso) : [];
  const weekSimMinutes = (!filterTopicId && !filterSubjectId)
    ? weekSims.reduce((a, s) => a + getSimulationDuration(s), 0)
    : 0;
  const weekMinutes = weekSessionMinutes + weekSimMinutes;

  const weekSimQuestions = weekSims.reduce((a, s) => {
    if (!filterSubjectId) return a + getSimulationQuestions(s).total;
    const sub = subjects.find(sb => sb.id === filterSubjectId);
    return a + getSubjectSimulationQuestions(s, filterSubjectId, sub?.name || '', sub?.area).total;
  }, 0);
  const weekSimCorrect = weekSims.reduce((a, s) => {
    if (!filterSubjectId) return a + getSimulationQuestions(s).correct;
    const sub = subjects.find(sb => sb.id === filterSubjectId);
    return a + getSubjectSimulationQuestions(s, filterSubjectId, sub?.name || '', sub?.area).correct;
  }, 0);

  const weekQuestions = weekSessions.reduce((a, s) => a + s.questions_correct + s.questions_wrong, 0) + weekSimQuestions;
  const weekCorrect = weekSessions.reduce((a, s) => a + s.questions_correct, 0) + weekSimCorrect;
  const weekAccuracy = weekQuestions > 0 ? Math.round((weekCorrect / weekQuestions) * 100) : 0;

  const weekMinutesPct = weeklyMinutesGoal > 0 ? Math.min(100, Math.round((weekMinutes / weeklyMinutesGoal) * 100)) : 0;
  const weekQuestionsPct = weeklyQuestionsGoal > 0 ? Math.min(100, Math.round((weekQuestions / weeklyQuestionsGoal) * 100)) : 0;

  const last7Days = useMemo(() => {
    const days: { label: string; minutes: number; questions: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = formatLocalDate(d);
      const daySessions = filterTopicSessions.filter(s => s.studied_at.split('T')[0] === iso);
      const sessionMinutes = daySessions.reduce((a, s) => a + s.duration_minutes, 0);
      const sessionQuestions = daySessions.reduce((a, s) => a + s.questions_correct + s.questions_wrong, 0);

      // Simulados do dia
      const daySims = !filterTopicId ? simulations.filter(s => getSimulationDate(s) === iso) : [];
      const simMinutes = (!filterTopicId && !filterSubjectId)
        ? daySims.reduce((a, s) => a + getSimulationDuration(s), 0)
        : 0;
      const simQuestions = daySims.reduce((a, s) => {
        if (!filterSubjectId) return a + getSimulationQuestions(s).total;
        const sub = subjects.find(sb => sb.id === filterSubjectId);
        return a + getSubjectSimulationQuestions(s, filterSubjectId, sub?.name || '', sub?.area).total;
      }, 0);

      days.push({
        label: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][d.getDay()],
        minutes: sessionMinutes + simMinutes,
        questions: sessionQuestions + simQuestions,
        date: iso,
      });
    }
    return days;
  }, [filterTopicSessions, filterTopicId, filterSubjectId, simulations, subjects]);

  const maxDayMinutes = Math.max(...last7Days.map(d => d.minutes), 60);

  const subjectStats = subjects.map(sub => {
    const subSessions = filterTopicSessions.filter(s => s.subject_id === sub.id);
    const minutes = subSessions.reduce((a, s) => a + s.duration_minutes, 0);
    const sessionCorrect = subSessions.reduce((a, s) => a + s.questions_correct, 0);
    const sessionWrong = subSessions.reduce((a, s) => a + s.questions_wrong, 0);

    // Contabiliza questões de simulados para esta matéria
    const simSubQ = !filterTopicId ? simulations.reduce((acc, sim) => {
      const q = getSubjectSimulationQuestions(sim, sub.id, sub.name, sub.area);
      return { total: acc.total + q.total, correct: acc.correct + q.correct };
    }, { total: 0, correct: 0 }) : { total: 0, correct: 0 };

    const correct = sessionCorrect + simSubQ.correct;
    const wrong = sessionWrong + Math.max(0, simSubQ.total - simSubQ.correct);
    const total = correct + wrong;
    const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
    const subTopics = topics.filter(t => t.subject_id === sub.id);
    const completedCount = topicCompletions.filter(tc => subTopics.some(t => t.id === tc.topic_id)).length;
    const topicProgress = subTopics.length > 0 ? Math.round((completedCount / subTopics.length) * 100) : 0;
    return {
      ...sub,
      minutes,
      sessions: subSessions.length + (simSubQ.total > 0 ? 1 : 0),
      acc,
      correct,
      wrong,
      questions: total,
      topicProgress,
      completedCount,
      topicTotal: subTopics.length,
    };
  }).filter(s => s.sessions > 0 || s.completedCount > 0 || s.questions > 0).sort((a, b) => b.questions - a.questions || b.minutes - a.minutes);

  const maxSubjectMinutes = Math.max(...subjectStats.map(s => s.minutes), 60);

  const typeStats = STUDY_TYPES.map(t => {
    const typeSessions = filterTopicSessions.filter(s => (s.study_type ?? 'teoria') === t.value);
    const minutes = typeSessions.reduce((a, s) => a + s.duration_minutes, 0);
    const correct = typeSessions.reduce((a, s) => a + s.questions_correct, 0);
    const wrong = typeSessions.reduce((a, s) => a + s.questions_wrong, 0);
    const total = correct + wrong;
    const flashcards = typeSessions.reduce((a, s) => a + (s.flashcards_count ?? 0), 0);
    const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { ...t, minutes, sessions: typeSessions.length, correct, wrong, questions: total, flashcards, acc };
  });
  const maxTypeMinutes = Math.max(...typeStats.map(t => t.minutes), 60);

  const simByDate = [...simulations].sort((a, b) => a.simulation_date.localeCompare(b.simulation_date));

  const availableFilterTopics = topics.filter(t => t.subject_id === filterSubjectId);

  const topicStats = useMemo(() => {
    if (!filterSubjectId) return [];
    const subTopics = topics.filter(t => t.subject_id === filterSubjectId);
    return subTopics.map(t => {
      const tSessions = sessions.filter(s => s.topic_id === t.id);
      const correct = tSessions.reduce((a, s) => a + s.questions_correct, 0);
      const wrong = tSessions.reduce((a, s) => a + s.questions_wrong, 0);
      const total = correct + wrong;
      const acc = total > 0 ? Math.round((correct / total) * 100) : null;
      const minutes = tSessions.reduce((a, s) => a + s.duration_minutes, 0);
      return { ...t, correct, wrong, total, acc, minutes, sessionCount: tSessions.length };
    }).filter(t => t.sessionCount > 0 || t.total > 0).sort((a, b) => b.total - a.total);
  }, [sessions, topics, filterSubjectId]);
  const maxSimScore = Math.max(...simByDate.map(s => s.total_score ?? 0), 1000);

  const last30Days = useMemo(() => {
    const days: { iso: string; studied: boolean; minutes: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = formatLocalDate(d);
      const dayMinutes = filterTopicSessions.filter(s => s.studied_at.split('T')[0] === iso).reduce((a, s) => a + s.duration_minutes, 0);
      const daySims = (!filterTopicId && !filterSubjectId)
        ? simulations.filter(s => getSimulationDate(s) === iso)
        : [];
      const simMinutes = daySims.reduce((a, s) => a + getSimulationDuration(s), 0);
      const totalDayMinutes = dayMinutes + simMinutes;
      const hasStudied = totalDayMinutes > 0 || daySims.length > 0 || filterTopicSessions.some(s => s.studied_at.split('T')[0] === iso);
      days.push({ iso, studied: hasStudied, minutes: totalDayMinutes });
    }
    return days;
  }, [filterTopicSessions, filterTopicId, filterSubjectId, simulations]);

  const studiedDays30 = last30Days.filter(d => d.studied).length;
  const consistencyPct = Math.round((studiedDays30 / 30) * 100);

  const dayOfWeekStats = useMemo(() => {
    const totals = Array(7).fill(0).map(() => ({ minutes: 0, sessions: 0 }));
    filterTopicSessions.forEach(s => {
      const dateStr = s.studied_at.split('T')[0];
      const parts = dateStr.split('-').map(Number);
      const day = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]).getDay() : new Date(s.studied_at).getDay();
      totals[day].minutes += s.duration_minutes;
      totals[day].sessions += 1;
    });
    if (!filterTopicId && !filterSubjectId) {
      simulations.forEach(sim => {
        const sDate = getSimulationDate(sim);
        const parts = sDate.split('-').map(Number);
        const day = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]).getDay() : new Date(sDate).getDay();
        totals[day].minutes += getSimulationDuration(sim);
        totals[day].sessions += 1;
      });
    }
    return totals;
  }, [filterTopicSessions, filterTopicId, filterSubjectId, simulations]);

  const bestDayIdx = dayOfWeekStats.reduce((best, curr, idx) =>
    curr.minutes > dayOfWeekStats[best].minutes ? idx : best, 0);

  const avgSessionMinutes = filterTopicSessions.length > 0 ? Math.round(totalMinutes / filterTopicSessions.length) : 0;

  const subjectQuestions = subjectStats
    .filter(s => s.questions > 0)
    .sort((a, b) => b.questions - a.questions)
    .slice(0, 5);
  const maxSubjectQuestions = Math.max(...subjectQuestions.map(s => s.questions), 1);

  const topStats = [
    { label: 'Tempo total', value: `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`, accent: true },
    { label: 'Aproveitamento', value: `${accuracy}%`, accent: false },
    { label: 'Sessões', value: String(filterTopicSessions.length), accent: false },
    { label: 'Ofensiva', value: `${profile?.current_streak ?? 0}d`, accent: 'bico' as const },
  ];

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
          Estatísticas
        </h1>
        <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
          Análise detalhada do seu desempenho e evolução
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="flex shrink-0 items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
          <Filter size={14} strokeWidth={2.4} />
          <span>Filtros</span>
        </div>
        <select
          value={filterSubjectId}
          onChange={(e) => { setFilterSubjectId(e.target.value); setFilterTopicId(''); }}
          aria-label="Filtrar por matéria"
          className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="">Todas as matérias</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={filterTopicId}
          onChange={(e) => setFilterTopicId(e.target.value)}
          disabled={!filterSubjectId}
          aria-label="Filtrar por tópico"
          className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="">Todos os tópicos</option>
          {availableFilterTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {(filterSubjectId || filterTopicId) && (
          <button
            onClick={() => { setFilterSubjectId(''); setFilterTopicId(''); }}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#14102A] hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <X size={12} strokeWidth={2.4} /> Limpar
          </button>
        )}
      </div>

      {/* Métricas principais */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {topStats.map(s => (
          <div
            key={s.label}
            className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]"
          >
            <div className={cn(
              'font-display text-2xl sm:text-3xl font-bold tracking-tight',
              s.accent === true ? 'text-[#008E32] dark:text-[#19E85F]' : s.accent === 'bico' ? 'text-[#D68200] dark:text-[#FFB84D]' : 'text-[#14102A] dark:text-white'
            )}>
              {s.value}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Consistência · Resumo · Metas */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className="flex flex-col justify-between rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <div>
            <SectionHead icon={Calendar} title="Consistência (30d)" />
            <div className="font-display text-3xl font-bold tracking-tight text-[#008E32] dark:text-[#19E85F]">
              {consistencyPct}%
            </div>
            <p className="mb-4 mt-1 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
              {studiedDays30} de 30 dias estudados
            </p>
          </div>
          <div className="grid grid-cols-10 gap-1.5 pt-2">
            {last30Days.map((d, i) => (
              <div
                key={i}
                title={`${d.iso}: ${d.minutes}min`}
                className={cn(
                  'aspect-square rounded-md transition-colors',
                  d.studied
                    ? 'bg-[#00D64B] shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5'
                )}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <div>
            <SectionHead icon={Timer} title="Resumo de estudo" />
            <div className="flex flex-col gap-3">
              <Row label="Sessão média">{avgSessionMinutes} min</Row>
              <Row label="Melhor dia">{WEEKDAY_LABELS[bestDayIdx]}</Row>
              <Row label="Questões/semana">{weekQuestions}</Row>
              <div className="flex items-center justify-between gap-2 text-xs font-medium">
                <span className="text-[#645F78] dark:text-[#9D96B8]">Aprov. semanal</span>
                <span className="rounded-full bg-[#00D64B]/15 px-2.5 py-0.5 font-display text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                  {weekAccuracy}%
                </span>
              </div>
              <Row label="Dias totais">
                {new Set([
                  ...sessions.map(s => s.studied_at.split('T')[0]),
                  ...simulations.map(s => (s.simulation_date ? s.simulation_date.split('T')[0] : getSimulationQuestions(s).date))
                ]).size}
              </Row>
              <Row label="Média simulados">{avgSimScore || '–'}</Row>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <div>
            <SectionHead
              icon={Target}
              title="Metas desta semana"
              right={
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#645F78] dark:bg-white/5 dark:text-[#9D96B8]">
                  {WEEKDAY_LABELS[new Date().getDay()]}
                </span>
              }
            />
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold text-[#14102A] dark:text-white">
                  <span>Tempo de Estudo</span>
                  <span className="font-display">
                    {Math.floor(weekMinutes / 60)}h{weekMinutes % 60}m / {Math.floor(weeklyMinutesGoal / 60)}h
                  </span>
                </div>
                <Bar pct={weekMinutesPct} color="#00D64B" height={8} />
                <p className="mt-1 text-[11px] font-medium text-[#645F78] dark:text-[#9D96B8]">
                  {weekMinutesPct >= 100 ? 'Meta atingida!' : `${weekMinutesPct}% · ${Math.max(0, weeklyMinutesGoal - weekMinutes)}m restantes`}
                </p>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold text-[#14102A] dark:text-white">
                  <span>Questões Resolvidas</span>
                  <span className="font-display">{weekQuestions} / {weeklyQuestionsGoal}</span>
                </div>
                <Bar pct={weekQuestionsPct} color="#6F00D6" height={8} />
                <p className="mt-1 text-[11px] font-medium text-[#645F78] dark:text-[#9D96B8]">
                  {weekQuestionsPct >= 100 ? 'Meta atingida!' : `${weekQuestionsPct}% · ${Math.max(0, weeklyQuestionsGoal - weekQuestions)} restantes`}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-white/5">
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">
              <span>Meta diária: {dailyGoal}min</span>
              <span>Últimos 7 dias</span>
            </div>
            <div className="flex gap-1.5">
              {last7Days.map((d, i) => {
                const pct = dailyGoal > 0 ? Math.min(100, (d.minutes / dailyGoal) * 100) : 0;
                const isToday = i === last7Days.length - 1;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="relative flex h-10 w-full items-end overflow-hidden rounded-md bg-slate-100 dark:bg-white/5">
                      <div
                        className={cn(
                          'w-full rounded-md transition-all',
                          pct >= 100 ? 'bg-[#00D64B]' : pct > 0 ? 'bg-[#6F00D6]' : ''
                        )}
                        style={{ height: `${Math.max(pct > 0 ? 12 : 0, pct)}%` }}
                      />
                    </div>
                    <span className={cn('text-[10px] font-bold', isToday ? 'text-[#008E32] dark:text-[#19E85F]' : 'text-[#645F78] dark:text-white/40')}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Questões por tópico */}
      {topicStats.length > 0 && (
        <section className="mb-6 rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <SectionHead
            icon={HelpCircle}
            title={`Questões por tópico · ${subjects.find(s => s.id === filterSubjectId)?.name ?? ''}`}
          />
          <div className="flex flex-col gap-3">
            {topicStats.map(t => (
              <div key={t.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#14102A] dark:text-white">{t.name}</span>
                  <span className="font-display font-bold text-[#645F78] dark:text-[#9D96B8]">
                    {t.total} questões{t.acc !== null ? ` · ${t.acc}%` : ''}
                  </span>
                </div>
                <Bar
                  pct={Math.max(4, (t.total / Math.max(...topicStats.map(x => x.total), 1)) * 100)}
                  color={subjects.find(s => s.id === filterSubjectId)?.color ?? '#6F00D6'}
                  height={8}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gráficos de 7 dias e matérias */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <SectionHead icon={BarChart3} title="Tempo estudado (7 dias)" />
          {last7Days.every(d => d.minutes === 0) ? (
            <p className="py-12 text-center text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
              Nenhum estudo registrado nesta semana.
            </p>
          ) : (
            <div className="flex h-44 items-end justify-between gap-2.5 pt-4">
              {last7Days.map((d, i) => {
                const height = d.minutes > 0 ? Math.max(8, (d.minutes / maxDayMinutes) * 100) : 4;
                const isToday = i === last7Days.length - 1;
                return (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="font-display text-[11px] font-bold text-[#14102A] dark:text-white">
                      {d.minutes > 0 ? `${d.minutes}m` : ''}
                    </span>
                    <div className="h-full w-full flex items-end">
                      <div
                        className={cn(
                          'w-full rounded-t-lg transition-all duration-300',
                          isToday
                            ? 'bg-[#00D64B] shadow-xs'
                            : d.minutes > 0
                            ? 'bg-[#6F00D6] dark:bg-[#822BD9]'
                            : 'bg-slate-100 dark:bg-white/5',
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className={cn('text-[11px] font-bold', isToday ? 'text-[#008E32] dark:text-[#19E85F]' : 'text-[#645F78] dark:text-white/40')}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <SectionHead icon={BookOpen} title="Tempo por matéria" />
          {subjectStats.length === 0 ? (
            <p className="py-10 text-center text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
              Nenhuma sessão registrada ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {subjectStats.slice(0, 6).map(s => (
                <div key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                      <span className="truncate font-bold text-[#14102A] dark:text-white">{s.name}</span>
                    </span>
                    <span className="shrink-0 font-display font-bold text-[#645F78] dark:text-[#9D96B8]">
                      {Math.floor(s.minutes / 60)}h{s.minutes % 60}m · {s.acc}%
                    </span>
                  </div>
                  <Bar pct={(s.minutes / maxSubjectMinutes) * 100} color={s.color} height={8} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Tipo de estudo e questões por matéria */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {sessions.length > 0 && (
          <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
            <SectionHead icon={BarChart3} title="Tempo por tipo de estudo" />
            <div className="flex flex-col gap-3">
              {typeStats.map(t => (
                <div key={t.value}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#14102A] dark:text-white">
                      <span>{t.emoji}</span> {t.label}
                    </span>
                    <span className="shrink-0 font-display font-bold text-[#645F78] dark:text-[#9D96B8]">
                      {Math.floor(t.minutes / 60)}h{t.minutes % 60}m · {t.sessions} sessões
                      {t.flashcards > 0 ? ` · ${t.flashcards} cards` : ''}
                      {t.questions > 0 ? ` · ${t.acc}%` : ''}
                    </span>
                  </div>
                  <Bar
                    pct={(t.minutes / maxTypeMinutes) * 100}
                    color={t.value === 'teoria' ? '#00D64B' : t.value === 'questoes' ? '#D68200' : t.value === 'revisao' ? '#6F00D6' : '#3B82F6'}
                    height={8}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {subjectQuestions.length > 0 && (
          <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
            <SectionHead icon={HelpCircle} title="Questões por matéria" />
            <div className="flex flex-col gap-3">
              {subjectQuestions.map(s => (
                <div key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                      <span className="truncate font-bold text-[#14102A] dark:text-white">{s.name}</span>
                    </span>
                    <span className="shrink-0 font-display font-bold text-[#645F78] dark:text-[#9D96B8]">
                      {s.questions} questões · {s.acc}%
                    </span>
                  </div>
                  <Bar pct={(s.questions / maxSubjectQuestions) * 100} color={s.color} height={8} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Distribuição por dia da semana */}
      <section className="mb-6 rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <SectionHead icon={Calendar} title="Distribuição por dia da semana" />
        <div className="flex h-36 items-end justify-between gap-2 pt-4">
          {dayOfWeekStats.map((d, i) => {
            const maxDayMin = Math.max(...dayOfWeekStats.map(x => x.minutes), 60);
            const height = d.minutes > 0 ? Math.max(8, (d.minutes / maxDayMin) * 100) : 4;
            const isBest = i === bestDayIdx && d.minutes > 0;
            return (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="font-display text-[11px] font-bold text-[#14102A] dark:text-white">
                  {d.minutes > 0 ? `${Math.floor(d.minutes / 60)}h${d.minutes % 60}m` : ''}
                </span>
                <div className="h-full w-full flex items-end">
                  <div
                    className={cn(
                      'w-full rounded-t-lg transition-all duration-300',
                      isBest
                        ? 'bg-[#00D64B] shadow-xs'
                        : d.minutes > 0
                        ? 'bg-[#6F00D6] dark:bg-[#822BD9]'
                        : 'bg-slate-100 dark:bg-white/5',
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className={cn('text-[11px] font-bold', isBest ? 'text-[#008E32] dark:text-[#19E85F]' : 'text-[#645F78] dark:text-white/40')}>
                  {WEEKDAY_LABELS[i].slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Evolução dos simulados */}
      {simByDate.length > 0 && (
        <section className="mb-6 rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <SectionHead icon={TrendingUp} title="Evolução dos simulados" />
          <div className="relative pt-2">
            <svg className="h-44 w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline
                points={simByDate.map((s, i) => {
                  const x = (i / (simByDate.length - 1 || 1)) * 100;
                  const y = 100 - ((s.total_score ?? 0) / maxSimScore) * 90 - 5;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#6F00D6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {simByDate.map((s, i) => {
                const x = (i / (simByDate.length - 1 || 1)) * 100;
                const y = 100 - ((s.total_score ?? 0) / maxSimScore) * 90 - 5;
                return (
                  <circle
                    key={s.id}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#00D64B"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
            <div className="mt-3 flex justify-between font-display text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">
              {simByDate.map(s => (
                <span key={s.id}>{new Date(s.simulation_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tabela por matéria */}
      {subjectStats.length > 0 && (
        <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
          <SectionHead icon={Award} title="Desempenho por matéria" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-left dark:border-white/5">
                  {['Matéria', 'Sessões', 'Tempo', 'Questões', 'Tópicos', 'Acertos', 'Aprov.'].map((h, i) => (
                    <th
                      key={h}
                      className={cn(
                        'pb-2.5 font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]',
                        i === 0 ? 'pr-4' : i === 6 ? 'pl-2 text-right' : 'px-2 text-center',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjectStats.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/50 dark:border-white/[0.03] dark:hover:bg-white/[0.02]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="font-bold text-[#14102A] dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center font-display font-semibold text-[#14102A] dark:text-white">{s.sessions}</td>
                    <td className="px-2 py-3 text-center font-display font-semibold text-[#14102A] dark:text-white">{Math.floor(s.minutes / 60)}h{s.minutes % 60}m</td>
                    <td className="px-2 py-3 text-center font-display font-semibold text-[#14102A] dark:text-white">{s.questions}</td>
                    <td className="px-2 py-3 text-center">
                      <span className="font-display font-semibold text-[#645F78] dark:text-[#9D96B8]">{s.completedCount}/{s.topicTotal}</span>
                      <div className="mx-auto mt-1 w-14"><Bar pct={s.topicProgress} color="#00D64B" height={5} /></div>
                    </td>
                    <td className="px-2 py-3 text-center font-display font-semibold text-[#14102A] dark:text-white">{s.correct}</td>
                    <td className="py-3 pl-2 text-right">
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 font-display font-bold',
                        s.acc >= 70 ? 'bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]' : s.acc >= 50 ? 'bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      )}>
                        {s.acc}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
