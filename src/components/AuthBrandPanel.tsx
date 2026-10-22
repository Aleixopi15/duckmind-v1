import DuckMascot from './DuckMascot';
import type { Mood } from './DuckMascot';
import { Flame, TrendingUp } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  mood?: Mood;
};

/** Painel de marca moderno DuckMind 2.0 — gradiente sofisticado e floating chips */
export default function AuthBrandPanel({ title, description, mood = 'celebrating' }: Props) {
  return (
    <div className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-[#120F24] via-[#171330] to-[#0D0A1A] text-white md:flex">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#6F00D6]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#00D64B]/15 blur-3xl" />

      <div className="relative z-10 flex w-full flex-col justify-between p-10 lg:p-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Duck<span className="text-[#00D64B]">Mind</span>
          </span>
          <span className="rounded-full bg-[#00D64B]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#00D64B] border border-[#00D64B]/30">
            ENEM 2026
          </span>
        </div>

        {/* Central visual & mascot */}
        <div className="my-auto flex flex-col items-start py-8">
          <div className="relative mb-8 flex items-center justify-center">
            {/* Soft halo */}
            <div className="absolute h-48 w-48 rounded-full bg-gradient-to-tr from-[#6F00D6]/40 to-[#00D64B]/30 blur-xl" />

            <DuckMascot size={180} mood={mood} animate className="relative z-10 lg:size-[210px]" />

            {/* Floating metric chip top right */}
            <div className="absolute -right-6 -top-2 flex items-center gap-2 rounded-full border border-white/10 bg-[#1F1A3A]/90 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
              <Flame size={15} className="text-[#00D64B]" />
              <span className="font-display text-xs font-bold text-white">15 dias seguidos</span>
            </div>

            {/* Floating metric chip bottom left */}
            <div className="absolute -bottom-2 -left-6 flex items-center gap-2 rounded-full border border-white/10 bg-[#1F1A3A]/90 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
              <TrendingUp size={15} className="text-[#00D64B]" />
              <span className="font-display text-xs font-bold text-white">+28% no simulado</span>
            </div>
          </div>

          <h1 className="max-w-md font-display text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-3 max-w-sm text-base font-medium leading-relaxed text-[#9D96B8]">
            {description}
          </p>
        </div>

        {/* Footer quote */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#9D96B8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D64B]" />
          <span>Mergulhe nos estudos com constância e estratégia.</span>
        </div>
      </div>
    </div>
  );
}

