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

    const session = await SubscriptionService.createCheckoutSession(
      user.id,
      tierId,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}