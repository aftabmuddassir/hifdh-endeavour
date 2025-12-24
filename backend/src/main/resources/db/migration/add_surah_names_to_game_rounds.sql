-- Migration: Add surah name columns to game_rounds table
-- Date: 2025-12-20
-- Description: Adds columns for storing surah names (Arabic and English) in game rounds

-- Add surah_name_arabic column
ALTER TABLE game_rounds
ADD COLUMN IF NOT EXISTS surah_name_arabic VARCHAR(100);

-- Add surah_name_english column
ALTER TABLE game_rounds
ADD COLUMN IF NOT EXISTS surah_name_english VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN game_rounds.surah_name_arabic IS 'Arabic name of the surah for this round';
COMMENT ON COLUMN game_rounds.surah_name_english IS 'English name of the surah for this round';
