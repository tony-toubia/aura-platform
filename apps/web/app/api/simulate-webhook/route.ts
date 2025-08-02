import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services/subscription-service'

export async function POST(request: NextRequest) {
  try {
    const { eventType, userId, tierId } = await request.json()
    
    console.log('🎭 Simulating webhook event:', { eventType, userId, tierId })
    
    // Create a mock Stripe event
    const mockEvent = {
      id: `evt_test_${Date.now()}`,
      type: eventType,
      data: {
        object: eventType === 'checkout.session.completed' ? {
          id: `cs_test_${Date.now()}`,
          client_reference_id: userId,
          customer: `cus_test_${Date.now()}`,
          subscription: `sub_test_${Date.now()}`,
          metadata: {
            userId,
            tierId
          }
        } : {
          id: `sub_test_${Date.now()}`,
          status: 'active',
          metadata: {
            userId
          },
          items: {
            data: [{
              price: {
                id: getTestPriceId(tierId)
              }
            }]
          }
        }
      }
    }
    
    // Process the mock event through the webhook handler
    await SubscriptionService.handleWebhook(mockEvent as any)
    
    return NextResponse.json({ 
      success: true, 
      message: `Simulated ${eventType} event processed`,
      mockEvent 
    })
  } catch (error) {
    console.error('❌ Webhook simulation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

function getTestPriceId(tierId: string): string {
  switch (tierId) {
    case 'personal': return process.env.STRIPE_PERSONAL_PRICE_ID || 'price_test_personal'
    case 'family': return process.env.STRIPE_FAMILY_PRICE_ID || 'price_test_family'
    case 'business': return process.env.STRIPE_BUSINESS_PRICE_ID || 'price_test_business'
    default: return 'price_test_free'
  }
}