#!/bin/bash

# Google Cloud Memorystore for Redis Setup Script
# This script helps you set up Redis on Google Cloud Platform

set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"aura-platform-467500"}
REGION=${GCP_REGION:-"us-central1"}
ZONE=${GCP_ZONE:-"us-central1-a"}
REDIS_INSTANCE_NAME="aura-platform"  # Your specific instance name
REDIS_TIER=${REDIS_TIER:-"BASIC"}  # BASIC or STANDARD_HA
REDIS_SIZE=${REDIS_SIZE:-"1"}  # Size in GB
REDIS_VERSION=${REDIS_VERSION:-"REDIS_7_0"}
VPC_NETWORK=${VPC_NETWORK:-"default"}

echo "🚀 Setting up Google Cloud Memorystore for Redis"
echo "================================================"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Instance Name: $REDIS_INSTANCE_NAME"
echo "Tier: $REDIS_TIER"
echo "Size: ${REDIS_SIZE}GB"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo "📋 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable redis.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

# Check if Redis instance already exists
echo "🔍 Checking if Redis instance already exists..."
if gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION &> /dev/null; then
    echo "✅ Redis instance '$REDIS_INSTANCE_NAME' already exists!"
    
    # Get instance details
    REDIS_HOST=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format="value(host)")
    REDIS_PORT=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format="value(port)")
    
    echo "   Host: $REDIS_HOST"
    echo "   Port: $REDIS_PORT"
else
    echo "📦 Creating Redis instance '$REDIS_INSTANCE_NAME'..."
    echo "   This may take 5-10 minutes..."
    
    gcloud redis instances create $REDIS_INSTANCE_NAME \
        --size=$REDIS_SIZE \
        --region=$REGION \
        --zone=$ZONE \
        --redis-version=$REDIS_VERSION \
        --tier=$REDIS_TIER \
        --network=$VPC_NETWORK \
        --display-name="Aura Platform Redis Cache"
    
    # Get the created instance details
    REDIS_HOST=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format="value(host)")
    REDIS_PORT=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format="value(port)")
    
    echo "✅ Redis instance created successfully!"
    echo "   Host: $REDIS_HOST"
    echo "   Port: $REDIS_PORT"
fi

# Store Redis configuration in Secret Manager
echo ""
echo "🔐 Storing Redis configuration in Secret Manager..."

# Function to create or update a secret
create_or_update_secret() {
    SECRET_NAME=$1
    SECRET_VALUE=$2
    
    # Check if secret exists
    if gcloud secrets describe $SECRET_NAME &> /dev/null; then
        echo "   Updating secret: $SECRET_NAME"
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=-
    else
        echo "   Creating secret: $SECRET_NAME"
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=-
    fi
}

# Store Redis host
create_or_update_secret "redis-host" "$REDIS_HOST"

# Store Redis port
create_or_update_secret "redis-port" "$REDIS_PORT"

# If AUTH is enabled (you can set a password later if needed)
# create_or_update_secret "redis-auth" "your-redis-password"

echo ""
echo "🎯 Granting Secret Manager access to Cloud Run service account..."

# Get the default Cloud Run service account
SERVICE_ACCOUNT="$(gcloud iam service-accounts list --filter="displayName:Compute Engine default service account" --format="value(email)")"

if [ -z "$SERVICE_ACCOUNT" ]; then
    # Try App Engine default service account
    SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"
fi

echo "   Service Account: $SERVICE_ACCOUNT"

# Grant access to secrets
gcloud secrets add-iam-policy-binding redis-host \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding redis-port \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

echo ""
echo "📝 Setting up VPC Connector for Cloud Run (if needed)..."

# Check if VPC connector exists
CONNECTOR_NAME="redis-connector"
if gcloud compute networks vpc-access connectors describe $CONNECTOR_NAME --region=$REGION &> /dev/null; then
    echo "✅ VPC Connector '$CONNECTOR_NAME' already exists!"
else
    echo "📦 Creating VPC Connector '$CONNECTOR_NAME'..."
    gcloud compute networks vpc-access connectors create $CONNECTOR_NAME \
        --region=$REGION \
        --subnet-project=$PROJECT_ID \
        --subnet=$VPC_NETWORK \
        --range=10.8.0.0/28
    
    echo "✅ VPC Connector created!"
fi

echo ""
echo "=========================================="
echo "✅ Google Cloud Memorystore Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Configuration Summary:"
echo "   Redis Host: $REDIS_HOST"
echo "   Redis Port: $REDIS_PORT"
echo "   VPC Connector: $CONNECTOR_NAME"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Update your Cloud Run service to use the VPC connector:"
echo "   gcloud run services update YOUR_SERVICE_NAME \\"
echo "     --vpc-connector=$CONNECTOR_NAME \\"
echo "     --region=$REGION"
echo ""
echo "2. Set the GCP_PROJECT_ID environment variable in Cloud Run:"
echo "   gcloud run services update YOUR_SERVICE_NAME \\"
echo "     --set-env-vars=\"GCP_PROJECT_ID=$PROJECT_ID\" \\"
echo "     --region=$REGION"
echo ""
echo "3. For local development, add to your .env.local:"
echo "   REDIS_HOST=$REDIS_HOST"
echo "   REDIS_PORT=$REDIS_PORT"
echo "   # Or use a local Redis instance:"
echo "   REDIS_URL=redis://localhost:6379"
echo ""
echo "4. Test the connection:"
echo "   npm run test:redis"
echo ""
echo "✨ Your Redis cache is ready to use!"