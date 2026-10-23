import { useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/theme';
import {
  Calculator,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  BookOpen,
  Award,
} from 'lucide-react';

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

export default function UniversityStatsTab() {
  const {
    universitySubjects,
    universityGrades,
    universityTasks,
    universitySessions,
    universityFlashcards,
  } = useApp();

  // Coeficiente de Rendimento (CR / GPA) Ponderado
  const { overallGpa, completedGradesCount } = useMemo(() => {
    const scoredGrades = universityGrades.filter(g => g.score !== null);
    if (scoredGrades.length === 0) {
      return { overallGpa: null, completedGradesCount: 0 };
    }
    const sumWeightedScore = scoredGrades.reduce(
      (acc, g) => acc + (g.score || 0) * (g.weight || 1),
      0
    );
    const sumWeights = scoredGrades.reduce((acc, g) => acc + (g.weight || 1), 0);
    const avg = sumWeights > 0 ? sumWeightedScore / sumWeights : null;
    return {
      overallGpa: avg !== null ? parseFloat(avg.toFixed(2)) : null,
      completedGradesCount: scoredGrades.length,
      totalWeights: sumWeights,
    };
  }, [universityGrades]);

  // Total de horas estudadas
  const totalMinutes = useMemo(() => {
    return universitySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  }, [universitySessions]);

  const totalHours = Math.floor(totalMinutes / 60);

  // Estatísticas semanais
  const weekStart = startOfWeek(new Date());
  const weekStartIso = formatLocalDate(weekStart);

  const thisWeekSessions = useMemo(() => {
    return universitySessions.filter(s => s.studied_at.split('T')[0] >= weekStartIso);
  }, [universitySessions, weekStartIso]);

  const thisWeekMinutes = thisWeekSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const thisWeekHours = Math.floor(thisWeekMinutes / 60);

  // Distribuição diária nos dias da semana
  const weekdayStudyHours = useMemo(() => {
    const days = [0, 0, 0, 0, 0, 0, 0];
    for (const session of thisWeekSessions) {
      const d = new Date(session.studied_at);
      const dayIdx = d.getDay();
      days[dayIdx] += session.duration_minutes / 60;
    }
    return days;
  }, [thisWeekSessions]);

  const maxWeekdayHour = Math.max(...weekdayStudyHours, 4);

  // Cumprimento de tarefas (prazos)
  const taskStats = useMemo(() => {
    const total = universityTasks.length;
    const done = universityTasks.filter(t => t.status === 'done').length;
    const inProgress = universityTasks.filter(t => t.status === 'in_progress').length;
    const todo = universityTasks.filter(t => t.status === 'todo').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 100;
    return { total, done, inProgress, todo, completionRate };
  }, [universityTasks]);

  // Flashcards
  const flashcardStats = useMemo(() => {
    const total = universityFlashcards.length;
    const dominados = universityFlashcards.filter(f => f.status === 'dominado').length;
    const revisando = universityFlashcards.filter(f => f.status === 'revisando').length;
    const novos = universityFlashcards.filter(f => f.status === 'novo').length;
    return { total, dominados, revisando, novos };
  }, [universityFlashcards]);

  // Desempenho detalhado por disciplina
  const subjectPerformance = useMemo(() => {
    return universitySubjects.map(sub => {
      // Horas estudadas nessa matéria (geral e essa semana)
      const subSessions = universitySessions.filter(s => s.subject_id === sub.id);
      const subTotalMins = subSessions.reduce((a, s) => a + s.duration_minutes, 0);
      const subWeekMins = subSessions
        .filter(s => s.studied_at.split('T')[0] >= weekStartIso)
        .reduce((a, s) => a + s.duration_minutes, 0);

      const targetWeeklyMins = (sub.target_hours_weekly || 4) * 60;
      const targetPct = targetWeeklyMins > 0 ? Math.min(100, Math.round((subWeekMins / targetWeeklyMins) * 100)) : 0;

      // Média da matéria
      const subGrades = universityGrades.filter(g => g.subject_id === sub.id && g.score !== null);
      let subGpa: number | null = null;
      if (subGrades.length > 0) {
        const sumWeighted = subGrades.reduce((a, g) => a + (g.score || 0) * (g.weight || 1), 0);
        const sumW = subGrades.reduce((a, g) => a + (g.weight || 1), 0);
        subGpa = sumW > 0 ? parseFloat((sumWeighted / sumW).toFixed(1)) : null;
      }

      // Tarefas
      const subTasks = universityTasks.filter(t => t.subject_id === sub.id);
      const subDoneTasks = subTasks.filter(t => t.status === 'done').length;

      return {
        ...sub,
        totalMinutes: subTotalMins,
        weekMinutes: subWeekMins,
        targetWeeklyMins,
        targetPct,
        subGpa,
        gradesCount: subGrades.length,
        tasksTotal: subTasks.length,
        tasksDone: subDoneTasks,
      };
    });
  }, [universitySubjects, universitySessions, universityGrades, universityTasks, weekStartIso]);

  return (
    <div className="w-full max-w-5xl min-w-0 animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
          Estatísticas Acadêmicas
        </h1>
        <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
          Painel de rendimento do semestre universitário: Coeficiente de Rendimento (CR), metas de estudo e entregas.
        </p>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* CR / Média Geral */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">CR Geral (Média)</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#B379FF]">
              <Calculator size={14} strokeWidth={2.4} />
            </span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#14102A] dark:text-white">
            {overallGpa !== null ? overallGpa.toFixed(1) : '--'}
            <span className="text-xs font-normal text-muted"> / 10.0</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {completedGradesCount} avaliações computadas
          </p>
        </div>

        {/* Horas Totais */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Horas Estudadas</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]">
              <Clock size={14} strokeWidth={2.4} />
            </span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#14102A] dark:text-white">
            {totalHours}h
          </div>
          <p className="mt-1 text-[11px] text-[#008E32] dark:text-[#19E85F] font-bold">
            {thisWeekHours}h nesta semana
          </p>
        </div>

        {/* Taxa de Entrega de Trabalhos */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Entregas no Prazo</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <CheckCircle2 size={14} strokeWidth={2.4} />
            </span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#14102A] dark:text-white">
            {taskStats.completionRate}%
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {taskStats.done} de {taskStats.total} trabalhos entregues
          </p>
        </div>

        {/* Disciplinas Cursadas */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Disciplinas</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]">
              <BookOpen size={14} strokeWidth={2.4} />
            </span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#14102A] dark:text-white">
            {universitySubjects.length}
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {flashcardStats.total} flashcards no acervo
          </p>
        </div>
      </div>

      {/* Gráfico Semanal e Metas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Horas Estudadas nos Dias da Semana */}
        <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#B379FF]">
              <BarChart3 size={15} strokeWidth={2.4} />
            </span>
            <h2 className="font-display text-base font-bold text-[#14102A] dark:text-white">
              Ritmo de Estudo Semanal
            </h2>
          </div>

          <div className="flex h-40 items-end justify-between gap-2 pt-6">
            {weekdayStudyHours.map((hours, i) => {
              const heightPct = maxWeekdayHour > 0 ? (hours / maxWeekdayHour) * 100 : 0;
              const isToday = new Date().getDay() === i;

              return (
                <div key={WEEKDAY_LABELS[i]} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-muted">
                    {hours > 0 ? `${hours.toFixed(1)}h` : ''}
                  </span>
                  <div className="w-full max-w-[28px] rounded-t-lg bg-slate-100 dark:bg-white/5 overflow-hidden h-full flex items-end">
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all duration-300',
                        isToday
                          ? 'bg-[#6F00D6] dark:bg-[#9B3DFF]'
                          : 'bg-[#00D64B] dark:bg-[#19E85F]'
                      )}
                      style={{ height: `${Math.max(hours > 0 ? 12 : 4, heightPct)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-bold',
                      isToday ? 'text-[#6F00D6] dark:text-[#B379FF]' : 'text-muted'
                    )}
                  >
                    {WEEKDAY_LABELS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Metas Semanais por Disciplina */}
        <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]">
                <TrendingUp size={15} strokeWidth={2.4} />
              </span>
              <h2 className="font-display text-base font-bold text-[#14102A] dark:text-white">
                Metas Semanais por Disciplina
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted">Meta semanal</span>
          </div>

          <div className="space-y-3.5">
            {subjectPerformance.slice(0, 5).map(sub => {
              const weekHours = (sub.weekMinutes / 60).toFixed(1);
              const targetHours = sub.target_hours_weekly || 4;

              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[#14102A] dark:text-white">
                      <span>{sub.icon}</span>
                      <span className="truncate max-w-[170px]">{sub.name}</span>
                    </span>
                    <span className="text-muted font-mono">
                      {weekHours}h / {targetHours}h ({sub.targetPct}%)
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, sub.targetPct)}%`,
                        backgroundColor: sub.color || '#00D64B',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Tabela de Desempenho Completo por Disciplina */}
      <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#B379FF]">
            <Award size={15} strokeWidth={2.4} />
          </span>
          <h2 className="font-display text-base font-bold text-[#14102A] dark:text-white">
            Desempenho Geral por Disciplina
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead>
              <tr className="border-b border-slate-100 pb-2.5 text-left font-bold text-[#645F78] dark:border-white/5 dark:text-[#9D96B8]">
                <th className="pb-2.5">Disciplina</th>
                <th className="pb-2.5">Código / Créditos</th>
                <th className="pb-2.5 text-center">Horas Estudadas</th>
                <th className="pb-2.5 text-center">Média / CR</th>
                <th className="pb-2.5 text-center">Status</th>
                <th className="pb-2.5 text-right">Trabalhos Entregues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {subjectPerformance.map(sub => {
                const totalH = (sub.totalMinutes / 60).toFixed(1);
                const gpaStatus =
                  sub.subGpa === null
                    ? { label: 'Sem notas', color: 'bg-slate-100 text-muted dark:bg-white/5' }
                    : sub.subGpa >= 7.0
                    ? { label: 'Aprovado', color: 'bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]' }
                    : sub.subGpa >= 5.0
                    ? { label: 'Em Exame / Atenção', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' }
                    : { label: 'Em Risco', color: 'bg-red-500/15 text-red-600 dark:text-red-400' };

                return (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold text-[#14102A] dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{sub.icon}</span>
                        <span>{sub.name}</span>
                      </div>
                    </td>

                    <td className="py-3 text-muted">
                      {sub.code || '--'} · {sub.credits} créditos
                    </td>

                    <td className="py-3 text-center font-mono font-bold text-[#14102A] dark:text-white">
                      {totalH}h
                    </td>

                    <td className="py-3 text-center font-display font-bold">
                      {sub.subGpa !== null ? (
                        <span className={sub.subGpa >= 7.0 ? 'text-[#008E32] dark:text-[#19E85F]' : 'text-amber-500'}>
                          {sub.subGpa.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted">--</span>
                      )}
                    </td>

                    <td className="py-3 text-center">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', gpaStatus.color)}>
                        {gpaStatus.label}
                      </span>
                    </td>

                    <td className="py-3 text-right font-mono font-semibold text-[#14102A] dark:text-white">
                      {sub.tasksDone} / {sub.tasksTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
