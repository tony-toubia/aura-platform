// apps/web/app/api/auras/[id]/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import type { NextRequest } from "next/server"

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function PUT(req: NextRequest, context: RouteParams) {
  const timestamp = new Date().toISOString()
  const { id: auraId } = await context.params
  const body = await req.json()
  const { name, vesselType, personality, senses, selectedStudyId, selectedIndividualId, locationConfigs } = body
  
  console.log(`[${timestamp}] PUT /api/auras/${auraId} called with:`, {
    name,
    sensesCount: senses?.length || 0,
    hasPersonality: !!personality,
    hasLocationConfigs: !!locationConfigs
  })

  // Basic validation
  if (
    typeof name !== "string" ||
    typeof personality !== "object" ||
    !Array.isArray(senses)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
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
    // Update the aura basic info
    const updateData: any = {
      name,
      personality,
      selected_study_id: selectedStudyId,
      selected_individual_id: selectedIndividualId,
      updated_at: new Date().toISOString(),
    }
    
    // Add location configs if provided
    if (locationConfigs !== undefined) {
      updateData.location_configs = locationConfigs
    }
    
    const { error: auraError } = await supabase
      .from("auras")
      .update(updateData)
      .eq("id", auraId)
      .eq("user_id", user.id) // Ensure user owns this aura

    if (auraError) {
      console.error("Failed to update aura:", auraError)
      return NextResponse.json({ error: auraError.message }, { status: 500 })
    }

    // Update senses if provided
    if (senses && senses.length >= 0) {
      // First, delete existing sense connections
      const { error: deleteError } = await supabase
        .from("aura_senses")
        .delete()
        .eq("aura_id", auraId)

      if (deleteError) {
        console.error("Failed to delete existing senses:", deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Then, add new sense connections if any senses are provided
      if (senses.length > 0) {
        // Get sense IDs from codes
        const { data: senseData, error: senseError } = await supabase
          .from("senses")
          .select("id, code")
          .in("code", senses)

        if (senseError || !senseData) {
          console.error("Failed to fetch senses:", senseError)
          return NextResponse.json({ error: "Failed to fetch senses" }, { status: 500 })
        }

        // Create aura_senses connections
        const auraSenses = senseData.map((sense) => ({
          aura_id: auraId,
          sense_id: sense.id,
        }))

        const { error: insertError } = await supabase
          .from("aura_senses")
          .insert(auraSenses)

        if (insertError) {
          console.error("Failed to insert new senses:", insertError)
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Unexpected error updating aura:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest, context: RouteParams) {
  const { id: auraId } = await context.params

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { data: aura, error } = await supabase
      .from("auras")
      .select(`
        *,
        aura_senses (
          sense:senses ( code )
        )
      `)
      .eq("id", auraId)
      .eq("user_id", user.id)
      .single()

    if (error || !aura) {
      return NextResponse.json({ error: "Aura not found" }, { status: 404 })
    }

    // Transform the data to match expected format
    const transformedAura = {
      id: aura.id,
      name: aura.name,
      vesselType: aura.vessel_type,
      personality: aura.personality,
      senses: aura.aura_senses?.map((as: any) => as.sense.code) || [],
      avatar: aura.avatar,
      rules: [], // Load separately if needed
      enabled: aura.enabled,
      createdAt: aura.created_at,
      updatedAt: aura.updated_at,
      selectedStudyId: aura.selected_study_id,
      selectedIndividualId: aura.selected_individual_id,
    }

    return NextResponse.json(transformedAura)
  } catch (error: any) {
    console.error("Unexpected error fetching aura:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, context: RouteParams) {
  const { id: auraId } = await context.params

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from("auras")
      .delete()
      .eq("id", auraId)
      .eq("user_id", user.id) // Ensure user owns this aura

    if (error) {
      console.error("Failed to delete aura:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error deleting aura:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}