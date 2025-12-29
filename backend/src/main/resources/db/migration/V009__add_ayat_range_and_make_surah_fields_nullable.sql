-- Migration: Add ayat range fields and make surah fields nullable
-- Date: 2025-12-28
-- Description: Allows juz-based filtering (surah fields nullable) and adds optional ayat range filtering

-- Make surah_range_start and surah_range_end nullable (for juz-based selection)
ALTER TABLE game_sessions
ALTER COLUMN surah_range_start DROP NOT NULL;

ALTER TABLE game_sessions
ALTER COLUMN surah_range_end DROP NOT NULL;

-- Add optional ayat range fields
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS from_ayat INTEGER;

ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS to_ayat INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN game_sessions.surah_range_start IS 'Start surah for range-based selection (nullable when juz is used)';
COMMENT ON COLUMN game_sessions.surah_range_end IS 'End surah for range-based selection (nullable when juz is used)';
COMMENT ON COLUMN game_sessions.from_ayat IS 'Optional: Starting ayah number within the start surah';
COMMENT ON COLUMN game_sessions.to_ayat IS 'Optional: Ending ayah number within the end surah';
