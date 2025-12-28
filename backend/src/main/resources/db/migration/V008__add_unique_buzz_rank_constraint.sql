-- Migration: Add unique constraint on (round_id, buzz_rank)
-- Date: 2025-12-27
-- Description: Prevents duplicate buzz ranks in the same round (race condition protection)

-- Add unique constraint on (round_id, buzz_rank) if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_buzz_rank_per_round'
    ) THEN
        ALTER TABLE buzzer_presses
        ADD CONSTRAINT unique_buzz_rank_per_round
        UNIQUE(round_id, buzz_rank);
    END IF;
END $$;

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_buzz_rank_per_round ON buzzer_presses IS
'Ensures each buzz rank (1, 2, 3...) appears only once per round. Prevents race conditions where multiple players get the same rank.';
