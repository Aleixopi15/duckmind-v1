import { useMemo } from 'react';
import type { StudySession, Simulation, Essay, TopicCompletion, UserProfile } from './supabase';
import { useApp } from '../context/AppContext';
import { getSimulationQuestions, getSimulationDuration } from './simulationUtils';

export interface DuckLevel {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  description: string;
  accessory: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

export const DUCK_LEVELS: DuckLevel[] = [
  {
    level: 1,
    title: 'Patinho Calouro',
    minXp: 0,
    maxXp: 500,
    description: 'Iniciando os primeiros passos na jornada rumo à universidade.',
    accessory: '🐣',
    badgeBg: 'bg-pato',
    badgeText: 'text-tinta',
    accentColor: '#00D64B',
  },
  {
    level: 2,
    title: 'Pato Aprendiz',
    minXp: 500,
    maxXp: 1200,
    description: 'Criando ritmo, resolvendo questões e construindo a rotina.',
    accessory: '👓',
    badgeBg: 'bg-pato/70',
    badgeText: 'text-tinta',
    accentColor: '#00B23E',
  },
  {
    level: 3,
    title: 'Pato Focado',
    minXp: 1200,
    maxXp: 2500,
    description: 'Foco blindado no cronômetro e constância nos estudos.',
    accessory: '🎧',
    badgeBg: 'bg-mente',
    badgeText: 'text-papel',
    accentColor: '#6F00D6',
  },
  {
    level: 4,
    title: 'Pato Estrategista',
    minXp: 2500,
    maxXp: 4500,
    description: 'Domínio do edital, análise de erros e táticas de prova.',
    accessory: '📋',
    badgeBg: 'bg-mente/80',
    badgeText: 'text-papel',
    accentColor: '#9857F2',
  },
  {
    level: 5,
    title: 'Mestre dos Simulados',
    minXp: 4500,
    maxXp: 7500,
    description: 'Veterano das 180 questões do ENEM com controle de tempo.',
    accessory: '✒️',
    badgeBg: 'bg-bico',
    badgeText: 'text-tinta',
    accentColor: '#D68200',
  },
  {
    level: 6,
    title: 'Redator Nota 1000',
    minXp: 7500,
    maxXp: 12000,
    description: 'Repertório sociocultural afiado e argumentos irrefutáveis.',
    accessory: '🪶',
    badgeBg: 'bg-bico/80',
    badgeText: 'text-tinta',
    accentColor: '#F09F12',
  },
  {
    level: 7,
    title: 'Quase Universitário',
    minXp: 12000,
    maxXp: 18000,
    description: 'Reta final da aprovação com altíssimo rendimento e bagagem.',
    accessory: '🎖️',
    badgeBg: 'bg-tinta',
    badgeText: 'text-papel',
    accentColor: '#17102B',
  },
  {
    level: 8,
    title: 'Pato Federal (Aprovado)',
    minXp: 18000,
    maxXp: 999999,
    description: 'Vaga garantida! Lenda viva da aprovação com nome na lista.',
    accessory: '🎓',
    badgeBg: 'bg-pato',
    badgeText: 'text-tinta',
    accentColor: '#00D64B',
  },
];

export type AchievementCategory = 'questoes' | 'tempo' | 'simulados' | 'redacao' | 'ofensiva' | 'edital';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  target: number;
  unit: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Questões
  {
    id: 'questoes_10',
    title: 'Primeiro Tiro',
    description: 'Resolva suas primeiras 10 questões no aplicativo.',
    category: 'questoes',
    icon: '🎯',
    xpReward: 50,
    target: 10,
    unit: 'questões',
  },
  {
    id: 'questoes_100',
    title: 'Centurião dos Exercícios',
    description: 'Alcance a marca de 100 questões resolvidas.',
    category: 'questoes',
    icon: '🏹',
    xpReward: 150,
    target: 100,
    unit: 'questões',
  },
  {
    id: 'questoes_500',
    title: 'Maratonista de Cadernos',
    description: 'Resolva 500 questões no total.',
    category: 'questoes',
    icon: '⚡',
    xpReward: 300,
    target: 500,
    unit: 'questões',
  },
  {
    id: 'questoes_1000',
    title: 'Máquina de Gabaritar',
    description: 'Resolva 1.000 questões na sua preparação.',
    category: 'questoes',
    icon: '👑',
    xpReward: 600,
    target: 1000,
    unit: 'questões',
  },
  {
    id: 'questoes_2500',
    title: 'Lenda das Questões',
    description: 'Resolva 2.500 questões de vestibulares.',
    category: 'questoes',
    icon: '🔱',
    xpReward: 1200,
    target: 2500,
    unit: 'questões',
  },

