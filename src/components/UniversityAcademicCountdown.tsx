import { useApp } from '../context/AppContext';
import { GraduationCap } from 'lucide-react';

export default function UniversityAcademicCountdown() {
  const { universityGrades, universityTasks, universitySubjects } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Look for next upcoming grade exam
  const upcomingGrades = universityGrades
    .filter(g => g.date && g.date >= todayStr && g.score === null)
    .sort((a, b) => (a.date! > b.date! ? 1 : -1));

  // Look for next upcoming task
  const upcomingTasks = universityTasks
    .filter(t => t.due_date && t.due_date.split('T')[0] >= todayStr && t.status !== 'done')
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1));

  let eventTitle = '';
  let eventSubjectName = '';
  let daysDiff = 0;
  let isExam = true;

  const nextGrade = upcomingGrades[0];
  const nextTask = upcomingTasks[0];

  if (nextGrade) {
    const gradeDate = nextGrade.date!;
    const diff = Math.ceil(
      (new Date(gradeDate + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
    );
    daysDiff = diff;
    eventTitle = nextGrade.title;
    const sub = universitySubjects.find(s => s.id === nextGrade.subject_id);
    eventSubjectName = sub ? sub.name : 'Disciplina';
    isExam = true;
  } else if (nextTask) {
    const taskDate = nextTask.due_date!.split('T')[0];
    const diff = Math.ceil(
      (new Date(taskDate + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
    );
    daysDiff = diff;
    eventTitle = nextTask.title;
    const sub = universitySubjects.find(s => s.id === nextTask.subject_id);
    eventSubjectName = sub ? sub.name : 'Trabalho';
    isExam = false;
  }

  const formatDaysText = (days: number) => {
    if (days === 0) return 'Hoje';
    if (days === 1) return '1 dia';
    return `${days} dias`;
  };

  return (
    <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#6F00D6] to-[#450085] px-6 py-4 text-white shadow-[0_10px_30px_rgba(111,0,214,0.3)] transition-all hover:shadow-[0_14px_36px_rgba(111,0,214,0.4)] flex flex-col justify-center min-w-[280px]">
      {/* Decorative ambient light */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#19E85F]/20 blur-2xl" />

      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-bold tracking-wide text-white/90">
          <GraduationCap size={13} strokeWidth={2.4} />
          {isExam ? 'PRÓXIMA AVALIAÇÃO' : 'PRÓXIMO PRAZO'}
        </span>
        <span className="text-[11px] font-semibold text-white/70">
          Semestre 2026.1
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline gap-2.5">
        <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#19E85F] drop-shadow-xs">
          {eventTitle ? formatDaysText(daysDiff) : 'Sem provas'}
        </span>
        <span className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
          {eventTitle ? `para ${eventTitle}` : 'Tudo em dia!'}
        </span>
      </div>

      <p className="mt-1 text-xs text-white/80 truncate">
        {eventSubjectName ? (
          <>Matéria: <strong className="text-white">{eventSubjectName}</strong></>
        ) : (
          'Nenhum evento avaliativo pendente agendado.'
        )}
      </p>
    </div>
  );
}
