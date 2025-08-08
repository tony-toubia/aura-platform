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

  // Fetch OAuth connections for this specific aura ONLY (excluding device_location)
  const { data: oauthConnections, error: oauthError } = await supabase
    .from("oauth_connections")
    .select("*")
    .eq("user_id", user.id)
    .eq("aura_id", auraId)
    .neq("provider", "device_location")

  // Fetch device_location connections separately (they can be library connections)
  const { data: deviceLocationConnections, error: deviceLocationError } = await supabase
    .from("oauth_connections")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "device_location")

  // Log OAuth query results for debugging
  console.log('🔍 OAuth connections query result:', {
    auraId,
    userId: user.id,
    connectionsFound: oauthConnections?.length || 0,
    connections: oauthConnections,
    oauthError,
    deviceLocationConnectionsFound: deviceLocationConnections?.length || 0,
    deviceLocationConnections,
    deviceLocationError
  })

  if (oauthError) {
    console.error('❌ Error fetching OAuth connections:', oauthError)
  }

  if (deviceLocationError) {
    console.error('❌ Error fetching device location connections:', deviceLocationError)
  }

  if (error || !auraRow) {
    // couldn't load it
    redirect("/auras")
  }

  // 4) Map the raw row into our TAura shape (OAuth connections will be added later)
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

  // Extract location configs from both sources (auras table and aura_senses config)
  const extractLocationConfigs = (auraRow: any): Record<string, any> => {
    const configs: Record<string, any> = {}
    
    // First, get configs from auras.location_configs
    if (auraRow.location_configs) {
      Object.assign(configs, auraRow.location_configs)
    }
    
    // Then, get configs from aura_senses config (which may override)
    if (auraRow.aura_senses) {
      auraRow.aura_senses.forEach((auraSense: any) => {
        const senseCode = auraSense.sense.code
        const config = auraSense.config || {}
        
        if (config.location) {
          configs[senseCode] = config.location
        }
      })
    }
    
    console.log('🔍 Extracted location configs:', configs)
    return configs
  }

  const locationConfigs = extractLocationConfigs(auraRow)
  
  // Transform OAuth connections from the oauth_connections table
  const transformOAuthConnections = (oauthConns: any[], deviceLocationConns: any[]): Record<string, any[]> => {
    console.log('🔄 Transforming OAuth connections:', {
      inputConnections: oauthConns,
      count: oauthConns?.length || 0,
      deviceLocationConnections: deviceLocationConns,
      deviceLocationCount: deviceLocationConns?.length || 0
    })
    
    const connections: Record<string, any[]> = {}
    
    // Helper function to get user-friendly provider names
    const getProviderDisplayName = (provider: string): string => {
      const providerNames: Record<string, string> = {
        'google': 'Google',
        'google-fit': 'Google Fit',
        'google_fit': 'Google Fit', // Handle underscore version from database
        'fitbit': 'Fitbit',
        'apple-health': 'Apple Health',
        'apple_health': 'Apple Health', // Handle underscore version from database
        'strava': 'Strava',
        'microsoft': 'Microsoft',
      }
      return providerNames[provider] || provider.charAt(0).toUpperCase() + provider.slice(1).replace(/_/g, ' ')
    }
    
    if (!oauthConns || oauthConns.length === 0) {
      console.log('⚠️ No OAuth connections to transform')
      return connections
    }
    
    oauthConns.forEach((conn, index) => {
      console.log(`🔄 Processing connection ${index + 1}:`, {
        id: conn.id,
        provider: conn.provider,
        sense_type: conn.sense_type,
        aura_id: conn.aura_id,
        user_id: conn.user_id
      })
      
      const senseType = conn.sense_type
      
      if (!connections[senseType]) {
        connections[senseType] = []
      }
      
      const transformedConnection = {
        id: conn.id,
        name: getProviderDisplayName(conn.provider),
        type: senseType,
        connectedAt: conn.created_at ? new Date(conn.created_at) : new Date(),
        providerId: conn.provider,
        accountEmail: conn.provider_user_id || `Connected ${getProviderDisplayName(conn.provider)} account`,
        // Don't expose sensitive tokens to frontend
        expiresAt: conn.expires_at ? new Date(conn.expires_at) : null,
        scope: conn.scope,
      }
      
      connections[senseType].push(transformedConnection)
      console.log(`✅ Added connection to ${senseType}:`, transformedConnection)
    })

    // Process device_location connections and check if this aura is associated with them
    if (deviceLocationConns && deviceLocationConns.length > 0) {
      console.log('🔄 Processing device_location connections for location sense')
      
      for (const conn of deviceLocationConns) {
        let isAssociated = false
        
        if (conn.aura_id === auraId) {
          // Direct connection to this aura
          isAssociated = true
        } else if (!conn.aura_id) {
          // Library connection - check if this aura is associated via aura_oauth_connections
          // We'll need to fetch this association
          // For now, we'll include all device_location connections for the location sense
          // This matches the behavior in the location-info API endpoint
          isAssociated = true
        }
        
        if (isAssociated) {
          if (!connections['location']) {
            connections['location'] = []
          }
          
          const transformedConnection = {
            id: conn.id,
            name: 'Device Location',
            type: 'location',
            connectedAt: conn.created_at ? new Date(conn.created_at) : new Date(),
            providerId: 'device_location',
            accountEmail: conn.provider_user_id || 'Device Location Service',
            deviceInfo: conn.device_info,
            expiresAt: conn.expires_at ? new Date(conn.expires_at) : null,
            scope: conn.scope,
          }
          
          connections['location'].push(transformedConnection)
          console.log(`✅ Added device_location connection to location sense:`, transformedConnection)
        }
      }
    }
    
    console.log('🔄 Final transformed connections:', connections)
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

  // Extract weather/air quality configurations from aura senses
  const extractWeatherAirQualityConfigurations = (auraSenses: any[]): Record<string, any[]> => {
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

  const oauthConnectionsData = transformOAuthConnections(oauthConnections || [], deviceLocationConnections || [])
  const newsConfigurations = extractNewsConfigurations(auraRow.aura_senses || [])
  const weatherAirQualityConfigurations = extractWeatherAirQualityConfigurations(auraRow.aura_senses || [])
  
  // Create virtual device location connections for senses that have device location configured
  // This ensures the UI shows device location properly when editing
  const createVirtualDeviceConnections = () => {
    const hasDeviceLocation = (configs: any[]): boolean => {
      return configs.some(config => config.type === 'device')
    }
    
    // Check if any sense has device location configured
    const needsVirtualConnection =
      (newsConfigurations.news && hasDeviceLocation(newsConfigurations.news)) ||
      (weatherAirQualityConfigurations.weather && hasDeviceLocation(weatherAirQualityConfigurations.weather)) ||
      (weatherAirQualityConfigurations.air_quality && hasDeviceLocation(weatherAirQualityConfigurations.air_quality))
    
    // If device location is used but no actual device connections exist, create a virtual one
    if (needsVirtualConnection && (!oauthConnectionsData.location || oauthConnectionsData.location.length === 0)) {
      console.log('🔄 Creating virtual device location connection for UI display')
      oauthConnectionsData.location = [{
        id: 'virtual-device-location',
        name: 'Device Location',
        type: 'location',
        connectedAt: new Date(),
        providerId: 'device_location',
        accountEmail: 'Current Device',
        deviceInfo: {
          browser: 'Browser',
          os: 'Device',
          platform: 'Web',
          language: 'en',
          screenInfo: 'Unknown',
          userAgent: 'Unknown'
        }
      }]
    }
  }
  
  createVirtualDeviceConnections()
  
  // Add OAuth connections to the initialAura object
  initialAura.oauthConnections = oauthConnectionsData
  
  console.log('🔍 Loaded aura data:', {
    id: auraRow.id,
    name: auraRow.name,
    location_configs: auraRow.location_configs,
    oauth_connections_raw: oauthConnections,
    oauth_connections_transformed: oauthConnectionsData,
    news_configurations: newsConfigurations,
    weather_air_quality_configurations: weatherAirQualityConfigurations,
    senses: auraRow.aura_senses?.map((as: any) => ({ code: as.sense.code, config: as.config }))
  })

  return (
    <div className="container py-0">
      <AuraEditForm
        initialAura={initialAura}
        initialLocationConfigs={locationConfigs}
        initialOAuthConnections={oauthConnectionsData}
        initialNewsConfigurations={newsConfigurations}
        initialWeatherAirQualityConfigurations={weatherAirQualityConfigurations}
      />
    </div>
  )
}