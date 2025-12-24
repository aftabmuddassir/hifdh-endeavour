-- Migration: Add consecutive_correct_answers column to game_participants table
-- Date: 2025-12-22
-- Description: Adds consecutive_correct_answers column to track accuracy streaks for bonus points

-- Add consecutive_correct_answers column if it doesn't exist
ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS consecutive_correct_answers INTEGER DEFAULT 0;

-- Make the column NOT NULL after setting default values
ALTER TABLE game_participants ALTER COLUMN consecutive_correct_answers SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN game_participants.consecutive_correct_answers IS 'Number of consecutive correct answers for streak bonuses';
