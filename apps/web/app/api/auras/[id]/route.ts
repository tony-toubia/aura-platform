// apps/web/app/api/auras/[id]/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function PUT(req: NextRequest, context: RouteParams) {
  const timestamp = new Date().toISOString()
  const { id: auraId } = await context.params
  const body = await req.json()
  const { name, vesselType, personality, senses, selectedStudyId, selectedIndividualId, locationConfigs, newsConfigurations, weatherAirQualityConfigurations } = body
  
  console.log(`[${timestamp}] PUT /api/auras/${auraId} called with:`, {
    name,
    sensesCount: senses?.length || 0,
    hasPersonality: !!personality,
    hasLocationConfigs: !!locationConfigs,
    hasNewsConfigurations: !!newsConfigurations,
    hasWeatherAirQualityConfigurations: !!weatherAirQualityConfigurations
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
    const updateData: any = {
      name,
      personality,
      selected_study_id: selectedStudyId,
      selected_individual_id: selectedIndividualId,
      updated_at: new Date().toISOString(),
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
      // First, delete existing sense connections
      const { error: deleteError } = await supabase
        .from("aura_senses")
        .delete()
        .eq("aura_id", auraId)

      if (deleteError) {
        console.error("Failed to delete existing senses:", deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Then, add new sense connections if any senses are provided
      if (senses.length > 0) {
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

        // Create aura_senses connections with configurations
        const auraSenses = senseData.map((sense) => {
          // Build config object for this sense (excluding OAuth connections)
          const config: any = {}
          
          // Add location config if available
          if (locationConfigs && locationConfigs[sense.code]) {
            config.location = locationConfigs[sense.code]
          }
          
          // Add news configurations if available
          if (newsConfigurations && newsConfigurations[sense.code]) {
            config.newsConfigurations = newsConfigurations[sense.code]
          }
          
          // Add weather/air quality configurations if available
          if (weatherAirQualityConfigurations && weatherAirQualityConfigurations[sense.code]) {
            config.weatherAirQualityConfigurations = weatherAirQualityConfigurations[sense.code]
          }

          return {
            aura_id: auraId,
            sense_id: sense.id,
            config: Object.keys(config).length > 0 ? config : {},
          }
        })

        const { error: insertError } = await supabase
          .from("aura_senses")
          .insert(auraSenses)

        if (insertError) {
          console.error("Failed to insert new senses:", insertError)
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
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
    const transformOAuthConnections = (oauthConns: any[]): Record<string, any[]> => {
      const connections: Record<string, any[]> = {}
      
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
      senses: aura.aura_senses?.map((as: any) => as.sense.code) || [],
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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Unexpected error deleting aura:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}