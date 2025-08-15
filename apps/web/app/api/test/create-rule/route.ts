// app/api/test/create-rule/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('[CREATE-RULE] Creating test rule...')
    
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

    const body = await request.json().catch(() => ({}))
    
    // Default test rule parameters - meaningful conditions only
    const testRule = {
      aura_id: body.aura_id || 'c662eca0-c663-472b-b096-e88edecfe51c', // Default to Gh aura
      rule_name: body.rule_name || 'Morning Motivation',
      trigger_type: body.trigger_type || 'scheduled',
      conditions: body.conditions || { 
        schedule: '0 9 * * *', // Once daily at 9 AM - reasonable!
        timeOfDay: 'morning',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] // Weekdays only
      },
      message_template: body.message_template || 'Good morning! ☀️ Ready to make today amazing? What\'s one thing you\'re excited about today?',
      delivery_channels: body.delivery_channels || ['IN_APP'],
      priority: body.priority || 4,
      enabled: body.enabled !== false, // Default to true unless explicitly false
      cooldown_minutes: body.cooldown_minutes || 1440 // 24 hour cooldown - no spam!
    }

    console.log('[CREATE-RULE] Creating rule:', testRule)

    // Create the notification rule
    const { data: rule, error: ruleError } = await supabase
      .from('notification_rules')
      .insert({
        aura_id: testRule.aura_id,
        rule_name: testRule.rule_name,
        trigger_type: testRule.trigger_type,
        conditions: testRule.conditions,
        message_template: testRule.message_template,
        delivery_channels: testRule.delivery_channels,
        priority: testRule.priority,
        enabled: testRule.enabled,
        created_at: new Date().toISOString()
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

    return NextResponse.json({
      success: true,
      message: 'Test notification rule created successfully',
      rule: rule,
      nextSteps: [
        '1. Rule will trigger on weekday mornings at 9 AM',
        '2. Use "Test Rules" button to manually check rule evaluation',
        '3. Check your aura conversation tomorrow morning for the message',
        '4. Monitor rule execution in rule_execution_log table'
      ],
      testingTips: [
        'This is a MEANINGFUL rule - triggers once daily on weekdays only',
        'No spam! 24-hour cooldown prevents multiple messages',
        'Use "Test Rules" button for immediate evaluation without waiting',
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