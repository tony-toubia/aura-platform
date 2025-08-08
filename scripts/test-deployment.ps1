# Test deployment script
# This script tests the deployed application to ensure the Supabase fix is working

$ErrorActionPreference = "Stop"

$APP_URL = "https://app.aura-link.app"
$TEST_ENDPOINTS = @(
    "/api/test-supabase",
    "/login"
)

Write-Host "🧪 Testing deployment at $APP_URL" -ForegroundColor Green
Write-Host ""

foreach ($endpoint in $TEST_ENDPOINTS) {
    $url = "$APP_URL$endpoint"
    Write-Host "Testing: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 30 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
            
            # Special handling for test-supabase endpoint
            if ($endpoint -eq "/api/test-supabase") {
                try {
                    $jsonResponse = $response.Content | ConvertFrom-Json
                    if ($jsonResponse.success -eq $true) {
                        Write-Host "   ✅ Supabase connection test passed" -ForegroundColor Green
                    } else {
                        Write-Host "   ❌ Supabase connection test failed: $($jsonResponse.error)" -ForegroundColor Red
                    }
                } catch {
                    Write-Host "   ⚠️  Could not parse JSON response" -ForegroundColor Yellow
                }
            }
            
            # Special handling for login page
            if ($endpoint -eq "/login") {
                if ($response.Content -like "*Supabase*error*" -or $response.Content -like "*required to create a Supabase client*") {
                    Write-Host "   ❌ Login page still shows Supabase errors" -ForegroundColor Red
                } else {
                    Write-Host "   ✅ Login page loaded without Supabase errors" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "⚠️  $endpoint - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $endpoint - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "- If all tests pass, the Supabase authentication issue should be resolved" -ForegroundColor White
Write-Host "- Try logging in at: $APP_URL/login" -ForegroundColor White
Write-Host "- Marketing site should still be accessible at: https://aura-link.app" -ForegroundColor White