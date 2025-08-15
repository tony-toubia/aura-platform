// app/api/cron/evaluate-rules/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { RuleEvaluatorWorker } from '@/lib/services/workers/rule-evaluator-worker'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[CRON-RULES] Rule evaluation job triggered')
    
    // Check authorization
    const cronSecret = request.headers.get('x-cron-secret')
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.log('[CRON-RULES] Invalid or missing CRON_SECRET')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid CRON_SECRET'
      }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    console.log('[CRON-RULES] Request body:', body)

    // Initialize and execute rule evaluator
    const worker = new RuleEvaluatorWorker()
    const result = await worker.execute()
    
    const duration = Date.now() - startTime
    
    console.log('[CRON-RULES] Rule evaluation completed:', {
      ...result,
      totalDuration: duration
    })

    return NextResponse.json({
      success: true,
      message: `Rule evaluation completed`,
      task: 'evaluate-rules',
      result: {
        processed: result.processed,
        succeeded: result.succeeded,  
        failed: result.failed,
        duration: result.duration,
        totalDuration: duration,
        errors: result.errors
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[CRON-RULES] Rule evaluation failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Rule evaluation failed',
      task: 'evaluate-rules',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}