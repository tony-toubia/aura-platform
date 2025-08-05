# 🚀 Aura Platform Deployment Guide

This guide will help you deploy your Aura Platform to Google Cloud Platform with custom domains.

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **GitHub Repository** with your code
3. **Domain purchased** from GoDaddy (aura-link.app)
4. **Google Cloud SDK** installed locally

## 🏗️ Architecture Overview

- **`aura-link.app`** → Marketing/Landing page (public)
- **`dash.aura-link.app`** → Dashboard/App (authenticated)
- **Google Cloud Run** → Hosting platform
- **Google Cloud Build** → CI/CD pipeline
- **Container Registry** → Docker image storage

## 🚀 Step-by-Step Deployment

### Step 1: Install Google Cloud SDK

```bash
# Download and install from: https://cloud.google.com/sdk/docs/install
# Then authenticate
gcloud auth login
gcloud auth application-default login
```

### Step 2: Set up GCP Project

```bash
# Make the setup script executable
chmod +x deploy/gcp-setup.sh

# Run the setup script
./deploy/gcp-setup.sh
```

**Important**: Edit the script first to change `YOUR_GITHUB_USERNAME` to your actual GitHub username.

### Step 3: Connect GitHub Repository

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Cloud Build → Triggers
3. Connect your GitHub repository
4. The trigger should already be created by the setup script

### Step 4: Configure Environment Variables

```bash
# Make the environment setup script executable
chmod +x deploy/environment-setup.sh

# Run the environment setup
./deploy/environment-setup.sh
```

You'll need these values:
- Supabase URL and keys
- OpenAI API key
- Stripe keys and price IDs

### Step 5: Configure Custom Domains

```bash
# Make the domain configuration script executable
chmod +x deploy/configure-domains.sh

# Run the domain configuration
./deploy/configure-domains.sh
```

### Step 6: Update DNS Settings in GoDaddy

After running the domain configuration script, you'll get DNS records to add:

1. Log into your GoDaddy account
2. Go to DNS Management for aura-link.app
3. Add the CNAME records provided by the script:
   - **Name**: `@` → **Value**: `ghs.googlehosted.com` (or the value provided)
   - **Name**: `dash` → **Value**: `ghs.googlehosted.com` (or the value provided)

### Step 7: Deploy Your Code

Push your code to the main branch of your GitHub repository:

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

This will trigger the Cloud Build pipeline automatically.

## 🔧 Environment Variables Reference

### Dashboard App (Required)
```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PERSONAL_PRICE_ID=your_personal_price_id
STRIPE_FAMILY_PRICE_ID=your_family_price_id
STRIPE_BUSINESS_PRICE_ID=your_business_price_id
```

### Marketing Site (Minimal)
```
NODE_ENV=production
```

## 🔍 Monitoring and Troubleshooting

### Check Service Status
```bash
gcloud run services list --region=us-central1
```

### View Logs
```bash
# Dashboard logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=aura-dashboard" --limit=50

# Marketing logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=aura-marketing" --limit=50
```

### Check Domain Mapping Status
```bash
gcloud run domain-mappings list --region=us-central1
```

### View Build History
```bash
gcloud builds list --limit=10
```

## 🔄 CI/CD Pipeline

The pipeline automatically:
1. Builds Docker images for both apps
2. Pushes images to Container Registry
3. Deploys to Cloud Run
4. Updates services with new images

Triggered on every push to the `main` branch.

## 💰 Cost Optimization

- **Cloud Run**: Pay per request, scales to zero
- **Container Registry**: Pay for storage
- **Cloud Build**: 120 free build minutes/day
- **Estimated monthly cost**: $10-50 for low-medium traffic

## 🔒 Security Features

- **HTTPS**: Automatically provisioned SSL certificates
- **Authentication**: Supabase handles user auth
- **Environment Variables**: Securely stored in Cloud Run
- **Private Container Images**: Stored in your project's registry

## 🚨 Common Issues

### Build Failures
- Check `cloudbuild.yaml` syntax
- Verify all dependencies are in package.json
- Check build logs in Cloud Console

### Domain Not Working
- Verify DNS records are correct
- Wait for DNS propagation (up to 48 hours)
- Check domain mapping status

### Environment Variables
- Ensure all required variables are set
- Check for typos in variable names
- Verify Supabase and Stripe configurations

## 📞 Support

If you encounter issues:
1. Check the logs using the commands above
2. Verify all environment variables are set correctly
3. Ensure DNS records are properly configured
4. Check that all required APIs are enabled in GCP

## 🎉 Success!

Once everything is deployed:
- **Marketing Site**: https://aura-link.app
- **Dashboard**: https://dash.aura-link.app

Your Aura Platform is now live and ready for users!