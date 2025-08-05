import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get all user's auras that have location sense
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select('id, location_configs, aura_senses(id, sense:senses(code))')
      .eq('user_id', user.id)

    if (aurasError) {
      console.error('Error fetching auras:', aurasError)
      return NextResponse.json({ error: aurasError.message }, { status: 500 })
    }

    // Find aura_senses entries with location sense and auras with location configs
    const locationSenseIds: string[] = []
    const auraIdsWithLocationConfigs: string[] = []
    
    auras?.forEach(aura => {
      // Check for location sense
      aura.aura_senses?.forEach((auraSense: any) => {
        if (auraSense.sense?.code === 'location') {
          locationSenseIds.push(auraSense.id)
        }
      })
      
      // Check for location configs
      if (aura.location_configs && Object.keys(aura.location_configs).length > 0) {
        auraIdsWithLocationConfigs.push(aura.id)
      }
    })

    // Start a transaction to ensure all operations succeed or fail together
    const operations = []

    // 1. Remove location sense from all auras
    if (locationSenseIds.length > 0) {
      operations.push(
        supabase
          .from('aura_senses')
          .delete()
          .in('id', locationSenseIds)
      )
    }

    // 2. Clear location_configs from auras table
    if (auraIdsWithLocationConfigs.length > 0) {
      operations.push(
        supabase
          .from('auras')
          .update({ location_configs: {} })
          .in('id', auraIdsWithLocationConfigs)
      )
    }

    // 3. Remove device_location OAuth connections
    operations.push(
      supabase
        .from('oauth_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'device_location')
    )

    // 4. Remove any associations in aura_oauth_connections for device_location
    // First get the connection IDs
    const { data: deviceConnections } = await supabase
      .from('oauth_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', 'device_location')
    
    if (deviceConnections && deviceConnections.length > 0) {
      const connectionIds = deviceConnections.map(c => c.id)
      operations.push(
        supabase
          .from('aura_oauth_connections')
          .delete()
          .in('connection_id', connectionIds)
      )
    }

    // Execute all operations
    const results = await Promise.all(operations)
    
    // Check for errors
    for (const result of results) {
      if (result.error) {
        console.error('Error in location disable operation:', result.error)
        return NextResponse.json({ error: result.error.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      removedSenses: locationSenseIds.length,
      clearedConfigs: auraIdsWithLocationConfigs.length
    })
  } catch (error: any) {
    console.error("Unexpected error removing location sense:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}