#!/bin/bash

# Example: Deploy aura-dashboard with Stripe secrets
# Replace YOUR_IMAGE with your actual container image

echo "Deploying aura-dashboard with Stripe secrets..."

gcloud run deploy aura-dashboard \
  --region=us-central1 \
  --project=aura-platform-467500 \
  --image=gcr.io/aura-platform-467500/aura-dashboard:latest \
  --update-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,STRIPE_PERSONAL_PRICE_ID=STRIPE_PERSONAL_PRICE_ID:latest,STRIPE_FAMILY_PRICE_ID=STRIPE_FAMILY_PRICE_ID:latest,STRIPE_BUSINESS_PRICE_ID=STRIPE_BUSINESS_PRICE_ID:latest

echo "Deployment complete!"

# To verify the environment variables are set:
echo ""
echo "To verify secrets are properly configured, run:"
echo "gcloud run services describe aura-dashboard --region=us-central1 --project=aura-platform-467500 --format='value(spec.template.spec.containers[0].env[].name)'"