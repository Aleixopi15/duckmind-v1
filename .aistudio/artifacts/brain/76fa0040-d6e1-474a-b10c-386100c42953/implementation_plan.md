# DuckMind Intelligence: Diagnóstico de Lacunas e Revisão Adaptativa

Plano arquitetural e conceitual de novos recursos avançados para o DuckMind, orientados puramente por ciências cognitivas, análise diagnóstica e estratégia de aprovação no ENEM, sem qualquer artifício de gamificação (sem pontos, medalhas ou rankings).

---

## Decisões Confirmadas e Alinhamento

> [!IMPORTANT]
> **Pilar Central Confirmado**: Diagnóstico de lacunas de aprendizagem aliado a um sistema de revisão inteligente fundamentado na curva de esquecimento (Ebbinghaus) e recall ativo.
> **Abordagem Estrutural**: Combinação equilibrada entre análise preditiva automatizada (cruzando dados de simulados e caderno de erros) e controles estruturados de autoavaliação guiada pelo próprio vestibulando.
> **Diretriz Rígida**: 0% de gamificação. Foco integral em utilidade pedagógica, precisão diagnóstica, redução de ansiedade e eficiência de tempo.

- **Origem dos Dados**: Integração direta com as entidades existentes no DuckMind (`StudySession`, `Simulation`, `ErrorNotebook`, `TopicCompletion`, `Subject`).
- **Intervenção Inteligente**: O sistema não inventa métricas fictícias; ele calcula a vulnerabilidade real por matéria e o momento exato de revisar cada assunto antes do esquecimento.

---

## 1. Visão Geral e Conceito dos Novos Recursos

### O Problema do Vestibulando de Alto Rendimento
Estudantes que buscam cursos concorridos (Medicina, Direito, Engenharias) perdem dezenas de horas estudando o que já dominam ou revisando matérias de forma passiva. Ao mesmo tempo, erros em simulados muitas vezes ficam esquecidos em cadernos estáticos sem um plano de ação para fechar a lacuna conceitual.

### Os 3 Módulos Inovadores Propostos

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DUCKMIND INTELLIGENCE                           │
├─────────────────────┬───────────────────────────┬──────────────────────┤
│ 1. DIAGNÓSTICO DE   │ 2. CICLO ADAPTATIVO       │ 3. MATRIZ DE RETORNO │
│    LACUNAS (GAP)    │    DE REVISÃO (EBBINGHAUS)│    ESTRATÉGICO (ROI) │
├─────────────────────┼───────────────────────────┼──────────────────────┤
│ • Triangulação de   │ • Fila de revisão diária  │ • Cruzamento da      │
│   erros por causa   │   inteligente (D+1, D+7,  │   recorrência ENEM   │
│   raiz (Conceito,   │   D+15, D+30)             │   com vulnerabilidade│
│   Interpretação ou  │ • Recall ativo com auto-  │ • Guia: "O que estu- │
│   Atenção/Tempo)    │   avaliação guiada de     │   dar hoje para ter  │
│ • Taxa de reincidên-│   retenção                │   maior ganho na     │
│   cia por competên- │ • Previsão do momento     │   nota final"        │
│   cia do edital     │   crítico de esquecimento │                      │
└─────────────────────┴───────────────────────────┴──────────────────────┘
```

1. **Motor de Diagnóstico de Lacunas Cognitivas (Root-Cause Gap Engine)**:
   - Ao errar uma questão no Caderno de Erros ou Simulado, o aluno classifica a causa raiz real do erro:
     - *Lacuna Teórica*: não conhecia a fórmula, lei ou conceito biológico/físico/histórico.
     - *Distrator / Interpretação*: entendeu o texto errado ou caiu na "pegadinha" do comando da questão.
     - *Fadiga / Pressão de Tempo*: erro bobo por pressa ou cansaço no final da prova.
   - O DuckMind gera um raio-x visual das fraquezas estruturais, separando o que exige reestudo teórico do que exige treino de atenção.

2. **Ciclo de Revisão Inteligente Espaçada (Adaptive Spaced Repetition)**:
   - Agenda dinâmica calculada automaticamente a partir da data em que um tópico do edital foi estudado ou teve erros registrados.
   - Painel **"Revisões Pendentes de Hoje"** no Dashboard:
     - Alerta quais 2 ou 3 tópicos atingiram a janela crítica de perda de retenção.
     - Checklist de autoavaliação guiada: o vestibulando tenta lembrar os 3 pontos centrais do tema (Recall Ativo) antes de expandir o resumo, classificando se a retenção foi Alta, Moderada ou Nula para recalibrar o próximo ciclo.

3. **Matriz de Retorno Estratégico do ENEM (Priorizador de Reta Final)**:
   - Matriz 2x2 que cruza **Incidência Histórica do ENEM** (ex: Funções, Ecologia, Termologia, Cidadania) com o **Aproveitamento Pessoal** do estudante.
   - Quadrante de Oportunidade Máxima: indica tópicos de altíssima incidência na prova em que o estudante está com taxa de acerto abaixo de 70%, gerando uma lista recomendada de estudos de alto rendimento.

---

## 2. Experiência do Usuário e Design Visual

Seguindo a constituição visual DuckMind 2.0 (tema escuro `#0B0819` com cartões `#14102A`, ambient glow violeta/verde e tipografia Space Grotesk / Plus Jakarta Sans), os novos recursos serão dispostos de forma elegante e limpa:

