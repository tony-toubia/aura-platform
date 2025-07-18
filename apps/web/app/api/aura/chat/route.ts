// apps/web/app/api/aura/chat/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase }       from '@/lib/supabase/server.server'
import { SenseDataService }           from '@/lib/services/sense-data-service'
import { AuraServiceServer }          from '@/lib/services/aura-service.server'
import { generateAuraReply }          from '@/lib/services/openai-service'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { auraId, userMessage, conversationId } = await req.json() as {
    auraId: string
    userMessage: string
    conversationId?: string
  }

  // 1) Load aura
  const aura = await AuraServiceServer.getAuraById(auraId)
  if (!aura) {
    return NextResponse.json({ error: 'Aura not found' }, { status: 404 })
  }

  // 2) Load live sense-data
  const rawSenseData = await SenseDataService.getSenseData(aura.senses)

  // 3) Generate reply (server side OpenAI call)
  const reply = await generateAuraReply(aura, userMessage, rawSenseData)

  // 4) Persist both messages
  //    reuse your server supabase client
  await supabase
    .from('messages')
    .insert([
      { conversation_id: conversationId, aura_id: auraId, role: 'user', content: userMessage },
      { conversation_id: conversationId, aura_id: auraId, role: 'aura', content: reply },
    ])

  // 5) Return JSON
  return NextResponse.json({ reply }, { status: 200 })
}
