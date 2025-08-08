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

// Define all the secrets we need to create
const secretsToCreate = [
  // Required Secrets for Google Cloud Secret Manager
  {
    name: 'OPENAI_API_KEY',
    value: envVars.OPENAI_API_KEY
  },
  {
    name: 'JWT_SECRET',
    value: envVars.JWT_SECRET
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: envVars.SUPABASE_SERVICE_ROLE_KEY
  },
  {
    name: 'OPENWEATHER_API_KEY',
    value: envVars.NEXT_PUBLIC_OPENWEATHER_API_KEY
  },
  {
    name: 'NEWS_API_KEY',
    value: envVars.NEWS_API_KEY
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    value: envVars.GOOGLE_CLIENT_SECRET
  },
  {
    name: 'MICROSOFT_CLIENT_SECRET',
    value: envVars.MICROSOFT_CLIENT_SECRET
  },
  {
    name: 'STRAVA_CLIENT_SECRET',
    value: envVars.STRAVA_CLIENT_SECRET
  }
];

// Cloud Build Trigger Variables (for documentation)
const cloudBuildVariables = [
  {
    name: '_SUPABASE_ANON_KEY',
    value: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    description: 'Supabase Anonymous Key'
  },
  {
    name: '_GOOGLE_CLIENT_ID',
    value: envVars.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    description: 'Google OAuth Client ID'
  },
  {
    name: '_MICROSOFT_CLIENT_ID',
    value: envVars.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
    description: 'Microsoft OAuth Client ID'
  },
  {
    name: '_STRAVA_CLIENT_ID',
    value: envVars.NEXT_PUBLIC_STRAVA_CLIENT_ID,
    description: 'Strava OAuth Client ID'
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
  const projectId = process.argv[2] || process.env.GOOGLE_CLOUD_PROJECT || 'aura-platform-467500';
  
  console.log(`Using Google Cloud Project: ${projectId}`);
  console.log('');

  // Validate that all secrets have values
  const missingSecrets = secretsToCreate.filter(secret => !secret.value);
  if (missingSecrets.length > 0) {
    console.warn('Warning: The following secrets have missing values:');
    missingSecrets.forEach(secret => {
      console.warn(`  - ${secret.name}: (empty)`);
    });
    console.warn('');
    console.warn('You may need to update these values in your .env.local file or in Google Cloud Console.');
    console.warn('');
  }

  console.log('Creating/updating secrets in Google Cloud Secret Manager...');
  console.log('');

  // Create secrets
  for (const secret of secretsToCreate) {
    if (secret.value) {
      await createSecret(projectId, secret.name, secret.value);
    } else {
      console.log(`⚠ Skipping ${secret.name} (no valid value found)`);
    }
  }

  console.log('');
  console.log('✅ Secret creation/update process completed!');
  console.log('');
  
  // Display Cloud Build trigger variables
  console.log('=== Cloud Build Trigger Variables ===');
  console.log('Configure these in your Cloud Build trigger settings:');
  console.log('');
  
  cloudBuildVariables.forEach(variable => {
    if (variable.value) {
      console.log(`${variable.name} = ${variable.value}`);
      console.log(`  Description: ${variable.description}`);
      console.log('');
    } else {
      console.log(`${variable.name} = (not found in .env.local)`);
      console.log(`  Description: ${variable.description}`);
      console.log('');
    }
  });
  
  console.log('Next steps:');
  console.log('1. Grant your Cloud Run service account access to these secrets');
  console.log('2. Update your deployment configuration to use these secrets');
  console.log('3. Configure the Cloud Build trigger variables in your build trigger');
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});