# ============================================
# Google Cloud Scheduler Setup Script (Windows PowerShell)
# For Proactive Notifications System
# ============================================

# Configuration
$PROJECT_ID = if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { "aura-platform-467500" }
$REGION = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }
$DOMAIN = if ($env:DEPLOYMENT_DOMAIN) { $env:DEPLOYMENT_DOMAIN } else { "app.aura-link.app" }
$CRON_SECRET = if ($env:CRON_SECRET) { $env:CRON_SECRET } else { "X9kL2mP8vQ3nR7wT5yB6jC4hF1gA0sD9eU3iO7zN2xM=" }
$SERVICE_ACCOUNT = if ($env:SERVICE_ACCOUNT) { $env:SERVICE_ACCOUNT } else { "205298800820-compute@developer.gserviceaccount.com" }

Write-Host "========================================" -ForegroundColor Green
Write-Host "Setting up Google Cloud Scheduler" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud version 2>&1
    Write-Host "✓ gcloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "Error: gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Prompt for configuration if not set
if ($PROJECT_ID -eq "your-gcp-project-id") {
    $PROJECT_ID = Read-Host "Enter your GCP Project ID"
}

if ($DOMAIN -eq "your-domain.com") {
    $DOMAIN = Read-Host "Enter your deployment domain (e.g., your-app.com)"
}

if ($CRON_SECRET -eq "your-secure-cron-secret-minimum-32-chars") {
    Write-Host "Warning: Using default CRON_SECRET. Please set a secure value in production!" -ForegroundColor Yellow
    $response = Read-Host "Enter a secure CRON_SECRET (or press Enter to use default)"
    if ($response) {
        $CRON_SECRET = $response
    }
}

# Set the project
Write-Host "Setting project to: $PROJECT_ID" -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable appengine.googleapis.com

# Check if App Engine app exists (required for Cloud Scheduler)
$appEngineExists = $false
try {
    $appInfo = gcloud app describe 2>&1
    if ($LASTEXITCODE -eq 0) {
        $appEngineExists = $true
    }
} catch {}

if (-not $appEngineExists) {
    Write-Host "Creating App Engine app (required for Cloud Scheduler)..." -ForegroundColor Yellow
    gcloud app create --region=$REGION
}

# Create service account if it doesn't exist
Write-Host "Setting up service account..." -ForegroundColor Yellow
$saExists = $false
try {
    $saInfo = gcloud iam service-accounts describe $SERVICE_ACCOUNT 2>&1
    if ($LASTEXITCODE -eq 0) {
        $saExists = $true
    }
} catch {}

if (-not $saExists) {
    gcloud iam service-accounts create scheduler-sa --display-name="Cloud Scheduler Service Account"
}

# ============================================
# Create Rule Evaluation Job (every 5 minutes)
# ============================================
Write-Host "Creating rule evaluation job..." -ForegroundColor Yellow

$JOB_NAME = "proactive-rule-evaluation"
$jobExists = $false
try {
    $jobInfo = gcloud scheduler jobs describe $JOB_NAME --location=$REGION 2>&1
    if ($LASTEXITCODE -eq 0) {
        $jobExists = $true
    }
} catch {}

if ($jobExists) {
    Write-Host "Job $JOB_NAME already exists, updating..." -ForegroundColor Yellow
    gcloud scheduler jobs update http $JOB_NAME `
        --location=$REGION `
        --schedule="*/5 * * * *" `
        --uri="https://$DOMAIN/api/cron/evaluate-rules" `
        --http-method=POST `
        --headers="x-cron-secret=$CRON_SECRET,content-type=application/json" `
        --message-body="{`"source`":`"cloud-scheduler`"}" `
        --time-zone="UTC" `
        --attempt-deadline="540s" `
        --max-retry-attempts=3 `
        --min-backoff="10s" `
        --max-backoff="60s"
} else {
    Write-Host "Creating job $JOB_NAME..." -ForegroundColor Green
    gcloud scheduler jobs create http $JOB_NAME `
        --location=$REGION `
        --schedule="*/5 * * * *" `
        --uri="https://$DOMAIN/api/cron/evaluate-rules" `
        --http-method=POST `
        --headers="x-cron-secret=$CRON_SECRET,content-type=application/json" `
        --message-body="{`"source`":`"cloud-scheduler`"}" `
        --time-zone="UTC" `
        --attempt-deadline="540s" `
        --max-retry-attempts=3 `
        --min-backoff="10s" `
        --max-backoff="60s"
}

