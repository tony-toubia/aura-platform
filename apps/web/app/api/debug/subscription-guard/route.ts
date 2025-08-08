import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { SubscriptionService } from '@/lib/services/subscription-service'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabase()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated',
        details: userError
      }, { status: 401 })
    }

    // Get user's subscription
    const subscription = await SubscriptionService.getUserSubscription(user.id)
    
    // Get user's current aura count
    const auraCountResult = await supabase
      .from('auras')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('enabled', true)
    
    // Check maxAuras feature access
    const canCreateAura = await SubscriptionService.checkFeatureAccess(user.id, 'maxAuras')
    const canCreateAuraMethod = await SubscriptionService.canCreateMoreAuras(user.id)
    
    // Get all user's auras for debugging
    const { data: allAuras, error: aurasError } = await supabase
      .from('auras')
      .select('id, name, enabled, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ 
      success: true,
      debug: {
        userId: user.id,
        userEmail: user.email,
        subscription: {
          id: subscription.id,
          name: subscription.name,
          maxAuras: subscription.features.maxAuras,
          maxRulesPerAura: subscription.features.maxRulesPerAura
        },
        auraCount: {
          enabled: auraCountResult.count,
          error: auraCountResult.error
        },
        featureChecks: {
          checkFeatureAccess_maxAuras: canCreateAura,
          canCreateMoreAuras: canCreateAuraMethod
        },
        allAuras: {
          data: allAuras,
          error: aurasError
        },
        logic: {
          maxAurasAllowed: subscription.features.maxAuras,
          currentEnabledCount: auraCountResult.count,
          shouldAllowCreation: subscription.features.maxAuras === -1 || (auraCountResult.count ?? 0) < subscription.features.maxAuras
        }
      }
    })
  } catch (error) {
    console.error('Debug subscription guard error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}