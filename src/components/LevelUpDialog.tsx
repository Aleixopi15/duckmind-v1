import { useEffect, useState } from 'react';
import type { DuckLevel } from '../lib/gamification';
import DuckMascot from './DuckMascot';
import { Sparkles, Trophy, X } from 'lucide-react';

type Props = {
  currentLevel: DuckLevel;
  onOpenAchievements?: () => void;
};

const STORAGE_KEY = 'duckmind_last_known_level';

export default function LevelUpDialog({ currentLevel, onOpenAchievements }: Props) {
  const [open, setOpen] = useState(false);
  const [celebratedLevel, setCelebratedLevel] = useState<DuckLevel | null>(null);

  useEffect(() => {
    if (!currentLevel) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const lastLevel = stored ? parseInt(stored, 10) : null;

    if (lastLevel !== null && currentLevel.level > lastLevel) {
      setCelebratedLevel(currentLevel);
      setOpen(true);
    }

    localStorage.setItem(STORAGE_KEY, currentLevel.level.toString());
  }, [currentLevel]);

  if (!open || !celebratedLevel) return null;

  const handleClose = () => setOpen(false);

  const handleView = () => {
    setOpen(false);
    if (onOpenAchievements) onOpenAchievements();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-tinta/70" onClick={handleClose} />

      <div
        className="relative w-full max-w-md animate-scale-in overflow-hidden border-[3px] border-tinta bg-papel p-6 text-center dark:border-papel dark:bg-surface-dark-card"
        style={{ borderRadius: 28, boxShadow: '8px 8px 0 #00D64B' }}
      >
        <button
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-tinta bg-white text-tinta transition-transform active:translate-x-[2px] active:translate-y-[2px] dark:border-papel dark:bg-transparent dark:text-papel"
        >
          <X size={16} strokeWidth={2.8} />
        </button>

        <div className="mb-4 mt-1 inline-flex items-center gap-1.5 rounded-[12px] border-[3px] border-tinta bg-bico px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-tinta dark:border-papel">
          <Sparkles size={14} strokeWidth={3} /> Subiu de nível!
        </div>

        <div className="my-2 flex justify-center">
          <DuckMascot size={112} level={celebratedLevel.level} mood="celebrating" animate showAccessoryBadge />
        </div>

        <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-tinta dark:text-papel">
          Nível {celebratedLevel.level}: {celebratedLevel.title}
        </h3>

        <p className="mt-2 px-2 text-sm font-semibold text-muted dark:text-papel/70">
          {celebratedLevel.description}
        </p>

        <div className="my-4 flex items-center justify-center gap-2 rounded-[16px] border-[3px] border-tinta bg-mente px-3 py-2.5 text-sm font-bold text-papel dark:border-papel">
          <span className="text-lg">{celebratedLevel.accessory}</span>
          <span>Novo adereço visual desbloqueado para o Quack!</span>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={handleClose}
            className="btn flex-1 bg-white px-4 py-2.5 text-sm dark:border-papel dark:bg-transparent dark:text-papel"
          >
            Continuar
          </button>
          <button
            onClick={handleView}
            className="btn flex-1 bg-pato px-4 py-2.5 text-sm text-tinta dark:border-papel"
          >
            <Trophy size={15} strokeWidth={2.8} /> Conquistas
          </button>
        </div>
      </div>
    </div>
  );
}
