// apps/web/app/api/subscription/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabase } from "@/lib/supabase/server.server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {})
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature failure:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  switch (event.type) {
    case "checkout.session.completed": {
      const sess = event.data.object as Stripe.Checkout.Session
      const userId = sess.metadata?.userId
      const tierId = sess.metadata?.tierId
      if (userId && tierId) {
        await supabase
          .from("subscriptions")
          .update({
            tier: tierId,
            status: "active",
            stripe_subscription_id: sess.subscription as string,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      }
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata.userId
      if (userId) {
        const priceId = sub.items.data[0]?.price.id
        let tierId: string = "free"
        if (priceId === process.env.STRIPE_PERSONAL_PRICE_ID) tierId = "personal"
        else if (priceId === process.env.STRIPE_FAMILY_PRICE_ID) tierId = "family"
        else if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) tierId = "business"

        await supabase
          .from("subscriptions")
          .update({
            tier: tierId,
            status: sub.status === "active" ? "active" : "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      }
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata.userId
      if (userId) {
        await supabase
          .from("subscriptions")
          .update({
            tier: "free",
            status: "cancelled",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      }
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice

      // invoice.subscription is not on Stripe.Invoice's TS definitions,
      // so cast through any:
      const subscriptionId = (invoice as any).subscription as string | undefined

      if (subscriptionId) {
        const { data: found } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single()

        if (found) {
          console.warn("Payment failed for user:", found.user_id)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
