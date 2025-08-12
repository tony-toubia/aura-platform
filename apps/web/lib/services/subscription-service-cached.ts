// apps/web/lib/services/subscription-service-cached.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { CacheKeys, CacheTTL, withCache, cacheDelete } from '@/lib/redis'

export interface SubscriptionTier {
  id: string
  name: string
  features: {
    maxAuras: number
    maxSensesPerAura: number
    maxRulesPerAura: number
    advancedPersonality: boolean
    customVessels: boolean
    apiAccess: boolean
    prioritySupport: boolean
    teamCollaboration: boolean
    analytics: boolean
    customIntegrations: boolean
  }
  limits: {
    apiCallsPerMonth: number
    storageGB: number
    exportEnabled: boolean
  }
}

const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    features: {
      maxAuras: 1,
      maxSensesPerAura: 3,
      maxRulesPerAura: 5,
      advancedPersonality: false,
      customVessels: false,
      apiAccess: false,
      prioritySupport: false,
      teamCollaboration: false,
      analytics: false,
      customIntegrations: false,
    },
    limits: {
      apiCallsPerMonth: 1000,
      storageGB: 1,
      exportEnabled: false,
    },
  },
  personal: {
    id: 'personal',
    name: 'Personal',
    features: {
      maxAuras: 3,
      maxSensesPerAura: 5,
      maxRulesPerAura: 10,
      advancedPersonality: true,
      customVessels: false,
      apiAccess: false,
      prioritySupport: false,
      teamCollaboration: false,
      analytics: true,
      customIntegrations: false,
    },
    limits: {
      apiCallsPerMonth: 10000,
      storageGB: 5,
      exportEnabled: true,
    },
  },
  family: {
    id: 'family',
    name: 'Family',
    features: {
      maxAuras: 10,
      maxSensesPerAura: 10,
      maxRulesPerAura: 20,
      advancedPersonality: true,
      customVessels: true,
      apiAccess: true,
      prioritySupport: true,
      teamCollaboration: true,
      analytics: true,
      customIntegrations: false,
    },
    limits: {
      apiCallsPerMonth: 50000,
      storageGB: 20,
      exportEnabled: true,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    features: {
      maxAuras: -1, // Unlimited
      maxSensesPerAura: -1, // Unlimited
      maxRulesPerAura: -1, // Unlimited
      advancedPersonality: true,
      customVessels: true,
      apiAccess: true,
      prioritySupport: true,
      teamCollaboration: true,
      analytics: true,
      customIntegrations: true,
    },
    limits: {
      apiCallsPerMonth: -1, // Unlimited
      storageGB: 100,
      exportEnabled: true,
    },
  },
}

export class CachedSubscriptionService {
  /**
   * Get user's subscription with Redis caching
   */
  static async getUserSubscription(
    userId: string,
    supabase: SupabaseClient,
    forceRefresh = false
  ): Promise<SubscriptionTier> {
    const cacheKey = CacheKeys.userSubscription(userId)
    
    // If force refresh, delete cache first
    if (forceRefresh) {
      await cacheDelete(cacheKey)
    }
    
    return withCache<SubscriptionTier>(
      cacheKey,
      async (): Promise<SubscriptionTier> => {
        console.log(`Fetching fresh subscription data for user: ${userId}`)
        
        // Check for active Stripe subscription
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('*, prices(*, products(*))')
          .eq('user_id', userId)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error || !subscription) {
          console.log(`No active subscription found for user ${userId}, using free tier`)
          return SUBSCRIPTION_TIERS.free!
        }

        // Map Stripe product metadata to our tier system
        const productMetadata = subscription.prices?.products?.metadata || {}
        const tierId = productMetadata.tier_id || 'free'
        
        console.log(`User ${userId} has subscription tier: ${tierId}`)
        return SUBSCRIPTION_TIERS[tierId] || SUBSCRIPTION_TIERS.free!
      },
      CacheTTL.USER_SUBSCRIPTION // 5 minutes TTL
    )
  }

  /**
   * Check if user can create more auras with caching
   */
  static async canCreateMoreAuras(
    userId: string,
    supabase: SupabaseClient
  ): Promise<boolean> {
    const cacheKey = `${CacheKeys.userAuraCount(userId)}:canCreate`
    
    return withCache(
      cacheKey,
      async () => {
        const subscription = await this.getUserSubscription(userId, supabase)
        
        // Business tier has unlimited auras
        if (subscription.features.maxAuras === -1) {
          return true
        }
        
        // Count current active auras with caching
        const auraCount = await this.getUserAuraCount(userId, supabase)
        
        return auraCount < subscription.features.maxAuras
      },
      60 // 1 minute TTL for this check
    )
  }

  /**
   * Get user's aura count with caching
   */
  static async getUserAuraCount(
    userId: string,
    supabase: SupabaseClient
  ): Promise<number> {
    return withCache(
      CacheKeys.userAuraCount(userId),
      async () => {
        console.log(`Fetching aura count for user: ${userId}`)
        
        const { count, error } = await supabase
          .from('auras')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('enabled', true)
        
        if (error) {
          console.error('Error fetching aura count:', error)
          return 0
        }
        
        return count || 0
      },
      60 // 1 minute TTL
    )
  }

  /**
   * Check if user has access to a specific feature
   */
  static async hasFeature(
    userId: string,
    feature: keyof SubscriptionTier['features'],
    supabase: SupabaseClient
  ): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId, supabase)
    return !!subscription.features[feature]
  }

  /**
   * Get user's API usage with caching
   */
  static async getApiUsage(
    userId: string,
    supabase: SupabaseClient
  ): Promise<{ used: number; limit: number; percentage: number }> {
    const cacheKey = `${CacheKeys.userSubscription(userId)}:apiUsage`
    
    return withCache(
      cacheKey,
      async () => {
        const subscription = await this.getUserSubscription(userId, supabase)
        
        // Get current month's usage
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        
        const { count } = await supabase
          .from('api_usage')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString())
        
        const used = count || 0
        const limit = subscription.limits.apiCallsPerMonth
        const percentage = limit === -1 ? 0 : Math.round((used / limit) * 100)
        
        return { used, limit, percentage }
      },
      300 // 5 minutes TTL
    )
  }

  /**
   * Clear all cached data for a user
   */
  static async clearUserCache(userId: string): Promise<void> {
    console.log(`Clearing all cached subscription data for user: ${userId}`)
    
    const keys = [
      CacheKeys.userSubscription(userId),
      CacheKeys.userAuraCount(userId),
      `${CacheKeys.userAuraCount(userId)}:canCreate`,
      `${CacheKeys.userSubscription(userId)}:apiUsage`,
    ]
    
    for (const key of keys) {
      await cacheDelete(key)
    }
  }

  /**
   * Invalidate cache when subscription changes
   */
  static async onSubscriptionChange(userId: string): Promise<void> {
    console.log(`Subscription changed for user: ${userId}, invalidating cache`)
    await this.clearUserCache(userId)
  }

  /**
   * Invalidate aura count cache when aura is created/deleted
   */
  static async onAuraChange(userId: string): Promise<void> {
    console.log(`Aura count changed for user: ${userId}, invalidating cache`)
    await cacheDelete(CacheKeys.userAuraCount(userId))
    await cacheDelete(`${CacheKeys.userAuraCount(userId)}:canCreate`)
  }
}

// Export as default for easier migration
export default CachedSubscriptionService