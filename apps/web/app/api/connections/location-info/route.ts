import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Fetch location sense usage from aura_senses
    const { data: locationSenses, error: locationError } = await supabase
      .from("aura_senses")
      .select(`
        id,
        aura:auras!inner(id, name, user_id),
        sense:senses!inner(code, name)
      `)
      .eq("auras.user_id", user.id)
      .eq("senses.code", "location")

    if (locationError) {
      return NextResponse.json({ error: locationError.message }, { status: 500 })
    }

    // Also fetch device_location connections from oauth_connections
    const { data: deviceLocationConnections, error: deviceError } = await supabase
      .from("oauth_connections")
      .select(`
        id,
        aura_id,
        auras(id, name)
      `)
      .eq("user_id", user.id)
      .eq("provider", "device_location")

    if (deviceError) {
      console.error("Error fetching device location connections:", deviceError)
      return NextResponse.json({ error: deviceError.message }, { status: 500 })
    }

    // Process device_location connections - handle both direct and library connections
    const processedDeviceConnections = []
    
    for (const conn of deviceLocationConnections || []) {
      if (conn.aura_id && conn.auras) {
        // Direct connection
        processedDeviceConnections.push({
          id: conn.id,
          aura: conn.auras
        })
      } else if (!conn.aura_id) {
        // Library connection - fetch associated auras
        const { data: associations } = await supabase
          .from("aura_oauth_connections")
          .select(`
            id,
            aura:auras!inner(id, name, user_id)
          `)
          .eq("connection_id", conn.id)
          .eq("auras.user_id", user.id)

        if (associations) {
          for (const assoc of associations) {
            processedDeviceConnections.push({
              id: `${conn.id}_${assoc.id}`, // Unique ID for each association
              aura: assoc.aura
            })
          }
        }
      }
    }

    // Combine both location sources
    const allLocationSenses = [
      ...(locationSenses || []),
      ...processedDeviceConnections
    ]

    return NextResponse.json(allLocationSenses)
  } catch (error: any) {
    console.error("Unexpected error fetching location info:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}