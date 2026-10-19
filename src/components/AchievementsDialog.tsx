import { useState, useMemo } from 'react';
import { useGamification, DUCK_LEVELS, type AchievementCategory } from '../lib/gamification';
import DuckMascot from './DuckMascot';
import { cn } from '../lib/theme';
import {
  Trophy, Sparkles, CheckCircle2, Lock,
  Zap, Award, HelpCircle, Clock, BookOpen, PenLine, Flame,
  X, Info, ShieldCheck,
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
      <div className="fixed inset-0 bg-tinta/70" onClick={onClose} />

      {/* Container */}
      <div
        className="relative my-auto flex max-h-[92vh] w-full max-w-4xl animate-scale-in flex-col overflow-hidden border-[3px] border-tinta bg-papel dark:border-papel dark:bg-surface-dark-card"
        style={{ borderRadius: 28, boxShadow: '8px 8px 0 #00D64B' }}
      >
        {/* Cabeçalho */}
        <div className="relative shrink-0 overflow-hidden border-b-[3px] border-tinta bg-pato p-5 text-tinta dark:border-papel/40 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full border-[4px] border-tinta bg-mente/25" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-tinta bg-white text-tinta transition-transform active:translate-x-[2px] active:translate-y-[2px] dark:border-papel dark:bg-transparent dark:text-papel"
            aria-label="Fechar"
          >
            <X size={18} strokeWidth={2.8} />
          </button>

          <div className="relative z-10 flex flex-col justify-between gap-4 pr-8 sm:flex-row sm:items-center sm:pr-0">
            <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
              <div className="shrink-0 rounded-[18px] border-[3px] border-tinta bg-papel p-1.5 dark:border-papel">
                <DuckMascot size={58} level={currentLevel.level} mood="celebrating" animate showAccessoryBadge />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="chip gap-1 border-2 border-tinta bg-bico text-tinta dark:border-papel">
                    <Sparkles size={11} strokeWidth={3} /> Nível {currentLevel.level}
                  </span>
                  <span className="truncate text-xs font-bold text-tinta/70">
                    {currentLevel.accessory} {currentLevel.title}
                  </span>
                </div>
                <h2 className="truncate font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                  Sala de Troféus
                </h2>
                <p className="line-clamp-1 max-w-md text-sm font-semibold text-tinta/75">
                  {currentLevel.description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 rounded-[18px] border-[3px] border-tinta bg-white/70 px-4 py-3 dark:border-papel sm:flex-col sm:items-end">
              <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide">
                <Zap size={14} strokeWidth={3} /> XP acumulado
              </div>
              <div className="font-display text-2xl font-bold leading-none tracking-tight sm:text-3xl">
                {totalXp.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] font-semibold text-tinta/70">
                {unlockedCount} de {totalCount} conquistas
              </div>
            </div>
          </div>

          {/* Progresso de XP */}
          <div className="relative z-10 mt-5 border-t-[3px] border-tinta/25 pt-4">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold">
              <span>Progresso para o nível {nextLevel ? nextLevel.level : 8}</span>
              {nextLevel ? (
                <span className="font-display">
                  {progressInLevelXp.toLocaleString('pt-BR')} / {neededForNextLevelXp.toLocaleString('pt-BR')} XP ({levelProgressPct}%)
                </span>
              ) : (
                <span className="font-display">Patente máxima! 🎓</span>
              )}
            </div>
            <div className="track w-full" style={{ height: 16 }}>
              <div style={{ width: `${levelProgressPct}%`, background: '#6F00D6' }} />
            </div>
            {nextLevel && (
              <p className="mt-1 text-[11px] font-bold text-tinta/70">
                Faltam {(neededForNextLevelXp - progressInLevelXp).toLocaleString('pt-BR')} XP para se tornar {nextLevel.title}
              </p>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className="no-scrollbar flex shrink-0 items-center justify-between gap-2 overflow-x-auto border-b-[3px] border-tinta px-4 py-2 dark:border-papel/40 sm:px-6">
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
                    'flex items-center gap-2 whitespace-nowrap rounded-[14px] border-[3px] border-tinta px-3.5 py-1.5 text-sm font-bold transition-transform dark:border-papel',
                    active
                      ? 'bg-mente text-papel shadow-brutal-sm'
                      : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
                  )}
                >
                  <Icon size={15} strokeWidth={2.8} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 text-xs font-bold text-muted dark:text-papel/50 sm:flex">
            <ShieldCheck size={14} strokeWidth={3} />
            <span>XP retroativo ativo</span>
          </div>
        </div>

        {/* Tab 1: Conquistas (Medalhas) */}
        {activeTab === 'conquistas' && (
          <div className="overflow-y-auto p-4 sm:p-6 flex-1 flex flex-col gap-5">
            {/* Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category selector */}
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {CATEGORY_FILTERS.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-1.5 whitespace-nowrap rounded-[14px] border-[3px] border-tinta px-3 py-1 text-sm font-bold transition-transform dark:border-papel',
                        isSelected
                          ? 'bg-pato text-tinta shadow-brutal-sm'
                          : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Filtro de status */}
              <div className="flex shrink-0 items-center gap-1 self-start sm:self-auto">
                {([
                  { id: 'all' as const, label: 'Todas' },
                  { id: 'unlocked' as const, label: 'Conquistadas' },
                  { id: 'locked' as const, label: 'A conquistar' },
                ]).map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={cn(
                      'rounded-[12px] border-[3px] border-tinta px-2.5 py-0.5 text-xs font-bold transition-transform dark:border-papel',
                      filterStatus === f.id
                        ? 'bg-mente text-papel'
                        : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
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
                      'relative flex flex-col justify-between gap-3 rounded-[18px] border-[3px] border-tinta p-4 dark:border-papel',
                      isUnlocked ? 'bg-pato/20' : 'bg-white dark:bg-transparent',
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-tinta text-2xl dark:border-papel',
                          isUnlocked ? 'bg-bico' : 'bg-papel opacity-60 grayscale dark:bg-transparent',
                        )}
                      >
                        {ach.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <h4 className={cn('truncate font-display text-base font-bold', isUnlocked ? 'text-tinta dark:text-papel' : 'text-tinta/70 dark:text-papel/60')}>
                            {ach.title}
                          </h4>
                          <span className={cn('chip shrink-0 border-2 dark:border-papel', isUnlocked ? 'bg-pato text-tinta' : 'bg-papel text-muted dark:bg-transparent dark:text-papel/60')}>
                            +{ach.xpReward} XP
                          </span>
                        </div>

                        <p className="text-sm font-semibold leading-snug text-muted dark:text-papel/60">
                          {ach.description}
                        </p>
                      </div>
                    </div>

                    <div className="border-t-[3px] border-tinta/15 pt-2 dark:border-papel/15">
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold">
                        {isUnlocked ? (
                          <span className="flex items-center gap-1 text-tinta dark:text-papel">
                            <CheckCircle2 size={13} strokeWidth={3} /> Conquistada!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted dark:text-papel/50">
                            <Lock size={12} strokeWidth={3} /> Progresso
                          </span>
                        )}
                        <span className="font-display text-tinta dark:text-papel/80">
                          {ach.currentValue.toLocaleString('pt-BR')} / {ach.target.toLocaleString('pt-BR')} {ach.unit}
                        </span>
                      </div>

                      <div className="track w-full" style={{ height: 12 }}>
                        <div style={{ width: `${ach.progressPct}%`, background: isUnlocked ? '#00D64B' : '#6F00D6' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="rounded-[18px] border-[3px] border-dashed border-tinta/30 p-8 text-center dark:border-papel/30">
                <p className="text-sm font-semibold text-muted dark:text-papel/60">
                  Nenhuma conquista encontrada para este filtro.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Patentes e Níveis do DuckMind */}
        {activeTab === 'patentes' && (
          <div className="overflow-y-auto p-4 sm:p-6 flex-1 flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-[18px] border-[3px] border-tinta bg-mente/15 p-4 text-sm font-semibold text-tinta dark:border-papel/40 dark:text-papel/80">
              <Info size={18} strokeWidth={2.8} className="mt-0.5 shrink-0" />
              <div>
                <strong className="font-display font-bold">Como funciona a evolução:</strong> conforme você estuda, responde questões e faz simulados, seu XP acumula continuamente. Ao atingir o limiar de cada patente, o Quack sobe de nível, ganha novos adereços e consagra sua dedicação rumo à universidade!
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
                      'relative flex flex-col justify-between gap-4 overflow-hidden rounded-[18px] border-[3px] border-tinta p-4 transition-all dark:border-papel sm:flex-row sm:items-center',
                      isCurrent
                        ? 'bg-bico/25 shadow-brutal-sm'
                        : isPast
                          ? 'bg-white dark:bg-transparent'
                          : 'border-dashed bg-transparent opacity-60',
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
                          <span className={cn('chip border-2 dark:border-papel', lvl.badgeBg, lvl.badgeText)}>
                            Nível {lvl.level}
                          </span>
                          <h4 className="font-display text-base font-bold text-tinta dark:text-papel">
                            {lvl.title}
                          </h4>
                          {isCurrent && (
                            <span className="chip border-2 border-tinta bg-bico uppercase text-tinta dark:border-papel">
                              Sua patente atual
                            </span>
                          )}
                          {isNext && !isCurrent && (
                            <span className="chip border-2 border-tinta bg-pato uppercase text-tinta dark:border-papel">
                              Próxima patente
                            </span>
                          )}
                        </div>

                        <p className="max-w-lg text-sm font-semibold text-muted dark:text-papel/60">
                          {lvl.description}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-tinta dark:text-papel/70">
                          <span>Adereço: {lvl.accessory}</span>
                          <span className="opacity-40">•</span>
                          <span>XP necessário: {lvl.minXp.toLocaleString('pt-BR')} XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                      {isCurrent ? (
                        <div className="text-right">
                          <div className="font-display text-sm font-bold text-tinta dark:text-papel">
                            {progressInLevelXp.toLocaleString('pt-BR')} / {neededForNextLevelXp.toLocaleString('pt-BR')} XP
                          </div>
                          <div className="text-xs font-semibold text-muted dark:text-papel/50">{levelProgressPct}% completo</div>
                        </div>
                      ) : isPast ? (
                        <span className="chip gap-1 bg-pato text-tinta dark:border-papel">
                          <CheckCircle2 size={14} strokeWidth={3} /> Conquistado
                        </span>
                      ) : (
                        <span className="chip gap-1 bg-white text-muted dark:border-papel dark:bg-transparent dark:text-papel/60">
                          <Lock size={12} strokeWidth={3} /> Bloqueado
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
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                Tabela de Recompensas de XP
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 rounded-[18px] border-[3px] border-tinta bg-white p-3.5 dark:border-papel/40 dark:bg-transparent">
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

                <div className="flex items-start gap-3 rounded-[18px] border-[3px] border-tinta bg-white p-3.5 dark:border-papel/40 dark:bg-transparent">
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

                <div className="flex items-start gap-3 rounded-[18px] border-[3px] border-tinta bg-white p-3.5 dark:border-papel/40 dark:bg-transparent">
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

                <div className="flex items-start gap-3 rounded-[18px] border-[3px] border-tinta bg-white p-3.5 dark:border-papel/40 dark:bg-transparent">
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

                <div className="flex items-start gap-3 rounded-[18px] border-[3px] border-tinta bg-white p-3.5 dark:border-papel/40 dark:bg-transparent">
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

                <div className="flex items-start gap-3 rounded-[18px] border-[3px] border-tinta bg-white p-3.5 dark:border-papel/40 dark:bg-transparent">
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
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                De onde veio o seu XP?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-slate-500 font-bold">Questões Feitas</div>
                  <div className="text-lg font-black font-mono text-sky-600 dark:text-sky-400">
                    +{xpBreakdown.questionsXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-slate-500 font-bold">Horas de Estudo</div>
                  <div className="text-lg font-black font-mono text-brand-600 dark:text-brand-400">
                    +{xpBreakdown.studyTimeXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-slate-500 font-bold">Simulados Realizados</div>
                  <div className="text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                    +{xpBreakdown.simulationsXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-slate-500 font-bold">Redações Escritas</div>
                  <div className="text-lg font-black font-mono text-pink-600 dark:text-pink-400">
                    +{xpBreakdown.essaysXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-slate-500 font-bold">Edital Dominado</div>
                  <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    +{xpBreakdown.editalXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-surface-card rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-[11px] text-slate-500 font-bold">Ofensiva e Constância</div>
                  <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                    +{xpBreakdown.streakXp.toLocaleString('pt-BR')} XP
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-dark flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Seu progresso é salvo e sincronizado automaticamente.
          </div>
          <button
            onClick={onClose}
            className="btn btn-primary px-6 py-2 text-sm font-bold ml-auto"
          >
            Continuar Estudando
          </button>
        </div>
      </div>
    </div>
  );
}
