import { useState, useMemo } from 'react';
import { useGamification, DUCK_LEVELS, type AchievementCategory } from '../lib/gamification';
import DuckMascot from './DuckMascot';
import { cn } from '../lib/theme';
import {
  Trophy, Sparkles, CheckCircle2, Lock,
  Zap, Award, HelpCircle, Clock, BookOpen, PenLine, Flame,
  X, Info,
} from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

type ActiveTab = 'conquistas' | 'patentes' | 'regras';

const CATEGORY_FILTERS: { id: 'todas' | AchievementCategory; label: string; icon: string }[] = [
  { id: 'todas', label: 'Todas', icon: '🌟' },
  { id: 'questoes', label: 'Questões', icon: '🎯' },
  { id: 'tempo', label: 'Tempo & Foco', icon: '⏱️' },
  { id: 'simulados', label: 'Simulados', icon: '📘' },
  { id: 'redacao', label: 'Redação', icon: '✍️' },
  { id: 'ofensiva', label: 'Ofensiva', icon: '🔥' },
  { id: 'edital', label: 'Edital', icon: '📗' },
];

export default function AchievementsDialog({ open, onClose }: Props) {
  const gamification = useGamification();
  const [activeTab, setActiveTab] = useState<ActiveTab>('conquistas');
  const [selectedCategory, setSelectedCategory] = useState<'todas' | AchievementCategory>('todas');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlocked' | 'locked'>('all');

  const {
    totalXp,
    currentLevel,
    nextLevel,
    progressInLevelXp,
    neededForNextLevelXp,
    levelProgressPct,
    allAchievements,
    unlockedCount,
    totalCount,
    xpBreakdown,
  } = gamification;

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter(ach => {
      if (selectedCategory !== 'todas' && ach.category !== selectedCategory) {
        return false;
      }
      if (filterStatus === 'unlocked' && !ach.unlocked) return false;
      if (filterStatus === 'locked' && ach.unlocked) return false;
      return true;
    });
  }, [allAchievements, selectedCategory, filterStatus]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Container */}
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-4xl animate-scale-in flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#14102A]">
        {/* Cabeçalho */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-emerald-500/15 via-[#6F00D6]/15 to-[#00D64B]/15 border-b border-slate-200/80 p-5 dark:border-white/10 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/50 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X size={18} strokeWidth={2.4} />
          </button>

          <div className="relative z-10 flex flex-col justify-between gap-4 pr-8 sm:flex-row sm:items-center sm:pr-0">
            <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
              <div className="shrink-0 rounded-2xl border border-slate-200/80 bg-white p-1.5 dark:border-white/10 dark:bg-white/5 shadow-xs">
                <DuckMascot size={58} level={currentLevel.level} mood="celebrating" animate showAccessoryBadge />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-[#D68200] dark:text-[#FFB84D]">
                    <Sparkles size={11} strokeWidth={2.4} /> Nível {currentLevel.level}
                  </span>
                  <span className="truncate text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">
                    {currentLevel.accessory} {currentLevel.title}
                  </span>
                </div>
                <h2 className="truncate font-display text-xl font-bold leading-tight tracking-tight text-[#14102A] dark:text-white sm:text-2xl">
                  Sala de Troféus
                </h2>
                <p className="line-clamp-1 max-w-md text-xs sm:text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
                  {currentLevel.description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs px-4 py-3 dark:border-white/10 dark:bg-white/5 sm:flex-col sm:items-end">
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                <Zap size={14} strokeWidth={2.4} className="text-amber-500" /> XP acumulado
              </div>
              <div className="font-display text-2xl font-bold leading-none tracking-tight text-[#14102A] dark:text-white sm:text-3xl">
                {totalXp.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] font-semibold text-[#645F78] dark:text-[#9D96B8]">
                {unlockedCount} de {totalCount} conquistas
              </div>
            </div>
          </div>

          {/* Progresso de XP */}
          <div className="relative z-10 mt-5 border-t border-slate-200/60 pt-4 dark:border-white/10">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold text-[#14102A] dark:text-white">
              <span>Progresso para o nível {nextLevel ? nextLevel.level : 8}</span>
              {nextLevel ? (
                <span className="font-mono">
                  {progressInLevelXp.toLocaleString('pt-BR')} / {neededForNextLevelXp.toLocaleString('pt-BR')} XP ({levelProgressPct}%)
                </span>
              ) : (
                <span>Patente máxima! 🎓</span>
              )}
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00D64B] transition-all duration-300"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
            {nextLevel && (
              <p className="mt-1.5 text-[11px] font-medium text-[#645F78] dark:text-[#9D96B8]">
                Faltam {(neededForNextLevelXp - progressInLevelXp).toLocaleString('pt-BR')} XP para se tornar {nextLevel.title}
              </p>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className="no-scrollbar flex shrink-0 items-center justify-between gap-2 overflow-x-auto border-b border-slate-200/80 px-4 py-2 dark:border-white/10 sm:px-6 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex gap-2">
            {([
              { id: 'conquistas' as const, label: `Medalhas (${unlockedCount}/${totalCount})`, icon: Trophy },
              { id: 'patentes' as const, label: 'Evolução do mascote', icon: Award },
              { id: 'regras' as const, label: 'Como ganhar XP', icon: Zap },
            ]).map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all',
                    active
                      ? 'bg-[#6F00D6] text-white shadow-xs'
                      : 'border border-slate-200/80 bg-white text-[#645F78] hover:text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:text-white',
                  )}
                >
                  <Icon size={14} strokeWidth={2.4} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Conquistas / Medalhas */}
        {activeTab === 'conquistas' && (
          <div className="overflow-y-auto p-4 sm:p-6 flex-1 flex flex-col gap-4">
            {/* Categorias & Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
                {CATEGORY_FILTERS.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition-all border',
                      selectedCategory === cat.id
                        ? 'border-[#00D64B] bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]'
                        : 'border-slate-200/80 bg-white text-[#645F78] hover:text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8]',
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex shrink-0 items-center gap-1">
                {([
                  { id: 'all' as const, label: 'Todas' },
                  { id: 'unlocked' as const, label: 'Conquistadas' },
                  { id: 'locked' as const, label: 'A conquistar' },
                ]).map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold transition-all border',
                      filterStatus === f.id
                        ? 'border-[#6F00D6] bg-[#6F00D6]/15 text-[#6F00D6] dark:border-[#B26BFF]/40 dark:text-[#B26BFF]'
                        : 'border-slate-200/80 bg-white text-[#645F78] hover:text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8]',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAchievements.map(ach => {
                const isUnlocked = ach.unlocked;

                return (
                  <div
                    key={ach.id}
                    className={cn(
                      'relative flex flex-col justify-between gap-3 rounded-2xl border p-4 transition-all',
                      isUnlocked
                        ? 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                        : 'border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[0.02]',
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl border',
                          isUnlocked
                            ? 'border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
                            : 'border-slate-200 bg-slate-100 opacity-60 grayscale dark:border-white/10 dark:bg-white/5',
                        )}
                      >
                        {ach.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <h4 className={cn('truncate font-display text-base font-bold', isUnlocked ? 'text-[#14102A] dark:text-white' : 'text-[#645F78] dark:text-[#9D96B8]')}>
                            {ach.title}
                          </h4>
                          <span className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold border',
                            isUnlocked
                              ? 'border-[#00D64B]/40 bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]'
                              : 'border-slate-200/80 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                          )}>
                            +{ach.xpReward} XP
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
                          {ach.description}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5 dark:border-white/5">
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold">
                        {isUnlocked ? (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-[#00D64B]">
                            <CheckCircle2 size={13} strokeWidth={2.4} /> Conquistada!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#645F78] dark:text-[#9D96B8]">
                            <Lock size={12} strokeWidth={2.4} /> Progresso
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-[#14102A] dark:text-white">
                          {ach.currentValue.toLocaleString('pt-BR')} / {ach.target.toLocaleString('pt-BR')} {ach.unit}
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${ach.progressPct}%`,
                            background: isUnlocked ? '#00D64B' : '#6F00D6',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-white/10">
                <p className="text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
                  Nenhuma conquista encontrada para este filtro.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Patentes e Níveis do DuckMind */}
        {activeTab === 'patentes' && (
          <div className="overflow-y-auto p-4 sm:p-6 flex-1 flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-2xl border border-purple-200/80 bg-purple-50/60 p-4 text-xs sm:text-sm font-medium text-[#14102A] dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200">
              <Info size={18} strokeWidth={2.4} className="mt-0.5 shrink-0 text-[#6F00D6] dark:text-[#B26BFF]" />
              <div>
                <strong className="font-bold">Como funciona a evolução:</strong> conforme você estuda, responde questões e faz simulados, seu XP acumula continuamente. Ao atingir o limiar de cada patente, o Quack sobe de nível, ganha novos adereços e consagra sua dedicação rumo à universidade!
              </div>
            </div>

            <div className="space-y-3">
              {DUCK_LEVELS.map(lvl => {
                const isCurrent = lvl.level === currentLevel.level;
                const isPast = totalXp >= lvl.minXp;
                const isNext = nextLevel?.level === lvl.level;

                return (
                  <div
                    key={lvl.level}
                    className={cn(
                      'relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border p-4 transition-all sm:flex-row sm:items-center',
                      isCurrent
                        ? 'border-amber-300 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10 shadow-xs'
                        : isPast
                          ? 'border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[0.02]'
                          : 'border-dashed border-slate-200 bg-transparent opacity-60 dark:border-white/10',
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <DuckMascot
                          size={54}
                          level={lvl.level}
                          showAccessoryBadge
                        />
                      </div>

                      <div>
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold border', lvl.badgeBg, lvl.badgeText)}>
                            Nível {lvl.level}
                          </span>
                          <h4 className="font-display text-base font-bold text-[#14102A] dark:text-white">
                            {lvl.title}
                          </h4>
                          {isCurrent && (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D68200] dark:text-[#FFB84D]">
                              Sua patente atual
                            </span>
                          )}
                          {isNext && !isCurrent && (
                            <span className="rounded-full bg-[#00D64B]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#008E32] dark:text-[#19E85F]">
                              Próxima patente
                            </span>
                          )}
                        </div>

                        <p className="max-w-lg text-xs sm:text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
                          {lvl.description}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">
                          <span>Adereço: {lvl.accessory}</span>
                          <span className="opacity-40">•</span>
                          <span>XP necessário: {lvl.minXp.toLocaleString('pt-BR')} XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                      {isCurrent ? (
                        <div className="text-right">
                          <div className="font-mono text-xs sm:text-sm font-bold text-[#14102A] dark:text-white">
                            {progressInLevelXp.toLocaleString('pt-BR')} / {neededForNextLevelXp.toLocaleString('pt-BR')} XP
                          </div>
                          <div className="text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">{levelProgressPct}% completo</div>
                        </div>
                      ) : isPast ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#00D64B]/15 px-3 py-1 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                          <CheckCircle2 size={14} strokeWidth={2.4} /> Conquistado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-bold text-[#645F78] dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8]">
                          <Lock size={12} strokeWidth={2.4} /> Bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Como Ganhar XP & Suas Estatísticas */}
        {activeTab === 'regras' && (
          <div className="overflow-y-auto p-4 sm:p-6 flex-1 flex flex-col gap-5">
            {/* XP Sources Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8] mb-3">
                Tabela de Recompensas de XP
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#14102A] dark:text-white">Questões Resolvidas</div>
                    <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8]">
                      <strong>+10 XP</strong> por questão feita<br />
                      <strong>+5 XP</strong> bônus por acerto
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#14102A] dark:text-white">Tempo de Foco</div>
                    <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8]">
                      <strong>+2 XP</strong> por minuto líquido estudado (1h = 120 XP)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#14102A] dark:text-white">Simulados do ENEM</div>
                    <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8]">
                      <strong>+200 XP</strong> Área Única (45q)<br />
                      <strong>+350 XP</strong> Dia 1 ou Dia 2 (90q)<br />
                      <strong>+600 XP</strong> Simulado Completo
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
                    <PenLine size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#14102A] dark:text-white">Redações ENEM</div>
                    <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8]">
                      <strong>+150 XP</strong> por redação concluída<br />
                      <strong>+100 XP</strong> bônus se nota &ge; 900
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#14102A] dark:text-white">Tópicos do Edital</div>
                    <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8]">
                      <strong>+40 XP</strong> por tópico concluído no cronograma
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Flame size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#14102A] dark:text-white">Ofensiva (Streak)</div>
                    <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8]">
                      <strong>+25 XP</strong> por dia consecutivo na sua sequência
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User XP Breakdown */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8] mb-3">
                De onde veio o seu XP?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8] font-bold">Questões Feitas</div>
                  <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400">
                    +{xpBreakdown.questionsXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8] font-bold">Horas de Estudo</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-[#00D64B]">
                    +{xpBreakdown.studyTimeXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8] font-bold">Simulados Realizados</div>
                  <div className="text-lg font-bold font-mono text-purple-600 dark:text-[#B26BFF]">
                    +{xpBreakdown.simulationsXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8] font-bold">Redações Escritas</div>
                  <div className="text-lg font-bold font-mono text-pink-600 dark:text-pink-400">
                    +{xpBreakdown.essaysXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8] font-bold">Edital Dominado</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{xpBreakdown.editalXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-[#645F78] dark:text-[#9D96B8] font-bold">Ofensiva e Constância</div>
                  <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                    +{xpBreakdown.streakXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#645F78] dark:text-[#9D96B8] font-medium hidden sm:block">
            Seu progresso é salvo e sincronizado automaticamente.
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-[#00D64B] px-6 py-2.5 text-xs font-bold text-[#14102A] shadow-xs hover:bg-[#19E85F] transition-all ml-auto"
          >
            Continuar Estudando
          </button>
        </div>
      </div>
    </div>
  );
}
