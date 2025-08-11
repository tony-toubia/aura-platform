// apps/web/lib/services/subscription-service.ts

import { createClient } from '@/lib/supabase/client'
import type StripeModule from 'stripe'
import { AuraLimitService } from './aura-limit-service'

export interface SubscriptionTier {
  id: 'free' | 'personal' | 'family' | 'business'
  name: string
  price: number
  priceId?: string
  features: SubscriptionFeatures
}

export interface SubscriptionFeatures {
  maxAuras: number
  maxRulesPerAura: number
  maxMessages: number
  availableSenses: string[]
  hasAnalytics: boolean
  hasVoiceResponses: boolean
  hasApiAccess: boolean
  apiCallsPerMonth: number
  hasCustomAvatars: boolean
  hasDataExport: boolean
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated'
  hasPersonalConnectedSenses: boolean
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier['id'], SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    features: {
      maxAuras: 1,
      maxRulesPerAura: 5,
      maxMessages: 1000,
      availableSenses: ['weather', 'news', 'air_quality'],
      hasAnalytics: false,
      hasVoiceResponses: false,
      hasApiAccess: false,
      apiCallsPerMonth: 0,
      hasCustomAvatars: false,
      hasDataExport: false,
      supportLevel: 'community',
      hasPersonalConnectedSenses: false,
    },
  },
  personal: {
    id: 'personal',
    name: 'Personal',
    price: 9.99,
    priceId: process.env.STRIPE_PERSONAL_PRICE_ID,
    features: {
      maxAuras: 3,
      maxRulesPerAura: 20,
      maxMessages: 10000,
      availableSenses: [
        'weather',
        'news',
        'air_quality',
        'soil_moisture',
        'light_level',
        'temperature',
        'location',
        'fitness',
        'sleep',
        'calendar',
      ],
      hasAnalytics: true,
      hasVoiceResponses: false,
      hasApiAccess: false,
      apiCallsPerMonth: 0,
      hasCustomAvatars: true,
      hasDataExport: true,
      supportLevel: 'email',
      hasPersonalConnectedSenses: true,
    },
  },
  family: {
    id: 'family',
    name: 'Family',
    price: 19.99,
    priceId: process.env.STRIPE_FAMILY_PRICE_ID,
    features: {
      maxAuras: 10,
      maxRulesPerAura: -1,
      maxMessages: 50000,
      availableSenses: [
        'weather',
        'news',
        'air_quality',
        'soil_moisture',
        'light_level',
        'temperature',
        'wildlife',
        'stock_market',
        'smart_home',
        'location',
        'fitness',
        'sleep',
        'calendar',
      ],
      hasAnalytics: true,
      hasVoiceResponses: true,
      hasApiAccess: true,
      apiCallsPerMonth: 1000,
      hasCustomAvatars: true,
      hasDataExport: true,
      supportLevel: 'priority',
      hasPersonalConnectedSenses: true,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 49.99,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    features: {
      maxAuras: -1,
      maxRulesPerAura: -1,
      maxMessages: -1,
      availableSenses: ['all'],
      hasAnalytics: true,
      hasVoiceResponses: true,
      hasApiAccess: true,
      apiCallsPerMonth: -1,
      hasCustomAvatars: true,
      hasDataExport: true,
      supportLevel: 'dedicated',
      hasPersonalConnectedSenses: true,
    },
  },
}

export class SubscriptionService {
  // Add in-memory cache for subscription data
  private static subscriptionCache = new Map<string, { subscription: SubscriptionTier; timestamp: number; auraCount?: number }>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private static readonly SHORT_CACHE_DURATION = 30 * 1000 // 30 seconds for critical checks

