# 🤖 Automated Notification Rules Setup Guide

## 🎯 Overview

This guide shows you how to set up **automated notification rules** that will:
- **Evaluate rules every 5 minutes** (or based on subscription tier)
- **Process notifications every minute** 
- **Send messages automatically** when conditions are met
- **Clean up old data** daily

## ✅ Prerequisites

- [x] **Notification pipeline working** (test notifications appear in conversations)
- [x] **Google Cloud Project** with billing enabled
- [x] **gcloud CLI installed** and authenticated
- [x] **CRON_SECRET** set in environment variables

## 🚀 Step 1: Deploy the Automation Endpoints

The system includes these new API endpoints:
- **`/api/cron/evaluate-rules`** - Evaluates notification rules for all auras
- **`/api/cron/process-notifications`** - Processes pending notifications 
- **`/api/cron/cleanup-notifications`** - Cleans up old notification data

**Deploy your application** with these new endpoints first.

## 🔧 Step 2: Test Manual Rule Evaluation

After deployment, test the system manually:

### **Via Diagnostics UI:**
1. Go to **senses-diagnostics** → Notifications tab
2. Click **"Test Rules"** button (purple gradient)
3. Check console for detailed results

### **Via API:**
```bash
# Test rule evaluation
curl -X POST https://your-domain.com/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  -d '{"task": "evaluate-rules"}'

# Test notification processing  
curl -X POST https://your-domain.com/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  -d '{"task": "process-notifications"}'
```

## ⚙️ Step 3: Set Up Google Cloud Scheduler

Run the automated setup script:

```powershell
# Windows PowerShell
cd scripts
.\setup-cloud-scheduler.ps1
```

```bash  
# Linux/Mac
cd scripts
chmod +x setup-cloud-scheduler.sh
./setup-cloud-scheduler.sh
```

This creates **3 scheduler jobs**:

### **1. Rule Evaluation** (Every 5 minutes)
- **Job Name**: `proactive-rule-evaluation`
- **Schedule**: `*/5 * * * *` 
- **Endpoint**: `https://your-domain.com/api/cron/evaluate-rules`

### **2. Notification Processing** (Every minute) 
- **Job Name**: `proactive-notification-processing`
- **Schedule**: `* * * * *`
- **Endpoint**: `https://your-domain.com/api/cron/process-notifications`

### **3. Daily Cleanup** (Daily at 2 AM UTC)
- **Job Name**: `proactive-notification-cleanup` 
- **Schedule**: `0 2 * * *`
- **Endpoint**: `https://your-domain.com/api/cron/cleanup-notifications`

## 📋 Step 4: Create Notification Rules

### **Option A: Via Database (Meaningful Rules)**

Create thoughtful notification rules:

```sql
-- Morning motivation (weekdays only)
INSERT INTO notification_rules (
  id,
  aura_id, 
  rule_name,
  trigger_type,
  conditions,
  message_template,
  delivery_channels,
  priority,
  enabled,
  cooldown_minutes,
  created_at
) VALUES (
  gen_random_uuid(),
  'your-aura-id-here',  -- Replace with actual aura ID
  'Morning Motivation',
  'scheduled', 
  '{"schedule": "0 9 * * 1-5", "timeOfDay": "morning", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}',
  'Good morning! ☀️ Ready to make today amazing? What''s one thing you''re excited about today?',
  '["IN_APP"]'::jsonb,
  4,
  true,
  1440,  -- 24 hour cooldown
  now()
);

-- Perfect weather alert
INSERT INTO notification_rules (
  id,
  aura_id,
  rule_name, 
  trigger_type,
  conditions,
  message_template,
  delivery_channels,
  priority,
  enabled,
  cooldown_minutes,
  created_at
) VALUES (
  gen_random_uuid(),
  'your-aura-id-here',
  'Perfect Weather Alert',
  'weather_condition',
  '{"temperature": {"min": 20, "max": 25}, "precipitation": false}',
  'Absolutely perfect weather outside! 🌞 {{weather.temperature}}°C - ideal for a walk or outdoor time!',
  '["IN_APP"]'::jsonb,
  6,
  true,
  360,  -- 6 hour cooldown
  now()
);
```

**📋 See `MEANINGFUL_NOTIFICATION_RULES_EXAMPLES.md` for more thoughtful rule examples!**

### **Option B: Via UI (Recommended)**

**Coming Soon**: Rule builder interface at `/auras/{auraId}/rules`

## 🔍 Step 5: Monitor the System

### **Check Scheduler Jobs**
```bash
# List all jobs
gcloud scheduler jobs list --location=us-central1

# View job details
gcloud scheduler jobs describe proactive-rule-evaluation --location=us-central1
```

