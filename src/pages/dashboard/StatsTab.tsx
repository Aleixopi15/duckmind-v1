import { useMemo, useState, type ReactNode, type ComponentType } from 'react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/theme';
import { STUDY_TYPES } from '../../components/LogStudyDialog';
import {
  Target, Award, TrendingUp, BookOpen, BarChart3,
  Calendar, HelpCircle, Timer, Filter, X,
} from 'lucide-react';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const diff = date.getDate() - date.getDay();
  date.setDate(diff);
  return date;
}

/** Cabeçalho de seção com ícone em azulejo. */
function SectionHead({ icon: Icon, title, right }: { icon: ComponentType<{ size?: number; strokeWidth?: number }>; title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-[3px] border-tinta bg-papel text-tinta dark:border-papel dark:bg-transparent dark:text-papel">
        <Icon size={16} strokeWidth={3} />
      </span>
      <h2 className="font-display text-xl font-bold leading-tight text-tinta dark:text-papel">{title}</h2>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

/** Barra de progresso com contorno de 3px. */
function Bar({ pct, color, height = 14 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="track w-full" style={{ height }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  );
}

/** Linha de resumo rótulo → valor. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[15px]">
      <span className="font-semibold text-muted dark:text-papel/60">{label}</span>
      <span className="font-display font-bold text-tinta dark:text-papel">{children}</span>
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

  const totalMinutes = filterTopicSessions.reduce((a, s) => a + s.duration_minutes, 0);
  const totalCorrect = filterTopicSessions.reduce((a, s) => a + s.questions_correct, 0);
  const totalWrong = filterTopicSessions.reduce((a, s) => a + s.questions_wrong, 0);
  const totalQuestions = totalCorrect + totalWrong;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgSimScore = simulations.length > 0
    ? Math.round(simulations.reduce((a, s) => a + (s.total_score ?? 0), 0) / simulations.length)
    : 0;

  const weekStart = startOfWeek(new Date());
  const weekStartIso = weekStart.toISOString().split('T')[0];

  const weekSessions = filterTopicSessions.filter(s => s.studied_at.split('T')[0] >= weekStartIso);
  const weekMinutes = weekSessions.reduce((a, s) => a + s.duration_minutes, 0);
  const weekQuestions = weekSessions.reduce((a, s) => a + s.questions_correct + s.questions_wrong, 0);
  const weekCorrect = weekSessions.reduce((a, s) => a + s.questions_correct, 0);
  const weekAccuracy = weekQuestions > 0 ? Math.round((weekCorrect / weekQuestions) * 100) : 0;

  const weekMinutesPct = weeklyMinutesGoal > 0 ? Math.min(100, Math.round((weekMinutes / weeklyMinutesGoal) * 100)) : 0;
  const weekQuestionsPct = weeklyQuestionsGoal > 0 ? Math.min(100, Math.round((weekQuestions / weeklyQuestionsGoal) * 100)) : 0;

  const last7Days = useMemo(() => {
    const days: { label: string; minutes: number; questions: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const daySessions = filterTopicSessions.filter(s => s.studied_at.split('T')[0] === iso);
      const minutes = daySessions.reduce((a, s) => a + s.duration_minutes, 0);
      const questions = daySessions.reduce((a, s) => a + s.questions_correct + s.questions_wrong, 0);
      days.push({ label: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][d.getDay()], minutes, questions, date: iso });
    }
    return days;
  }, [filterTopicSessions]);

  const maxDayMinutes = Math.max(...last7Days.map(d => d.minutes), 60);

  const subjectStats = subjects.map(sub => {
    const subSessions = filterTopicSessions.filter(s => s.subject_id === sub.id);
    const minutes = subSessions.reduce((a, s) => a + s.duration_minutes, 0);
    const correct = subSessions.reduce((a, s) => a + s.questions_correct, 0);
    const wrong = subSessions.reduce((a, s) => a + s.questions_wrong, 0);
    const total = correct + wrong;
    const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
    const subTopics = topics.filter(t => t.subject_id === sub.id);
    const completedCount = topicCompletions.filter(tc => subTopics.some(t => t.id === tc.topic_id)).length;
    const topicProgress = subTopics.length > 0 ? Math.round((completedCount / subTopics.length) * 100) : 0;
    return { ...sub, minutes, sessions: subSessions.length, acc, correct, wrong, questions: total, topicProgress, completedCount, topicTotal: subTopics.length };
  }).filter(s => s.sessions > 0 || s.completedCount > 0).sort((a, b) => b.minutes - a.minutes);

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
      const iso = d.toISOString().split('T')[0];
      const dayMinutes = filterTopicSessions.filter(s => s.studied_at.split('T')[0] === iso).reduce((a, s) => a + s.duration_minutes, 0);
      days.push({ iso, studied: dayMinutes > 0, minutes: dayMinutes });
    }
    return days;
  }, [filterTopicSessions]);

  const studiedDays30 = last30Days.filter(d => d.studied).length;
  const consistencyPct = Math.round((studiedDays30 / 30) * 100);

  const dayOfWeekStats = useMemo(() => {
    const totals = Array(7).fill(0).map(() => ({ minutes: 0, sessions: 0 }));
    filterTopicSessions.forEach(s => {
      const day = new Date(s.studied_at).getDay();
      totals[day].minutes += s.duration_minutes;
      totals[day].sessions += 1;
    });
    return totals;
  }, [filterTopicSessions]);

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

  const accentBg = (accent: boolean | 'bico') =>
    cn('stat min-w-0', accent === true && 'bg-pato', accent === 'bico' && 'bg-bico');

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      <div className="mb-5">
        <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-papel sm:text-[2.6rem]">
          Estatísticas
        </h1>
        <p className="mt-1 text-[17px] font-semibold text-muted dark:text-papel/70">
          Análise detalhada do seu desempenho
        </p>
      </div>

      {/* Filtros */}
      <div className="card mb-5 flex flex-wrap items-center gap-2.5 p-3.5">
        <span className="flex shrink-0 items-center gap-1.5 font-display text-lg font-bold">
          <Filter size={16} strokeWidth={3} /> Filtros
        </span>
        <select
          value={filterSubjectId}
          onChange={(e) => { setFilterSubjectId(e.target.value); setFilterTopicId(''); }}
          aria-label="Filtrar por matéria"
          className="input w-auto min-w-[170px] shrink-0 py-1.5 text-sm font-bold"
          style={{ borderRadius: 9999 }}
        >
          <option value="">Todas as matérias</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={filterTopicId}
          onChange={(e) => setFilterTopicId(e.target.value)}
          disabled={!filterSubjectId}
          aria-label="Filtrar por tópico"
          className="input w-auto min-w-[170px] shrink-0 py-1.5 text-sm font-bold"
          style={{ borderRadius: 9999 }}
        >
          <option value="">Todos os tópicos</option>
          {availableFilterTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {(filterSubjectId || filterTopicId) && (
          <button onClick={() => { setFilterSubjectId(''); setFilterTopicId(''); }} className="btn bg-white px-3 py-1 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
            <X size={14} strokeWidth={3} /> Limpar
          </button>
        )}
      </div>

      {/* Métricas principais */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {topStats.map(s => (
          <div key={s.label} className={accentBg(s.accent)}>
            <div className="stat-value truncate">{s.value}</div>
            <div className="stat-label mt-0.5 truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Consistência · Resumo · Metas */}
      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <SectionHead icon={Calendar} title="Consistência (30d)" />
          <div className="font-display text-[2.6rem] font-bold leading-none text-tinta dark:text-papel">{consistencyPct}%</div>
          <p className="mb-3 mt-1 text-sm font-semibold text-muted dark:text-papel/60">
            {studiedDays30} de 30 dias estudados
          </p>
          <div className="grid grid-cols-10 gap-1">
            {last30Days.map((d, i) => (
              <div
                key={i}
                title={`${d.iso}: ${d.minutes}min`}
                className={cn(
                  'aspect-square rounded-[5px] border-2 border-tinta dark:border-papel/50',
                  d.studied ? 'bg-pato' : 'bg-[#E8E0CC] dark:bg-surface-dark-subtle',
                )}
              />
            ))}
          </div>
        </section>

        <section className="card p-5">
          <SectionHead icon={Timer} title="Resumo de estudo" />
          <div className="flex flex-col gap-2.5">
            <Row label="Sessão média">{avgSessionMinutes} min</Row>
            <Row label="Melhor dia">{WEEKDAY_LABELS[bestDayIdx]}</Row>
            <Row label="Questões/semana">{weekQuestions}</Row>
            <div className="flex items-center justify-between gap-2 text-[15px]">
              <span className="font-semibold text-muted dark:text-papel/60">Aprov. semanal</span>
              <span className="chip bg-pato text-tinta dark:border-papel">{weekAccuracy}%</span>
            </div>
            <Row label="Dias totais">{new Set(sessions.map(s => s.studied_at.split('T')[0])).size}</Row>
            <Row label="Média simulados">{avgSimScore || '–'}</Row>
          </div>
        </section>

        <section className="card p-5">
          <SectionHead icon={Target} title="Metas desta semana" right={
            <span className="font-display text-sm font-bold text-muted dark:text-papel/50">{WEEKDAY_LABELS[new Date().getDay()]}</span>
          } />
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-[15px] font-bold">
                <span>Tempo</span>
                <span className="font-display">
                  {Math.floor(weekMinutes / 60)}h{weekMinutes % 60}m / {Math.floor(weeklyMinutesGoal / 60)}h
                </span>
              </div>
              <Bar pct={weekMinutesPct} color="#00D64B" height={18} />
              <p className="mt-1 text-xs font-bold text-muted dark:text-papel/55">
                {weekMinutesPct >= 100 ? 'Meta atingida!' : `${weekMinutesPct}% · ${Math.max(0, weeklyMinutesGoal - weekMinutes)}m restantes`}
              </p>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-[15px] font-bold">
                <span>Questões</span>
                <span className="font-display">{weekQuestions} / {weeklyQuestionsGoal}</span>
              </div>
              <Bar pct={weekQuestionsPct} color="#6F00D6" height={18} />
              <p className="mt-1 text-xs font-bold text-muted dark:text-papel/55">
                {weekQuestionsPct >= 100 ? 'Meta atingida!' : `${weekQuestionsPct}% · ${Math.max(0, weeklyQuestionsGoal - weekQuestions)} restantes`}
              </p>
            </div>
            <div className="border-t-[3px] border-tinta/15 pt-3 dark:border-papel/15">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted dark:text-papel/60">Meta diária: {dailyGoal}min</span>
                <span className="text-xs font-bold text-muted dark:text-papel/40">7 dias</span>
              </div>
              <div className="flex gap-1.5">
                {last7Days.map((d, i) => {
                  const pct = dailyGoal > 0 ? Math.min(100, (d.minutes / dailyGoal) * 100) : 0;
                  const isToday = i === last7Days.length - 1;
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="relative flex h-12 w-full items-end overflow-hidden rounded-[6px] border-2 border-tinta bg-papel dark:border-papel/50 dark:bg-surface-dark">
                        <div
                          className={cn('w-full transition-all', pct >= 100 ? 'bg-pato' : pct > 0 ? 'bg-mente' : '')}
                          style={{ height: `${Math.max(pct > 0 ? 8 : 0, pct)}%` }}
                        />
                      </div>
                      <span className={cn('text-[10px] font-bold', isToday ? 'text-mente dark:text-pato' : 'text-muted dark:text-papel/40')}>
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Questões por tópico */}
      {topicStats.length > 0 && (
        <section className="card mb-5 p-5">
          <SectionHead
            icon={HelpCircle}
            title={`Questões por tópico · ${subjects.find(s => s.id === filterSubjectId)?.name ?? ''}`}
          />
          <div className="flex flex-col gap-2.5">
            {topicStats.map(t => (
              <div key={t.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{t.name}</span>
                  <span className="font-display text-xs font-bold text-muted dark:text-papel/60">
                    {t.total} questões{t.acc !== null ? ` · ${t.acc}%` : ''}
                  </span>
                </div>
                <Bar
                  pct={Math.max(4, (t.total / Math.max(...topicStats.map(x => x.total), 1)) * 100)}
                  color={subjects.find(s => s.id === filterSubjectId)?.color ?? '#6F00D6'}
                  height={12}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gráficos de 7 dias e matérias */}
      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <SectionHead icon={BarChart3} title="Tempo estudado (7 dias)" />
          {last7Days.every(d => d.minutes === 0) ? (
            <p className="py-12 text-center text-sm font-semibold text-muted dark:text-papel/60">
              Nenhum estudo registrado nesta semana.
            </p>
          ) : (
            <div className="flex h-44 items-end justify-between gap-2">
              {last7Days.map((d, i) => {
                const height = d.minutes > 0 ? Math.max(8, (d.minutes / maxDayMinutes) * 100) : 3;
                const isToday = i === last7Days.length - 1;
                return (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="font-display text-xs font-bold text-tinta dark:text-papel">
                      {d.minutes > 0 ? `${d.minutes}m` : ''}
                    </span>
                    <div
                      className={cn(
                        'w-full rounded-t-[10px] border-[3px] border-tinta dark:border-papel/60',
                        isToday ? 'bg-mente' : d.minutes > 0 ? 'bg-pato' : 'border-dashed bg-transparent',
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className={cn('text-xs font-bold', isToday ? 'text-mente dark:text-pato' : 'text-muted dark:text-papel/50')}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card p-5">
          <SectionHead icon={BookOpen} title="Tempo por matéria" />
          {subjectStats.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-muted dark:text-papel/60">
              Nenhuma sessão registrada ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {subjectStats.slice(0, 6).map(s => (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full border-2 border-tinta" style={{ background: s.color }} />
                      <span className="truncate text-sm font-bold">{s.name}</span>
                    </span>
                    <span className="shrink-0 font-display text-xs font-bold text-muted dark:text-papel/60">
                      {Math.floor(s.minutes / 60)}h{s.minutes % 60}m · {s.acc}%
                    </span>
                  </div>
                  <Bar pct={(s.minutes / maxSubjectMinutes) * 100} color={s.color} height={12} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Tipo de estudo e questões por matéria */}
      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        {sessions.length > 0 && (
          <section className="card p-5">
            <SectionHead icon={BarChart3} title="Tempo por tipo de estudo" />
            <div className="flex flex-col gap-2.5">
              {typeStats.map(t => (
                <div key={t.value}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <span className="text-base">{t.emoji}</span> {t.label}
                    </span>
                    <span className="shrink-0 font-display text-xs font-bold text-muted dark:text-papel/60">
                      {Math.floor(t.minutes / 60)}h{t.minutes % 60}m · {t.sessions}
                      {t.flashcards > 0 ? ` · ${t.flashcards} cards` : ''}
                      {t.questions > 0 ? ` · ${t.acc}%` : ''}
                    </span>
                  </div>
                  <Bar
                    pct={(t.minutes / maxTypeMinutes) * 100}
                    color={t.value === 'teoria' ? '#00D64B' : t.value === 'questoes' ? '#D68200' : t.value === 'revisao' ? '#6F00D6' : '#17102B'}
                    height={12}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {subjectQuestions.length > 0 && (
          <section className="card p-5">
            <SectionHead icon={HelpCircle} title="Questões por matéria" />
            <div className="flex flex-col gap-2.5">
              {subjectQuestions.map(s => (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full border-2 border-tinta" style={{ background: s.color }} />
                      <span className="truncate text-sm font-bold">{s.name}</span>
                    </span>
                    <span className="shrink-0 font-display text-xs font-bold text-muted dark:text-papel/60">
                      {s.questions} · {s.acc}%
                    </span>
                  </div>
                  <Bar pct={(s.questions / maxSubjectQuestions) * 100} color={s.color} height={12} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Distribuição por dia da semana */}
      <section className="card mb-5 p-5">
        <SectionHead icon={Calendar} title="Distribuição por dia da semana" />
        <div className="flex h-36 items-end justify-between gap-2">
          {dayOfWeekStats.map((d, i) => {
            const maxDayMin = Math.max(...dayOfWeekStats.map(x => x.minutes), 60);
            const height = d.minutes > 0 ? Math.max(8, (d.minutes / maxDayMin) * 100) : 3;
            const isBest = i === bestDayIdx && d.minutes > 0;
            return (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="font-display text-[11px] font-bold text-tinta dark:text-papel">
                  {d.minutes > 0 ? `${Math.floor(d.minutes / 60)}h${d.minutes % 60}m` : ''}
                </span>
                <div
                  className={cn(
                    'w-full rounded-t-[10px] border-[3px] border-tinta dark:border-papel/60',
                    isBest ? 'bg-bico' : d.minutes > 0 ? 'bg-pato' : 'border-dashed bg-transparent',
                  )}
                  style={{ height: `${height}%` }}
                />
                <span className={cn('text-[11px] font-bold', isBest ? 'text-tinta dark:text-bico' : 'text-muted dark:text-papel/50')}>
                  {WEEKDAY_LABELS[i].slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Evolução dos simulados */}
      {simByDate.length > 0 && (
        <section className="card mb-5 p-5">
          <SectionHead icon={TrendingUp} title="Evolução dos simulados" />
          <div className="relative">
            <svg className="h-48 w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline
                points={simByDate.map((s, i) => {
                  const x = (i / (simByDate.length - 1 || 1)) * 100;
                  const y = 100 - ((s.total_score ?? 0) / maxSimScore) * 90 - 5;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#6F00D6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {simByDate.map((s, i) => {
                const x = (i / (simByDate.length - 1 || 1)) * 100;
                const y = 100 - ((s.total_score ?? 0) / maxSimScore) * 90 - 5;
                return <circle key={s.id} cx={x} cy={y} r="2.4" fill="#00D64B" stroke="#17102B" strokeWidth="1" vectorEffect="non-scaling-stroke" />;
              })}
            </svg>
            <div className="mt-2 flex justify-between font-display text-xs font-bold text-muted dark:text-papel/50">
              {simByDate.map(s => (
                <span key={s.id}>{new Date(s.simulation_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tabela por matéria */}
      {subjectStats.length > 0 && (
        <section className="card p-5">
          <SectionHead icon={Award} title="Desempenho por matéria" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b-[3px] border-tinta text-left dark:border-papel/40">
                  {['Matéria', 'Sessões', 'Tempo', 'Questões', 'Tópicos', 'Acertos', 'Aprov.'].map((h, i) => (
                    <th
                      key={h}
                      className={cn(
                        'pb-2 font-display text-[13px] font-bold uppercase tracking-wide text-muted dark:text-papel/60',
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
                  <tr key={s.id} className="border-b-2 border-tinta/10 dark:border-papel/10">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 shrink-0 rounded-full border-2 border-tinta" style={{ background: s.color }} />
                        <span className="font-bold">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center font-display font-bold">{s.sessions}</td>
                    <td className="px-2 py-2.5 text-center font-display font-bold">{Math.floor(s.minutes / 60)}h{s.minutes % 60}m</td>
                    <td className="px-2 py-2.5 text-center font-display font-bold">{s.questions}</td>
                    <td className="px-2 py-2.5 text-center">
                      <span className="font-display text-xs font-bold">{s.completedCount}/{s.topicTotal}</span>
                      <div className="mx-auto mt-1 w-14"><Bar pct={s.topicProgress} color="#00D64B" height={8} /></div>
                    </td>
                    <td className="px-2 py-2.5 text-center font-display font-bold">{s.correct}</td>
                    <td className="py-2.5 pl-2 text-right">
                      <span className={cn('chip', s.acc >= 70 ? 'bg-pato text-tinta' : s.acc >= 50 ? 'bg-bico text-tinta' : 'bg-tinta text-papel')}>
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
