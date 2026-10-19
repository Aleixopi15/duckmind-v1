/*
# Add Artes subject to ENEM subjects

## Summary
Inserts the "Artes" subject into the subjects table under "Linguagens, Códigos e suas Tecnologias" area, matching the ENEM curriculum.

## Modified Tables
- subjects (INSERT only, idempotent via ON CONFLICT)
*/

INSERT INTO subjects (name, color, icon, area, display_order) VALUES
  ('Artes', '#E91E63', 'Palette', 'Linguagens, Códigos e suas Tecnologias', 13)
ON CONFLICT DO NOTHING;
