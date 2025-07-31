import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params

    // First verify the user owns this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        aura:auras!inner(id, name, user_id)
      `)
      .eq('id', conversationId)
      .eq('auras.user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Fetch messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        role,
        content,
        timestamp,
        metadata
      `)
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      conversation,
      messages: messages || []
    })

  } catch (error) {
    console.error('Error in conversation messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}