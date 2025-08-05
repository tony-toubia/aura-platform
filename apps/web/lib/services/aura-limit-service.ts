// apps/web/lib/services/aura-limit-service.ts

import { createClient } from '@/lib/supabase/client'
import { SubscriptionService, SUBSCRIPTION_TIERS } from './subscription-service'
import type { SubscriptionTier } from './subscription-service'

// Use server-side client for webhook operations
let createServerClient: any = null
if (typeof window === 'undefined') {
  // Only import server client on server side
  import('@supabase/supabase-js').then(module => {
    createServerClient = module.createClient
  })
}

export interface AuraLimitStatus {
  currentCount: number
  maxAllowed: number
  isOverLimit: boolean
  excessCount: number
  disabledAuras: string[]
}

export interface AuraLimitEnforcementResult {
  success: boolean
  disabledAuraIds: string[]
  message: string
}

export class AuraLimitService {
  /**
   * Check if user is over their aura limit and get status details
   */
  static async checkAuraLimitStatus(userId: string): Promise<AuraLimitStatus> {
    const supabase = createClient()
    const subscription = await SubscriptionService.getUserSubscription(userId)
    
    // Get all auras for the user (enabled and disabled)
    const { data: auras, error } = await supabase
      .from('auras')
      .select('id, name, enabled, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch user auras: ${error.message}`)
    }

    const enabledAuras = auras?.filter(a => a.enabled) || []
    const disabledAuras = auras?.filter(a => !a.enabled) || []
    const maxAllowed = subscription.features.maxAuras
    const currentCount = enabledAuras.length
    
    // Business tier has unlimited auras
    const isOverLimit = maxAllowed !== -1 && currentCount > maxAllowed
    const excessCount = isOverLimit ? currentCount - maxAllowed : 0

    return {
      currentCount,
      maxAllowed,
      isOverLimit,
      excessCount,
      disabledAuras: disabledAuras.map(a => a.id)
    }
  }

  /**
   * Enforce aura limits by disabling excess auras when subscription is downgraded
   */
  static async enforceAuraLimits(userId: string, newTierId: SubscriptionTier['id']): Promise<AuraLimitEnforcementResult> {
    const supabase = createClient()
    const newTier = SUBSCRIPTION_TIERS[newTierId]
    const maxAllowed = newTier.features.maxAuras

    // Business tier has unlimited auras, no enforcement needed
    if (maxAllowed === -1) {
      return {
        success: true,
        disabledAuraIds: [],
        message: 'No limits to enforce for business tier'
      }
    }

    // Get all enabled auras ordered by creation date (oldest first)
    const { data: enabledAuras, error } = await supabase
      .from('auras')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .eq('enabled', true)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch enabled auras: ${error.message}`)
    }

    const currentCount = enabledAuras?.length || 0
    
    // If within limits, no action needed
    if (currentCount <= maxAllowed) {
      return {
        success: true,
        disabledAuraIds: [],
        message: `User has ${currentCount} auras, within limit of ${maxAllowed}`
      }
    }

    // Calculate how many auras need to be disabled
    const excessCount = currentCount - maxAllowed
    const aurasToDisable = enabledAuras!.slice(0, excessCount)

    // Disable the excess auras (oldest first)
    const { error: updateError } = await supabase
      .from('auras')
      .update({ enabled: false })
      .in('id', aurasToDisable.map(a => a.id))

    if (updateError) {
      throw new Error(`Failed to disable excess auras: ${updateError.message}`)
    }

    return {
      success: true,
      disabledAuraIds: aurasToDisable.map(a => a.id),
      message: `Disabled ${excessCount} auras due to subscription downgrade to ${newTier.name} tier`
    }
  }

  /**
   * Get auras that were disabled due to subscription limits
   */
  static async getDisabledAuras(userId: string) {
    const supabase = createClient()
    
    const { data: disabledAuras, error } = await supabase
      .from('auras')
      .select('id, name, created_at, updated_at')
      .eq('user_id', userId)
      .eq('enabled', false)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch disabled auras: ${error.message}`)
    }

    return disabledAuras || []
  }

  /**
   * Check if user can enable a specific aura without exceeding limits
   */
  static async canEnableAura(userId: string, auraId: string): Promise<{ canEnable: boolean; reason?: string }> {
    const status = await this.checkAuraLimitStatus(userId)
    const subscription = await SubscriptionService.getUserSubscription(userId)
    
    // Business tier can enable unlimited auras
    if (subscription.features.maxAuras === -1) {
      return { canEnable: true }
    }

    // Check if enabling this aura would exceed the limit
    if (status.currentCount >= status.maxAllowed) {
      return {
        canEnable: false,
        reason: `You've reached your limit of ${status.maxAllowed} active auras. Upgrade your plan or disable another aura first.`
      }
    }

    return { canEnable: true }
  }

  /**
   * Attempt to enable an aura with limit checking
   */
  static async enableAuraWithLimitCheck(userId: string, auraId: string): Promise<{ success: boolean; message: string }> {
    const canEnable = await this.canEnableAura(userId, auraId)
    
    if (!canEnable.canEnable) {
      return {
        success: false,
        message: canEnable.reason || 'Cannot enable aura due to subscription limits'
      }
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('auras')
      .update({ enabled: true })
      .eq('id', auraId)
      .eq('user_id', userId)

    if (error) {
      return {
        success: false,
        message: `Failed to enable aura: ${error.message}`
      }
    }

    return {
      success: true,
      message: 'Aura enabled successfully'
    }
  }

  /**
   * Get suggestions for which auras to keep active when over limit
   */
  static async getAuraPrioritySuggestions(userId: string) {
    const supabase = createClient()
    
    // Get auras with usage statistics
    const { data: auras, error } = await supabase
      .from('auras')
      .select(`
        id, 
        name, 
        enabled, 
        created_at, 
        updated_at,
        aura_senses(count),
        behavior_rules(count)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch auras for priority analysis: ${error.message}`)
    }

    // Score auras based on recency, complexity, and usage
    const scoredAuras = (auras || []).map(aura => {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(aura.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      const senseCount = aura.aura_senses?.length || 0
      const ruleCount = aura.behavior_rules?.length || 0
      
      // Higher score = higher priority to keep
      let score = 0
      score += Math.max(0, 30 - daysSinceUpdate) // Recency bonus (up to 30 points)
      score += senseCount * 5 // Complexity bonus
      score += ruleCount * 3 // Rule complexity bonus
      
      return {
        ...aura,
        priorityScore: score,
        senseCount,
        ruleCount,
        daysSinceUpdate
      }
    })

    return scoredAuras.sort((a, b) => b.priorityScore - a.priorityScore)
  }
}