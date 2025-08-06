# 🔧 Deployment Fixes for Aura Platform

This document outlines the fixes applied to resolve deployment issues.

## Issues Fixed

### 1. ✅ Docker Build Failure
**Problem**: The `--offline` flag in Dockerfiles was preventing package installation.
**Solution**: Removed `--offline` flag from both `Dockerfile.web` and `Dockerfile.marketing`.

### 2. ✅ Missing CSS Styling on Marketing Site
**Problem**: CSS not building properly in production.
**Solution**: 
- Removed `--offline` flag to ensure all dependencies are installed
- Simplified build command to use `pnpm build`

### 3. ✅ Supabase Authentication Error
**Problem**: Environment variables not set in production.
**Solution**: Created `deploy/set-env-vars.sh` script to set all required environment variables.

### 4. ✅ Domain Configuration
**Problem**: Documentation referenced `dash.aura-link.app` instead of `app.aura-link.app`.
**Solution**: Updated all references to use `app.aura-link.app`.

## Deployment Steps

### 1. Set Environment Variables

First, create a `.env.production` file based on `.env.production.example`:
```bash
cp .env.production.example .env.production
# Edit .env.production with your actual values
```

### 2. Deploy to Google Cloud

Push your changes to trigger the build:
```bash
git add .
git commit -m "Fix deployment issues: Docker builds, CSS, and environment variables"
git push origin main
```

### 3. Set Environment Variables in Cloud Run

After the build completes, run the environment setup script:
```bash
# Make the script executable
chmod +x deploy/set-env-vars.sh

# Source your production environment variables
source .env.production

# Run the script
./deploy/set-env-vars.sh
```

### 4. Verify DNS Settings

Ensure your DNS records are set correctly:
- `aura-link.app` → Points to Google Cloud Run
- `app.aura-link.app` → Points to Google Cloud Run

### 5. Test Your Deployment

1. **Marketing Site**: https://aura-link.app
   - Should display with proper styling
   - Links should point to app.aura-link.app

2. **Dashboard/App**: https://app.aura-link.app
   - Should allow login/registration
   - All features should work with proper authentication

## Troubleshooting

### If CSS is still missing:
1. Check Cloud Run logs: `gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=aura-marketing" --limit=50`
2. Verify the build output includes CSS files
3. Check that `NODE_ENV=production` is set

### If authentication fails:
1. Verify all Supabase environment variables are set correctly
2. Check that the Supabase URL and keys match your project
3. Ensure `NEXTAUTH_URL` is set to `https://app.aura-link.app`

### If builds fail:
1. Check Cloud Build logs in Google Cloud Console
2. Verify all dependencies are listed in package.json files
3. Ensure pnpm-lock.yaml is up to date

## Important Notes

- Always test locally before deploying
- Keep your `.env.production` file secure and never commit it to git
- Monitor your Google Cloud costs, especially if traffic increases
- Set up alerts for service failures in Google Cloud Monitoring

## Next Steps

After successful deployment:
1. Set up Google Cloud Monitoring alerts
2. Configure backup and disaster recovery
3. Set up a staging environment for testing
4. Implement CI/CD improvements for automated testing