### **Monitor Logs**
```bash
# View job execution logs
gcloud logging read "resource.type=cloud_scheduler_job" --limit=50
```

### **Check Database**
```sql
-- Active notification rules
SELECT * FROM notification_rules WHERE enabled = true;

-- Recent rule executions
SELECT * FROM rule_execution_log ORDER BY executed_at DESC LIMIT 10;

-- Pending notifications
SELECT * FROM proactive_messages WHERE status = 'pending';

-- Recent background jobs
SELECT * FROM background_jobs ORDER BY created_at DESC LIMIT 10;
```

## 📊 Expected Behavior

Once setup is complete, the system will:

### **Every 5 Minutes:**
1. **Evaluate all active rules** for eligible auras
2. **Check conditions** (time, weather, sensor data, etc.)
3. **Create pending notifications** for triggered rules
4. **Respect cooldowns** and subscription limits

### **Every Minute:** 
1. **Process pending notifications**
2. **Create conversation messages**
3. **Update notification status** to "delivered"

### **Daily at 2 AM:**
1. **Clean up old processed notifications** (30+ days)
2. **Remove old execution logs**
3. **Clean background job records**

## 🎯 Testing Full Automation

### **1. Create a Meaningful Test Rule**
```sql
-- Morning motivation rule (won't spam, triggers once daily on weekdays)
INSERT INTO notification_rules (
  id, aura_id, rule_name, trigger_type, conditions, 
  message_template, delivery_channels, priority, enabled, cooldown_minutes, created_at
) VALUES (
  gen_random_uuid(),
  'your-aura-id',
  'Morning Check-in',
  'scheduled',
  '{"schedule": "0 9 * * 1-5", "timeOfDay": "morning"}',
  'Good morning! ☀️ Ready to make today amazing? What''s one thing you''re excited about today?',
  '["IN_APP"]'::jsonb,
  4,
  true,
  1440,  -- 24 hour cooldown prevents spam
  now()
);
```

### **2. Test Immediately (Optional)**
For immediate testing, create a temporary rule that triggers soon:
```sql
-- TEMPORARY test rule - DELETE after testing!
INSERT INTO notification_rules (
  id, aura_id, rule_name, trigger_type, conditions,
  message_template, delivery_channels, priority, enabled, cooldown_minutes, created_at
) VALUES (
  gen_random_uuid(),
  'your-aura-id',
  'TEMP TEST - DELETE ME',
  'scheduled', 
  '{"schedule": "*/5 * * * *"}',  -- Every 5 minutes - FOR TESTING ONLY!
  '🧪 TEST: System working! Delete this rule after verification.',
  '["IN_APP"]'::jsonb,
  2,
  true,
  0,  -- No cooldown for testing
  now()
);
```

**⚠️ IMPORTANT: Delete the test rule immediately after verification:**
```sql
DELETE FROM notification_rules WHERE rule_name LIKE '%TEST%';
```

### **3. Wait and Monitor**
- **Wait 5 minutes** for rule evaluation
- **Wait 1 more minute** for processing
- **Check your aura conversation** for the message
- **Delete any test rules** to prevent spam

### **3. Verify in Database**
```sql
-- Check rule was executed
SELECT * FROM rule_execution_log WHERE triggered = true ORDER BY executed_at DESC LIMIT 5;

-- Check notification was created and processed
SELECT * FROM proactive_messages ORDER BY created_at DESC LIMIT 5;
```

## 🐛 Troubleshooting

### **Rules Not Triggering**
1. Check `auras.proactive_enabled = true`
2. Verify rule `enabled = true`
3. Check rule conditions syntax
4. Review rule cooldowns

### **Processing Failures**
1. Check CRON_SECRET is correct
2. Verify API endpoints are deployed
3. Review conversation/message permissions
4. Check Supabase RLS policies

### **Scheduler Issues**
1. Verify jobs exist: `gcloud scheduler jobs list`
2. Check job execution: `gcloud scheduler jobs run JOB_NAME`
3. Review logs for errors
4. Confirm App Engine app exists

## 🎉 Success Indicators

You'll know it's working when:

- ✅ **Scheduler jobs** run without errors
- ✅ **Rules evaluate** regularly (check `rule_execution_log`)
- ✅ **Notifications appear** in conversations automatically
- ✅ **Background jobs** complete successfully
- ✅ **Database records** show recent activity

## 📈 Next Steps

Once automation is working:

1. **Create more sophisticated rules** (weather, sensors, user activity)
2. **Set up subscription tier limits** properly
3. **Add notification channels** (Push, SMS, WhatsApp)  
4. **Build rule management UI**
5. **Monitor performance** and optimize

---

**🎯 The goal**: Your auras will now proactively reach out to users based on the rules you define, creating a truly intelligent and responsive assistant experience!