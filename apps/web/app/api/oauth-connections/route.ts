// apps/web/app/api/oauth-connections/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const body = await req.json()
  const { provider, sense_type, provider_user_id, access_token, refresh_token, expires_at, scope } = body
  
  console.log(`[${timestamp}] POST /api/oauth-connections called with:`, {
    provider,
    sense_type,
    provider_user_id: provider_user_id ? '***' : null,
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
  })

  // Basic validation
  if (!provider || !sense_type || !access_token) {
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
    // Check for existing connection to prevent duplicates
    const { data: existingConnection } = await supabase
      .from("oauth_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .eq("sense_type", sense_type)
      .eq("provider_user_id", provider_user_id || provider)
      .single()

    if (existingConnection) {
      return NextResponse.json(
        { error: "Connection already exists for this provider and account" },
        { status: 409 }
      )
    }

    // Insert new OAuth connection
    const { data: connection, error: insertError } = await supabase
      .from("oauth_connections")
      .insert({
        user_id: user.id,
        provider,
        provider_user_id: provider_user_id || provider,
        sense_type,
        access_token,
        refresh_token,
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        scope,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Failed to create OAuth connection:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log(`[${timestamp}] Successfully created OAuth connection with ID: ${connection.id}`)
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
    const { data: connections, error } = await supabase
      .from("oauth_connections")
      .select("*")
      .eq("user_id", user.id)
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