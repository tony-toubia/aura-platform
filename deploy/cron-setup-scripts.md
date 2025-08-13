# Cron Job Setup Scripts

## For Vercel (Recommended - Already configured!)

The `vercel.json` file has been created with the cron configuration. Deploy to Vercel and the crons will start automatically.

## For Google Cloud Platform

If you're using Google Cloud Run, create these Cloud Scheduler jobs:

```bash
# Set your project and region
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export SERVICE_URL="https://your-service-url"
export CRON_SECRET="aura-cron-secret-change-this-in-production-make-it-secure-123456789"

# Create rule evaluation job (every 5 minutes)
gcloud scheduler jobs create http proactive-rule-evaluation \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="*/5 * * * *" \
  --uri="$SERVICE_URL/api/cron/evaluate-rules" \
  --http-method=POST \
  --headers="x-cron-secret=$CRON_SECRET,content-type=application/json" \
  --body="{}" \
  --time-zone="UTC" \
  --description="Evaluates behavior rules and triggers notifications"

# Create notification processing job (every 1 minute)
gcloud scheduler jobs create http proactive-notification-processing \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="*/1 * * * *" \
  --uri="$SERVICE_URL/api/cron/process-notifications" \
  --http-method=POST \
  --headers="x-cron-secret=$CRON_SECRET,content-type=application/json" \
  --body="{}" \
  --time-zone="UTC" \
  --description="Processes queued notifications and delivers them"

# List jobs to verify
gcloud scheduler jobs list --location=$REGION
```

## For Railway

Create a `railway.toml` file:

```toml
[cron]
  # Rule evaluation every 5 minutes
  "*/5 * * * *" = "curl -X POST -H 'x-cron-secret: $CRON_SECRET' -H 'content-type: application/json' $RAILWAY_STATIC_URL/api/cron/evaluate-rules"
  
  # Notification processing every 1 minute  
  "*/1 * * * *" = "curl -X POST -H 'x-cron-secret: $CRON_SECRET' -H 'content-type: application/json' $RAILWAY_STATIC_URL/api/cron/process-notifications"
```

## For External Cron Services (cron-job.org, EasyCron, etc.)

### Job 1: Rule Evaluation
- **URL**: `https://your-domain.com/api/cron/evaluate-rules`
- **Method**: POST
- **Headers**: 
  ```
  x-cron-secret: aura-cron-secret-change-this-in-production-make-it-secure-123456789
  content-type: application/json
  ```
- **Schedule**: `*/5 * * * *` (every 5 minutes)
- **Body**: `{}`

### Job 2: Notification Processing
- **URL**: `https://your-domain.com/api/cron/process-notifications` 
- **Method**: POST
- **Headers**:
  ```
  x-cron-secret: aura-cron-secret-change-this-in-production-make-it-secure-123456789
  content-type: application/json
  ```
- **Schedule**: `*/1 * * * *` (every 1 minute)
- **Body**: `{}`

## Testing Cron Jobs Locally

Once deployed, test your cron endpoints manually:

```bash
# Test rule evaluation
curl -X POST \
  -H "x-cron-secret: aura-cron-secret-change-this-in-production-make-it-secure-123456789" \
  -H "content-type: application/json" \
  -d '{}' \
  https://your-domain.com/api/cron/evaluate-rules

# Test notification processing
curl -X POST \
  -H "x-cron-secret: aura-cron-secret-change-this-in-production-make-it-secure-123456789" \
  -H "content-type: application/json" \
  -d '{}' \
  https://your-domain.com/api/cron/process-notifications
```

Expected responses:
```json
{
  "success": true,
  "timestamp": "2025-01-07T12:00:00.000Z",
  "result": {
    "processed": 0,
    "succeeded": 0,
    "failed": 0,
    "duration": 1234
  }
}
```

## Monitoring

After setting up cron jobs, monitor them with:

```bash
# Check job status
curl https://your-domain.com/api/cron/evaluate-rules
curl https://your-domain.com/api/cron/process-notifications
```

These GET endpoints return health status and recent job information.