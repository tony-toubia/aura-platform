# Quick Start - Push Stripe Secrets to Google Cloud

I've created two approaches for you to push your Stripe secrets to Google Cloud Secret Manager programmatically:

## Option 1: Automated Script (Recommended)

This uses the Google Cloud SDK Node.js library to create secrets programmatically.

```bash
# 1. Navigate to scripts directory
cd scripts

# 2. Install dependencies (already done)
npm install

# 3. Authenticate with Google Cloud
gcloud auth application-default login

# 4. Run the script with your project ID
node push-secrets-to-gcp.js YOUR_PROJECT_ID
```

## Option 2: Generate gcloud Commands

This generates the exact gcloud commands you can copy and paste.

```bash
# 1. Navigate to scripts directory
cd scripts

# 2. Generate the commands
npm run generate-commands

# 3. Copy and paste the output commands into your terminal
```

## Your Current Stripe Values

Based on your `.env.local` files, these values will be pushed:

- **STRIPE_SECRET_KEY**: `sk_test_51Rm8IX2eC3Lyg0LN...` ✅
- **STRIPE_PUBLISHABLE_KEY**: `pk_test_51Rm8IX2eC3Lyg0LN...` ✅
- **STRIPE_WEBHOOK_SECRET**: `whsec_Csan45SlVYevM1WsHC0ma4F5Wyo8S5Pr` ✅
- **STRIPE_PERSONAL_PRICE_ID**: `price_1Rm8Le2eC3Lyg0LN4RYnKcFO` ✅
- **STRIPE_FAMILY_PRICE_ID**: `price_1Rm8MN2eC3Lyg0LNequKyCtb` ✅
- **STRIPE_BUSINESS_PRICE_ID**: `price_1Rm8N12eC3Lyg0LNt0MoOJqG` ✅

## Next Steps

After creating the secrets:

1. **Grant Cloud Run access** to read the secrets:
   ```bash
   # Replace with your actual service account
   SERVICE_ACCOUNT="YOUR_SERVICE@YOUR_PROJECT.iam.gserviceaccount.com"
   
   for SECRET in STRIPE_SECRET_KEY STRIPE_PUBLISHABLE_KEY STRIPE_WEBHOOK_SECRET \
                STRIPE_PERSONAL_PRICE_ID STRIPE_FAMILY_PRICE_ID STRIPE_BUSINESS_PRICE_ID; do
     gcloud secrets add-iam-policy-binding $SECRET \
       --member="serviceAccount:$SERVICE_ACCOUNT" \
       --role="roles/secretmanager.secretAccessor"
   done
   ```

2. **Update your Cloud Run deployment** to use these secrets as environment variables

## Files Created

- `scripts/push-secrets-to-gcp.js` - Automated script using Google Cloud SDK
- `scripts/generate-gcloud-commands.js` - Generates gcloud CLI commands
- `scripts/package.json` - Dependencies for the scripts
- `scripts/README-gcp-secrets.md` - Detailed documentation

## Troubleshooting

If you encounter any issues:

1. Make sure you're authenticated: `gcloud auth list`
2. Check your project is set: `gcloud config get-value project`
3. Ensure Secret Manager API is enabled: `gcloud services enable secretmanager.googleapis.com`

For detailed instructions, see `scripts/README-gcp-secrets.md`