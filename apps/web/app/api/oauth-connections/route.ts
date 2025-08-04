// apps/web/app/api/oauth-connections/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🚀 POST /api/oauth-connections - REQUEST RECEIVED`)
  
  let body
  try {
    body = await req.json()
  } catch (parseError) {
    console.error(`[${timestamp}] [${requestId}] ❌ Failed to parse request body:`, parseError)
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
  }
  
  const { provider, sense_type, provider_user_id, access_token, refresh_token, expires_at, scope, aura_id, device_info } = body
  
  console.log(`[${timestamp}] [${requestId}] 📋 Request details:`, {
    provider,
    sense_type,
    provider_user_id: provider_user_id ? '***' : null,
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    aura_id,
    hasDeviceInfo: !!device_info,
    deviceInfoKeys: device_info ? Object.keys(device_info) : [],
    bodyKeys: Object.keys(body),
    contentType: req.headers.get('content-type'),
    userAgent: req.headers.get('user-agent')?.substring(0, 50) + '...'
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
    // Check for existing connection for this user/provider/sense combination
    const { data: existingConnection } = await supabase
      .from("oauth_connections")
      .select("id, aura_id")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .eq("sense_type", sense_type)
      .single()

    if (existingConnection) {
      // If connection exists and we're trying to associate it with a specific aura
      if (aura_id && existingConnection.aura_id !== aura_id) {
        console.log(`[${timestamp}] [${requestId}] 🔄 Updating existing connection to associate with aura: ${aura_id}`)
        
        // Update the existing connection to associate it with the new aura
        const { data: updatedConnection, error: updateError } = await supabase
          .from("oauth_connections")
          .update({ aura_id: aura_id })
          .eq("id", existingConnection.id)
          .select()
          .single()

        if (updateError) {
          console.error(`[${timestamp}] [${requestId}] ❌ Failed to update OAuth connection:`, updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        console.log(`[${timestamp}] [${requestId}] ✅ Successfully updated OAuth connection with ID: ${updatedConnection.id}`)
        return NextResponse.json(updatedConnection, { status: 200 })
      } else {
        // Connection already exists for this aura or no aura specified
        console.log(`[${timestamp}] [${requestId}] ⚠️ Connection already exists`)
        return NextResponse.json(
          { error: "Connection already exists for this provider and account" },
          { status: 409 }
        )
      }
    }

    // Insert new OAuth connection
    const insertData = {
      user_id: user.id,
      provider,
      provider_user_id: provider_user_id || provider,
      sense_type,
      access_token,
      refresh_token,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      scope,
      aura_id: aura_id || null, // Associate with specific aura if provided
      device_info: device_info || null, // Store device information for location connections
    }
    
    console.log(`[${timestamp}] [${requestId}] 💾 Inserting OAuth connection:`, {
      ...insertData,
      access_token: '***',
      refresh_token: insertData.refresh_token ? '***' : null,
      device_info: insertData.device_info ? {
        browser: insertData.device_info.browser,
        os: insertData.device_info.os,
        platform: insertData.device_info.platform
      } : null
    })
    
    const { data: connection, error: insertError } = await supabase
      .from("oauth_connections")
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error(`[${timestamp}] [${requestId}] ❌ Failed to create OAuth connection:`, insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log(`[${timestamp}] [${requestId}] ✅ Successfully created OAuth connection with ID: ${connection.id}`)
    return NextResponse.json(connection, { status: 201 })
  } catch (error: any) {
    console.error("Unexpected error creating OAuth connection:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get aura_id from query parameters if provided
    const { searchParams } = new URL(req.url)
    const auraId = searchParams.get('aura_id')

    let query = supabase
      .from("oauth_connections")
      .select("*")
      .eq("user_id", user.id)

    // Filter by aura_id if provided - only show connections for this specific aura
    if (auraId) {
      query = query.eq("aura_id", auraId)
    }

    const { data: connections, error } = await query
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch OAuth connections:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(connections)
  } catch (error: any) {
    console.error("Unexpected error fetching OAuth connections:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}