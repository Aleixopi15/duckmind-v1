export type EixoTematico =
  | 'cidadania'
  | 'tecnologia'
  | 'meio_ambiente'
  | 'saude'
  | 'educacao'
  | 'seguranca'
  | 'trabalho';

export type TipoRepertorio =
  | 'filosofia_sociologia'
  | 'legislacao'
  | 'literatura'
  | 'cinema_midia'
  | 'historia_fatos';

export type RepertorioItem = {
  id: string;
  autorOuObra: string;
  tituloConceito: string;
  eixo: EixoTematico;
  tipo: TipoRepertorio;
  anoOuOrigem?: string;
  conceito: string;
  citacao?: string;
  comoUsar: string;
  palavrasChave: string[];
  isCustom?: boolean;
};

export const EIXOS_CONFIG: Record<EixoTematico, { label: string; icon: string; cor: string; desc: string }> = {
  cidadania: {
    label: 'Cidadania & Minorias',
    icon: 'Users',
    cor: '#8B5CF6',
    desc: 'Direitos humanos, racismo, inclusão, invisibilidade social, mulheres e povos originários',
  },
  tecnologia: {
    label: 'Tecnologia & Sociedade',
    icon: 'Cpu',
    cor: '#0284C7',
    desc: 'Inteligência artificial, redes sociais, privacidade, dados, algoritmos e inclusão digital',
  },
  meio_ambiente: {
    label: 'Meio Ambiente & Clima',
    icon: 'Globe',
    cor: '#10B981',
    desc: 'Sustentabilidade, aquecimento global, recursos hídricos, desmatamento e povos da floresta',
  },
  saude: {
    label: 'Saúde & Bem-Estar',
    icon: 'HeartPulse',
    cor: '#EF4444',
    desc: 'Saúde mental, SUS, epidemias, sedentarismo, nutrição e bem-estar coletivo',
  },
  educacao: {
    label: 'Educação & Cultura',
    icon: 'GraduationCap',
    cor: '#F59E0B',
    desc: 'Evasão escolar, letramento, pensamento crítico, patrimônio cultural e acesso à leitura',
  },
  seguranca: {
    label: 'Segurança & Ética',
    icon: 'Shield',
    cor: '#6366F1',
    desc: 'Violência urbana, linchamento virtual, justiça, sistema prisional e desinformação',
  },
  trabalho: {
    label: 'Trabalho & Economia',
    icon: 'Scale',
    cor: '#EC4899',
    desc: 'Uberização, informalidade, inteligência artificial no emprego e desigualdade de renda',
  },
};

