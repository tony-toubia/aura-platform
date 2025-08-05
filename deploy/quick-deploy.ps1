# Quick Deployment Script for Aura Platform
# This script performs the initial deployment setup

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [string]$ProjectId = "aura-platform-prod"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Quick Deploy - Aura Platform" -ForegroundColor Green
Write-Host "GitHub Username: $GitHubUsername" -ForegroundColor Yellow
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pnpm install

# Step 2: Build the applications locally to test
Write-Host "🏗️ Building applications..." -ForegroundColor Blue
pnpm build

# Step 3: Set up GCP project
Write-Host "☁️ Setting up Google Cloud Platform..." -ForegroundColor Blue
& ".\deploy\gcp-setup.ps1" -ProjectId $ProjectId -GitHubUsername $GitHubUsername

# Step 4: Initial deployment
Write-Host "🚀 Triggering initial deployment..." -ForegroundColor Blue
Write-Host "Pushing to GitHub to trigger Cloud Build..." -ForegroundColor Gray

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository. Please initialize git first:" -ForegroundColor Red
    Write-Host "git init" -ForegroundColor White
    Write-Host "git add ." -ForegroundColor White
    Write-Host "git commit -m 'Initial commit'" -ForegroundColor White
    Write-Host "git branch -M main" -ForegroundColor White
    Write-Host "git remote add origin https://github.com/$GitHubUsername/aura-platform.git" -ForegroundColor White
    Write-Host "git push -u origin main" -ForegroundColor White
    exit 1
}

# Add all files and commit
git add .
git commit -m "Deploy: Initial deployment setup with domain configuration" -ErrorAction SilentlyContinue
git push origin main

Write-Host ""
Write-Host "✅ Quick deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Blue
Write-Host "1. Go to Google Cloud Console to monitor the build"
Write-Host "2. Run .\deploy\configure-domains.ps1 to set up custom domains"
Write-Host "3. Configure DNS records in GoDaddy"
Write-Host "4. Run .\deploy\environment-setup.ps1 to set environment variables"
Write-Host ""
Write-Host "🌐 Monitor build progress:" -ForegroundColor Yellow
Write-Host "https://console.cloud.google.com/cloud-build/builds?project=$ProjectId"