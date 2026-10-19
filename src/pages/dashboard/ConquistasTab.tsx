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
      <div className="relative rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white p-4 sm:p-6 md:p-8 overflow-hidden shadow-lg">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-10 w-40 h-40 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Mascot & Title */}
          <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
            <div className="relative p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
              <DuckMascot
                size={70}
                level={currentLevel.level}
                mood="celebrating"
                animate
                showAccessoryBadge
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950 shadow-sm flex items-center gap-1">
                  <Sparkles size={11} /> Nível {currentLevel.level}
                </span>
                <span className="text-xs font-bold text-brand-100 truncate">
                  {currentLevel.accessory} {currentLevel.title}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                Sala de Troféus DuckMind
              </h1>
              <p className="text-xs sm:text-sm text-brand-100/90 mt-1 max-w-xl line-clamp-2">
                {currentLevel.description}
              </p>
            </div>
          </div>

          {/* XP & Stats Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:px-5 sm:py-3.5 flex md:flex-col items-center md:items-end justify-between shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-200 flex items-center gap-1">
              <Zap size={14} className="text-amber-300" /> XP Acumulado
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {totalXp.toLocaleString('pt-BR')} <span className="text-xs font-bold text-amber-300">XP</span>
            </div>
            <div className="text-[11px] text-brand-100 font-medium">
              {unlockedCount} de {totalCount} medalhas conquistadas
            </div>
          </div>
        </div>

        {/* Progress bar to next tier */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between text-xs font-bold text-brand-100 mb-1.5 flex-wrap gap-1">
            <span>Progresso para Nível {nextLevel ? nextLevel.level : 8}</span>
            {nextLevel ? (
              <span className="font-mono text-amber-300">
                {progressInLevelXp.toLocaleString('pt-BR')} / {neededForNextLevelXp.toLocaleString('pt-BR')} XP ({levelProgressPct}%)
              </span>
            ) : (
              <span className="text-amber-300 font-extrabold">Patente Máxima Alcançada! 🎓</span>
            )}
          </div>
          <div className="w-full h-2.5 sm:h-3 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 transition-all duration-500 shadow-sm"
              style={{ width: `${levelProgressPct}%` }}
            />
          </div>
          {nextLevel && (
            <p className="text-[11px] text-brand-200 mt-1.5 font-medium truncate">
              Faltam {(neededForNextLevelXp - progressInLevelXp).toLocaleString('pt-BR')} XP para se tornar <strong>{nextLevel.title}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('medalhas')}
          className={cn(
            'px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0',
            activeSubTab === 'medalhas'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          )}
        >
          <Trophy size={16} />
          <span>Medalhas ({unlockedCount}/{totalCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('patentes')}
          className={cn(
            'px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0',
            activeSubTab === 'patentes'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          )}
        >
          <Award size={16} />
          <span>Evolução do Mascote</span>
        </button>

        <button
          onClick={() => setActiveSubTab('regras')}
          className={cn(
            'px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0',
            activeSubTab === 'regras'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          )}
        >
          <Zap size={16} />
          <span>Como Ganhar XP</span>
        </button>
      </div>

      {/* Subtab 1: Medalhas */}
      {activeSubTab === 'medalhas' && (
        <div className="space-y-4">
          {/* Category & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORY_FILTERS.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border shrink-0',
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-700 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl self-start sm:self-auto shrink-0 border border-slate-200 dark:border-white/5">
              <button
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold rounded-lg transition',
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-surface-card text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('unlocked')}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold rounded-lg transition',
                  filterStatus === 'unlocked'
                    ? 'bg-white dark:bg-surface-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                Conquistadas
              </button>
              <button
                onClick={() => setFilterStatus('locked')}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold rounded-lg transition',
                  filterStatus === 'locked'
                    ? 'bg-white dark:bg-surface-card text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                A Conquistar
              </button>
            </div>
          </div>

          {/* Achievement Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAchievements.map(ach => {
              const isUnlocked = ach.unlocked;

              return (
                <div
                  key={ach.id}
                  className={cn(
                    'p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3',
                    isUnlocked
                      ? 'bg-gradient-to-br from-emerald-500/5 via-white to-amber-500/5 dark:from-emerald-500/10 dark:via-surface-card dark:to-amber-500/10 border-emerald-300/80 dark:border-emerald-500/30 shadow-sm'
                      : 'bg-white dark:bg-surface-card border-slate-200 dark:border-white/10 opacity-80 hover:opacity-100'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner border',
                        isUnlocked
                          ? 'bg-amber-100 dark:bg-amber-400/20 border-amber-300 dark:border-amber-400/40 text-amber-900 dark:text-amber-100'
                          : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 grayscale opacity-60'
                      )}
                    >
                      {ach.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <h3 className={cn('text-sm font-extrabold truncate', isUnlocked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300')}>
                          {ach.title}
                        </h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 font-mono',
                          isUnlocked
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                        )}>
                          +{ach.xpReward} XP
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                      {isUnlocked ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={13} /> Conquistada!
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Lock size={12} /> Progresso:
                        </span>
                      )}
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {ach.currentValue.toLocaleString('pt-BR')} / {ach.target.toLocaleString('pt-BR')} {ach.unit}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          isUnlocked ? 'bg-emerald-500' : 'bg-brand-500'
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
            <div className="p-10 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Nenhuma conquista encontrada para este filtro.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Patentes e Níveis */}
      {activeSubTab === 'patentes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-xs text-brand-900 dark:text-brand-200 flex items-start gap-3">
            <Info size={18} className="text-brand-600 shrink-0 mt-0.5" />
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
                    'p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden',
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-400 dark:border-amber-500/50 ring-2 ring-amber-400/30'
                      : isPast
                      ? 'bg-white dark:bg-surface-card border-slate-200 dark:border-white/10 opacity-90'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60'
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
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white"
                          style={{ backgroundColor: lvl.accentColor }}
                        >
                          Nível {lvl.level}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          {lvl.title}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 uppercase animate-pulse">
                            Sua Patente Atual
                          </span>
                        )}
                        {isNext && !isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 uppercase">
                            Próxima Patente
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                        {lvl.description}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 flex-wrap">
                        <span>Adereço: {lvl.accessory}</span>
                        <span>•</span>
                        <span>XP Necessário: {lvl.minXp.toLocaleString('pt-BR')} XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                    {isCurrent ? (
                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {progressInLevelXp.toLocaleString('pt-BR')} / {neededForNextLevelXp.toLocaleString('pt-BR')} XP
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">{levelProgressPct}% completo</div>
                      </div>
                    ) : isPast ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Conquistado
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Lock size={12} /> Bloqueado
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
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Tabela de Recompensas de XP
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-card flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Questões Resolvidas</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>+10 XP</strong> por questão feita<br />
                    <strong>+5 XP</strong> bônus por questão acertada
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-card flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Tempo de Foco</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>+2 XP</strong> por minuto líquido estudado (1h = 120 XP)
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-card flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Simulados do ENEM</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>+200 XP</strong> Área Única (45q)<br />
                    <strong>+350 XP</strong> Dia 1 ou Dia 2 (90q)<br />
                    <strong>+600 XP</strong> Simulado Completo
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-card flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
                  <PenLine size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Redações ENEM</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>+150 XP</strong> por redação concluída<br />
                    <strong>+100 XP</strong> bônus se nota &ge; 900
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-card flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Tópicos do Edital</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>+40 XP</strong> por tópico concluído no cronograma
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-card flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Flame size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Ofensiva (Streak)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>+25 XP</strong> por dia consecutivo na sua sequência
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User XP Breakdown */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              De onde veio o seu XP?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                <div className="text-[11px] text-slate-500 font-bold">Questões Feitas</div>
                <div className="text-base sm:text-lg font-black font-mono text-sky-600 dark:text-sky-400">
                  +{xpBreakdown.questionsXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                <div className="text-[11px] text-slate-500 font-bold">Horas de Estudo</div>
                <div className="text-base sm:text-lg font-black font-mono text-brand-600 dark:text-brand-400">
                  +{xpBreakdown.studyTimeXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                <div className="text-[11px] text-slate-500 font-bold">Simulados Realizados</div>
                <div className="text-base sm:text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                  +{xpBreakdown.simulationsXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                <div className="text-[11px] text-slate-500 font-bold">Redações Escritas</div>
                <div className="text-base sm:text-lg font-black font-mono text-pink-600 dark:text-pink-400">
                  +{xpBreakdown.essaysXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                <div className="text-[11px] text-slate-500 font-bold">Edital Dominado</div>
                <div className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  +{xpBreakdown.editalXp.toLocaleString('pt-BR')} XP
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                <div className="text-[11px] text-slate-500 font-bold">Ofensiva e Constância</div>
                <div className="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400">
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
