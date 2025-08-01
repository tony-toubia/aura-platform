import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { ConversationsContent } from '@/components/conversations/conversations-content'

export default async function ConversationsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's auras with conversation counts
  const { data: auras } = await supabase
    .from('auras')
    .select(`
      id,
      name,
      vessel_type,
      personality,
      conversations:conversations(count)
    `)
    .eq('user_id', user.id)

  // Get user's aura IDs first
  const userAuraIds = auras?.map(aura => aura.id) || []
  
  // First try a simple query without joins to see if conversations exist
  const { data: simpleConversations, error: simpleError } = await supabase
    .from('conversations')
    .select('id, session_id, started_at, aura_id')
    .in('aura_id', userAuraIds)
    .order('started_at', { ascending: false })
    .limit(50)

  console.log('Simple conversations query:', { 
    count: simpleConversations?.length || 0, 
    error: simpleError,
    data: simpleConversations?.slice(0, 3) 
  })

  // Try the join query but with better error handling
  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select(`
      id,
      session_id,
      started_at,
      aura_id,
      auras!inner(id, name, vessel_type, user_id)
    `)
    .in('aura_id', userAuraIds)
    .order('started_at', { ascending: false })
    .limit(50)

  console.log('Join conversations query:', { 
    count: conversations?.length || 0, 
    error: conversationsError,
    errorDetails: conversationsError?.details,
    errorHint: conversationsError?.hint,
    data: conversations?.slice(0, 2) 
  })

  // If join query failed, try manual approach
  let conversationsWithAuraData = conversations
  if (!conversations || conversations.length === 0) {
    console.log('Join query failed, trying manual approach...')
    
    if (simpleConversations && simpleConversations.length > 0) {
      // Manually fetch aura data for each conversation
      conversationsWithAuraData = []
      for (const conv of simpleConversations) {
        const { data: auraData } = await supabase
          .from('auras')
          .select('id, name, vessel_type, user_id')
          .eq('id', conv.aura_id)
          .single()
        
        if (auraData) {
          conversationsWithAuraData.push({
            ...conv,
            auras: [auraData] // Wrap in array to match expected type
          })
        }
      }
      console.log('Manual join result:', conversationsWithAuraData.length, 'conversations')
    }
  }

  // Get message counts separately for each conversation
  let conversationsWithMessageCounts = []
  if (conversationsWithAuraData) {
    for (const conv of conversationsWithAuraData) {
      const { count: messageCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
      
      conversationsWithMessageCounts.push({
        ...conv,
        messages: [{ count: messageCount || 0 }]
      })
    }
  }

  // If no conversations found, try a simpler query to debug
  let debugConversations = null
  let debugMessages = null
  if (!conversationsWithMessageCounts || conversationsWithMessageCounts.length === 0) {
    console.log('No conversations found for user, checking database...')
    
    const { data: allConversations, error: allConvError } = await supabase
      .from('conversations')
      .select('id, aura_id, session_id, started_at')
      .limit(10)
    
    const { data: allMessages, error: allMsgError } = await supabase
      .from('messages')
      .select('id, conversation_id, role, content')
      .limit(10)
    
    console.log('Database check:', {
      totalConversations: allConversations?.length || 0,
      totalMessages: allMessages?.length || 0,
      convError: allConvError,
      msgError: allMsgError
    })
    
    debugConversations = allConversations
    debugMessages = allMessages
  }

  // Debug logging
  console.log('=== CONVERSATIONS DEBUG ===')
  console.log('User ID:', user.id)
  console.log('User Auras:', auras?.map(a => ({ id: a.id, name: a.name })))
  console.log('User Aura IDs:', userAuraIds)
  console.log('Raw conversations query result:', { 
    conversations: conversations?.length || 0, 
    error: conversationsError,
    rawConversations: conversations?.map(c => ({
      id: c.id,
      aura_id: c.aura_id,
      session_id: c.session_id,
      auraData: c.auras
    }))
  })
  console.log('Conversations with message counts:', conversationsWithMessageCounts?.map(c => ({
    id: c.id,
    aura_id: c.aura_id,
    session_id: c.session_id,
    messageCount: c.messages?.[0]?.count || 0,
    auraName: Array.isArray(c.auras) ? c.auras[0]?.name : (c.auras as any)?.name
  })))
  console.log('Debug queries (if no conversations found):', {
    debugConversations: debugConversations?.map(c => ({ id: c.id, aura_id: c.aura_id, session_id: c.session_id })),
    debugMessages: debugMessages?.map(m => ({ id: m.id, conversation_id: m.conversation_id, role: m.role }))
  })
  console.log('=== END DEBUG ===')
  
  console.log('Final transformed conversations:', conversationsWithMessageCounts?.length || 0)

  // Transform the data to match the expected interface (auras array -> aura object)
  const transformedConversations = (conversationsWithMessageCounts || [])
    .map(conv => {
      const aura = Array.isArray(conv.auras) ? conv.auras[0] : conv.auras
      return {
        id: conv.id,
        session_id: conv.session_id,
        created_at: conv.started_at, // Use started_at as created_at since created_at doesn't exist
        started_at: conv.started_at,
        aura_id: conv.aura_id,
        aura: aura!,
        messages: conv.messages
      }
    })
    .filter(conv => conv.aura) // Filter out conversations without aura data

  return (
    <ConversationsContent 
      auras={auras || []}
      conversations={transformedConversations}
    />
  )
}