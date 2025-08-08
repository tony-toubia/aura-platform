import { NextRequest, NextResponse } from 'next/server'
import { env, validateEnvironment, logEnvironmentStatus } from '@/lib/config/env'

export async function GET(): Promise<NextResponse> {
  try {
    console.log('🧪 Testing Supabase connection...')
    
    // Log environment status
    logEnvironmentStatus()
    
    // Validate environment variables
    try {
      validateEnvironment(true)
      console.log('✅ Environment validation passed')
    } catch (validationError) {
      console.error('❌ Environment validation failed:', validationError)
      return NextResponse.json({ 
        success: false, 
        error: 'Environment validation failed',
        details: validationError instanceof Error ? validationError.message : 'Unknown validation error'
      }, { status: 500 })
    }
    
    // Test the same Supabase setup as the webhook
    const { createClient: createServerClient } = await import('@supabase/supabase-js')
    
    const supabase = createServerClient(
      env.SUPABASE.URL,
      env.SUPABASE.SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('✅ Supabase client created')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('subscriptions')
      .select('count(*)')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase test failed:', testError)
      return NextResponse.json({ 
        success: false, 
        error: testError.message,
        details: testError
      }, { status: 500 })
    }
    
    console.log('✅ Supabase connection test successful')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      testResult: testData,
      env: {
        nodeEnv: env.NODE_ENV,
        hasUrl: !!env.SUPABASE.URL,
        hasAnonKey: !!env.SUPABASE.ANON_KEY,
        hasServiceKey: !!env.SUPABASE.SERVICE_ROLE_KEY,
        urlPreview: env.SUPABASE.URL.substring(0, 30) + '...',
        appUrl: env.APP_URL
      }
    })
  } catch (error) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}