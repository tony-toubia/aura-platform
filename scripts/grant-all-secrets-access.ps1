# Grant Cloud Run service account access to all secrets

$SERVICE_ACCOUNT = "205298800820-compute@developer.gserviceaccount.com"
$PROJECT_ID = "aura-platform-467500"

Write-Host "Granting Cloud Run service account access to all secrets..." -ForegroundColor Green
Write-Host ""

# List of all secrets to grant access to
$secrets = @(
    "OPENAI_API_KEY",
    "JWT_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENWEATHER_API_KEY",
    "NEWS_API_KEY",
    "GOOGLE_CLIENT_SECRET",
    "MICROSOFT_CLIENT_SECRET",
    "STRAVA_CLIENT_SECRET"
)

# Grant access to each secret
foreach ($secret in $secrets) {
    Write-Host "Granting access to $secret..." -ForegroundColor Yellow
    
    $result = gcloud secrets add-iam-policy-binding $secret `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/secretmanager.secretAccessor" `
        --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully granted access to $secret" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to grant access to $secret" -ForegroundColor Red
        Write-Host $result
    }
    Write-Host ""
}

Write-Host "Done! Verifying all secrets..." -ForegroundColor Green
Write-Host ""

# List all secrets to verify
Write-Host "All secrets in project:" -ForegroundColor Cyan
gcloud secrets list --project=$PROJECT_ID --format='table(name.basename(),createTime)'