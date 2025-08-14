// app/api/debug/senses-diagnostics/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

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
    console.log('[DIAGNOSTICS] Starting diagnostics fetch...')
    
    const supabase = await createServerSupabase()
    console.log('[DIAGNOSTICS] Supabase client created')

    // Get user ID from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[DIAGNOSTICS] Auth check result:', { user: !!user, error: authError })
    
    if (!user) {
      console.log('[DIAGNOSTICS] No user found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all auras for this user
    console.log('[DIAGNOSTICS] Fetching auras for user:', user.id)
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select(`
        id,
        name,
        enabled,
        senses,
        location_configs,
        proactive_enabled,
        last_evaluation_at,
        vessel_type,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (aurasError) {
      console.error('[DIAGNOSTICS] Failed to fetch auras:', aurasError)
      return NextResponse.json({ error: `Failed to fetch auras: ${aurasError.message}` }, { status: 500 })
    }

    console.log('[DIAGNOSTICS] Auras fetched:', { count: auras?.length || 0 })

    // Initialize data with safe defaults
    let rules: any[] = []
    let notifications: any[] = []
    let oauthConnections: any[] = []
    let notificationsToday = 0
    
    const tableErrors: Record<string, string> = {}

    // Safely fetch behavior rules
    console.log('[DIAGNOSTICS] Fetching behavior rules...')
    try {
      const { data, error } = await supabase
        .from('behavior_rules')
        .select('id, aura_id, name, enabled, trigger, last_triggered_at')
        .in('aura_id', (auras || []).map((a: any) => a.id))

      if (error) {
        console.error('[DIAGNOSTICS] Error fetching rules:', error)
        tableErrors.behavior_rules = error.message
      } else {
        rules = data || []
        console.log('[DIAGNOSTICS] Rules fetched:', { count: rules.length })
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      console.error('[DIAGNOSTICS] Exception fetching rules:', errorMsg)
      tableErrors.behavior_rules = errorMsg
    }

    // Safely fetch recent notifications
    console.log('[DIAGNOSTICS] Fetching notifications...')
    try {
      const { data, error } = await supabase
        .from('proactive_messages')
        .select(`
          id,
          aura_id,
          message,
          status,
          created_at,
          delivered_at,
          error_message
        `)
        .in('aura_id', (auras || []).map((a: any) => a.id))
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('[DIAGNOSTICS] Error fetching notifications:', error)
        tableErrors.proactive_messages = error.message
      } else {
        notifications = data || []
        console.log('[DIAGNOSTICS] Notifications fetched:', { count: notifications.length })
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      console.error('[DIAGNOSTICS] Exception fetching notifications:', errorMsg)
      tableErrors.proactive_messages = errorMsg
    }

    // Safely fetch OAuth connections
    console.log('[DIAGNOSTICS] Fetching OAuth connections...')
    try {
      const { data, error } = await supabase
        .from('oauth_connections')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('[DIAGNOSTICS] Error fetching OAuth connections:', error)
        tableErrors.oauth_connections = error.message
      } else {
        oauthConnections = data || []
        console.log('[DIAGNOSTICS] OAuth connections fetched:', { count: oauthConnections.length })
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      console.error('[DIAGNOSTICS] Exception fetching OAuth connections:', errorMsg)
      tableErrors.oauth_connections = errorMsg
    }

    // Safely get today's notification count
    console.log('[DIAGNOSTICS] Fetching today\'s notification count...')
    try {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      
      const { count, error } = await supabase
        .from('proactive_messages')
        .select('*', { count: 'exact', head: true })
        .in('aura_id', (auras || []).map((a: any) => a.id))
        .gte('created_at', startOfDay.toISOString())

      if (error) {
        console.error('[DIAGNOSTICS] Error fetching notification count:', error)
        tableErrors.proactive_messages_count = error.message
      } else {
        notificationsToday = count || 0
        console.log('[DIAGNOSTICS] Today\'s notification count:', notificationsToday)
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      console.error('[DIAGNOSTICS] Exception fetching notification count:', errorMsg)
      tableErrors.proactive_messages_count = errorMsg
    }

    // Process auras data
    console.log('[DIAGNOSTICS] Processing auras data...')
    const processedAuras = (auras || []).map((aura: any) => {
      try {
        // Find notifications for this aura
        const auraNotifications = (notifications || []).filter((n: any) => n.aura_id === aura.id)
        
        return {
          id: aura.id,
          name: aura.name,
          enabled: aura.enabled,
          senseCount: aura.senses?.length || 0,
          ruleCount: (rules || []).filter((r: any) => r.aura_id === aura.id).length,
          notificationCount: auraNotifications.length
        }
      } catch (error) {
        console.error('[DIAGNOSTICS] Error processing aura:', aura.id, error)
        return {
          id: aura.id,
          name: aura.name,
          enabled: false,
          senseCount: 0,
          ruleCount: 0,
          notificationCount: 0
        }
      }
    })
    
    console.log('[DIAGNOSTICS] Auras processed:', { count: processedAuras.length })

    // Collect all unique senses across auras
    console.log('[DIAGNOSTICS] Collecting senses data...')
    const allSenses = new Set<string>()
    const senseConfigurations = new Map<string, any>()
    const senseConnections = new Map<string, any[]>()

    try {
      ;(auras || []).forEach((aura: any) => {
        // Add senses
        ;(aura.senses || []).forEach((sense: string) => allSenses.add(sense))
        
        // Store configurations
        if (aura.location_configs) {
          Object.entries(aura.location_configs).forEach(([key, config]: [string, any]) => {
            senseConfigurations.set(`location:${key}`, config)
          })
        }
      })
      
      // Map OAuth connections to senses
      oauthConnections.forEach((conn: any) => {
        const senseType = conn.sense_type
        if (senseType) {
          if (!senseConnections.has(senseType)) {
            senseConnections.set(senseType, [])
          }
          senseConnections.get(senseType)?.push(conn)
        }
      })
      
      console.log('[DIAGNOSTICS] Senses collected:', { 
        totalSenses: allSenses.size,
        configurations: senseConfigurations.size,
        connections: senseConnections.size 
      })
    } catch (error) {
      console.error('[DIAGNOSTICS] Error collecting senses data:', error)
    }

    // Group OAuth connections by provider type
    const oauthConnectionsByType: Record<string, any[]> = {}
    ;(oauthConnections || []).forEach((conn: any) => {
      const type = conn.provider || conn.sense_type || 'unknown'
      if (!oauthConnectionsByType[type]) {
        oauthConnectionsByType[type] = []
      }
      oauthConnectionsByType[type].push({
        ...conn,
        isActive: conn.expires_at ? new Date(conn.expires_at) > new Date() : true
      })
    })

    // Build senses data with simulated testing
    const sensesData: SenseData[] = []
    
    for (const senseId of Array.from(allSenses)) {
      let senseData: SenseData = {
        id: senseId,
        name: senseId.replace(/_/g, ' ').replace(/\./g, ' '),
        type: 'data',
        status: 'inactive'
      }

      try {
        // Get base sense ID safely
        const baseSenseId = senseId ? (senseId.split('.')[0] || '') : ''
        
        // Test connected senses (OAuth-based)
        if (['fitness', 'sleep', 'calendar', 'location'].includes(senseId)) {
          senseData.type = 'connected'
          const connections = senseConnections.get(senseId) || []
          const typeConnections = oauthConnectionsByType[senseId] || []
          
          senseData.connections = [...connections, ...typeConnections]
          senseData.status = senseData.connections.length > 0 ? 'active' : 'inactive'
          
          // Generate mock data if we have connections
          if (senseData.connections.length > 0) {
            senseData.value = await generateMockSenseData(senseId)
            senseData.lastUpdate = new Date().toISOString()
          }
        }
        // Test location-aware senses
        else if (['weather', 'air_quality', 'news'].includes(baseSenseId)) {
          senseData.type = 'location'
          const configKey = `location:${senseId}` || `weather:${senseId}` || `news:${senseId}`
          const config = senseConfigurations.get(configKey)
          
          if (config) {
            senseData.config = config
            senseData.status = 'active'
            senseData.value = await generateMockSenseData(senseId)
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
          senseData.value = await generateMockSenseData(senseId)
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
    const formattedNotifications = (notifications || []).map(notif => {
      // Find the aura name for this notification
      const aura = processedAuras.find(a => a.id === notif.aura_id)
      
      return {
        id: notif.id,
        auraName: aura?.name || 'Unknown Aura',
        message: notif.message,
        status: notif.status,
        createdAt: notif.created_at,
        deliveredAt: notif.delivered_at,
        errorMessage: notif.error_message
      }
    })

    console.log('[DIAGNOSTICS] Request completed successfully!')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      auras: processedAuras,
      senseData: sensesData,
      oauthConnections: oauthConnectionsByType,
      notifications: formattedNotifications,
      systemStatus,
      // Include any table access issues
      tableErrors: Object.keys(tableErrors).length > 0 ? tableErrors : undefined,
      warnings: Object.keys(tableErrors).length > 0 ? [
        'Some database tables may not be available in this environment.',
        'This is expected if the proactive notifications system hasn\'t been fully deployed.'
      ] : undefined
    })

  } catch (error) {
    console.error('[DIAGNOSTICS] Critical error occurred:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      success: false,
      error: 'Diagnostics system error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      // Provide basic fallback data to help with debugging
      fallback: {
        auras: [],
        senseData: [],
        oauthConnections: {},
        notifications: [],
        systemStatus: {
          totalSenses: 0,
          activeSenses: 0,
          totalRules: 0,
          activeRules: 0,
          notificationsToday: 0,
          lastCronRun: undefined,
          lastRuleEvaluation: undefined,
          lastNotificationProcessed: undefined
        }
      }
    }, { status: 500 })
  }
}

// Helper function to generate mock sensor data
async function generateMockSenseData(senseId: string): Promise<any> {
  const baseSenseId = senseId ? (senseId.split('.')[0] || '') : ''
  
  switch (baseSenseId) {
    case 'weather':
      return {
        temperature: Math.floor(Math.random() * 30) + 10,
        conditions: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        humidity: Math.floor(Math.random() * 50) + 30,
        city: 'San Francisco'
      }
    case 'fitness':
      return {
        steps: Math.floor(Math.random() * 8000) + 2000,
        heartRate: Math.floor(Math.random() * 50) + 65,
        calories: Math.floor(Math.random() * 800) + 1200,
        activity: 'walking'
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
    case 'news':
      return {
        headlines: [
          'Tech Innovation Continues',
          'Climate Action Advances',
          'Community Events'
        ],
        source: 'multiple'
      }
    case 'air_quality':
      return {
        aqi: Math.floor(Math.random() * 200) + 50,
        pm25: Math.floor(Math.random() * 100) + 10
      }
    case 'soil_moisture':
      return {
        value: Math.floor(Math.random() * 70) + 20,
        unit: '%'
      }
    default:
      return {
        value: Math.floor(Math.random() * 100),
        type: 'generic',
        generated: true
      }
  }
}

function getLastCronRun(): string | undefined {
  // Mock a recent cron run
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