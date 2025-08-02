// apps/web/app/api/subscription/portal/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First, try to get the stripe_customer_id from the user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('Subscription')
      .select('stripeCustomerId')
      .eq('userId', user.id)
      .single()

    let customerId: string | undefined;

    if (subscription && subscription.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      // Fallback to searching by email
      if (!user.email) {
        return NextResponse.json({ error: "User email not found" }, { status: 400 })
      }
  
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      })
  
      if (customers.data.length > 0) {
        customerId = customers.data[0]?.id;
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 })
    }

    const origin = request.headers.get("origin")
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Portal error:", err)
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    )
  }
}