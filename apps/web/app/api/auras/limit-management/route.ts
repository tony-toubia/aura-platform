import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { SUBSCRIPTION_TIERS } from '@/lib/services/subscription-service'


export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, auraId } = await request.json()

    switch (action) {
      case 'enable': {
        if (!auraId) {
          return NextResponse.json({ error: 'Aura ID required' }, { status: 400 })
        }

        // Get user's subscription tier using server-side client
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .single()

        const tierKey = subscriptionData?.tier || 'free'
        const tier = SUBSCRIPTION_TIERS?.[tierKey as keyof typeof SUBSCRIPTION_TIERS] ||
                    SUBSCRIPTION_TIERS.free // Default to free tier
        const maxAuras = tier.features.maxAuras

        // Business tier has unlimited auras
        if (maxAuras !== -1) {
          // Count current enabled auras
          const { count: currentEnabledCount } = await supabase
            .from('auras')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('enabled', true)

          // Check if enabling this aura would exceed the limit
          if ((currentEnabledCount || 0) >= maxAuras) {
            return NextResponse.json({
              error: 'You have reached your subscription limit for active auras. Upgrade your plan or disable another aura first.'
            }, { status: 403 })
          }
        }

        // Enable the aura
        const { error: updateError } = await supabase
          .from('auras')
          .update({ enabled: true })
          .eq('id', auraId)
          .eq('user_id', user.id)

        if (updateError) {
          return NextResponse.json({ error: 'Failed to enable aura' }, { status: 500 })
        }

        // Return the updated aura data
        const { data: updatedAura } = await supabase
          .from('auras')
          .select('id, name, enabled')
          .eq('id', auraId)
          .eq('user_id', user.id)
          .single()

        return NextResponse.json({
          success: true,
          message: 'Aura enabled successfully',
          aura: updatedAura
        })
      }

      case 'disable': {
        if (!auraId) {
          return NextResponse.json({ error: 'Aura ID required' }, { status: 400 })
        }

        const { error } = await supabase
          .from('auras')
          .update({ enabled: false })
          .eq('id', auraId)
          .eq('user_id', user.id)

        if (error) {
          return NextResponse.json({ error: 'Failed to disable aura' }, { status: 500 })
        }

        // Return the updated aura data
        const { data: updatedAura } = await supabase
          .from('auras')
          .select('id, name, enabled')
          .eq('id', auraId)
          .eq('user_id', user.id)
          .single()

        return NextResponse.json({
          success: true,
          message: 'Aura disabled successfully',
          aura: updatedAura
        })
      }


      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Aura limit management action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}