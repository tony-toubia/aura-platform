// app/api/debug/check-messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('[MSG-CHECK] Checking messages...')
    
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

    const conversationId = '2f72d024-48fe-4dae-be2b-c5addb5fa0f0'
    const messageIds = [
      '8eb74f2a-5636-4bf8-8cf3-58bc8f409b81',
      '54161076-82f1-40bd-ae22-5e6af5f4229b',
      '76c0101e-ada2-4ae0-811b-5a469e95d5c4'
    ]

    const results: any = {}

    // Check if messages exist (service role)
    console.log('[MSG-CHECK] Checking messages with service role...')
    const { data: serviceRoleMessages, error: serviceError } = await supabase
      .from('messages')
      .select('*')
      .in('id', messageIds)

    results.serviceRoleMessages = {
      count: serviceRoleMessages?.length || 0,
      error: serviceError?.message,
      messages: serviceRoleMessages || []
    }

    // Check all messages in conversation (service role)
    const { data: allConvMessages, error: allConvError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    results.allConversationMessages = {
      count: allConvMessages?.length || 0,
      error: allConvError?.message,
      messages: allConvMessages || []
    }

    // Check conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    results.conversation = {
      exists: !!conversation,
      error: convError?.message,
      data: conversation
    }

    // Try with user client (simulating RLS)
    console.log('[MSG-CHECK] Creating user client...')
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check messages with user permissions
    const { data: userMessages, error: userError } = await userSupabase
      .from('messages')
      .select('*')
      .in('id', messageIds)

    results.userMessages = {
      count: userMessages?.length || 0,
      error: userError?.message,
      messages: userMessages || [],
      note: 'This simulates what the user would see (may be empty due to RLS)'
    }

    // Check RLS policies
    results.rlsInfo = {
      note: 'If userMessages is empty but serviceRoleMessages has data, RLS is blocking access',
      serviceRoleCount: serviceRoleMessages?.length || 0,
      userAccessCount: userMessages?.length || 0,
      accessBlocked: (serviceRoleMessages?.length || 0) > (userMessages?.length || 0)
    }

    console.log('[MSG-CHECK] Message check complete:', results)

    return NextResponse.json({
      success: true,
      message: 'Message check complete',
      conversationId,
      messageIds,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[MSG-CHECK] Error:', error)
    return NextResponse.json({ 
      error: 'Message check failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}