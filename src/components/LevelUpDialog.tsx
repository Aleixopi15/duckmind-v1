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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={handleClose} />

      <div className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-7 text-center shadow-2xl dark:border-white/10 dark:bg-[#151226]">
        <button
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className="mb-4 mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-[#D68200] dark:text-[#FFB84D]">
          <Sparkles size={14} strokeWidth={2.4} /> Subiu de nível!
        </div>

        <div className="my-2 flex justify-center">
          <DuckMascot size={112} level={celebratedLevel.level} mood="celebrating" animate showAccessoryBadge />
        </div>

        <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-[#14102A] dark:text-white">
          Nível {celebratedLevel.level}: {celebratedLevel.title}
        </h3>

        <p className="mt-2 px-2 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
          {celebratedLevel.description}
        </p>

        <div className="my-4 flex items-center justify-center gap-2 rounded-2xl bg-[#6F00D6]/15 border border-[#6F00D6]/30 px-3.5 py-2.5 text-xs font-bold text-[#6F00D6] dark:text-[#B26BFF]">
          <span className="text-lg">{celebratedLevel.accessory}</span>
          <span>Novo adereço visual desbloqueado para o Quack!</span>
        </div>

        <div className="mt-6 flex items-center gap-2.5">
          <button
            onClick={handleClose}
            className="flex-1 rounded-full border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-[#645F78] hover:bg-slate-50 hover:text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:text-white transition-colors"
          >
            Continuar
          </button>
          <button
            onClick={handleView}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#00D64B] px-4 py-2.5 text-xs font-bold text-[#14102A] shadow-xs hover:bg-[#19E85F] hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Trophy size={15} strokeWidth={2.4} /> Conquistas
          </button>
        </div>
      </div>
    </div>
  );
}
