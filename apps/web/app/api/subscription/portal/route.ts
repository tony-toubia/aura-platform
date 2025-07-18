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

    const { data: subRow, error } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (error || !subRow?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    const origin = request.headers.get("origin")
    const session = await stripe.billingPortal.sessions.create({
      customer: subRow.stripe_customer_id,
      return_url: `${origin}/subscription`,
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
