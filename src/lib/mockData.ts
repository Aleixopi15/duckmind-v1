import type {
  Subject,
  Topic,
} from './supabase';

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-pt', name: 'Língua Portuguesa', color: '#6A1B9A', icon: 'MenuBook', area: 'Linguagens, Códigos e suas Tecnologias', display_order: 1 },
  { id: 'sub-lit', name: 'Literatura', color: '#7B1FA2', icon: 'AutoStories', area: 'Linguagens, Códigos e suas Tecnologias', display_order: 2 },
  { id: 'sub-ing', name: 'Língua Inglesa', color: '#AD1457', icon: 'Language', area: 'Linguagens, Códigos e suas Tecnologias', display_order: 3 },
  { id: 'sub-art', name: 'Artes', color: '#D81B60', icon: 'Palette', area: 'Linguagens, Códigos e suas Tecnologias', display_order: 4 },
  { id: 'sub-ef', name: 'Educação Física', color: '#E65100', icon: 'SportsSoccer', area: 'Linguagens, Códigos e suas Tecnologias', display_order: 5 },
  { id: 'sub-tic', name: 'Tecnologias da Informação e Comunicação', color: '#0277BD', icon: 'Computer', area: 'Linguagens, Códigos e suas Tecnologias', display_order: 6 },
  { id: 'sub-red', name: 'Redação', color: '#880E4F', icon: 'Edit', area: 'Linguagens, Códigos e suas Tecnologias', display_order: 7 },
  { id: 'sub-his', name: 'História', color: '#BF360C', icon: 'HistoryEdu', area: 'Ciências Humanas e suas Tecnologias', display_order: 8 },
  { id: 'sub-geo', name: 'Geografia', color: '#4E342E', icon: 'Public', area: 'Ciências Humanas e suas Tecnologias', display_order: 9 },
  { id: 'sub-fil', name: 'Filosofia', color: '#37474F', icon: 'Psychology', area: 'Ciências Humanas e suas Tecnologias', display_order: 10 },
  { id: 'sub-soc', name: 'Sociologia', color: '#455A64', icon: 'Groups', area: 'Ciências Humanas e suas Tecnologias', display_order: 11 },
  { id: 'sub-bio', name: 'Biologia', color: '#2E7D32', icon: 'EcoOutlined', area: 'Ciências da Natureza e suas Tecnologias', display_order: 12 },
  { id: 'sub-qui', name: 'Química', color: '#00838F', icon: 'Biotech', area: 'Ciências da Natureza e suas Tecnologias', display_order: 13 },
  { id: 'sub-fis', name: 'Física', color: '#0277BD', icon: 'Science', area: 'Ciências da Natureza e suas Tecnologias', display_order: 14 },
  { id: 'sub-mat', name: 'Matemática', color: '#1565C0', icon: 'Calculate', area: 'Matemática e suas Tecnologias', display_order: 15 },
];

