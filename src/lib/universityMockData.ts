import type {
  UniversitySubject,
  UniversityGrade,
  UniversityTask,
  UniversityStudySession,
  UniversityFlashcard,
} from './supabase';

export function createInitialUniversityData(userId: string): {
  subjects: UniversitySubject[];
  grades: UniversityGrade[];
  tasks: UniversityTask[];
  sessions: UniversityStudySession[];
  flashcards: UniversityFlashcard[];
} {
  const calcId = crypto.randomUUID();
  const algoId = crypto.randomUUID();
  const fisId = crypto.randomUUID();
  const algLinId = crypto.randomUUID();

  const now = new Date();
  const inDays = (d: number) => {
    const target = new Date(now);
    target.setDate(target.getDate() + d);
    return target.toISOString().split('T')[0];
  };

  const daysAgoISO = (d: number, hoursAgo = 0) => {
    const target = new Date(now);
    target.setDate(target.getDate() - d);
    target.setHours(target.getHours() - hoursAgo);
    return target.toISOString();
  };

  const subjects: UniversitySubject[] = [
    {
      id: calcId,
      user_id: userId,
      name: 'Cálculo Diferencial e Integral I',
      code: 'MAT101',
      professor: 'Prof. Dr. Roberto Dias',
      room: 'Prédio 4 · Sala 202',
      schedule: 'Seg e Qua · 08:00 - 10:00',
      credits: 4,
      target_hours_weekly: 6,
      color: '#6F00D6',
      icon: 'Calculator',
      semester: '2026.1',
      created_at: daysAgoISO(30),
    },
    {
      id: algoId,
      user_id: userId,
      name: 'Algoritmos e Estrutura de Dados',
      code: 'CC102',
      professor: 'Dra. Amanda Torres',
      room: 'Lab de Informática 3',
      schedule: 'Ter e Qui · 10:00 - 12:00',
      credits: 4,
      target_hours_weekly: 6,
      color: '#00D64B',
      icon: 'Code',
      semester: '2026.1',
      created_at: daysAgoISO(30),
    },
    {
      id: fisId,
      user_id: userId,
      name: 'Física Teórica e Experimental I',
      code: 'FIS104',
      professor: 'Dr. Lucas Neves',
      room: 'Pavilhão Exatas · Lab 2',
      schedule: 'Sex · 14:00 - 18:00',
      credits: 4,
      target_hours_weekly: 4,
      color: '#0284c7',
      icon: 'Atom',
      semester: '2026.1',
      created_at: daysAgoISO(30),
    },
    {
      id: algLinId,
      user_id: userId,
      name: 'Álgebra Linear e Geometria Analítica',
      code: 'MAT103',
      professor: 'Profª. Helena Lima',
      room: 'Prédio 4 · Sala 108',
      schedule: 'Ter e Qui · 08:00 - 10:00',
      credits: 4,
      target_hours_weekly: 4,
      color: '#d97706',
      icon: 'Layers',
      semester: '2026.1',
      created_at: daysAgoISO(30),
    },
  ];

  const grades: UniversityGrade[] = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: calcId,
      title: 'P1 - Limites e Continuidade',
      weight: 1.0,
      score: 8.5,
      max_score: 10,
      date: inDays(-14),
      notes: 'Boa resolução dos limites fundamentais.',
      created_at: daysAgoISO(20),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: calcId,
      title: 'P2 - Derivadas e Taxas Relacionadas',
      weight: 1.5,
      score: null,
      max_score: 10,
      date: inDays(4), // Nearest exam for banner: 4 dias para P2 de Cálculo Diferencial e Integral I
      notes: 'Focar em otimização e regra da cadeia.',
      created_at: daysAgoISO(10),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algoId,
      title: 'P1 - Ponteiros e Alocação Dinâmica',
      weight: 1.0,
      score: 9.0,
      max_score: 10,
      date: inDays(-18),
      notes: 'Nota máxima nos testes automáticos.',
      created_at: daysAgoISO(25),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algoId,
      title: 'Projeto 1 - Árvores Binárias de Busca',
      weight: 1.0,
      score: 9.5,
      max_score: 10,
      date: inDays(-5),
      notes: 'Código modular com testes unitários.',
      created_at: daysAgoISO(15),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: fisId,
      title: 'P1 - Cinemática e Dinâmica Newtoniana',
      weight: 1.0,
      score: 7.8,
      max_score: 10,
      date: inDays(-10),
      notes: 'Atenção ao diagrama de corpo livre no plano inclinado.',
      created_at: daysAgoISO(18),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: fisId,
      title: 'P2 - Trabalho, Energia e Momento Linear',
      weight: 1.5,
      score: null,
      max_score: 10,
      date: inDays(16),
      notes: 'Revisar conservação do momento e colisões.',
      created_at: daysAgoISO(5),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algLinId,
      title: 'P1 - Matrizes, Sistemas e Determinantes',
      weight: 1.0,
      score: 8.2,
      max_score: 10,
      date: inDays(-8),
      notes: 'Eliminação gaussiana dominada.',
      created_at: daysAgoISO(15),
    },
  ];

  const tasks: UniversityTask[] = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: calcId,
      title: 'Lista de Exercícios 4: Derivadas Implícitas',
      description: 'Resolver os 15 exercícios recomendados da apostila do Stewart (Capítulo 3).',
      status: 'in_progress',
      priority: 'high',
      due_date: inDays(2),
      delivered_at: null,
      created_at: daysAgoISO(3),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algoId,
      title: 'Implementação de Árvore AVL em C++',
      description: 'Estruturar nós, balanceamento com rotações simples e duplas (LL, RR, LR, RL).',
      status: 'todo',
      priority: 'high',
      due_date: inDays(5),
      delivered_at: null,
      created_at: daysAgoISO(2),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: fisId,
      title: 'Relatório de Experimento: Pêndulo Simples',
      description: 'Cálculo do período experimental, propagação de incertezas e gráficos de regressão.',
      status: 'done',
      priority: 'medium',
      due_date: inDays(-2),
      delivered_at: daysAgoISO(2),
      created_at: daysAgoISO(7),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algLinId,
      title: 'Demonstração: Espaços e Subespaços Vetoriais',
      description: 'Verificar os axiomas de fechamento para soma e multiplicação por escalar.',
      status: 'todo',
      priority: 'medium',
      due_date: inDays(8),
      delivered_at: null,
      created_at: daysAgoISO(1),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algoId,
      title: 'Entrega de Algoritmo de Dijkstra com Min-Heap',
      description: 'Busca de caminho mínimo em grafos ponderados orientados.',
      status: 'done',
      priority: 'high',
      due_date: inDays(-6),
      delivered_at: daysAgoISO(6),
      created_at: daysAgoISO(12),
    },
  ];

  const sessions: UniversityStudySession[] = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: calcId,
      duration_minutes: 120,
      notes: 'Estudo intensivo para a P2: taxas relacionadas e derivadas direcionais.',
      session_type: 'estudo',
      studied_at: daysAgoISO(0, 3),
      created_at: daysAgoISO(0, 3),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algoId,
      duration_minutes: 90,
      notes: 'Desenvolvimento das rotações da árvore AVL.',
      session_type: 'projeto',
      studied_at: daysAgoISO(1, 2),
      created_at: daysAgoISO(1, 2),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: fisId,
      duration_minutes: 75,
      notes: 'Revisão dos exercícios de impulso e colisões elásticas.',
      session_type: 'exercicios',
      studied_at: daysAgoISO(2, 4),
      created_at: daysAgoISO(2, 4),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algLinId,
      duration_minutes: 60,
      notes: 'Bases ortonormais e processo de Gram-Schmidt.',
      session_type: 'revisao',
      studied_at: daysAgoISO(3, 5),
      created_at: daysAgoISO(3, 5),
    },
  ];

  const flashcards: UniversityFlashcard[] = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: calcId,
      front: 'O que diz o Teorema do Valor Médio (TVM)?',
      back: 'Se f é contínua em [a, b] e diferenciável em (a, b), existe ao menos um c ∈ (a, b) tal que f\'(c) = [f(b) - f(a)] / (b - a). Ou seja, a taxa instantânea iguala a taxa média.',
      summary_topic: 'Cálculo Diferencial',
      status: 'dominado',
      last_reviewed_at: daysAgoISO(1),
      created_at: daysAgoISO(15),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algoId,
      front: 'Qual o fator de balanceamento (balance factor) em uma Árvore AVL?',
      back: 'É a diferença de altura entre a subárvore esquerda e a subárvore direita: BF = Altura(Esq) - Altura(Dir). Em uma AVL válida, BF ∈ {-1, 0, +1}.',
      summary_topic: 'Árvores Balanceadas',
      status: 'revisando',
      last_reviewed_at: daysAgoISO(2),
      created_at: daysAgoISO(12),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: fisId,
      front: 'Em colisões inelásticas, o que se conserva?',
      back: 'Apenas a Quantidade de Movimento linear (Momento Linear) é conservada. A Energia Cinética NÃO se conserva (parte é dissipada em calor/deformação).',
      summary_topic: 'Mecânica Clássica',
      status: 'novo',
      last_reviewed_at: null,
      created_at: daysAgoISO(8),
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: algLinId,
      front: 'Quando um conjunto de vetores é Linearmente Independente (LI)?',
      back: 'Quando a única combinação linear dos vetores que resulta no vetor nulo é aquela em que todos os escalares são iguais a zero: c₁v₁ + c₂v₂ + ... + cₖvₖ = 0 ⇒ c₁ = c₂ = ... = cₖ = 0.',
      summary_topic: 'Espaços Vetoriais',
      status: 'dominado',
      last_reviewed_at: daysAgoISO(3),
      created_at: daysAgoISO(10),
    },
  ];

  return { subjects, grades, tasks, sessions, flashcards };
}
