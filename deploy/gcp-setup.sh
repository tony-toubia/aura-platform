#!/bin/bash

# Google Cloud Platform Setup Script for Aura Platform
# Run this script to set up your GCP project and deploy the application

set -e

# Configuration
PROJECT_ID="aura-platform-prod"  # Change this to your preferred project ID
REGION="us-central1"
DOMAIN_MARKETING="aura-link.app"
DOMAIN_DASHBOARD="dash.aura-link.app"

echo "🚀 Setting up Aura Platform on Google Cloud Platform"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Create or select project
echo "📋 Setting up GCP project..."
gcloud projects create $PROJECT_ID --name="Aura Platform" || echo "Project already exists"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable domains.googleapis.com
gcloud services enable certificatemanager.googleapis.com

# Set up Cloud Build trigger
echo "🏗️ Setting up Cloud Build..."
gcloud builds triggers create github \
    --repo-name="aura-platform" \
    --repo-owner="YOUR_GITHUB_USERNAME" \
    --branch-pattern="^main$" \
    --build-config="cloudbuild.yaml" \
    --name="aura-platform-deploy" || echo "Trigger already exists"

# Create Cloud Run services
echo "☁️ Creating Cloud Run services..."

# Marketing site (aura-link.app)
gcloud run deploy aura-marketing \
    --image="gcr.io/$PROJECT_ID/aura-marketing:latest" \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --port=3000 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=5 \
    --set-env-vars="NODE_ENV=production" || echo "Marketing service exists"

# Dashboard app (dash.aura-link.app)
gcloud run deploy aura-dashboard \
    --image="gcr.io/$PROJECT_ID/aura-dashboard:latest" \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --port=3000 \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --set-env-vars="NODE_ENV=production" || echo "Dashboard service exists"

echo ""
echo "✅ Basic setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your environment variables in Cloud Run services"
echo "2. Configure your domain DNS settings"
echo "3. Set up SSL certificates"
echo "4. Connect your GitHub repository to Cloud Build"
echo ""
echo "🌐 Service URLs:"
echo "Marketing: $(gcloud run services describe aura-marketing --region=$REGION --format='value(status.url)')"
echo "Dashboard: $(gcloud run services describe aura-dashboard --region=$REGION --format='value(status.url)')"
echo ""
echo "Run './deploy/configure-domains.sh' next to set up custom domains."