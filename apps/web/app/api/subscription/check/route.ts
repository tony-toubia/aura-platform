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

    let hasAccess = false

    if (feature === 'canCreateAura') {
      hasAccess = await SubscriptionService.canCreateMoreAuras(user.id)
    } else if (feature === 'canAddRule' && auraId) {
      hasAccess = await SubscriptionService.canAddMoreRules(user.id, auraId)
    } else if (feature === 'canUseSense' && senseId) {
      hasAccess = await SubscriptionService.canUseSense(user.id, senseId)
    } else if (feature) {
      hasAccess = await SubscriptionService.checkFeatureAccess(user.id, feature)
    }

    const subscription = await SubscriptionService.getUserSubscription(user.id)

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