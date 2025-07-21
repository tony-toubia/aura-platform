// apps/web/app/(dashboard)/auras/[id]/edit/page.tsx
import React from "react"
import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server.server"
import { AuraEditForm } from "@/components/aura/aura-edit-form"
import type { Aura as TAura } from "@/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditAuraPage({ params }: PageProps) {
  // 1) Await params (Next.js 15 requirement)
  const { id: auraId } = await params

  // 2) Auth check
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // 3) Fetch the aura with its senses and rules
  const { data: auraRow, error } = await supabase
    .from("auras")
    .select(
      `*,
      aura_senses (
        sense:senses ( code )
      ),
      behavior_rules (
        id, name, trigger, action, priority, enabled,
        created_at, updated_at
      )`
    )
    .eq("id", auraId)
    .single()

  if (error || !auraRow) {
    // couldn't load it
    redirect("/auras")
  }

  // 4) Map the raw row into our TAura shape
  const initialAura: TAura = {
    id:         auraRow.id,
    name:       auraRow.name,
    vesselType: auraRow.vessel_type as TAura["vesselType"],
    personality:auraRow.personality,
    // Extract senses from the joined data
    senses:     auraRow.aura_senses?.map((as: any) => as.sense.code) || [],
    selectedStudyId:  auraRow.selected_study_id,
    selectedIndividualId: auraRow.selected_individual_id,
    avatar:     auraRow.avatar,
    enabled:    auraRow.enabled,
    createdAt:  new Date(auraRow.created_at),
    updatedAt:  new Date(auraRow.updated_at),
    rules:      (auraRow.behavior_rules as any[]).map((r) => ({
      id:        r.id,
      name:      r.name,
      trigger:   r.trigger,
      action:    r.action,
      priority:  r.priority ?? 0,
      enabled:   r.enabled,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    })),
  }

  return (
    <div className="container py-8">
      <AuraEditForm initialAura={initialAura} />
    </div>
  )
}