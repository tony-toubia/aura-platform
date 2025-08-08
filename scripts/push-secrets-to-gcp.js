#!/usr/bin/env node

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Initialize the Secret Manager client
const client = new SecretManagerServiceClient();

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

async function createSecret(projectId, secretId, secretValue) {
  const parent = `projects/${projectId}`;
  
  try {
    // Check if secret already exists
    const [secrets] = await client.listSecrets({
      parent: parent,
    });
    
    const secretExists = secrets.some(secret => secret.name.endsWith(`/secrets/${secretId}`));
    
    if (secretExists) {
      console.log(`Secret ${secretId} already exists. Updating with new version...`);
      
      // Add a new version to the existing secret
      const secretName = `${parent}/secrets/${secretId}`;
      const [version] = await client.addSecretVersion({
        parent: secretName,
        payload: {
          data: Buffer.from(secretValue, 'utf8'),
        },
      });
      
      console.log(`✓ Updated ${secretId} with new version: ${version.name}`);
    } else {
      // Create the secret
      const [secret] = await client.createSecret({
        parent: parent,
        secretId: secretId,
        secret: {
          replication: {
            automatic: {},
          },
        },
      });

      console.log(`Created secret: ${secret.name}`);

      // Add a version with the actual secret value
      const [version] = await client.addSecretVersion({
        parent: secret.name,
        payload: {
          data: Buffer.from(secretValue, 'utf8'),
        },
      });

      console.log(`✓ Added secret version for ${secretId}: ${version.name}`);
    }
  } catch (error) {
    console.error(`✗ Error creating/updating secret ${secretId}:`, error.message);
    throw error;
  }
}

async function main() {
  // Get project ID from command line or environment
  const projectId = process.argv[2] || process.env.GOOGLE_CLOUD_PROJECT;
  
  if (!projectId) {
    console.error('Error: Please provide a Google Cloud project ID');
    console.error('Usage: node push-secrets-to-gcp.js <PROJECT_ID>');
    console.error('Or set GOOGLE_CLOUD_PROJECT environment variable');
    process.exit(1);
  }

  console.log(`Using Google Cloud Project: ${projectId}`);
  console.log('');

  // Validate that all secrets have values
  const missingSecrets = secretsToCreate.filter(secret => !secret.value || secret.value === 'whsec_...');
  if (missingSecrets.length > 0) {
    console.warn('Warning: The following secrets have missing or placeholder values:');
    missingSecrets.forEach(secret => {
      console.warn(`  - ${secret.name}: ${secret.value || '(empty)'}`);
    });
    console.warn('');
    console.warn('You may need to update these values in your .env.local file or in Google Cloud Console.');
    console.warn('');
  }

  console.log('Creating/updating secrets in Google Cloud Secret Manager...');
  console.log('');

  for (const secret of secretsToCreate) {
    if (secret.value && secret.value !== 'whsec_...') {
      await createSecret(projectId, secret.name, secret.value);
    } else {
      console.log(`⚠ Skipping ${secret.name} (no valid value found)`);
    }
  }

  console.log('');
  console.log('✅ Secret creation/update process completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. If any secrets were skipped, update them manually in Google Cloud Console');
  console.log('2. Grant your Cloud Run service account access to these secrets');
  console.log('3. Update your deployment configuration to use these secrets');
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});