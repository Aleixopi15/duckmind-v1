import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/theme';

export default function ThemeToggle({ size = 18, className }: { size?: number; className?: string }) {
  const { mode, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={mode === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all active:scale-95',
        'border border-slate-200/80 bg-white/90 text-[#14102A] shadow-xs hover:bg-slate-100',
        'dark:border-white/10 dark:bg-[#201A3B] dark:text-[#F3F1FF] dark:hover:bg-[#2B234F]',
        className
      )}
      style={{ width: size + 18, height: size + 18 }}
    >
      {mode === 'light' ? (
        <Moon size={size} strokeWidth={2.2} className="text-[#645F78]" />
      ) : (
        <Sun size={size} strokeWidth={2.2} className="text-amber-300" />
      )}
    </button>
  );
}
