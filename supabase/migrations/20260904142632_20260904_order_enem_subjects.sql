/*
# Corrigir ordem das matérias do ENEM

## Resumo
Ajusta apenas a ordem de exibição das matérias para que Redação fique
junto das demais matérias de Linguagens e as áreas apareçam em sequência.

## Alterações
- Redação passa a ocupar a posição 7.
- História, Geografia, Filosofia, Sociologia, Biologia, Química, Física e Matemática
  são deslocadas uma posição para manter a ordem do edital.
- Nenhum tópico, sessão de estudo, conclusão ou dado do usuário é removido.
- Nenhuma política de segurança é alterada.
*/

UPDATE subjects SET display_order = CASE name
  WHEN 'Língua Portuguesa' THEN 1
  WHEN 'Literatura' THEN 2
  WHEN 'Língua Inglesa' THEN 3
  WHEN 'Artes' THEN 4
  WHEN 'Educação Física' THEN 5
  WHEN 'Tecnologias da Informação e Comunicação' THEN 6
  WHEN 'Redação' THEN 7
  WHEN 'História' THEN 8
  WHEN 'Geografia' THEN 9
  WHEN 'Filosofia' THEN 10
  WHEN 'Sociologia' THEN 11
  WHEN 'Biologia' THEN 12
  WHEN 'Química' THEN 13
  WHEN 'Física' THEN 14
  WHEN 'Matemática' THEN 15
  ELSE display_order
END;
