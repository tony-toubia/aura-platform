// apps/web/lib/services/aura-service.ts
'use client'

import { browserSupabase } from '@/lib/supabase/browser'
import type { Aura } from '@/types'

export interface CreateAuraInput {
  name: string
  vesselType: 'diital' | 'terra' | 'companion' | 'memory' | 'sage'
  personality: Record<string, number>
  senses: string[]
  communicationStyle?: string
  voiceProfile?: string
  selectedStudyId?: number | null
  selectedIndividualId?: string | null
}

export class AuraService {
  static async createAura(input: CreateAuraInput): Promise<Aura> {
    const supabase = browserSupabase

    // 1) Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    // 2) Insert into auras
    const { data: aura, error: auraError } = await supabase
      .from('auras')
      .insert({
        user_id: user.id,
        name: input.name,
        vessel_type: input.vesselType,
        personality: input.personality,
        communication_style: input.communicationStyle ?? 'balanced',
        voice_profile: input.voiceProfile ?? 'neutral',
        avatar: this.getAvatarForVessel(input.vesselType),
        selected_study_id: input.selectedStudyId,
        selected_individual_id: input.selectedIndividualId,
      })
      .select()
      .single()
    if (auraError || !aura) throw auraError

    // 3) Link senses (if any)
    if (input.senses.length) {
      const { data: senses, error: sensesError } = await supabase
        .from('senses')
        .select('id, code')
        .in('code', input.senses)
      if (sensesError || !senses) throw sensesError

      const auraSenses = senses.map((s) => ({
        aura_id: aura.id,
        sense_id: s.id,
      }))
      const { error: auraSensesError } = await supabase
        .from('aura_senses')
        .insert(auraSenses)
      if (auraSensesError) throw auraSensesError
    }

    return {
      id: aura.id,
      name: aura.name,
      vesselType: aura.vessel_type,
      personality: aura.personality,
      senses: input.senses,
      avatar: aura.avatar!,
      rules: [],
      enabled: aura.enabled,
      createdAt: new Date(aura.created_at),
      updatedAt: new Date(aura.updated_at),
      selectedStudyId: aura.selected_study_id ?? null,
      selectedIndividualId: aura.selected_individual_id ?? null,
    }
  }

  static async getUserAuras(): Promise<Aura[]> {
    const supabase = browserSupabase

    // 1) get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    // 2) fetch only this user's auras
    const { data: rows, error } = await supabase
      .from('auras')
      .select(`
        *,
        aura_senses (
          sense:senses ( code )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error

    return (rows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      vesselType: row.vessel_type,
      personality: row.personality,
      senses: row.aura_senses.map((as: any) => as.sense.code),
      avatar: row.avatar ?? this.getAvatarForVessel(row.vessel_type),
      rules: [],
      enabled: row.enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      selectedStudyId: row.selected_study_id ?? null,
      selectedIndividualId: row.selected_individual_id ?? null,
    }))
  }

  static async getAuraById(id: string): Promise<Aura | null> {
    const supabase = browserSupabase

    // get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    const { data: row, error } = await supabase
      .from('auras')
      .select(`
        *,
        aura_senses (
          sense:senses ( code )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    if (error || !row) return null

    return {
      id: row.id,
      name: row.name,
      vesselType: row.vessel_type,
      personality: row.personality,
      senses: row.aura_senses.map((as: any) => as.sense.code),
      avatar: row.avatar ?? this.getAvatarForVessel(row.vessel_type),
      rules: [],
      enabled: row.enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      selectedStudyId: row.selected_study_id ?? null,
      selectedIndividualId: row.selected_individual_id ?? null,
    }
  }

  static async deleteAura(id: string): Promise<void> {
    const supabase = browserSupabase

    // get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('auras')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
  }

  private static getAvatarForVessel(vesselType: string): string {
    const avatars: Record<string, string> = {
      terra: '🌱',
      companion: '🐘',
      memory: '💎',
      sage: '📚',
    }
    return avatars[vesselType] || '🤖'
  }
}
