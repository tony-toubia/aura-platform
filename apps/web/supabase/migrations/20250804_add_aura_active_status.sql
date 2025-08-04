-- Migration to ensure auras have proper active/inactive status
-- The 'enabled' field already exists, but we want to ensure it has the right default

-- Update the auras table to ensure enabled defaults to true for new auras
ALTER TABLE auras ALTER COLUMN enabled SET DEFAULT true;

-- Update any existing auras that might have null enabled values to true
UPDATE auras SET enabled = true WHERE enabled IS NULL;

-- Ensure the column is not null
ALTER TABLE auras ALTER COLUMN enabled SET NOT NULL;

-- Add an index for better performance when filtering by enabled status
CREATE INDEX IF NOT EXISTS idx_auras_enabled ON auras(enabled);

-- Add a comment to document the field
COMMENT ON COLUMN auras.enabled IS 'Whether the aura is active (true) or deactivated (false). Deactivated auras are hidden from normal operations but not deleted.';