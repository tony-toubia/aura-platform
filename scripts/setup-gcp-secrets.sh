#!/bin/bash

# Script to set up secrets in Google Cloud Secret Manager
# Run this script after setting the appropriate values for each secret

set -e

PROJECT_ID="aura-platform-467500"

echo "🔐 Setting up secrets in Google Cloud Secret Manager for project: $PROJECT_ID"
echo "⚠️  Make sure to replace the placeholder values with your actual secrets!"
echo ""

# Function to create or update a secret
create_or_update_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    
    echo "Creating/updating secret: $SECRET_NAME"
    
    # Check if secret exists
    if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID >/dev/null 2>&1; then
        # Secret exists, create a new version
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID
    else
        # Secret doesn't exist, create it
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=- --project=$PROJECT_ID
    fi
}

# API Keys and Tokens
echo "📝 Setting up API keys and tokens..."
create_or_update_secret "OPENAI_API_KEY" "YOUR_OPENAI_API_KEY_HERE"
create_or_update_secret "JWT_SECRET" "YOUR_JWT_SECRET_HERE"
create_or_update_secret "SUPABASE_SERVICE_ROLE_KEY" "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE"
create_or_update_secret "OPENWEATHER_API_KEY" "YOUR_OPENWEATHER_API_KEY_HERE"
create_or_update_secret "NEWS_API_KEY" "YOUR_NEWS_API_KEY_HERE"

# OAuth Credentials
echo "🔑 Setting up OAuth credentials..."
create_or_update_secret "GOOGLE_CLIENT_SECRET" "YOUR_GOOGLE_CLIENT_SECRET_HERE"
create_or_update_secret "MICROSOFT_CLIENT_SECRET" "YOUR_MICROSOFT_CLIENT_SECRET_HERE"
create_or_update_secret "STRAVA_CLIENT_SECRET" "YOUR_STRAVA_CLIENT_SECRET_HERE"

# Grant access to the default compute service account
echo "🔓 Granting access to Cloud Run service account..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

SECRETS=(
    "OPENAI_API_KEY"
    "JWT_SECRET"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENWEATHER_API_KEY"
    "NEWS_API_KEY"
    "GOOGLE_CLIENT_SECRET"
    "MICROSOFT_CLIENT_SECRET"
    "STRAVA_CLIENT_SECRET"
)

for SECRET in "${SECRETS[@]}"; do
    echo "Granting access to $SECRET..."
    gcloud secrets add-iam-policy-binding $SECRET \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID
done

echo ""
echo "✅ Secret setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit this script and replace all placeholder values with your actual secrets"
echo "2. Run the script again to create/update the secrets"
echo "3. Configure your Cloud Build trigger with these substitution variables:"
echo "   - _SUPABASE_ANON_KEY: Your Supabase anonymous key"
echo "   - _GOOGLE_CLIENT_ID: Your Google OAuth client ID"
echo "   - _MICROSOFT_CLIENT_ID: Your Microsoft OAuth client ID"
echo "   - _STRAVA_CLIENT_ID: Your Strava OAuth client ID"
echo "4. Deploy using: gcloud builds submit --config=cloudbuild-simple.yaml"