  // Tempo de Estudo
  {
    id: 'tempo_1h',
    title: 'Primeira Hora Focada',
    description: 'Acumule 1 hora líquida de estudo focado.',
    category: 'tempo',
    icon: '⏱️',
    xpReward: 50,
    target: 60,
    unit: 'minutos',
  },
  {
    id: 'tempo_10h',
    title: 'Constância Real',
    description: 'Complete 10 horas de estudo no aplicativo.',
    category: 'tempo',
    icon: '⏳',
    xpReward: 150,
    target: 600,
    unit: 'minutos',
  },
  {
    id: 'tempo_50h',
    title: 'Rotina Blindada',
    description: 'Alcance 50 horas de estudo registradas.',
    category: 'tempo',
    icon: '🛡️',
    xpReward: 350,
    target: 3000,
    unit: 'minutos',
  },
  {
    id: 'tempo_100h',
    title: 'Centésima Hora',
    description: 'Supere a barreira das 100 horas de dedicação.',
    category: 'tempo',
    icon: '💎',
    xpReward: 700,
    target: 6000,
    unit: 'minutos',
  },

  // Simulados
  {
    id: 'sim_primeiro',
    title: 'Batismo de Simulado',
    description: 'Complete e registre seu primeiro simulado.',
    category: 'simulados',
    icon: '📘',
    xpReward: 100,
    target: 1,
    unit: 'simulados',
  },
  {
    id: 'sim_5',
    title: 'Combatente do ENEM',
    description: 'Realize 5 simulados de preparação.',
    category: 'simulados',
    icon: '🎖️',
    xpReward: 250,
    target: 5,
    unit: 'simulados',
  },
  {
    id: 'sim_10',
    title: 'Veterano das Provas',
    description: 'Realize 10 simulados de preparação.',
    category: 'simulados',
    icon: '🏆',
    xpReward: 500,
    target: 10,
    unit: 'simulados',
  },
  {
    id: 'sim_tri_750',
    title: 'Clube dos 750+',
    description: 'Registre um simulado com Nota TRI acima de 750 pontos.',
    category: 'simulados',
    icon: '🌟',
    xpReward: 200,
    target: 750,
    unit: 'pts TRI',
  },

  // Redação
  {
    id: 'red_primeira',
    title: 'Primeiras Linhas',
    description: 'Escreva e registre sua primeira redação.',
    category: 'redacao',
    icon: '✍️',
    xpReward: 100,
    target: 1,
    unit: 'redações',
  },
  {
    id: 'red_5',
    title: 'Operário do Texto',
    description: 'Produza 5 redações no modelo ENEM.',
    category: 'redacao',
    icon: '📜',
    xpReward: 250,
    target: 5,
    unit: 'redações',
  },
  {
    id: 'red_900',
    title: 'Elite dos 900+',
    description: 'Tire 900 pontos ou mais em uma redação.',
    category: 'redacao',
    icon: '⭐',
    xpReward: 300,
    target: 900,
    unit: 'pontos',
  },

  // Ofensiva (Streak)
  {
    id: 'streak_3d',
    title: 'Fagulha de Estudo',
    description: 'Mantenha 3 dias consecutivos de ofensiva.',
    category: 'ofensiva',
    icon: '🕯️',
    xpReward: 50,
    target: 3,
    unit: 'dias',
  },
  {
    id: 'streak_7d',
    title: 'Chama Viva',
    description: 'Conquiste uma semana inteira de ofensiva (7 dias).',
    category: 'ofensiva',
    icon: '🔥',
    xpReward: 150,
    target: 7,
    unit: 'dias',
  },
  {
    id: 'streak_14d',
    title: 'Fogueira Imparável',
    description: 'Complete 14 dias seguidos sem falhar.',
    category: 'ofensiva',
    icon: '🌋',
    xpReward: 300,
    target: 14,
    unit: 'dias',
  },
  {
    id: 'streak_30d',
    title: 'Hábito de Aço',
    description: 'Alcance um mês ininterrupto de ofensiva (30 dias).',
    category: 'ofensiva',
    icon: '☀️',
    xpReward: 800,
    target: 30,
    unit: 'dias',
  },

