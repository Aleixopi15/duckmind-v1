import DuckMascot from './DuckMascot';
import type { Mood } from './DuckMascot';

type Props = {
  title: string;
  description: string;
  mood?: Mood;
};

/** Painel de marca — a capa "Mergulhe nos estudos". */
export default function AuthBrandPanel({ title, description, mood = 'celebrating' }: Props) {
  return (
    <div className="relative hidden flex-1 overflow-hidden border-r-[3px] border-tinta bg-pato md:flex dark:border-papel/40">
      {/* Círculo e ponto da composição */}
      <div className="pointer-events-none absolute -right-24 -top-10 h-[34rem] w-[34rem] rounded-full border-[4px] border-tinta bg-mente" />
      <div className="pointer-events-none absolute bottom-10 right-14 h-16 w-16 rounded-full border-[4px] border-tinta bg-bico" />

      <div className="relative z-10 flex w-full flex-col justify-between p-10 lg:p-14">
        <div className="flex items-center gap-2">
          <span className="font-display text-[2rem] font-bold leading-none text-tinta lg:text-[2.6rem]">Duck</span>
          <span className="rounded-[14px] border-[3px] border-tinta bg-mente px-2.5 pb-1.5 pt-0.5 font-display text-[1.7rem] font-bold leading-none text-papel lg:text-[2.2rem]">
            Mind
          </span>
        </div>

        <div className="flex flex-col items-start">
          <DuckMascot size={170} mood={mood} animate className="mb-6 lg:mb-8 lg:size-[210px]" />
          <h1 className="max-w-sm font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-tinta lg:text-[2.8rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-sm text-[17px] font-semibold leading-relaxed text-tinta/75">{description}</p>
        </div>

        <p className="font-display text-lg font-bold text-tinta/60">Mergulhe nos estudos.</p>
      </div>
    </div>
  );
}
