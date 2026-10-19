import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

export default function ThemeToggle({ size = 18 }: { size?: number }) {
  const { mode, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={mode === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      className="inline-flex items-center justify-center rounded-full border-[3px] border-tinta bg-white text-tinta transition-all hover:bg-mente hover:text-papel active:translate-x-[2px] active:translate-y-[2px] dark:border-papel dark:bg-surface-dark-card dark:text-papel dark:hover:bg-pato dark:hover:text-tinta"
      style={{ width: size + 22, height: size + 22, boxShadow: '3px 3px 0 #17102B' }}
    >
      {mode === 'light' ? <Moon size={size} strokeWidth={2.4} /> : <Sun size={size} strokeWidth={2.4} />}
    </button>
  );
}
