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
  const [shouldRefresh, setShouldRefresh] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(true)

  // Cache duration: 5 minutes for normal operations, 30 seconds for critical checks
  const CACHE_DURATION = 5 * 60 * 1000
  const IDLE_REFRESH_THRESHOLD = 60 * 1000 // Refresh if page was hidden for more than 1 minute
  
  // Check URL params for cache clearing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true' || params.get('refresh') === 'true') {
        // Clear cache on successful checkout or explicit refresh
        console.log('Clearing subscription cache due to URL params')
        setLastFetch(0)
        setShouldRefresh(true)
        // Clear the service-level cache too
        if (user?.id) {
          SubscriptionService.clearUserCache(user.id)
        }
      }
    }
  }, [user?.id])

  // Handle page visibility changes to refresh stale data after idle
  useEffect(() => {
    let hiddenTime: number | null = null

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden, record the time
        hiddenTime = Date.now()
        setIsPageVisible(false)
      } else {
        // Page is now visible
        setIsPageVisible(true)
        
        if (hiddenTime) {
          const idleDuration = Date.now() - hiddenTime
          
          // If page was hidden for more than threshold, refresh subscription
          if (idleDuration > IDLE_REFRESH_THRESHOLD && user?.id) {
            console.log(`[SubscriptionContext] Page was idle for ${Math.round(idleDuration / 1000)}s, refreshing subscription...`)
            
            // Clear both context and service caches
            setLastFetch(0)
            SubscriptionService.clearUserCache(user.id)
            setShouldRefresh(true)
          }
          
          hiddenTime = null
        }
      }
    }

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Also listen for focus events as a backup
    const handleFocus = () => {
      if (!isPageVisible) {
        handleVisibilityChange()
      }
    }
    
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user?.id, isPageVisible, IDLE_REFRESH_THRESHOLD])

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
      loadSubscription(shouldRefresh)
      if (shouldRefresh) {
        setShouldRefresh(false)
      }
    } else {
      setSubscription(null)
      setLoading(false)
      setError(null)
      setLastFetch(0)
    }
  }, [user?.id, shouldRefresh]) // Only depend on user ID and refresh flag

  const loadSubscription = useCallback(async (forceRefresh = false) => {
    if (!user) return
    
    // Check if we have cached data that's still valid
    const now = Date.now()
    const cacheAge = now - lastFetch
    const isCacheValid = subscription && cacheAge < CACHE_DURATION
    
    // Don't use cache if it's too old or if force refresh is requested
    if (!forceRefresh && isCacheValid && isPageVisible) {
      setLoading(false)
      return
    }
    
    // Log cache status for debugging
    if (forceRefresh) {
      console.log('[SubscriptionContext] Force refreshing subscription')
    } else if (!isCacheValid) {
      console.log(`[SubscriptionContext] Cache expired (age: ${Math.round(cacheAge / 1000)}s)`)
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
  }, [user?.id, subscription, lastFetch, loading, isPageVisible]) // Include isPageVisible

  const refresh = useCallback(async () => {
    console.log('[SubscriptionContext] Manual refresh requested')
    if (user?.id) {
      // Clear service cache as well
      SubscriptionService.clearUserCache(user.id)
    }
    setLoading(true)
    await loadSubscription(true)
  }, [loadSubscription, user?.id])

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
    
    // Check if cache might be stale
    const now = Date.now()
    const cacheAge = now - lastFetch
    
    // For critical operations like creating auras, refresh if cache is older than 30 seconds
    if (cacheAge > 30000) {
      console.log('[SubscriptionContext] Cache might be stale for aura creation, refreshing...')
      await refresh()
    }
    
    return SubscriptionService.canCreateMoreAuras(user.id)
  }, [user?.id, lastFetch, refresh])

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