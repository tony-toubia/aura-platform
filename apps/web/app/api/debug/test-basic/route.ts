// app/api/debug/test-basic/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function GET() {
  try {
    console.log('[TEST-BASIC] Starting basic test...')
    
    const supabase = await createServerSupabase()
    console.log('[TEST-BASIC] Supabase client created')

    // Test 1: Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[TEST-BASIC] Auth result:', { user: !!user, error: authError })
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'No authenticated user',
        tests: {
          auth: false,
          auras: false,
          tables: false
        }
      })
    }

    // Test 2: Simple auras query
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select('id, name, enabled')
      .eq('user_id', user.id)
      .limit(1)

    console.log('[TEST-BASIC] Auras query result:', { 
      count: auras?.length || 0, 
      error: aurasError 
    })

    // Test 3: List all tables the user has access to
    const tableTests = []
    const tables = [
      'auras',
      'behavior_rules', 
      'proactive_messages',
      'oauth_connections',
      'subscriptions',
      'senses',
      'notification_preferences',
      'profiles'
    ]

    for (const table of tables) {
      try {
        console.log(`[TEST-BASIC] Testing table: ${table}`)
        
        // Use a more specific query for user-scoped tables
        let query = supabase.from(table).select('*', { count: 'exact', head: true }).limit(1)
        
        if (['auras', 'oauth_connections', 'subscriptions', 'notification_preferences'].includes(table)) {
          query = query.eq('user_id', user.id)
        } else if (table === 'profiles') {
          query = query.eq('id', user.id)
        }

        const { count, error } = await query

        tableTests.push({
          table,
          accessible: !error,
          count: count || 0,
          error: error ? error.message : null
        })
        
        console.log(`[TEST-BASIC] Table ${table}: ${error ? 'ERROR' : 'OK'} (${count || 0} rows)`)
        
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error'
        console.log(`[TEST-BASIC] Table ${table}: EXCEPTION - ${errorMsg}`)
        
        tableTests.push({
          table,
          accessible: false,
          count: 0,
          error: errorMsg
        })
      }
    }

    // Check which tables are missing
    const missingTables = tableTests.filter(t => !t.accessible).map(t => t.table)
    const availableTables = tableTests.filter(t => t.accessible).map(t => t.table)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email
      },
      tests: {
        auth: true,
        auras: !aurasError,
        aurasCount: auras?.length || 0,
        tables: tableTests
      },
      details: {
        aurasError: aurasError ? aurasError.message : null,
        firstAura: auras?.[0] || null,
        availableTables,
        missingTables,
        missingTablesCount: missingTables.length,
        totalTablesCount: tableTests.length
      },
      recommendations: missingTables.length > 0 ? [
        `Missing ${missingTables.length} database tables: ${missingTables.join(', ')}`,
        'This may indicate that the proactive notifications system hasn\'t been fully deployed.',
        'Run the database migration to create missing tables.'
      ] : [
        'All database tables are accessible!',
        'The system should work correctly.'
      ]
    })

  } catch (error) {
    console.error('[TEST-BASIC] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}