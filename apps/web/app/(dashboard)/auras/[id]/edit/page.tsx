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

  // 3) Fetch the aura with its senses, rules, and OAuth connections
  const { data: auraRow, error } = await supabase
    .from("auras")
    .select(
      `*,
      aura_senses (
        sense:senses ( code ),
        config
      ),
      behavior_rules (
        id, name, trigger, action, priority, enabled,
        created_at, updated_at
      )`
    )
    .eq("id", auraId)
    .single()

  // Fetch OAuth connections for this specific aura
  const { data: oauthConnections, error: oauthError } = await supabase
    .from("oauth_connections")
    .select("*")
    .eq("user_id", user.id)
    .eq("aura_id", auraId)

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

  // Extract location configs from the database
  const locationConfigs = auraRow.location_configs || {}
  
  // Transform OAuth connections from the oauth_connections table
  const transformOAuthConnections = (oauthConns: any[]): Record<string, any[]> => {
    const connections: Record<string, any[]> = {}
    
    oauthConns.forEach((conn) => {
      const senseType = conn.sense_type
      
      if (!connections[senseType]) {
        connections[senseType] = []
      }
      
      connections[senseType].push({
        id: conn.id,
        name: conn.provider,
        type: senseType,
        connectedAt: conn.created_at ? new Date(conn.created_at) : new Date(),
        providerId: conn.provider,
        accountEmail: conn.provider_user_id || `Connected ${conn.provider} account`,
        // Don't expose sensitive tokens to frontend
        expiresAt: conn.expires_at ? new Date(conn.expires_at) : null,
        scope: conn.scope,
      })
    })
    
    return connections
  }

  // Extract news configurations from aura senses (still stored in config)
  const extractNewsConfigurations = (auraSenses: any[]): Record<string, any[]> => {
    const configurations: Record<string, any[]> = {}
    
    auraSenses.forEach((auraSense) => {
      const senseCode = auraSense.sense.code
      const config = auraSense.config || {}
      
      if (config.newsConfigurations && Array.isArray(config.newsConfigurations)) {
        configurations[senseCode] = config.newsConfigurations
      }
    })
    
    return configurations
  }

  const oauthConnectionsData = transformOAuthConnections(oauthConnections || [])
  const newsConfigurations = extractNewsConfigurations(auraRow.aura_senses || [])
  
  console.log('🔍 Loaded aura data:', {
    id: auraRow.id,
    name: auraRow.name,
    location_configs: auraRow.location_configs,
    oauth_connections: oauthConnectionsData,
    news_configurations: newsConfigurations,
    senses: auraRow.aura_senses?.map((as: any) => ({ code: as.sense.code, config: as.config }))
  })

  return (
    <div className="container py-0">
      <AuraEditForm
        initialAura={initialAura}
        initialLocationConfigs={locationConfigs}
        initialOAuthConnections={oauthConnectionsData}
        initialNewsConfigurations={newsConfigurations}
      />
    </div>
  )
}