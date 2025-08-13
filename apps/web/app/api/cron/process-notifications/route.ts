// app/api/cron/process-notifications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/services/notification-service'

/**
 * POST /api/cron/process-notifications
 * Process queued notifications
 * 
 * This can be called by:
 * 1. Cron jobs for batch processing
 * 2. Manual triggers for stuck notifications
 * 3. Webhook handlers for external events
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 Processing notification queue')

    // Verify cron secret in production
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET
    
    if (process.env.NODE_ENV === 'production' && (!cronSecret || cronSecret !== expectedSecret)) {
      console.error('❌ Invalid cron secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process the notification queue
    const result = await NotificationService.processQueue()

    console.log('✅ Queue processing completed:', {
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: {
        processed: result.processed,
        succeeded: result.succeeded,
        failed: result.failed,
        errors: result.errors
      }
    })
  } catch (error) {
    console.error('💥 Queue processing failed:', error)
    
    return NextResponse.json({
      success: false,
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * GET /api/cron/process-notifications
 * Get queue status and statistics
 */
export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    // Get queue statistics
    const [queuedCount, recentStats] = await Promise.all([
      // Count of queued notifications
      supabase
        .from('proactive_messages')
        .select('id', { count: 'exact' })
        .eq('status', 'QUEUED'),
      
      // Recent processing statistics (last 24 hours)
      supabase
        .from('proactive_messages')
        .select('status, delivery_channel, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ])

    const queueSize = queuedCount.count || 0
    const recentNotifications = recentStats.data || []

    // Calculate statistics
    const stats = {
      queueSize,
      last24Hours: {
        total: recentNotifications.length,
        delivered: recentNotifications.filter(n => n.status === 'DELIVERED').length,
        failed: recentNotifications.filter(n => n.status === 'FAILED').length,
        pending: recentNotifications.filter(n => n.status === 'PENDING').length,
        queued: recentNotifications.filter(n => n.status === 'QUEUED').length,
        byChannel: recentNotifications.reduce((acc: Record<string, number>, n) => {
          acc[n.delivery_channel] = (acc[n.delivery_channel] || 0) + 1
          return acc
        }, {})
      }
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats
    })
  } catch (error) {
    console.error('❌ Queue status check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      error: String(error)
    }, { status: 500 })
  }
}