  // Edital
  {
    id: 'edital_10',
    title: 'Desbravador do Edital',
    description: 'Conclua 10 tópicos do edital.',
    category: 'edital',
    icon: '📗',
    xpReward: 80,
    target: 10,
    unit: 'tópicos',
  },
  {
    id: 'edital_30',
    title: 'Dominando Conteúdos',
    description: 'Conclua 30 tópicos do edital.',
    category: 'edital',
    icon: '📚',
    xpReward: 200,
    target: 30,
    unit: 'tópicos',
  },
  {
    id: 'edital_60',
    title: 'Gabaritador de Matérias',
    description: 'Conclua 60 tópicos da matriz do ENEM.',
    category: 'edital',
    icon: '🎓',
    xpReward: 500,
    target: 60,
    unit: 'tópicos',
  },
];

export interface AchievementWithProgress extends Achievement {
  unlocked: boolean;
  currentValue: number;
  progressPct: number;
}

export interface GamificationState {
  totalXp: number;
  currentLevel: DuckLevel;
  nextLevel: DuckLevel | null;
  progressInLevelXp: number;
  neededForNextLevelXp: number;
  levelProgressPct: number;
  allAchievements: AchievementWithProgress[];
  unlockedCount: number;
  totalCount: number;
  stats: {
    totalMinutes: number;
    totalQuestions: number;
    totalCorrect: number;
    totalSimulations: number;
    totalEssays: number;
    totalTopicsCompleted: number;
    highestStreak: number;
    bestSimulationTri: number | null;
    bestEssayScore: number | null;
  };
  xpBreakdown: {
    questionsXp: number;
    studyTimeXp: number;
    simulationsXp: number;
    essaysXp: number;
    editalXp: number;
    streakXp: number;
  };
}

/**
 * Deterministic retro-compatible calculation of user XP and achievements
 */