export const INITIAL_TOPIC_TEMPLATES: Array<{ subjectName: string; name: string; description: string; order: number }> = [
  // Língua Portuguesa
  { subjectName: 'Língua Portuguesa', name: 'Interpretação e compreensão textual', description: 'Leitura crítica, ideia central, inferência, pressupostos e subentendidos', order: 0 },
  { subjectName: 'Língua Portuguesa', name: 'Gêneros e tipos textuais', description: 'Notícia, crônica, charge, propaganda, artigo de opinião, poema, conto', order: 1 },
  { subjectName: 'Língua Portuguesa', name: 'Coesão e coerência textual', description: 'Conectivos, referenciação (anáfora/catáfora), progressão de ideias', order: 2 },
  { subjectName: 'Língua Portuguesa', name: 'Funções da linguagem', description: 'Referencial, emotiva, conativa, poética, fática, metalinguística', order: 3 },
  { subjectName: 'Língua Portuguesa', name: 'Variação linguística', description: 'Norma culta, registros formal/informal, preconceito linguístico, regionalismos', order: 4 },
  { subjectName: 'Língua Portuguesa', name: 'Figuras de linguagem', description: 'Metáfora, metonímia, ironia, hipérbole, eufemismo, antítese', order: 5 },
  { subjectName: 'Língua Portuguesa', name: 'Morfossintaxe aplicada ao texto', description: 'Concordância verbal e nominal, regência, uso da crase', order: 6 },
  { subjectName: 'Língua Portuguesa', name: 'Semântica', description: 'Polissemia, ambiguidade, denotação e conotação', order: 7 },
  { subjectName: 'Língua Portuguesa', name: 'Intertextualidade', description: 'Paródia, paráfrase, citação, referências culturais', order: 8 },
  // Literatura
  { subjectName: 'Literatura', name: 'Barroco e Arcadismo', description: 'Contraste fé/razão, bucolismo, Gregório de Matos', order: 0 },
  { subjectName: 'Literatura', name: 'Romantismo', description: 'Prosa indianista e urbana, poesia lírica, José de Alencar', order: 1 },
  { subjectName: 'Literatura', name: 'Realismo e Naturalismo', description: 'Crítica social, Machado de Assis, determinismo', order: 2 },
  { subjectName: 'Literatura', name: 'Parnasianismo e Simbolismo', description: '"Arte pela arte", musicalidade, subjetivismo', order: 3 },
  { subjectName: 'Literatura', name: 'Pré-Modernismo', description: 'Euclides da Cunha, contexto de transição', order: 4 },
  { subjectName: 'Literatura', name: 'Modernismo (1ª, 2ª e 3ª geração)', description: 'Semana de 22, poesia social, geração de 45', order: 5 },
  { subjectName: 'Literatura', name: 'Literatura contemporânea', description: 'Literatura marginal, urbana, autoria feminina e negra', order: 6 },
  // Língua Inglesa
  { subjectName: 'Língua Inglesa', name: 'Compreensão global e específica', description: 'Ideia principal, propósito comunicativo, público-alvo', order: 0 },
  { subjectName: 'Língua Inglesa', name: 'Vocabulário em contexto', description: 'Inferência lexical, sinônimos, antônimos', order: 1 },
  { subjectName: 'Língua Inglesa', name: 'Falsos cognatos', description: 'Palavras enganosas entre inglês e português (false friends)', order: 2 },
  { subjectName: 'Língua Inglesa', name: 'Gêneros textuais em inglês', description: 'Notícias, anúncios, tirinhas, letras de música, memes', order: 3 },
  { subjectName: 'Língua Inglesa', name: 'Textos multimodais', description: 'Interpretação de imagem associada a texto', order: 4 },
  // Artes
  { subjectName: 'Artes', name: 'Arte ocidental clássica', description: 'Renascimento, Barroco, Neoclassicismo', order: 0 },
  { subjectName: 'Artes', name: 'Vanguardas europeias', description: 'Cubismo, Expressionismo, Surrealismo, Futurismo', order: 1 },
  { subjectName: 'Artes', name: 'Arte moderna e contemporânea brasileira', description: 'Semana de Arte Moderna, novas mídias', order: 2 },
  { subjectName: 'Artes', name: 'Cultura popular e patrimônio', description: 'Festas populares, artesanato, patrimônio imaterial', order: 3 },
  // Educação Física
  { subjectName: 'Educação Física', name: 'Corpo, saúde e qualidade de vida', description: 'Sedentarismo, hábitos saudáveis, autocuidado', order: 0 },
  { subjectName: 'Educação Física', name: 'Esporte como fenômeno social', description: 'Espetacularização, inclusão, Jogos Olímpicos', order: 1 },
  { subjectName: 'Educação Física', name: 'Cultura corporal de movimento', description: 'Jogos, ginástica, lutas, danças populares', order: 2 },
  // Tecnologias da Informação e Comunicação
  { subjectName: 'Tecnologias da Informação e Comunicação', name: 'Tecnologia e sociedade', description: 'Impactos no trabalho, educação e relações sociais', order: 0 },
  { subjectName: 'Tecnologias da Informação e Comunicação', name: 'Cultura digital', description: 'Redes sociais, algoritmos, bolhas informacionais', order: 1 },
  { subjectName: 'Tecnologias da Informação e Comunicação', name: 'Desinformação', description: 'Fake news, letramento midiático, checagem de fatos', order: 2 },
  // Redação
  { subjectName: 'Redação', name: 'Estrutura dissertativo-argumentativa', description: 'Introdução, desenvolvimento com repertório, conclusão', order: 0 },
  { subjectName: 'Redação', name: 'Proposta de intervenção', description: 'Agente, ação, meio/modo, efeito e detalhamento (5 elementos)', order: 1 },
  { subjectName: 'Redação', name: 'Competências do ENEM 1 a 5', description: 'Critérios detalhados de avaliação da banca do ENEM', order: 2 },
  // História
  { subjectName: 'História', name: 'Brasil Colônia', description: 'Economia açucareira, mineração, sistema colonial, Capitanias', order: 0 },
  { subjectName: 'História', name: 'Brasil Império', description: 'Independência, Primeiro Reinado, Período Regencial, Segundo Reinado', order: 1 },
  { subjectName: 'História', name: 'Escravidão e resistência negra', description: 'Tráfico atlântico, quilombos, abolicionismo', order: 2 },
  { subjectName: 'História', name: 'Brasil República', description: 'Primeira República, Era Vargas, populismo, Golpe de 1964', order: 3 },
  { subjectName: 'História', name: 'Ditadura Militar e redemocratização', description: 'AI-5, anos de chumbo, Diretas Já, Constituição de 1988', order: 4 },
  { subjectName: 'História', name: 'Revolução Francesa e Industrial', description: 'Iluminismo, queda do Antigo Regime, capitalismo industrial', order: 5 },
  { subjectName: 'História', name: 'Primeira e Segunda Guerra Mundial', description: 'Causas, Holocausto, nova ordem geopolítica', order: 6 },
  { subjectName: 'História', name: 'Guerra Fria', description: 'Bipolaridade, corrida armamentista, descolonização afro-asiática', order: 7 },
  // Geografia
  { subjectName: 'Geografia', name: 'Geopolítica mundial', description: 'Conflitos internacionais, blocos econômicos, ONU', order: 0 },
  { subjectName: 'Geografia', name: 'Globalização', description: 'Nova divisão internacional do trabalho, fluxos financeiros', order: 1 },
  { subjectName: 'Geografia', name: 'Urbanização brasileira', description: 'Mobilidade urbana, moradia, segregação espacial', order: 2 },
  { subjectName: 'Geografia', name: 'Mudanças climáticas e meio ambiente', description: 'Aquecimento global, biomas brasileiros, recursos hídricos', order: 3 },
  { subjectName: 'Geografia', name: 'Agropecuária e matriz energética', description: 'Agronegócio, fontes renováveis e não renováveis', order: 4 },
  { subjectName: 'Geografia', name: 'Demografia e Cartografia', description: 'Transição demográfica, migrações, escalas e projeções', order: 5 },
  // Filosofia
  { subjectName: 'Filosofia', name: 'Filosofia antiga', description: 'Ética e política em Sócrates, Platão e Aristóteles', order: 0 },
  { subjectName: 'Filosofia', name: 'Contratualismo', description: 'Hobbes, Locke e Rousseau — Estado e poder político', order: 1 },
  { subjectName: 'Filosofia', name: 'Ética e cidadania', description: 'Direitos humanos, dilemas morais contemporâneos', order: 2 },
  { subjectName: 'Filosofia', name: 'Filosofia contemporânea', description: 'Existencialismo, Escola de Frankfurt, pós-modernidade', order: 3 },
  // Sociologia
  { subjectName: 'Sociologia', name: 'Pensamento sociológico clássico', description: 'Durkheim, Marx e Weber', order: 0 },
  { subjectName: 'Sociologia', name: 'Trabalho e classes sociais', description: 'Divisão do trabalho, desigualdade social', order: 1 },
  { subjectName: 'Sociologia', name: 'Cultura, diversidade e cidadania', description: 'Identidade, raça, gênero e etnia', order: 2 },
  // Biologia
  { subjectName: 'Biologia', name: 'Citologia e metabolismo', description: 'Estrutura e função celular, organelas, respiração e fotossíntese', order: 0 },
  { subjectName: 'Biologia', name: 'Genética e biotecnologia', description: 'Leis de Mendel, mutações, engenharia genética, vacinas de RNA', order: 1 },
  { subjectName: 'Biologia', name: 'Evolução e ecologia', description: 'Seleção natural, ciclos biogeoquímicos, biomas brasileiros', order: 2 },
  { subjectName: 'Biologia', name: 'Fisiologia humana', description: 'Sistemas digestório, circulatório, respiratório, nervoso, endócrino', order: 3 },
  { subjectName: 'Biologia', name: 'Microbiologia e imunologia', description: 'Vírus, bactérias, vacinas, doenças infecciosas', order: 4 },
  // Química
  { subjectName: 'Química', name: 'Estrutura atômica e tabela periódica', description: 'Modelos atômicos, propriedades periódicas, distribuição eletrônica', order: 0 },
  { subjectName: 'Química', name: 'Ligações e funções inorgânicas', description: 'Iônica, covalente, metálica, ácidos, bases, sais e óxidos', order: 1 },
  { subjectName: 'Química', name: 'Química orgânica', description: 'Funções orgânicas, hidrocarbonetos, isomeria, reações', order: 2 },
  { subjectName: 'Química', name: 'Estequiometria e soluções', description: 'Cálculos de reações, rendimento, concentração molar', order: 3 },
  { subjectName: 'Química', name: 'Termoquímica e eletroquímica', description: 'Calor de reação, pilhas, eletrólise', order: 4 },
  { subjectName: 'Química', name: 'Química ambiental', description: 'Poluição, efeito estufa, chuva ácida, camada de ozônio', order: 5 },
  // Física
  { subjectName: 'Física', name: 'Cinemática e dinâmica', description: 'MRU, MRUV, Leis de Newton, trabalho e energia mecânica', order: 0 },
  { subjectName: 'Física', name: 'Termologia e calorimetria', description: 'Temperatura, calor, dilatação térmica, gases ideais', order: 1 },
  { subjectName: 'Física', name: 'Óptica e ondulatória', description: 'Reflexão, refração, características das ondas, som', order: 2 },
  { subjectName: 'Física', name: 'Eletricidade e magnetismo', description: 'Circuitos elétricos, resistores, potência, campo magnético', order: 3 },
  // Matemática
  { subjectName: 'Matemática', name: 'Conjuntos e operações fundamentais', description: 'Operações com naturais, inteiros, racionais e reais', order: 0 },
  { subjectName: 'Matemática', name: 'Razão, proporção e porcentagem', description: 'Regra de três simples e composta, matemática financeira', order: 1 },
  { subjectName: 'Matemática', name: 'Funções (1º grau, 2º grau, exponencial)', description: 'Gráficos, raízes, máximos e mínimos', order: 2 },
  { subjectName: 'Matemática', name: 'Geometria plana e espacial', description: 'Áreas, volumes, prismas, cilindros, cones, esferas', order: 3 },
  { subjectName: 'Matemática', name: 'Trigonometria', description: 'Razões trigonométricas no triângulo retângulo e ciclo', order: 4 },
  { subjectName: 'Matemática', name: 'Estatística e probabilidade', description: 'Média, mediana, moda, desvio padrão, combinatória', order: 5 },
  { subjectName: 'Matemática', name: 'Leitura de gráficos e tabelas', description: 'Interpretação de dados estatísticos e proporcionalidade', order: 6 },
];

export function createInitialTopics(userId: string): Topic[] {
  const subjectMap = new Map(INITIAL_SUBJECTS.map(s => [s.name, s.id]));
  return INITIAL_TOPIC_TEMPLATES.map((item, idx) => ({
    id: `topic-${idx + 1}`,
    user_id: userId,
    subject_id: subjectMap.get(item.subjectName) || 'sub-pt',
    name: item.name,
    description: item.description,
    order_index: item.order,
    created_at: new Date().toISOString(),
  }));
}
