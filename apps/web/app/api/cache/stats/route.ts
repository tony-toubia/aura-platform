// apps/web/app/api/cache/stats/route.ts
import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function GET() {
  try {
    // Check authentication and admin status
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Optional: Check if user is admin
    // const isAdmin = await checkIfUserIsAdmin(user.id)
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    // }
    
    const redis = getRedisClient()
    
    // Collect cache statistics
    const stats = {
      timestamp: new Date().toISOString(),
      connection: {
        status: 'connected',
        // In production Redis, you can get more info with redis.info()
      },
      patterns: await getCachePatternStats(redis),
      memory: await getMemoryStats(redis),
      performance: await getPerformanceMetrics(),
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to get cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve cache statistics' },
      { status: 500 }
    )
  }
}

/**
 * Get statistics for different cache key patterns
 */
async function getCachePatternStats(redis: any) {
  const patterns = [
    { name: 'Weather Data', pattern: 'weather:*', ttl: 600 },
    { name: 'News Data', pattern: 'news:*', ttl: 900 },
    { name: 'User Subscriptions', pattern: 'user:*:subscription', ttl: 300 },
    { name: 'Aura Data', pattern: 'aura:*', ttl: 600 },
    { name: 'OAuth Connections', pattern: 'oauth:*', ttl: 600 },
    { name: 'Rate Limits', pattern: 'rate:*', ttl: 60 },
    { name: 'Distributed Locks', pattern: 'lock:*', ttl: 10 },
  ]
  
  const stats = []
  
  for (const { name, pattern, ttl } of patterns) {
    // In production Redis, use SCAN to count keys
    // For mock Redis, we'll return sample data
    stats.push({
      name,
      pattern,
      count: Math.floor(Math.random() * 100), // Mock count
      avgTtl: ttl,
      hitRate: Math.floor(Math.random() * 100), // Mock hit rate percentage
    })
  }
  
  return stats
}

/**
 * Get memory usage statistics
 */
async function getMemoryStats(redis: any) {
  // In production Redis, use redis.info('memory')
  // For mock, return sample data
  return {
    used: '12.5 MB',
    peak: '15.2 MB',
    overhead: '2.1 MB',
    dataset: '10.4 MB',
    keys: 1234,
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics() {
  // Track these metrics in your actual implementation
  return {
    hits: 8543,
    misses: 1256,
    hitRate: '87.2%',
    avgGetTime: '2.3ms',
    avgSetTime: '3.1ms',
    totalOperations: 9799,
    operationsPerSecond: 45,
  }
}