### Fluxo 1: Nova Aba "Diagnóstico & Revisões" no Menu Lateral Flutuante
- Adiciona o botão **"Diagnóstico"** na barra lateral de navegação (ícone de radar ou mira diagnóstica).
- O cabeçalho apresenta a síntese do dia: quantas revisões estão na janela ótima de retenção e qual o tópico prioritário de maior vulnerabilidade.

### Fluxo 2: Card de "Revisões de Hoje" Integrado ao Início
- Na página inicial do Dashboard, logo abaixo das metas da semana, um módulo discreto exibe:
  - *Tema da revisão*: Ex: "Química Geral: Estequiometria".
  - *Motivo*: "Revisão D+7 (3 erros registrados no simulado passado)".
  - *Botão de Ação*: "Iniciar Revisão Guiada" (abre modal de recall com 3 perguntas norteadoras).

### Fluxo 3: Mapeamento de Causa Raiz no Caderno de Erros
- No Caderno de Erros já existente, é adicionado um seletor rápido de Causa do Erro (Teoria, Interpretação, Atenção), alimentando automaticamente o motor analítico.

---

## 3. Decisões de Produto e Filosofia Anti-Gamificação

| Elemento Comum em Apps | Por que foi BANIDO no DuckMind | Solução Inovadora Adotada |
| :--- | :--- | :--- |
| **Pontos / XP / Níveis** | Geram foco em "farmar tarefas fáceis" para ganhar pontos fictícios. | **Taxa de Domínio Real**: porcentagem de retenção comprovada e tempo economizado. |
| **Ligas / Ranking Social** | Promovem ansiedade prejudicial e comparações tóxicas entre vestibulandos. | **Autodiagnóstico Privado**: o foco é o aluno contra as exigências técnicas da prova. |
| **Streaks Punitivos** | Penalizam dias de descanso legítimos ou imprevistos de saúde. | **Janela de Revisão Flexível**: avisa o limiar da curva de retenção sem destruir o histórico. |
| **Badges / Insígnias** | Recompensas cosméticas sem nenhum valor cognitivo. | **Relatório Diagnóstico Baixável/Exportável** para discussão com professores ou mentores. |

---

## 4. Arquitetura Técnica e Modelo de Dados

### Diagrama de Componentes e Fluxo de Dados

```
┌──────────────────────────────────────────────────────────────────┐
│                      ESTADO GLOBAL & DADOS                       │
│  [Sessions] + [Simulations] + [ErrorNotebook] + [Topics/Edital]  │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                  MOTOR ANALÍTICO (Pure TS / Hooks)               │
│                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────────────┐  │
│  │   GapDiagnosisEngine   │  │    EbbinghausScheduler         │  │
│  │  • Taxa de erro/tópico │  │  • Cálculo D+1, D+7, D+15, D+30│  │
│  │  • Causa: Teoria/      │  │  • Índice de Decaimento de     │  │
│  │    Interpretação/Tempo │  │    Retenção (Retention Decay)  │  │
│  └───────────┬────────────┘  └────────────────┬───────────────┘  │
│              │                                │                  │
│              └───────────────┬────────────────┘                  │
│                              ▼                                   │
│            ┌────────────────────────────────────┐                │
│            │   PrioritizationMatrix (ENEM ROI)  │                │
│            │ • Peso Incidência × Vulnerabilidade│                │
│            └─────────────────┬──────────────────┘                │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       INTERFACE DO USUÁRIO                       │
│                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────────────┐  │
│  │  Aba "Diagnóstico"     │  │  Widget "Revisões de Hoje"     │  │
│  │  • Matriz de Risco     │  │  • Modal de Recall Ativo       │  │
│  │  • Distribuição Causas │  │  • Registro de Retenção        │  │
│  └────────────────────────┘  └────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Novas Entidades no Schema do DuckMind

1. **`TopicReviewSchedule`**:
   - `id`: string
   - `user_id`: string
   - `topic_id`: string
   - `stage`: number (1: D+1, 2: D+7, 3: D+15, 4: D+30, 5: Consolidado)
   - `last_reviewed_at`: timestamp
   - `next_review_due`: timestamp
   - `retention_level`: 'low' | 'medium' | 'high'
   - `recall_notes`: string (anotações de recall do próprio estudante)

2. **`ErrorCauseClassification`**:
   - Estende a tabela de erros existente com o campo enum: `'theory_gap' | 'interpretation_distractor' | 'time_pressure_fatigue' | 'calculation_slip'`.

---

## 5. Próximos Passos de Execução

1. **Fase 1**: Criar o utilitário analítico `src/lib/learningAnalytics.ts` contendo os algoritmos da curva de esquecimento e da matriz de incidência do ENEM.
2. **Fase 2**: Integrar a classificação de causa-raiz ao modal de registro de erros do `Caderno de Erros`.
3. **Fase 3**: Criar o componente e aba `DiagnosisTab.tsx` com visualização analítica clara (gráficos de distribuição de causa raiz e matriz de vulnerabilidade).
4. **Fase 4**: Adicionar o card compacto de "Revisão do Dia" na tela inicial do Dashboard para acesso imediato.
