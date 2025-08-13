-- Proactive Notifications Database Migration
-- Run this SQL to add proactive notification support to existing Aura Platform database

-- 1. Add new columns to existing tables
ALTER TABLE behavior_rules 
ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trigger_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notification_template TEXT,
ADD COLUMN IF NOT EXISTS notification_channels TEXT[] DEFAULT ARRAY['in_app'];

ALTER TABLE auras 
ADD COLUMN IF NOT EXISTS proactive_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_evaluation_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS has_unread_proactive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS unread_proactive_count INTEGER DEFAULT 0;

-- 2. Create new notification status enum
CREATE TYPE notification_status AS ENUM (
    'pending',
    'queued', 
    'delivered',
    'read',
    'failed',
    'expired'
);

-- 3. Create new notification channel enum  
CREATE TYPE notification_channel AS ENUM (
    'in_app',
    'web_push',
    'sms',
    'whatsapp',
    'email'
);

-- 4. Create new background job status enum
CREATE TYPE background_job_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed'
);

-- 5. Create proactive_messages table
CREATE TABLE IF NOT EXISTS proactive_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aura_id UUID NOT NULL REFERENCES auras(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES behavior_rules(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    trigger_data JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    status notification_status NOT NULL DEFAULT 'pending',
    delivery_channel notification_channel NOT NULL DEFAULT 'in_app',
    retry_count INTEGER DEFAULT 0,
    error_message TEXT
);

-- Create indexes for proactive_messages
CREATE INDEX IF NOT EXISTS idx_proactive_messages_aura_id ON proactive_messages(aura_id);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_status ON proactive_messages(status);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_created_at ON proactive_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_conversation_id ON proactive_messages(conversation_id);

-- 6. Create rule_execution_log table
CREATE TABLE IF NOT EXISTS rule_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES behavior_rules(id) ON DELETE CASCADE,
    aura_id UUID NOT NULL REFERENCES auras(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered BOOLEAN NOT NULL DEFAULT FALSE,
    sensor_values JSONB NOT NULL DEFAULT '{}',
    evaluation_result JSONB DEFAULT '{}',
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_id UUID REFERENCES proactive_messages(id),
    execution_time_ms INTEGER
);

-- Create indexes for rule_execution_log
CREATE INDEX IF NOT EXISTS idx_rule_execution_log_rule_id ON rule_execution_log(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_execution_log_aura_id ON rule_execution_log(aura_id);
CREATE INDEX IF NOT EXISTS idx_rule_execution_log_executed_at ON rule_execution_log(executed_at DESC);

-- 7. Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aura_id UUID REFERENCES auras(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL,
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

-- Create indexes for notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- 8. Create notification_delivery_log table
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES proactive_messages(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    external_id TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for notification_delivery_log
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);

-- 9. Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    keys JSONB NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for push_subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- 10. Create background_jobs table
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    status background_job_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for background_jobs
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_created_at ON background_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON background_jobs(job_type);

-- 11. Create update trigger for notification_preferences
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, channel, enabled)
SELECT DISTINCT u.id, 'in_app', TRUE
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = u.id AND np.channel = 'in_app' AND np.aura_id IS NULL
)
ON CONFLICT (user_id, aura_id, channel) DO NOTHING;

-- 13. Create RLS policies for new tables
ALTER TABLE proactive_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for proactive_messages
CREATE POLICY "Users can view their own proactive messages" ON proactive_messages
    FOR SELECT USING (aura_id IN (SELECT id FROM auras WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage proactive messages" ON proactive_messages
    FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for rule_execution_log  
CREATE POLICY "Users can view their own rule execution logs" ON rule_execution_log
    FOR SELECT USING (aura_id IN (SELECT id FROM auras WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage rule execution logs" ON rule_execution_log
    FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- RLS policies for notification_delivery_log
CREATE POLICY "Users can view their own delivery logs" ON notification_delivery_log
    FOR SELECT USING (
        notification_id IN (
            SELECT id FROM proactive_messages 
            WHERE aura_id IN (SELECT id FROM auras WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Service role can manage delivery logs" ON notification_delivery_log
    FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- RLS policies for background_jobs (admin/service only)
CREATE POLICY "Service role can manage background jobs" ON background_jobs
    FOR ALL USING (auth.role() = 'service_role');

-- 14. Create helpful views for analytics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    DATE(created_at) as date,
    delivery_channel,
    status,
    COUNT(*) as count
FROM proactive_messages 
GROUP BY DATE(created_at), delivery_channel, status
ORDER BY date DESC;

CREATE OR REPLACE VIEW rule_performance AS
SELECT 
    r.name as rule_name,
    r.id as rule_id,
    a.name as aura_name,
    COUNT(rel.id) as total_executions,
    COUNT(CASE WHEN rel.triggered THEN 1 END) as triggered_count,
    ROUND(AVG(rel.execution_time_ms), 2) as avg_execution_time_ms,
    MAX(rel.executed_at) as last_executed_at
FROM behavior_rules r
JOIN auras a ON r.aura_id = a.id
LEFT JOIN rule_execution_log rel ON r.id = rel.rule_id
GROUP BY r.id, r.name, a.name
ORDER BY triggered_count DESC;

-- 15. Grant necessary permissions
GRANT SELECT ON notification_stats TO authenticated;
GRANT SELECT ON rule_performance TO authenticated;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Proactive notifications migration completed successfully!';
    RAISE NOTICE 'Added tables: proactive_messages, rule_execution_log, notification_preferences, notification_delivery_log, push_subscriptions, background_jobs';
    RAISE NOTICE 'Added columns to: behavior_rules, auras, conversations';
    RAISE NOTICE 'Created views: notification_stats, rule_performance';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your environment variables';
    RAISE NOTICE '2. Set up cron jobs for /api/cron/evaluate-rules and /api/cron/process-notifications'; 
    RAISE NOTICE '3. Configure notification channels (SMS, push, etc.)';
    RAISE NOTICE '4. Test with /api/notifications/test endpoint';
END $$;