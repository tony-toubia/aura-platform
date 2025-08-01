// This debug endpoint can be temporarily enabled to troubleshoot database issues
// Uncomment the code below if you need to debug conversations/messages data

import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Debug endpoint disabled. Enable in code if needed for troubleshooting.' 
  })
}

/*
export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check messages table
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(10)
    
    // Check conversations table
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(10)
    
    // Check user's auras
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select('id, name, user_id')
      .eq('user_id', user.id)
    
    return NextResponse.json({ 
      messages: {
        data: messages,
        error: messagesError?.message,
        count: messages?.length || 0
      },
      conversations: {
        data: conversations,
        error: conversationsError?.message,
        count: conversations?.length || 0
      },
      auras: {
        data: auras,
        error: aurasError?.message,
        count: auras?.length || 0
      },
      userId: user.id
    })
    
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
*/