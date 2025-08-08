# Environment Setup Guide

This guide explains how to properly configure environment variables for the Aura Platform to resolve Supabase authentication issues.

## Problem Solved

The error "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!" has been resolved by implementing a comprehensive environment variable management system.

## Key Changes Made

### 1. Centralized Environment Configuration
- Created `apps/web/lib/config/env.ts` for centralized environment variable management
- All Supabase clients now use this centralized configuration
- Added validation and error handling for missing environment variables

### 2. Updated Supabase Clients
- `apps/web/lib/supabase/client.ts` - Browser client with validation
- `apps/web/lib/supabase/browser.ts` - Direct browser client with validation  
- `apps/web/lib/supabase/server.server.ts` - Server client with validation

### 3. Deployment Scripts
- `deploy/deploy-with-env.sh` - Linux/Mac deployment with proper env vars
- `deploy/deploy-with-env.ps1` - Windows PowerShell deployment script
- Updated `cloudbuild.yaml` to use proper environment variable deployment

### 4. Environment Validation
- `scripts/validate-env.js` - Pre-deployment environment validation
- Test endpoint at `/api/test-supabase` for runtime validation

## Environment Variables Required

### Critical (Required for login to work)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://ahzmfkjtiiyuipweaktx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
NEXT_PUBLIC_APP_URL="https://app.aura-link.app"
NODE_ENV="production"
JWT_SECRET="your_secure_jwt_secret"
```

### Important (For full functionality)
```bash
OPENAI_API_KEY="your_openai_key"
NEXT_PUBLIC_OPENWEATHER_API_KEY="your_weather_key"
NEWS_API_KEY="your_news_key"
```

### Optional (OAuth features)
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="your_microsoft_client_id"
MICROSOFT_CLIENT_SECRET="your_microsoft_secret"
NEXT_PUBLIC_STRAVA_CLIENT_ID="your_strava_client_id"
STRAVA_CLIENT_SECRET="your_strava_secret"
```

## Deployment Process

### Option 1: Automated Deployment (Recommended)
```bash
# Trigger Cloud Build (automatically validates environment)
gcloud builds submit --config cloudbuild.yaml
```

### Option 2: Manual Deployment
```bash
# Validate environment first
node scripts/validate-env.js

# Deploy with proper environment variables
bash deploy/deploy-with-env.sh
# OR on Windows:
# powershell deploy/deploy-with-env.ps1
```

### Option 3: Direct gcloud deployment
```bash
# Use the deployment scripts which handle all environment variables
./deploy/deploy-with-env.sh
```

## Testing the Fix

### 1. Environment Validation
```bash
# Check if all required environment variables are set
node scripts/validate-env.js

# Generate environment template
node scripts/validate-env.js --template
```

### 2. Runtime Testing
```bash
# Test Supabase connection after deployment
curl https://app.aura-link.app/api/test-supabase
```

### 3. Login Testing
1. Go to https://app.aura-link.app/login
2. Try logging in with valid credentials
3. Should no longer see the Supabase client error

## Environment Management Best Practices

### 1. Local Development
- Use `.env.local` for local development
- Never commit sensitive keys to git
- Use the centralized `env.ts` configuration

### 2. Production Deployment
- Environment variables are set at Cloud Run deployment time
- Variables are validated before deployment
- Use the deployment scripts to ensure consistency

### 3. Environment Variable Hierarchy
1. Cloud Run environment variables (highest priority)
2. `.env.production` file
3. `.env.local` file
4. Default values in `env.ts` (lowest priority)

## Troubleshooting

### If login still fails:
1. Check Cloud Run logs: `gcloud logs read --service=aura-dashboard`
2. Test the environment endpoint: `/api/test-supabase`
3. Verify environment variables are set in Cloud Run console
4. Run environment validation: `node scripts/validate-env.js`

### If deployment fails:
1. Run validation script: `node scripts/validate-env.js`
2. Check that all critical environment variables are set
3. Ensure JWT_SECRET is not using the default value in production

## Security Notes

- All sensitive environment variables are set at deployment time
- No sensitive values are stored in the codebase
- JWT_SECRET must be changed from default value in production
- Service role keys are only used server-side

## Files Modified/Created

### Modified:
- `apps/web/lib/supabase/client.ts`
- `apps/web/lib/supabase/browser.ts`
- `apps/web/lib/supabase/server.server.ts`
- `apps/web/app/api/test-supabase/route.ts`
- `cloudbuild.yaml`

### Created:
- `apps/web/lib/config/env.ts`
- `deploy/deploy-with-env.sh`
- `deploy/deploy-with-env.ps1`
- `scripts/validate-env.js`
- `ENVIRONMENT_SETUP_GUIDE.md`

This comprehensive solution ensures that environment variables are properly managed, validated, and deployed, resolving the Supabase authentication issues permanently.