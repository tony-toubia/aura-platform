import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { SubscriptionService } from '@/lib/services/subscription-service'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received at:', new Date().toISOString())
  
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    console.log('📝 Webhook signature present:', !!signature)
    console.log('📝 Body length:', body.length)

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    console.log('🔐 Verifying webhook signature...')
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('✅ Webhook signature verified')
    console.log('📋 Event type:', event.type)
    console.log('📋 Event ID:', event.id)

    await SubscriptionService.handleWebhook(event)

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}