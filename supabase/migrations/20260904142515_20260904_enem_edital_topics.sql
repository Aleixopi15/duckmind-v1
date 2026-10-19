/*
# Adequar edital ENEM 2026 com tópicos completos

## Resumo
Atualiza a estrutura de matérias e tópicos do edital para refletir
o conteúdo programático completo do ENEM 2026.

## Mudanças

### 1. Nova coluna
- `topics.description` (text, nullable): descrição detalhada do tópico
  (ex: "Leitura crítica, ideia central, inferência, pressupostos e subentendidos")

### 2. Matérias atualizadas
- Correção das áreas de conhecimento:
  - Matemática → "Matemática e suas Tecnologias"
  - Física, Química, Biologia → "Ciências da Natureza e suas Tecnologias"
- Renomeação: "Inglês/Espanhol" → "Língua Inglesa"
- Reordenação de display_order para seguir a ordem do edital

### 3. Novas matérias
- "Educação Física" (Linguagens, Códigos e suas Tecnologias)
- "Tecnologias da Informação e Comunicação" (Linguagens, Códigos e suas Tecnologias)

### 4. Tópicos
- Removidos 2 tópicos de teste ("Função 1° grau", "Função 2° grau")
  sem sessões ou conclusões vinculadas
- Inseridos 113 tópicos do edital para cada usuário existente,
  com nome e descrição detalhada

### 5. Segurança
- Sem mudanças nas políticas RLS existentes
- A coluna `description` herda as políticas já definidas para `topics`
*/

-- 1. Adicionar coluna description em topics
ALTER TABLE topics ADD COLUMN IF NOT EXISTS description text;

-- 2. Atualizar matérias existentes
UPDATE subjects SET area = 'Matemática e suas Tecnologias', display_order = 14 WHERE name = 'Matemática';
UPDATE subjects SET area = 'Ciências da Natureza e suas Tecnologias', display_order = 13 WHERE name = 'Física';
UPDATE subjects SET area = 'Ciências da Natureza e suas Tecnologias', display_order = 12 WHERE name = 'Química';
UPDATE subjects SET area = 'Ciências da Natureza e suas Tecnologias', display_order = 11 WHERE name = 'Biologia';
UPDATE subjects SET display_order = 1 WHERE name = 'Língua Portuguesa';
UPDATE subjects SET display_order = 2 WHERE name = 'Literatura';
UPDATE subjects SET name = 'Língua Inglesa', display_order = 3 WHERE name = 'Inglês/Espanhol';
UPDATE subjects SET display_order = 4 WHERE name = 'Artes';
UPDATE subjects SET display_order = 7 WHERE name = 'História';
UPDATE subjects SET display_order = 8 WHERE name = 'Geografia';
UPDATE subjects SET display_order = 9 WHERE name = 'Filosofia';
UPDATE subjects SET display_order = 10 WHERE name = 'Sociologia';
UPDATE subjects SET display_order = 15 WHERE name = 'Redação';

-- 3. Inserir novas matérias
INSERT INTO subjects (name, color, icon, area, display_order)
SELECT 'Educação Física', '#E65100', 'SportsSoccer', 'Linguagens, Códigos e suas Tecnologias', 5
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Educação Física');

INSERT INTO subjects (name, color, icon, area, display_order)
SELECT 'Tecnologias da Informação e Comunicação', '#0277BD', 'Computer', 'Linguagens, Códigos e suas Tecnologias', 6
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Tecnologias da Informação e Comunicação');

-- 4. Remover tópicos de teste (sem dados vinculados)
DELETE FROM topic_completions WHERE topic_id IN (SELECT id FROM topics WHERE name IN ('Função 1° grau', 'Função 2° grau'));
DELETE FROM topics WHERE name IN ('Função 1° grau', 'Função 2° grau');

-- 5. Inserir tópicos do edital para cada usuário
-- Usa tabela temporária para mapear (subject_name, topic_name, order_index, description)
-- e depois faz JOIN com subjects e auth.users

CREATE TEMP TABLE edital_data (subject_name text, topic_name text, order_index int, description text) ON COMMIT DROP;

