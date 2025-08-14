// app/api/debug/database-schema/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function GET(request: NextRequest) {
  try {
    console.log('[SCHEMA-DEBUG] Checking database schema...')
    
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: any = {
      tables: {},
      enums: {},
      constraints: {}
    }

    // Check proactive_messages table structure
    console.log('[SCHEMA-DEBUG] Checking proactive_messages table...')
    const { data: pmData, error: pmError } = await supabase
      .from('proactive_messages')
      .select('*')
      .limit(1)

    if (pmError) {
      results.tables.proactive_messages = {
        exists: false,
        error: pmError.message,
        code: pmError.code
      }
    } else {
      results.tables.proactive_messages = {
        exists: true,
        sampleRecord: pmData?.[0] || null,
        recordCount: pmData?.length || 0
      }
    }

    // Try to query enum values using raw SQL
    try {
      console.log('[SCHEMA-DEBUG] Checking enum types...')
      
      // Query notification status enum
      const { data: statusEnums, error: statusError } = await supabase
        .rpc('get_enum_values', { enum_name: 'notification_status' })
        .single()

      if (statusError) {
        results.enums.notification_status = { error: statusError.message }
      } else {
        results.enums.notification_status = { values: statusEnums }
      }

      // Query notification channel enum  
      const { data: channelEnums, error: channelError } = await supabase
        .rpc('get_enum_values', { enum_name: 'notification_channel' })
        .single()

      if (channelError) {
        results.enums.notification_channel = { error: channelError.message }
      } else {
        results.enums.notification_channel = { values: channelEnums }
      }
    } catch (enumError) {
      results.enums.error = 'Could not query enum values - function may not exist'
    }

    // Try a simple insert test with different enum values
    console.log('[SCHEMA-DEBUG] Testing enum values...')
    const testResults = []
    
    const statusValues = ['pending', 'queued', 'delivered', 'read', 'failed', 'expired']
    const channelValues = ['in_app', 'web_push', 'sms', 'whatsapp', 'email']
    
    for (const status of statusValues.slice(0, 2)) {
      for (const channel of channelValues.slice(0, 2)) {
        try {
          const { error: testError } = await supabase
            .from('proactive_messages')
            .insert({
              aura_id: '00000000-0000-0000-0000-000000000000', // This will fail FK but test enums
              message: 'test',
              trigger_data: {},
              status,
              delivery_channel: channel
            })

          testResults.push({
            status,
            channel,
            result: testError ? `Error: ${testError.message}` : 'Success (unexpected)'
          })
        } catch (e) {
          testResults.push({
            status,
            channel,
            result: `Exception: ${e instanceof Error ? e.message : 'Unknown'}`
          })
        }
      }
    }

    results.enumTests = testResults

    return NextResponse.json({
      success: true,
      message: 'Database schema inspection complete',
      results
    })

  } catch (error) {
    console.error('[SCHEMA-DEBUG] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}