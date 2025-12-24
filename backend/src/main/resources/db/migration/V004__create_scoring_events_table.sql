-- Migration: Create scoring_events table
-- Date: 2025-12-20
-- Description: Detailed points breakdown for each correct answer (optional but recommended for analytics)

CREATE TABLE IF NOT EXISTS scoring_events (
    id BIGSERIAL PRIMARY KEY,
    round_id BIGINT REFERENCES game_rounds(id) ON DELETE CASCADE,
    participant_id BIGINT REFERENCES game_participants(id) ON DELETE CASCADE,

    -- Points breakdown
    base_points INTEGER NOT NULL,
    time_multiplier DECIMAL(3,2) DEFAULT 1.0,
    time_bonus_points INTEGER DEFAULT 0,
    buzz_rank_bonus INTEGER DEFAULT 0,
    bonus_points INTEGER DEFAULT 0,
    total_points INTEGER NOT NULL,

    -- Context
    buzz_time_seconds DECIMAL(6,3),
    buzz_rank INTEGER,
    is_correct BOOLEAN,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scoring_round ON scoring_events(round_id);
CREATE INDEX IF NOT EXISTS idx_scoring_participant ON scoring_events(participant_id);

-- Add comments
COMMENT ON TABLE scoring_events IS 'Detailed breakdown of points awarded for each answer';
COMMENT ON COLUMN scoring_events.base_points IS 'Base points for question type (100, 150, 200, 250)';
COMMENT ON COLUMN scoring_events.time_multiplier IS 'Multiplier based on buzz time (1.0, 1.2, or 1.5)';
COMMENT ON COLUMN scoring_events.time_bonus_points IS 'Additional points from time multiplier';
COMMENT ON COLUMN scoring_events.buzz_rank_bonus IS 'Bonus for buzz rank (25 for 1st, 10 for 2nd, 0 for 3rd+)';
COMMENT ON COLUMN scoring_events.bonus_points IS 'Admin-awarded bonus points';
COMMENT ON COLUMN scoring_events.total_points IS 'Total points awarded (sum of all components)';
