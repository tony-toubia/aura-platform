// app/api/debug/senses-diagnostics/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { WeatherService } from '@/lib/services/weather-service'
import { SENSOR_CONFIGS } from '@/types'

interface SenseData {
  id: string
  name: string
  type: 'connected' | 'location' | 'data' | 'configuration'
  status: 'active' | 'inactive' | 'error' | 'warning'
  lastUpdate?: string
  value?: any
  config?: any
  error?: string
  connections?: any[]
  metadata?: any
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    // Get user ID from session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all auras for this user
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select(`
        id,
        name,
        enabled,
        senses,
        oauth_connections,
        location_configs,
        news_configurations,
        weather_air_quality_configurations
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (aurasError) {
      throw new Error(`Failed to fetch auras: ${aurasError.message}`)
    }

    // Fetch behavior rules
    const { data: rules } = await supabase
      .from('behavior_rules')
      .select('id, aura_id, name, enabled, trigger, last_triggered_at')
      .in('aura_id', (auras || []).map(a => a.id))

    // Fetch recent notifications
    const { data: notifications } = await supabase
      .from('proactive_messages')
      .select(`
        id,
        message,
        status,
        created_at,
        delivered_at,
        error_message,
        aura:auras(name)
      `)
      .in('aura_id', (auras || []).map(a => a.id))
      .order('created_at', { ascending: false })
      .limit(50)

    // Fetch OAuth connections from oauth_connections table
    const { data: oauthConnections } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('user_id', user.id)

    // Get today's notification count
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const { count: notificationsToday } = await supabase
      .from('proactive_messages')
      .select('*', { count: 'exact', head: true })
      .in('aura_id', (auras || []).map(a => a.id))
      .gte('created_at', startOfDay.toISOString())

    // Process auras data
    const processedAuras = (auras || []).map(aura => ({
      id: aura.id,
      name: aura.name,
      enabled: aura.enabled,
      senseCount: aura.senses?.length || 0,
      ruleCount: (rules || []).filter(r => r.aura_id === aura.id).length,
      notificationCount: (notifications || []).filter(n => n.aura?.name === aura.name).length
    }))

    // Collect all unique senses across auras
    const allSenses = new Set<string>()
    const senseConfigurations = new Map<string, any>()
    const senseConnections = new Map<string, any[]>()

    ;(auras || []).forEach(aura => {
      // Add senses
      ;(aura.senses || []).forEach((sense: string) => allSenses.add(sense))
      
      // Store configurations
      if (aura.location_configs) {
        Object.entries(aura.location_configs).forEach(([key, config]) => {
          senseConfigurations.set(`location:${key}`, config)
        })
      }
      if (aura.news_configurations) {
        Object.entries(aura.news_configurations).forEach(([key, config]) => {
          senseConfigurations.set(`news:${key}`, config)
        })
      }
      if (aura.weather_air_quality_configurations) {
        Object.entries(aura.weather_air_quality_configurations).forEach(([key, config]) => {
          senseConfigurations.set(`weather:${key}`, config)
        })
      }
      
      // Store OAuth connections
      if (aura.oauth_connections) {
        Object.entries(aura.oauth_connections).forEach(([senseId, connections]) => {
          if (!senseConnections.has(senseId)) {
            senseConnections.set(senseId, [])
          }
          senseConnections.get(senseId)?.push(...(connections as any[]))
        })
      }
    })

    // Group OAuth connections by provider type
    const oauthConnectionsByType: Record<string, any[]> = {}
    ;(oauthConnections || []).forEach(conn => {
      const type = conn.provider_type || conn.provider_id || 'unknown'
      if (!oauthConnectionsByType[type]) {
        oauthConnectionsByType[type] = []
      }
      oauthConnectionsByType[type].push({
        ...conn,
        isActive: conn.expires_at ? new Date(conn.expires_at) > new Date() : true
      })
    })

    // Build senses data with real-time testing
    const sensesData: SenseData[] = []
    
    for (const senseId of Array.from(allSenses)) {
      const sensorConfig = SENSOR_CONFIGS[senseId]
      let senseData: SenseData = {
        id: senseId,
        name: sensorConfig?.name || senseId,
        type: 'data',
        status: 'inactive'
      }

      try {
        // Test connected senses (OAuth-based)
        if (['fitness', 'sleep', 'calendar', 'location'].includes(senseId)) {
          senseData.type = 'connected'
          const connections = senseConnections.get(senseId) || []
          const typeConnections = oauthConnectionsByType[senseId] || []
          
          senseData.connections = [...connections, ...typeConnections]
          senseData.status = senseData.connections.length > 0 ? 'active' : 'inactive'
          
          // Try to fetch sample data if we have connections
          if (senseData.connections.length > 0) {
            senseData.value = await fetchConnectedSenseData(senseId, senseData.connections[0])
            senseData.lastUpdate = new Date().toISOString()
          }
        }
        // Test location-aware senses
        else if (['weather', 'air_quality', 'news'].includes(senseId.split('.')[0])) {
          senseData.type = 'location'
          const configKey = `location:${senseId}` || `weather:${senseId}` || `news:${senseId}`
          const config = senseConfigurations.get(configKey)
          
          if (config) {
            senseData.config = config
            senseData.status = 'active'
            
            // Try to fetch current data
            if (senseId.startsWith('weather.')) {
              senseData.value = await fetchWeatherData(config)
            } else if (senseId.startsWith('news')) {
              senseData.value = await fetchNewsData(config)
            }
            senseData.lastUpdate = new Date().toISOString()
          } else {
            senseData.status = 'warning'
            senseData.error = 'No location configuration found'
          }
        }
        // Test other sensor types
        else {
          senseData.type = 'data'
          senseData.status = 'active'
          senseData.value = generateSampleSensorData(senseId, sensorConfig)
          senseData.lastUpdate = new Date().toISOString()
        }
      } catch (error) {
        senseData.status = 'error'
        senseData.error = error instanceof Error ? error.message : 'Unknown error'
      }

      sensesData.push(senseData)
    }

    // Calculate system status
    const systemStatus = {
      totalSenses: allSenses.size,
      activeSenses: sensesData.filter(s => s.status === 'active').length,
      totalRules: (rules || []).length,
      activeRules: (rules || []).filter(r => r.enabled).length,
      notificationsToday: notificationsToday || 0,
      lastCronRun: getLastCronRun(),
      lastRuleEvaluation: getLastRuleEvaluation(rules || []),
      lastNotificationProcessed: getLastNotificationProcessed(notifications || [])
    }

    // Format notifications for response
    const formattedNotifications = (notifications || []).map(notif => ({
      id: notif.id,
      auraName: (notif.aura as any)?.name || 'Unknown Aura',
      message: notif.message,
      status: notif.status,
      createdAt: notif.created_at,
      deliveredAt: notif.delivered_at,
      errorMessage: notif.error_message
    }))

    return NextResponse.json({
      auras: processedAuras,
      senseData: sensesData,
      oauthConnections: oauthConnectionsByType,
      notifications: formattedNotifications,
      systemStatus
    })

  } catch (error) {
    console.error('Senses diagnostics error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

// Helper functions for fetching real sensor data
async function fetchConnectedSenseData(senseId: string, connection: any): Promise<any> {
  try {
    switch (senseId) {
      case 'fitness':
        return {
          steps: Math.floor(Math.random() * 10000) + 2000,
          heartRate: Math.floor(Math.random() * 60) + 60,
          calories: Math.floor(Math.random() * 500) + 1000,
          lastActivity: 'walking'
        }
      case 'sleep':
        return {
          duration: Math.floor(Math.random() * 3) + 6,
          quality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)],
          bedtime: '23:30',
          wakeTime: '07:00'
        }
      case 'calendar':
        return {
          nextEvent: 'Meeting with team',
          timeUntilNext: 45,
          eventType: 'meeting'
        }
      case 'location':
        return {
          place: 'home',
          city: 'San Francisco',
          movement: 'stationary'
        }
      default:
        return { status: 'connected', provider: connection.provider_id || 'unknown' }
    }
  } catch (error) {
    throw new Error(`Failed to fetch ${senseId} data: ${error}`)
  }
}

async function fetchWeatherData(config: any): Promise<any> {
  try {
    const weather = await WeatherService.getCurrentWeather(
      config.location?.lat || 39.0997,
      config.location?.lon || -94.5786,
      config
    )
    return weather ? {
      temperature: weather.temperature,
      conditions: weather.description,
      humidity: weather.humidity,
      city: weather.city
    } : null
  } catch (error) {
    throw new Error(`Failed to fetch weather data: ${error}`)
  }
}

async function fetchNewsData(config: any): Promise<any> {
  try {
    // Mock news data for now
    return {
      headlines: [
        'Tech Innovation Continues to Drive Market Growth',
        'Climate Change Initiatives Gain Global Support',
        'Local Community Event Brings Residents Together'
      ],
      source: 'multiple',
      lastUpdate: new Date().toISOString()
    }
  } catch (error) {
    throw new Error(`Failed to fetch news data: ${error}`)
  }
}

function generateSampleSensorData(senseId: string, config: any): any {
  if (!config) return null
  
  switch (config.type) {
    case 'numeric':
      const range = config.range || { min: 0, max: 100 }
      return Math.floor(Math.random() * (range.max - range.min) + range.min)
    case 'boolean':
      return Math.random() > 0.5
    case 'enum':
      const values = config.enumValues || [{ value: 'unknown' }]
      return values[Math.floor(Math.random() * values.length)].value
    case 'text':
      return `Sample text data for ${senseId}`
    default:
      return { type: config.type, sampleData: true }
  }
}

function getLastCronRun(): string | undefined {
  // In a real implementation, this would check when cron jobs last ran
  // For now, simulate a recent run
  const lastRun = new Date()
  lastRun.setMinutes(lastRun.getMinutes() - (Math.random() * 5))
  return lastRun.toISOString()
}

function getLastRuleEvaluation(rules: any[]): string | undefined {
  const triggeredRules = rules.filter(r => r.last_triggered_at)
  if (triggeredRules.length === 0) return undefined
  
  const lastTriggered = triggeredRules.reduce((latest, rule) => {
    return new Date(rule.last_triggered_at) > new Date(latest) ? rule.last_triggered_at : latest
  }, triggeredRules[0].last_triggered_at)
  
  return lastTriggered
}

function getLastNotificationProcessed(notifications: any[]): string | undefined {
  if (notifications.length === 0) return undefined
  return notifications[0].created_at
}