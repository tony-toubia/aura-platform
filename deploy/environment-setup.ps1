# Environment Variables Setup for Cloud Run Services (PowerShell)
# This script helps configure environment variables for your deployed services

param(
    [string]$ProjectId = "aura-platform-prod",
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Setting up environment variables for Cloud Run services" -ForegroundColor Green
Write-Host ""

# Function to set environment variables for a service
function Set-ServiceEnvVars {
    param(
        [string]$ServiceName,
        [string]$EnvVars
    )
    
    Write-Host "Setting environment variables for $ServiceName..." -ForegroundColor Blue
    gcloud run services update $ServiceName `
        --region=$Region `
        --set-env-vars="$EnvVars"
}

# Collect environment variables
Write-Host "📝 Please provide the following environment variables for the dashboard:" -ForegroundColor Yellow
Write-Host ""

$supabaseUrl = Read-Host "Supabase URL"
$supabaseAnonKey = Read-Host "Supabase Anon Key"
$supabaseServiceKey = Read-Host "Supabase Service Role Key" -AsSecureString
$openaiApiKey = Read-Host "OpenAI API Key" -AsSecureString
$stripeSecretKey = Read-Host "Stripe Secret Key" -AsSecureString
$stripePublishableKey = Read-Host "Stripe Publishable Key"
$stripeWebhookSecret = Read-Host "Stripe Webhook Secret" -AsSecureString
$stripePersonalPriceId = Read-Host "Stripe Personal Price ID"
$stripeFamilyPriceId = Read-Host "Stripe Family Price ID"
$stripeBusinessPriceId = Read-Host "Stripe Business Price ID"

# Convert secure strings to plain text for environment variables
$supabaseServiceKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($supabaseServiceKey))
$openaiApiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($openaiApiKey))
$stripeSecretKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($stripeSecretKey))
$stripeWebhookSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($stripeWebhookSecret))

# Build environment variables string for dashboard
$dashboardEnvVars = @(
    "NODE_ENV=production",
    "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey",
    "SUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKeyPlain",
    "OPENAI_API_KEY=$openaiApiKeyPlain",
    "STRIPE_SECRET_KEY=$stripeSecretKeyPlain",
    "STRIPE_PUBLISHABLE_KEY=$stripePublishableKey",
    "STRIPE_WEBHOOK_SECRET=$stripeWebhookSecretPlain",
    "STRIPE_PERSONAL_PRICE_ID=$stripePersonalPriceId",
    "STRIPE_FAMILY_PRICE_ID=$stripeFamilyPriceId",
    "STRIPE_BUSINESS_PRICE_ID=$stripeBusinessPriceId"
) -join ","

# Set dashboard environment variables
Set-ServiceEnvVars -ServiceName "aura-dashboard" -EnvVars $dashboardEnvVars

# Marketing site environment variables (minimal)
$marketingEnvVars = "NODE_ENV=production"
Set-ServiceEnvVars -ServiceName "aura-marketing" -EnvVars $marketingEnvVars

# Clear sensitive variables from memory
$supabaseServiceKeyPlain = $null
$openaiApiKeyPlain = $null
$stripeSecretKeyPlain = $null
$stripeWebhookSecretPlain = $null

Write-Host ""
Write-Host "✅ Environment variables configured successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Services are being updated. This may take a few minutes." -ForegroundColor Blue
Write-Host "You can monitor the deployment status with:" -ForegroundColor Yellow
Write-Host "  gcloud run services list --region=$Region"
Write-Host ""
Write-Host "🌐 Once updated, your services will be available at:" -ForegroundColor Green
Write-Host "  Marketing: https://aura-link.app"
Write-Host "  Dashboard: https://dash.aura-link.app"