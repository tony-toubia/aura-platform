#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local files
const envPaths = [
  path.join(__dirname, '../apps/web/.env.local'),
  path.join(__dirname, '../apps/dashboard/.env.local')
];

// Load env vars from the first file that exists
let envVars = {};
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment variables from: ${envPath}`);
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      envVars = { ...envVars, ...result.parsed };
    }
  }
}

// Define the secrets we need to create
const secretsToCreate = [
  {
    name: 'STRIPE_SECRET_KEY',
    value: envVars.STRIPE_SECRET_KEY
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    value: envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    value: envVars.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET || envVars.STRIPE_WEBHOOK_SECRET
  },
  {
    name: 'STRIPE_PERSONAL_PRICE_ID',
    value: envVars.STRIPE_PERSONAL_PRICE_ID
  },
  {
    name: 'STRIPE_FAMILY_PRICE_ID',
    value: envVars.STRIPE_FAMILY_PRICE_ID
  },
  {
    name: 'STRIPE_BUSINESS_PRICE_ID',
    value: envVars.STRIPE_BUSINESS_PRICE_ID
  }
];

console.log('# Google Cloud Secret Manager - Create Secrets Commands');
console.log('# Copy and paste these commands into your terminal');
console.log('# Make sure you have set your project: gcloud config set project YOUR_PROJECT_ID');
console.log('');
console.log('# Enable Secret Manager API');
console.log('gcloud services enable secretmanager.googleapis.com');
console.log('');

// Generate commands for each secret
secretsToCreate.forEach(secret => {
  if (secret.value && secret.value !== 'whsec_...') {
    console.log(`# Create ${secret.name}`);
    console.log(`echo -n '${secret.value}' | gcloud secrets create ${secret.name} --data-file=-`);
    console.log('');
  } else {
    console.log(`# WARNING: ${secret.name} has no valid value or is a placeholder`);
    console.log(`# You'll need to create this manually or update your .env.local file`);
    console.log(`# echo -n 'YOUR_ACTUAL_VALUE' | gcloud secrets create ${secret.name} --data-file=-`);
    console.log('');
  }
});

console.log('# Grant access to your Cloud Run service account (replace YOUR_SERVICE_ACCOUNT and YOUR_PROJECT_ID)');
console.log('SERVICE_ACCOUNT="YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com"');
console.log('');

secretsToCreate.forEach(secret => {
  if (secret.value && secret.value !== 'whsec_...') {
    console.log(`gcloud secrets add-iam-policy-binding ${secret.name} \\`);
    console.log(`  --member="serviceAccount:$SERVICE_ACCOUNT" \\`);
    console.log(`  --role="roles/secretmanager.secretAccessor"`);
    console.log('');
  }
});

console.log('# Deploy to Cloud Run with secrets');
console.log('gcloud run deploy YOUR_SERVICE_NAME \\');
console.log('  --update-secrets=\\');
secretsToCreate.forEach((secret, index) => {
  if (secret.value && secret.value !== 'whsec_...') {
    const envVarName = secret.name === 'STRIPE_PUBLISHABLE_KEY' ? 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' : secret.name;
    const isLast = index === secretsToCreate.length - 1;
    console.log(`${envVarName}=${secret.name}:latest${isLast ? '' : ',\\'}`);
  }
});

console.log('');
console.log('# To update an existing secret with a new value:');
console.log('# echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-');