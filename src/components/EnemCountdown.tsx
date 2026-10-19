import { useEffect, useState } from 'react';

const ENEM_DAY_1 = new Date('2026-11-08T00:00:00');
const ENEM_DAY_2 = new Date('2026-11-15T00:00:00');

function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / 86400000);
}

export default function EnemCountdown() {
  const [days1, setDays1] = useState(daysUntil(ENEM_DAY_1));
  const [days2, setDays2] = useState(daysUntil(ENEM_DAY_2));

  useEffect(() => {
    const update = () => {
      setDays1(daysUntil(ENEM_DAY_1));
      setDays2(daysUntil(ENEM_DAY_2));
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const isPastDay2 = days2 < 0;
  const isBetweenDays = days1 <= 0 && days2 > 0;

  const bigNumber = isPastDay2 ? '✓' : isBetweenDays ? String(days2) : String(Math.max(0, days1));
  const caption = isPastDay2
    ? 'Provas concluídas! Bons estudos.'
    : isBetweenDays
      ? 'dias para o 2º dia do ENEM'
      : 'dias para o 1º dia do ENEM';
  const detail = isPastDay2 ? '08/11 e 15/11 de 2026' : isBetweenDays ? '15/11/2026' : '08/11/2026 · 2º dia em 15/11';

  return (
    <div className="flex w-full shrink-0 items-center gap-4 rounded-[22px] border-[3px] border-tinta bg-mente px-5 py-4 text-papel shadow-brutal dark:border-papel/70 lg:w-[380px]">
      <span className="font-display text-[3.6rem] font-bold leading-none">{bigNumber}</span>
      <span className="text-base font-semibold leading-snug">
        <b className="font-display text-[17px] font-bold">{caption}</b>
        <br />
        <span className="text-papel/80">{detail}</span>
      </span>
    </div>
  );
}
