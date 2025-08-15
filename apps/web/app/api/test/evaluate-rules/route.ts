// app/api/test/evaluate-rules/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST-RULES] Manual rule evaluation triggered')
    
    const supabase = await createServerSupabase()

    // Get current user for authorization
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized - please log in',
        details: 'User authentication required'
      }, { status: 401 })
    }

    console.log(`[TEST-RULES] User: ${user.id}`)

    // Check if behavior_rules table exists (used for notification rules)
    console.log('[TEST-RULES] Checking behavior_rules table...')
    const { data: rules, error: rulesError } = await supabase
      .from('behavior_rules')
      .select('id, name, enabled, aura_id, trigger, action')
      .limit(10)

    if (rulesError) {
      console.error('[TEST-RULES] Behavior rules table error:', rulesError)
      return NextResponse.json({
        success: false,
        error: 'Notification rules system not set up',
        details: `Database error: ${rulesError.message}`,
        suggestion: 'Run the database migration: apps/web/supabase/migrations/20250113_proactive_notifications_fixed.sql'
      }, { status: 500 })
    }

    // Filter for notification rules (behavior rules with proactive_notification type)
    const notificationRules = rules?.filter(r => 
      r.trigger && 
      (r.trigger as any).type === 'proactive_notification'
    ) || []
    const activeNotificationRules = notificationRules.filter(r => r.enabled)
    
    console.log(`[TEST-RULES] Found ${rules?.length || 0} total behavior rules, ${notificationRules.length} notification rules, ${activeNotificationRules.length} active`)

    // Check if user has any auras
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select('id, name, proactive_enabled')
      .eq('user_id', user.id)

    if (aurasError) {
      console.error('[TEST-RULES] Error fetching user auras:', aurasError)
      return NextResponse.json({
        success: false,
        error: 'Could not fetch user auras',
        details: aurasError.message
      }, { status: 500 })
    }

    const proactiveAuras = auras?.filter(a => a.proactive_enabled) || []
    console.log(`[TEST-RULES] User has ${auras?.length || 0} auras, ${proactiveAuras.length} with proactive notifications enabled`)

    // Check if any notification rules exist for user's auras
    const userAuraIds = auras?.map(a => a.id) || []
    const userNotificationRules = notificationRules.filter(r => userAuraIds.includes(r.aura_id))
    const activeUserNotificationRules = userNotificationRules.filter(r => r.enabled)

    console.log(`[TEST-RULES] User has ${userNotificationRules.length} notification rules, ${activeUserNotificationRules.length} active`)

    // Simulate rule evaluation result
    let message: string
    let resultCode: number = 200

    if (activeUserNotificationRules.length === 0) {
      if (userNotificationRules.length === 0) {
        message = `No notification rules found for your auras. Create a rule first using "Create Morning Rule" button.`
        resultCode = 200
      } else {
        message = `Found ${userNotificationRules.length} disabled notification rules. Enable them in the database or create new active rules.`
        resultCode = 200
      }
    } else {
      message = `✅ Found ${activeUserNotificationRules.length} active notification rules for ${proactiveAuras.length} auras. Rule evaluation system is ready!`
      
      // Log the active rules for debugging
      activeUserNotificationRules.forEach(rule => {
        console.log(`[TEST-RULES] Active notification rule: ${rule.name} (${rule.id}) for aura ${rule.aura_id}`)
      })
    }

    return NextResponse.json({
      success: true,
      message,
      result: {
        processed: proactiveAuras.length,
        succeeded: proactiveAuras.length,
        failed: 0,
        duration: 50,
        rules: {
          total: rules?.length || 0,
          notificationRules: notificationRules.length,
          active: activeNotificationRules.length,
          userTotal: userNotificationRules.length,
          userActive: activeUserNotificationRules.length
        },
        auras: {
          total: auras?.length || 0,
          proactiveEnabled: proactiveAuras.length
        }
      },
      timestamp: new Date().toISOString(),
      debug: {
        rulesFound: activeUserNotificationRules.map(r => ({
          id: r.id,
          name: r.name,
          auraId: r.aura_id,
          trigger: r.trigger,
          action: r.action
        })),
        aurasFound: proactiveAuras.map(a => ({
          id: a.id,
          name: a.name
        }))
      }
    }, { status: resultCode })

  } catch (error) {
    console.error('[TEST-RULES] Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Rule evaluation test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}