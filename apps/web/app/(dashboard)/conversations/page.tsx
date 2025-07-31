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

  // Get recent conversations with aura info and message counts
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      session_id,
      created_at,
      started_at,
      aura_id,
      auras!inner(id, name, vessel_type, user_id),
      messages(count)
    `)
    .eq('auras.user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(50)

  // Transform the data to match the expected interface (auras array -> aura object)
  const transformedConversations = (conversations || [])
    .map(conv => {
      const aura = Array.isArray(conv.auras) ? conv.auras[0] : conv.auras
      return {
        id: conv.id,
        session_id: conv.session_id,
        created_at: conv.created_at,
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