-- ============================================
-- Proactive Notifications Database Migration
-- Version: 1.0.0
-- Date: 2025-01-13
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Proactive Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS proactive_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aura_id UUID NOT NULL REFERENCES auras(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES behavior_rules(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    trigger_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'delivered', 'read', 'failed', 'expired')),
    delivery_channel TEXT NOT NULL DEFAULT 'in_app' CHECK (delivery_channel IN ('in_app', 'web_push', 'sms', 'whatsapp', 'email')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT
);

-- Create indexes for performance
CREATE INDEX idx_proactive_messages_aura_id ON proactive_messages(aura_id);
CREATE INDEX idx_proactive_messages_status ON proactive_messages(status);
CREATE INDEX idx_proactive_messages_created_at ON proactive_messages(created_at DESC);

-- ============================================
-- 2. Rule Execution Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS rule_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES behavior_rules(id) ON DELETE CASCADE,
    aura_id UUID NOT NULL REFERENCES auras(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered BOOLEAN NOT NULL DEFAULT FALSE,
    sensor_values JSONB NOT NULL,
    evaluation_result JSONB,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_id UUID REFERENCES proactive_messages(id),
    execution_time_ms INTEGER
);

-- Create indexes for performance
CREATE INDEX idx_rule_execution_log_rule_id ON rule_execution_log(rule_id);
CREATE INDEX idx_rule_execution_log_aura_id ON rule_execution_log(aura_id);
CREATE INDEX idx_rule_execution_log_executed_at ON rule_execution_log(executed_at DESC);

-- ============================================
-- 3. Notification Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aura_id UUID REFERENCES auras(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'web_push', 'sms', 'whatsapp', 'email')),
    enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone TEXT DEFAULT 'UTC',
    max_per_day INTEGER,
    priority_threshold INTEGER DEFAULT 5,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, aura_id, channel)
);

-- Create indexes for performance
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ============================================
-- 4. Notification Delivery Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES proactive_messages(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    external_id TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);

-- ============================================
-- 5. Push Subscriptions Table (for Phase 2)
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    keys JSONB NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- ============================================
-- 6. Background Jobs Table
-- ============================================
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_created_at ON background_jobs(created_at DESC);

-- ============================================
-- 7. Modify Existing Tables
-- ============================================

-- Add fields to behavior_rules table
ALTER TABLE behavior_rules 
ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trigger_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notification_template TEXT,
ADD COLUMN IF NOT EXISTS notification_channels TEXT[] DEFAULT ARRAY['in_app'];

-- Add fields to auras table
ALTER TABLE auras 
ADD COLUMN IF NOT EXISTS proactive_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_evaluation_at TIMESTAMP WITH TIME ZONE;

-- Add fields to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS has_unread_proactive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS unread_proactive_count INTEGER DEFAULT 0;

-- ============================================
-- 8. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE proactive_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

-- Proactive Messages policies
CREATE POLICY "Users can view their own proactive messages" ON proactive_messages
    FOR SELECT USING (
        aura_id IN (
            SELECT id FROM auras WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all proactive messages" ON proactive_messages
    FOR ALL USING (auth.role() = 'service_role');

-- Rule Execution Log policies
CREATE POLICY "Users can view their own rule execution logs" ON rule_execution_log
    FOR SELECT USING (
        aura_id IN (
            SELECT id FROM auras WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all rule execution logs" ON rule_execution_log
    FOR ALL USING (auth.role() = 'service_role');

-- Notification Preferences policies
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all notification preferences" ON notification_preferences
    FOR ALL USING (auth.role() = 'service_role');

-- Notification Delivery Log policies
CREATE POLICY "Users can view their own delivery logs" ON notification_delivery_log
    FOR SELECT USING (
        notification_id IN (
            SELECT pm.id FROM proactive_messages pm
            JOIN auras a ON pm.aura_id = a.id
            WHERE a.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all delivery logs" ON notification_delivery_log
    FOR ALL USING (auth.role() = 'service_role');

-- Push Subscriptions policies
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all push subscriptions" ON push_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Background Jobs policies (service role only)
CREATE POLICY "Service role can manage background jobs" ON background_jobs
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 9. Functions for Notification Management
-- ============================================

-- Function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE proactive_messages 
    SET 
        read_at = NOW(),
        status = 'read'
    WHERE id = notification_id;
    
    -- Update conversation unread count
    UPDATE conversations c
    SET unread_proactive_count = (
        SELECT COUNT(*) 
        FROM proactive_messages pm 
        WHERE pm.conversation_id = c.id 
        AND pm.status IN ('pending', 'delivered')
    ),
    has_unread_proactive = EXISTS (
        SELECT 1 
        FROM proactive_messages pm 
        WHERE pm.conversation_id = c.id 
        AND pm.status IN ('pending', 'delivered')
    )
    WHERE c.id = (
        SELECT conversation_id 
        FROM proactive_messages 
        WHERE id = notification_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM proactive_messages 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND status IN ('read', 'expired', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also cleanup old execution logs
    DELETE FROM rule_execution_log
    WHERE executed_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. Triggers for Updated Timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. Grant Permissions
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT ON proactive_messages TO authenticated;
GRANT SELECT ON rule_execution_log TO authenticated;
GRANT ALL ON notification_preferences TO authenticated;
GRANT SELECT ON notification_delivery_log TO authenticated;
GRANT ALL ON push_subscriptions TO authenticated;

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================
-- Migration Complete
-- ============================================