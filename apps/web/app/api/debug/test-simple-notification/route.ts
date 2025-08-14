// app/api/debug/test-simple-notification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

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

    // Try to insert directly into proactive_messages
    const { data: message, error: insertError } = await supabase
      .from('proactive_messages')
      .insert({
        aura_id: targetAura.id,
        rule_id: 'test-rule',
        message: `🧪 Simple test message from ${targetAura.name}`,
        priority: 10,
        delivery_channel: 'IN_APP',
        status: 'QUEUED',
        scheduled_for: new Date().toISOString(),
        retry_count: 0
      })
      .select()
      .single()

    if (insertError) {
      console.log('[TEST-NOTIF] Failed to insert message:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create test message', 
        details: insertError.message,
        code: insertError.code 
      }, { status: 500 })
    }

    console.log('[TEST-NOTIF] Created message:', message)

    return NextResponse.json({
      success: true,
      message: 'Simple test notification created',
      notificationId: message?.id,
      auraName: targetAura.name,
      user: user.id,
      aurasFound: auras.length
    })

  } catch (error) {
    console.error('[TEST-NOTIF] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}