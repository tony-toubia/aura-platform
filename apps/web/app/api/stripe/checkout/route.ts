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

    const { tierId } = await request.json()

    if (!tierId || !['personal', 'family', 'business'].includes(tierId)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${origin}/subscription?success=true`
    const cancelUrl = `${origin}/subscription?canceled=true`

    // Check if this is a subscription change (user already has a subscription)
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    let session
    if (existingSubscription && existingSubscription.tier !== 'free') {
      // User has existing paid subscription, use subscription change flow
      session = await SubscriptionService.createSubscriptionChangeSession(
        user.id,
        tierId,
        successUrl,
        cancelUrl,
        supabase,
        user.email
      )
    } else {
      // New subscription, use regular checkout
      session = await SubscriptionService.createCheckoutSession(
        user.id,
        tierId,
        successUrl,
        cancelUrl,
        supabase,
        user.email
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}