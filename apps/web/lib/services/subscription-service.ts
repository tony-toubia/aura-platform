// apps/web/lib/services/subscription-service.ts

import { createClient } from '@/lib/supabase/client'
import type StripeModule from 'stripe'

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
  maxConversations: number
  availableSenses: string[]
  hasAnalytics: boolean
  hasVoiceResponses: boolean
  hasApiAccess: boolean
  apiCallsPerMonth: number
  hasCustomAvatars: boolean
  hasDataExport: boolean
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated'
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier['id'], SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    features: {
      maxAuras: 1,
      maxRulesPerAura: 5,
      maxConversations: 100,
      availableSenses: ['weather', 'news', 'air_quality'],
      hasAnalytics: false,
      hasVoiceResponses: false,
      hasApiAccess: false,
      apiCallsPerMonth: 0,
      hasCustomAvatars: false,
      hasDataExport: false,
      supportLevel: 'community',
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
      maxConversations: 1000,
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
      maxConversations: 5000,
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
      ],
      hasAnalytics: true,
      hasVoiceResponses: true,
      hasApiAccess: true,
      apiCallsPerMonth: 1000,
      hasCustomAvatars: true,
      hasDataExport: true,
      supportLevel: 'priority',
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
      maxConversations: -1,
      availableSenses: ['all'],
      hasAnalytics: true,
      hasVoiceResponses: true,
      hasApiAccess: true,
      apiCallsPerMonth: -1,
      hasCustomAvatars: true,
      hasDataExport: true,
      supportLevel: 'dedicated',
    },
  },
}

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<SubscriptionTier> {
    const supabase = createClient()
    const { data: row, error } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single()

    if (error || !row) {
      return SUBSCRIPTION_TIERS.free
    }
    const key = row.tier as SubscriptionTier['id']
    return SUBSCRIPTION_TIERS[key] ?? SUBSCRIPTION_TIERS.free
  }

  static async checkFeatureAccess(
    userId: string,
    feature: keyof SubscriptionFeatures
  ): Promise<boolean> {
    const sub = await this.getUserSubscription(userId)
    const f = sub.features
    switch (feature) {
      case 'maxAuras': {
        const { count } = await this.getUserAuraCount(userId)
        return f.maxAuras === -1 || (count ?? 0) < f.maxAuras
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

  static async canCreateMoreAuras(userId: string): Promise<boolean> {
    const sub = await this.getUserSubscription(userId)
    if (sub.features.maxAuras === -1) return true
    const { count } = await this.getUserAuraCount(userId)
    return (count ?? 0) < sub.features.maxAuras
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

  private static async getUserAuraCount(userId: string) {
    const supabase = createClient()
    return supabase
      .from('auras')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
  }

  static async createCheckoutSession(
    userId: string,
    tierId: SubscriptionTier['id'],
    successUrl: string,
    cancelUrl: string
  ) {
    // lazy‐load stripe, only on server
    const Stripe = (await import('stripe')).default as typeof StripeModule
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const tier = SUBSCRIPTION_TIERS[tierId]
    if (!tier.priceId) {
      throw new Error('Invalid tier')
    }

    return stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: tier.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: { userId, tierId },
    })
  }

  static async handleWebhook(event: StripeModule.Event) {
    const supabase = createClient()
    const Stripe = (await import('stripe')).default as typeof StripeModule
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    switch (event.type) {
      case 'checkout.session.completed': {
        const sess = event.data.object as StripeModule.Checkout.Session
        const userId = sess.client_reference_id
        const tierId = sess.metadata?.tierId as SubscriptionTier['id']
        if (userId && tierId) {
          await supabase
            .from('subscriptions')
            .update({
              tier: tierId,
              status: 'active',
              stripe_customer_id: sess.customer as string,
              stripe_subscription_id: sess.subscription as string,
            })
            .eq('user_id', userId)
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as StripeModule.Subscription
        if (sub.id) {
          await supabase
            .from('subscriptions')
            .update({ tier: 'free', status: 'cancelled' })
            .eq('stripe_subscription_id', sub.id)
        }
        break
      }
    }
  }
}
