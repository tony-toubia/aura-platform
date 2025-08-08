// Test script to verify subscription guard logic
// Run with: node scripts/test-subscription-guard.js

const { SUBSCRIPTION_TIERS } = require('../apps/web/lib/services/subscription-service.ts')

console.log('Testing subscription guard logic...\n')

// Test free tier limits
const freeTier = SUBSCRIPTION_TIERS.free
console.log('Free tier limits:')
console.log('- Max Auras:', freeTier.features.maxAuras)
console.log('- Max Rules per Aura:', freeTier.features.maxRulesPerAura)
console.log('- Max Messages:', freeTier.features.maxMessages)

// Simulate the logic from checkFeatureAccess
function simulateMaxAurasCheck(currentCount, maxAuras) {
  const hasAccess = maxAuras === -1 || currentCount < maxAuras
  return hasAccess
}

console.log('\nTesting maxAuras logic:')
console.log('Current: 0, Max: 1 =>', simulateMaxAurasCheck(0, 1)) // Should be true
console.log('Current: 1, Max: 1 =>', simulateMaxAurasCheck(1, 1)) // Should be false
console.log('Current: 0, Max: -1 =>', simulateMaxAurasCheck(0, -1)) // Should be true (unlimited)

console.log('\nIf you have 0 auras and are on free tier, you should be able to create 1 aura.')
console.log('If you have 1 aura and are on free tier, you should NOT be able to create another.')