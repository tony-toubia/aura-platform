// apps/web/app/api/oauth-connections/library/associate/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

/**
 * POST /api/oauth-connections/library/associate
 * Associate a library OAuth connection with an aura
 */
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] POST /api/oauth-connections/library/associate - REQUEST RECEIVED`)
  
  let body
  try {
    body = await req.json()
  } catch (parseError) {
    console.error(`[${timestamp}] [${requestId}] ❌ Failed to parse request body:`, parseError)
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
  }
  
  const { connection_id, aura_id } = body
  
  console.log(`[${timestamp}] [${requestId}] 📋 Request details:`, {
    connection_id,
    aura_id,
  })

  // Basic validation
  if (!connection_id || !aura_id) {
    console.log(`[${timestamp}] [${requestId}] ❌ Validation failed - missing required fields`)
    return NextResponse.json(
      { error: "Missing required fields: connection_id, aura_id" },
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
    // Verify the connection exists and belongs to the user
    const { data: connection, error: connectionError } = await supabase
      .from("oauth_connections")
      .select("id, sense_type, provider")
      .eq("id", connection_id)
      .eq("user_id", user.id)
      .is("aura_id", null) // Must be a library connection
      .single()

    if (connectionError || !connection) {
      console.log(`[${timestamp}] [${requestId}] ❌ Connection not found or not owned by user`)
      return NextResponse.json(
        { error: "OAuth connection not found in your library" },
        { status: 404 }
      )
    }

    // Verify the aura exists and belongs to the user
    const { data: aura, error: auraError } = await supabase
      .from("auras")
      .select("id, name")
      .eq("id", aura_id)
      .eq("user_id", user.id)
      .single()

    if (auraError || !aura) {
      console.log(`[${timestamp}] [${requestId}] ❌ Aura not found or not owned by user`)
      return NextResponse.json(
        { error: "Aura not found" },
        { status: 404 }
      )
    }

    // Try to check if association already exists and create new one
    let association, insertError
    
    try {
      // Check if association already exists
      const { data: existingAssociation } = await supabase
        .from("aura_oauth_connections")
        .select("id")
        .eq("connection_id", connection_id)
        .eq("aura_id", aura_id)
        .single()

      if (existingAssociation) {
        console.log(`[${timestamp}] [${requestId}] ⚠️ Association already exists`)
        return NextResponse.json(
          { error: "This connection is already associated with this aura" },
          { status: 409 }
        )
      }

      // Create the association
      const result = await supabase
        .from("aura_oauth_connections")
        .insert({
          connection_id,
          aura_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      association = result.data
      insertError = result.error
    } catch (tableError) {
      console.log(`[${timestamp}] [${requestId}] Junction table not available, using fallback approach`)
      
      // Fallback: Since we can't use the junction table, we'll convert this to a direct connection
      // by updating the library connection to be tied to this specific aura
      const { data: updatedConnection, error: updateError } = await supabase
        .from("oauth_connections")
        .update({ aura_id: aura_id })
        .eq("id", connection_id)
        .eq("user_id", user.id)
        .is("aura_id", null)
        .select()
        .single()

      if (updateError) {
        console.error(`[${timestamp}] [${requestId}] ❌ Failed to convert library connection to direct connection:`, updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Return success with a note about the conversion
      console.log(`[${timestamp}] [${requestId}] ✅ Successfully converted library connection to direct connection for aura ${aura_id}`)
      return NextResponse.json({
        converted: true,
        connection: {
          id: connection.id,
          sense_type: connection.sense_type,
          provider: connection.provider
        },
        aura: {
          id: aura.id,
          name: aura.name
        },
        message: "Connection converted from library to direct connection for this aura"
      }, { status: 201 })
    }

    if (insertError) {
      console.error(`[${timestamp}] [${requestId}] ❌ Failed to create association:`, insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log(`[${timestamp}] [${requestId}] ✅ Successfully associated connection ${connection_id} with aura ${aura_id}`)
    return NextResponse.json({
      association,
      connection: {
        id: connection.id,
        sense_type: connection.sense_type,
        provider: connection.provider
      },
      aura: {
        id: aura.id,
        name: aura.name
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error(`[${timestamp}] [${requestId}] Unexpected error creating association:`, error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/oauth-connections/library/associate
 * Remove association between a library OAuth connection and an aura
 */
export async function DELETE(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] DELETE /api/oauth-connections/library/associate - REQUEST RECEIVED`)
  
  let body
  try {
    body = await req.json()
  } catch (parseError) {
    console.error(`[${timestamp}] [${requestId}] ❌ Failed to parse request body:`, parseError)
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
  }
  
  const { connection_id, aura_id } = body
  
  console.log(`[${timestamp}] [${requestId}] 📋 Request details:`, {
    connection_id,
    aura_id,
  })

  // Basic validation
  if (!connection_id || !aura_id) {
    console.log(`[${timestamp}] [${requestId}] ❌ Validation failed - missing required fields`)
    return NextResponse.json(
      { error: "Missing required fields: connection_id, aura_id" },
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
    // Verify the connection belongs to the user
    const { data: connection, error: connectionError } = await supabase
      .from("oauth_connections")
      .select("id")
      .eq("id", connection_id)
      .eq("user_id", user.id)
      .single()

    if (connectionError || !connection) {
      console.log(`[${timestamp}] [${requestId}] ❌ Connection not found or not owned by user`)
      return NextResponse.json(
        { error: "OAuth connection not found" },
        { status: 404 }
      )
    }

    // Verify the aura belongs to the user
    const { data: aura, error: auraError } = await supabase
      .from("auras")
      .select("id")
      .eq("id", aura_id)
      .eq("user_id", user.id)
      .single()

    if (auraError || !aura) {
      console.log(`[${timestamp}] [${requestId}] ❌ Aura not found or not owned by user`)
      return NextResponse.json(
        { error: "Aura not found" },
        { status: 404 }
      )
    }

    // Try to delete the association
    let deleteError
    
    try {
      const result = await supabase
        .from("aura_oauth_connections")
        .delete()
        .eq("connection_id", connection_id)
        .eq("aura_id", aura_id)
      
      deleteError = result.error
    } catch (tableError) {
      console.log(`[${timestamp}] [${requestId}] Junction table not available, using fallback approach`)
      
      // Fallback: Convert the direct connection back to a library connection
      const { error: updateError } = await supabase
        .from("oauth_connections")
        .update({ aura_id: null })
        .eq("id", connection_id)
        .eq("user_id", user.id)
        .eq("aura_id", aura_id)

      if (updateError) {
        console.error(`[${timestamp}] [${requestId}] ❌ Failed to convert direct connection back to library:`, updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      console.log(`[${timestamp}] [${requestId}] ✅ Successfully converted direct connection back to library connection`)
      return NextResponse.json({
        success: true,
        converted: true,
        message: "Connection converted back to library connection"
      })
    }

    if (deleteError) {
      console.error(`[${timestamp}] [${requestId}] ❌ Failed to delete association:`, deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log(`[${timestamp}] [${requestId}] ✅ Successfully removed association between connection ${connection_id} and aura ${aura_id}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`[${timestamp}] [${requestId}] Unexpected error removing association:`, error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}