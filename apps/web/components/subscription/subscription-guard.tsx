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
      setHasAccess(false)
      setHasInitialized(true)
      return
    }

    try {
      setIsChecking(true)
      
      if (feature) {
        const access = await checkFeatureAccess(feature)
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

  // For maxAuras feature, show a loading placeholder while checking
  // This prevents showing "Create New Aura" button when limit is reached
  if (feature === 'maxAuras' && !hasInitialized) {
    // Show a placeholder with same dimensions to prevent layout shift
    return (
      <div className="h-12 w-full sm:w-auto" />
    )
  }

  // Show content optimistically while loading to prevent flash (for other features)
  if (isInitialLoading && feature !== 'maxAuras') {
    return <>{children}</>
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

  // Debug logging for maxAuras feature
  if (feature === 'maxAuras') {
    console.log('SubscriptionGuard Debug:', {
      hasAccess,
      hasInitialized,
      loading,
      isChecking,
      subscription: subscription?.id,
      feature,
      refreshKey,
      lastCheckKey,
      checkKey: `${subscription?.id || 'none'}-${feature || 'none'}-${requiredTier || 'none'}-${refreshKey || 'none'}`
    })
  }

  // Default to showing children while determining access (except for maxAuras)
  return feature === 'maxAuras' ? <div className="h-12 w-full sm:w-auto bg-red-100 border border-red-300 flex items-center justify-center text-xs text-red-600">Loading subscription...</div> : <>{children}</>
}