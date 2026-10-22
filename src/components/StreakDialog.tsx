import { useMemo } from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/theme';

type Props = { open: boolean; onClose: () => void };

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function StreakDialog({ open, onClose }: Props) {
  const { profile, sessions, simulations } = useApp();
  const streak = profile?.current_streak ?? 0;
  const longest = profile?.longest_streak ?? 0;

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const studiedDates = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => {
      if (s.studied_at) set.add(s.studied_at.split('T')[0]);
    });
    simulations.forEach(sim => {
      const d = sim.simulation_date
        ? sim.simulation_date.split('T')[0]
        : (sim.created_at ? sim.created_at.split('T')[0] : null);
      if (d) set.add(d);
    });
    return set;
  }, [sessions, simulations]);

  const computedStreak = useMemo(() => {
    if (studiedDates.size === 0) return 0;
    let count = 0;
    const today = new Date();
    const todayKey = formatLocalDate(today);
    const cursor = new Date(today);
    if (!studiedDates.has(todayKey)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (studiedDates.has(formatLocalDate(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
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
      week.push({ date: new Date(cursor), iso: formatLocalDate(cursor) });
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
    return formatLocalDate(d);
  });
  const studiedLast30 = last30Dates.filter(d => studiedDates.has(d)).length;
  const today = formatLocalDate(new Date());
  const studiedToday = studiedDates.has(today);

  const stats = [
    {
      icon: <Flame size={18} strokeWidth={2.4} />,
      value: computedStreak || streak,
      label: 'Dias seguidos',
      className: 'bg-[#00D64B]/10 text-[#008E32] dark:text-[#19E85F] border border-[#00D64B]/20',
    },
    {
      icon: <Trophy size={18} strokeWidth={2.4} />,
      value: longest,
      label: 'Recorde',
      className: 'bg-amber-500/10 text-[#D68200] dark:text-[#FFB84D] border border-amber-500/20',
    },
    {
      icon: <Calendar size={18} strokeWidth={2.4} />,
      value: totalStudyDays,
      label: 'Dias estudados',
      className: 'bg-gray-100/70 text-tinta dark:bg-white/5 dark:text-texto border border-gray-200/50 dark:border-white/10',
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      footer={
        <button
          onClick={onClose}
          className="btn btn-primary px-6 py-2 text-sm"
        >
          Fechar
        </button>
      }
    >
      <div className="mb-5 flex items-center gap-3.5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-[#D68200] dark:text-[#FFB84D]">
          <Flame size={24} strokeWidth={2.6} />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold leading-tight text-tinta dark:text-texto">
            Ofensiva de estudos
          </h2>
          <p className="text-xs font-medium text-muted dark:text-gray-400">
            Mantenha a chama acesa estudando todos os dias
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div
            key={s.label}
            className={cn('rounded-2xl p-3 text-center transition-all', s.className)}
          >
            <div className="mb-1 flex justify-center opacity-85">{s.icon}</div>
            <div className="font-display text-2xl font-bold leading-none">{s.value}</div>
            <div className="mt-1 text-[11px] font-semibold opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] p-3 border border-gray-100 dark:border-white/5">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',
            studiedToday
              ? 'bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]'
              : 'bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]'
          )}
        >
          <Flame size={13} strokeWidth={2.6} />
          {studiedToday ? 'Estudou hoje!' : 'Ainda não estudou hoje'}
        </span>
        <span className="text-xs font-semibold text-muted dark:text-gray-400">
          {studiedLast30} de 30 dias ativos
        </span>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted dark:text-gray-400">
          Calendário · últimos 3 meses
        </p>
        <div className="mb-1.5 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-semibold text-muted dark:text-gray-500">
              {d}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {calendarWeeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((cell, di) => {
                if (!cell.iso) return <div key={di} className="aspect-square rounded-md" />;
                const tdayIso = new Date().toISOString().split('T')[0];
                const isFuture = cell.iso > tdayIso;
                const isStudied = studiedDates.has(cell.iso);
                const isToday = cell.iso === tdayIso;
                return (
                  <div
                    key={di}
                    title={cell.iso}
                    className={cn(
                      'aspect-square rounded-md transition-all',
                      isFuture && 'bg-transparent',
                      !isFuture && (isStudied ? 'bg-[#00D64B] dark:bg-[#19E85F] shadow-2xs' : 'bg-gray-100 dark:bg-white/5'),
                      isToday && 'ring-2 ring-[#6F00D6] dark:ring-[#9B3DFF] ring-offset-1 dark:ring-offset-[#14102A]'
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3.5 flex gap-4 text-xs font-medium text-muted dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-xs bg-[#00D64B] dark:bg-[#19E85F]" />
            <span>Estudou</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-xs bg-gray-100 dark:bg-white/5" />
            <span>Não estudou</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
