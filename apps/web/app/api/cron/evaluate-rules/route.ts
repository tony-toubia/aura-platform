// app/api/cron/evaluate-rules/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { RuleEvaluatorWorker } from '@/lib/services/workers/rule-evaluator-worker'

/**
 * POST /api/cron/evaluate-rules
 * Endpoint to be called by cron service (Vercel Cron, Google Cloud Scheduler, etc.)
 * 
 * This endpoint should be protected in production with:
 * 1. Cron secret header validation
 * 2. IP allowlist (if using specific cron service)
 * 3. Rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🕐 Cron job triggered: Rule evaluation')

    // Verify cron secret in production
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET
    
    if (process.env.NODE_ENV === 'production' && (!cronSecret || cronSecret !== expectedSecret)) {
      console.error('❌ Invalid cron secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if another evaluation is already running
    const isRunning = await isEvaluationRunning()
    if (isRunning) {
      console.log('⏸️  Evaluation already running, skipping...')
      return NextResponse.json({ 
        message: 'Evaluation already running',
        skipped: true 
      })
    }

    // Initialize and run the worker
    const worker = new RuleEvaluatorWorker({
      batchSize: parseInt(process.env.RULE_EVALUATION_BATCH_SIZE || '50'),
      evaluationTimeout: parseInt(process.env.RULE_EVALUATION_TIMEOUT || '30000'),
      sensorDataTTL: parseInt(process.env.SENSOR_DATA_CACHE_TTL || '600'),
      maxRetries: parseInt(process.env.RULE_EVALUATION_MAX_RETRIES || '3')
    })

    const result = await worker.execute()

    console.log('✅ Cron evaluation completed:', {
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      duration: `${result.duration}ms`
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: {
        processed: result.processed,
        succeeded: result.succeeded,
        failed: result.failed,
        duration: result.duration,
        errors: result.errors
      }
    })
  } catch (error) {
    console.error('💥 Cron evaluation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * GET /api/cron/evaluate-rules
 * Health check and status endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    // Get recent background job status
    const { data: recentJobs, error } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('job_type', 'rule_evaluation')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      throw error
    }

    const isRunning = await isEvaluationRunning()

    return NextResponse.json({
      status: 'healthy',
      isRunning,
      recentJobs: recentJobs || [],
      config: {
        batchSize: process.env.RULE_EVALUATION_BATCH_SIZE || '50',
        timeout: process.env.RULE_EVALUATION_TIMEOUT || '30000',
        cacheTTL: process.env.SENSOR_DATA_CACHE_TTL || '600'
      }
    })
  } catch (error) {
    console.error('❌ Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      error: String(error)
    }, { status: 500 })
  }
}

/**
 * Check if evaluation is currently running
 */
async function isEvaluationRunning(): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    // Check for running background jobs of type 'rule_evaluation'
    const { data, error } = await supabase
      .from('background_jobs')
      .select('id')
      .eq('job_type', 'rule_evaluation')
      .eq('status', 'RUNNING')
      .limit(1)

    if (error) {
      console.error('⚠️  Error checking running jobs:', error)
      return false
    }

    return (data?.length || 0) > 0
  } catch (error) {
    console.error('⚠️  Error in isEvaluationRunning:', error)
    return false
  }
}