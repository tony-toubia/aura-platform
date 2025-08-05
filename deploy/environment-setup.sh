#!/bin/bash

# Environment Variables Setup for Cloud Run Services
# This script helps configure environment variables for your deployed services

set -e

PROJECT_ID="aura-platform-prod"  # Change this to match your project ID
REGION="us-central1"

echo "🔧 Setting up environment variables for Cloud Run services"
echo ""

# Function to set environment variables for a service
set_env_vars() {
    local service_name=$1
    local env_vars=$2
    
    echo "Setting environment variables for $service_name..."
    gcloud run services update $service_name \
        --region=$REGION \
        --set-env-vars="$env_vars"
}

# Dashboard environment variables
echo "📝 Please provide the following environment variables for the dashboard:"
echo ""

read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -s -p "Supabase Service Role Key: " SUPABASE_SERVICE_KEY
echo ""
read -s -p "OpenAI API Key: " OPENAI_API_KEY
echo ""
read -s -p "Stripe Secret Key: " STRIPE_SECRET_KEY
echo ""
read -p "Stripe Publishable Key: " STRIPE_PUBLISHABLE_KEY
read -s -p "Stripe Webhook Secret: " STRIPE_WEBHOOK_SECRET
echo ""
read -p "Stripe Personal Price ID: " STRIPE_PERSONAL_PRICE_ID
read -p "Stripe Family Price ID: " STRIPE_FAMILY_PRICE_ID
read -p "Stripe Business Price ID: " STRIPE_BUSINESS_PRICE_ID

# Set dashboard environment variables
DASHBOARD_ENV_VARS="NODE_ENV=production,NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY,OPENAI_API_KEY=$OPENAI_API_KEY,STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY,STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET,STRIPE_PERSONAL_PRICE_ID=$STRIPE_PERSONAL_PRICE_ID,STRIPE_FAMILY_PRICE_ID=$STRIPE_FAMILY_PRICE_ID,STRIPE_BUSINESS_PRICE_ID=$STRIPE_BUSINESS_PRICE_ID"

set_env_vars "aura-dashboard" "$DASHBOARD_ENV_VARS"

# Marketing site environment variables (minimal)
MARKETING_ENV_VARS="NODE_ENV=production"
set_env_vars "aura-marketing" "$MARKETING_ENV_VARS"

echo ""
echo "✅ Environment variables configured successfully!"
echo ""
echo "🔄 Services are being updated. This may take a few minutes."
echo "You can monitor the deployment status with:"
echo "  gcloud run services list --region=$REGION"
echo ""
echo "🌐 Once updated, your services will be available at:"
echo "  Marketing: https://aura-link.app"
echo "  Dashboard: https://dash.aura-link.app"