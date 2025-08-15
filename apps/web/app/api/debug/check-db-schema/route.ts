// app/api/debug/check-db-schema/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('[DB-CHECK] Checking database schema...')
    
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

    const results: any = {}

    // Check proactive_messages table
    try {
      console.log('[DB-CHECK] Checking proactive_messages table...')
      const { data: proactiveMessages, error: pmError } = await supabase
        .from('proactive_messages')
        .select('*')
        .limit(1)
      
      results.proactive_messages = {
        exists: !pmError,
        error: pmError?.message,
        sampleData: proactiveMessages?.[0] || null
      }
    } catch (error) {
      results.proactive_messages = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check conversations table
    try {
      console.log('[DB-CHECK] Checking conversations table...')
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .limit(1)
      
      results.conversations = {
        exists: !convError,
        error: convError?.message,
        sampleData: conversations?.[0] || null
      }
    } catch (error) {
      results.conversations = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check messages table
    try {
      console.log('[DB-CHECK] Checking messages table...')
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .limit(1)
      
      results.messages = {
        exists: !msgError,
        error: msgError?.message,
        sampleData: messages?.[0] || null
      }
    } catch (error) {
      results.messages = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check auras table
    try {
      console.log('[DB-CHECK] Checking auras table...')
      const { data: auras, error: auraError } = await supabase
        .from('auras')
        .select('*')
        .limit(1)
      
      results.auras = {
        exists: !auraError,
        error: auraError?.message,
        sampleData: auras?.[0] || null
      }
    } catch (error) {
      results.auras = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Get pending notifications count
    try {
      console.log('[DB-CHECK] Checking pending notifications...')
      const { count, error: countError } = await supabase
        .from('proactive_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      results.pending_notifications = {
        count: count || 0,
        error: countError?.message
      }
    } catch (error) {
      results.pending_notifications = {
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Get sample pending notification with aura info
    try {
      console.log('[DB-CHECK] Getting sample pending notification...')
      const { data: sampleNotif, error: sampleError } = await supabase
        .from('proactive_messages')
        .select(`
          id,
          aura_id,
          message,
          status,
          delivery_channel,
          created_at,
          auras (
            id,
            name,
            user_id
          )
        `)
        .eq('status', 'pending')
        .limit(1)
        .single()
      
      results.sample_pending_notification = {
        data: sampleNotif,
        error: sampleError?.message
      }
    } catch (error) {
      results.sample_pending_notification = {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('[DB-CHECK] Schema check complete:', results)

    return NextResponse.json({
      success: true,
      message: 'Database schema check complete',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[DB-CHECK] Error:', error)
    return NextResponse.json({ 
      error: 'Database check failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}