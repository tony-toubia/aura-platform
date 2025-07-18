// apps/web/app/api/news/route.ts

import { NextResponse } from 'next/server'
import { NewsService } from '@/lib/services/news-service'

/**
 * GET /api/news
 * Returns an array of top headlines:
 *   [{ title: string, url: string }, …]
 */
export async function GET() {
  try {
    const headlines = await NewsService.getTopHeadlines()
    return NextResponse.json(headlines)
  } catch (err: any) {
    console.error('[GET /api/news] error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
