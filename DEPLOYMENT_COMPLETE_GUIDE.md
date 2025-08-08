# Aura Platform - Complete Deployment Guide

## Overview
This guide summarizes the complete deployment setup for Aura Platform on Google Cloud Run with all environment variables properly configured through Google Cloud Secret Manager.

## What Has Been Set Up

### 1. Secrets in Google Cloud Secret Manager (14 total)
All sensitive environment variables are now stored securely:

**Stripe Configuration:**
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PERSONAL_PRICE_ID
- STRIPE_FAMILY_PRICE_ID
- STRIPE_BUSINESS_PRICE_ID

**API Keys & Authentication:**
- OPENAI_API_KEY
- JWT_SECRET
- SUPABASE_SERVICE_ROLE_KEY
- OPENWEATHER_API_KEY
- NEWS_API_KEY
- GOOGLE_CLIENT_SECRET
- MICROSOFT_CLIENT_SECRET
- STRAVA_CLIENT_SECRET

### 2. Cloud Build Trigger Variables
These public values are configured in your Cloud Build trigger:
- _SUPABASE_ANON_KEY
- _GOOGLE_CLIENT_ID
- _MICROSOFT_CLIENT_ID
- _STRAVA_CLIENT_ID

### 3. Service Account Permissions
The Cloud Run service account `205298800820-compute@developer.gserviceaccount.com` has been granted access to all secrets.

## Deployment Options

### Option 1: Automatic Deployment via Git Push
When you push to your repository, Cloud Build will automatically:
1. Build the Docker image
2. Push to Container Registry
3. Deploy to Cloud Run with all secrets

Use `cloudbuild.yaml` for this (already configured with trigger variables).

### Option 2: Manual Deployment via Cloud Build
```bash
gcloud builds submit --config=cloudbuild-manual.yaml --project=aura-platform-467500
```

### Option 3: Local Build and Deploy
```bash
# Make the script executable (on Unix/Linux/Mac)
chmod +x scripts/deploy-to-cloud-run.sh

# Run the deployment
./scripts/deploy-to-cloud-run.sh
```

## Verifying Your Deployment

### 1. Check Build Status
```bash
gcloud builds list --limit=5 --project=aura-platform-467500
```

### 2. Check Cloud Run Service
```bash
gcloud run services describe aura-dashboard --region=us-central1 --project=aura-platform-467500
```

### 3. Check Environment Variables
```bash
gcloud run services describe aura-dashboard \
  --region=us-central1 \
  --project=aura-platform-467500 \
  --format="value(spec.template.spec.containers[0].env[].name)"
```

### 4. View Logs
```bash
gcloud run services logs read aura-dashboard \
  --region=us-central1 \
  --project=aura-platform-467500 \
  --limit=50
```

## Service URLs
- **Production**: https://aura-dashboard-mn5srfeinq-uc.a.run.app
- **Marketing Site**: https://aura-marketing-mn5srfeinq-uc.a.run.app

## Troubleshooting

### If secrets are not loading:
1. Verify service account has access:
   ```bash
   gcloud secrets get-iam-policy OPENAI_API_KEY --project=aura-platform-467500
   ```

2. Check if secret exists:
   ```bash
   gcloud secrets versions list OPENAI_API_KEY --project=aura-platform-467500
   ```

### If build fails:
1. Check build logs:
   ```bash
   gcloud builds log BUILD_ID --project=aura-platform-467500
   ```

2. Verify Docker image builds locally:
   ```bash
   docker build -t test-build .
   ```

### If deployment fails:
1. Check Cloud Run logs for errors
2. Verify all required environment variables are set
3. Ensure service account has necessary permissions

## Updating Secrets

To update a secret value:
```bash
echo -n "new-secret-value" | gcloud secrets versions add SECRET_NAME --data-file=- --project=aura-platform-467500
```

The new version will be used on the next deployment.

## Files Created During Setup

- `cloudbuild.yaml` - For automatic deployments via triggers
- `cloudbuild-manual.yaml` - For manual Cloud Build submissions
- `scripts/push-secrets-to-gcp.js` - Push Stripe secrets to Secret Manager
- `scripts/push-all-secrets-to-gcp.js` - Push all additional secrets
- `scripts/grant-all-secrets-access.bat` - Grant service account access
- `scripts/deploy-to-cloud-run.sh` - Manual deployment script
- `scripts/CLOUD_BUILD_AND_DEPLOYMENT_GUIDE.md` - Detailed deployment guide

## Security Best Practices

1. Never commit secrets to your repository
2. Use Secret Manager for all sensitive values
3. Use trigger variables only for public values
4. Regularly rotate your secrets
5. Monitor access logs for your secrets

## Next Steps

1. Monitor your deployment at: https://console.cloud.google.com/run?project=aura-platform-467500
2. Set up monitoring and alerts
3. Configure custom domain if needed
4. Set up CI/CD pipeline for automatic deployments