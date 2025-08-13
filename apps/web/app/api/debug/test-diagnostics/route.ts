// app/api/debug/test-diagnostics/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - no user session' 
      }, { status: 401 })
    }

    const testResults = {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      tests: [] as any[]
    }

    // Test 1: Check if diagnostics endpoint is accessible
    try {
      const diagnosticsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/debug/senses-diagnostics`, {
        headers: {
          'Cookie': `sb-${process.env.NEXT_PUBLIC_SUPABASE_REF_ID}-auth-token=${JSON.stringify({ access_token: '', refresh_token: '' })}`
        }
      })
      
      testResults.tests.push({
        name: 'Diagnostics Endpoint Access',
        status: diagnosticsResponse.ok ? 'PASS' : 'FAIL',
        details: `HTTP ${diagnosticsResponse.status}`,
        error: !diagnosticsResponse.ok ? await diagnosticsResponse.text() : null
      })
    } catch (error) {
      testResults.tests.push({
        name: 'Diagnostics Endpoint Access',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Database table access
    const tables = ['auras', 'behavior_rules', 'proactive_messages', 'oauth_connections']
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1)

        testResults.tests.push({
          name: `Database Table: ${table}`,
          status: error ? 'FAIL' : 'PASS',
          details: error ? error.message : `Accessible (${count || 0} rows)`,
          error: error ? error.message : null
        })
      } catch (error) {
        testResults.tests.push({
          name: `Database Table: ${table}`,
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 3: Check user's auras
    try {
      const { data: auras, error } = await supabase
        .from('auras')
        .select('id, name, enabled, senses')
        .eq('user_id', user.id)

      testResults.tests.push({
        name: 'User Auras Query',
        status: error ? 'FAIL' : 'PASS',
        details: error ? error.message : `Found ${auras?.length || 0} auras`,
        data: auras?.map((a: any) => ({ id: a.id, name: a.name, senseCount: a.senses?.length || 0 })) || []
      })
    } catch (error) {
      testResults.tests.push({
        name: 'User Auras Query',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Test notification system
    try {
      const { data: notifications } = await supabase
        .from('proactive_messages')
        .select('id, status, created_at')
        .limit(5)

      testResults.tests.push({
        name: 'Notifications System',
        status: 'PASS',
        details: `Found ${notifications?.length || 0} recent notifications`,
        data: notifications || []
      })
    } catch (error) {
      testResults.tests.push({
        name: 'Notifications System',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 5: Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

    testResults.tests.push({
      name: 'Environment Variables',
      status: missingEnvVars.length === 0 ? 'PASS' : 'FAIL',
      details: missingEnvVars.length === 0 
        ? 'All required environment variables present'
        : `Missing: ${missingEnvVars.join(', ')}`,
      error: missingEnvVars.length > 0 ? `Missing environment variables: ${missingEnvVars.join(', ')}` : null
    })

    // Test 6: Check if sensors configs are available
    try {
      // Try to import SENSOR_CONFIGS - if this fails, we'll catch it
      const sensorConfigsModule = await import('@/types')
      const hasConfigs = !!sensorConfigsModule.SENSOR_CONFIGS

      testResults.tests.push({
        name: 'Sensor Configurations',
        status: hasConfigs ? 'PASS' : 'FAIL',
        details: hasConfigs ? 'SENSOR_CONFIGS available' : 'SENSOR_CONFIGS not found',
        data: hasConfigs ? Object.keys(sensorConfigsModule.SENSOR_CONFIGS).slice(0, 5) : []
      })
    } catch (error) {
      testResults.tests.push({
        name: 'Sensor Configurations',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Failed to import SENSOR_CONFIGS'
      })
    }

    // Calculate overall status
    const passedTests = testResults.tests.filter(t => t.status === 'PASS').length
    const totalTests = testResults.tests.length
    const overallStatus = passedTests === totalTests ? 'ALL_PASS' : 
                         passedTests > totalTests / 2 ? 'MOSTLY_PASS' : 'FAIL'

    return NextResponse.json({
      success: true,
      overallStatus,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        passRate: `${Math.round((passedTests / totalTests) * 100)}%`
      },
      ...testResults,
      recommendations: generateRecommendations(testResults.tests)
    })

  } catch (error) {
    console.error('Diagnostics test error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

function generateRecommendations(tests: any[]): string[] {
  const recommendations: string[] = []
  
  const failedTests = tests.filter(t => t.status === 'FAIL')
  
  if (failedTests.some(t => t.name.includes('Database Table'))) {
    recommendations.push('Database connectivity issues detected. Check your Supabase configuration and RLS policies.')
  }
  
  if (failedTests.some(t => t.name.includes('Environment Variables'))) {
    recommendations.push('Missing environment variables. Update your .env files with required Supabase keys.')
  }
  
  if (failedTests.some(t => t.name.includes('Diagnostics Endpoint'))) {
    recommendations.push('Diagnostics endpoint not accessible. Check if the route is properly deployed.')
  }
  
  if (failedTests.some(t => t.name.includes('User Auras'))) {
    recommendations.push('User auras query failed. Create some test auras or check user permissions.')
  }
  
  if (failedTests.some(t => t.name.includes('Sensor Configurations'))) {
    recommendations.push('Sensor configurations not available. Check if SENSOR_CONFIGS is properly exported from /types.')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All tests passed! Your diagnostics system is ready to use.')
    recommendations.push('Navigate to /senses-diagnostics to start monitoring your system.')
  }
  
  return recommendations
}