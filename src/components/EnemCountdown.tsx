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
    <div className="relative flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-[26px] bg-gradient-to-r from-[#6F00D6] via-[#7B10E6] to-[#9B3DFF] px-6 py-5 text-white shadow-[0_10px_32px_-6px_rgba(111,0,214,0.38)] border border-white/15 lg:w-[390px]">
      <span className="font-display text-[3.8rem] font-bold leading-none tracking-tight text-white select-none">
        {bigNumber}
      </span>
      <div className="flex flex-col justify-center">
        <span className="font-display text-[17px] font-bold leading-snug tracking-tight text-white">
          {caption}
        </span>
        <span className="mt-0.5 text-[13px] font-medium text-white/80">
          {detail}
        </span>
      </div>
    </div>
  );
}
