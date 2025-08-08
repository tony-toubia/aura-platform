#!/usr/bin/env node

/**
 * Environment validation script
 * Run this before deployment to ensure all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for production
const REQUIRED_VARS = {
  // Supabase (critical)
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key',
  
  // App configuration (critical)
  'NEXT_PUBLIC_APP_URL': 'Application URL',
  'NODE_ENV': 'Node environment',
  
  // Authentication (critical)
  'JWT_SECRET': 'JWT secret key',
  
  // AI Services (important)
  'OPENAI_API_KEY': 'OpenAI API key',
  
  // External APIs (optional but recommended)
  'NEXT_PUBLIC_OPENWEATHER_API_KEY': 'OpenWeather API key',
  'NEWS_API_KEY': 'News API key',
  
  // OAuth (optional)
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID': 'Google OAuth client ID',
  'GOOGLE_CLIENT_SECRET': 'Google OAuth client secret',
  'NEXT_PUBLIC_MICROSOFT_CLIENT_ID': 'Microsoft OAuth client ID',
  'MICROSOFT_CLIENT_SECRET': 'Microsoft OAuth client secret',
  'NEXT_PUBLIC_STRAVA_CLIENT_ID': 'Strava OAuth client ID',
  'STRAVA_CLIENT_SECRET': 'Strava OAuth client secret'
};

const CRITICAL_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV',
  'JWT_SECRET'
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return env;
}

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');
  
  // Load environment files (check both root and apps/web)
  const envLocalRoot = loadEnvFile('.env.local');
  const envLocalWeb = loadEnvFile('apps/web/.env.local');
  const envProdRoot = loadEnvFile('.env.production');
  const envProdWeb = loadEnvFile('apps/web/.env.production');
  const processEnv = process.env;
  
  // Combine environments (process.env takes precedence, then local over production)
  const combinedEnv = { ...envProdRoot, ...envProdWeb, ...envLocalRoot, ...envLocalWeb, ...processEnv };
  

  
  const errors = [];
  const warnings = [];
  const info = [];
  
  // Check each required variable
  Object.entries(REQUIRED_VARS).forEach(([key, description]) => {
    const value = combinedEnv[key];
    const isCritical = CRITICAL_VARS.includes(key);
    
    if (!value) {
      if (isCritical) {
        errors.push(`❌ CRITICAL: ${key} is missing (${description})`);
      } else {
        warnings.push(`⚠️  OPTIONAL: ${key} is missing (${description})`);
      }
    } else {
      // Check for default/placeholder values
      if (key === 'JWT_SECRET' && value === 'aura-platform-secret-key-change-this-in-production') {
        if (combinedEnv.NODE_ENV === 'production') {
          errors.push(`❌ CRITICAL: ${key} is using default value in production`);
        } else {
          warnings.push(`⚠️  WARNING: ${key} is using default value (OK for development)`);
        }
      } else {
        info.push(`✅ ${key}: Set (${description})`);
      }
    }
  });
  
  // Additional validations
  if (combinedEnv.NEXT_PUBLIC_SUPABASE_URL && !combinedEnv.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    errors.push('❌ CRITICAL: NEXT_PUBLIC_SUPABASE_URL must start with https://');
  }
  
  if (combinedEnv.NEXT_PUBLIC_APP_URL && !combinedEnv.NEXT_PUBLIC_APP_URL.startsWith('http')) {
    errors.push('❌ CRITICAL: NEXT_PUBLIC_APP_URL must start with http:// or https://');
  }
  
  // Report results
  console.log('📊 Environment Validation Results:\n');
  
  if (info.length > 0) {
    console.log('✅ Configured Variables:');
    info.forEach(msg => console.log(`  ${msg}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(msg => console.log(`  ${msg}`));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('❌ Critical Errors:');
    errors.forEach(msg => console.log(`  ${msg}`));
    console.log('');
    console.log('🚨 Deployment should not proceed with critical errors!');
    return false;
  }
  
  console.log('🎉 Environment validation passed!');
  
  if (warnings.length > 0) {
    console.log('💡 Consider addressing warnings for optimal functionality.');
  }
  
  return true;
}

function generateEnvTemplate() {
  console.log('\n📝 Environment Template (.env.production):');
  console.log('# Copy this template and fill in your values\n');
  
  Object.entries(REQUIRED_VARS).forEach(([key, description]) => {
    const isCritical = CRITICAL_VARS.includes(key);
    const prefix = isCritical ? '# CRITICAL: ' : '# OPTIONAL: ';
    console.log(`${prefix}${description}`);
    console.log(`${key}="your_value_here"`);
    console.log('');
  });
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--template')) {
    generateEnvTemplate();
  } else {
    const isValid = validateEnvironment();
    
    if (args.includes('--template-on-error') && !isValid) {
      generateEnvTemplate();
    }
    
    process.exit(isValid ? 0 : 1);
  }
}

module.exports = { validateEnvironment, generateEnvTemplate };