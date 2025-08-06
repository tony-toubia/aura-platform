#!/bin/bash

# Script to set environment variables for Aura Platform on Google Cloud Run

echo "Setting environment variables for Aura Dashboard..."

# Set environment variables for the dashboard/web app
gcloud run services update aura-dashboard \
  --region=us-central1 \
  --update-env-vars \
NODE_ENV=production,\
NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}",\
NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}",\
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}",\
OPENAI_API_KEY="${OPENAI_API_KEY}",\
NEXT_PUBLIC_OPENWEATHER_API_KEY="${NEXT_PUBLIC_OPENWEATHER_API_KEY}",\
NEWS_API_KEY="${NEWS_API_KEY}",\
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}",\
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}",\
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}",\
STRIPE_STARTER_PRICE_ID="${STRIPE_STARTER_PRICE_ID}",\
STRIPE_PERSONAL_PRICE_ID="${STRIPE_PERSONAL_PRICE_ID}",\
STRIPE_FAMILY_PRICE_ID="${STRIPE_FAMILY_PRICE_ID}",\
STRIPE_BUSINESS_PRICE_ID="${STRIPE_BUSINESS_PRICE_ID}",\
NEXT_PUBLIC_GOOGLE_CLIENT_ID="${NEXT_PUBLIC_GOOGLE_CLIENT_ID}",\
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}",\
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="${NEXT_PUBLIC_MICROSOFT_CLIENT_ID}",\
MICROSOFT_CLIENT_SECRET="${MICROSOFT_CLIENT_SECRET}",\
NEXT_PUBLIC_STRAVA_CLIENT_ID="${NEXT_PUBLIC_STRAVA_CLIENT_ID}",\
STRAVA_CLIENT_SECRET="${STRAVA_CLIENT_SECRET}",\
MOVEBANK_USER="${MOVEBANK_USER}",\
MOVEBANK_PASS="${MOVEBANK_PASS}",\
NEXTAUTH_URL="https://app.aura-link.app",\
NEXT_PUBLIC_API_URL="https://app.aura-link.app"

echo "Environment variables set for Aura Dashboard."

echo "Setting environment variables for Marketing site..."

# Set environment variables for the marketing site
gcloud run services update aura-marketing \
  --region=us-central1 \
  --update-env-vars \
NODE_ENV=production,\
NEXT_PUBLIC_DASHBOARD_URL="https://app.aura-link.app"

echo "Environment variables set for Marketing site."
echo "Done!"