// apps/web/lib/services/aura-service.server.ts
import { createServerSupabase } from '@/lib/supabase/server.server'
import type { Aura } from '@/types'

export interface CreateAuraServerInput {
  name: string
  vesselType: 'digital' | 'terra' | 'companion' | 'memory' | 'sage'
  vesselCode?: string
  plantType?: string
  personality: Record<string, number>
  senses: string[]
  communicationStyle?: string
  voiceProfile?: string
  selectedStudyId?: number | null
  selectedIndividualId?: string | null
  locationConfigs?: Record<string, any> | null
}

export interface UpdateAuraInput {
  name?: string
  personality?: Record<string, number>
  senses?: string[]
  selectedStudyId?: number | null
  selectedIndividualId?: string | null
}

export class AuraServiceServer {
  /** Fetch all auras for the current user */
  static async getUserAuras(): Promise<Aura[]> {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Not authenticated')

    const { data: rows, error } = await supabase
      .from('auras')
      .select(`*, aura_senses ( sense:senses ( code ) )`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (rows ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      vesselType: r.vessel_type,
      vesselCode: r.vessel_code,
      plantType: r.plant_type,
      personality: r.personality,
      senses: r.aura_senses.map((as: any) => as.sense.code),
      avatar: r.avatar ?? this.getAvatarForVessel(r.vessel_type, r.vessel_code),
      rules: [],
      enabled: r.enabled,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
      selectedStudyId: r.selected_study_id ?? null,
      selectedIndividualId: r.selected_individual_id ?? null,
    }))
  }

  /** Fetch a single aura by ID (only if it belongs to current user) */
  static async getAuraById(id: string): Promise<Aura | null> {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Not authenticated')

    const { data: row, error } = await supabase
      .from('auras')
      .select(`*, aura_senses ( sense:senses ( code ) )`)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !row) return null
    return {
      id: row.id,
      name: row.name,
      vesselType: row.vessel_type,
      vesselCode: row.vessel_code,
      plantType: row.plant_type,
      personality: row.personality,
      senses: row.aura_senses.map((as: any) => as.sense.code),
      avatar: row.avatar ?? this.getAvatarForVessel(row.vessel_type, row.vessel_code),
      rules: [],
      enabled: row.enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      selectedStudyId: row.selected_study_id ?? null,
      selectedIndividualId: row.selected_individual_id ?? null,
    }
  }

  /** Create a new aura (and link its senses) */
  static async createAura(input: CreateAuraServerInput): Promise<Aura> {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Not authenticated')

    // Insert the aura row
    const { data: aura, error: auraError } = await supabase
      .from('auras')
      .insert({
        user_id: user.id,
        name: input.name,
        vessel_type: input.vesselType,
        vessel_code: input.vesselCode || null,
        plant_type: input.plantType || null,
        personality: input.personality,
        communication_style: input.communicationStyle ?? 'balanced',
        voice_profile: input.voiceProfile ?? 'neutral',
        avatar: this.getAvatarForVessel(input.vesselType, input.vesselCode),
        selected_study_id: input.selectedStudyId,
        selected_individual_id: input.selectedIndividualId,
        location_configs: input.locationConfigs || null,
      })
      .select()
      .single()
    if (auraError || !aura) throw auraError

    // Link senses if provided
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
      vesselCode: aura.vessel_code,
      plantType: aura.plant_type,
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

  /** Update an existing aura */
  static async updateAura(id: string, input: UpdateAuraInput): Promise<Aura> {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Not authenticated')

    // Update the aura row
    const updateData: any = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.personality !== undefined) updateData.personality = input.personality
    if (input.selectedStudyId !== undefined) updateData.selected_study_id = input.selectedStudyId
    if (input.selectedIndividualId !== undefined) updateData.selected_individual_id = input.selectedIndividualId

    const { data: aura, error: auraError } = await supabase
      .from('auras')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (auraError || !aura) throw auraError

    // Update senses if provided
    if (input.senses !== undefined) {
      // Delete existing sense connections
      const { error: deleteError } = await supabase
        .from('aura_senses')
        .delete()
        .eq('aura_id', id)
      if (deleteError) throw deleteError

      // Add new sense connections
      if (input.senses.length > 0) {
        const { data: senses, error: sensesError } = await supabase
          .from('senses')
          .select('id, code')
          .in('code', input.senses)
        if (sensesError || !senses) throw sensesError

        const auraSenses = senses.map((s) => ({
          aura_id: id,
          sense_id: s.id,
        }))
        const { error: auraSensesError } = await supabase
          .from('aura_senses')
          .insert(auraSenses)
        if (auraSensesError) throw auraSensesError
      }
    }

    // Re-fetch the complete aura
    return this.getAuraById(id) as Promise<Aura>
  }

  /** Delete an aura (only if it belongs to current user) */
  static async deleteAura(id: string): Promise<void> {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('auras')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
  }

  private static getAvatarForVessel(vesselType: string, vesselCode?: string | null): string {
    // Check for licensed character avatars
    if (vesselCode) {
      const code = vesselCode.toLowerCase()
      if (code.includes('yoda')) return '🧙'
      if (code.includes('gru')) return '🦹'
      if (code.includes('captain-america')) return '🛡️'
      if (code.includes('blue')) return '🦖'
      if (code.includes('triceratops')) return '🦕'
    }
    
    // Default avatars by vessel type
    const avatars: Record<string, string> = {
      terra: '🌱',
      companion: '🐘',
      memory: '💎',
      sage: '📚',
      digital: '🤖',
    }
    return avatars[vesselType] ?? '🤖'
  }
}