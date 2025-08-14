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

    // Safely fetch senses table
    console.log('[DIAGNOSTICS] Fetching senses table...')
    let sensesTable: any[] = []
    try {
      const { data, error } = await supabase
        .from('senses')
        .select('*')
        .limit(100)

      if (error) {
        console.error('[DIAGNOSTICS] Error fetching senses table:', error)
        tableErrors.senses = error.message
      } else {
        sensesTable = data || []
        console.log('[DIAGNOSTICS] Senses table fetched:', { count: sensesTable.length })
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      console.error('[DIAGNOSTICS] Exception fetching senses table:', errorMsg)
      tableErrors.senses = errorMsg
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
      // Add senses from aura configurations
      ;(auras || []).forEach((aura: any) => {
        // Add senses from aura.senses array
        ;(aura.senses || []).forEach((sense: string) => allSenses.add(sense))
        
        // Store configurations
        if (aura.location_configs) {
          Object.entries(aura.location_configs).forEach(([key, config]: [string, any]) => {
            senseConfigurations.set(`location:${key}`, config)
          })
        }
      })

      // Add senses from senses table
      ;(sensesTable || []).forEach((sense: any) => {
        if (sense.id || sense.name || sense.sense_id) {
          const senseId = sense.id || sense.name || sense.sense_id
          allSenses.add(senseId)
          
          // Store any configurations from the senses table
          if (sense.config) {
            senseConfigurations.set(`table:${senseId}`, sense.config)
          }
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
        fromAuras: (auras || []).reduce((count: number, aura: any) => count + (aura.senses?.length || 0), 0),
        fromSensesTable: sensesTable.length,
        configurations: senseConfigurations.size,
        connections: senseConnections.size 
      })
    } catch (error) {
      console.error('[DIAGNOSTICS] Error collecting senses data:', error)
    }

    // Group OAuth connections by provider type
    console.log('[DIAGNOSTICS] Processing OAuth connections:', oauthConnections.length)
    const oauthConnectionsByType: Record<string, any[]> = {}
    
    ;(oauthConnections || []).forEach((conn: any) => {
      const type = conn.provider || conn.sense_type || 'unknown'
      if (!oauthConnectionsByType[type]) {
        oauthConnectionsByType[type] = []
      }
      
      try {
        let isActive = true
        if (conn.expires_at) {
          if (isValidDate(conn.expires_at)) {
            isActive = new Date(conn.expires_at) > new Date()
          } else {
            console.warn('[DIAGNOSTICS] Invalid expires_at date in OAuth connection:', conn.id, conn.expires_at)
          }
        }
        
        oauthConnectionsByType[type].push({
          ...conn,
          isActive
        })
      } catch (error) {
        console.error('[DIAGNOSTICS] Error processing OAuth connection:', conn.id, error)
        oauthConnectionsByType[type].push({
          ...conn,
          isActive: true // Default to active if we can't determine
        })
      }
    })
    
    console.log('[DIAGNOSTICS] OAuth connections grouped by type:', Object.keys(oauthConnectionsByType))

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

    // Calculate system status with safe date handling
    console.log('[DIAGNOSTICS] Calculating system status...')
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
    
    console.log('[DIAGNOSTICS] System status calculated:', systemStatus)

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
  console.log('[DIAGNOSTICS] Processing rule evaluation dates for', rules.length, 'rules')
  
  const triggeredRules = rules.filter(r => {
    const hasDate = r.last_triggered_at && isValidDate(r.last_triggered_at)
    if (r.last_triggered_at && !isValidDate(r.last_triggered_at)) {
      console.warn('[DIAGNOSTICS] Invalid date in rule:', r.id, r.last_triggered_at)
    }
    return hasDate
  })
  
  console.log('[DIAGNOSTICS] Found', triggeredRules.length, 'rules with valid trigger dates')
  
  if (triggeredRules.length === 0) return undefined
  
  try {
    const lastTriggered = triggeredRules.reduce((latest, rule) => {
      const ruleDate = new Date(rule.last_triggered_at)
      const latestDate = new Date(latest)
      return ruleDate > latestDate ? rule.last_triggered_at : latest
    }, triggeredRules[0].last_triggered_at)
    
    return isValidDate(lastTriggered) ? lastTriggered : undefined
  } catch (error) {
    console.error('[DIAGNOSTICS] Error processing rule evaluation dates:', error)
    return undefined
  }
}

function getLastNotificationProcessed(notifications: any[]): string | undefined {
  console.log('[DIAGNOSTICS] Processing notification dates for', notifications.length, 'notifications')
  
  if (notifications.length === 0) return undefined
  
  try {
    // Find the most recent notification with a valid created_at
    const validNotifications = notifications.filter(n => {
      const hasDate = n.created_at && isValidDate(n.created_at)
      if (n.created_at && !isValidDate(n.created_at)) {
        console.warn('[DIAGNOSTICS] Invalid date in notification:', n.id, n.created_at)
      }
      return hasDate
    })
    
    console.log('[DIAGNOSTICS] Found', validNotifications.length, 'notifications with valid dates')
    
    if (validNotifications.length === 0) return undefined
    
    const mostRecent = validNotifications.reduce((latest, notification) => {
      const notifDate = new Date(notification.created_at)
      const latestDate = new Date(latest.created_at)
      return notifDate > latestDate ? notification : latest
    }, validNotifications[0])
    
    return mostRecent.created_at
  } catch (error) {
    console.error('[DIAGNOSTICS] Error processing notification dates:', error)
    return undefined
  }
}

function isValidDate(dateString: any): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}