-- Migration: Add press_order column to buzzer_presses table
-- Date: 2025-12-21
-- Description: Adds press_order column to track buzzer press sequence

-- Add press_order column if it doesn't exist
ALTER TABLE buzzer_presses ADD COLUMN IF NOT EXISTS press_order INTEGER;

-- Set default value for existing rows (same as buzz_rank)
UPDATE buzzer_presses SET press_order = buzz_rank WHERE press_order IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE buzzer_presses ALTER COLUMN press_order SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN buzzer_presses.press_order IS 'Sequential order of buzzer presses (same as buzz_rank)';
