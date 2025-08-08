"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useSubscription } from '@/lib/contexts/subscription-context'
import { type SubscriptionTier } from '@/lib/services/subscription-service'
import { UpgradePrompt } from './upgrade-prompt'

interface SubscriptionGuardProps {
  children: React.ReactNode
  feature?: keyof SubscriptionTier['features']
  requiredTier?: SubscriptionTier['id']
  fallback?: React.ReactNode
  onBlock?: () => void
  refreshKey?: string | number // Add refresh key to force re-evaluation
}

export function SubscriptionGuard({
  children,
  feature,
  requiredTier,
  fallback,
  onBlock,
  refreshKey
}: SubscriptionGuardProps) {
  const { subscription, loading, checkFeatureAccess } = useSubscription()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckKey, setLastCheckKey] = useState<string>('')
  const [hasInitialized, setHasInitialized] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Create a key to prevent unnecessary re-checks
    const checkKey = `${subscription?.id || 'none'}-${feature || 'none'}-${requiredTier || 'none'}-${refreshKey || 'none'}`
    
    // Only check if the key has changed
    if (checkKey !== lastCheckKey) {
      setLastCheckKey(checkKey)
      
      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      
      // Debounce the access check to prevent rapid re-renders
      debounceRef.current = setTimeout(() => {
        checkAccess()
      }, 50) // 50ms debounce
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [subscription?.id, feature, requiredTier, refreshKey, lastCheckKey])

  const checkAccess = async () => {
    // Don't check if already checking to prevent race conditions
    if (isChecking) return
    
    if (loading) {
      // Don't reset hasAccess to null if we already have a value - prevents flashing
      if (hasAccess === null) {
        setHasAccess(null)
      }
      return
    }

    if (!subscription) {
      console.log('SubscriptionGuard: No subscription available, loading:', loading)
      // If we're not loading and still no subscription, something is wrong
      if (!loading) {
        setHasAccess(false)
        setHasInitialized(true)
      }
      return
    }

    try {
      setIsChecking(true)
      
      if (feature) {
        console.log(`SubscriptionGuard: Checking feature ${feature} for subscription ${subscription.id}`)
        const access = await checkFeatureAccess(feature)
        console.log(`SubscriptionGuard: Feature ${feature} access result:`, access)
        setHasAccess(access)
      } else if (requiredTier) {
        const tierOrder = ['free', 'personal', 'family', 'business']
        const userTierIndex = tierOrder.indexOf(subscription.id)
        const requiredTierIndex = tierOrder.indexOf(requiredTier)
        const hasAccess = userTierIndex >= requiredTierIndex
        setHasAccess(hasAccess)
      } else {
        setHasAccess(true)
      }
      setHasInitialized(true)
    } catch (error) {
      console.error('Subscription check failed:', error)
      // Don't immediately set to false on error - keep existing state to prevent flashing
      if (hasAccess === null) {
        setHasAccess(false)
      }
      setHasInitialized(true)
    } finally {
      setIsChecking(false)
    }
  }

  // Show loading state while subscription is loading or we're checking access for the first time
  const isInitialLoading = (loading || isChecking) && hasAccess === null

  // Only show children if access is explicitly granted
  if (hasAccess === true) {
    return <>{children}</>
  }

  // Always render a non-blocking skeleton during initial phase to avoid "floating box" regressions
  if (isInitialLoading || !hasInitialized) {
    // Prefer consumer-provided fallback if available
    if (fallback) {
      return <>{fallback}</>
    }
    // Generic inline skeleton that preserves layout without looking broken
    return (
      <div className="w-full">
        <div className="border-gray-200 bg-gray-50 border rounded-lg">
          <div className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access denied - trigger callback
  if (hasAccess === false && onBlock) {
    onBlock()
  }

  // Show fallback or upgrade prompt only when we know access is denied
  if (hasAccess === false) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <UpgradePrompt
        feature={feature || 'premium features'}
        requiredTier={requiredTier || 'personal'}
        currentTier={subscription?.id || 'free'}
      />
    )
  }

  // Last resort: if state is indeterminate, render children to avoid blocking UI
  return <>{children}</>
}