// apps/web/app/api/auras/[id]/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import { SubscriptionService } from "@/lib/services/subscription-service"
import type { NextRequest } from "next/server"
import { AVAILABLE_SENSES, type SenseId } from "@/lib/constants"

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function PUT(req: NextRequest, context: RouteParams) {
  const timestamp = new Date().toISOString()
  const { id: auraId } = await context.params
  const body = await req.json()
  const { name, personality, senses, selectedStudyId, selectedIndividualId, enabled, locationConfigs, newsConfigurations, weatherAirQualityConfigurations } = body
  
  console.log(`[${timestamp}] PUT /api/auras/${auraId} called with:`, {
    name,
    sensesCount: senses?.length || 0,
    hasPersonality: !!personality,
    hasLocationConfigs: !!locationConfigs,
    hasNewsConfigurations: !!newsConfigurations,
    hasWeatherAirQualityConfigurations: !!weatherAirQualityConfigurations,
    newsConfigurationsDetail: newsConfigurations,
    weatherAirQualityConfigurationsDetail: weatherAirQualityConfigurations,
    fullBody: body
  })

  // Basic validation
  if (
    typeof name !== "string" ||
    typeof personality !== "object" ||
    !Array.isArray(senses)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Update the aura basic info
    const updateData: {
      name: string
      personality: object
      selected_study_id?: string
      selected_individual_id?: string
      updated_at: string
      enabled?: boolean
      location_configs?: Record<string, unknown>
    } = {
      name,
      personality,
      selected_study_id: selectedStudyId,
      selected_individual_id: selectedIndividualId,
      updated_at: new Date().toISOString(),
    }
    
    // Check subscription limits before enabling an aura
    if (enabled !== undefined) {
      // If trying to enable an aura, check subscription limits first
      if (enabled === true) {
        // Get current aura status to see if it's already enabled
        const { data: currentAura, error: fetchError } = await supabase
          .from("auras")
          .select("enabled")
          .eq("id", auraId)
          .eq("user_id", user.id)
          .single()
        
        if (fetchError) {
          console.error("Failed to fetch current aura status:", fetchError)
          return NextResponse.json({ error: "Failed to check aura status" }, { status: 500 })
        }
        
        // Only check limits if the aura is currently disabled
        if (!currentAura.enabled) {
          const hasAccess = await SubscriptionService.checkFeatureAccess(user.id, 'maxAuras')
          
          if (!hasAccess) {
            console.log(`User ${user.id} has reached their active aura limit`)
            return NextResponse.json(
              { error: "You've reached your limit of active auras. Please deactivate another aura or upgrade your plan." },
              { status: 403 }
            )
          }
        }
      }
      
      updateData.enabled = enabled
    }
    
    // Add location configs if provided
    if (locationConfigs !== undefined) {
      updateData.location_configs = locationConfigs
    }
    
    const { error: auraError } = await supabase
      .from("auras")
      .update(updateData)
      .eq("id", auraId)
      .eq("user_id", user.id) // Ensure user owns this aura

    if (auraError) {
      console.error("Failed to update aura:", auraError)
      return NextResponse.json({ error: auraError.message }, { status: 500 })
    }

    // Update senses if provided
    if (senses && senses.length >= 0) {
      // Check for premium senses and user subscription
      const premiumSenses = AVAILABLE_SENSES.filter(s => s.tier === 'Premium').map(s => s.id) as SenseId[]
      const attemptingToAddPremiumSense = senses.some((senseId: SenseId) => premiumSenses.includes(senseId))

      if (attemptingToAddPremiumSense) {
        const hasPersonalConnectedSenses = await SubscriptionService.checkFeatureAccess(user.id, 'hasPersonalConnectedSenses')
        if (!hasPersonalConnectedSenses) {
          return NextResponse.json(
            { error: "Upgrade your plan to enable personal connected senses." },
            { status: 403 }
          )
        }
      }
      console.log(`[${timestamp}] Looking up senses with codes:`, senses)
      
      // Get sense IDs from codes
      const { data: senseData, error: senseError } = await supabase
        .from("senses")
        .select("id, code")
        .in("code", senses)

      console.log(`[${timestamp}] Found senses in database:`, senseData)
      console.log(`[${timestamp}] Requested ${senses.length} senses, found ${senseData?.length || 0} in database`)

      if (senseError || !senseData) {
        console.error("Failed to fetch senses:", senseError)
        return NextResponse.json({ error: "Failed to fetch senses" }, { status: 500 })
      }

      // Check for missing senses
      const foundCodes = senseData.map(s => s.code)
      const missingSenses = senses.filter(code => !foundCodes.includes(code))
      if (missingSenses.length > 0) {
        console.warn(`[${timestamp}] Missing senses in database:`, missingSenses)
      }

      // First, delete senses that are no longer selected
      const { error: deleteError } = await supabase
        .from("aura_senses")
        .delete()
        .eq("aura_id", auraId)
        .not("sense_id", "in", `(${senseData.map(s => s.id).join(",")})`)

      if (deleteError) {
        console.error("Failed to delete removed senses:", deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Then, upsert sense connections with configurations
      if (senseData.length > 0) {
        const auraSenses = senseData.map((sense) => {
          // Build config object for this sense (excluding OAuth connections)
          const config: Record<string, unknown> = {}
          
          // Add location config if available
          if (locationConfigs && locationConfigs[sense.code]) {
            config.location = locationConfigs[sense.code]
            console.log(`[${timestamp}] Adding location config for ${sense.code}:`, locationConfigs[sense.code])
          }
          
          // Add news configurations if available
          if (newsConfigurations && newsConfigurations[sense.code]) {
            config.newsConfigurations = newsConfigurations[sense.code]
            console.log(`[${timestamp}] Adding news configurations for ${sense.code}:`, newsConfigurations[sense.code])
          }
          
          // Add weather/air quality configurations if available
          if (weatherAirQualityConfigurations && weatherAirQualityConfigurations[sense.code]) {
            config.weatherAirQualityConfigurations = weatherAirQualityConfigurations[sense.code]
            console.log(`[${timestamp}] Adding weather/air quality configurations for ${sense.code}:`, weatherAirQualityConfigurations[sense.code])
          }

          const auraSenseRecord = {
            aura_id: auraId,
            sense_id: sense.id,
            config: Object.keys(config).length > 0 ? config : {},
          }
          
          console.log(`[${timestamp}] Creating aura_sense record for ${sense.code}:`, auraSenseRecord)
          return auraSenseRecord
        })
        
        console.log(`[${timestamp}] Final aura_senses records to upsert:`, auraSenses)

        // Use upsert to handle existing records gracefully
        const { error: upsertError } = await supabase
          .from("aura_senses")
          .upsert(auraSenses, {
            onConflict: 'aura_id,sense_id',
            ignoreDuplicates: false
          })

        if (upsertError) {
          console.error("Failed to upsert senses:", upsertError)
          return NextResponse.json({ error: upsertError.message }, { status: 500 })
        }
      } else {
        // If no senses selected, delete all existing ones
        const { error: deleteAllError } = await supabase
          .from("aura_senses")
          .delete()
          .eq("aura_id", auraId)

        if (deleteAllError) {
          console.error("Failed to delete all senses:", deleteAllError)
          return NextResponse.json({ error: deleteAllError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    console.error("Unexpected error updating aura:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest, context: RouteParams) {
  const { id: auraId } = await context.params

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { data: aura, error } = await supabase
      .from("auras")
      .select(`
        *,
        aura_senses (
          sense:senses ( code )
        )
      `)
      .eq("id", auraId)
      .eq("user_id", user.id)
      .single()

    if (error || !aura) {
      return NextResponse.json({ error: "Aura not found" }, { status: 404 })
    }

    // Fetch OAuth connections for this specific aura
    const { data: oauthConnections, error: oauthError } = await supabase
      .from("oauth_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("aura_id", auraId)

    if (oauthError) {
      console.error('Error fetching OAuth connections:', oauthError)
    }

    // Transform OAuth connections to match expected format
    const transformOAuthConnections = (oauthConns: Array<{
      id: string
      provider: string
      sense_type: string
      created_at: string
      provider_user_id?: string
      expires_at?: string
      scope?: string
      device_info?: unknown
    }>): Record<string, Array<{
      id: string
      name: string
      type: string
      connectedAt: Date
      providerId: string
      accountEmail: string
      expiresAt: Date | null
      scope?: string
      deviceInfo?: unknown
    }>> => {
      const connections: Record<string, Array<{
        id: string
        name: string
        type: string
        connectedAt: Date
        providerId: string
        accountEmail: string
        expiresAt: Date | null
        scope?: string
        deviceInfo?: unknown
      }>> = {}
      
      // Helper function to get user-friendly provider names
      const getProviderDisplayName = (provider: string): string => {
        const providerNames: Record<string, string> = {
          'google': 'Google',
          'google-fit': 'Google Fit',
          'google_fit': 'Google Fit',
          'fitbit': 'Fitbit',
          'apple-health': 'Apple Health',
          'apple_health': 'Apple Health',
          'strava': 'Strava',
          'microsoft': 'Microsoft',
        }
        return providerNames[provider] || provider.charAt(0).toUpperCase() + provider.slice(1).replace(/_/g, ' ')
      }
      
      if (!oauthConns || oauthConns.length === 0) {
        return connections
      }
      
      oauthConns.forEach((conn) => {
        const senseType = conn.sense_type
        
        if (!connections[senseType]) {
          connections[senseType] = []
        }
        
        const transformedConnection = {
          id: conn.id,
          name: getProviderDisplayName(conn.provider),
          type: senseType,
          connectedAt: conn.created_at ? new Date(conn.created_at) : new Date(),
          providerId: conn.provider,
          accountEmail: conn.provider_user_id || `Connected ${getProviderDisplayName(conn.provider)} account`,
          expiresAt: conn.expires_at ? new Date(conn.expires_at) : null,
          scope: conn.scope,
          deviceInfo: conn.device_info || null, // Include device information for location connections
        }
        
        connections[senseType].push(transformedConnection)
      })
      
      return connections
    }

    // Transform the data to match expected format
    const transformedAura = {
      id: aura.id,
      name: aura.name,
      vesselType: aura.vessel_type,
      personality: aura.personality,
      senses: aura.aura_senses?.map((as: { sense: { code: string } }) => as.sense.code) || [],
      avatar: aura.avatar,
      rules: [], // Load separately if needed
      enabled: aura.enabled,
      createdAt: aura.created_at,
      updatedAt: aura.updated_at,
      selectedStudyId: aura.selected_study_id,
      selectedIndividualId: aura.selected_individual_id,
      oauthConnections: transformOAuthConnections(oauthConnections || []),
    }

    return NextResponse.json(transformedAura)
  } catch (error: unknown) {
    console.error("Unexpected error fetching aura:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, context: RouteParams) {
  const { id: auraId } = await context.params

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from("auras")
      .delete()
      .eq("id", auraId)
      .eq("user_id", user.id) // Ensure user owns this aura

    if (error) {
      console.error("Failed to delete aura:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Unexpected error deleting aura:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}