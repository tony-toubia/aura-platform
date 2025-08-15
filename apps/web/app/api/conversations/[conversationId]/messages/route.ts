// app/api/conversations/[conversationId]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log(`[CONV-MESSAGES] Loading messages for conversation: ${params.conversationId}`)
    
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('[CONV-MESSAGES] User not authenticated:', userError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[CONV-MESSAGES] User: ${user.id}`)

    // First, verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        session_id,
        started_at,
        context,
        aura_id,
        auras (
          id,
          name,
          user_id
        )
      `)
      .eq('id', params.conversationId)
      .single()

    if (convError) {
      console.error('[CONV-MESSAGES] Conversation not found:', convError)
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user owns the aura
    if (conversation.auras.user_id !== user.id) {
      console.log('[CONV-MESSAGES] User does not own this aura')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log(`[CONV-MESSAGES] Loading messages for conversation owned by user`)

    // Load messages for the conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.conversationId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('[CONV-MESSAGES] Error loading messages:', messagesError)
      return NextResponse.json({ 
        error: 'Failed to load messages',
        details: messagesError.message
      }, { status: 500 })
    }

    console.log(`[CONV-MESSAGES] Found ${messages?.length || 0} messages`)

    // Log sample of messages for debugging
    if (messages && messages.length > 0) {
      console.log('[CONV-MESSAGES] Sample messages:', messages.slice(-3).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content?.substring(0, 50) + '...',
        created_at: m.created_at,
        metadata_type: m.metadata?.type
      })))
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        session_id: conversation.session_id,
        started_at: conversation.started_at,
        context: conversation.context,
        aura: {
          id: conversation.auras.id,
          name: conversation.auras.name
        }
      },
      messages: messages || [],
      messageCount: messages?.length || 0
    })

  } catch (error) {
    console.error('[CONV-MESSAGES] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}