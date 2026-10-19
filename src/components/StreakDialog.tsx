import { useMemo } from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/theme';

type Props = { open: boolean; onClose: () => void };

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function StreakDialog({ open, onClose }: Props) {
  const { profile, sessions } = useApp();
  const streak = profile?.current_streak ?? 0;
  const longest = profile?.longest_streak ?? 0;

  const studiedDates = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => set.add(s.studied_at.split('T')[0]));
    return set;
  }, [sessions]);

  const computedStreak = useMemo(() => {
    if (studiedDates.size === 0) return 0;
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 366; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (studiedDates.has(key)) count++;
      else if (i > 0) break;
    }
    return count;
  }, [studiedDates]);

  const calendarWeeks = useMemo(() => {
    const today = new Date();
    const weeks: { date: Date; iso: string }[][] = [];
    const start = new Date(today);
    start.setMonth(today.getMonth() - 2);
    start.setDate(1);
    while (start.getDay() !== 0) start.setDate(start.getDate() - 1);
    let week: { date: Date; iso: string }[] = [];
    const cursor = new Date(start);
    while (cursor <= today || week.length > 0) {
      if (cursor > today && week.length === 0) break;
      week.push({ date: new Date(cursor), iso: cursor.toISOString().split('T')[0] });
      if (week.length === 7) { weeks.push(week); week = []; }
      cursor.setDate(cursor.getDate() + 1);
      if (cursor > today) {
        if (week.length > 0) {
          while (week.length < 7) { week.push({ date: new Date(cursor), iso: '' }); cursor.setDate(cursor.getDate() + 1); }
          weeks.push(week); week = [];
        }
        break;
      }
    }
    return weeks;
  }, []);

  const totalStudyDays = studiedDates.size;
  const last30Dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
  const studiedLast30 = last30Dates.filter(d => studiedDates.has(d)).length;
  const today = new Date().toISOString().split('T')[0];
  const studiedToday = studiedDates.has(today);

  const stats = [
    { icon: <Flame size={18} strokeWidth={2.8} />, value: computedStreak || streak, label: 'Dias seguidos', accent: true },
    { icon: <Trophy size={18} strokeWidth={2.8} />, value: longest, label: 'Recorde', accent: 'bico' as const },
    { icon: <Calendar size={18} strokeWidth={2.8} />, value: totalStudyDays, label: 'Dias estudados', accent: false },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      footer={<button onClick={onClose} className="btn bg-pato px-5 py-2 text-sm text-tinta dark:border-papel">Fechar</button>}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border-[3px] border-tinta bg-bico text-tinta dark:border-papel">
          <Flame size={22} strokeWidth={2.8} />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold leading-tight text-tinta dark:text-papel">Ofensiva de estudos</h2>
          <p className="text-sm font-semibold text-muted dark:text-papel/60">Seu progresso diário</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2.5">
        {stats.map(s => (
          <div
            key={s.label}
            className={cn(
              'rounded-[18px] border-[3px] border-tinta p-3 text-center dark:border-papel',
              s.accent === true && 'bg-pato text-tinta',
              s.accent === 'bico' && 'bg-bico text-tinta',
              s.accent === false && 'bg-white text-tinta dark:bg-transparent dark:text-papel',
            )}
          >
            <div className="mb-1 flex justify-center">{s.icon}</div>
            <div className="font-display text-2xl font-bold leading-none">{s.value}</div>
            <div className="mt-1 text-[11px] font-bold">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className={cn('chip', studiedToday ? 'bg-pato text-tinta' : 'bg-bico text-tinta')}>
          <Flame size={12} strokeWidth={3} /> {studiedToday ? 'Estudou hoje!' : 'Ainda não estudou hoje'}
        </span>
        <span className="text-sm font-semibold text-muted dark:text-papel/60">{studiedLast30} de 30 dias</span>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.09em] text-muted dark:text-papel/50">
          Calendário · últimos 3 meses
        </p>
        <div className="mb-1 grid grid-cols-7 gap-[3px]">
          {WEEKDAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-bold text-muted dark:text-papel/40">{d}</div>
          ))}
        </div>
        <div className="flex flex-col gap-[3px]">
          {calendarWeeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-[3px]">
              {week.map((cell, di) => {
                if (!cell.iso) return <div key={di} className="aspect-square rounded-[5px]" />;
                const tdayIso = new Date().toISOString().split('T')[0];
                const isFuture = cell.iso > tdayIso;
                const isStudied = studiedDates.has(cell.iso);
                const isToday = cell.iso === tdayIso;
                return (
                  <div
                    key={di}
                    title={cell.iso}
                    className={cn(
                      'aspect-square rounded-[5px] border-2 border-tinta transition dark:border-papel/50',
                      isFuture && 'border-transparent bg-transparent dark:border-transparent',
                      !isFuture && (isStudied ? 'bg-pato' : 'bg-[#E8E0CC] dark:bg-surface-dark-subtle'),
                      isToday && 'ring-[3px] ring-mente ring-offset-1 dark:ring-pato',
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-[4px] border-2 border-tinta bg-pato dark:border-papel/50" />
            <span className="text-xs font-bold text-muted dark:text-papel/60">Estudou</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-[4px] border-2 border-tinta bg-[#E8E0CC] dark:border-papel/50 dark:bg-surface-dark-subtle" />
            <span className="text-xs font-bold text-muted dark:text-papel/60">Não estudou</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
