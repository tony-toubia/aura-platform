# Push Environment Secrets to Google Cloud Secret Manager

These scripts automate the process of pushing secrets from your `.env.production` file to Google Cloud Secret Manager.

## Prerequisites

1. Google Cloud SDK installed and authenticated
2. Appropriate permissions to create/update secrets in your GCP project
3. `.env.production` file in the root directory with your secrets

## Usage

### Windows (PowerShell)

```powershell
.\scripts\push-env-to-gcp-secrets.ps1
```

### Linux/Mac (Bash)

```bash
# First make the script executable
chmod +x scripts/push-env-to-gcp-secrets.sh

# Then run it
./scripts/push-env-to-gcp-secrets.sh
```

## What the Script Does

1. Reads your `.env.production` file
2. Extracts the following secrets and pushes them to Google Cloud Secret Manager:
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_CLIENT_SECRET`
   - `MICROSOFT_CLIENT_SECRET`
   - `STRAVA_CLIENT_SECRET`
   - `OPENWEATHER_API_KEY` (from `NEXT_PUBLIC_OPENWEATHER_API_KEY`)
   - `NEWS_API_KEY`
   - All Stripe secrets (will update if they already exist)

3. Automatically grants access to the Cloud Run service account for new secrets
4. Displays the substitution variables you need to configure in your Cloud Build trigger

## After Running the Script

1. The script will output the substitution variables you need to configure in your Cloud Build trigger:
   - `_SUPABASE_ANON_KEY`
   - `_GOOGLE_CLIENT_ID`
   - `_MICROSOFT_CLIENT_ID`
   - `_STRAVA_CLIENT_ID`

2. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers) and edit your trigger to add these substitution variables

3. Deploy your application:
   ```bash
   gcloud builds submit --config=cloudbuild-simple.yaml
   ```

## Security Notes

- Never commit `.env.production` to version control
- These scripts don't store or log secret values
- All secrets are transmitted securely to Google Cloud Secret Manager
- Make sure to delete any local copies of scripts that might contain secrets

## Troubleshooting

If you get permission errors:
1. Make sure you're authenticated: `gcloud auth login`
2. Set the correct project: `gcloud config set project aura-platform-467500`
3. Ensure you have the Secret Manager Admin role in your GCP project