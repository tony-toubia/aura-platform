import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all senses from database
    const { data: senses, error } = await supabase
      .from('senses')
      .select('*')
      .order('code')

    if (error) {
      console.error('Failed to fetch senses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      senses: senses || [],
      count: senses?.length || 0,
      codes: senses?.map(s => s.code) || []
    })
  } catch (error) {
    console.error('Debug senses endpoint error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}