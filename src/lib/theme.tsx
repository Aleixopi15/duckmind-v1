import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ThemeMode = 'light' | 'dark';
type ThemeCtx = { mode: ThemeMode; toggle: () => void; setMode: (m: ThemeMode) => void };
const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return 'dark';
    return 'light';
  });

  const apply = (m: ThemeMode) => {
    if (m === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('duckmind-theme', m); } catch {}
  };

  useEffect(() => { apply(mode); }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggle: () => setModeState(m => m === 'light' ? 'dark' : 'light'), setMode: setModeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
