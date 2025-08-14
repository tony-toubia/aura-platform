// app/api/debug/test-simple-notification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST-NOTIF] Starting simple notification test...')
    
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[TEST-NOTIF] Auth failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[TEST-NOTIF] User authenticated:', user.id)

    // Get request body
    const body = await request.json()
    console.log('[TEST-NOTIF] Request body:', body)

    // Get user's auras
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select('id, name, user_id')
      .eq('user_id', user.id)

    if (aurasError) {
      console.log('[TEST-NOTIF] Failed to get auras:', aurasError)
      return NextResponse.json({ error: 'Failed to get auras', details: aurasError.message }, { status: 500 })
    }

    console.log('[TEST-NOTIF] Found auras:', auras?.length)

    if (!auras || auras.length === 0) {
      return NextResponse.json({ error: 'No auras found for user' }, { status: 404 })
    }

    // Use first aura or specified aura
    const targetAura = body.auraId ? auras.find(a => a.id === body.auraId) : auras[0]
    
    if (!targetAura) {
      return NextResponse.json({ error: 'Specified aura not found' }, { status: 404 })
    }

    console.log('[TEST-NOTIF] Using aura:', targetAura.name)

    // Create service role client to bypass RLS for test operations
    console.log('[TEST-NOTIF] Creating service role client...')
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Service role key not configured', 
        details: 'SUPABASE_SERVICE_ROLE_KEY environment variable is missing'
      }, { status: 500 })
    }

    // First check if proactive_messages table exists
    console.log('[TEST-NOTIF] Checking proactive_messages table...')
    const { data: tableCheck, error: tableError } = await serviceSupabase
      .from('proactive_messages')
      .select('id')
      .limit(1)

    if (tableError && tableError.code === 'PGRST106') {
      // Table doesn't exist
      return NextResponse.json({ 
        error: 'Database migration required', 
        details: 'proactive_messages table not found. Please run the database migration first.',
        migrationFile: 'apps/web/supabase/migrations/20250113_proactive_notifications_fixed.sql'
      }, { status: 503 })
    }

    console.log('[TEST-NOTIF] Table exists, proceeding with insert...')

    // Try to insert directly into proactive_messages with proper enum handling
    console.log('[TEST-NOTIF] Inserting with service role (bypasses RLS)...')
    const { data: messageData, error: insertError } = await serviceSupabase
      .from('proactive_messages')
      .insert({
        aura_id: targetAura.id,
        message: `🧪 Simple test message from ${targetAura.name}`,
        trigger_data: { isTest: true, timestamp: new Date().toISOString() }
        // Let other fields use their defaults
      })
      .select()
      .single()

    if (insertError) {
      console.log('[TEST-NOTIF] Failed to insert message:', insertError)
      
      // If it's an enum type issue, try with explicit enum values
      if (insertError.code === 'PGRST204' || insertError.message.includes('enum') || insertError.message.includes('type')) {
        console.log('[TEST-NOTIF] Retrying with explicit enum values...')
        const { data: retryMessage, error: retryError } = await serviceSupabase
          .from('proactive_messages')
          .insert({
            aura_id: targetAura.id,
            message: `🧪 Test message from ${targetAura.name} (retry)`,
            trigger_data: { isTest: true, timestamp: new Date().toISOString() },
            status: 'pending',
            delivery_channel: 'in_app'
          })
          .select()
          .single()

        if (retryError) {
          console.log('[TEST-NOTIF] Retry also failed:', retryError)
          return NextResponse.json({ 
            error: 'Failed to create test message (retry failed)', 
            details: retryError.message,
            originalError: insertError.message,
            code: retryError.code,
            suggestion: 'Check USER-DEFINED enum types in database'
          }, { status: 500 })
        }
        
        console.log('[TEST-NOTIF] Retry successful:', retryMessage)
        
        return NextResponse.json({
          success: true,
          message: 'Simple test notification created (after retry)',
          notificationId: retryMessage?.id,
          auraName: targetAura.name,
          user: user.id,
          aurasFound: auras.length
        })
      } else {
        return NextResponse.json({ 
          error: 'Failed to create test message', 
          details: insertError.message,
          code: insertError.code 
        }, { status: 500 })
      }
    }

    console.log('[TEST-NOTIF] Created message:', messageData)

    return NextResponse.json({
      success: true,
      message: 'Simple test notification created successfully',
      notificationId: messageData?.id,
      auraName: targetAura.name,
      auraId: targetAura.id,
      user: user.id,
      aurasFound: auras.length,
      createdAt: messageData?.created_at,
      deliveryChannel: messageData?.delivery_channel,
      status: messageData?.status,
      method: 'service_role_bypass_rls'
    })

  } catch (error) {
    console.error('[TEST-NOTIF] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}