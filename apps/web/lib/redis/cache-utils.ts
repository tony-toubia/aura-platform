// apps/web/lib/redis/cache-utils.ts
import { getRedisClient } from './client'
import crypto from 'crypto'

/**
 * Cache key prefixes for different data types
 */
export const CacheKeys = {
  // Weather data
  weather: (lat: number, lon: number) => `weather:${lat}:${lon}`,
  
  // News data
  news: (type: string, location?: string) => 
    location ? `news:${type}:${location}` : `news:${type}`,
  
  // Air quality
  airQuality: (lat: number, lon: number) => `air:${lat}:${lon}`,
  
  // User subscription
  userSubscription: (userId: string) => `user:${userId}:subscription`,
  userAuraCount: (userId: string) => `user:${userId}:aura:count`,
  
  // Aura data
  auraData: (auraId: string) => `aura:${auraId}:data`,
  auraSenses: (auraId: string) => `aura:${auraId}:senses`,
  
  // OAuth connections
  oauthConnection: (userId: string, provider: string, senseType: string) => 
    `oauth:${userId}:${provider}:${senseType}`,
  oauthLibrary: (userId: string) => `oauth:${userId}:library`,
  
  // Conversation
  conversationHistory: (conversationId: string) => `conversation:${conversationId}:history`,
  
  // AI response caching (hash the prompt for key)
  aiResponse: (prompt: string) => `ai:${hashString(prompt)}`,
  
  // Rate limiting
  rateLimit: (userId: string, endpoint: string) => `rate:${userId}:${endpoint}`,
  
  // Distributed locks
  createAuraLock: (userId: string, auraName: string) => `lock:create:${userId}:${auraName}`,
  
  // Sense data aggregation
  senseDataAggregate: (auraId: string) => `sense:aggregate:${auraId}`,
} as const

/**
 * Cache TTL values in seconds
 */
export const CacheTTL = {
  WEATHER: 600,           // 10 minutes
  NEWS: 900,              // 15 minutes
  AIR_QUALITY: 1800,      // 30 minutes
  USER_SUBSCRIPTION: 300, // 5 minutes
  AURA_DATA: 600,         // 10 minutes
  OAUTH_CONNECTION: 600,  // 10 minutes
  AI_RESPONSE: 3600,      // 1 hour
  SENSE_AGGREGATE: 60,    // 1 minute
  LOCK_TIMEOUT: 10,       // 10 seconds for locks
} as const

/**
 * Hash a string to create a consistent cache key
 */
function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16)
}

/**
 * Generic cache get with JSON parsing
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient()
    const value = await redis.get(key)
    
    if (!value) return null
    
    return JSON.parse(value) as T
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error)
    return null
  }
}

/**
 * Generic cache set with JSON stringification and TTL
 */
export async function cacheSet<T>(
  key: string, 
  value: T, 
  ttlSeconds: number = 600
): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const serialized = JSON.stringify(value)
    
    await redis.setex(key, ttlSeconds, serialized)
    return true
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error)
    return false
  }
}

/**
 * Delete cache entries by pattern
 */
export async function cacheDelete(pattern: string): Promise<number> {
  try {
    const redis = getRedisClient()
    
    // For production Redis, use SCAN to find keys
    // For mock Redis, we'll just delete the specific key
    if (pattern.includes('*')) {
      // In production, you'd use redis.scanStream() here
      console.warn('Pattern deletion not fully implemented in mock mode')
      return 0
    }
    
    return await redis.del(pattern)
  } catch (error) {
    console.error(`Cache delete error for pattern ${pattern}:`, error)
    return 0
  }
}

/**
 * Cache wrapper function that checks cache first, then calls loader if miss
 */
export async function withCache<T>(
  key: string,
  loader: () => Promise<T>,
  ttlSeconds: number = 600
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    console.log(`Cache hit for key: ${key}`)
    return cached
  }
  
  console.log(`Cache miss for key: ${key}`)
  
  // Load fresh data
  const fresh = await loader()
  
  // Store in cache for next time
  await cacheSet(key, fresh, ttlSeconds)
  
  return fresh
}

/**
 * Distributed lock implementation using Redis
 */
export class DistributedLock {
  private redis = getRedisClient()
  private lockKey: string
  private lockValue: string
  private ttlSeconds: number
  
  constructor(key: string, ttlSeconds: number = 10) {
    this.lockKey = key
    this.lockValue = crypto.randomBytes(16).toString('hex')
    this.ttlSeconds = ttlSeconds
  }
  
  /**
   * Try to acquire the lock
   */
  async acquire(retries: number = 3, retryDelay: number = 100): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        // SET NX EX - set if not exists with expiry
        const result = await this.redis.set(
          this.lockKey,
          this.lockValue,
          'EX',
          this.ttlSeconds,
          'NX'
        )
        
        if (result === 'OK') {
          return true
        }
      } catch (error) {
        console.error(`Failed to acquire lock ${this.lockKey}:`, error)
      }
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
    
    return false
  }
  
  /**
   * Release the lock (only if we own it)
   */
  async release(): Promise<boolean> {
    try {
      // Use Lua script to ensure atomic check-and-delete
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `
      
      // For mock Redis, we'll do a simple delete
      // In production, you'd use redis.eval(script, 1, this.lockKey, this.lockValue)
      const currentValue = await this.redis.get(this.lockKey)
      if (currentValue === this.lockValue) {
        await this.redis.del(this.lockKey)
        return true
      }
      
      return false
    } catch (error) {
      console.error(`Failed to release lock ${this.lockKey}:`, error)
      return false
    }
  }
}

/**
 * Rate limiter using Redis
 */
export class RateLimiter {
  private redis = getRedisClient()
  
  /**
   * Check if request is allowed under rate limit
   */
  async checkLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const windowStart = now - (windowSeconds * 1000)
    
    try {
      // Remove old entries outside the window
      // In production, you'd use ZREMRANGEBYSCORE
      // For now, we'll use a simple counter with expiry
      const count = await this.redis.incr(key)
      
      if (count === 1) {
        await this.redis.expire(key, windowSeconds)
      }
      
      const ttl = await this.redis.ttl(key)
      const resetAt = now + (ttl * 1000)
      
      return {
        allowed: count <= maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetAt
      }
    } catch (error) {
      console.error(`Rate limit check failed for ${key}:`, error)
      // On error, allow the request
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: now + (windowSeconds * 1000)
      }
    }
  }
}

/**
 * Cache invalidation utilities
 */
export const CacheInvalidation = {
  /**
   * Invalidate all cache entries for a user
   */
  async invalidateUser(userId: string): Promise<void> {
    const patterns = [
      CacheKeys.userSubscription(userId),
      CacheKeys.userAuraCount(userId),
      `oauth:${userId}:*`,
      `rate:${userId}:*`,
    ]
    
    for (const pattern of patterns) {
      await cacheDelete(pattern)
    }
  },
  
  /**
   * Invalidate all cache entries for an aura
   */
  async invalidateAura(auraId: string): Promise<void> {
    const patterns = [
      CacheKeys.auraData(auraId),
      CacheKeys.auraSenses(auraId),
      CacheKeys.senseDataAggregate(auraId),
    ]
    
    for (const pattern of patterns) {
      await cacheDelete(pattern)
    }
  },
  
  /**
   * Invalidate weather cache for a location
   */
  async invalidateWeather(lat: number, lon: number): Promise<void> {
    await cacheDelete(CacheKeys.weather(lat, lon))
  },
  
  /**
   * Invalidate all news cache
   */
  async invalidateNews(): Promise<void> {
    await cacheDelete('news:*')
  },
}