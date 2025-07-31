import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const auraId = searchParams.get('auraId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build the query
    let query = supabase
      .from('conversations')
      .select(`
        id,
        session_id,
        created_at,
        started_at,
        aura_id,
        auras!inner(id, name, vessel_type, user_id),
        messages:messages(count)
      `)
      .eq('auras.user_id', user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by aura if specified
    if (auraId) {
      query = query.eq('aura_id', auraId)
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Transform the data to match the expected interface (auras array -> aura object)
    const transformedConversations = (conversations || []).map(conv => {
      const aura = Array.isArray(conv.auras) ? conv.auras[0] : conv.auras
      return {
        id: conv.id,
        session_id: conv.session_id,
        created_at: conv.created_at,
        started_at: conv.started_at,
        aura_id: conv.aura_id,
        aura: aura,
        messages: conv.messages
      }
    })

    // If search is provided, we need to search within message content
    let filteredConversations = transformedConversations
    
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase()
      
      // First filter by aura name and session ID
      filteredConversations = filteredConversations.filter(conv => 
        conv.aura?.name?.toLowerCase().includes(searchTerm) ||
        conv.session_id.toLowerCase().includes(searchTerm)
      )

      // Also search within message content
      const conversationIds = filteredConversations.map(c => c.id)
      
      if (conversationIds.length > 0) {
        const { data: messagesWithSearch } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', conversationIds)
          .ilike('content', `%${searchTerm}%`)

        const conversationsWithMatchingMessages = new Set(
          messagesWithSearch?.map(m => m.conversation_id) || []
        )

        // Include conversations that match either aura/session name OR have matching messages
        filteredConversations = transformedConversations.filter(conv => 
          conv.aura?.name?.toLowerCase().includes(searchTerm) ||
          conv.session_id.toLowerCase().includes(searchTerm) ||
          conversationsWithMatchingMessages.has(conv.id)
        )
      }
    }

    return NextResponse.json({
      conversations: filteredConversations,
      hasMore: filteredConversations.length === limit
    })

  } catch (error) {
    console.error('Error in conversations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { auraId, sessionId, context } = await request.json()

    if (!auraId) {
      return NextResponse.json({ error: 'auraId is required' }, { status: 400 })
    }

    // Verify the aura belongs to the user
    const { data: aura, error: auraError } = await supabase
      .from('auras')
      .select('id')
      .eq('id', auraId)
      .eq('user_id', user.id)
      .single()

    if (auraError || !aura) {
      return NextResponse.json({ error: 'Aura not found' }, { status: 404 })
    }

    // Create the conversation
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        aura_id: auraId,
        session_id: finalSessionId,
        context: context || {},
        started_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json({ conversation })

  } catch (error) {
    console.error('Error in conversations POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}