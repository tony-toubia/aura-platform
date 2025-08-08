# Script to set up secrets in Google Cloud Secret Manager
# Run this script after setting the appropriate values for each secret

$ErrorActionPreference = "Stop"

$PROJECT_ID = "aura-platform-467500"

Write-Host "🔐 Setting up secrets in Google Cloud Secret Manager for project: $PROJECT_ID" -ForegroundColor Green
Write-Host "⚠️  Make sure to replace the placeholder values with your actual secrets!" -ForegroundColor Yellow
Write-Host ""

# Function to create or update a secret
function Create-Or-Update-Secret {
    param(
        [string]$SecretName,
        [string]$SecretValue
    )
    
    Write-Host "Creating/updating secret: $SecretName" -ForegroundColor Cyan
    
    # Check if secret exists
    $secretExists = $false
    try {
        gcloud secrets describe $SecretName --project=$PROJECT_ID 2>$null | Out-Null
        $secretExists = $true
    } catch {
        $secretExists = $false
    }
    
    if ($secretExists) {
        # Secret exists, create a new version
        $SecretValue | gcloud secrets versions add $SecretName --data-file=- --project=$PROJECT_ID
    } else {
        # Secret doesn't exist, create it
        $SecretValue | gcloud secrets create $SecretName --data-file=- --project=$PROJECT_ID
    }
}

# API Keys and Tokens
Write-Host "📝 Setting up API keys and tokens..." -ForegroundColor Yellow
Create-Or-Update-Secret -SecretName "OPENAI_API_KEY" -SecretValue "YOUR_OPENAI_API_KEY_HERE"
Create-Or-Update-Secret -SecretName "JWT_SECRET" -SecretValue "YOUR_JWT_SECRET_HERE"
Create-Or-Update-Secret -SecretName "SUPABASE_SERVICE_ROLE_KEY" -SecretValue "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE"
Create-Or-Update-Secret -SecretName "OPENWEATHER_API_KEY" -SecretValue "YOUR_OPENWEATHER_API_KEY_HERE"
Create-Or-Update-Secret -SecretName "NEWS_API_KEY" -SecretValue "YOUR_NEWS_API_KEY_HERE"

# OAuth Credentials
Write-Host "🔑 Setting up OAuth credentials..." -ForegroundColor Yellow
Create-Or-Update-Secret -SecretName "GOOGLE_CLIENT_SECRET" -SecretValue "YOUR_GOOGLE_CLIENT_SECRET_HERE"
Create-Or-Update-Secret -SecretName "MICROSOFT_CLIENT_SECRET" -SecretValue "YOUR_MICROSOFT_CLIENT_SECRET_HERE"
Create-Or-Update-Secret -SecretName "STRAVA_CLIENT_SECRET" -SecretValue "YOUR_STRAVA_CLIENT_SECRET_HERE"

# Grant access to the default compute service account
Write-Host "🔓 Granting access to Cloud Run service account..." -ForegroundColor Yellow
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
$SERVICE_ACCOUNT = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

$SECRETS = @(
    "OPENAI_API_KEY",
    "JWT_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENWEATHER_API_KEY",
    "NEWS_API_KEY",
    "GOOGLE_CLIENT_SECRET",
    "MICROSOFT_CLIENT_SECRET",
    "STRAVA_CLIENT_SECRET"
)

foreach ($SECRET in $SECRETS) {
    Write-Host "Granting access to $SECRET..." -ForegroundColor Cyan
    gcloud secrets add-iam-policy-binding $SECRET `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/secretmanager.secretAccessor" `
        --project=$PROJECT_ID
}

Write-Host ""
Write-Host "✅ Secret setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit this script and replace all placeholder values with your actual secrets"
Write-Host "2. Run the script again to create/update the secrets"
Write-Host "3. Configure your Cloud Build trigger with these substitution variables:"
Write-Host "   - _SUPABASE_ANON_KEY: Your Supabase anonymous key"
Write-Host "   - _GOOGLE_CLIENT_ID: Your Google OAuth client ID"
Write-Host "   - _MICROSOFT_CLIENT_ID: Your Microsoft OAuth client ID"
Write-Host "   - _STRAVA_CLIENT_ID: Your Strava OAuth client ID"
Write-Host "4. Deploy using: gcloud builds submit --config=cloudbuild-simple.yaml"