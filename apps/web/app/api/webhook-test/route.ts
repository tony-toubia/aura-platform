import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🧪 Test webhook endpoint hit!')
  
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())
    
    console.log('📋 Test webhook details:')
    console.log('- Body length:', body.length)
    console.log('- Headers:', JSON.stringify(headers, null, 2))
    console.log('- Body preview:', body.substring(0, 200))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test webhook received successfully',
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      hasStripeSignature: !!headers['stripe-signature']
    })
  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook test endpoint is active',
    timestamp: new Date().toISOString()
  })
}