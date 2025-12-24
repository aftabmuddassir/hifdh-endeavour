-- Migration: Add buzzer tracking and connection fields to game_participants
-- Date: 2025-12-20
-- Description: Adds fields for consecutive buzz tracking, blocking, round state, and connection status

-- Add consecutive first buzzes counter
ALTER TABLE game_participants
ADD COLUMN IF NOT EXISTS consecutive_first_buzzes INTEGER DEFAULT 0;

-- Add blocking flag for next round
ALTER TABLE game_participants
ADD COLUMN IF NOT EXISTS is_blocked_next_round BOOLEAN DEFAULT false;

-- Add current round buzz state
ALTER TABLE game_participants
ADD COLUMN IF NOT EXISTS buzzed_in_current_round BOOLEAN DEFAULT false;

-- Add connection tracking
ALTER TABLE game_participants
ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT true;

-- Add last heartbeat timestamp
ALTER TABLE game_participants
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP DEFAULT NOW();

-- Add comments for documentation
COMMENT ON COLUMN game_participants.consecutive_first_buzzes IS 'Counter for consecutive 1st-place buzzes (0-3, resets on non-1st buzz or after blocking)';
COMMENT ON COLUMN game_participants.is_blocked_next_round IS 'True if player is blocked from buzzing next round due to 3 consecutive 1st-place buzzes';
COMMENT ON COLUMN game_participants.buzzed_in_current_round IS 'True if player has already buzzed in the active round (prevents duplicate buzzes)';
COMMENT ON COLUMN game_participants.is_connected IS 'True if player''s WebSocket connection is active';
COMMENT ON COLUMN game_participants.last_heartbeat IS 'Last heartbeat timestamp from player (for connection monitoring)';
