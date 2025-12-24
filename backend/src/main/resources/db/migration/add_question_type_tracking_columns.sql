-- Migration: Add question type tracking columns to game_sessions table
-- Date: 2025-12-19
-- Description: Adds columns for tracking selected question types, current verse, and asked questions

-- Add selected_question_types column
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS selected_question_types VARCHAR(500);

-- Add current_surah_number column
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS current_surah_number INTEGER;

-- Add current_ayat_number column
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS current_ayat_number INTEGER;

-- Add asked_question_types column
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS asked_question_types VARCHAR(500);

-- Add comments for documentation
COMMENT ON COLUMN game_sessions.selected_question_types IS 'Comma-separated list of enabled question types for this game';
COMMENT ON COLUMN game_sessions.current_surah_number IS 'Current surah number being used for questions';
COMMENT ON COLUMN game_sessions.current_ayat_number IS 'Current ayat number being used for questions';
COMMENT ON COLUMN game_sessions.asked_question_types IS 'Comma-separated list of questions asked for current verse';
