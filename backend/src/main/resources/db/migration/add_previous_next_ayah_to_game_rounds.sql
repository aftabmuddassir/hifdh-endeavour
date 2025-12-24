-- Migration: Add previous and next ayah columns to game_rounds table
-- Date: 2025-12-20
-- Description: Adds columns for storing previous and next ayah data for navigation

-- Add previous ayah columns
ALTER TABLE game_rounds
ADD COLUMN IF NOT EXISTS previous_ayat_number INTEGER;

ALTER TABLE game_rounds
ADD COLUMN IF NOT EXISTS previous_arabic_text TEXT;

ALTER TABLE game_rounds
ADD COLUMN IF NOT EXISTS previous_translation TEXT;

-- Add next ayah columns
ALTER TABLE game_rounds
ADD COLUMN IF NOT EXISTS next_ayat_number INTEGER;

ALTER TABLE game_rounds
ADD COLUMN IF NOT EXISTS next_arabic_text TEXT;

ALTER TABLE game_rounds
ADD COLUMN IF NOT EXISTS next_translation TEXT;

-- Add comments for documentation
COMMENT ON COLUMN game_rounds.previous_ayat_number IS 'Previous ayah number for navigation (guess_previous_ayat questions)';
COMMENT ON COLUMN game_rounds.previous_arabic_text IS 'Previous ayah Arabic text for navigation';
COMMENT ON COLUMN game_rounds.previous_translation IS 'Previous ayah translation for navigation';
COMMENT ON COLUMN game_rounds.next_ayat_number IS 'Next ayah number for navigation (guess_next_ayat questions)';
COMMENT ON COLUMN game_rounds.next_arabic_text IS 'Next ayah Arabic text for navigation';
COMMENT ON COLUMN game_rounds.next_translation IS 'Next ayah translation for navigation';
