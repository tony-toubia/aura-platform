// apps/web/app/api/auras/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { AuraServiceServer } from '@/lib/services/aura-service.server'
import { SubscriptionService } from '@/lib/services/subscription-service'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's auras
    const { data: auras, error } = await supabase
      .from('auras')
      .select('id, name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch auras:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(auras)
  } catch (err: any) {
    console.error('API /auras GET error:', err)
    return NextResponse.json(
      { error: err.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ========== /api/auras POST called ==========`)
  console.log(`[${timestamp}] Request URL:`, request.url)
  console.log(`[${timestamp}] Request method:`, request.method)
  
  try {
    // 1. Parse out the payload (including all fields from manual creator)
    const payload = await request.json()
    const {
      userId, // Not used - we get user from session
      name,
      vesselType,
      vesselCode,
      personality,
      senses,
      rules = [],
      communicationStyle,
      voiceProfile,
      selectedStudyId,
      selectedIndividualId,
      locationInfo,
      newsType,
      locationConfigs,
      oauthConnections = {},
      newsConfigurations = {},
      weatherAirQualityConfigurations = {},
      enabled,
    } = payload
    
    console.log(`[${timestamp}] Creating aura with name: "${name}"`, {
      vesselType,
      vesselCode,
      sensesCount: senses?.length || 0,
      rulesCount: rules?.length || 0,
      hasPersonality: !!personality,
      enabled,
      fullPayload: payload
    })

    // 2. Initialize Supabase with the HTTP‐only cookie
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    // 3. Guard: user must be logged in
    if (userErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 4. Check subscription limits - TEMPORARILY BYPASSED
    // const canCreateAura = await SubscriptionService.canCreateMoreAuras(user.id)
    // if (!canCreateAura) {
    //   const subscription = await SubscriptionService.getUserSubscription(user.id)
    //   return NextResponse.json(
    //     { 
    //       error: 'Aura creation limit reached',
    //       currentTier: subscription.id,
    //       maxAuras: subscription.features.maxAuras,
    //       upgradeRequired: true
    //     },
    //     { status: 403 }
    //   )
    // }
    console.log(`[${timestamp}] Subscription check temporarily bypassed for debugging`)

    // 5. Delegate to your server‐side service, passing through all fields
    //    (No need to send userId - the service uses the Supabase session internally.)
    const aura = await AuraServiceServer.createAura({
      name,
      vesselType,
      vesselCode: vesselCode || (vesselType === 'digital' ? 'digital-only' : ''),
      personality,
      senses,
      rules: rules || [],
      communicationStyle,
      voiceProfile,
      selectedStudyId: selectedStudyId ?? null,
      selectedIndividualId: selectedIndividualId ?? null,
      locationConfigs: locationConfigs ?? null,
      oauthConnections: oauthConnections ?? null,
      newsConfigurations: newsConfigurations ?? null,
      weatherAirQualityConfigurations: weatherAirQualityConfigurations ?? null,
      enabled: enabled ?? true, // Default to true if not specified
    })

    // 5. Return the newly created record in the expected format
    return NextResponse.json({
      success: true,
      data: aura
    }, { status: 201 })
  } catch (err: any) {
    console.error('API /auras POST error:', err)
    console.error('Error stack:', err.stack)
    console.error('Error details:', {
      message: err.message,
      name: err.name,
      code: err.code,
      details: err.details,
      hint: err.hint
    })
    return NextResponse.json(
      { 
        error: err.message || 'Unexpected server error',
        details: err.details || null,
        hint: err.hint || null,
        code: err.code || null
      },
      { status: 500 }
    )
  }
}