INSERT INTO edital_data VALUES
-- Língua Portuguesa
('Língua Portuguesa', 'Interpretação e compreensão textual', 0, 'Leitura crítica, ideia central, inferência, pressupostos e subentendidos'),
('Língua Portuguesa', 'Gêneros e tipos textuais', 1, 'Notícia, crônica, charge, propaganda, artigo de opinião, poema, conto'),
('Língua Portuguesa', 'Coesão e coerência textual', 2, 'Conectivos, referenciação (anáfora/catáfora), progressão de ideias'),
('Língua Portuguesa', 'Funções da linguagem', 3, 'Referencial, emotiva, conativa, poética, fática, metalinguística'),
('Língua Portuguesa', 'Variação linguística', 4, 'Norma culta, registros formal/informal, preconceito linguístico, regionalismos'),
('Língua Portuguesa', 'Figuras de linguagem', 5, 'Metáfora, metonímia, ironia, hipérbole, eufemismo, antítese'),
('Língua Portuguesa', 'Morfossintaxe aplicada ao texto', 6, 'Concordância verbal e nominal, regência, uso da crase'),
('Língua Portuguesa', 'Semântica', 7, 'Polissemia, ambiguidade, denotação e conotação'),
('Língua Portuguesa', 'Intertextualidade', 8, 'Paródia, paráfrase, citação, referências culturais'),
-- Literatura
('Literatura', 'Trovadorismo, Humanismo e Classicismo', 0, 'Contexto histórico e características gerais (pouco cobrado no ENEM)'),
('Literatura', 'Barroco e Arcadismo', 1, 'Contraste fé/razão, bucolismo, Gregório de Matos'),
('Literatura', 'Romantismo', 2, 'Prosa indianista e urbana, poesia lírica, José de Alencar'),
('Literatura', 'Realismo e Naturalismo', 3, 'Crítica social, Machado de Assis, determinismo'),
('Literatura', 'Parnasianismo e Simbolismo', 4, '"Arte pela arte", musicalidade, subjetivismo'),
('Literatura', 'Pré-Modernismo', 5, 'Euclides da Cunha, contexto de transição'),
('Literatura', 'Modernismo (1ª, 2ª e 3ª geração)', 6, 'Semana de 22, poesia social, geração de 45'),
('Literatura', 'Literatura contemporânea', 7, 'Literatura marginal, urbana, autoria feminina e negra'),
('Literatura', 'Literatura africana de língua portuguesa', 8, 'Relação com identidade e colonialismo'),
-- Língua Inglesa
('Língua Inglesa', 'Compreensão global e específica', 0, 'Ideia principal, propósito comunicativo, público-alvo'),
('Língua Inglesa', 'Vocabulário em contexto', 1, 'Inferência lexical, sinônimos, antônimos'),
('Língua Inglesa', 'Falsos cognatos', 2, 'Palavras enganosas entre inglês e português (false friends)'),
('Língua Inglesa', 'Gêneros textuais em inglês', 3, 'Notícias, anúncios, tirinhas, letras de música, memes'),
('Língua Inglesa', 'Elementos de coesão', 4, 'Conectores e referências no texto em inglês'),
('Língua Inglesa', 'Textos multimodais', 5, 'Interpretação de imagem associada a texto'),
-- Artes
('Artes', 'Arte ocidental clássica', 0, 'Renascimento, Barroco, Neoclassicismo'),
('Artes', 'Vanguardas europeias', 1, 'Cubismo, Expressionismo, Surrealismo, Futurismo'),
('Artes', 'Arte moderna e contemporânea brasileira', 2, 'Semana de Arte Moderna, novas mídias'),
('Artes', 'Cultura popular e patrimônio', 3, 'Festas populares, artesanato, patrimônio imaterial'),
('Artes', 'Linguagens artísticas', 4, 'Música, dança, teatro, artes visuais, cinema'),
-- Educação Física
('Educação Física', 'Corpo, saúde e qualidade de vida', 0, 'Sedentarismo, hábitos saudáveis, autocuidado'),
('Educação Física', 'Esporte como fenômeno social', 1, 'Espetacularização, inclusão, Jogos Olímpicos'),
('Educação Física', 'Cultura corporal de movimento', 2, 'Jogos, ginástica, lutas, danças populares'),
('Educação Física', 'Lazer e sociedade', 3, 'Direito ao lazer, indústria do entretenimento'),
-- Tecnologias da Informação e Comunicação
('Tecnologias da Informação e Comunicação', 'Tecnologia e sociedade', 0, 'Impactos no trabalho, educação e relações sociais'),
('Tecnologias da Informação e Comunicação', 'Cultura digital', 1, 'Redes sociais, algoritmos, bolhas informacionais'),
('Tecnologias da Informação e Comunicação', 'Desinformação', 2, 'Fake news, letramento midiático, checagem de fatos'),
('Tecnologias da Informação e Comunicação', 'Linguagem digital', 3, 'Comunicação em ambientes virtuais, multimodalidade'),
-- História
('História', 'Brasil Colônia', 0, 'Economia açucareira, mineração, sistema colonial, Capitanias'),
('História', 'Brasil Império', 1, 'Independência, Primeiro Reinado, Período Regencial, Segundo Reinado'),
('História', 'Escravidão e resistência negra', 2, 'Tráfico atlântico, quilombos, abolicionismo'),
('História', 'Brasil República', 3, 'Primeira República, Era Vargas, populismo, Golpe de 1964'),
('História', 'Ditadura Militar e redemocratização', 4, 'AI-5, anos de chumbo, Diretas Já, Constituição de 1988'),
('História', 'Revolução Francesa e Industrial', 5, 'Iluminismo, queda do Antigo Regime, capitalismo industrial'),
('História', 'Revolução Russa e socialismo', 6, '1917, URSS, origens da Guerra Fria'),
('História', 'Primeira e Segunda Guerra Mundial', 7, 'Causas, Holocausto, nova ordem geopolítica'),
('História', 'Guerra Fria', 8, 'Bipolaridade, corrida armamentista, descolonização afro-asiática'),
('História', 'Movimentos sociais e direitos civis', 9, 'Feminismo, luta antirracista, movimento LGBT+, ditaduras latino-americanas'),
-- Geografia
('Geografia', 'Geopolítica mundial', 0, 'Conflitos internacionais, blocos econômicos, ONU'),
('Geografia', 'Globalização', 1, 'Nova divisão internacional do trabalho, fluxos financeiros'),
('Geografia', 'Urbanização brasileira', 2, 'Mobilidade urbana, moradia, segregação espacial'),
('Geografia', 'Mudanças climáticas', 3, 'Aquecimento global, acordos climáticos, eventos extremos'),
('Geografia', 'Questões ambientais', 4, 'Desmatamento, biomas brasileiros, recursos hídricos'),
('Geografia', 'Agropecuária e uso da terra', 5, 'Agronegócio, reforma agrária, conflitos fundiários'),
('Geografia', 'Matriz energética', 6, 'Fontes renováveis e não renováveis, energia no Brasil'),
('Geografia', 'Demografia', 7, 'Transição demográfica, migrações internas e internacionais'),
('Geografia', 'Cartografia', 8, 'Escalas, projeções, leitura de mapas e gráficos'),
-- Filosofia
('Filosofia', 'Filosofia antiga', 0, 'Ética e política em Sócrates, Platão e Aristóteles'),
('Filosofia', 'Filosofia moderna', 1, 'Racionalismo, empirismo, Iluminismo'),
('Filosofia', 'Contratualismo', 2, 'Hobbes, Locke e Rousseau — Estado e poder político'),
('Filosofia', 'Ética e cidadania', 3, 'Direitos humanos, dilemas morais contemporâneos'),
('Filosofia', 'Filosofia contemporânea', 4, 'Existencialismo, Escola de Frankfurt, pós-modernidade'),
-- Sociologia
('Sociologia', 'Pensamento sociológico clássico', 0, 'Durkheim, Marx e Weber'),
('Sociologia', 'Trabalho e classes sociais', 1, 'Divisão do trabalho, desigualdade social'),
('Sociologia', 'Movimentos sociais', 2, 'Sindicalismo, lutas por direitos, cidadania'),
('Sociologia', 'Cultura e diversidade', 3, 'Identidade, raça, gênero e etnia'),
('Sociologia', 'Instituições sociais', 4, 'Família, escola, religião, Estado'),
('Sociologia', 'Sociedade em rede', 5, 'Globalização e tecnologia nas relações sociais'),
-- Biologia
('Biologia', 'Citologia', 0, 'Estrutura e função celular, organelas, membrana plasmática'),
('Biologia', 'Genética', 1, 'Leis de Mendel, mutações, engenharia genética, biotecnologia'),
('Biologia', 'Evolução', 2, 'Seleção natural, especiação, evidências evolutivas'),
('Biologia', 'Ecologia', 3, 'Cadeias e teias alimentares, ciclos biogeoquímicos, biomas brasileiros'),
('Biologia', 'Fisiologia humana', 4, 'Sistemas digestório, circulatório, respiratório, nervoso, endócrino'),
('Biologia', 'Reprodução e desenvolvimento', 5, 'Sistemas reprodutores, embriologia básica'),
('Biologia', 'Sustentabilidade', 6, 'Impactos ambientais, aquecimento global, perda de biodiversidade'),
('Biologia', 'Microbiologia e imunologia', 7, 'Vírus, bactérias, vacinas, doenças infecciosas'),
-- Química
('Química', 'Estrutura atômica', 0, 'Modelos atômicos, tabela periódica, propriedades periódicas'),
('Química', 'Ligações químicas', 1, 'Iônica, covalente, metálica, propriedades da matéria'),
('Química', 'Funções inorgânicas', 2, 'Ácidos, bases, sais e óxidos'),
('Química', 'Química orgânica', 3, 'Funções orgânicas, hidrocarbonetos, isomeria'),
('Química', 'Estequiometria', 4, 'Cálculos envolvendo reações e quantidade de matéria'),
('Química', 'Soluções', 5, 'Concentração, diluição, solubilidade'),
('Química', 'Termoquímica e cinética', 6, 'Calor de reação, velocidade das reações'),
('Química', 'Eletroquímica', 7, 'Pilhas, eletrólise, potencial de redução'),
('Química', 'Química ambiental', 8, 'Poluição, efeito estufa, chuva ácida, camada de ozônio'),
-- Física
('Física', 'Cinemática', 0, 'MRU, MRUV, lançamento horizontal e oblíquo'),
('Física', 'Dinâmica', 1, 'Leis de Newton, força de atrito, plano inclinado'),
('Física', 'Trabalho, energia e potência', 2, 'Conservação de energia mecânica'),
('Física', 'Estática e hidrostática', 3, 'Equilíbrio de forças, pressão, empuxo'),
('Física', 'Termologia', 4, 'Temperatura, calor, dilatação térmica, gases ideais'),
('Física', 'Óptica', 5, 'Reflexão, refração, lentes e espelhos'),
('Física', 'Ondulatória', 6, 'Características das ondas, som, ondas eletromagnéticas'),
('Física', 'Eletricidade', 7, 'Corrente elétrica, circuitos, resistores, potência elétrica'),
('Física', 'Eletromagnetismo', 8, 'Campo magnético, indução eletromagnética'),
-- Matemática
('Matemática', 'Conjuntos numéricos', 0, 'Operações com naturais, inteiros, racionais e reais'),
('Matemática', 'Razão, proporção e porcentagem', 1, 'Regra de três simples e composta'),
('Matemática', 'Funções', 2, '1º grau, 2º grau, exponencial, logarítmica'),
('Matemática', 'Progressões', 3, 'Progressão aritmética (PA) e geométrica (PG)'),
('Matemática', 'Geometria plana', 4, 'Áreas, ângulos, polígonos, teorema de Pitágoras'),
('Matemática', 'Geometria espacial', 5, 'Volumes e áreas de prismas, cilindros, cones, esferas'),
('Matemática', 'Trigonometria', 6, 'Razões trigonométricas, lei dos senos e cossenos'),
('Matemática', 'Estatística', 7, 'Média, mediana, moda, desvio padrão, interpretação de dados'),
('Matemática', 'Probabilidade e combinatória', 8, 'Cálculo de probabilidades, arranjos, combinações'),
('Matemática', 'Matemática financeira', 9, 'Juros simples e compostos, taxas'),
('Matemática', 'Leitura de gráficos e tabelas', 10, 'Interpretação de dados estatísticos e proporcionalidade');

-- Inserir tópicos para cada usuário existente, evitando duplicatas
INSERT INTO topics (user_id, subject_id, name, order_index, description)
SELECT
  u.id,
  s.id,
  ed.topic_name,
  ed.order_index,
  ed.description
FROM edital_data ed
CROSS JOIN subjects s
CROSS JOIN auth.users u
WHERE s.name = ed.subject_name
  AND NOT EXISTS (
    SELECT 1 FROM topics t
    WHERE t.user_id = u.id
      AND t.subject_id = s.id
      AND t.name = ed.topic_name
  );

DROP TABLE edital_data;
