# Domain Configuration Script for Aura Platform (PowerShell)
# This script helps configure custom domains for your Cloud Run services

param(
    [string]$ProjectId = "aura-platform-prod",
    [string]$Region = "us-central1",
    [string]$MarketingDomain = "aura-link.app",
    [string]$DashboardDomain = "dash.aura-link.app"
)

$ErrorActionPreference = "Stop"

Write-Host "🌐 Configuring custom domains for Aura Platform" -ForegroundColor Green
Write-Host ""

# Get service URLs
$marketingUrl = gcloud run services describe aura-marketing --region=$Region --format="value(status.url)"
$dashboardUrl = gcloud run services describe aura-dashboard --region=$Region --format="value(status.url)"

Write-Host "Current service URLs:" -ForegroundColor Blue
Write-Host "Marketing: $marketingUrl"
Write-Host "Dashboard: $dashboardUrl"
Write-Host ""

# Map custom domains
Write-Host "🔗 Mapping custom domains..." -ForegroundColor Blue

# Map marketing domain
try {
    gcloud run domain-mappings create `
        --service=aura-marketing `
        --domain=$MarketingDomain `
        --region=$Region
} catch {
    Write-Host "Marketing domain mapping already exists" -ForegroundColor Yellow
}

# Map dashboard domain
try {
    gcloud run domain-mappings create `
        --service=aura-dashboard `
        --domain=$DashboardDomain `
        --region=$Region
} catch {
    Write-Host "Dashboard domain mapping already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 DNS Configuration Required:" -ForegroundColor Blue
Write-Host ""
Write-Host "Add these DNS records to your domain registrar (GoDaddy):" -ForegroundColor Yellow
Write-Host ""

# Get DNS records for marketing domain
Write-Host "For $MarketingDomain:" -ForegroundColor Green
$marketingRecords = gcloud run domain-mappings describe $MarketingDomain --region=$Region --format="value(status.resourceRecords[].name,status.resourceRecords[].rrdata)"
if ($marketingRecords) {
    Write-Host "  Type: CNAME" -ForegroundColor White
    Write-Host "  Name: @" -ForegroundColor White
    Write-Host "  Value: ghs.googlehosted.com" -ForegroundColor White
}

Write-Host ""
Write-Host "For $DashboardDomain:" -ForegroundColor Green
$dashboardRecords = gcloud run domain-mappings describe $DashboardDomain --region=$Region --format="value(status.resourceRecords[].name,status.resourceRecords[].rrdata)"
if ($dashboardRecords) {
    Write-Host "  Type: CNAME" -ForegroundColor White
    Write-Host "  Name: dash" -ForegroundColor White
    Write-Host "  Value: ghs.googlehosted.com" -ForegroundColor White
}

Write-Host ""
Write-Host "⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "1. DNS propagation can take up to 48 hours"
Write-Host "2. SSL certificates will be automatically provisioned after DNS is configured"
Write-Host "3. You can check domain mapping status with:"
Write-Host "   gcloud run domain-mappings list --region=$Region"
Write-Host ""
Write-Host "🔍 Monitor certificate status:" -ForegroundColor Blue
Write-Host "   gcloud run domain-mappings describe $MarketingDomain --region=$Region"
Write-Host "   gcloud run domain-mappings describe $DashboardDomain --region=$Region"