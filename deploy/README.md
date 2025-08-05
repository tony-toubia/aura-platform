# 🚀 Deployment Scripts

This directory contains scripts to deploy your Aura Platform to Google Cloud Platform.

## Quick Start (Windows PowerShell)

1. **Prerequisites**:
   - Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
   - Authenticate: `gcloud auth login`
   - Have your GitHub username ready

2. **Quick Deploy**:
   ```powershell
   .\deploy\quick-deploy.ps1 -GitHubUsername "your-github-username"
   ```

3. **Configure Domains**:
   ```powershell
   .\deploy\configure-domains.ps1
   ```

4. **Set Environment Variables**:
   ```powershell
   .\deploy\environment-setup.ps1
   ```

## Scripts Overview

### `quick-deploy.ps1`
- Sets up GCP project
- Installs dependencies
- Builds applications
- Triggers initial deployment

### `gcp-setup.ps1`
- Creates GCP project
- Enables required APIs
- Sets up Cloud Build triggers
- Creates Cloud Run services

### `configure-domains.ps1`
- Maps custom domains to Cloud Run services
- Provides DNS configuration instructions

### `environment-setup.ps1`
- Configures environment variables for production
- Sets up Supabase, Stripe, and OpenAI configurations

## Manual Steps Required

1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **DNS Configuration**: Add CNAME records to GoDaddy
3. **Environment Variables**: Provide API keys and configuration

## Monitoring

- **Cloud Build**: https://console.cloud.google.com/cloud-build/builds
- **Cloud Run**: https://console.cloud.google.com/run
- **Domain Mappings**: `gcloud run domain-mappings list`

## Troubleshooting

- Check build logs in Cloud Console
- Verify DNS propagation: `nslookup aura-link.app`
- Monitor service logs: `gcloud logs read`