"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionService, type SubscriptionTier } from '@/lib/services/subscription-service'

export function useSubscription() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<SubscriptionTier | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user) return
    
    try {
      const sub = await SubscriptionService.getUserSubscription(user.id)
      setSubscription(sub)
    } catch (error) {
      console.error('Failed to load subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const canCreateAura = async (): Promise<boolean> => {
    if (!user) return false
    return SubscriptionService.canCreateMoreAuras(user.id)
  }

  const canAddRule = async (auraId: string): Promise<boolean> => {
    if (!user) return false
    return SubscriptionService.canAddMoreRules(user.id, auraId)
  }

  const canUseSense = async (senseId: string): Promise<boolean> => {
    if (!user) return false
    return SubscriptionService.canUseSense(user.id, senseId)
  }

  const checkFeatureAccess = async (feature: keyof SubscriptionTier['features']): Promise<boolean> => {
    if (!user) return false
    return SubscriptionService.checkFeatureAccess(user.id, feature)
  }

  return {
    subscription,
    loading,
    canCreateAura,
    canAddRule,
    canUseSense,
    checkFeatureAccess,
    refresh: loadSubscription
  }
}