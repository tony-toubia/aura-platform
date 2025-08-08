"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionService, type SubscriptionTier, SUBSCRIPTION_TIERS } from '@/lib/services/subscription-service'

interface SubscriptionContextType {
  subscription: SubscriptionTier | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  checkFeatureAccess: (feature: keyof SubscriptionTier['features']) => Promise<boolean>
  canCreateAura: () => Promise<boolean>
  canAddRule: (auraId: string) => Promise<boolean>
  canUseSense: (senseId: string) => Promise<boolean>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

interface SubscriptionProviderProps {
  children: React.ReactNode
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<SubscriptionTier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null
      const previousUserId = user?.id
      setUser(newUser)
      
      // Clear cache when user changes
      if (newUser?.id !== previousUserId) {
        setSubscription(null)
        setLastFetch(0)
      }
    })

    return () => authSubscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
      setError(null)
      setLastFetch(0)
    }
  }, [user?.id]) // Only depend on user ID to prevent unnecessary re-renders

  const loadSubscription = useCallback(async (forceRefresh = false) => {
    if (!user) return
    
    // Check if we have cached data that's still valid
    const now = Date.now()
    const isCacheValid = subscription && (now - lastFetch) < CACHE_DURATION
    
    if (!forceRefresh && isCacheValid) {
      setLoading(false)
      return
    }
    
    // Prevent multiple simultaneous requests
    if (loading && !forceRefresh) return
    
    try {
      setLoading(true)
      setError(null)
      console.log('Loading subscription for user:', user.id)
      const sub = await SubscriptionService.getUserSubscription(user.id)
      console.log('Loaded subscription:', sub)
      setSubscription(sub)
      setLastFetch(now)
    } catch (err) {
      console.error('Failed to load subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
      // Set free tier as fallback on error
      setSubscription(SUBSCRIPTION_TIERS.free)
    } finally {
      setLoading(false)
    }
  }, [user?.id, subscription, lastFetch, loading]) // Use user.id instead of user object

  const refresh = useCallback(async () => {
    setLoading(true)
    await loadSubscription(true)
  }, [loadSubscription])

  const checkFeatureAccess = useCallback(async (feature: keyof SubscriptionTier['features']): Promise<boolean> => {
    if (!user?.id) return false
    
    console.log('Checking feature access:', feature, 'subscription:', subscription, 'loading:', loading)
    
    // If subscription is still loading, wait for it
    if (loading && !subscription) {
      console.log('Subscription still loading, waiting...')
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100))
      if (!subscription) {
        console.log('Subscription still not loaded, using service directly')
        return SubscriptionService.checkFeatureAccess(user.id, feature)
      }
    }
    
    // Use cached subscription for simple feature checks
    if (subscription && feature !== 'maxAuras' && feature !== 'maxMessages') {
      const f = subscription.features
      if (feature === 'availableSenses') {
        return true
      }
      return Boolean((f as any)[feature])
    }
    
    // For complex checks or when no cached subscription, use service
    return SubscriptionService.checkFeatureAccess(user.id, feature)
  }, [user?.id, subscription, loading])

  const canCreateAura = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false
    return SubscriptionService.canCreateMoreAuras(user.id)
  }, [user?.id])

  const canAddRule = useCallback(async (auraId: string): Promise<boolean> => {
    if (!user?.id) return false
    return SubscriptionService.canAddMoreRules(user.id, auraId)
  }, [user?.id])

  const canUseSense = useCallback(async (senseId: string): Promise<boolean> => {
    if (!user?.id) return false
    return SubscriptionService.canUseSense(user.id, senseId)
  }, [user?.id])

  const value: SubscriptionContextType = {
    subscription,
    loading,
    error,
    refresh,
    checkFeatureAccess,
    canCreateAura,
    canAddRule,
    canUseSense,
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}