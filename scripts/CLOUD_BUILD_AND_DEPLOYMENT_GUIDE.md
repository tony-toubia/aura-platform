# Complete Google Cloud Deployment Guide

## Summary of Secrets Created

### Stripe Secrets (Created First)
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_PUBLISHABLE_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ STRIPE_PERSONAL_PRICE_ID
- ✅ STRIPE_FAMILY_PRICE_ID
- ✅ STRIPE_BUSINESS_PRICE_ID

### Additional API & Auth Secrets (Created Second)
- ✅ OPENAI_API_KEY
- ✅ JWT_SECRET
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENWEATHER_API_KEY
- ✅ NEWS_API_KEY
- ✅ GOOGLE_CLIENT_SECRET
- ✅ MICROSOFT_CLIENT_SECRET
- ✅ STRAVA_CLIENT_SECRET

## Cloud Build Trigger Variables

These variables should be configured in your Cloud Build trigger settings. They are public/non-sensitive values that can be safely stored as substitution variables:

### Required Trigger Variables

```yaml
substitutions:
  _SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoem1ma2p0aWl5dWlwd2Vha3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mzc3OTksImV4cCI6MjA2ODIxMzc5OX0.adTiPqedJv1TvuDvj53HGA_jlZr23MJ_L3jiKDb0GTk'
  _GOOGLE_CLIENT_ID: '205298800820-4l2r0ro2m6lvc73g6id03r4fnbp25m52.apps.googleusercontent.com'
  _MICROSOFT_CLIENT_ID: '07a43345-3aa6-4444-8859-c44105e4769d'
  _STRAVA_CLIENT_ID: '170903'
```

### How to Add These in Google Cloud Console

1. Go to Cloud Build Triggers: https://console.cloud.google.com/cloud-build/triggers?project=aura-platform-467500
2. Click on your trigger to edit it
3. Scroll down to "Substitution variables"
4. Add each variable with the underscore prefix (e.g., `_SUPABASE_ANON_KEY`)
5. Save the trigger

## Complete Cloud Run Deployment Command

Here's the full deployment command with all secrets:

```bash
gcloud run deploy aura-dashboard \
  --region=us-central1 \
  --project=aura-platform-467500 \
  --image=gcr.io/aura-platform-467500/aura-dashboard:latest \
  --update-secrets=\
STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,\
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY:latest,\
STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,\
STRIPE_PERSONAL_PRICE_ID=STRIPE_PERSONAL_PRICE_ID:latest,\
STRIPE_FAMILY_PRICE_ID=STRIPE_FAMILY_PRICE_ID:latest,\
STRIPE_BUSINESS_PRICE_ID=STRIPE_BUSINESS_PRICE_ID:latest,\
OPENAI_API_KEY=OPENAI_API_KEY:latest,\
JWT_SECRET=JWT_SECRET:latest,\
SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,\
NEXT_PUBLIC_OPENWEATHER_API_KEY=OPENWEATHER_API_KEY:latest,\
NEWS_API_KEY=NEWS_API_KEY:latest,\
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,\
MICROSOFT_CLIENT_SECRET=MICROSOFT_CLIENT_SECRET:latest,\
STRAVA_CLIENT_SECRET=STRAVA_CLIENT_SECRET:latest \
  --set-env-vars=\
NEXT_PUBLIC_SUPABASE_ANON_KEY=${_SUPABASE_ANON_KEY},\
NEXT_PUBLIC_GOOGLE_CLIENT_ID=${_GOOGLE_CLIENT_ID},\
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=${_MICROSOFT_CLIENT_ID},\
NEXT_PUBLIC_STRAVA_CLIENT_ID=${_STRAVA_CLIENT_ID}
```

## cloudbuild.yaml Example