  static async getUserSubscription(userId: string, supabaseClient?: any, forceRefresh = false): Promise<SubscriptionTier> {
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cached = this.subscriptionCache.get(userId)
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        // Additional check: if we're checking for aura creation, use shorter cache
        const cacheAge = Date.now() - cached.timestamp
        if (cacheAge < this.SHORT_CACHE_DURATION) {
          return cached.subscription
        }
      }
    }

    // Use provided client (for server-side) or fallback to client-side
    const supabase = supabaseClient || createClient()
    
    console.log('SubscriptionService: Querying subscriptions for user:', userId)
    const { data: row, error } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single()
    
    console.log('SubscriptionService: Query result:', { row, error })

    let subscription: SubscriptionTier
    if (error || !row) {
      subscription = SUBSCRIPTION_TIERS.free
    } else {
      const key = row.tier as SubscriptionTier['id']
      subscription = SUBSCRIPTION_TIERS[key] ?? SUBSCRIPTION_TIERS.free
    }

    // Get current aura count for better cache management
    const { count: auraCount } = await supabase
      .from('auras')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('enabled', true)

    // Cache the result with aura count
    this.subscriptionCache.set(userId, {
      subscription,
      timestamp: Date.now(),
      auraCount: auraCount ?? 0
    })

    return subscription
  }

  // Clear cache for a specific user
  static clearUserCache(userId: string) {
    this.subscriptionCache.delete(userId)
  }

  // Clear all cache
  static clearAllCache() {
    this.subscriptionCache.clear()
  }

  static async checkFeatureAccess(
    userId: string,
    feature: keyof SubscriptionFeatures,
    supabaseClient?: any
  ): Promise<boolean> {
    // For critical features like maxAuras, check if cache is stale
    const cached = this.subscriptionCache.get(userId)
    const shouldRefresh = feature === 'maxAuras' &&
      (!cached || (Date.now() - cached.timestamp) > this.SHORT_CACHE_DURATION)
    
    const sub = await this.getUserSubscription(userId, supabaseClient, shouldRefresh)
    const f = sub.features
    
    switch (feature) {
      case 'maxAuras': {
        // Always get fresh count for aura creation checks
        const { count } = await this.getUserAuraCount(userId, supabaseClient)
        const currentCount = count ?? 0
        
        // Update cache with current count if it changed
        if (cached && cached.auraCount !== currentCount) {
          this.subscriptionCache.set(userId, {
            ...cached,
            auraCount: currentCount,
            timestamp: Date.now()
          })
        }
        
        const hasAccess = f.maxAuras === -1 || currentCount < f.maxAuras
        console.log(`[SubscriptionService] Aura limit check: ${currentCount}/${f.maxAuras === -1 ? 'unlimited' : f.maxAuras}, hasAccess: ${hasAccess}`)
        return hasAccess
      }
      case 'maxMessages': {
        const { count } = await this.getUserMessageCount(userId, supabaseClient)
        return f.maxMessages === -1 || (count ?? 0) < f.maxMessages
      }
      case 'availableSenses':
        return true
      default:
        return Boolean((f as any)[feature])
    }
  }

  static async canUseSense(
    userId: string,
    senseId: string
  ): Promise<boolean> {
    const sub = await this.getUserSubscription(userId)
    const a = sub.features.availableSenses
    return a.includes('all') || a.includes(senseId)
  }

  static async canCreateMoreAuras(userId: string, supabaseClient?: any): Promise<boolean> {
    // Force refresh for aura creation checks to ensure accurate limits
    const sub = await this.getUserSubscription(userId, supabaseClient, true)
    if (sub.features.maxAuras === -1) return true
    
    const { count } = await this.getUserAuraCount(userId, supabaseClient)
    const currentCount = count ?? 0
    const canCreate = currentCount < sub.features.maxAuras
    
    console.log(`[SubscriptionService] Can create more auras: ${canCreate} (${currentCount}/${sub.features.maxAuras})`)
    return canCreate
  }

  static async canAddMoreRules(
    userId: string,
    auraId: string
  ): Promise<boolean> {
    const sub = await this.getUserSubscription(userId)
    if (sub.features.maxRulesPerAura === -1) return true
    const supabase = createClient()
    const { count } = await supabase
      .from('behavior_rules')
      .select('*', { count: 'exact', head: true })
      .eq('aura_id', auraId)
    return (count ?? 0) < sub.features.maxRulesPerAura
  }

  static async canSendMoreMessages(userId: string): Promise<boolean> {
    const sub = await this.getUserSubscription(userId)
    if (sub.features.maxMessages === -1) return true
    const { count } = await this.getUserMessageCount(userId)
    return (count ?? 0) < sub.features.maxMessages
  }

  private static async getUserAuraCount(userId: string, supabaseClient?: any) {
    const supabase = supabaseClient || createClient()
    return supabase
      .from('auras')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('enabled', true) // Only count active auras
  }

  private static async getUserMessageCount(userId: string, supabaseClient?: any) {
    const supabase = supabaseClient || createClient()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    return supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
  }

  static async createCheckoutSession(
    userId: string,
    tierId: SubscriptionTier['id'],
    successUrl: string,
    cancelUrl: string,
    supabase?: any,
    userEmail?: string
  ) {
    // lazy‐load stripe, only on server
    const Stripe = (await import('stripe')).default as typeof StripeModule
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    const stripe = new Stripe(secretKey)

    const tier = SUBSCRIPTION_TIERS[tierId]
    if (!tier.priceId) {
      throw new Error('Invalid tier')
    }

    // Use provided supabase client or fallback to client-side
    const client = supabase || createClient()
    
    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    let customerId: string | undefined
    let email = userEmail

    // If no email provided, try to get it from auth
    if (!email) {
      const { data: { user } } = await client.auth.getUser()
      email = user?.email
    }

    // If user has existing subscription, try to find their Stripe customer
    if (existingSubscription && email) {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      })
      
      if (customers.data.length > 0 && customers.data[0]) {
        customerId = customers.data[0].id
      }
    }

    const sessionConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: tier.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: { userId, tierId },
      // Save payment method for future use
      payment_method_collection: 'if_required',
      // Allow promotion codes
      allow_promotion_codes: true,
    }

    // If we found an existing customer, use it to pre-fill payment details
    if (customerId) {
      sessionConfig.customer = customerId
      // For existing customers, we can use setup mode for subscription changes
      sessionConfig.customer_update = {
        address: 'auto',
        name: 'auto'
      }
    } else if (email) {
      // For new customers, create customer record and save payment method
      sessionConfig.customer_email = email
      // Note: customer_creation is not allowed in subscription mode
      // Stripe will automatically create a customer when using customer_email in subscription mode
    }

    return stripe.checkout.sessions.create(sessionConfig)
  }

  // New method for subscription changes using saved payment methods
  static async createSubscriptionChangeSession(
    userId: string,
    tierId: SubscriptionTier['id'],
    successUrl: string,
    cancelUrl: string,
    supabase?: any,
    userEmail?: string
  ) {
    const Stripe = (await import('stripe')).default as typeof StripeModule
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    const stripe = new Stripe(secretKey)

    const tier = SUBSCRIPTION_TIERS[tierId]
    if (!tier.priceId) {
      throw new Error('Invalid tier')
    }

    // Use provided supabase client or fallback to client-side
    const client = supabase || createClient()
    let email = userEmail

    // If no email provided, try to get it from auth
    if (!email) {
      const { data: { user } } = await client.auth.getUser()
      email = user?.email
    }
    
    if (!email) {
      throw new Error('User email not found')
    }

    // Find existing Stripe customer
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (customers.data.length === 0) {
      // No existing customer, use regular checkout
      return this.createCheckoutSession(userId, tierId, successUrl, cancelUrl, supabase, userEmail)
    }

    const customer = customers.data[0]
    if (!customer) {
      // No existing customer, use regular checkout
      return this.createCheckoutSession(userId, tierId, successUrl, cancelUrl, supabase, userEmail)
    }

    // Check if customer has saved payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    })

    if (paymentMethods.data.length === 0) {
      // No saved payment methods, use regular checkout
      return this.createCheckoutSession(userId, tierId, successUrl, cancelUrl, supabase, userEmail)
    }

    // Create checkout session with existing customer (will use saved payment method)
    return stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: tier.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customer.id,
      client_reference_id: userId,
      metadata: { userId, tierId },
      allow_promotion_codes: true,
      // This will show saved payment methods first
      payment_method_collection: 'if_required',
    });
  }

  static async handleWebhook(event: StripeModule.Event) {
    console.log('🎯 Starting webhook handler for event:', event.type, event.id)
    
    try {
      // Use server-side Supabase client for webhook processing (no user session)
      const { createClient: createServerClient } = await import('@supabase/supabase-js')
      
      console.log('🔑 Creating Supabase client with service role...')
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for server-side operations
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      console.log('✅ Supabase client created successfully')
      
      const Stripe = (await import('stripe')).default as typeof StripeModule
      const secretKey = process.env.STRIPE_SECRET_KEY
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured')
      }
      const stripe = new Stripe(secretKey)

      console.log('🔄 Processing webhook event:', event.type, event.id)

    switch (event.type) {
      case 'checkout.session.completed': {
        const sess = event.data.object as StripeModule.Checkout.Session
        const userId = sess.client_reference_id || sess.metadata?.userId
        const tierId = sess.metadata?.tierId as SubscriptionTier['id']
        
        console.log('Checkout completed:', { userId, tierId, sessionId: sess.id })
        
        if (userId && tierId) {
          console.log('💾 Checking for existing subscription record...')
          
          // First, ensure the user has a subscription record
          const { data: existing, error: selectError } = await supabase
            .from('subscriptions')
            .select('id, tier, status')
            .eq('user_id', userId)
            .single()

          if (selectError) {
            console.log('📝 No existing subscription found, will create new one. Error:', selectError.message)
          } else {
            console.log('📋 Found existing subscription:', existing)
          }

          if (!existing) {
            console.log('➕ Creating new subscription record...')
            const subscriptionData = {
              user_id: userId,
              tier: tierId.toLowerCase(), // Convert to database format (free, personal, etc.)
              status: 'active', // Convert to database format
              // Note: Stripe columns don't exist in database, so we skip them for now
            }
            
            console.log('📝 Subscription data to insert:', subscriptionData)
            
            const { data: insertData, error: insertError } = await supabase
              .from('subscriptions')
              .insert(subscriptionData)
              .select()
            
            if (insertError) {
              console.error('❌ Failed to create subscription:', insertError)
              console.error('❌ Insert error details:', JSON.stringify(insertError, null, 2))
            } else {
              console.log('✅ Created new subscription for user:', userId)
              console.log('📋 Inserted data:', insertData)
            }
          } else {
            console.log('🔄 Updating existing subscription...')
            const updateData = {
              tier: tierId.toLowerCase(), // Convert to database format (free, personal, etc.)
              status: 'active', // Convert to database format
              // Note: Stripe columns don't exist in database, so we skip them for now
            }
            
            console.log('📝 Update data:', updateData)
            
            const { data: updateResult, error: updateError } = await supabase
              .from('subscriptions')
              .update(updateData)
              .eq('user_id', userId)
              .select()
            
            if (updateError) {
              console.error('❌ Failed to update subscription:', updateError)
              console.error('❌ Update error details:', JSON.stringify(updateError, null, 2))
            } else {
              console.log('✅ Updated subscription for user:', userId)
              console.log('📋 Updated data:', updateResult)
            }
          }
        } else {
          console.error('❌ Missing userId or tierId in checkout session:', { userId, tierId })
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as StripeModule.Subscription
        const userId = sub.metadata?.userId
        
        console.log('Subscription updated:', { userId, subscriptionId: sub.id, status: sub.status })
        
        if (userId) {
          // Get current subscription tier before update
          const { data: currentSub } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', userId)
            .single()

          const priceId = sub.items.data[0]?.price.id
          let newTierId: SubscriptionTier['id'] = 'free'
          
          if (priceId === process.env.STRIPE_PERSONAL_PRICE_ID) newTierId = 'personal'
          else if (priceId === process.env.STRIPE_FAMILY_PRICE_ID) newTierId = 'family'
          else if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) newTierId = 'business'

          const { error } = await supabase
            .from('subscriptions')
            .update({
              tier: newTierId.toLowerCase(),
              status: sub.status === 'active' ? 'active' : 'cancelled',
            })
            .eq('user_id', userId)
          
          if (error) {
            console.error('Failed to update subscription:', error)
          } else {
            console.log('Updated subscription tier:', { userId, newTierId, status: sub.status })
            
            // Check if this is a downgrade and enforce aura limits
            const currentTierId = currentSub?.tier as SubscriptionTier['id'] || 'free'
            const tierHierarchy = ['free', 'personal', 'family', 'business']
            const currentTierIndex = tierHierarchy.indexOf(currentTierId)
            const newTierIndex = tierHierarchy.indexOf(newTierId)
            
            if (newTierIndex < currentTierIndex) {
              console.log('🔽 Subscription downgrade detected, enforcing aura limits...', {
                from: currentTierId,
                to: newTierId
              })
              
              try {
                const enforcementResult = await AuraLimitService.enforceAuraLimits(userId, newTierId)
                console.log('✅ Aura limit enforcement completed:', enforcementResult)
                
                // Log the enforcement action for audit purposes
                if (enforcementResult.disabledAuraIds.length > 0) {
                  console.log(`🚫 Disabled ${enforcementResult.disabledAuraIds.length} auras due to downgrade:`,
                    enforcementResult.disabledAuraIds)
                }
              } catch (limitError) {
                console.error('❌ Failed to enforce aura limits:', limitError)
                // Don't fail the webhook - subscription update should still succeed
              }
            }
          }
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as StripeModule.Subscription
        const userId = sub.metadata?.userId
        
        console.log('Subscription deleted:', { userId, subscriptionId: sub.id })
        
        if (userId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              tier: 'free',
              status: 'cancelled',
            })
            .eq('user_id', userId)
          
          if (error) {
            console.error('Failed to cancel subscription:', error)
          } else {
            console.log('Cancelled subscription for user:', userId)
            
            // Enforce free tier limits (1 aura max)
            console.log('🔽 Subscription cancelled, enforcing free tier limits...')
            
            try {
              const enforcementResult = await AuraLimitService.enforceAuraLimits(userId, 'free')
              console.log('✅ Free tier limit enforcement completed:', enforcementResult)
              
              if (enforcementResult.disabledAuraIds.length > 0) {
                console.log(`🚫 Disabled ${enforcementResult.disabledAuraIds.length} auras due to cancellation:`,
                  enforcementResult.disabledAuraIds)
              }
            } catch (limitError) {
              console.error('❌ Failed to enforce free tier limits:', limitError)
              // Don't fail the webhook - subscription cancellation should still succeed
            }
          }
        } else {
          console.log('No userId found for subscription deletion, skipping database update')
        }
        break
      }
      default:
        console.log('Unhandled webhook event type:', event.type)
    }
    
    console.log('✅ Webhook processing completed successfully')
    } catch (error) {
      console.error('❌ Fatal error in webhook handler:', error)
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
      }
      throw error // Re-throw to ensure webhook endpoint returns error status
    }
  }
}
