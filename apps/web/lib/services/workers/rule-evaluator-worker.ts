// lib/services/workers/rule-evaluator-worker.ts

import { createClient } from '@/lib/supabase/client'
import { SenseDataService } from '../sense-data-service'
import { RuleEngine, RuleContext } from '../rule-engine'
import { NotificationService } from '../notification-service'
import type { 
  RuleEvaluatorConfig, 
  WorkerResult, 
  BatchResult, 
  EvaluationResult,
  TierLimits,
  NotificationPayload
} from '@/types/notifications'
import type { Aura, BehaviorRule } from '@/types'

const DEFAULT_CONFIG: RuleEvaluatorConfig = {
  batchSize: 50,
  evaluationTimeout: 30000, // 30 seconds
  sensorDataTTL: 600,       // 10 minutes
  maxRetries: 3
}

const TIER_LIMITS: Record<string, TierLimits> = {
  FREE: {
    evaluationFrequency: 30 * 60 * 1000,  // 30 minutes
    maxNotificationsPerDay: 10,
    maxRulesPerAura: 3,
    channels: ['IN_APP'],
    sensorDataCacheTTL: 3600,  // 1 hour
    priority: 1
  },
  PERSONAL: {
    evaluationFrequency: 15 * 60 * 1000,  // 15 minutes
    maxNotificationsPerDay: 50,
    maxRulesPerAura: 10,
    channels: ['IN_APP', 'WEB_PUSH'],
    sensorDataCacheTTL: 1800,  // 30 minutes
    priority: 2
  },
  FAMILY: {
    evaluationFrequency: 5 * 60 * 1000,   // 5 minutes
    maxNotificationsPerDay: 200,
    maxRulesPerAura: 25,
    channels: ['IN_APP', 'WEB_PUSH', 'SMS'],
    sensorDataCacheTTL: 600,   // 10 minutes
    priority: 3
  },
  BUSINESS: {
    evaluationFrequency: 60 * 1000,       // 1 minute
    maxNotificationsPerDay: -1,           // Unlimited
    maxRulesPerAura: -1,                  // Unlimited
    channels: ['IN_APP', 'WEB_PUSH', 'SMS', 'WHATSAPP'],
    sensorDataCacheTTL: 300,   // 5 minutes
    priority: 4
  }
}

export class RuleEvaluatorWorker {
  private config: RuleEvaluatorConfig
  private supabase = createClient()

