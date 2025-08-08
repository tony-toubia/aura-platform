# Secret Migration Status

## ✅ Already Configured in Google Cloud Secret Manager

The following Stripe secrets are already set up:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PERSONAL_PRICE_ID`
- `STRIPE_FAMILY_PRICE_ID`
- `STRIPE_BUSINESS_PRICE_ID`

## ❌ Still Need to be Created in Secret Manager

The following secrets need to be created:

### API Keys and Tokens
- `OPENAI_API_KEY` - Required for AI features
- `JWT_SECRET` - Required for authentication
- `SUPABASE_SERVICE_ROLE_KEY` - Required for Supabase admin operations
- `OPENWEATHER_API_KEY` - Required for weather features (if used)
- `NEWS_API_KEY` - Required for news features (if used)

### OAuth Credentials
- `GOOGLE_CLIENT_SECRET` - Required for Google OAuth
- `MICROSOFT_CLIENT_SECRET` - Required for Microsoft OAuth
- `STRAVA_CLIENT_SECRET` - Required for Strava OAuth

## 📋 Quick Setup Commands

For each secret that needs to be created, use:

```bash
# Create a secret (replace YOUR_SECRET_VALUE with actual value)
echo -n "YOUR_SECRET_VALUE" | gcloud secrets create SECRET_NAME --data-file=-

# Grant access to Cloud Run
PROJECT_NUMBER=$(gcloud projects describe aura-platform-467500 --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding SECRET_NAME \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## 🔧 Cloud Build Trigger Configuration

You also need to configure these substitution variables in your Cloud Build trigger:
- `_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)
- `_GOOGLE_CLIENT_ID`: Your Google OAuth client ID (public)
- `_MICROSOFT_CLIENT_ID`: Your Microsoft OAuth client ID (public)
- `_STRAVA_CLIENT_ID`: Your Strava OAuth client ID (public)

These are public client IDs that are safe to expose but need to be provided at build time.

## 🚀 Deployment

Once all secrets are configured:

1. For a simple deployment:
   ```bash
   gcloud builds submit --config=cloudbuild-simple.yaml
   ```

2. For a full deployment (all services):
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

## 📝 Notes

- The deployment scripts have been updated to use `--update-secrets` flag to inject secrets at runtime
- No secrets are hardcoded in the repository anymore
- Public keys (like Supabase URL and anon key) are still in the deployment files as they're safe to expose
- All sensitive credentials are now managed through Google Cloud Secret Manager