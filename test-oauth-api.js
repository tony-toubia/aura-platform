// Simple test script to check if the OAuth API is working
// Run this with: node test-oauth-api.js

const testOAuthAPI = async () => {
  try {
    console.log('🧪 Testing OAuth API endpoint...')
    
    // Test data
    const testData = {
      provider: 'google_fit',
      sense_type: 'fitness',
      provider_user_id: 'test@example.com',
      access_token: 'test_access_token_123',
      refresh_token: 'test_refresh_token_456',
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      scope: 'https://www.googleapis.com/auth/fitness.activity.read',
      aura_id: 'test-aura-id-123' // This should be a real aura ID from your database
    }
    
    console.log('📤 Sending test data:', testData)
    
    const response = await fetch('http://localhost:3000/api/oauth-connections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This won't work without proper authentication
        // You'll need to add proper auth headers or test from the browser
      },
      body: JSON.stringify(testData)
    })
    
    console.log('📥 Response status:', response.status, response.statusText)
    
    const responseData = await response.json()
    console.log('📋 Response data:', responseData)
    
    if (response.ok) {
      console.log('✅ API test successful!')
    } else {
      console.log('❌ API test failed:', responseData.error)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testOAuthAPI()
}

module.exports = { testOAuthAPI }