-- Migration: Create or update buzzer_presses table
-- Date: 2025-12-20
-- Description: Ensures buzzer_presses table exists with all required fields for player game functionality

-- Create table with minimal structure if it doesn't exist
CREATE TABLE IF NOT EXISTS buzzer_presses (
    id BIGSERIAL PRIMARY KEY,
    round_id BIGINT NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
    participant_id BIGINT NOT NULL REFERENCES game_participants(id) ON DELETE CASCADE
);

-- Add columns if they don't exist
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS buzz_rank INTEGER;
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS buzzed_at_seconds DECIMAL(6,3);
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS pressed_at TIMESTAMP DEFAULT NOW();
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS got_chance_to_answer BOOLEAN DEFAULT false;
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS answer_text TEXT NULL;
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS answer_submitted_at TIMESTAMP NULL;
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS is_correct BOOLEAN NULL;
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS points_awarded INTEGER DEFAULT 0;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'buzzer_presses_round_id_participant_id_key'
    ) THEN
        ALTER TABLE buzzer_presses
        ADD CONSTRAINT buzzer_presses_round_id_participant_id_key
        UNIQUE(round_id, participant_id);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_buzzer_round ON buzzer_presses(round_id);
CREATE INDEX IF NOT EXISTS idx_buzzer_rank ON buzzer_presses(round_id, buzz_rank);
CREATE INDEX IF NOT EXISTS idx_buzzer_participant ON buzzer_presses(participant_id);

-- Add comments for documentation
COMMENT ON TABLE buzzer_presses IS 'Records of player buzzer presses during game rounds';
COMMENT ON COLUMN buzzer_presses.buzz_rank IS 'Position in buzz order (1 = first, 2 = second, etc.)';
COMMENT ON COLUMN buzzer_presses.buzzed_at_seconds IS 'Time in seconds from round start when player buzzed (e.g., 4.523)';
COMMENT ON COLUMN buzzer_presses.got_chance_to_answer IS 'True if player got to answer (based on buzz rank)';
COMMENT ON COLUMN buzzer_presses.answer_text IS 'Optional typed answer from player (NULL if only spoken)';
COMMENT ON COLUMN buzzer_presses.is_correct IS 'NULL until admin validates, then true/false';
COMMENT ON COLUMN buzzer_presses.points_awarded IS 'Points awarded for this buzz (0 if wrong, calculated if correct)';
