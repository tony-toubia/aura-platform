# PowerShell script to push .env.production secrets to Google Cloud Secret Manager
# This script reads the .env.production file and creates/updates secrets in GCP

$ErrorActionPreference = "Stop"

$PROJECT_ID = "aura-platform-467500"
$ENV_FILE = ".env.production"

Write-Host "🔐 Pushing secrets from $ENV_FILE to Google Cloud Secret Manager" -ForegroundColor Green
Write-Host "📁 Project: $PROJECT_ID" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production exists
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "❌ Error: $ENV_FILE not found!" -ForegroundColor Red
    exit 1
}

# Function to create or update a secret
function Push-Secret {
    param(
        [string]$SecretName,
        [string]$SecretValue
    )
    
    if ([string]::IsNullOrWhiteSpace($SecretValue)) {
        Write-Host "⚠️  Skipping $SecretName (empty value)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "📤 Pushing secret: $SecretName" -ForegroundColor Cyan
    
    # Check if secret exists
    $secretExists = $false
    try {
        gcloud secrets describe $SecretName --project=$PROJECT_ID 2>$null | Out-Null
        $secretExists = $true
    } catch {
        $secretExists = $false
    }
    
    try {
        if ($secretExists) {
            # Secret exists, create a new version
            $SecretValue | gcloud secrets versions add $SecretName --data-file=- --project=$PROJECT_ID | Out-Null
            Write-Host "✅ Updated $SecretName" -ForegroundColor Green
        } else {
            # Secret doesn't exist, create it
            $SecretValue | gcloud secrets create $SecretName --data-file=- --project=$PROJECT_ID | Out-Null
            Write-Host "✅ Created $SecretName" -ForegroundColor Green
            
            # Grant access to Cloud Run service account
            $PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
            $SERVICE_ACCOUNT = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
            
            gcloud secrets add-iam-policy-binding $SecretName `
                --member="serviceAccount:$SERVICE_ACCOUNT" `
                --role="roles/secretmanager.secretAccessor" `
                --project=$PROJECT_ID | Out-Null
            Write-Host "   🔓 Granted access to Cloud Run service account" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Failed to push $SecretName : $_" -ForegroundColor Red
    }
}

# Read and parse .env.production file
Write-Host "📖 Reading $ENV_FILE..." -ForegroundColor Yellow
$envContent = Get-Content $ENV_FILE

# Define the mapping of env vars to secret names
$secretMappings = @{
    "OPENAI_API_KEY" = "OPENAI_API_KEY"
    "JWT_SECRET" = "JWT_SECRET"
    "SUPABASE_SERVICE_ROLE_KEY" = "SUPABASE_SERVICE_ROLE_KEY"
    "GOOGLE_CLIENT_SECRET" = "GOOGLE_CLIENT_SECRET"
    "MICROSOFT_CLIENT_SECRET" = "MICROSOFT_CLIENT_SECRET"
    "STRAVA_CLIENT_SECRET" = "STRAVA_CLIENT_SECRET"
    "NEXT_PUBLIC_OPENWEATHER_API_KEY" = "OPENWEATHER_API_KEY"
    "NEWS_API_KEY" = "NEWS_API_KEY"
    # Note: Stripe secrets are already set up, but we'll update them if needed
    "STRIPE_SECRET_KEY" = "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET" = "STRIPE_WEBHOOK_SECRET"
    "STRIPE_PERSONAL_PRICE_ID" = "STRIPE_PERSONAL_PRICE_ID"
    "STRIPE_FAMILY_PRICE_ID" = "STRIPE_FAMILY_PRICE_ID"
    "STRIPE_BUSINESS_PRICE_ID" = "STRIPE_BUSINESS_PRICE_ID"
}

# Parse env file and extract values
$envVars = @{}
foreach ($line in $envContent) {
    if ($line -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present
        $value = $value -replace '^["'']|["'']$', ''
        $envVars[$key] = $value
    }
}

Write-Host ""
Write-Host "🚀 Pushing secrets to Google Cloud Secret Manager..." -ForegroundColor Yellow
Write-Host ""

# Push each secret
foreach ($envKey in $secretMappings.Keys) {
    $secretName = $secretMappings[$envKey]
    if ($envVars.ContainsKey($envKey)) {
        Push-Secret -SecretName $secretName -SecretValue $envVars[$envKey]
    } else {
        Write-Host "⚠️  $envKey not found in $ENV_FILE" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Secret push complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure Cloud Build trigger substitution variables:" -ForegroundColor White
Write-Host "   - _SUPABASE_ANON_KEY = $($envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'])" -ForegroundColor Gray
Write-Host "   - _GOOGLE_CLIENT_ID = $($envVars['NEXT_PUBLIC_GOOGLE_CLIENT_ID'])" -ForegroundColor Gray
Write-Host "   - _MICROSOFT_CLIENT_ID = $($envVars['NEXT_PUBLIC_MICROSOFT_CLIENT_ID'])" -ForegroundColor Gray
Write-Host "   - _STRAVA_CLIENT_ID = $($envVars['NEXT_PUBLIC_STRAVA_CLIENT_ID'])" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy using: gcloud builds submit --config=cloudbuild-simple.yaml" -ForegroundColor White