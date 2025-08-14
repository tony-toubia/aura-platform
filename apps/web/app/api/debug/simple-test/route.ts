// app/api/debug/simple-test/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function GET() {
  try {
    console.log('[SIMPLE-TEST] Starting simple test...')
    
    const supabase = await createServerSupabase()

    // Test 1: Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[SIMPLE-TEST] Auth check:', { hasUser: !!user, authError })
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated',
        step: 'auth'
      }, { status: 401 })
    }

    // Test 2: Basic auras query
    console.log('[SIMPLE-TEST] Testing auras table...')
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select('id, name, enabled, senses')
      .eq('user_id', user.id)
      .limit(3)

    console.log('[SIMPLE-TEST] Auras result:', { 
      aurasCount: auras?.length || 0, 
      aurasError: aurasError ? aurasError.message : null
    })

    if (aurasError) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch auras',
        details: aurasError.message,
        step: 'auras'
      }, { status: 500 })
    }

    // Test 3: Try behavior_rules
    console.log('[SIMPLE-TEST] Testing behavior_rules table...')
    const { data: rules, error: rulesError } = await supabase
      .from('behavior_rules')
      .select('id, name, enabled')
      .limit(1)

    console.log('[SIMPLE-TEST] Rules result:', { 
      rulesCount: rules?.length || 0, 
      rulesError: rulesError ? rulesError.message : null
    })

    // Test 4: Try proactive_messages
    console.log('[SIMPLE-TEST] Testing proactive_messages table...')
    const { data: messages, error: messagesError } = await supabase
      .from('proactive_messages')
      .select('id, message, status')
      .limit(1)

    console.log('[SIMPLE-TEST] Messages result:', { 
      messagesCount: messages?.length || 0, 
      messagesError: messagesError ? messagesError.message : null
    })

    console.log('[SIMPLE-TEST] All tests completed successfully!')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email
      },
      results: {
        auras: {
          accessible: !aurasError,
          count: auras?.length || 0,
          error: aurasError ? (aurasError as any).message : null,
          sample: auras?.[0] || null
        },
        behavior_rules: {
          accessible: !rulesError,
          count: rules?.length || 0,
          error: rulesError ? rulesError.message : null
        },
        proactive_messages: {
          accessible: !messagesError,
          count: messages?.length || 0,
          error: messagesError ? messagesError.message : null
        }
      },
      summary: {
        allTablesAccessible: !aurasError && !rulesError && !messagesError,
        criticalError: aurasError ? 'auras_table' : null
      }
    })

  } catch (error) {
    console.error('[SIMPLE-TEST] Critical error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({
      success: false,
      error: 'Critical system error',
      message: error instanceof Error ? error.message : 'Unknown error',
      step: 'exception'
    }, { status: 500 })
  }
}