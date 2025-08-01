import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { SubscriptionService } from '@/lib/services/subscription-service'

export async function withSubscriptionCheck(
  request: NextRequest,
  feature: string,
  auraId?: string
) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let hasAccess = false

    if (feature === 'maxAuras') {
      hasAccess = await SubscriptionService.canCreateMoreAuras(user.id)
    } else if (feature === 'maxRulesPerAura' && auraId) {
      hasAccess = await SubscriptionService.canAddMoreRules(user.id, auraId)
    } else {
      hasAccess = await SubscriptionService.checkFeatureAccess(user.id, feature as any)
    }

    if (!hasAccess) {
      const subscription = await SubscriptionService.getUserSubscription(user.id)
      return NextResponse.json(
        { 
          error: 'Subscription limit reached',
          currentTier: subscription.id,
          feature,
          upgradeRequired: true
        },
        { status: 403 }
      )
    }

    return null // No error, continue
  } catch (error) {
    console.error('Subscription check failed:', error)
    return NextResponse.json(
      { error: 'Subscription check failed' },
      { status: 500 }
    )
  }
}

export function createSubscriptionGuard(feature: string) {
  return async (request: NextRequest, context: any) => {
    const subscriptionError = await withSubscriptionCheck(request, feature)
    if (subscriptionError) {
      return subscriptionError
    }
    return NextResponse.next()
  }
}