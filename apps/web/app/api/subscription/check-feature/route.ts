import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import { SubscriptionService } from "@/lib/services/subscription-service"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { feature } = await request.json()

    if (!feature) {
      return NextResponse.json({ error: "Feature parameter required" }, { status: 400 })
    }

    const hasAccess = await SubscriptionService.checkFeatureAccess(user.id, feature)

    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error("Error checking feature access:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}