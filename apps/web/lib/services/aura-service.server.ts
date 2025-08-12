// apps/web/lib/services/aura-service.server.ts
import { createServerSupabase } from '@/lib/supabase/server.server'
import type { Aura } from '@/types'
import { CacheInvalidation } from '@/lib/redis'
import { CachedSubscriptionService } from './subscription-service-cached'

export interface CreateAuraServerInput {
  name: string
  vesselType: 'digital' | 'terra' | 'companion' | 'memory' | 'sage'
  vesselCode?: string
  plantType?: string
  personality: any // Allow full personality object with all fields
  senses: string[]
  rules?: any[] // Behavior rules
  communicationStyle?: string
  voiceProfile?: string
  selectedStudyId?: number | null
  selectedIndividualId?: string | null
  enabled?: boolean // Whether the aura is active/inactive
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
  enabled?: boolean // Whether the aura is active/inactive
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

    // Also fetch OAuth connections for each aura
    const { data: oauthConnections, error: oauthError } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error
    if (oauthError) throw oauthError
    
    return (rows ?? []).map((r) => {
      // Get OAuth connections for this specific aura
      const auraOAuthConnections = (oauthConnections || []).filter(conn => conn.aura_id === r.id)
      
      // Group OAuth connections by sense type
      const groupedOAuthConnections: Record<string, any[]> = {}
      auraOAuthConnections.forEach(conn => {
        if (!groupedOAuthConnections[conn.sense_type]) {
          groupedOAuthConnections[conn.sense_type] = []
        }
        groupedOAuthConnections[conn.sense_type]!.push({
          id: conn.id,
          name: conn.provider,
          type: conn.sense_type,
          connectedAt: new Date(conn.created_at),
          providerId: conn.provider,
          accountEmail: conn.provider_user_id,
        })
      })

      // Merge OAuth connections from aura_senses config and oauth_connections table
      const configOAuthConnections = this.extractOAuthConnections(r.aura_senses)
      const mergedOAuthConnections = { ...configOAuthConnections, ...groupedOAuthConnections }

      return {
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
        // Use merged OAuth connections from both sources
        oauthConnections: mergedOAuthConnections,
        newsConfigurations: this.extractNewsConfigurations(r.aura_senses),
        weatherAirQualityConfigurations: this.extractWeatherAirQualityConfigurations(r.aura_senses),
        locationConfigs: this.extractLocationConfigs(r.aura_senses),
      }
    })
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

    // Also fetch OAuth connections for this specific aura
    const { data: oauthConnections, error: oauthError } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('aura_id', id)

    if (error || !row) return null
    if (oauthError) throw oauthError

    // Group OAuth connections by sense type
    const groupedOAuthConnections: Record<string, any[]> = {}
    ;(oauthConnections || []).forEach(conn => {
      if (!groupedOAuthConnections[conn.sense_type]) {
        groupedOAuthConnections[conn.sense_type] = []
      }
      groupedOAuthConnections[conn.sense_type]!.push({
        id: conn.id,
        name: conn.provider,
        type: conn.sense_type,
        connectedAt: new Date(conn.created_at),
        providerId: conn.provider,
        accountEmail: conn.provider_user_id,
      })
    })

    // Merge OAuth connections from aura_senses config and oauth_connections table
    const configOAuthConnections = this.extractOAuthConnections(row.aura_senses)
    const mergedOAuthConnections = { ...configOAuthConnections, ...groupedOAuthConnections }

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
      // Use merged OAuth connections from both sources
      oauthConnections: mergedOAuthConnections,
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

    // Note: Distributed locking is now handled at the API route level
    // using Redis DistributedLock instead of in-memory locks
    
    console.log(`[${timestamp}] Starting aura creation process for "${input.name}"`)
    console.log(`[${timestamp}] Input data:`, {
      name: input.name,
      vesselType: input.vesselType,
      vesselCode: input.vesselCode,
      sensesCount: input.senses?.length || 0,
      rulesCount: input.rules?.length || 0,
      hasPersonality: !!input.personality,
      hasLocationConfigs: !!input.locationConfigs,
      enabled: input.enabled
    })

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
      enabled: input.enabled ?? true, // Default to true if not specified
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
      console.error(`[${timestamp}] Insert data was:`, insertData)
      console.error(`[${timestamp}] Supabase error details:`, {
        message: auraError?.message,
        details: auraError?.details,
        hint: auraError?.hint,
        code: auraError?.code
      })
      throw new Error(`Database error: ${auraError?.message || 'Unknown error'}`)
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

    // Create behavior rules if provided
    if (input.rules && input.rules.length > 0) {
      console.log(`[${timestamp}] Creating ${input.rules.length} behavior rules for aura: ${aura.id}`)
      
      const behaviorRules = input.rules
        .filter((rule: any) => rule.name && rule.name.trim()) // Only include rules with names
        .map((rule: any) => ({
          aura_id: aura.id,
          name: rule.name,
          description: rule.description || '',
          trigger_type: rule.triggerType || 'always',
          trigger_config: rule.triggerConfig || {},
          action_type: rule.actionType || 'respond',
          action_config: rule.actionConfig || {},
          priority: rule.priority || 1,
          enabled: rule.enabled !== false, // Default to true
        }))
      
      if (behaviorRules.length > 0) {
        const { error: rulesError } = await supabase
          .from('behavior_rules')
          .insert(behaviorRules)
        if (rulesError) {
          console.error(`[${timestamp}] Failed to create behavior rules:`, rulesError)
          throw rulesError
        }
        console.log(`[${timestamp}] Successfully created ${behaviorRules.length} behavior rules`)
      }
    }

    // Invalidate user's aura count cache after successful creation
    await CachedSubscriptionService.onAuraChange(user.id)
    console.log(`[${timestamp}] Invalidated aura count cache for user: ${user.id}`)

    return {
      id: aura.id,
      name: aura.name,
      vesselType: aura.vessel_type,
      vesselCode: aura.vessel_code,
      plantType: aura.plant_type,
      personality: aura.personality,
      senses: input.senses,
      avatar: aura.avatar!,
      rules: (input.rules || []).filter((rule: any) => rule.name && rule.name.trim()),
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
    if (input.enabled !== undefined) updateData.enabled = input.enabled

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
    
    // Invalidate caches after deletion
    await CacheInvalidation.invalidateAura(id)
    await CachedSubscriptionService.onAuraChange(user.id)
    console.log(`Invalidated caches after deleting aura: ${id}`)
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