// apps/web/lib/redis/client.ts
import Redis from 'ioredis'

let redis: Redis | null = null

/**
 * Get or create a Redis client instance
 * Uses singleton pattern to ensure only one connection
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL
    
    if (!redisUrl) {
      console.warn('Redis URL not configured. Using in-memory fallback.')
      // For development without Redis, we'll create a mock client
      // In production, you should always have Redis configured
      redis = createMockRedisClient() as any
    } else {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error('Redis connection failed after 3 retries')
            return null
          }
          return Math.min(times * 100, 3000)
        },
        reconnectOnError: (err) => {
          const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT']
          return targetErrors.some(e => err.message.includes(e))
        },
      })

      redis.on('error', (err) => {
        console.error('Redis Client Error:', err)
      })

      redis.on('connect', () => {
        console.log('Redis Client Connected')
      })
    }
  }
  
  return redis!
}

/**
 * Create a mock Redis client for development without Redis
 * This provides basic get/set functionality using Map
 */
function createMockRedisClient(): any {
  const store = new Map<string, { value: string; expiry?: number }>()
  
  return {
    async get(key: string): Promise<string | null> {
      const item = store.get(key)
      if (!item) return null
      
      if (item.expiry && Date.now() > item.expiry) {
        store.delete(key)
        return null
      }
      
      return item.value
    },
    
    async set(key: string, value: string): Promise<'OK'> {
      store.set(key, { value })
      return 'OK'
    },
    
    async setex(key: string, seconds: number, value: string): Promise<'OK'> {
      store.set(key, { 
        value, 
        expiry: Date.now() + (seconds * 1000) 
      })
      return 'OK'
    },
    
    async del(...keys: string[]): Promise<number> {
      let deleted = 0
      for (const key of keys) {
        if (store.delete(key)) deleted++
      }
      return deleted
    },
    
    async exists(...keys: string[]): Promise<number> {
      let count = 0
      for (const key of keys) {
        if (store.has(key)) count++
      }
      return count
    },
    
    async expire(key: string, seconds: number): Promise<number> {
      const item = store.get(key)
      if (!item) return 0
      
      item.expiry = Date.now() + (seconds * 1000)
      return 1
    },
    
    async ttl(key: string): Promise<number> {
      const item = store.get(key)
      if (!item || !item.expiry) return -1
      
      const ttl = Math.floor((item.expiry - Date.now()) / 1000)
      return ttl > 0 ? ttl : -2
    },
    
    async incr(key: string): Promise<number> {
      const current = store.get(key)
      const value = current ? parseInt(current.value) + 1 : 1
      store.set(key, { value: value.toString() })
      return value
    },
    
    async hset(key: string, field: string, value: string): Promise<number> {
      const hashKey = `${key}:${field}`
      const exists = store.has(hashKey)
      store.set(hashKey, { value })
      return exists ? 0 : 1
    },
    
    async hget(key: string, field: string): Promise<string | null> {
      const hashKey = `${key}:${field}`
      const item = store.get(hashKey)
      return item ? item.value : null
    },
    
    async hgetall(key: string): Promise<Record<string, string>> {
      const result: Record<string, string> = {}
      const prefix = `${key}:`
      
      for (const [k, v] of store.entries()) {
        if (k.startsWith(prefix)) {
          const field = k.slice(prefix.length)
          result[field] = v.value
        }
      }
      
      return result
    },
    
    on: () => {},
    disconnect: async () => {},
  }
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.disconnect()
    redis = null
  }
}