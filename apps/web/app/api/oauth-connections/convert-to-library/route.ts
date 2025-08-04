// apps/web/app/api/oauth-connections/convert-to-library/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🚀 POST /api/oauth-connections/convert-to-library - REQUEST RECEIVED`)
  
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
    bodyKeys: Object.keys(body)
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
    // First, get the connection to verify ownership and that it's a direct connection
    const { data: connection, error: fetchError } = await supabase
      .from("oauth_connections")
      .select("*")
      .eq("id", connection_id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !connection) {
      console.error(`[${timestamp}] [${requestId}] ❌ Connection not found:`, fetchError)
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    if (connection.aura_id === null) {
      console.log(`[${timestamp}] [${requestId}] ⚠️ Connection is already a library connection`)
      return NextResponse.json(connection, { status: 200 })
    }

    // Check if a library connection already exists for this provider/sense_type combination
    const { data: existingLibraryConnection } = await supabase
      .from("oauth_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", connection.provider)
      .eq("sense_type", connection.sense_type)
      .is("aura_id", null)
      .single()

    if (existingLibraryConnection) {
      console.log(`[${timestamp}] [${requestId}] 🔄 Library connection already exists, using existing one`)
      
      // Create association with the original aura if it doesn't exist
      if (connection.aura_id) {
        const { error: associationError } = await supabase
          .from("aura_oauth_connections")
          .upsert({
            connection_id: existingLibraryConnection.id,
            aura_id: connection.aura_id
          }, {
            onConflict: 'connection_id,aura_id'
          })

        if (associationError) {
          console.error(`[${timestamp}] [${requestId}] ❌ Failed to create association:`, associationError)
        }
      }

      // Delete the direct connection since we're using the library one
      await supabase
        .from("oauth_connections")
        .delete()
        .eq("id", connection_id)

      return NextResponse.json(existingLibraryConnection, { status: 200 })
    }

    // Convert the direct connection to a library connection
    const { data: updatedConnection, error: updateError } = await supabase
      .from("oauth_connections")
      .update({ aura_id: null })
      .eq("id", connection_id)
      .select()
      .single()

    if (updateError) {
      console.error(`[${timestamp}] [${requestId}] ❌ Failed to convert connection:`, updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create association with the original aura
    if (connection.aura_id) {
      const { error: associationError } = await supabase
        .from("aura_oauth_connections")
        .insert({
          connection_id: updatedConnection.id,
          aura_id: connection.aura_id
        })

      if (associationError) {
        console.error(`[${timestamp}] [${requestId}] ❌ Failed to create association:`, associationError)
        // Don't fail the whole request, just log the error
      }
    }

    console.log(`[${timestamp}] [${requestId}] ✅ Successfully converted connection to library`)
    return NextResponse.json(updatedConnection, { status: 200 })
    
  } catch (error: any) {
    console.error("Unexpected error converting connection to library:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}