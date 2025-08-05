# Google Cloud Platform Setup Script for Aura Platform (PowerShell)
# Run this script to set up your GCP project and deploy the application

param(
    [string]$ProjectId = "aura-platform-prod",
    [string]$Region = "us-central1",
    [string]$GitHubUsername = "tony-toubia"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up Aura Platform on Google Cloud Platform" -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

# Check if gcloud is installed
try {
    gcloud version | Out-Null
} catch {
    Write-Host "❌ Google Cloud SDK is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "https://cloud.google.com/sdk/docs/install" -ForegroundColor Blue
    exit 1
}

# Create or select project
Write-Host "📋 Setting up GCP project..." -ForegroundColor Blue
try {
    gcloud projects create $ProjectId --name="Aura Platform"
} catch {
    Write-Host "Project already exists" -ForegroundColor Yellow
}
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Blue
$apis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "domains.googleapis.com",
    "certificatemanager.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api
}

# Set up Cloud Build trigger
Write-Host "🏗️ Setting up Cloud Build..." -ForegroundColor Blue
try {
    gcloud builds triggers create github `
        --repo-name="aura-platform" `
        --repo-owner="$GitHubUsername" `
        --branch-pattern="^main$" `
        --build-config="cloudbuild.yaml" `
        --name="aura-platform-deploy"
} catch {
    Write-Host "Trigger already exists" -ForegroundColor Yellow
}

# Create Cloud Run services
Write-Host "☁️ Creating Cloud Run services..." -ForegroundColor Blue

# Marketing site
Write-Host "Creating marketing service..." -ForegroundColor Gray
try {
    gcloud run deploy aura-marketing `
        --image="gcr.io/$ProjectId/aura-marketing:latest" `
        --region=$Region `
        --platform=managed `
        --allow-unauthenticated `
        --port=3000 `
        --memory=512Mi `
        --cpu=1 `
        --min-instances=0 `
        --max-instances=5 `
        --set-env-vars="NODE_ENV=production"
} catch {
    Write-Host "Marketing service exists" -ForegroundColor Yellow
}

# Dashboard app
Write-Host "Creating dashboard service..." -ForegroundColor Gray
try {
    gcloud run deploy aura-dashboard `
        --image="gcr.io/$ProjectId/aura-dashboard:latest" `
        --region=$Region `
        --platform=managed `
        --allow-unauthenticated `
        --port=3000 `
        --memory=1Gi `
        --cpu=1 `
        --min-instances=0 `
        --max-instances=10 `
        --set-env-vars="NODE_ENV=production"
} catch {
    Write-Host "Dashboard service exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Basic setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Blue
Write-Host "1. Set up your environment variables in Cloud Run services"
Write-Host "2. Configure your domain DNS settings"
Write-Host "3. Set up SSL certificates"
Write-Host "4. Connect your GitHub repository to Cloud Build"
Write-Host ""

# Get service URLs
$marketingUrl = gcloud run services describe aura-marketing --region=$Region --format="value(status.url)"
$dashboardUrl = gcloud run services describe aura-dashboard --region=$Region --format="value(status.url)"

Write-Host "🌐 Service URLs:" -ForegroundColor Blue
Write-Host "Marketing: $marketingUrl"
Write-Host "Dashboard: $dashboardUrl"
Write-Host ""
Write-Host "Run '.\deploy\configure-domains.ps1' next to set up custom domains." -ForegroundColor Yellow