export const TIPOS_CONFIG: Record<TipoRepertorio, { label: string; corBadge: string }> = {
  filosofia_sociologia: { label: 'Filosofia & Sociologia', corBadge: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300' },
  legislacao: { label: 'Legislação & Leis', corBadge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  literatura: { label: 'Literatura & Livros', corBadge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  cinema_midia: { label: 'Cinema & Mídia', corBadge: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300' },
  historia_fatos: { label: 'História & Fatos', corBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
};

export const INITIAL_REPERTORIOS: RepertorioItem[] = [
  // CIDADANIA & MINORIAS
  {
    id: 'rep-cid-1',
    autorOuObra: 'Gilberto Dimenstein',
    tituloConceito: 'O Cidadão de Papel',
    eixo: 'cidadania',
    tipo: 'literatura',
    anoOuOrigem: '1993',
    conceito: 'Mostra o abismo entre os direitos garantidos na Constituição e a sua efetiva aplicação prática no cotidiano dos brasileiros.',
    citacao: 'Os direitos dos cidadãos existem formalmente no papel, mas grande parte da população permanece desamparada na vida real.',
    comoUsar: 'Ideal para contrastar na introdução ou D1: aponte que, embora a lei preveja a proteção aos grupos vulneráveis, na prática o indivíduo permanece como um "cidadão de papel".',
    palavrasChave: ['constituição', 'direitos', 'negligência', 'desigualdade', 'leis ineficazes'],
  },
  {
    id: 'rep-cid-2',
    autorOuObra: 'Zygmunt Bauman',
    tituloConceito: 'Vidas Desperdiçadas & Cegueira Moral',
    eixo: 'cidadania',
    tipo: 'filosofia_sociologia',
    conceito: 'Analisa como o modelo capitalista contemporâneo produz "refugos humanos" — populações marginalizadas que são tornadas invisíveis e descartáveis pelo resto da sociedade.',
    citacao: 'Não há nada mais degradante para a condição humana do que a indiferença moral diante do sofrimento alheio.',
    comoUsar: 'Utilize para fundamentar a negligência social e a invisibilidade de minorias (como pessoas em situação de rua, povos indígenas ou trabalhadores invisíveis).',
    palavrasChave: ['invisibilidade', 'marginalização', 'indiferença', 'modernidade líquida'],
  },
  {
    id: 'rep-cid-3',
    autorOuObra: 'Constituição Federal de 1988',
    tituloConceito: 'Artigo 5º — Isonomia e Dignidade da Pessoa Humana',
    eixo: 'cidadania',
    tipo: 'legislacao',
    anoOuOrigem: 'Brasil, 1988',
    conceito: 'Estabelece que todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se a inviolabilidade do direito à vida, à liberdade e à igualdade.',
    citacao: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.',
    comoUsar: 'Repertório curinga: use para abrir a introdução provando que o tema em debate rompe com a cláusula pétrea de igualdade garantida pela Carta Magna de 1988.',
    palavrasChave: ['constituição', 'cidadania', 'artigo 5', 'igualdade', 'carta magna'],
  },
  {
    id: 'rep-cid-4',
    autorOuObra: 'Hannah Arendt',
    tituloConceito: 'A Banalidade do Mal',
    eixo: 'cidadania',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1963',
    conceito: 'Explica como atrocidades e violências sociais deixam de causar espanto e passam a ser aceitas como parte normal da rotina quando a sociedade para de refletir criticamente.',
    citacao: 'O maior mal do mundo é o mal cometido por ninguém, por seres humanos que se recusam a ser pessoas.',
    comoUsar: 'Perfeito para problematizar a naturalização de preconceitos, racismo velado, capacitismo ou a aceitação passiva da desigualdade pela sociedade.',
    palavrasChave: ['naturalização', 'banalização', 'preconceito', 'passividade social'],
  },
  {
    id: 'rep-cid-5',
    autorOuObra: 'Graciliano Ramos',
    tituloConceito: 'Vidas Secas (Fabiano e a linguagem)',
    eixo: 'cidadania',
    tipo: 'literatura',
    anoOuOrigem: '1938',
    conceito: 'A animalização do sertanejo Fabiano e de sua família decorre da miséria e da privação da educação e da palavra, reduzindo sua humanidade.',
    citacao: 'Fabiano sentia-se homem apenas quando montava a cavalo; no resto do tempo, via-se como bicho.',
    comoUsar: 'Argumente sobre a falta de acesso a direitos básicos, analfabetismo ou invisibilidade que desumaniza cidadãos e os impede de exercer plena voz ativa.',
    palavrasChave: ['desumanização', 'sertão', 'educação', 'miséria', 'opressão'],
  },

  // TECNOLOGIA & SOCIEDADE
  {
    id: 'rep-tec-1',
    autorOuObra: 'Shoshana Zuboff',
    tituloConceito: 'O Capitalismo de Vigilância',
    eixo: 'tecnologia',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '2019',
    conceito: 'Descreve como grandes empresas de tecnologia capturam a experiência humana como matéria-prima de dados para prever e modificar o comportamento dos usuários.',
    citacao: 'Se antes o capitalismo explorava a natureza, hoje ele coloniza as profundezas do comportamento e da privacidade humana.',
    comoUsar: 'Use em temas sobre privacidade digital, inteligência artificial, vícios em redes sociais, manipulação eleitoral ou hiperconsumismo induzido por algoritmos.',
    palavrasChave: ['dados', 'algoritmos', 'privacidade', 'redes sociais', 'manipulação'],
  },
  {
    id: 'rep-tec-2',
    autorOuObra: 'Byung-Chul Han',
    tituloConceito: 'A Sociedade do Cansaço & No Enxame',
    eixo: 'tecnologia',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '2010',
    conceito: 'Analisa como o excesso de estímulos digitais e a cobrança contínua por positividade e autoexploração geram esgotamento mental e solidão conectada.',
    citacao: 'A sociedade do século XXI não é mais disciplinar, mas uma sociedade de desempenho que explora a si mesma voluntariamente.',
    comoUsar: 'Excelente para temas que envolvam impactos psicológicos das redes sociais, comparação social, síndrome de burnout e ansiedade digital entre jovens.',
    palavrasChave: ['cansaço', 'desempenho', 'redes sociais', 'ansiedade', 'autoexploração'],
  },
  {
    id: 'rep-tec-3',
    autorOuObra: 'Série Black Mirror',
    tituloConceito: 'Episódio "Queda Livre" (Nosedive)',
    eixo: 'tecnologia',
    tipo: 'cinema_midia',
    anoOuOrigem: '2016',
    conceito: 'Retrata uma distopia onde o valor social, o crédito e as oportunidades de um indivíduo dependem das avaliações que ele recebe constantemente em um aplicativo.',
    comoUsar: 'Em temas de cultura do cancelamento, validação digital, futilidade das aparências online ou discriminação algorítmica.',
    palavrasChave: ['cancelamento', 'validação virtual', 'algoritmo', 'distopia'],
  },
  {
    id: 'rep-tec-4',
    autorOuObra: 'Pierre Lévy',
    tituloConceito: 'Cibercultura e Inteligência Coletiva',
    eixo: 'tecnologia',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1997',
    conceito: 'Demonstra que a internet tem potencial de democratizar o saber e unir saberes dispersos, mas requer letramento digital para não virar vetor de isolamento e fake news.',
    comoUsar: 'Para pontuar o contraste: a tecnologia possui imenso poder democratizante, porém a ausência de educação digital converte esse potencial em desinformação e polarização.',
    palavrasChave: ['democratização', 'letramento digital', 'desinformação', 'cibercultura'],
  },

  // MEIO AMBIENTE & SUSTENTABILIDADE
  {
    id: 'rep-amb-1',
    autorOuObra: 'Ailton Krenak',
    tituloConceito: 'Ideias para Adiar o Fim do Mundo',
    eixo: 'meio_ambiente',
    tipo: 'literatura',
    anoOuOrigem: '2019',
    conceito: 'Critica a ilusão da humanidade moderna de se enxergar como separada e superior à natureza, tratando o planeta apenas como estoque de recursos a serem esgotados.',
    citacao: 'A modernidade separou a humanidade da Terra, como se a Terra fosse um cenário e nós, os atores principais.',
    comoUsar: 'Fundamental em temas de desmatamento, crise climática, consumo predatório e desrespeito às terras indígenas e comunidades tradicionais.',
    palavrasChave: ['indígena', 'crise climática', 'natureza', 'sustentabilidade', 'antropoceno'],
  },
  {
    id: 'rep-amb-2',
    autorOuObra: 'Constituição Federal de 1988',
    tituloConceito: 'Artigo 225 — Meio Ambiente Ecologicamente Equilibrado',
    eixo: 'meio_ambiente',
    tipo: 'legislacao',
    anoOuOrigem: 'Brasil, 1988',
    conceito: 'Consagra o direito de todos ao meio ambiente ecologicamente equilibrado, bem de uso comum do povo e essencial à sadia qualidade de vida, impondo ao Poder Público e à coletividade o dever de defendê-lo.',
    citacao: 'Todos têm direito ao meio ambiente ecologicamente equilibrado, impondo-se ao Poder Público e à coletividade o dever de preservá-lo para as presentes e futuras gerações.',
    comoUsar: 'Repertório de peso constitucional: use na introdução para comprovar o dever conjunto do Estado e da sociedade civil na preservação ambiental.',
    palavrasChave: ['artigo 225', 'futuras gerações', 'constituição', 'preservação'],
  },
  {
    id: 'rep-amb-3',
    autorOuObra: 'Hans Jonas',
    tituloConceito: 'O Princípio Responsabilidade',
    eixo: 'meio_ambiente',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1979',
    conceito: 'Propõe uma nova ética humana: agir de forma que os efeitos das nossas ações presentes não destruam a possibilidade de uma vida digna para as futuras gerações.',
    citacao: 'Aja de tal modo que os efeitos de tua ação sejam compatíveis com a permanência de uma vida humana autêntica sobre a Terra.',
    comoUsar: 'Aplique para justificar a urgência da transição ecológica, combate ao plástico, transição energética e políticas públicas de longo prazo.',
    palavrasChave: ['futuras gerações', 'ética ambiental', 'sustentabilidade', 'responsabilidade'],
  },
  {
    id: 'rep-amb-4',
    autorOuObra: 'Davi Kopenawa & Bruce Albert',
    tituloConceito: 'A Queda do Céu',
    eixo: 'meio_ambiente',
    tipo: 'literatura',
    anoOuOrigem: '2010',
    conceito: 'O xamã Yanomami denuncia a "febre da mercadoria" dos garimpeiros e da sociedade industrial, alertando que a destruição das florestas precipitará o colapso da biosfera.',
    comoUsar: 'Em temas de garimpo ilegal, preservação da Amazônia, saberes ancestrais e impactos do extrativismo desenfreado.',
    palavrasChave: ['yanomami', 'garimpo', 'floresta', 'ancestralidade'],
  },

  // SAÚDE & BEM-ESTAR
  {
    id: 'rep-sau-1',
    autorOuObra: 'Constituição Federal de 1988',
    tituloConceito: 'Artigo 196 — A Saúde como Direito de Todos e Dever do Estado',
    eixo: 'saude',
    tipo: 'legislacao',
    anoOuOrigem: 'Brasil, 1988',
    conceito: 'Fundamento que deu origem ao Sistema Único de Saúde (SUS), garantindo o acesso universal e igualitário às ações e serviços de saúde.',
    citacao: 'A saúde é direito de todos e dever do Estado, garantido mediante políticas sociais e econômicas.',
    comoUsar: 'Excelente repertório jurídico para iniciar redações sobre desabastecimento hospitalar, vacinação, saneamento básico ou saúde pública.',
    palavrasChave: ['sus', 'artigo 196', 'saúde pública', 'direito universal'],
  },
  {
    id: 'rep-sau-2',
    autorOuObra: 'Organização Mundial da Saúde (OMS)',
    tituloConceito: 'Conceito Holístico de Saúde (1946)',
    eixo: 'saude',
    tipo: 'legislacao',
    anoOuOrigem: '1946',
    conceito: 'Define a saúde não apenas como a ausência de doença ou enfermidade, mas como um completo estado de bem-estar físico, mental e social.',
    comoUsar: 'Use para provar que a falta de lazer, a precariedade do trabalho ou a solidão urbana já configuram uma crise de saúde segundo a própria OMS.',
    palavrasChave: ['oms', 'bem-estar físico e mental', 'saúde integral', 'prevenção'],
  },
  {
    id: 'rep-sau-3',
    autorOuObra: 'Andrew Solomon',
    tituloConceito: 'O Demônio do Meio-Dia: Uma Anatomia da Depressão',
    eixo: 'saude',
    tipo: 'literatura',
    anoOuOrigem: '2001',
    conceito: 'Desmistifica a depressão e os transtornos psíquicos, mostrando como o preconceito social agrava o isolamento e impede a busca por tratamento adequado.',
    comoUsar: 'Perfeito para temas sobre saúde mental de jovens, suicídio, estigma das doenças psicológicas e necessidade de psicólogos nas escolas e postos de saúde.',
    palavrasChave: ['saúde mental', 'depressão', 'estigma', 'psicologia'],
  },
  {
    id: 'rep-sau-4',
    autorOuObra: 'Michel Foucault',
    tituloConceito: 'Biopolítica & O Nascimento da Medicina Social',
    eixo: 'saude',
    tipo: 'filosofia_sociologia',
    conceito: 'Estuda como o Estado moderno passa a gerir a vida, a natalidade e a mortalidade das populações, podendo criar políticas higienistas ou de abandono de corpos vulneráveis.',
    comoUsar: 'Para denunciar o saneamento básico deficiente nas periferias ou o descaso estatal com populações historicamente desfavorecidas.',
    palavrasChave: ['biopolítica', 'foucault', 'corpos', 'saneamento', 'abandono'],
  },

  // EDUCAÇÃO & CULTURA
  {
    id: 'rep-edu-1',
    autorOuObra: 'Paulo Freire',
    tituloConceito: 'Pedagogia da Autonomia & Educação Libertadora',
    eixo: 'educacao',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1996',
    conceito: 'Defende que ensinar não é transferir conhecimento passivo (educação bancária), mas criar as possibilidades para a própria produção e leitura crítica do mundo.',
    citacao: 'Se a educação sozinha não transforma a sociedade, sem ela tampouco a sociedade muda.',
    comoUsar: 'Repertório clássico para temas educacionais: aponte que a escola deve formar cidadãos conscientes e críticos, e não apenas meros repetidores de tarefas.',
    palavrasChave: ['paulo freire', 'educação crítica', 'emancipação', 'cidadania'],
  },
  {
    id: 'rep-edu-2',
    autorOuObra: 'Darcy Ribeiro',
    tituloConceito: 'O Projeto de Crise na Educação Brasileira',
    eixo: 'educacao',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1982',
    conceito: 'Afirma que o descaso histórico com a educação pública no Brasil não é um acidente ou incompetência ingênua, mas um projeto deliberado das elites para manter a dominação social.',
    citacao: 'A crise da educação no Brasil não é uma crise; é um projeto.',
    comoUsar: 'Excelente para fundamentar a inércia governamental e a falta de investimentos estruturais nas escolas públicas do país.',
    palavrasChave: ['darcy ribeiro', 'crise como projeto', 'escola pública', 'elites'],
  },
  {
    id: 'rep-edu-3',
    autorOuObra: 'Pierre Bourdieu',
    tituloConceito: 'Capital Cultural e Reprodução Social',
    eixo: 'educacao',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1970',
    conceito: 'Demonstra que a escola muitas vezes perpetua a desigualdade ao valorizar apenas a bagagem cultural das classes mais abastadas, excluindo quem não teve essa herança.',
    comoUsar: 'Use para justificar por que o acesso a museus, livros e internet de qualidade nas periferias é essencial para nivelar as oportunidades no vestibular e na vida.',
    palavrasChave: ['capital cultural', 'reprodução social', 'desigualdade educacional'],
  },
  {
    id: 'rep-edu-4',
    autorOuObra: 'Immanuel Kant',
    tituloConceito: 'Sobre a Pedagogia',
    eixo: 'educacao',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1803',
    conceito: 'O filósofo iluminista defende que a humanidade só alcança sua verdadeira plenitude moral e racional por meio da educação e do cultivo do saber.',
    citacao: 'O homem não é nada além daquilo que a educação faz dele.',
    comoUsar: 'Citação ágil para a introdução: use para introduzir a importância transformadora do conhecimento no combate a problemas sociais.',
    palavrasChave: ['kant', 'iluminismo', 'formação humana', 'moral'],
  },

  // SEGURANÇA PÚBLICA & ÉTICA
  {
    id: 'rep-seg-1',
    autorOuObra: 'Thomas Hobbes',
    tituloConceito: 'O Leviatã & O Contrato Social',
    eixo: 'seguranca',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1651',
    conceito: 'Defende que os indivíduos abrem mão de parte de sua liberdade para instituir o Estado soberano, que tem como obrigação primária garantir a segurança e a ordem pacífica.',
    citacao: 'O homem é o lobo do próprio homem na ausência de leis e de uma autoridade que assegure a paz.',
    comoUsar: 'Para denunciar que a violência desenfreada e a criminalidade configuram quebra do contrato social e falha na principal razão de existência do Estado.',
    palavrasChave: ['contrato social', 'hobbes', 'leviatã', 'ordem', 'violência'],
  },
  {
    id: 'rep-seg-2',
    autorOuObra: 'Émile Durkheim',
    tituloConceito: 'Anomia Social & Quebra da Coesão',
    eixo: 'seguranca',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1893',
    conceito: 'O estado de "anomia" ocorre quando as regras sociais e morais perdem sua eficácia, gerando desordem, desconfiança institucional e aumento da delinquência.',
    comoUsar: 'Use para analisar por que o descrédito nas instituições policiais ou judiciais leva a práticas violentas e linchamentos virtuais/reais.',
    palavrasChave: ['anomia', 'durkheim', 'desordem', 'regras sociais', 'desconfiança'],
  },

  // TRABALHO & ECONOMIA
  {
    id: 'rep-tra-1',
    autorOuObra: 'Ricardo Antunes',
    tituloConceito: 'O Privilégio da Servidão & A Uberização do Trabalho',
    eixo: 'trabalho',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '2018',
    conceito: 'Analisa como o trabalho mediado por aplicativos e plataformas disfarça a exploração sob o mito do "empreendedor de si mesmo", retirando direitos previdenciários e trabalhistas.',
    comoUsar: 'Fundamental em temas sobre informalidade, novas relações de trabalho, inteligência artificial e precarização de entregadores e motoristas.',
    palavrasChave: ['uberização', 'precarização', 'trabalho informal', 'aplicativos'],
  },
  {
    id: 'rep-tra-2',
    autorOuObra: 'Constituição Federal de 1988',
    tituloConceito: 'Artigo 7º — Direitos Sociais dos Trabalhadores',
    eixo: 'trabalho',
    tipo: 'legislacao',
    anoOuOrigem: 'Brasil, 1988',
    conceito: 'Elenca os direitos dos trabalhadores urbanos e rurais que visam à melhoria de sua condição social, como salário mínimo digno, jornada limitada e segurança do trabalho.',
    comoUsar: 'Contraste com a realidade de jornadas abusivas, trabalho análogo à escravidão e falta de garantias na economia informal contemporânea.',
    palavrasChave: ['artigo 7', 'clt', 'trabalho digno', 'direitos trabalhistas'],
  },
  {
    id: 'rep-tra-3',
    autorOuObra: 'Karl Marx',
    tituloConceito: 'Alienação do Trabalho',
    eixo: 'trabalho',
    tipo: 'filosofia_sociologia',
    anoOuOrigem: '1844',
    conceito: 'No processo produtivo capitalista, o trabalhador se torna estranho ao produto que cria, perdendo a conexão criativa e humana com a própria atividade.',
    comoUsar: 'Ideal para temas sobre desumanização nas fábricas ou escritórios, sobrecarga de metas e perda de sentido no trabalho contemporâneo.',
    palavrasChave: ['alienação', 'marx', 'exploração', 'produção'],
  },
];
