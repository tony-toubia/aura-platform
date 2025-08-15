// app/api/cron/process-notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[CRON-PROCESS] Notification processing job triggered')
    
    // Check authorization
    const cronSecret = request.headers.get('x-cron-secret')
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.log('[CRON-PROCESS] Invalid or missing CRON_SECRET')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid CRON_SECRET'
      }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    console.log('[CRON-PROCESS] Request body:', body)

    // Call the existing process-pending endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.aura-link.app'
    console.log('[CRON-PROCESS] Calling process-pending endpoint...')
    
    const processResponse = await fetch(`${baseUrl}/api/notifications/process-pending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await processResponse.json()
    const duration = Date.now() - startTime
    
    console.log('[CRON-PROCESS] Processing completed:', {
      ...result,
      totalDuration: duration
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Processed ${result.processed} notifications`,
        task: 'process-notifications',
        result: {
          processed: result.processed,
          failed: result.failed,
          duration,
          details: result.results || []
        },
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Notification processing failed',
        task: 'process-notifications',
        error: result.error,
        duration,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[CRON-PROCESS] Notification processing failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Notification processing failed',
      task: 'process-notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}