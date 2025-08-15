// app/api/test/create-rule/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('[CREATE-RULE] Creating morning check-in rule...')
    
    // Create service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // First check if behavior_rules table exists (used for notification rules)
    console.log('[CREATE-RULE] Checking if behavior_rules table exists...')
    const { data: testQuery, error: testError } = await supabase
      .from('behavior_rules')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('[CREATE-RULE] behavior_rules table not found:', testError)
      return NextResponse.json({
        success: false,
        error: 'Notification system not set up',
        details: `Database table missing: ${testError.message}`,
        solution: [
          '1. Run the database migration first:',
          '   apps/web/supabase/migrations/20250113_proactive_notifications_fixed.sql',
          '2. This will create the behavior_rules table used for notifications',
          '3. Or create the behavior_rules table manually in Supabase dashboard'
        ]
      }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    
    // Get current user to find their auras
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        details: 'User must be logged in to create rules'
      }, { status: 401 })
    }

    // Get user's first available aura (or specified one)
    let targetAuraId = body.aura_id
    
    if (!targetAuraId) {
      const { data: userAuras, error: aurasError } = await supabase
        .from('auras')
        .select('id, name, enabled')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .limit(1)
        .single()

      if (aurasError || !userAuras) {
        console.error('[CREATE-RULE] No enabled auras found for user:', user.id, aurasError)
        return NextResponse.json({
          success: false,
          error: 'No auras available',
          details: 'You need at least one enabled aura to create notification rules',
          solution: [
            '1. Go to your dashboard',
            '2. Create an aura if you don\'t have any',
            '3. Make sure at least one aura is enabled',
            '4. Try creating the rule again'
          ]
        }, { status: 400 })
      }

      targetAuraId = userAuras.id
      console.log(`[CREATE-RULE] Using user's aura: ${userAuras.name} (${targetAuraId})`)
    }
    
    // Default test rule parameters - meaningful conditions only
    const testRule = {
      aura_id: targetAuraId,
      name: body.rule_name || 'Morning Motivation',
      trigger: {
        type: 'proactive_notification',
        schedule: '0 9 * * 1-5', // Weekdays at 9 AM
        conditions: {
          timeOfDay: 'morning',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        cooldown_minutes: 1440 // 24 hour cooldown
      },
      action: {
        type: 'send_message',
        message: body.message_template || 'Good morning! ☀️ Ready to make today amazing? What\'s one thing you\'re excited about today?',
        channels: body.delivery_channels || ['IN_APP'],
        priority: body.priority || 4
      },
      priority: body.priority || 4,
      enabled: body.enabled !== false // Default to true unless explicitly false
    }

    console.log('[CREATE-RULE] Creating behavior rule for proactive notifications:', testRule)

    // Create the behavior rule (used for notification rules)
    const { data: rule, error: ruleError } = await supabase
      .from('behavior_rules')
      .insert({
        aura_id: testRule.aura_id,
        name: testRule.name,
        trigger: testRule.trigger,
        action: testRule.action,
        priority: testRule.priority,
        enabled: testRule.enabled
      })
      .select()
      .single()

    if (ruleError) {
      console.error('[CREATE-RULE] Error creating rule:', ruleError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create rule',
        details: ruleError.message
      }, { status: 500 })
    }

    // Also enable proactive notifications on the aura
    const { error: auraUpdateError } = await supabase
      .from('auras')
      .update({ 
        proactive_enabled: true,
        last_evaluation_at: null // Reset so it gets evaluated immediately
      })
      .eq('id', testRule.aura_id)

    if (auraUpdateError) {
      console.warn('[CREATE-RULE] Warning: Could not enable proactive notifications on aura:', auraUpdateError)
    }

    console.log('[CREATE-RULE] Test rule created successfully:', rule)

    // Get the aura name for the response
    const { data: targetAura } = await supabase
      .from('auras')
      .select('name')
      .eq('id', targetAuraId)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Morning motivation rule created successfully',
      rule: rule,
      auraName: targetAura?.name || 'Unknown',
      auraId: targetAuraId,
      nextSteps: [
        `1. Rule created for "${targetAura?.name || 'your aura'}" - triggers weekday mornings at 9 AM`,
        '2. Use "Check Rules" button to verify the rule was created',
        '3. Check your aura conversation tomorrow morning for the message',
        '4. Monitor rule execution in rule_execution_log table'
      ],
      testingTips: [
        'This is a MEANINGFUL rule - triggers once daily on weekdays only',
        'No spam! 24-hour cooldown prevents multiple messages',
        'Use "Check Rules" button for immediate evaluation without waiting',
        'See MEANINGFUL_NOTIFICATION_RULES_EXAMPLES.md for more ideas'
      ]
    })

  } catch (error) {
    console.error('[CREATE-RULE] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}