// apps/web/lib/services/aura-service.server.ts
import { createServerSupabase } from '@/lib/supabase/server.server'
import type { Aura } from '@/types'

// Global lock to prevent concurrent aura creation
const creationLocks = new Set<string>()

export interface CreateAuraServerInput {
  name: string
  vesselType: 'digital' | 'terra' | 'companion' | 'memory' | 'sage'
  vesselCode?: string
  plantType?: string
  personality: any // Allow full personality object with all fields
  senses: string[]
  communicationStyle?: string
  voiceProfile?: string
  selectedStudyId?: number | null
  selectedIndividualId?: string | null
  locationConfigs?: Record<string, any> | null
  oauthConnections?: Record<string, any[]> | null
  newsConfigurations?: Record<string, any[]> | null
  weatherAirQualityConfigurations?: Record<string, any[]> | null
}

export interface UpdateAuraInput {
  name?: string
  personality?: Record<string, number>
  senses?: string[]
  selectedStudyId?: number | null
  selectedIndividualId?: string | null
  oauthConnections?: Record<string, any[]> | null
  newsConfigurations?: Record<string, any[]> | null
  weatherAirQualityConfigurations?: Record<string, any[]> | null
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
      .select(`*, aura_senses ( sense:senses ( code ), config ), behavior_rules ( * )`)
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
      rules: (r.behavior_rules || []).map((rule: any) => ({
        id: rule.id,
        name: rule.name,
        trigger: rule.trigger,
        action: rule.action,
        priority: rule.priority,
        enabled: rule.enabled,
        createdAt: rule.created_at ? new Date(rule.created_at) : undefined,
        updatedAt: rule.updated_at ? new Date(rule.updated_at) : undefined,
      })),
      enabled: r.enabled,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
      selectedStudyId: r.selected_study_id ?? null,
      selectedIndividualId: r.selected_individual_id ?? null,
      // Extract OAuth connections and configurations from sense configs
      oauthConnections: this.extractOAuthConnections(r.aura_senses),
      newsConfigurations: this.extractNewsConfigurations(r.aura_senses),
      weatherAirQualityConfigurations: this.extractWeatherAirQualityConfigurations(r.aura_senses),
      locationConfigs: this.extractLocationConfigs(r.aura_senses),
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
      .select(`*, aura_senses ( sense:senses ( code ), config ), behavior_rules ( * )`)
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
      rules: (row.behavior_rules || []).map((rule: any) => ({
        id: rule.id,
        name: rule.name,
        trigger: rule.trigger,
        action: rule.action,
        priority: rule.priority,
        enabled: rule.enabled,
        createdAt: rule.created_at ? new Date(rule.created_at) : undefined,
        updatedAt: rule.updated_at ? new Date(rule.updated_at) : undefined,
      })),
      enabled: row.enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      selectedStudyId: row.selected_study_id ?? null,
      selectedIndividualId: row.selected_individual_id ?? null,
      // Extract OAuth connections and configurations from sense configs
      oauthConnections: this.extractOAuthConnections(row.aura_senses),
      newsConfigurations: this.extractNewsConfigurations(row.aura_senses),
      weatherAirQualityConfigurations: this.extractWeatherAirQualityConfigurations(row.aura_senses),
      locationConfigs: this.extractLocationConfigs(row.aura_senses),
    }
  }

  /** Create a new aura (and link its senses) */
  static async createAura(input: CreateAuraServerInput): Promise<Aura> {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] AuraServiceServer.createAura called for: "${input.name}"`)
    
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Not authenticated')

    // Create a unique lock key for this user + aura name
    const lockKey = `${user.id}:${input.name}`
    
    if (creationLocks.has(lockKey)) {
      console.warn(`[${timestamp}] Aura creation already in progress for: "${input.name}" (user: ${user.id})`)
      throw new Error(`Aura creation already in progress for "${input.name}"`)
    }
    
    creationLocks.add(lockKey)
    console.log(`[${timestamp}] Added creation lock for: ${lockKey}`)
    
    try {

    console.log(`[${timestamp}] Inserting aura "${input.name}" into database for user: ${user.id}`)

    // Check if aura with same name already exists for this user
    const { data: existingAura } = await supabase
      .from('auras')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('name', input.name)
      .single()
    
    if (existingAura) {
      console.warn(`[${timestamp}] Aura "${input.name}" already exists for user ${user.id}, returning existing aura`)
      throw new Error(`An aura named "${input.name}" already exists`)
    }

    // Insert the aura row
    const insertData = {
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
    }
    
    console.log(`[${timestamp}] About to insert aura data:`, insertData)
    
    const { data: aura, error: auraError } = await supabase
      .from('auras')
      .insert(insertData)
      .select()
      .single()
    
    if (auraError || !aura) {
      console.error(`[${timestamp}] Failed to create aura "${input.name}":`, auraError)
      throw auraError
    }
    
    console.log(`[${timestamp}] Successfully created aura "${input.name}" with ID: ${aura.id}`)

    // Link senses if provided
    if (input.senses.length) {
      const { data: senses, error: sensesError } = await supabase
        .from('senses')
        .select('id, code')
        .in('code', input.senses)
      if (sensesError || !senses) throw sensesError

      const auraSenses = senses.map((s) => {
        // Build config object for this sense
        const config: any = {}
        
        // Add location config if available
        if (input.locationConfigs && input.locationConfigs[s.code]) {
          config.location = input.locationConfigs[s.code]
        }
        
        // Add OAuth connections if available
        if (input.oauthConnections && input.oauthConnections[s.code]) {
          config.oauthConnections = input.oauthConnections[s.code]
        }
        
        // Add news configurations if available
        if (input.newsConfigurations && input.newsConfigurations[s.code]) {
          config.newsConfigurations = input.newsConfigurations[s.code]
        }
        
        // Add weather/air quality configurations if available
        if (input.weatherAirQualityConfigurations && input.weatherAirQualityConfigurations[s.code]) {
          config.weatherAirQualityConfigurations = input.weatherAirQualityConfigurations[s.code]
        }

        return {
          aura_id: aura.id,
          sense_id: s.id,
          config: Object.keys(config).length > 0 ? config : {},
        }
      })
      
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
    
    } finally {
      // Always clean up the lock
      creationLocks.delete(lockKey)
      console.log(`[${timestamp}] Removed creation lock for: ${lockKey}`)
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

        const auraSenses = senses.map((s) => {
          // Build config object for this sense
          const config: any = {}
          
          // Add OAuth connections if available
          if (input.oauthConnections && input.oauthConnections[s.code]) {
            config.oauthConnections = input.oauthConnections[s.code]
          }
          
          // Add news configurations if available
          if (input.newsConfigurations && input.newsConfigurations[s.code]) {
            config.newsConfigurations = input.newsConfigurations[s.code]
          }
          
          // Add weather/air quality configurations if available
          if (input.weatherAirQualityConfigurations && input.weatherAirQualityConfigurations[s.code]) {
            config.weatherAirQualityConfigurations = input.weatherAirQualityConfigurations[s.code]
          }

          return {
            aura_id: id,
            sense_id: s.id,
            config: Object.keys(config).length > 0 ? config : {},
          }
        })
        
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

  /** Extract OAuth connections from aura senses */
  private static extractOAuthConnections(auraSenses: any[]): Record<string, any[]> {
    const connections: Record<string, any[]> = {}
    
    auraSenses.forEach((auraSense) => {
      const senseCode = auraSense.sense.code
      const config = auraSense.config || {}
      
      if (config.oauthConnections && Array.isArray(config.oauthConnections)) {
        connections[senseCode] = config.oauthConnections
      }
    })
    
    return connections
  }

  /** Extract news configurations from aura senses */
  private static extractNewsConfigurations(auraSenses: any[]): Record<string, any[]> {
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

  /** Extract location configurations from aura senses */
  private static extractLocationConfigs(auraSenses: any[]): Record<string, any> {
    const configurations: Record<string, any> = {}
    
    auraSenses.forEach((auraSense) => {
      const senseCode = auraSense.sense.code
      const config = auraSense.config || {}
      
      if (config.location) {
        configurations[senseCode] = config.location
      }
    })
    
    return configurations
  }

  /** Extract weather/air quality configurations from aura senses */
  private static extractWeatherAirQualityConfigurations(auraSenses: any[]): Record<string, any[]> {
    const configurations: Record<string, any[]> = {}
    
    auraSenses.forEach((auraSense) => {
      const senseCode = auraSense.sense.code
      const config = auraSense.config || {}
      
      if (config.weatherAirQualityConfigurations && Array.isArray(config.weatherAirQualityConfigurations)) {
        configurations[senseCode] = config.weatherAirQualityConfigurations
      }
    })
    
    return configurations
  }
}