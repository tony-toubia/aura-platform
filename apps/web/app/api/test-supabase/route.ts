import { NextRequest, NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  try {
    console.log('🧪 Testing Supabase connection...')
    
    // Test the same Supabase setup as the webhook
    const { createClient: createServerClient } = await import('@supabase/supabase-js')
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
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