# Setup Notification Automation for Aura Platform
# PowerShell script to configure Google Cloud Scheduler for automated notifications

param(
    [string]$ProjectId = "aura-platform-467500",
    [string]$AppUrl = "https://app.aura-link.app",
    [string]$CronSecret = ""
)

Write-Host "🚀 Setting up notification automation for Aura Platform" -ForegroundColor Cyan
Write-Host "Project ID: $ProjectId" -ForegroundColor Gray
Write-Host "App URL: $AppUrl" -ForegroundColor Gray

# Generate CRON_SECRET if not provided
if (-not $CronSecret) {
    $CronSecret = -join ((1..32) | ForEach { [char]((65..90) + (97..122) + (48..57) | Get-Random) })
    Write-Host "Generated CRON_SECRET: $CronSecret" -ForegroundColor Yellow
    Write-Host "⚠️ IMPORTANT: Add this to your environment variables!" -ForegroundColor Red
}

# Set the project
Write-Host "`n1️⃣ Setting gcloud project..." -ForegroundColor Green
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "`n2️⃣ Enabling required APIs..." -ForegroundColor Green
gcloud services enable cloudscheduler.googleapis.com

# Create notification processor job (runs every minute)
Write-Host "`n3️⃣ Creating notification processor job..." -ForegroundColor Green
$processorJobName = "process-notifications"
$processorSchedule = "*/1 * * * *"  # Every minute
$processorUri = "$AppUrl/api/notifications/webhook"
$processorPayload = '{"task": "process-notifications"}'

Write-Host "Creating job: $processorJobName" -ForegroundColor Gray
Write-Host "Schedule: $processorSchedule (every minute)" -ForegroundColor Gray
Write-Host "URI: $processorUri" -ForegroundColor Gray

try {
    gcloud scheduler jobs create http $processorJobName `
        --location=us-central1 `
        --schedule="$processorSchedule" `
        --uri="$processorUri" `
        --http-method=POST `
        --headers="Content-Type=application/json,x-cron-secret=$CronSecret" `
        --message-body="$processorPayload" `
        --description="Process pending proactive notifications every minute"
    
    Write-Host "✅ Processor job created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create processor job: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be normal if the job already exists." -ForegroundColor Yellow
}

# Create rule evaluation job (runs every 5 minutes) - for future
Write-Host "`n4️⃣ Creating rule evaluation job (for future use)..." -ForegroundColor Green
$ruleJobName = "evaluate-notification-rules"
$ruleSchedule = "*/5 * * * *"  # Every 5 minutes
$rulePayload = '{"task": "evaluate-rules"}'

Write-Host "Creating job: $ruleJobName" -ForegroundColor Gray
Write-Host "Schedule: $ruleSchedule (every 5 minutes)" -ForegroundColor Gray

try {
    gcloud scheduler jobs create http $ruleJobName `
        --location=us-central1 `
        --schedule="$ruleSchedule" `
        --uri="$processorUri" `
        --http-method=POST `
        --headers="Content-Type=application/json,x-cron-secret=$CronSecret" `
        --message-body="$rulePayload" `
        --description="Evaluate notification rules and create proactive messages every 5 minutes"
    
    Write-Host "✅ Rule evaluation job created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create rule evaluation job: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be normal if the job already exists." -ForegroundColor Yellow
}

# List created jobs
Write-Host "`n5️⃣ Listing scheduler jobs..." -ForegroundColor Green
gcloud scheduler jobs list --location=us-central1

Write-Host "`n🎉 Setup complete!" -ForegroundColor Cyan
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Add CRON_SECRET to your environment variables:" -ForegroundColor White
Write-Host "   CRON_SECRET=$CronSecret" -ForegroundColor Gray
Write-Host "2. Deploy your application with the new endpoints" -ForegroundColor White
Write-Host "3. Test the notification system:" -ForegroundColor White
Write-Host "   - Send test notification" -ForegroundColor Gray
Write-Host "   - Click 'Process Pending' button" -ForegroundColor Gray
Write-Host "   - Check your aura conversation" -ForegroundColor Gray
Write-Host "4. The automation will now run every minute!" -ForegroundColor White

Write-Host "`n🔧 Manual test commands:" -ForegroundColor Yellow
Write-Host "Test webhook: curl -X POST $processorUri -H 'x-cron-secret: $CronSecret' -H 'Content-Type: application/json' -d '$processorPayload'" -ForegroundColor Gray
Write-Host "Test processor: curl -X POST $AppUrl/api/notifications/process-pending" -ForegroundColor Gray

Write-Host "`n✨ Your notifications are now automated!" -ForegroundColor Green