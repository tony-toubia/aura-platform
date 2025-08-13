# PowerShell script to generate a secure CRON_SECRET
# Generates a cryptographically secure random string

# Generate 32 random bytes and convert to base64 (results in 44 chars)
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

Write-Host "========================================" -ForegroundColor Green
Write-Host "Generated Secure CRON_SECRET" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your new CRON_SECRET:" -ForegroundColor Yellow
Write-Host $secret -ForegroundColor Cyan
Write-Host ""
Write-Host "This secret is:" -ForegroundColor Green
Write-Host "✓ 44 characters long (base64 encoded)" -ForegroundColor Green
Write-Host "✓ Cryptographically secure" -ForegroundColor Green
Write-Host "✓ URL-safe" -ForegroundColor Green
Write-Host ""
Write-Host "Copy this value to your .env.local file" -ForegroundColor Yellow
Write-Host "Replace the line: CRON_SECRET=..." -ForegroundColor Yellow
Write-Host ""

# Also save to clipboard if possible
try {
    Set-Clipboard -Value $secret
    Write-Host "✓ Secret copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "Could not copy to clipboard automatically" -ForegroundColor Gray
}