# Push Secrets to Google Cloud Secret Manager

This script automates the process of pushing your Stripe secrets to Google Cloud Secret Manager instead of manually creating them through the console.

## Prerequisites

1. **Google Cloud CLI (gcloud)** installed on your machine
   - Download from: https://cloud.google.com/sdk/docs/install
   
2. **Node.js** installed (v14 or higher)

3. **Google Cloud Project** with Secret Manager API enabled

## Setup Instructions

### Step 1: Enable Secret Manager API

```bash
# Enable the Secret Manager API for your project
gcloud services enable secretmanager.googleapis.com
```

### Step 2: Authenticate with Google Cloud

Choose one of the following authentication methods:

#### Option A: Using Application Default Credentials (Recommended for local development)

```bash
# Login to Google Cloud
gcloud auth login

# Set application default credentials
gcloud auth application-default login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID
```

#### Option B: Using Service Account (Recommended for CI/CD)

1. Create a service account:
```bash
gcloud iam service-accounts create secret-manager-sa \
    --display-name="Secret Manager Service Account"
```

2. Grant necessary permissions:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:secret-manager-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.admin"
```

3. Create and download a key:
```bash
gcloud iam service-accounts keys create ~/secret-manager-key.json \
    --iam-account=secret-manager-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

4. Set the environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="~/secret-manager-key.json"
```

### Step 3: Install Dependencies

```bash
cd scripts
npm install
```

### Step 4: Run the Script

```bash
# Option 1: Pass project ID as argument
node push-secrets-to-gcp.js YOUR_PROJECT_ID

# Option 2: Set project ID as environment variable
export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
node push-secrets-to-gcp.js

# Option 3: Use npm script
npm run push-secrets YOUR_PROJECT_ID
```

## What the Script Does

The script will:

1. Read your Stripe configuration from `.env.local` files
2. Create or update the following secrets in Google Cloud Secret Manager:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PERSONAL_PRICE_ID`
   - `STRIPE_FAMILY_PRICE_ID`
   - `STRIPE_BUSINESS_PRICE_ID`

3. If a secret already exists, it will add a new version instead of creating a duplicate

## Current Values from Your Environment

Based on your `.env.local` files, these are the values that will be pushed:

| Secret Name | Value Status |
|-------------|--------------|
| STRIPE_SECRET_KEY | ✅ Found (sk_test_...) |
| STRIPE_PUBLISHABLE_KEY | ✅ Found (pk_test_...) |
| STRIPE_WEBHOOK_SECRET | ⚠️ Found but appears to be placeholder (whsec_Csan45SlVYevM1WsHC0ma4F5Wyo8S5Pr) |
| STRIPE_PERSONAL_PRICE_ID | ✅ Found (price_1Rm8Le2eC3Lyg0LN4RYnKcFO) |
| STRIPE_FAMILY_PRICE_ID | ✅ Found (price_1Rm8MN2eC3Lyg0LNequKyCtb) |
| STRIPE_BUSINESS_PRICE_ID | ✅ Found (price_1Rm8N12eC3Lyg0LNt0MoOJqG) |

**Note**: The STRIPE_WEBHOOK_SECRET appears to be a real value now (whsec_Csan45SlVYevM1WsHC0ma4F5Wyo8S5Pr), not a placeholder.

## Granting Access to Cloud Run

After creating the secrets, you need to grant your Cloud Run service account access to read them:

```bash
# For each secret, grant access to the Cloud Run service account
for SECRET in STRIPE_SECRET_KEY STRIPE_PUBLISHABLE_KEY STRIPE_WEBHOOK_SECRET STRIPE_PERSONAL_PRICE_ID STRIPE_FAMILY_PRICE_ID STRIPE_BUSINESS_PRICE_ID; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

## Using Secrets in Cloud Run

Update your Cloud Run deployment to use these secrets as environment variables:

```yaml
# In your cloud-run.yaml or deployment configuration
env:
- name: STRIPE_SECRET_KEY
  valueFrom:
    secretKeyRef:
      name: STRIPE_SECRET_KEY
      key: latest
- name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  valueFrom:
    secretKeyRef:
      name: STRIPE_PUBLISHABLE_KEY
      key: latest
# ... repeat for other secrets
```

Or using gcloud command:
```bash
gcloud run deploy YOUR_SERVICE_NAME \
  --update-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,\
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY:latest,\
STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,\
STRIPE_PERSONAL_PRICE_ID=STRIPE_PERSONAL_PRICE_ID:latest,\
STRIPE_FAMILY_PRICE_ID=STRIPE_FAMILY_PRICE_ID:latest,\
STRIPE_BUSINESS_PRICE_ID=STRIPE_BUSINESS_PRICE_ID:latest
```

## Troubleshooting

1. **Authentication Error**: Make sure you're logged in with `gcloud auth login` and have set the correct project

2. **Permission Denied**: Ensure your account has the `Secret Manager Admin` role:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="user:YOUR_EMAIL@gmail.com" \
     --role="roles/secretmanager.admin"
   ```

3. **API Not Enabled**: Enable the Secret Manager API:
   ```bash
   gcloud services enable secretmanager.googleapis.com
   ```

4. **Missing Values**: If any secrets show as "whsec_..." or empty, update them in your `.env.local` file before running the script