Here's an example `cloudbuild.yaml` that uses both secrets and trigger variables:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/aura-dashboard:$COMMIT_SHA', '.']
    
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/aura-dashboard:$COMMIT_SHA']
    
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
    - 'run'
    - 'deploy'
    - 'aura-dashboard'
    - '--image'
    - 'gcr.io/$PROJECT_ID/aura-dashboard:$COMMIT_SHA'
    - '--region'
    - 'us-central1'
    - '--platform'
    - 'managed'
    - '--update-secrets'
    - 'STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,STRIPE_PERSONAL_PRICE_ID=STRIPE_PERSONAL_PRICE_ID:latest,STRIPE_FAMILY_PRICE_ID=STRIPE_FAMILY_PRICE_ID:latest,STRIPE_BUSINESS_PRICE_ID=STRIPE_BUSINESS_PRICE_ID:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,JWT_SECRET=JWT_SECRET:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,NEXT_PUBLIC_OPENWEATHER_API_KEY=OPENWEATHER_API_KEY:latest,NEWS_API_KEY=NEWS_API_KEY:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,MICROSOFT_CLIENT_SECRET=MICROSOFT_CLIENT_SECRET:latest,STRAVA_CLIENT_SECRET=STRAVA_CLIENT_SECRET:latest'
    - '--set-env-vars'
    - 'NEXT_PUBLIC_SUPABASE_ANON_KEY=${_SUPABASE_ANON_KEY},NEXT_PUBLIC_GOOGLE_CLIENT_ID=${_GOOGLE_CLIENT_ID},NEXT_PUBLIC_MICROSOFT_CLIENT_ID=${_MICROSOFT_CLIENT_ID},NEXT_PUBLIC_STRAVA_CLIENT_ID=${_STRAVA_CLIENT_ID}'

# Use substitution variables from trigger
substitutions:
  _SUPABASE_ANON_KEY: ${_SUPABASE_ANON_KEY}
  _GOOGLE_CLIENT_ID: ${_GOOGLE_CLIENT_ID}
  _MICROSOFT_CLIENT_ID: ${_MICROSOFT_CLIENT_ID}
  _STRAVA_CLIENT_ID: ${_STRAVA_CLIENT_ID}

images:
- 'gcr.io/$PROJECT_ID/aura-dashboard:$COMMIT_SHA'
```

## Environment Variables Mapping

| Local .env Variable | Secret Manager Name | Cloud Run Env Variable |
|---------------------|---------------------|------------------------|
| STRIPE_SECRET_KEY | STRIPE_SECRET_KEY | STRIPE_SECRET_KEY |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | STRIPE_PUBLISHABLE_KEY | NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY |
| STRIPE_WEBHOOK_SECRET / NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET | STRIPE_WEBHOOK_SECRET | STRIPE_WEBHOOK_SECRET |
| STRIPE_PERSONAL_PRICE_ID | STRIPE_PERSONAL_PRICE_ID | STRIPE_PERSONAL_PRICE_ID |
| STRIPE_FAMILY_PRICE_ID | STRIPE_FAMILY_PRICE_ID | STRIPE_FAMILY_PRICE_ID |
| STRIPE_BUSINESS_PRICE_ID | STRIPE_BUSINESS_PRICE_ID | STRIPE_BUSINESS_PRICE_ID |
| OPENAI_API_KEY | OPENAI_API_KEY | OPENAI_API_KEY |
| JWT_SECRET | JWT_SECRET | JWT_SECRET |
| SUPABASE_SERVICE_ROLE_KEY | SUPABASE_SERVICE_ROLE_KEY | SUPABASE_SERVICE_ROLE_KEY |
| NEXT_PUBLIC_OPENWEATHER_API_KEY | OPENWEATHER_API_KEY | NEXT_PUBLIC_OPENWEATHER_API_KEY |
| NEWS_API_KEY | NEWS_API_KEY | NEWS_API_KEY |
| GOOGLE_CLIENT_SECRET | GOOGLE_CLIENT_SECRET | GOOGLE_CLIENT_SECRET |
| MICROSOFT_CLIENT_SECRET | MICROSOFT_CLIENT_SECRET | MICROSOFT_CLIENT_SECRET |
| STRAVA_CLIENT_SECRET | STRAVA_CLIENT_SECRET | STRAVA_CLIENT_SECRET |

## Verifying Everything is Set Up

1. **Check all secrets exist:**
   ```bash
   gcloud secrets list --project=aura-platform-467500
   ```

2. **Check service account has access to a specific secret:**
   ```bash
   gcloud secrets get-iam-policy OPENAI_API_KEY --project=aura-platform-467500
   ```

3. **After deployment, verify environment variables:**
   ```bash
   gcloud run services describe aura-dashboard \
     --region=us-central1 \
     --project=aura-platform-467500 \
     --format="value(spec.template.spec.containers[0].env[].name)"
   ```

## Important Notes

- Secrets are stored securely in Secret Manager and injected at runtime
- Trigger variables are for non-sensitive, public values only
- The `NEXT_PUBLIC_` prefix is important for Next.js client-side variables
- Always use the `latest` version tag for secrets to get automatic updates
- Service account `205298800820-compute@developer.gserviceaccount.com` has been granted access to all secrets

## Next Steps

1. Configure the Cloud Build trigger variables in the Google Cloud Console
2. Update your `cloudbuild.yaml` file with the deployment configuration
3. Test your deployment with a commit to trigger the build
4. Monitor Cloud Run logs for any missing environment variables