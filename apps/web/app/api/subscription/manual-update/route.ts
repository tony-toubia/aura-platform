// Temporary manual subscription update for testing
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tierId } = await request.json()

    if (!['free', 'personal', 'family', 'business'].includes(tierId)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    console.log(`Manually updating subscription for user ${user.id} to ${tierId}`)

    // Check if subscription exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          tier: tierId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Failed to create subscription:', insertError)
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
      }

      console.log(`Created new subscription for user ${user.id} with tier ${tierId}`)
    } else {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tier: tierId,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update subscription:', updateError)
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
      }

      console.log(`Updated subscription for user ${user.id} to tier ${tierId}`)
    }

    return NextResponse.json({ success: true, message: `Subscription updated to ${tierId}` })
  } catch (error) {
    console.error('Manual update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}