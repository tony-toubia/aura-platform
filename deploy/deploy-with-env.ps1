# Deploy script with proper environment variable management
# This script ensures all required environment variables are set for Cloud Run

$ErrorActionPreference = "Stop"

$PROJECT_ID = "aura-platform-467500"
$REGION = "us-central1"
$SERVICE_NAME = "aura-dashboard"

Write-Host "🚀 Deploying Aura Dashboard to Cloud Run..." -ForegroundColor Green

# Deploy to Cloud Run with environment variables from Secret Manager
gcloud run deploy $SERVICE_NAME `
  --image "gcr.io/$PROJECT_ID/${SERVICE_NAME}:latest" `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --port 3000 `
  --memory 1Gi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --update-secrets "OPENAI_API_KEY=OPENAI_API_KEY:latest,JWT_SECRET=JWT_SECRET:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,NEXT_PUBLIC_OPENWEATHER_API_KEY=OPENWEATHER_API_KEY:latest,NEWS_API_KEY=NEWS_API_KEY:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,MICROSOFT_CLIENT_SECRET=MICROSOFT_CLIENT_SECRET:latest,STRAVA_CLIENT_SECRET=STRAVA_CLIENT_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest" `
  --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_SUPABASE_URL=https://ahzmfkjtiiyuipweaktx.supabase.co,NEXT_PUBLIC_APP_URL=https://app.aura-link.app,NEXTAUTH_URL=https://app.aura-link.app"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    
    # Get the service URL
    $SERVICE_URL = gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
    Write-Host "🌐 Service URL: $SERVICE_URL" -ForegroundColor Cyan
    
    # Test the deployment
    Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$SERVICE_URL/api/test-supabase" -Method GET -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Health check passed!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Health check failed - check logs: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}