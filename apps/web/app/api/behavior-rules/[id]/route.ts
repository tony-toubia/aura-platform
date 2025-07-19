// apps/web/app/api/behavior-rules/[id]/route.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ruleId } = await params
  const body = await req.json()
  const {
    name,
    trigger,
    action,
    priority,
    enabled,
  } = body

  // basic validation
  if (
    typeof name !== "string" ||
    typeof trigger !== "object" ||
    typeof action !== "object"
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const { error, data } = await supabase
    .from("behavior_rules")
    .update({
      name,
      trigger,
      action,
      priority,
      enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ruleId)
    .select()
    .single()

  if (error) {
    console.error("Failed to update rule:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}