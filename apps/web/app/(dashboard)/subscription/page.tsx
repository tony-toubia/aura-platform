import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server.server"
import { SubscriptionService } from "@/lib/services/subscription-service"
import { PricingCards } from "@/components/subscription/pricing-cards"
import { CustomerPortalButton } from "@/components/subscription/customer-portal-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, MessageCircle, Zap, Crown } from "lucide-react"
import Link from "next/link"

// Force this page to revalidate on every request to show fresh subscription data
export const revalidate = 0

export default async function SubscriptionPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get subscription directly from server-side Supabase to avoid caching issues
  const { data: subscriptionRow, error } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  // Import SUBSCRIPTION_TIERS directly to avoid client-side issues
  const { SUBSCRIPTION_TIERS } = await import('@/lib/services/subscription-service')
  
  const subscription = subscriptionRow && !error
    ? SUBSCRIPTION_TIERS[subscriptionRow.tier as keyof typeof SUBSCRIPTION_TIERS] ?? SUBSCRIPTION_TIERS.free
    : SUBSCRIPTION_TIERS.free

  // usage stats - only count enabled/active auras
  const { count: auraCount } = await supabase
    .from("auras")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("enabled", true)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth.toISOString())

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      {/* Hero */}
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Subscription Plans
        </h1>
        <p className="text-lg text-gray-600">
          Choose the perfect plan for your magical journey and track your usage.
        </p>
      </header>

      {/* Current Plan & Usage */}
      <Card className="bg-white/90 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            Current Plan:{" "}
            <span className="text-purple-700">{subscription.name}</span>
          </CardTitle>
          <CardDescription>Your usage this month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Active Auras */}
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="p-3 bg-purple-100 rounded-full">
                <Brain className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Active Auras
                </p>
                <p className="text-2xl font-bold text-purple-700">
                  {auraCount ?? 0} /{" "}
                  {subscription.features.maxAuras === -1
                    ? "∞"
                    : subscription.features.maxAuras}
                </p>
              </div>
            </div>
            {/* Messages */}
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageCircle className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Messages
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {messageCount ?? 0} /{" "}
                  {subscription.features.maxMessages === -1
                    ? "∞"
                    : subscription.features.maxMessages}
                </p>
              </div>
            </div>
            {/* API Calls */}
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="p-3 bg-green-100 rounded-full">
                <Zap className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">API Calls</p>
                <p className="text-2xl font-bold text-green-700">
                  0 /{" "}
                  {subscription.features.apiCallsPerMonth === -1
                    ? "∞"
                    : subscription.features.apiCallsPerMonth}
                </p>
              </div>
            </div>
          </div>

          {subscription.id === "free" && (
            <Card className="bg-yellow-50 border-yellow-200 text-yellow-800 shadow-sm mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                  Unlock Premium Senses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Upgrade to a Starter plan or higher to enable personal connected senses like{" "}
                  <span className="font-semibold">Your Sleep</span>,{" "}
                  <span className="font-semibold">Your Fitness</span>, and{" "}
                  <span className="font-semibold">Your Location</span>.
                </p>
                <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <Link href="#available-plans">
                    View Plans
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {subscription.id !== "free" && (
            <div className="text-center pt-4">
              <CustomerPortalButton />
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA - MOVED UP */}
      <section className="text-center py-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-inner">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Ready for More Aura Magic?
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Upgrade your plan to unlock unlimited Auras, messages, and API
          power.
        </p>
        <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow px-8 py-6 text-lg">
          <Link href="#available-plans">
            <Crown className="w-5 h-5 mr-2" />
            View Plans & Upgrade
          </Link>
        </Button>
      </section>

      {/* Available Plans - MOVED DOWN */}
      <section id="available-plans" className="space-y-6 scroll-mt-20">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Available Plans
            </h2>
            <CardDescription className="text-lg text-gray-600 pt-2">
              Choose the plan that best fits your magical journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <PricingCards currentTier={subscription.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
