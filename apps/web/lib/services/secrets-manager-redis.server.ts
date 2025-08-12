// apps/web/lib/services/secrets-manager-redis.server.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

let secretClient: SecretManagerServiceClient | null = null

/**
 * Get Redis connection details from Google Secret Manager
 */
export async function getRedisConfig() {
  // In development, use local Redis or mock
  if (process.env.NODE_ENV === 'development') {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }

  // In production, get from Secret Manager
  try {
    if (!secretClient) {
      secretClient = new SecretManagerServiceClient()
    }

    const projectId = process.env.GCP_PROJECT_ID || 'aura-platform-467500'
    
    // Fetch Redis host from Secret Manager
    const [hostSecret] = await secretClient.accessSecretVersion({
      name: `projects/${projectId}/secrets/redis-host/versions/latest`
    })
    const redisHost = hostSecret.payload?.data?.toString() || ''

    // Fetch Redis port (optional, default to 6379)
    let redisPort = 6379
    try {
      const [portSecret] = await secretClient.accessSecretVersion({
        name: `projects/${projectId}/secrets/redis-port/versions/latest`
      })
      redisPort = parseInt(portSecret.payload?.data?.toString() || '6379')
    } catch {
      // Port secret is optional
    }

    // Fetch Redis auth string (if AUTH is enabled)
    let redisAuth = ''
    try {
      const [authSecret] = await secretClient.accessSecretVersion({
        name: `projects/${projectId}/secrets/redis-auth/versions/latest`
      })
      redisAuth = authSecret.payload?.data?.toString() || ''
    } catch {
      // Auth is optional for Memorystore
    }

    // Construct Redis URL
    const redisUrl = redisAuth 
      ? `redis://:${redisAuth}@${redisHost}:${redisPort}`
      : `redis://${redisHost}:${redisPort}`

    console.log(`Redis configured for Memorystore at ${redisHost}:${redisPort}`)

    return {
      host: redisHost,
      port: redisPort,
      password: redisAuth || undefined,
      url: redisUrl
    }
  } catch (error) {
    console.error('Failed to get Redis config from Secret Manager:', error)
    
    // Fallback to environment variables if Secret Manager fails
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }
}

/**
 * Get Redis URL for connection
 */
export async function getRedisUrl(): Promise<string> {
  const config = await getRedisConfig()
  return config.url
}