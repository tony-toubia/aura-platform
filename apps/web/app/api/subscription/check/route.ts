import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { SubscriptionService } from '@/lib/services/subscription-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feature, auraId, senseId } = await request.json()

    // Clear cache for critical operations to ensure fresh data
    if (feature === 'canCreateAura' || feature === 'maxAuras') {
      console.log('[API] Clearing subscription cache for critical check:', feature)
      SubscriptionService.clearUserCache(user.id)
    }

    let hasAccess = false

    if (feature === 'canCreateAura') {
      // Pass supabase client for server-side operations
      hasAccess = await SubscriptionService.canCreateMoreAuras(user.id, supabase)
    } else if (feature === 'canAddRule' && auraId) {
      hasAccess = await SubscriptionService.canAddMoreRules(user.id, auraId)
    } else if (feature === 'canUseSense' && senseId) {
      hasAccess = await SubscriptionService.canUseSense(user.id, senseId)
    } else if (feature) {
      hasAccess = await SubscriptionService.checkFeatureAccess(user.id, feature, supabase)
    }

    // Force refresh for subscription data to ensure accuracy
    const subscription = await SubscriptionService.getUserSubscription(
      user.id,
      supabase,
      feature === 'canCreateAura' || feature === 'maxAuras' // Force refresh for critical checks
    )

    return NextResponse.json({
      hasAccess,
      subscription: {
        id: subscription.id,
        name: subscription.name,
        features: subscription.features
      }
    })
  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    )
  }
}