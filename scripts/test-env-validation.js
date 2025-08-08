// Test script to verify environment validation logic
// Run with: node scripts/test-env-validation.js

// Simulate client-side environment (no server-side vars)
process.env.NODE_ENV = 'production'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
// Don't set OPENAI_API_KEY or JWT_SECRET to simulate client-side

// Mock window object for client-side test
global.window = {}

console.log('Testing client-side validation (should pass)...')
try {
  // Import after setting up environment
  const { validateEnvironment } = require('../apps/web/lib/config/env.ts')
  validateEnvironment(false) // client-side
  console.log('✅ Client-side validation passed')
} catch (error) {
  console.log('❌ Client-side validation failed:', error.message)
}

// Test server-side validation
delete global.window
process.env.OPENAI_API_KEY = 'sk-test-key'
process.env.JWT_SECRET = 'test-jwt-secret'

console.log('\nTesting server-side validation (should pass)...')
try {
  const { validateEnvironment } = require('../apps/web/lib/config/env.ts')
  validateEnvironment(true) // server-side
  console.log('✅ Server-side validation passed')
} catch (error) {
  console.log('❌ Server-side validation failed:', error.message)
}

console.log('\nEnvironment validation fix should resolve the login issue!')