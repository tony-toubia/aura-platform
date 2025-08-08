#!/bin/bash

# Bash script to push .env.production secrets to Google Cloud Secret Manager
# This script reads the .env.production file and creates/updates secrets in GCP

set -e

PROJECT_ID="aura-platform-467500"
ENV_FILE=".env.production"

echo "🔐 Pushing secrets from $ENV_FILE to Google Cloud Secret Manager"
echo "📁 Project: $PROJECT_ID"
echo ""

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found!"
    exit 1
fi

# Function to create or update a secret
push_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    
    if [ -z "$SECRET_VALUE" ]; then
        echo "⚠️  Skipping $SECRET_NAME (empty value)"
        return
    fi
    
    echo "📤 Pushing secret: $SECRET_NAME"
    
    # Check if secret exists
    if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID >/dev/null 2>&1; then
        # Secret exists, create a new version
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID >/dev/null
        echo "✅ Updated $SECRET_NAME"
    else
        # Secret doesn't exist, create it
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=- --project=$PROJECT_ID >/dev/null
        echo "✅ Created $SECRET_NAME"
        
        # Grant access to Cloud Run service account
        PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
        SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
        
        gcloud secrets add-iam-policy-binding $SECRET_NAME \
            --member="serviceAccount:$SERVICE_ACCOUNT" \
            --role="roles/secretmanager.secretAccessor" \
            --project=$PROJECT_ID >/dev/null
        echo "   🔓 Granted access to Cloud Run service account"
    fi
}

# Read .env.production file into associative array
echo "📖 Reading $ENV_FILE..."
declare -A env_vars

while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ ! "$key" =~ ^[[:space:]]*# ]] && [[ -n "$key" ]]; then
        # Remove leading/trailing whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        # Remove quotes if present
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        env_vars["$key"]="$value"
    fi
done < "$ENV_FILE"

# Define the mapping of env vars to secret names
declare -A secret_mappings=(
    ["OPENAI_API_KEY"]="OPENAI_API_KEY"
    ["JWT_SECRET"]="JWT_SECRET"
    ["SUPABASE_SERVICE_ROLE_KEY"]="SUPABASE_SERVICE_ROLE_KEY"
    ["GOOGLE_CLIENT_SECRET"]="GOOGLE_CLIENT_SECRET"
    ["MICROSOFT_CLIENT_SECRET"]="MICROSOFT_CLIENT_SECRET"
    ["STRAVA_CLIENT_SECRET"]="STRAVA_CLIENT_SECRET"
    ["NEXT_PUBLIC_OPENWEATHER_API_KEY"]="OPENWEATHER_API_KEY"
    ["NEWS_API_KEY"]="NEWS_API_KEY"
    # Note: Stripe secrets are already set up, but we'll update them if needed
    ["STRIPE_SECRET_KEY"]="STRIPE_SECRET_KEY"
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]="STRIPE_PUBLISHABLE_KEY"
    ["STRIPE_WEBHOOK_SECRET"]="STRIPE_WEBHOOK_SECRET"
    ["STRIPE_PERSONAL_PRICE_ID"]="STRIPE_PERSONAL_PRICE_ID"
    ["STRIPE_FAMILY_PRICE_ID"]="STRIPE_FAMILY_PRICE_ID"
    ["STRIPE_BUSINESS_PRICE_ID"]="STRIPE_BUSINESS_PRICE_ID"
)

echo ""
echo "🚀 Pushing secrets to Google Cloud Secret Manager..."
echo ""

# Push each secret
for env_key in "${!secret_mappings[@]}"; do
    secret_name="${secret_mappings[$env_key]}"
    if [ -n "${env_vars[$env_key]}" ]; then
        push_secret "$secret_name" "${env_vars[$env_key]}"
    else
        echo "⚠️  $env_key not found in $ENV_FILE"
    fi
done

echo ""
echo "✅ Secret push complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Cloud Build trigger substitution variables:"
echo "   - _SUPABASE_ANON_KEY = ${env_vars[NEXT_PUBLIC_SUPABASE_ANON_KEY]}"
echo "   - _GOOGLE_CLIENT_ID = ${env_vars[NEXT_PUBLIC_GOOGLE_CLIENT_ID]}"
echo "   - _MICROSOFT_CLIENT_ID = ${env_vars[NEXT_PUBLIC_MICROSOFT_CLIENT_ID]}"
echo "   - _STRAVA_CLIENT_ID = ${env_vars[NEXT_PUBLIC_STRAVA_CLIENT_ID]}"
echo ""
echo "2. Deploy using: gcloud builds submit --config=cloudbuild-simple.yaml"