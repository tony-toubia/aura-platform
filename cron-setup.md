# Proactive Notifications Cron Setup

This document explains how to set up automated cron jobs for the proactive notifications system.

## Required Cron Jobs

### 1. Rule Evaluation
**Purpose**: Evaluates behavior rules and triggers notifications  
**Endpoint**: `POST /api/cron/evaluate-rules`  
**Frequency**: Every 5-15 minutes (depends on subscription tier)  

### 2. Notification Processing  
**Purpose**: Processes queued notifications and delivers them  
**Endpoint**: `POST /api/cron/process-notifications`  
**Frequency**: Every 1-2 minutes  

## Setup Methods

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/evaluate-rules",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/process-notifications", 
      "schedule": "*/1 * * * *"
    }
  ]
}
```

### Option 2: Google Cloud Scheduler (Recommended for Google Cloud)

```bash
# Rule evaluation job
gcloud scheduler jobs create http proactive-rule-evaluation \
  --schedule="*/5 * * * *" \
  --uri="https://your-domain.com/api/cron/evaluate-rules" \
  --http-method=POST \
  --headers="x-cron-secret=YOUR_CRON_SECRET,content-type=application/json" \
  --body="{}" \
  --time-zone="UTC"

# Notification processing job
gcloud scheduler jobs create http proactive-notification-processing \
  --schedule="*/1 * * * *" \
  --uri="https://your-domain.com/api/cron/process-notifications" \
  --http-method=POST \
  --headers="x-cron-secret=YOUR_CRON_SECRET,content-type=application/json" \
  --body="{}" \
  --time-zone="UTC"
```

### Option 3: External Cron Service (cron-job.org, EasyCron, etc.)

1. **Rule Evaluation**:
   - URL: `https://your-domain.com/api/cron/evaluate-rules`
   - Method: POST
   - Headers: 
     - `x-cron-secret: YOUR_CRON_SECRET`
     - `content-type: application/json`
   - Schedule: `*/5 * * * *`

2. **Notification Processing**:
   - URL: `https://your-domain.com/api/cron/process-notifications`
   - Method: POST  
   - Headers:
     - `x-cron-secret: YOUR_CRON_SECRET`
     - `content-type: application/json`
   - Schedule: `*/1 * * * *`

### Option 4: Traditional Server Cron

Add to your server's crontab:

```bash
# Edit crontab
crontab -e

# Add these lines
*/5 * * * * curl -X POST -H "x-cron-secret: YOUR_CRON_SECRET" -H "content-type: application/json" https://your-domain.com/api/cron/evaluate-rules
*/1 * * * * curl -X POST -H "x-cron-secret: YOUR_CRON_SECRET" -H "content-type: application/json" https://your-domain.com/api/cron/process-notifications
```

## Environment Variables

Make sure these are set in your production environment:

```bash
# Required for cron job security
CRON_SECRET=your-secure-random-secret

# Optional configuration
RULE_EVALUATION_BATCH_SIZE=50
RULE_EVALUATION_TIMEOUT=30000
SENSOR_DATA_CACHE_TTL=600
NOTIFICATION_QUEUE_BATCH_SIZE=100
```

## Frequency Recommendations by Scale

### Small Scale (< 100 users)
- Rule Evaluation: Every 15 minutes
- Notification Processing: Every 2 minutes

### Medium Scale (100-1000 users)  
- Rule Evaluation: Every 10 minutes
- Notification Processing: Every 1 minute

### Large Scale (1000+ users)
- Rule Evaluation: Every 5 minutes  
- Notification Processing: Every 30 seconds
- Consider multiple evaluation jobs with different batch sizes

## Monitoring & Health Checks

### Health Check Endpoints

**Rule Evaluation Status**:
```bash
GET /api/cron/evaluate-rules
```

**Queue Processing Status**:
```bash  
GET /api/cron/process-notifications
```

### Monitoring Queries

Check recent background jobs:
```sql
SELECT 
  job_type,
  status,
  created_at,
  completed_at,
  error_message
FROM background_jobs 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

Check notification queue size:
```sql
SELECT 
  COUNT(*) as queued_count,
  delivery_channel
FROM proactive_messages 
WHERE status = 'QUEUED'
GROUP BY delivery_channel;
```

### Alerts Setup

Set up alerts for:
- Failed cron jobs (check `background_jobs` table)
- Growing queue size (more than 100 queued notifications)
- High failure rates (> 10% failed notifications)

## Troubleshooting

### Common Issues

1. **Cron jobs not running**:
   - Check `CRON_SECRET` environment variable
   - Verify endpoint URLs are correct
   - Check server logs for authentication errors

2. **High memory usage**:
   - Reduce `RULE_EVALUATION_BATCH_SIZE`
   - Increase `RULE_EVALUATION_TIMEOUT`
   - Monitor with smaller batches

3. **Notifications not being sent**:
   - Check notification queue: `GET /api/cron/process-notifications`
   - Verify external service credentials (Twilio, etc.)
   - Check user notification preferences

4. **Slow performance**:
   - Optimize sensor data caching
   - Reduce evaluation frequency for large user bases
   - Consider read replicas for heavy queries

### Debug Commands

Manual trigger (development only):
```bash
# Trigger rule evaluation
curl -X POST -H "x-cron-secret: YOUR_CRON_SECRET" http://localhost:3000/api/cron/evaluate-rules

# Trigger notification processing  
curl -X POST -H "x-cron-secret: YOUR_CRON_SECRET" http://localhost:3000/api/cron/process-notifications
```

## Security Considerations

1. **Always use HTTPS** for production cron endpoints
2. **Set a strong CRON_SECRET** and rotate it regularly  
3. **Rate limit** cron endpoints to prevent abuse
4. **Monitor** for unusual patterns or high failure rates
5. **Use IP allowlisting** if your cron service supports it

## Scaling Considerations

For high-scale deployments:

1. **Horizontal Scaling**: Run multiple instances with load balancing
2. **Database Optimization**: Add indexes, use read replicas
3. **Caching**: Implement Redis for sensor data caching
4. **Queue Systems**: Consider using dedicated queue systems (Redis Queue, AWS SQS)
5. **Microservices**: Split rule evaluation and notification delivery into separate services