# ============================================
# Create Notification Processing Job (every minute)
# ============================================
Write-Host "Creating notification processing job..." -ForegroundColor Yellow

$JOB_NAME = "proactive-notification-processing"
$jobExists = $false
try {
    $jobInfo = gcloud scheduler jobs describe $JOB_NAME --location=$REGION 2>&1
    if ($LASTEXITCODE -eq 0) {
        $jobExists = $true
    }
} catch {}

if ($jobExists) {
    Write-Host "Job $JOB_NAME already exists, updating..." -ForegroundColor Yellow
    gcloud scheduler jobs update http $JOB_NAME `
        --location=$REGION `
        --schedule="* * * * *" `
        --uri="https://$DOMAIN/api/cron/process-notifications" `
        --http-method=POST `
        --headers="x-cron-secret=$CRON_SECRET,content-type=application/json" `
        --message-body="{`"source`":`"cloud-scheduler`"}" `
        --time-zone="UTC" `
        --attempt-deadline="50s" `
        --max-retry-attempts=2 `
        --min-backoff="5s" `
        --max-backoff="30s"
} else {
    Write-Host "Creating job $JOB_NAME..." -ForegroundColor Green
    gcloud scheduler jobs create http $JOB_NAME `
        --location=$REGION `
        --schedule="* * * * *" `
        --uri="https://$DOMAIN/api/cron/process-notifications" `
        --http-method=POST `
        --headers="x-cron-secret=$CRON_SECRET,content-type=application/json" `
        --message-body="{`"source`":`"cloud-scheduler`"}" `
        --time-zone="UTC" `
        --attempt-deadline="50s" `
        --max-retry-attempts=2 `
        --min-backoff="5s" `
        --max-backoff="30s"
}

# ============================================
# Create Cleanup Job (daily at 2 AM UTC)
# ============================================
Write-Host "Creating cleanup job..." -ForegroundColor Yellow

$JOB_NAME = "proactive-notification-cleanup"
$jobExists = $false
try {
    $jobInfo = gcloud scheduler jobs describe $JOB_NAME --location=$REGION 2>&1
    if ($LASTEXITCODE -eq 0) {
        $jobExists = $true
    }
} catch {}

if ($jobExists) {
    Write-Host "Job $JOB_NAME already exists, updating..." -ForegroundColor Yellow
    gcloud scheduler jobs update http $JOB_NAME `
        --location=$REGION `
        --schedule="0 2 * * *" `
        --uri="https://$DOMAIN/api/cron/cleanup-notifications" `
        --http-method=POST `
        --headers="x-cron-secret=$CRON_SECRET,content-type=application/json" `
        --message-body="{`"source`":`"cloud-scheduler`",`"days`":30}" `
        --time-zone="UTC" `
        --attempt-deadline="300s" `
        --max-retry-attempts=3
} else {
    Write-Host "Creating job $JOB_NAME..." -ForegroundColor Green
    gcloud scheduler jobs create http $JOB_NAME `
        --location=$REGION `
        --schedule="0 2 * * *" `
        --uri="https://$DOMAIN/api/cron/cleanup-notifications" `
        --http-method=POST `
        --headers="x-cron-secret=$CRON_SECRET,content-type=application/json" `
        --message-body="{`"source`":`"cloud-scheduler`",`"days`":30}" `
        --time-zone="UTC" `
        --attempt-deadline="300s" `
        --max-retry-attempts=3
}

# ============================================
# List all jobs
# ============================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "Cloud Scheduler jobs created/updated:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
gcloud scheduler jobs list --location=$REGION

Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env.local file with the CRON_SECRET value"
Write-Host "2. Deploy your application"
Write-Host "3. Test the cron endpoints manually:"
Write-Host "   Invoke-WebRequest -Method POST -Uri `"https://$DOMAIN/api/cron/evaluate-rules`" ``"
Write-Host "     -Headers @{`"x-cron-secret`"=`"$CRON_SECRET`"; `"Content-Type`"=`"application/json`"} ``"
Write-Host "     -Body '{}'"
Write-Host ""
Write-Host "4. Monitor jobs at: https://console.cloud.google.com/cloudscheduler"