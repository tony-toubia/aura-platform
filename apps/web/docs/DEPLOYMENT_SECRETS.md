# Production Deployment: Secrets Management

This guide explains how to set up secure secrets management for production deployment using Google Cloud Secret Manager.

## Overview

In production, all sensitive API keys and secrets are stored in Google Cloud Secret Manager instead of environment variables. This provides:

- **Security**: Secrets are encrypted at rest and in transit
- **Access Control**: Fine-grained IAM permissions
- **Audit Logging**: Track who accesses secrets and when
- **Rotation**: Easy secret rotation without code changes
- **Version Control**: Maintain multiple versions of secrets

## Setup Instructions

### 1. Enable Google Cloud Secret Manager API

```bash
gcloud services enable secretmanager.googleapis.com
```

### 2. Create Secrets in Google Cloud

Create the following secrets in your GCP project:

```bash
# OpenWeather API Key
echo -n "your-openweather-api-key" | gcloud secrets create openweather-api-key --data-file=-

# News API Key
echo -n "your-news-api-key" | gcloud secrets create news-api-key --data-file=-

# OpenAI API Key
echo -n "your-openai-api-key" | gcloud secrets create openai-api-key --data-file=-

# Stripe Secret Key
echo -n "your-stripe-secret-key" | gcloud secrets create stripe-secret-key --data-file=-

# Supabase Service Role Key
echo -n "your-supabase-service-role-key" | gcloud secrets create supabase-service-role-key --data-file=-

# OAuth Client Secrets
echo -n "your-google-client-secret" | gcloud secrets create google-client-secret --data-file=-
echo -n "your-microsoft-client-secret" | gcloud secrets create microsoft-client-secret --data-file=-
echo -n "your-strava-client-secret" | gcloud secrets create strava-client-secret --data-file=-

# Other secrets
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your-movebank-password" | gcloud secrets create movebank-password --data-file=-
```

### 3. Service Account Setup

#### For Google Cloud Run / App Engine:

The default service account will automatically have access if you grant it the Secret Manager Secret Accessor role:

```bash
# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Grant access to the default service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

#### For Google Kubernetes Engine (GKE):

Use Workload Identity:

```bash
# Create a Kubernetes service account
kubectl create serviceaccount aura-platform

# Create a Google service account
gcloud iam service-accounts create aura-platform-gsa

# Bind the accounts
gcloud iam service-accounts add-iam-policy-binding \
    aura-platform-gsa@$PROJECT_ID.iam.gserviceaccount.com \
    --role roles/iam.workloadIdentityUser \
    --member "serviceAccount:$PROJECT_ID.svc.id.goog[default/aura-platform]"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:aura-platform-gsa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Annotate the Kubernetes service account
kubectl annotate serviceaccount aura-platform \
    iam.gke.io/gcp-service-account=aura-platform-gsa@$PROJECT_ID.iam.gserviceaccount.com
```

#### For External Servers:

Create a service account key:

```bash
# Create service account
gcloud iam service-accounts create aura-platform-external

# Grant Secret Manager access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:aura-platform-external@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Create and download key
gcloud iam service-accounts keys create ~/aura-platform-key.json \
    --iam-account=aura-platform-external@$PROJECT_ID.iam.gserviceaccount.com
```

### 4. Environment Variables for Production

Set these environment variables in your production environment:

```bash
# For Google Cloud environments (Cloud Run, App Engine, GKE)
GOOGLE_CLOUD_PROJECT=your-project-id
NODE_ENV=production

# For external servers
GOOGLE_APPLICATION_CREDENTIALS=/path/to/aura-platform-key.json
GOOGLE_CLOUD_PROJECT=your-project-id
NODE_ENV=production

# Public environment variables (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Client IDs are safe to expose
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-microsoft-client-id
NEXT_PUBLIC_STRAVA_CLIENT_ID=your-strava-client-id
```

### 5. Vercel Deployment

For Vercel deployment, you'll need to:

1. Create a service account with Secret Manager access (as shown above)
2. Generate a service account key
3. Base64 encode the key:
   ```bash
   base64 ~/aura-platform-key.json | tr -d '\n'
   ```
4. Add to Vercel environment variables:
   ```
   GOOGLE_APPLICATION_CREDENTIALS_BASE64=<base64-encoded-key>
   GOOGLE_CLOUD_PROJECT=your-project-id
   NODE_ENV=production
   ```
5. Add a build script to decode the credentials:
   ```json
   // package.json
   {
     "scripts": {
       "vercel-build": "node scripts/setup-gcp-credentials.js && next build"
     }
   }
   ```
   
   ```javascript
   // scripts/setup-gcp-credentials.js
   const fs = require('fs');
   const path = require('path');
   
   if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
     const keyPath = path.join('/tmp', 'gcp-key.json');
     const key = Buffer.from(
       process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
       'base64'
     ).toString('utf-8');
     
     fs.writeFileSync(keyPath, key);
     process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
   }
   ```

## Security Best Practices

1. **Never commit secrets to version control**
   - Use `.gitignore` to exclude `.env` files
   - Review commits before pushing

2. **Use least privilege principle**
   - Grant only necessary permissions to service accounts
   - Use separate service accounts for different environments

3. **Rotate secrets regularly**
   - Update secrets in Secret Manager
   - The application will automatically use the latest version

4. **Monitor access**
   - Enable audit logging in GCP
   - Set up alerts for unusual access patterns

5. **Use secret versions**
   - Keep previous versions for rollback
   - Test new secrets in staging first

## Local Development

For local development, continue using `.env.local` files:

```bash
# .env.local (not committed to git)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-dev-key
NEWS_API_KEY=your-dev-key
OPENAI_API_KEY=your-dev-key
# ... other development keys
```

The `SecretManager` class automatically falls back to environment variables when not in production.

## Troubleshooting

### Error: "Missing GOOGLE_CLOUD_PROJECT"
- Ensure the `GOOGLE_CLOUD_PROJECT` or `GCP_PROJECT` environment variable is set
- For GCP services, this is usually set automatically

### Error: "Permission denied accessing secret"
- Check IAM permissions for the service account
- Ensure the service account has `roles/secretmanager.secretAccessor`

### Error: "Secret not found"
- Verify the secret name matches exactly (case-sensitive)
- Check that the secret exists: `gcloud secrets list`

### Error: "Application Default Credentials not found"
- For external servers, ensure `GOOGLE_APPLICATION_CREDENTIALS` points to the key file
- For GCP services, ensure the default service account has proper permissions

## Migration Checklist

- [ ] Enable Secret Manager API in GCP
- [ ] Create all required secrets in Secret Manager
- [ ] Set up service account with proper permissions
- [ ] Configure environment variables for production
- [ ] Test secret access in staging environment
- [ ] Update CI/CD pipeline with GCP credentials
- [ ] Deploy to production
- [ ] Verify all features work correctly
- [ ] Remove any hardcoded secrets from code
- [ ] Rotate all secrets after migration

## Support

For issues or questions about secrets management:
1. Check the GCP Secret Manager documentation
2. Review application logs for detailed error messages
3. Verify IAM permissions in GCP Console
4. Test secret access using `gcloud` CLI