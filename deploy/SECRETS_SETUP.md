# Setting Up Secrets in Google Cloud Secret Manager

This guide explains how to set up the required secrets for the Aura Platform deployment.

## Required Secrets

The following secrets need to be created in Google Cloud Secret Manager:

### API Keys and Tokens
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `JWT_SECRET` - JWT secret for authentication
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENWEATHER_API_KEY` - OpenWeather API key
- `NEWS_API_KEY` - News API key

### OAuth Credentials
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MICROSOFT_CLIENT_SECRET` - Microsoft OAuth client secret
- `STRAVA_CLIENT_SECRET` - Strava OAuth client secret

### Stripe Configuration (Already configured)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_PERSONAL_PRICE_ID` - Stripe price ID for personal plan
- `STRIPE_FAMILY_PRICE_ID` - Stripe price ID for family plan
- `STRIPE_BUSINESS_PRICE_ID` - Stripe price ID for business plan

## Creating Secrets

To create a secret in Google Cloud Secret Manager:

```bash
# Create a secret
echo -n "your-secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# Example:
echo -n "sk-proj-your-openai-key" | gcloud secrets create OPENAI_API_KEY --data-file=-
```

## Granting Access

Ensure the Cloud Run service account has access to read these secrets:

```bash
# Grant access to the default compute service account
gcloud secrets add-iam-policy-binding SECRET_NAME \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Build-Time Variables

For public client IDs that are needed at build time, configure them in your Cloud Build trigger:

1. Go to Cloud Build Triggers
2. Edit your trigger
3. Add substitution variables:
   - `_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `_MICROSOFT_CLIENT_ID`: Your Microsoft OAuth client ID
   - `_STRAVA_CLIENT_ID`: Your Strava OAuth client ID

## Deployment

Once all secrets are configured, you can deploy using:

```bash
# Using the simple build configuration
gcloud builds submit --config=cloudbuild-simple.yaml

# Or using the full build configuration
gcloud builds submit --config=cloudbuild.yaml
```

## Security Best Practices

1. Never commit secrets to version control
2. Use separate secrets for development and production
3. Rotate secrets regularly
4. Limit access to secrets using IAM policies
5. Monitor secret access in Cloud Audit Logs