// apps/web/app/api/news/route.ts

import { NextResponse } from 'next/server'
import { NewsService } from '@/lib/services/news-service'
import { CacheKeys, CacheTTL, withCache } from '@/lib/redis'

/**
 * GET /api/news
 * Returns an array of top headlines with Redis caching:
 *   [{ title: string, url: string }, …]
 */
export async function GET(request: Request) {
  try {
    // Parse query params for location-based news
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'
    const location = searchParams.get('location') || undefined
    
    // Use Redis cache with automatic fallback to API
    const headlines = await withCache(
      CacheKeys.news(type, location),
      async () => {
        console.log(`Fetching fresh news data for type: ${type}, location: ${location || 'global'}`)
        
        // Fetch from NewsService
        const freshHeadlines = await NewsService.getTopHeadlines()
        
        // Add metadata for cache tracking
        return {
          headlines: freshHeadlines,
          type,
          location,
          cachedAt: new Date().toISOString(),
          count: freshHeadlines.length
        }
      },
      CacheTTL.NEWS // 15 minutes TTL
    )
    
    // Return just the headlines array for backward compatibility
    // but include cache metadata in headers
    const response = NextResponse.json(headlines.headlines || headlines)
    response.headers.set('X-Cache-Status', headlines.cachedAt ? 'HIT' : 'MISS')
    if (headlines.cachedAt) {
      response.headers.set('X-Cached-At', headlines.cachedAt)
    }
    
    return response
  } catch (err: any) {
    console.error('[GET /api/news] error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
