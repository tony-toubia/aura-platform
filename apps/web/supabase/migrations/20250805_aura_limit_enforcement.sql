-- Migration to support aura limit enforcement
-- This ensures the database schema supports our subscription downgrade solution

-- Add index for better performance when querying enabled auras by user
CREATE INDEX IF NOT EXISTS idx_auras_user_enabled ON auras(user_id, enabled);

-- Add index for subscription queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_tier ON subscriptions(user_id, tier);

-- Add a function to automatically enforce aura limits (optional, for database-level enforcement)
CREATE OR REPLACE FUNCTION enforce_aura_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_subscription_tier TEXT;
    max_auras INTEGER;
    current_enabled_count INTEGER;
BEGIN
    -- Only check on INSERT or UPDATE that enables an aura
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.enabled = true AND OLD.enabled = false) THEN
        -- Get user's subscription tier
        SELECT tier INTO user_subscription_tier
        FROM subscriptions
        WHERE user_id = NEW.user_id;
        
        -- Set max auras based on tier
        CASE user_subscription_tier
            WHEN 'free' THEN max_auras := 1;
            WHEN 'personal' THEN max_auras := 3;
            WHEN 'family' THEN max_auras := 10;
            WHEN 'business' THEN max_auras := -1; -- unlimited
            ELSE max_auras := 1; -- default to free tier limits
        END CASE;
        
        -- Skip check for business tier (unlimited)
        IF max_auras = -1 THEN
            RETURN NEW;
        END IF;
        
        -- Count current enabled auras for this user
        SELECT COUNT(*) INTO current_enabled_count
        FROM auras
        WHERE user_id = NEW.user_id AND enabled = true;
        
        -- If this would exceed the limit, prevent the operation
        IF current_enabled_count > max_auras THEN
            RAISE EXCEPTION 'Aura limit exceeded. Your % tier allows % active auras, but you currently have %.',
                user_subscription_tier, max_auras, current_enabled_count;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce limits (optional - we handle this in application code)
-- Uncomment if you want database-level enforcement as well
-- DROP TRIGGER IF EXISTS trigger_enforce_aura_limits ON auras;
-- CREATE TRIGGER trigger_enforce_aura_limits
--     BEFORE INSERT OR UPDATE ON auras
--     FOR EACH ROW
--     EXECUTE FUNCTION enforce_aura_limits();

-- Add a comment to document the enabled field behavior
COMMENT ON COLUMN auras.enabled IS 'Whether the aura is active (true) or deactivated (false). Deactivated auras are hidden from normal operations but not deleted. May be automatically set to false when subscription limits are exceeded.';

-- Add audit logging for subscription changes (optional)
CREATE TABLE IF NOT EXISTS subscription_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_tier TEXT,
    new_tier TEXT NOT NULL,
    change_reason TEXT,
    auras_disabled INTEGER DEFAULT 0,
    disabled_aura_ids TEXT[], -- Array of aura IDs that were disabled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for audit log queries
CREATE INDEX IF NOT EXISTS idx_subscription_audit_user_created ON subscription_audit_log(user_id, created_at DESC);

-- Add RLS policies for audit log
ALTER TABLE subscription_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription audit log" ON subscription_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- Function to log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change(
    p_user_id UUID,
    p_old_tier TEXT,
    p_new_tier TEXT,
    p_change_reason TEXT DEFAULT NULL,
    p_auras_disabled INTEGER DEFAULT 0,
    p_disabled_aura_ids TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO subscription_audit_log (
        user_id,
        old_tier,
        new_tier,
        change_reason,
        auras_disabled,
        disabled_aura_ids
    ) VALUES (
        p_user_id,
        p_old_tier,
        p_new_tier,
        p_change_reason,
        p_auras_disabled,
        p_disabled_aura_ids
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;