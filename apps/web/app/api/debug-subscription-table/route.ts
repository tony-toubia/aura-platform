import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  try {
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
    
    // Try to get a sample subscription record to see the actual column names
    const { data: sample, error } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      })
    }
    
    // Get the column names from the sample data
    const columnNames = sample && sample.length > 0 ? Object.keys(sample[0]) : []
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription table structure',
      columnNames,
      sampleData: sample
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}