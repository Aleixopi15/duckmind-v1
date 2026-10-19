-- Migration: Enhance simulations table for ENEM formats, single area, duration, and exam metadata
-- Run this in Supabase SQL Editor if using real Supabase

ALTER TABLE simulations 
  ADD COLUMN IF NOT EXISTS simulation_type text DEFAULT 'completo',
  ADD COLUMN IF NOT EXISTS target_area text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS exam_source text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS questions_total integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS questions_correct integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS perceived_difficulty text DEFAULT NULL;

COMMENT ON COLUMN simulations.simulation_type IS 'Format: completo, dia_1, dia_2, area_unica, personalizado';
COMMENT ON COLUMN simulations.target_area IS 'Area for single-area simulations: languages, humanities, natural_sciences, math, essay';
COMMENT ON COLUMN simulations.duration_minutes IS 'Total time spent doing the simulation in minutes';
COMMENT ON COLUMN simulations.exam_source IS 'Source or institution: ENEM 2024, SAS, Bernoulli, Poliedro, etc.';
COMMENT ON COLUMN simulations.questions_total IS 'Total number of questions in this simulation';
COMMENT ON COLUMN simulations.questions_correct IS 'Total correct questions';
COMMENT ON COLUMN simulations.perceived_difficulty IS 'Perceived difficulty: facil, medio, dificil, muito_dificil';
