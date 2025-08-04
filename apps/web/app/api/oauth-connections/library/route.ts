// apps/web/app/api/oauth-connections/library/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

/**
 * GET /api/oauth-connections/library
 * Fetch all OAuth connections available in the user's library (not tied to specific auras)
 */
export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] GET /api/oauth-connections/library - REQUEST RECEIVED`)

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const senseType = searchParams.get('sense_type')

    // Try to get library connections with associations, fallback if junction table doesn't exist
    let connections, error
    
    try {
      // Build query for library connections (aura_id is null) with associations
      let query = supabase
        .from("oauth_connections")
        .select(`
          id,
          provider,
          provider_user_id,
          sense_type,
          created_at,
          expires_at,
          scope,
          device_info,
          aura_connections:aura_oauth_connections(
            aura_id,
            aura:auras(id, name)
          )
        `)
        .eq("user_id", user.id)
        .is("aura_id", null) // Only library connections (not tied to specific auras)

      // Filter by sense type if provided
      if (senseType) {
        query = query.eq("sense_type", senseType)
      }

      const result = await query.order("created_at", { ascending: false })
      connections = result.data
      error = result.error
    } catch (relationshipError) {
      console.log(`[${timestamp}] Junction table not available, falling back to simple query`)
      
      // Fallback: just get library connections without associations
      let query = supabase
        .from("oauth_connections")
        .select(`
          id,
          provider,
          provider_user_id,
          sense_type,
          created_at,
          expires_at,
          scope,
          device_info
        `)
        .eq("user_id", user.id)
        .is("aura_id", null) // Only library connections (not tied to specific auras)

      // Filter by sense type if provided
      if (senseType) {
        query = query.eq("sense_type", senseType)
      }

      const result = await query.order("created_at", { ascending: false })
      connections = result.data
      error = result.error
      
      // Add empty aura_connections array to match expected structure
      if (connections) {
        connections = connections.map(conn => ({
          ...conn,
          aura_connections: []
        }))
      }
    }

    if (error) {
      console.error(`[${timestamp}] Failed to fetch library connections:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[${timestamp}] Successfully fetched ${connections?.length || 0} library connections`)
    return NextResponse.json(connections || [])
  } catch (error: any) {
    console.error(`[${timestamp}] Unexpected error fetching library connections:`, error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/oauth-connections/library
 * Create a new OAuth connection in the library (not tied to a specific aura)
 */
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] POST /api/oauth-connections/library - REQUEST RECEIVED`)
  
  let body
  try {
    body = await req.json()
  } catch (parseError) {
    console.error(`[${timestamp}] [${requestId}] ❌ Failed to parse request body:`, parseError)
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
  }
  
  const { provider, sense_type, provider_user_id, access_token, refresh_token, expires_at, scope, device_info } = body
  
  console.log(`[${timestamp}] [${requestId}] 📋 Request details:`, {
    provider,
    sense_type,
    provider_user_id: provider_user_id ? '***' : null,
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    hasDeviceInfo: !!device_info,
    deviceInfoKeys: device_info ? Object.keys(device_info) : [],
  })

  // Basic validation
  if (!provider || !sense_type || !access_token) {
    console.log(`[${timestamp}] [${requestId}] ❌ Validation failed - missing required fields`)
    return NextResponse.json(
      { error: "Missing required fields: provider, sense_type, access_token" },
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
    // Check for existing library connection for this user/provider/sense combination
    const { data: existingConnection } = await supabase
      .from("oauth_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .eq("sense_type", sense_type)
      .is("aura_id", null) // Only check library connections
      .single()

    if (existingConnection) {
      console.log(`[${timestamp}] [${requestId}] ⚠️ Library connection already exists`)
      return NextResponse.json(
        { error: "Connection already exists in your library for this provider and sense type" },
        { status: 409 }
      )
    }

    // Insert new OAuth connection into library (aura_id = null)
    const insertData = {
      user_id: user.id,
      provider,
      provider_user_id: provider_user_id || provider,
      sense_type,
      access_token,
      refresh_token,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      scope,
      aura_id: null, // Library connection - not tied to specific aura
      device_info: device_info || null,
    }
    
    console.log(`[${timestamp}] [${requestId}] 💾 Inserting library OAuth connection:`, {
      ...insertData,
      access_token: '***',
      refresh_token: insertData.refresh_token ? '***' : null,
    })
    
    const { data: connection, error: insertError } = await supabase
      .from("oauth_connections")
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error(`[${timestamp}] [${requestId}] ❌ Failed to create library OAuth connection:`, insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log(`[${timestamp}] [${requestId}] ✅ Successfully created library OAuth connection with ID: ${connection.id}`)
    return NextResponse.json(connection, { status: 201 })
  } catch (error: any) {
    console.error(`[${timestamp}] [${requestId}] Unexpected error creating library OAuth connection:`, error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/oauth-connections/library
 * Safely delete an OAuth connection from the library (only if not associated with any auras)
 */
export async function DELETE(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] DELETE /api/oauth-connections/library - REQUEST RECEIVED`)
  
  let body
  try {
    body = await req.json()
  } catch (parseError) {
    console.error(`[${timestamp}] [${requestId}] ❌ Failed to parse request body:`, parseError)
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
  }
  
  const { connection_id } = body
  
  console.log(`[${timestamp}] [${requestId}] 📋 Request details:`, {
    connection_id,
  })

  // Basic validation
  if (!connection_id) {
    console.log(`[${timestamp}] [${requestId}] ❌ Validation failed - missing connection_id`)
    return NextResponse.json(
      { error: "Missing required field: connection_id" },
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
    // Try to use the database function to safely delete the connection
    let result, error
    
    try {
      const rpcResult = await supabase
        .rpc('delete_oauth_connection_from_library', { connection_uuid: connection_id })
      result = rpcResult.data
      error = rpcResult.error
    } catch (rpcError) {
      console.log(`[${timestamp}] [${requestId}] Database function not available, using fallback deletion`)
      
      // Fallback: Check if connection exists and is a library connection, then delete
      const { data: connection, error: fetchError } = await supabase
        .from("oauth_connections")
        .select("id, user_id, aura_id")
        .eq("id", connection_id)
        .eq("user_id", user.id)
        .is("aura_id", null) // Only library connections
        .single()

      if (fetchError) {
        console.error(`[${timestamp}] [${requestId}] ❌ Failed to fetch connection for deletion:`, fetchError)
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
      }

      if (!connection) {
        console.log(`[${timestamp}] [${requestId}] ⚠️ Library connection not found or not owned by user`)
        return NextResponse.json({
          success: false,
          deleted: false,
          message: "Connection not found or not a library connection"
        }, { status: 404 })
      }

      // Delete the connection (since it's a library connection, no associations to check)
      const { error: deleteError } = await supabase
        .from("oauth_connections")
        .delete()
        .eq("id", connection_id)
        .eq("user_id", user.id)

      if (deleteError) {
        console.error(`[${timestamp}] [${requestId}] ❌ Failed to delete library connection:`, deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      result = true
      error = null
    }

    if (error) {
      console.error(`[${timestamp}] [${requestId}] ❌ Failed to delete library connection:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (result) {
      console.log(`[${timestamp}] [${requestId}] ✅ Successfully deleted library connection: ${connection_id}`)
      return NextResponse.json({ success: true, deleted: true })
    } else {
      console.log(`[${timestamp}] [${requestId}] ⚠️ Cannot delete library connection - still in use or not found`)
      return NextResponse.json({
        success: false,
        deleted: false,
        message: "Connection is still being used by one or more auras, or connection not found"
      }, { status: 409 })
    }
  } catch (error: any) {
    console.error(`[${timestamp}] [${requestId}] Unexpected error deleting library connection:`, error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}