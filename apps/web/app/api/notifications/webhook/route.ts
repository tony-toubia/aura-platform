// app/api/notifications/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[NOTIF-WEBHOOK] Webhook triggered')
    
    // Check authorization
    const cronSecret = request.headers.get('x-cron-secret')
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.log('[NOTIF-WEBHOOK] Invalid or missing CRON_SECRET')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const task = body.task || 'process-notifications'

    console.log(`[NOTIF-WEBHOOK] Processing task: ${task}`)

    let result

    switch (task) {
      case 'process-notifications':
        // Process pending notifications
        console.log('[NOTIF-WEBHOOK] Processing pending notifications...')
        const processResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.aura-link.app'}/api/notifications/process-pending`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        result = await processResponse.json()
        console.log('[NOTIF-WEBHOOK] Process result:', result)
        break

      case 'evaluate-rules':
        // Evaluate notification rules
        console.log('[NOTIF-WEBHOOK] Evaluating notification rules...')
        const evaluateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.aura-link.app'}/api/cron/evaluate-rules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cron-secret': process.env.CRON_SECRET || ''
          },
          body: JSON.stringify({ source: 'webhook' })
        })
        result = await evaluateResponse.json()
        console.log('[NOTIF-WEBHOOK] Evaluate result:', result)
        break

      default:
        console.log(`[NOTIF-WEBHOOK] Unknown task: ${task}`)
        return NextResponse.json({ 
          error: 'Unknown task',
          validTasks: ['process-notifications', 'evaluate-rules']
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      task,
      timestamp: new Date().toISOString(),
      result
    })

  } catch (error) {
    console.error('[NOTIF-WEBHOOK] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Notification webhook endpoint',
    usage: 'POST with x-cron-secret header and task in body',
    validTasks: ['process-notifications', 'evaluate-rules']
  })
}