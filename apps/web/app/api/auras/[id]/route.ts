// apps/web/app/api/auras/[id]/route.ts
import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auraId = params.id
  const body = await req.json()
  const { name, vesselType, personality, senses } = body

  // Basic validation
  if (
    typeof name !== "string" ||
    typeof vesselType !== "string" ||
    typeof personality !== "object" ||
    !Array.isArray(senses)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("auras")
    .update({
      name,
      vessel_type: vesselType,
      personality,
      senses,
      updated_at: new Date().toISOString(),
    })
    .eq("id", auraId)

  if (error) {
    console.error("Failed to update aura:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