  constructor(config: Partial<RuleEvaluatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Main entry point - called by cron job
   */
  async execute(): Promise<WorkerResult> {
    const startTime = Date.now()
    console.log('🔄 Starting rule evaluation cycle')

    try {
      // Create background job record
      const jobId = await this.createBackgroundJob('rule_evaluation')
      
      try {
        await this.updateBackgroundJob(jobId, 'RUNNING')
        
        // Get active auras eligible for evaluation
        const eligibleAuras = await this.getEligibleAuras()
        console.log(`📋 Found ${eligibleAuras.length} eligible auras`)

        // Process in batches
        const batches = this.chunkArray(eligibleAuras, this.config.batchSize)
        let totalProcessed = 0
        let totalSucceeded = 0
        let totalFailed = 0
        const errors: string[] = []

        for (const batch of batches) {
          try {
            const batchResult = await this.processBatch(batch.map(a => a.id))
            totalProcessed += batch.length
            totalSucceeded += batchResult.succeeded
            totalFailed += batchResult.failed
            
            if (batchResult.errors.length > 0) {
              errors.push(...batchResult.errors)
            }
          } catch (error) {
            console.error('❌ Batch processing failed:', error)
            errors.push(`Batch processing failed: ${error}`)
            totalFailed += batch.length
          }
        }

        const duration = Date.now() - startTime
        const result: WorkerResult = {
          processed: totalProcessed,
          succeeded: totalSucceeded,
          failed: totalFailed,
          duration,
          errors
        }

        await this.updateBackgroundJob(jobId, 'COMPLETED', { result })
        console.log('✅ Rule evaluation cycle completed:', result)
        return result
        
      } catch (error) {
        await this.updateBackgroundJob(jobId, 'FAILED', { error: String(error) })
        throw error
      }
      
    } catch (error) {
      console.error('💥 Rule evaluation cycle failed:', error)
      const duration = Date.now() - startTime
      return {
        processed: 0,
        succeeded: 0,
        failed: 0,
        duration,
        errors: [String(error)]
      }
    }
  }

  /**
   * Process a batch of aura IDs
   */
  private async processBatch(auraIds: string[]): Promise<{
    succeeded: number
    failed: number
    errors: string[]
  }> {
    const promises = auraIds.map(auraId => 
      this.evaluateAuraRules(auraId).catch(error => ({ error, auraId }))
    )

    const results = await Promise.allSettled(promises)
    let succeeded = 0
    let failed = 0
    const errors: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if ('error' in result.value) {
          failed++
          errors.push(`Aura ${auraIds[index]}: ${result.value.error}`)
        } else {
          succeeded++
        }
      } else {
        failed++
        errors.push(`Aura ${auraIds[index]}: ${result.reason}`)
      }
    })

    return { succeeded, failed, errors }
  }

  /**
   * Evaluate rules for a single aura
   */
  private async evaluateAuraRules(auraId: string): Promise<EvaluationResult> {
    const startTime = Date.now()

    try {
      // Get aura with rules
      const aura = await this.getAuraWithRules(auraId)
      if (!aura || !aura.proactiveEnabled) {
        return {
          auraId,
          triggered: false,
          rules: [],
          sensorData: {},
          duration: Date.now() - startTime
        }
      }

      // Fetch sensor data
      const sensorData = await this.fetchSensorData(aura)
      
      // Build rule context
      const ruleContext = this.buildRuleContext(sensorData, aura)
      
      // Get rules that haven't been evaluated recently (cooldown check)
      const evaluableRules = await this.filterRulesByCooldown(aura.rules)
      
      // Evaluate rules
      const triggeredRules = RuleEngine.evaluateRules(evaluableRules, ruleContext)
      
      // Process triggered rules
      let totalTriggered = 0
      const ruleResults = []

      for (const ruleResult of triggeredRules) {
        try {
          // Check if we should trigger based on subscription limits and cooldowns
          const shouldTrigger = await this.shouldTrigger(ruleResult.rule, aura.userId)
          
          if (shouldTrigger) {
            // Queue notification
            await this.queueNotification(ruleResult.rule, aura, ruleContext, ruleResult.message!)
            totalTriggered++
            
            // Log execution
            await this.logRuleExecution(
              ruleResult.rule.id,
              auraId,
              true,
              sensorData,
              { triggered: true, message: ruleResult.message },
              Date.now() - startTime
            )
            
            ruleResults.push({
              ruleId: ruleResult.rule.id,
              triggered: true,
              message: ruleResult.message
            })
          } else {
            ruleResults.push({
              ruleId: ruleResult.rule.id,
              triggered: false,
              message: 'Skipped due to cooldown or limits'
            })
          }
        } catch (error) {
          console.error(`❌ Failed to process rule ${ruleResult.rule.id}:`, error)
          ruleResults.push({
            ruleId: ruleResult.rule.id,
            triggered: false,
            error: String(error)
          })
        }
      }

      // Log non-triggered rules
      for (const rule of evaluableRules) {
        if (!triggeredRules.find(tr => tr.rule.id === rule.id)) {
          await this.logRuleExecution(
            rule.id,
            auraId,
            false,
            sensorData,
            { triggered: false },
            Date.now() - startTime
          )
        }
      }

      // Update aura's last evaluation time
      await this.updateAuraEvaluationTime(auraId)

      return {
        auraId,
        triggered: totalTriggered > 0,
        rules: ruleResults,
        sensorData,
        duration: Date.now() - startTime
      }

    } catch (error) {
      console.error(`❌ Failed to evaluate aura ${auraId}:`, error)
      throw error
    }
  }

  /**
   * Get auras eligible for evaluation based on subscription tier and timing
   */
  private async getEligibleAuras(): Promise<Aura[]> {
    const { data: auras, error } = await this.supabase
      .from('auras')
      .select(`
        *,
        user:users!inner(subscription:subscriptions(*)),
        rules:behavior_rules!inner(*)
      `)
      .eq('enabled', true)
      .eq('proactive_enabled', true)
      .gt('rules.count', 0) // At least one rule

    if (error) {
      throw new Error(`Failed to fetch eligible auras: ${error.message}`)
    }

    // Filter by evaluation frequency based on subscription tier
    const now = new Date()
    return (auras || []).filter((aura: any) => {
      const tier = aura.user?.subscription?.tier || 'FREE'
      const limits = TIER_LIMITS[tier]
      const lastEvaluation = aura.last_evaluation_at ? new Date(aura.last_evaluation_at) : null
      
      if (!lastEvaluation) return true // Never evaluated
      
      const timeSinceLastEval = now.getTime() - lastEvaluation.getTime()
      return timeSinceLastEval >= limits.evaluationFrequency
    })
  }

  /**
   * Get aura with its rules
   */
  private async getAuraWithRules(auraId: string): Promise<(Aura & { rules: BehaviorRule[] }) | null> {
    const { data: aura, error } = await this.supabase
      .from('auras')
      .select(`
        *,
        rules:behavior_rules(*)
      `)
      .eq('id', auraId)
      .eq('enabled', true)
      .eq('proactive_enabled', true)
      .single()

    if (error || !aura) return null
    return aura as any
  }

  /**
   * Fetch and cache sensor data for an aura
   */
  private async fetchSensorData(aura: Aura): Promise<Record<string, any>> {
    try {
      const senseData = await SenseDataService.getSenseData(aura.senses)
      
      // Convert to the format expected by rule engine
      return senseData.reduce<Record<string, any>>((acc, item) => {
        acc[item.senseId] = item.data
        return acc
      }, {})
    } catch (error) {
      console.error('⚠️  Failed to fetch sensor data:', error)
      return {}
    }
  }

  /**
   * Build rule evaluation context
   */
  private buildRuleContext(sensorData: Record<string, any>, aura: Aura): RuleContext {
    const now = new Date()
    const hour = now.getHours()
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return {
      senseData: sensorData,
      auraPersonality: this.getNumericTraits(aura.personality),
      timeOfDay: hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening',
      dayOfWeek: days[now.getDay()]!
    }
  }

  /**
   * Filter rules by cooldown periods
   */
  private async filterRulesByCooldown(rules: BehaviorRule[]): Promise<BehaviorRule[]> {
    if (!rules.length) return []

    const { data: lastExecutions, error } = await this.supabase
      .from('rule_execution_log')
      .select('rule_id, executed_at, triggered')
      .in('rule_id', rules.map(r => r.id))
      .eq('triggered', true)
      .order('executed_at', { ascending: false })

    if (error) {
      console.error('⚠️  Failed to fetch rule execution log:', error)
      return rules // Continue with all rules if we can't check cooldowns
    }

    const lastExecutionMap = new Map<string, Date>()
    lastExecutions?.forEach(log => {
      if (!lastExecutionMap.has(log.rule_id)) {
        lastExecutionMap.set(log.rule_id, new Date(log.executed_at))
      }
    })

    return rules.filter(rule => {
      const cooldownMs = (rule.trigger as any)?.cooldown * 1000 || 0
      if (cooldownMs === 0) return true

      const lastExecution = lastExecutionMap.get(rule.id)
      if (!lastExecution) return true

      return Date.now() - lastExecution.getTime() >= cooldownMs
    })
  }

  /**
   * Check if rule should trigger based on subscription limits
   */
  private async shouldTrigger(rule: BehaviorRule, userId: string): Promise<boolean> {
    // Get user's subscription tier
    const { data: user, error } = await this.supabase
      .from('users')
      .select('subscription:subscriptions(tier)')
      .eq('id', userId)
      .single()

    if (error) return false

    const tier = user?.subscription?.tier || 'FREE'
    const limits = TIER_LIMITS[tier]

    // Check daily notification limit
    if (limits.maxNotificationsPerDay > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count, error: countError } = await this.supabase
        .from('proactive_messages')
        .select('id', { count: 'exact' })
        .eq('aura_id', rule.auraId)
        .gte('created_at', today.toISOString())

      if (countError) return false

      if ((count || 0) >= limits.maxNotificationsPerDay) {
        return false
      }
    }

    return true
  }

  /**
   * Queue notification for delivery
   */
  private async queueNotification(
    rule: BehaviorRule,
    aura: Aura,
    context: RuleContext,
    message: string
  ): Promise<void> {
    const payload: NotificationPayload = {
      auraId: aura.id,
      ruleId: rule.id,
      message: rule.notificationTemplate || message,
      priority: rule.priority || 0,
      channels: rule.notificationChannels as any[] || ['IN_APP'],
      context: {
        sensorData: context.senseData,
        triggerData: context
      }
    }

    await NotificationService.queue(payload)
  }

  /**
   * Log rule execution for analytics and cooldown tracking
   */
  private async logRuleExecution(
    ruleId: string,
    auraId: string,
    triggered: boolean,
    sensorValues: Record<string, any>,
    evaluationResult: Record<string, any>,
    executionTimeMs: number
  ): Promise<void> {
    await this.supabase
      .from('rule_execution_log')
      .insert({
        rule_id: ruleId,
        aura_id: auraId,
        triggered,
        sensor_values: sensorValues,
        evaluation_result: evaluationResult,
        notification_sent: triggered,
        execution_time_ms: executionTimeMs
      })
  }

  /**
   * Update aura's last evaluation timestamp
   */
  private async updateAuraEvaluationTime(auraId: string): Promise<void> {
    await this.supabase
      .from('auras')
      .update({ last_evaluation_at: new Date().toISOString() })
      .eq('id', auraId)
  }

  /**
   * Helper methods
   */
  private getNumericTraits(personality: any): Record<string, number> {
    return {
      warmth: personality.warmth || 50,
      playfulness: personality.playfulness || 50,
      verbosity: personality.verbosity || 50,
      empathy: personality.empathy || 50,
      creativity: personality.creativity || 50,
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private async createBackgroundJob(jobType: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('background_jobs')
      .insert({
        job_type: jobType,
        status: 'PENDING'
      })
      .select('id')
      .single()

    if (error) throw new Error(`Failed to create background job: ${error.message}`)
    return data.id
  }

  private async updateBackgroundJob(
    jobId: string, 
    status: 'RUNNING' | 'COMPLETED' | 'FAILED',
    metadata?: Record<string, any>
  ): Promise<void> {
    const updates: any = { status }
    
    if (status === 'RUNNING') {
      updates.started_at = new Date().toISOString()
    } else {
      updates.completed_at = new Date().toISOString()
    }
    
    if (metadata) {
      updates.metadata = metadata
    }

    await this.supabase
      .from('background_jobs')
      .update(updates)
      .eq('id', jobId)
  }
}