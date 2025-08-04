import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Fetch all OAuth connections (both direct and library)
    const { data: oauthConnections, error: oauthError } = await supabase
      .from("oauth_connections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (oauthError) {
      return NextResponse.json({ error: oauthError.message }, { status: 500 })
    }

    // For each OAuth connection, get association info and counts
    const connectionsWithCounts = await Promise.all(
      (oauthConnections || []).map(async (connection) => {
        const isLibraryConnection = connection.aura_id === null
        let auraCount = 0
        let associatedAuras: any[] = []

        if (isLibraryConnection) {
          // For library connections, count associations
          const { data: associations, error: associationError } = await supabase
            .from("aura_oauth_connections")
            .select(`
              id,
              aura:auras!inner(id, name, user_id)
            `)
            .eq("connection_id", connection.id)
            .eq("auras.user_id", user.id)

          if (!associationError && associations) {
            auraCount = associations.length
            associatedAuras = associations.map(a => a.aura)
          }
        } else {
          // For direct connections, count is 1 if aura exists
          const { data: aura, error: auraError } = await supabase
            .from("auras")
            .select("id, name")
            .eq("id", connection.aura_id)
            .eq("user_id", user.id)
            .single()

          if (!auraError && aura) {
            auraCount = 1
            associatedAuras = [aura]
          }
        }

        // Count behavior rules that use this sense across all associated auras
        let affectedRules = 0
        if (associatedAuras.length > 0) {
          const auraIds = associatedAuras.map(a => a.id)
          const { data: behaviorRules, error: rulesError } = await supabase
            .from("behavior_rules")
            .select("id, trigger")
            .in("aura_id", auraIds)

          if (!rulesError && behaviorRules) {
            affectedRules = behaviorRules.filter(rule => {
              const trigger = rule.trigger as any
              return trigger?.sensor?.includes(connection.sense_type)
            }).length
          }
        }

        return {
          ...connection,
          aura_count: auraCount,
          affected_rules: affectedRules,
          is_library_connection: isLibraryConnection,
          associated_auras: associatedAuras
        }
      })
    )

    return NextResponse.json(connectionsWithCounts)
  } catch (error: any) {
    console.error("Unexpected error fetching OAuth info:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}