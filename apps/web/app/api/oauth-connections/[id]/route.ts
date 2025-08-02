// apps/web/app/api/oauth-connections/[id]/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(req: NextRequest, context: RouteParams) {
  const timestamp = new Date().toISOString()
  const { id: connectionId } = await context.params
  
  console.log(`[${timestamp}] DELETE /api/oauth-connections/${connectionId} called`)

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Delete the OAuth connection (only if it belongs to the current user)
    const { error: deleteError } = await supabase
      .from("oauth_connections")
      .delete()
      .eq("id", connectionId)
      .eq("user_id", user.id) // Ensure user owns this connection

    if (deleteError) {
      console.error("Failed to delete OAuth connection:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log(`[${timestamp}] Successfully deleted OAuth connection: ${connectionId}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error deleting OAuth connection:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest, context: RouteParams) {
  const { id: connectionId } = await context.params

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { data: connection, error } = await supabase
      .from("oauth_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("user_id", user.id) // Ensure user owns this connection
      .single()

    if (error || !connection) {
      return NextResponse.json({ error: "OAuth connection not found" }, { status: 404 })
    }

    return NextResponse.json(connection)
  } catch (error: any) {
    console.error("Unexpected error fetching OAuth connection:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}