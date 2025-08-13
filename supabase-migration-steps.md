# Supabase Migration Steps

## Step 1: Run Database Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your project `ahzmfkjtiiyuipweaktx`
3. Navigate to "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of `database-migration-proactive-notifications.sql`
6. Click "Run" to execute the migration

## Step 2: Verify Migration

After running the migration, verify it worked by running this query in a new SQL Editor tab:

```sql
-- Verify new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'proactive_messages',
    'rule_execution_log', 
    'notification_preferences',
    'notification_delivery_log',
    'push_subscriptions',
    'background_jobs'
  );

-- Verify new columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'behavior_rules' 
  AND column_name IN ('last_triggered_at', 'trigger_count', 'notification_template', 'notification_channels');

-- Check if enums were created
SELECT typname 
FROM pg_type 
WHERE typname IN ('notification_status', 'notification_channel', 'background_job_status');
```

You should see:
- 6 new tables listed
- 4 new columns in behavior_rules  
- 3 new enum types

## Step 3: Test Basic Functionality

Run this test query to ensure everything works:

```sql
-- Insert a test notification preference
INSERT INTO notification_preferences (user_id, channel, enabled)
SELECT id, 'in_app', true
FROM auth.users 
LIMIT 1
ON CONFLICT (user_id, aura_id, channel) DO NOTHING;

-- Check it worked
SELECT * FROM notification_preferences LIMIT 1;
```

If you see a row returned, the migration was successful!