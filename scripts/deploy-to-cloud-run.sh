#!/bin/bash

# Deploy to Cloud Run manually
# This script can be used to trigger a deployment without going through Cloud Build

echo "Starting deployment to Cloud Run..."
echo "Project: aura-platform-467500"
echo "Service: aura-dashboard"
echo "Region: us-central1"
echo ""

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "Error: Not authenticated with gcloud. Please run 'gcloud auth login'"
    exit 1
fi

# Set the project
gcloud config set project aura-platform-467500

# Build the Docker image locally
echo "Building Docker image..."
docker build -t gcr.io/aura-platform-467500/aura-web:manual-deploy \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://ahzmfkjtiiyuipweaktx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoem1ma2p0aWl5dWlwd2Vha3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mzc3OTksImV4cCI6MjA2ODIxMzc5OX0.adTiPqedJv1TvuDvj53HGA_jlZr23MJ_L3jiKDb0GTk \
  --build-arg NEXT_PUBLIC_APP_URL=https://aura-dashboard-mn5srfeinq-uc.a.run.app \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=205298800820-4l2r0ro2m6lvc73g6id03r4fnbp25m52.apps.googleusercontent.com \
  --build-arg NEXT_PUBLIC_MICROSOFT_CLIENT_ID=07a43345-3aa6-4444-8859-c44105e4769d \
  --build-arg NEXT_PUBLIC_STRAVA_CLIENT_ID=170903 \
  .

# Push to Container Registry
echo ""
echo "Pushing image to Container Registry..."
docker push gcr.io/aura-platform-467500/aura-web:manual-deploy

# Deploy to Cloud Run
echo ""
echo "Deploying to Cloud Run..."
gcloud run deploy aura-dashboard \
  --image gcr.io/aura-platform-467500/aura-web:manual-deploy \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --update-secrets STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest \
  --update-secrets NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY:latest \
  --update-secrets STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest \
  --update-secrets STRIPE_PERSONAL_PRICE_ID=STRIPE_PERSONAL_PRICE_ID:latest \
  --update-secrets STRIPE_FAMILY_PRICE_ID=STRIPE_FAMILY_PRICE_ID:latest \
  --update-secrets STRIPE_BUSINESS_PRICE_ID=STRIPE_BUSINESS_PRICE_ID:latest \
  --update-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest \
  --update-secrets JWT_SECRET=JWT_SECRET:latest \
  --update-secrets SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest \
  --update-secrets NEXT_PUBLIC_OPENWEATHER_API_KEY=OPENWEATHER_API_KEY:latest \
  --update-secrets NEWS_API_KEY=NEWS_API_KEY:latest \
  --update-secrets GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest \
  --update-secrets MICROSOFT_CLIENT_SECRET=MICROSOFT_CLIENT_SECRET:latest \
  --update-secrets STRAVA_CLIENT_SECRET=STRAVA_CLIENT_SECRET:latest \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL=https://ahzmfkjtiiyuipweaktx.supabase.co \
  --set-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoem1ma2p0aWl5dWlwd2Vha3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mzc3OTksImV4cCI6MjA2ODIxMzc5OX0.adTiPqedJv1TvuDvj53HGA_jlZr23MJ_L3jiKDb0GTk \
  --set-env-vars NEXT_PUBLIC_GOOGLE_CLIENT_ID=205298800820-4l2r0ro2m6lvc73g6id03r4fnbp25m52.apps.googleusercontent.com \
  --set-env-vars NEXT_PUBLIC_MICROSOFT_CLIENT_ID=07a43345-3aa6-4444-8859-c44105e4769d \
  --set-env-vars NEXT_PUBLIC_STRAVA_CLIENT_ID=170903 \
  --set-env-vars NEXT_PUBLIC_APP_URL=https://aura-dashboard-mn5srfeinq-uc.a.run.app \
  --set-env-vars NODE_ENV=production

echo ""
echo "Deployment complete!"
echo "Service URL: https://aura-dashboard-mn5srfeinq-uc.a.run.app"