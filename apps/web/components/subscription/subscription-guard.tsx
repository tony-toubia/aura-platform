"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionService, type SubscriptionTier } from '@/lib/services/subscription-service'
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
  const [user, setUser] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [userTier, setUserTier] = useState<SubscriptionTier | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      checkAccess()
    } else {
      setHasAccess(false)
      setUserTier(null)
      setIsLoading(false)
    }
  }, [user, feature, requiredTier, refreshKey]) // Include refreshKey in dependencies

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false)
      setIsLoading(false)
      return
    }

    try {
      const subscription = await SubscriptionService.getUserSubscription(user.id)
      setUserTier(subscription)

      if (feature) {
        const access = await SubscriptionService.checkFeatureAccess(user.id, feature)
        setHasAccess(access)
      } else if (requiredTier) {
        const tierOrder = ['free', 'personal', 'family', 'business']
        const userTierIndex = tierOrder.indexOf(subscription.id)
        const requiredTierIndex = tierOrder.indexOf(requiredTier)
        setHasAccess(userTierIndex >= requiredTierIndex)
      } else {
        setHasAccess(true)
      }
    } catch (error) {
      console.error('Subscription check failed:', error)
      setHasAccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Only show children if access is explicitly granted
  if (hasAccess === true) {
    return <>{children}</>
  }

  // Show loading state while checking access
  if (isLoading) {
    return null // Don't show anything while loading to prevent flash of content
  }

  // Access denied - trigger callback
  if (onBlock) {
    onBlock()
  }

  // Show fallback or upgrade prompt only when we know access is denied
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <UpgradePrompt
      feature={feature || 'premium features'}
      requiredTier={requiredTier || 'personal'}
      currentTier={userTier?.id || 'free'}
    />
  )
}