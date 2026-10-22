import { useState, useMemo } from 'react';
import { useGamification, DUCK_LEVELS, type AchievementCategory } from '../../lib/gamification';
import DuckMascot from '../../components/DuckMascot';
import { cn } from '../../lib/theme';
import {
  Trophy, Sparkles, CheckCircle2, Lock,
  Zap, Award, HelpCircle, Clock, BookOpen, PenLine, Flame,
  Info,
} from 'lucide-react';

type Props = {
  onNavigate?: (tab: string) => void;
};

type ActiveSubTab = 'medalhas' | 'patentes' | 'regras';

const CATEGORY_FILTERS: { id: 'todas' | AchievementCategory; label: string; icon: string }[] = [
  { id: 'todas', label: 'Todas', icon: '🌟' },
  { id: 'questoes', label: 'Questões', icon: '🎯' },
  { id: 'tempo', label: 'Tempo & Foco', icon: '⏱️' },
  { id: 'simulados', label: 'Simulados', icon: '📘' },
  { id: 'redacao', label: 'Redação', icon: '✍️' },
  { id: 'ofensiva', label: 'Ofensiva', icon: '🔥' },
  { id: 'edital', label: 'Edital', icon: '📗' },
];

export default function ConquistasTab({ onNavigate: _onNavigate }: Props) {
  const gamification = useGamification();
  const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>('medalhas');
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

  return (
    <div className="animate-fade-in w-full max-w-full min-w-0 space-y-5">
      {/* Hero Level Banner */}
      <div className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-gradient-to-br from-[#151826] via-[#1a1c2b] to-[#14102A] p-5 text-white shadow-md sm:p-6 md:p-7 dark:border-white/10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#00D64B]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-1/4 h-40 w-40 rounded-full bg-[#6F00D6]/20 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          {/* Mascot & Title */}
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0 rounded-2xl bg-white/10 p-2.5 shadow-inner backdrop-blur-md border border-white/10">
              <DuckMascot
                size={70}
                level={currentLevel.level}
                mood="celebrating"
                animate
                showAccessoryBadge
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-[#00D64B] px-3 py-0.5 text-xs font-bold text-[#14102A] shadow-xs">
                  <Sparkles size={11} strokeWidth={2.6} /> Nível {currentLevel.level}
                </span>
                <span className="text-xs font-bold text-slate-300 truncate">
                  {currentLevel.accessory} {currentLevel.title}
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                Sala de Troféus DuckMind
              </h1>
              <p className="mt-1 max-w-xl text-xs font-medium text-slate-300/80 line-clamp-2">
                {currentLevel.description}
              </p>
            </div>
          </div>

          {/* XP & Stats Box */}
          <div className="flex shrink-0 items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md md:flex-col md:items-end">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <Zap size={14} className="text-[#00D64B]" /> XP Acumulado
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {totalXp.toLocaleString('pt-BR')} <span className="text-xs font-bold text-[#00D64B]">XP</span>
            </div>
            <div className="text-[11px] font-medium text-slate-300">
              {unlockedCount} de {totalCount} medalhas conquistadas
            </div>
          </div>
        </div>

        {/* Progress bar to next tier */}
        <div className="relative z-10 mt-5 border-t border-white/10 pt-4">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-slate-300">
            <span>Progresso para Nível {nextLevel ? nextLevel.level : 8}</span>
            {nextLevel ? (
              <span className="font-display text-[#00D64B]">
                {progressInLevelXp.toLocaleString('pt-BR')} / {neededForNextLevelXp.toLocaleString('pt-BR')} XP ({levelProgressPct}%)
              </span>
            ) : (
              <span className="font-bold text-[#00D64B]">Patente Máxima Alcançada! 🎓</span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00D64B] to-[#19E85F] transition-all duration-500 shadow-sm"
              style={{ width: `${levelProgressPct}%` }}
            />
          </div>
          {nextLevel && (
            <p className="mt-1.5 text-[11px] font-medium text-slate-400 truncate">
              Faltam {(neededForNextLevelXp - progressInLevelXp).toLocaleString('pt-BR')} XP para se tornar <strong>{nextLevel.title}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveSubTab('medalhas')}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
            activeSubTab === 'medalhas'
              ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
              : 'border border-slate-200/80 bg-white text-[#645F78] hover:bg-slate-50 dark:border-white/5 dark:bg-[#151826] dark:text-[#9D96B8] dark:hover:bg-white/5'
          )}
        >
          <Trophy size={14} strokeWidth={2.4} />
          <span>Medalhas ({unlockedCount}/{totalCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('patentes')}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
            activeSubTab === 'patentes'
              ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
              : 'border border-slate-200/80 bg-white text-[#645F78] hover:bg-slate-50 dark:border-white/5 dark:bg-[#151826] dark:text-[#9D96B8] dark:hover:bg-white/5'
          )}
        >
          <Award size={14} strokeWidth={2.4} />
          <span>Evolução do Mascote</span>
        </button>

        <button
          onClick={() => setActiveSubTab('regras')}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
            activeSubTab === 'regras'
              ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
              : 'border border-slate-200/80 bg-white text-[#645F78] hover:bg-slate-50 dark:border-white/5 dark:bg-[#151826] dark:text-[#9D96B8] dark:hover:bg-white/5'
          )}
        >
          <Zap size={14} strokeWidth={2.4} />
          <span>Como Ganhar XP</span>
        </button>
      </div>

      {/* Subtab 1: Medalhas */}
      {activeSubTab === 'medalhas' && (
        <div className="space-y-4">
          {/* Category & Status Filters */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {CATEGORY_FILTERS.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all',
                      isSelected
                        ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                        : 'border border-slate-200/80 bg-white text-[#645F78] hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:bg-white/10'
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200/80 bg-white p-1 self-start sm:self-auto dark:border-white/10 dark:bg-white/5">
              <button
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold transition-all',
                  filterStatus === 'all'
                    ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                    : 'text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white'
                )}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('unlocked')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold transition-all',
                  filterStatus === 'unlocked'
                    ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                    : 'text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white'
                )}
              >
                Conquistadas
              </button>
              <button
                onClick={() => setFilterStatus('locked')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold transition-all',
                  filterStatus === 'locked'
                    ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                    : 'text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white'
                )}
              >
                A Conquistar
              </button>
            </div>
          </div>

          {/* Achievement Cards Grid */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map(ach => {
              const isUnlocked = ach.unlocked;

              return (
                <div
                  key={ach.id}
                  className={cn(
                    'flex flex-col justify-between gap-3.5 rounded-[22px] border p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    isUnlocked
                      ? 'border-emerald-500/20 bg-white dark:border-emerald-500/15 dark:bg-[#151826]'
                      : 'border-slate-200/70 bg-white/70 dark:border-white/5 dark:bg-[#151826]/60 opacity-80 hover:opacity-100'
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-inner',
                        isUnlocked
                          ? 'bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]'
                          : 'bg-slate-100 text-slate-400 grayscale dark:bg-white/5 dark:text-white/30'
                      )}
                    >
                      {ach.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-1.5">
                        <h3 className="truncate font-display text-sm font-bold text-[#14102A] dark:text-white">
                          {ach.title}
                        </h3>
                        <span className={cn(
                          'rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold shrink-0',
                          isUnlocked
                            ? 'bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]'
                            : 'bg-slate-100 text-[#645F78] dark:bg-white/5 dark:text-white/40'
                        )}>
                          +{ach.xpReward} XP
                        </span>
                      </div>

                      <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8] line-clamp-2">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 dark:border-white/5">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 font-bold text-[#008E32] dark:text-[#19E85F]">
                          <CheckCircle2 size={13} strokeWidth={2.4} /> Conquistada!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#645F78] dark:text-[#9D96B8]">
                          <Lock size={12} strokeWidth={2.4} /> Progresso:
                        </span>
                      )}
                      <span className="font-display text-[11px] font-bold text-[#14102A] dark:text-white">
                        {ach.currentValue.toLocaleString('pt-BR')} / {ach.target.toLocaleString('pt-BR')} {ach.unit}
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          isUnlocked ? 'bg-[#00D64B]' : 'bg-[#6F00D6]'
                        )}
                        style={{ width: `${ach.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-10 text-center shadow-xs dark:border-white/5 dark:bg-[#151826]">
              <p className="text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">
                Nenhuma conquista encontrada para este filtro.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Patentes e Níveis */}
      {activeSubTab === 'patentes' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-[#6F00D6]/20 bg-[#6F00D6]/5 p-4 text-xs font-medium text-[#14102A] dark:border-[#6F00D6]/30 dark:bg-[#6F00D6]/10 dark:text-white">
            <Info size={18} strokeWidth={2.4} className="text-[#6F00D6] dark:text-[#B379FF] shrink-0 mt-0.5" />
            <div>
              <strong>Jornada de Evolução do DuckMind:</strong> Conforme você avança nos estudos, seu mascote evolui por 8 patentes, desbloqueando novos adereços visuais exclusivos até o patamar supremo de aprovação no ENEM!
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
                    'relative flex flex-col justify-between gap-4 overflow-hidden rounded-[22px] border p-4.5 sm:flex-row sm:items-center transition-all',
                    isCurrent
                      ? 'border-[#00D64B] bg-[#00D64B]/5 ring-2 ring-[#00D64B]/30 dark:bg-[#00D64B]/10'
                      : isPast
                      ? 'border-slate-200/80 bg-white dark:border-white/5 dark:bg-[#151826]'
                      : 'border-slate-200/60 bg-slate-50/70 dark:border-white/5 dark:bg-white/[0.02] opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <DuckMascot
                        size={52}
                        level={lvl.level}
                        showAccessoryBadge
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs"
                          style={{ backgroundColor: lvl.accentColor }}
                        >
                          Nível {lvl.level}
                        </span>
                        <h3 className="font-display text-sm font-bold text-[#14102A] dark:text-white">
                          {lvl.title}
                        </h3>
                        {isCurrent && (
                          <span className="rounded-full bg-[#00D64B] px-2.5 py-0.5 text-[10px] font-bold text-[#14102A] uppercase shadow-xs">
                            Sua Patente Atual
                          </span>
                        )}
                        {isNext && !isCurrent && (
                          <span className="rounded-full bg-[#6F00D6]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#6F00D6] dark:text-[#B379FF] uppercase">
                            Próxima Patente
                          </span>
                        )}
                      </div>

                      <p className="max-w-lg text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                        {lvl.description}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#645F78] dark:text-white/60">
                        <span>Adereço: {lvl.accessory}</span>
                        <span>•</span>
                        <span>XP Necessário: {lvl.minXp.toLocaleString('pt-BR')} XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    {isCurrent ? (
                      <div className="text-right">
                        <div className="font-display text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                          {progressInLevelXp.toLocaleString('pt-BR')} / {neededForNextLevelXp.toLocaleString('pt-BR')} XP
                        </div>
                        <div className="text-[10px] font-semibold text-[#645F78] dark:text-[#9D96B8]">{levelProgressPct}% completo</div>
                      </div>
                    ) : isPast ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                        <CheckCircle2 size={13} strokeWidth={2.4} /> Conquistado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#645F78] dark:bg-white/5 dark:text-white/40">
                        <Lock size={11} strokeWidth={2.4} /> Bloqueado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 3: Como Ganhar XP */}
      {activeSubTab === 'regras' && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Tabela de Recompensas de XP
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                  <HelpCircle size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-[#14102A] dark:text-white">Questões Resolvidas</div>
                  <div className="mt-0.5 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                    <strong>+10 XP</strong> por questão feita<br />
                    <strong>+5 XP</strong> bônus por acerto
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#B379FF]">
                  <Clock size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-[#14102A] dark:text-white">Tempo de Foco</div>
                  <div className="mt-0.5 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                    <strong>+2 XP</strong> por minuto líquido estudado (1h = 120 XP)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <BookOpen size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-[#14102A] dark:text-white">Simulados do ENEM</div>
                  <div className="mt-0.5 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                    <strong>+200 XP</strong> Área Única (45q)<br />
                    <strong>+350 XP</strong> Dia 1 ou 2 (90q)<br />
                    <strong>+600 XP</strong> Simulado Completo
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400">
                  <PenLine size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-[#14102A] dark:text-white">Redações ENEM</div>
                  <div className="mt-0.5 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                    <strong>+150 XP</strong> por redação concluída<br />
                    <strong>+100 XP</strong> bônus se nota &ge; 900
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]">
                  <CheckCircle2 size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-[#14102A] dark:text-white">Tópicos do Edital</div>
                  <div className="mt-0.5 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                    <strong>+40 XP</strong> por tópico concluído no cronograma
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]">
                  <Flame size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-[#14102A] dark:text-white">Ofensiva (Streak)</div>
                  <div className="mt-0.5 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                    <strong>+25 XP</strong> por dia consecutivo estudado
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User XP Breakdown */}
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#151826]">
            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              De onde veio o seu XP?
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">Questões Feitas</div>
                <div className="mt-1 font-display text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400">
                  +{xpBreakdown.questionsXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">Horas de Estudo</div>
                <div className="mt-1 font-display text-base sm:text-lg font-bold text-[#6F00D6] dark:text-[#B379FF]">
                  +{xpBreakdown.studyTimeXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">Simulados Realizados</div>
                <div className="mt-1 font-display text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
                  +{xpBreakdown.simulationsXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">Redações Escritas</div>
                <div className="mt-1 font-display text-base sm:text-lg font-bold text-pink-600 dark:text-pink-400">
                  +{xpBreakdown.essaysXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">Edital Dominado</div>
                <div className="mt-1 font-display text-base sm:text-lg font-bold text-[#008E32] dark:text-[#19E85F]">
                  +{xpBreakdown.editalXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="text-[11px] font-bold text-[#645F78] dark:text-[#9D96B8]">Ofensiva e Constância</div>
                <div className="mt-1 font-display text-base sm:text-lg font-bold text-[#D68200] dark:text-[#FFB84D]">
                  +{xpBreakdown.streakXp.toLocaleString('pt-BR')} XP
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
