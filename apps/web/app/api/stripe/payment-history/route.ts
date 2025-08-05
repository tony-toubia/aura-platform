import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import Stripe from 'stripe'

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stripe = getStripeClient()

    // Find the user's Stripe customer
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ 
        invoices: [],
        hasMore: false 
      })
    }

    const customer = customers.data[0]
    if (!customer) {
      return NextResponse.json({
        invoices: [],
        hasMore: false
      })
    }

    // Get the customer's invoices
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 10,
      status: 'paid'
    })

    // Format the invoice data
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      created: invoice.created,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      description: invoice.lines.data[0]?.description || 'Subscription',
      subscription_id: null // Will be populated if needed later
    }))

    return NextResponse.json({
      invoices: formattedInvoices,
      hasMore: invoices.has_more
    })

  } catch (error) {
    console.error('Payment history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    )
  }
}