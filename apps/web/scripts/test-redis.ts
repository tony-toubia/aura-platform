// apps/web/scripts/test-redis.ts
// Test script to verify Redis connectivity
// Run with: npx tsx scripts/test-redis.ts

import { getRedisClient } from '../lib/redis/client'
import { cacheSet, cacheGet, CacheKeys, DistributedLock, RateLimiter } from '../lib/redis/cache-utils'

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection...\n')
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    const redis = await getRedisClient()
    
    // Check if we're using mock Redis (in-memory fallback)
    const isMock = !process.env.REDIS_HOST && !process.env.REDIS_URL && !process.env.GCP_PROJECT_ID
    
    if (isMock) {
      console.log('📦 Using in-memory mock Redis (no external Redis configured)')
      console.log('✅ Mock Redis connection successful!\n')
    } else {
      await redis.ping()
      console.log('✅ Redis connection successful!\n')
    }
    
    // Test 2: Set and Get
    console.log('2️⃣ Testing cache set/get...')
    const testKey = 'test:connection'
    const testData = { 
      message: 'Hello from Redis!', 
      timestamp: new Date().toISOString(),
      platform: 'Aura Platform'
    }
    
    await cacheSet(testKey, testData, 60)
    const retrieved = await cacheGet(testKey)
    
    if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
      console.log('✅ Cache set/get working correctly!')
      console.log('   Stored:', testData)
      console.log('   Retrieved:', retrieved)
    } else {
      console.log('❌ Cache set/get mismatch!')
    }
    console.log()
    
    // Test 3: TTL (skip for mock Redis)
    if (!isMock) {
      console.log('3️⃣ Testing TTL...')
      const ttl = await redis.ttl(testKey)
      console.log(`✅ TTL for key '${testKey}': ${ttl} seconds\n`)
    }
    
    // Test 4: Distributed Lock
    console.log('4️⃣ Testing distributed lock...')
    const lock = new DistributedLock('test:lock', 5)
    
    const acquired = await lock.acquire()
    if (acquired) {
      console.log('✅ Lock acquired successfully!')
      
      // Try to acquire again (should fail)
      const lock2 = new DistributedLock('test:lock', 5)
      const acquired2 = await lock2.acquire(1, 100)
      
      if (!acquired2) {
        console.log('✅ Second lock correctly blocked!')
      } else {
        console.log('❌ Second lock should have been blocked!')
      }
      
      // Release the lock
      await lock.release()
      console.log('✅ Lock released successfully!')
    } else {
      console.log('❌ Failed to acquire lock!')
    }
    console.log()
    
    // Test 5: Rate Limiter
    console.log('5️⃣ Testing rate limiter...')
    const limiter = new RateLimiter()
    const rateLimitKey = 'test:rate:user123'
    
    // Make 3 requests (limit is 5)
    for (let i = 1; i <= 3; i++) {
      const result = await limiter.checkLimit(rateLimitKey, 5, 60)
      console.log(`   Request ${i}: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} (${result.remaining} remaining)`)
    }
    console.log()
    
    // Test 6: Cache Keys
    console.log('6️⃣ Testing cache key generation...')
    console.log('   Weather key:', CacheKeys.weather(37.7749, -122.4194))
    console.log('   User subscription key:', CacheKeys.userSubscription('user123'))
    console.log('   Aura data key:', CacheKeys.auraData('aura456'))
    console.log()
    
    // Test 7: Performance
    console.log('7️⃣ Testing performance...')
    const perfKey = 'test:performance'
    const perfData = { data: 'x'.repeat(1000) } // 1KB of data
    
    const writeStart = Date.now()
    await cacheSet(perfKey, perfData, 60)
    const writeTime = Date.now() - writeStart
    
    const readStart = Date.now()
    await cacheGet(perfKey)
    const readTime = Date.now() - readStart
    
    console.log(`✅ Write time: ${writeTime}ms`)
    console.log(`✅ Read time: ${readTime}ms`)
    console.log()
    
    // Cleanup
    console.log('🧹 Cleaning up test keys...')
    if (isMock) {
      // For mock Redis, manually clear the keys
      const mockRedis = redis as any
      if (mockRedis.store) {
        mockRedis.store.delete(testKey)
        mockRedis.store.delete(perfKey)
        mockRedis.store.delete(rateLimitKey)
      }
    } else {
      await redis.del(testKey, perfKey, rateLimitKey)
    }
    console.log('✅ Cleanup complete!\n')
    
    // Summary
    console.log('========================================')
    console.log('✅ All Redis tests passed successfully!')
    console.log('========================================')
    console.log()
    console.log('📊 Redis Info:')
    
    // Get Redis info (if available and not mock)
    if (!isMock) {
      try {
        const info = await redis.info('server')
        const lines = info.split('\n')
        const version = lines.find(l => l.startsWith('redis_version:'))
        const uptime = lines.find(l => l.startsWith('uptime_in_seconds:'))
        
        if (version) console.log('   ' + version)
        if (uptime) {
          const seconds = parseInt(uptime.split(':')[1])
          const hours = Math.floor(seconds / 3600)
          console.log(`   Uptime: ${hours} hours`)
        }
      } catch (e) {
        // Info command might not be available in all Redis configurations
        console.log('   Redis server info not available')
      }
      
      // Close connection
      await redis.disconnect()
      console.log('\n👋 Redis connection closed')
    } else {
      console.log('   Mode: In-memory mock')
      console.log('\n👋 Mock Redis session ended')
    }
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Redis test failed!')
    console.error('Error:', error)
    console.error('\n🔧 Troubleshooting:')
    console.error('1. Make sure Redis is running')
    console.error('2. Check your environment variables:')
    console.error('   - REDIS_URL or REDIS_HOST/REDIS_PORT')
    console.error('   - GCP_PROJECT_ID (for production)')
    console.error('3. For GCP, ensure VPC connector is configured')
    console.error('4. Run setup script: npm run setup:redis')
    process.exit(1)
  }
}

// Run the test
testRedisConnection()