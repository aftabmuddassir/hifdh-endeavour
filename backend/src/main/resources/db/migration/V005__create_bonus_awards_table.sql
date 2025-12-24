-- Migration: Create bonus_awards table
-- Date: 2025-12-20
-- Description: Tracks admin-awarded bonus points to participants

CREATE TABLE IF NOT EXISTS bonus_awards (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    participant_id BIGINT REFERENCES game_participants(id) ON DELETE CASCADE,
    admin_name VARCHAR(255) NULL,

    bonus_points INTEGER NOT NULL,
    reason TEXT NULL,

    awarded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bonus_session ON bonus_awards(session_id);
CREATE INDEX IF NOT EXISTS idx_bonus_participant ON bonus_awards(participant_id);

-- Add comments
COMMENT ON TABLE bonus_awards IS 'Admin-awarded bonus points to participants during or after the game';
COMMENT ON COLUMN bonus_awards.bonus_points IS 'Number of bonus points awarded (can be positive or negative)';
COMMENT ON COLUMN bonus_awards.reason IS 'Optional reason provided by admin for the bonus';
COMMENT ON COLUMN bonus_awards.admin_name IS 'Name of admin who awarded the bonus (stored as string, no FK)';