export function calculateGamification(
  sessions: StudySession[],
  simulations: Simulation[],
  essays: Essay[],
  topicCompletions: TopicCompletion[],
  profile: UserProfile | null
): GamificationState {
  // 1. Gather raw statistics (including study sessions and simulations)
  const sessionMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const simMinutes = simulations.reduce((sum, s) => sum + getSimulationDuration(s), 0);
  const totalMinutes = sessionMinutes + simMinutes;
  const sessionQuestions = sessions.reduce((sum, s) => sum + (s.questions_correct || 0) + (s.questions_wrong || 0), 0);
  const sessionCorrect = sessions.reduce((sum, s) => sum + (s.questions_correct || 0), 0);

  const simQuestions = simulations.reduce((sum, s) => sum + getSimulationQuestions(s).total, 0);
  const simCorrect = simulations.reduce((sum, s) => sum + getSimulationQuestions(s).correct, 0);

  const totalQuestions = sessionQuestions + simQuestions;
  const totalCorrect = sessionCorrect + simCorrect;

  const totalSimulations = simulations.length;
  const bestSimulationTri = simulations.reduce<number | null>((best, s) => {
    if (s.total_score !== null && s.total_score !== undefined) {
      return best === null || s.total_score > best ? s.total_score : best;
    }
    return best;
  }, null);

  const totalEssays = essays.length;
  const bestEssayScore = essays.reduce<number | null>((best, e) => {
    if (e.grade !== null && e.grade !== undefined) {
      return best === null || e.grade > best ? e.grade : best;
    }
    return best;
  }, null);

  const totalTopicsCompleted = topicCompletions.length;
  const highestStreak = Math.max(profile?.current_streak || 0, profile?.longest_streak || 0);

  // 2. XP Calculations
  // Questions: 10 XP per question + 5 XP extra per correct answer
  const questionsXp = (totalQuestions * 10) + (totalCorrect * 5);

  // Study time: 2 XP per minute
  const studyTimeXp = totalMinutes * 2;

  // Simulations: +200 area unica, +350 dia 1/2, +600 completo (or default 300)
  const simulationsXp = simulations.reduce((sum, s) => {
    if (s.simulation_type === 'area_unica') return sum + 200;
    if (s.simulation_type === 'dia_1' || s.simulation_type === 'dia_2') return sum + 350;
    if (s.simulation_type === 'completo') return sum + 600;
    return sum + 300;
  }, 0);

  // Essays: 150 XP per essay + 100 bonus if score >= 900
  const essaysXp = essays.reduce((sum, e) => {
    const base = 150;
    const bonus = (e.grade || 0) >= 900 ? 100 : 0;
    return sum + base + bonus;
  }, 0);

  // Edital topics: 40 XP each
  const editalXp = totalTopicsCompleted * 40;

  // Streak: 25 XP per streak day (up to capped calculation)
  const streakXp = highestStreak * 25;

  const totalXp = questionsXp + studyTimeXp + simulationsXp + essaysXp + editalXp + streakXp;

  // 3. Resolve Current Level
  let currentLevel = DUCK_LEVELS[0];
  let nextLevel: DuckLevel | null = DUCK_LEVELS[1];

  for (let i = 0; i < DUCK_LEVELS.length; i++) {
    const lvl = DUCK_LEVELS[i];
    if (totalXp >= lvl.minXp) {
      currentLevel = lvl;
      nextLevel = i < DUCK_LEVELS.length - 1 ? DUCK_LEVELS[i + 1] : null;
    }
  }

  const progressInLevelXp = Math.max(0, totalXp - currentLevel.minXp);
  const neededForNextLevelXp = nextLevel ? nextLevel.minXp - currentLevel.minXp : 1;
  const levelProgressPct = nextLevel
    ? Math.min(100, Math.round((progressInLevelXp / neededForNextLevelXp) * 100))
    : 100;

  // 4. Resolve Achievements with progress
  const allAchievements: AchievementWithProgress[] = ACHIEVEMENTS.map(ach => {
    let currentValue = 0;

    switch (ach.id) {
      case 'questoes_10':
      case 'questoes_100':
      case 'questoes_500':
      case 'questoes_1000':
      case 'questoes_2500':
        currentValue = totalQuestions;
        break;

      case 'tempo_1h':
      case 'tempo_10h':
      case 'tempo_50h':
      case 'tempo_100h':
        currentValue = totalMinutes;
        break;

      case 'sim_primeiro':
      case 'sim_5':
      case 'sim_10':
        currentValue = totalSimulations;
        break;

      case 'sim_tri_750':
        currentValue = bestSimulationTri || 0;
        break;

      case 'red_primeira':
      case 'red_5':
        currentValue = totalEssays;
        break;

      case 'red_900':
        currentValue = bestEssayScore || 0;
        break;

      case 'streak_3d':
      case 'streak_7d':
      case 'streak_14d':
      case 'streak_30d':
        currentValue = highestStreak;
        break;

      case 'edital_10':
      case 'edital_30':
      case 'edital_60':
        currentValue = totalTopicsCompleted;
        break;

      default:
        currentValue = 0;
    }

    const unlocked = currentValue >= ach.target;
    const progressPct = ach.target > 0 ? Math.min(100, Math.round((currentValue / ach.target) * 100)) : 0;

    return {
      ...ach,
      unlocked,
      currentValue,
      progressPct,
    };
  });

  const unlockedCount = allAchievements.filter(a => a.unlocked).length;

  return {
    totalXp,
    currentLevel,
    nextLevel,
    progressInLevelXp,
    neededForNextLevelXp,
    levelProgressPct,
    allAchievements,
    unlockedCount,
    totalCount: allAchievements.length,
    stats: {
      totalMinutes,
      totalQuestions,
      totalCorrect,
      totalSimulations,
      totalEssays,
      totalTopicsCompleted,
      highestStreak,
      bestSimulationTri,
      bestEssayScore,
    },
    xpBreakdown: {
      questionsXp,
      studyTimeXp,
      simulationsXp,
      essaysXp,
      editalXp,
      streakXp,
    },
  };
}

export function useGamification(): GamificationState {
  const { sessions, simulations, essays, topicCompletions, profile } = useApp();
  return useMemo(() => {
    return calculateGamification(sessions, simulations, essays, topicCompletions, profile);
  }, [sessions, simulations, essays, topicCompletions, profile]);
}
