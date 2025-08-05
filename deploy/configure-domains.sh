#!/bin/bash

# Domain Configuration Script for Aura Platform
# This script helps configure custom domains for your Cloud Run services

set -e

# Configuration
PROJECT_ID="aura-platform-prod"  # Change this to match your project ID
REGION="us-central1"
DOMAIN_MARKETING="aura-link.app"
DOMAIN_DASHBOARD="dash.aura-link.app"

echo "🌐 Configuring custom domains for Aura Platform"
echo ""

# Get service URLs
MARKETING_URL=$(gcloud run services describe aura-marketing --region=$REGION --format='value(status.url)')
DASHBOARD_URL=$(gcloud run services describe aura-dashboard --region=$REGION --format='value(status.url)')

echo "Current service URLs:"
echo "Marketing: $MARKETING_URL"
echo "Dashboard: $DASHBOARD_URL"
echo ""

# Map custom domains
echo "🔗 Mapping custom domains..."

# Map marketing domain
gcloud run domain-mappings create \
    --service=aura-marketing \
    --domain=$DOMAIN_MARKETING \
    --region=$REGION || echo "Marketing domain mapping already exists"

# Map dashboard domain
gcloud run domain-mappings create \
    --service=aura-dashboard \
    --domain=$DOMAIN_DASHBOARD \
    --region=$REGION || echo "Dashboard domain mapping already exists"

echo ""
echo "📋 DNS Configuration Required:"
echo ""
echo "Add these DNS records to your domain registrar (GoDaddy):"
echo ""

# Get the required DNS records
echo "For $DOMAIN_MARKETING:"
gcloud run domain-mappings describe $DOMAIN_MARKETING --region=$REGION --format='value(status.resourceRecords[].name,status.resourceRecords[].rrdata)' | while read name rrdata; do
    if [[ $name == *"$DOMAIN_MARKETING" ]]; then
        echo "  Type: CNAME"
        echo "  Name: @"
        echo "  Value: $rrdata"
    fi
done

echo ""
echo "For $DOMAIN_DASHBOARD:"
gcloud run domain-mappings describe $DOMAIN_DASHBOARD --region=$REGION --format='value(status.resourceRecords[].name,status.resourceRecords[].rrdata)' | while read name rrdata; do
    if [[ $name == *"$DOMAIN_DASHBOARD" ]]; then
        echo "  Type: CNAME"
        echo "  Name: dash"
        echo "  Value: $rrdata"
    fi
done

echo ""
echo "⚠️  Important Notes:"
echo "1. DNS propagation can take up to 48 hours"
echo "2. SSL certificates will be automatically provisioned after DNS is configured"
echo "3. You can check domain mapping status with:"
echo "   gcloud run domain-mappings list --region=$REGION"
echo ""
echo "🔍 Monitor certificate status:"
echo "   gcloud run domain-mappings describe $DOMAIN_MARKETING --region=$REGION"
echo "   gcloud run domain-mappings describe $DOMAIN_DASHBOARD --region=$REGION"