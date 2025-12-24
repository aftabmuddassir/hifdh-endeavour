-- Migration: Add player game configuration fields to game_sessions
-- Date: 2025-12-20
-- Description: Adds fields for audio mode, round limits, and answer text configuration

-- Add audio mode configuration
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS audio_mode VARCHAR(20) DEFAULT 'ALL_DEVICES';

-- Add round limit (NULL = unlimited rounds)
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS round_limit INTEGER NULL;

-- Add text answer configuration
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS allow_text_answers BOOLEAN DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN game_sessions.audio_mode IS 'Audio playback mode: ALL_DEVICES (each player device) or HOST_ONLY (admin device only)';
COMMENT ON COLUMN game_sessions.round_limit IS 'Maximum number of rounds for this game session (NULL = unlimited)';
COMMENT ON COLUMN game_sessions.allow_text_answers IS 'Whether players can type their answers (in addition to speaking)';
