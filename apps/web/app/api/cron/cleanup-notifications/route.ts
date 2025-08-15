// app/api/cron/cleanup-notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[CRON-CLEANUP] Notification cleanup job triggered')
    
    // Check authorization
    const cronSecret = request.headers.get('x-cron-secret')
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.log('[CRON-CLEANUP] Invalid or missing CRON_SECRET')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid CRON_SECRET'
      }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const daysOld = body.days || 30
    console.log(`[CRON-CLEANUP] Cleaning up notifications older than ${daysOld} days`)

    // Create service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    const cutoffIso = cutoffDate.toISOString()

    // Clean up old processed notifications
    console.log('[CRON-CLEANUP] Cleaning up old processed notifications...')
    const { error: deleteError, count } = await supabase
      .from('proactive_messages')
      .delete()
      .eq('status', 'delivered')
      .lt('created_at', cutoffIso)

    if (deleteError) {
      console.error('[CRON-CLEANUP] Error cleaning up notifications:', deleteError)
      throw new Error(`Cleanup failed: ${deleteError.message}`)
    }

    // Clean up old rule execution logs
    console.log('[CRON-CLEANUP] Cleaning up old rule execution logs...')
    const { error: logDeleteError, count: logCount } = await supabase
      .from('rule_execution_log')
      .delete()
      .eq('triggered', false)
      .lt('executed_at', cutoffIso)

    if (logDeleteError) {
      console.warn('[CRON-CLEANUP] Error cleaning up execution logs:', logDeleteError)
      // Don't fail the entire job for this
    }

    // Clean up old background job records
    console.log('[CRON-CLEANUP] Cleaning up old background jobs...')
    const { error: jobDeleteError, count: jobCount } = await supabase
      .from('background_jobs')
      .delete()
      .in('status', ['COMPLETED', 'FAILED'])
      .lt('created_at', cutoffIso)

    if (jobDeleteError) {
      console.warn('[CRON-CLEANUP] Error cleaning up background jobs:', jobDeleteError)
      // Don't fail the entire job for this
    }

    const duration = Date.now() - startTime
    
    console.log('[CRON-CLEANUP] Cleanup completed:', {
      notifications: count || 0,
      executionLogs: logCount || 0,
      backgroundJobs: jobCount || 0,
      duration
    })

    return NextResponse.json({
      success: true,
      message: `Cleanup completed`,
      task: 'cleanup-notifications',
      result: {
        cleanedNotifications: count || 0,
        cleanedExecutionLogs: logCount || 0,
        cleanedBackgroundJobs: jobCount || 0,
        cutoffDate: cutoffIso,
        duration
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[CRON-CLEANUP] Cleanup failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Notification cleanup failed',
      task: 'cleanup-notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}