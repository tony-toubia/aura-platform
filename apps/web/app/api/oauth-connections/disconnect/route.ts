import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { connectionId } = await request.json()

  if (!connectionId) {
    return NextResponse.json({ error: "Connection ID required" }, { status: 400 })
  }

  try {
    // Delete the OAuth connection (only if it belongs to the current user)
    const { error } = await supabase
      .from("oauth_connections")
      .delete()
      .eq("id", connectionId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Failed to delete OAuth connection:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error deleting OAuth connection:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}