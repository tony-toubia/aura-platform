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
    const { data: locationSenses, error } = await supabase
      .from("aura_senses")
      .select(`
        id,
        aura:auras!inner(id, name, user_id),
        sense:senses!inner(code, name)
      `)
      .eq("auras.user_id", user.id)
      .eq("senses.code", "location")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(locationSenses || [])
  } catch (error: any) {
    console.error("Unexpected error fetching location info:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}