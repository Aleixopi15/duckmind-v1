import { cn } from '../lib/theme';
import DuckMascot from './DuckMascot';

type LogoProps = {
  /** `sm` cabeçalho mobile · `md` sidebar e navbar · `lg` aberturas */
  size?: 'sm' | 'md' | 'lg';
  /** Sobre fundo Tinta a palavra "Duck" fica em Papel */
  inverted?: boolean;
  showMascot?: boolean;
  className?: string;
};

const SCALE = {
  sm: { mark: 26, word: 'text-[1.4rem]', chip: 'text-[1.25rem] px-2 pb-1 pt-0.5', gap: 'gap-1' },
  md: { mark: 34, word: 'text-[1.6rem]', chip: 'text-[1.4rem] px-2 pb-1 pt-0.5', gap: 'gap-1.5' },
  lg: { mark: 64, word: 'text-[3.2rem] sm:text-[4rem]', chip: 'text-[3rem] sm:text-[3.7rem] px-4 pb-2.5 pt-1', gap: 'gap-3' },
};

export default function Logo({ size = 'md', inverted = false, showMascot = true, className }: LogoProps) {
  const s = SCALE[size];

  return (
    <div className={cn('flex items-center', s.gap, className)}>
      {showMascot && <DuckMascot size={s.mark} mood="happy" />}
      <span
        className={cn('font-display font-bold leading-none tracking-tight', s.word, inverted ? 'text-papel' : 'text-tinta')}
      >
        Duck
      </span>
      <span
        className={cn(
          'font-display font-bold leading-none',
          s.chip,
          inverted ? 'border-[3px] border-papel bg-pato text-tinta' : 'border-[3px] border-tinta bg-mente text-papel',
        )}
        style={{ borderRadius: size === 'lg' ? 20 : 12, boxShadow: size === 'lg' ? '5px 5px 0 #17102B' : 'none' }}
      >
        Mind
      </span>
    </div>
  );
}
