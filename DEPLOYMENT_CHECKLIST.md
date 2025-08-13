# Proactive Notifications Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration ✅
- [ ] Copy `.env.example` to `.env.local` (or your deployment platform's env config)
- [ ] Set all required environment variables:
  ```
  DATABASE_URL=
  DIRECT_DATABASE_URL=
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXTAUTH_URL=
  NEXTAUTH_SECRET=
  CRON_SECRET= (generate a secure 32+ character string)
  RULE_EVALUATION_BATCH_SIZE=50
  RULE_EVALUATION_TIMEOUT=30000
  RULE_EVALUATION_MAX_RETRIES=3
  SENSOR_DATA_CACHE_TTL=600
  NOTIFICATION_QUEUE_BATCH_SIZE=100
  NOTIFICATION_RETRY_DELAY=300000
  REDIS_URL= (optional but recommended)
  ```

### 2. Database Migration ✅
- [ ] Connect to your Supabase project
- [ ] Run the migration script:
  ```bash
  # Option 1: Via Supabase Dashboard
  # Go to SQL Editor and paste the contents of:
  # apps/web/supabase/migrations/20250113_proactive_notifications.sql
  
  # Option 2: Via Supabase CLI
  supabase db push
  ```
- [ ] Verify all tables were created:
  - `proactive_messages`
  - `rule_execution_log`
  - `notification_preferences`
  - `notification_delivery_log`
  - `push_subscriptions`
  - `background_jobs`
- [ ] Verify columns were added to existing tables:
  - `behavior_rules`: last_triggered_at, trigger_count, notification_template, notification_channels
  - `auras`: proactive_enabled, last_evaluation_at
  - `conversations`: has_unread_proactive, unread_proactive_count

### 3. Google Cloud Scheduler Setup ✅
- [ ] Install Google Cloud SDK if not already installed
- [ ] Configure environment variables for the script:
  ```bash
  export GCP_PROJECT_ID="your-gcp-project-id"
  export GCP_REGION="us-central1"
  export DEPLOYMENT_DOMAIN="your-domain.com"
  export CRON_SECRET="your-secure-cron-secret"
  ```
- [ ] Run the setup script:
  ```bash
  chmod +x scripts/setup-cloud-scheduler.sh
  ./scripts/setup-cloud-scheduler.sh
  ```
- [ ] Verify jobs were created in [Google Cloud Console](https://console.cloud.google.com/cloudscheduler)
  - `proactive-rule-evaluation` (every 5 minutes)
  - `proactive-notification-processing` (every minute)
  - `proactive-notification-cleanup` (daily at 2 AM UTC)

### 4. Code Verification ✅
- [ ] Verify API routes exist:
  - `/api/cron/evaluate-rules`
  - `/api/cron/process-notifications`
  - `/api/notifications/test`
  - `/api/notifications/preferences`
  - `/api/notifications/history`
  - `/api/notifications/[id]/read`
- [ ] Verify service files exist:
  - `/lib/services/workers/rule-evaluator-worker.ts`
  - `/lib/services/notification-service.ts`
  - `/lib/services/channels/in-app-messenger.ts`
- [ ] Verify UI components exist:
  - `/components/notifications/notification-badge.tsx`
  - `/components/notifications/notification-preferences.tsx`
  - `/components/conversations/proactive-message.tsx`

### 5. Dependencies Installation ✅
- [ ] Install/update npm packages:
  ```bash
  cd apps/web
  npm install
  ```
- [ ] Verify Redis client is installed (if using Redis):
  ```bash
  npm list ioredis
  ```

## Deployment Steps

### 1. Deploy to Staging First 🚀
- [ ] Push code to staging branch
- [ ] Run database migrations on staging
- [ ] Deploy application to staging environment
- [ ] Update staging environment variables
- [ ] Configure Cloud Scheduler for staging domain

### 2. Testing on Staging ✅
- [ ] Test cron endpoints manually:
  ```bash
  # Test rule evaluation
  curl -X POST https://staging.your-domain.com/api/cron/evaluate-rules \
    -H "x-cron-secret: YOUR_CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d '{}'
  
  # Test notification processing
  curl -X POST https://staging.your-domain.com/api/cron/process-notifications \
    -H "x-cron-secret: YOUR_CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d '{}'
  ```
- [ ] Test notification creation:
  ```bash
  curl -X POST https://staging.your-domain.com/api/notifications/test \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"auraId": "test-aura-id", "message": "Test notification"}'
  ```
- [ ] Verify notifications appear in conversations
- [ ] Test notification preferences UI
- [ ] Check unread badges update correctly
- [ ] Monitor Cloud Scheduler job execution
- [ ] Check error logs for any issues

### 3. Production Deployment 🚀
- [ ] Create production database backup
- [ ] Merge to main/production branch
- [ ] Run database migrations on production
- [ ] Deploy application to production
- [ ] Update production environment variables
- [ ] Configure Cloud Scheduler for production domain

### 4. Production Verification ✅
- [ ] Verify all cron jobs are running
- [ ] Monitor first few job executions
- [ ] Check application logs for errors
- [ ] Test with a real user account
- [ ] Monitor database performance
- [ ] Check Redis connection (if applicable)

## Post-Deployment Monitoring

### 1. Immediate (First 24 Hours) 📊
- [ ] Monitor Cloud Scheduler execution logs
- [ ] Check for failed notifications in `proactive_messages` table
- [ ] Monitor `background_jobs` table for failures
- [ ] Review application error logs
- [ ] Check database connection pool usage
- [ ] Monitor API response times

### 2. First Week 📈
- [ ] Review notification delivery rates
- [ ] Check rule evaluation performance
- [ ] Monitor user engagement with notifications
- [ ] Analyze notification timing patterns
- [ ] Review and adjust rate limits if needed
- [ ] Check for memory leaks in workers

### 3. Ongoing Maintenance 🔧
- [ ] Weekly review of failed notifications
- [ ] Monthly cleanup of old notifications (automated)
- [ ] Quarterly review of notification effectiveness
- [ ] Regular updates to notification templates
- [ ] Performance optimization as needed

## Rollback Plan

### If Issues Occur 🔄
1. **Disable Cloud Scheduler Jobs**
   ```bash
   gcloud scheduler jobs pause proactive-rule-evaluation --location=us-central1
   gcloud scheduler jobs pause proactive-notification-processing --location=us-central1
   ```

2. **Feature Flag Disable** (if implemented)
   ```sql
   UPDATE auras SET proactive_enabled = FALSE;
   ```

3. **Full Rollback**
   - Revert code deployment
   - Keep database tables (they won't affect existing functionality)
   - Re-enable after fixes

## Success Metrics

### Key Performance Indicators 📊
- [ ] 95% notification delivery rate achieved
- [ ] <5 second end-to-end latency
- [ ] <1% error rate in background jobs
- [ ] 40% increase in user engagement
- [ ] Positive user feedback

## Support Documentation

### Troubleshooting Guide 🔍
1. **Notifications not sending**
   - Check CRON_SECRET matches
   - Verify Cloud Scheduler is running
   - Check `background_jobs` table for errors
   - Review application logs

2. **High latency**
   - Check Redis connection
   - Review database indexes
   - Optimize sensor data queries
   - Increase worker batch size

3. **Rate limiting issues**
   - Review tier limits in code
   - Check `notification_preferences` table
   - Adjust `max_per_day` settings

### Useful Queries 📝
```sql
-- Check recent notifications
SELECT * FROM proactive_messages 
ORDER BY created_at DESC 
LIMIT 10;

-- Check failed jobs
SELECT * FROM background_jobs 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Check rule execution stats
SELECT 
  rule_id, 
  COUNT(*) as executions,
  SUM(CASE WHEN triggered THEN 1 ELSE 0 END) as triggers
FROM rule_execution_log
WHERE executed_at > NOW() - INTERVAL '24 hours'
GROUP BY rule_id;

-- Check notification delivery rate
SELECT 
  status,
  COUNT(*) as count
FROM proactive_messages
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

## Contact Information

### Escalation Path 📞
1. **Level 1**: Check monitoring dashboards
2. **Level 2**: Review error logs and database
3. **Level 3**: Engineering team escalation

### Resources 📚
- [Technical Specification](docs/technical-specs/proactive-notifications-spec.md)
- [API Documentation](docs/api/notifications.md)
- [Google Cloud Scheduler Console](https://console.cloud.google.com/cloudscheduler)
- [Supabase Dashboard](https://app.supabase.com)

---

**Last Updated**: January 13, 2025  
**Version**: 1.0.0  
**Status**: Ready for Deployment