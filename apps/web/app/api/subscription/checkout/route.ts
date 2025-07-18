// apps/web/app/api/subscription/checkout/route.ts

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

    const { tierId } = await request.json()

    // map tier → priceId
    const priceIds: Record<string, string | undefined> = {
      personal: process.env.STRIPE_PERSONAL_PRICE_ID,
      family: process.env.STRIPE_FAMILY_PRICE_ID,
      business: process.env.STRIPE_BUSINESS_PRICE_ID,
    }
    const priceId = priceIds[tierId]
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      )
    }

    // fetch or create Stripe customer
    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    let customerId = subRow?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id)
    }

    // create checkout session
    const origin = request.headers.get("origin")
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscription?success=true`,
      cancel_url: `${origin}/subscription?canceled=true`,
      client_reference_id: user.id,
      metadata: { userId: user.id, tierId },
      subscription_data: {
        metadata: { userId: user.id, tierId },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: any) {
    console.error("Checkout error:", err)
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    )
  }
}
