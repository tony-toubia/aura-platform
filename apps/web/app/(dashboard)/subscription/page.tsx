import { redirect } from 'next/navigation'
import { createServerSupabase  } from '@/lib/supabase/server.server'
import { SubscriptionService } from '@/lib/services/subscription-service'
import { PricingCards } from '@/components/subscription/pricing-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { openCustomerPortal } from '@/lib/stripe/upgrade'

export default async function SubscriptionPage() {
  const supabase = await createServerSupabase ()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscription = await SubscriptionService.getUserSubscription(user.id)

  // Get usage stats
  const { count: auraCount } = await supabase
    .from('auras')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: conversationCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .gte('started_at', new Date(new Date().setDate(1)).toISOString())

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription & Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Current Plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Plan: {subscription.name}</CardTitle>
          <CardDescription>
            Your usage this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Active Auras</p>
              <p className="text-2xl font-bold">
                {auraCount || 0} / {subscription.features.maxAuras === -1 ? '∞' : subscription.features.maxAuras}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Conversations</p>
              <p className="text-2xl font-bold">
                {conversationCount || 0} / {subscription.features.maxConversations === -1 ? '∞' : subscription.features.maxConversations}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">API Calls</p>
              <p className="text-2xl font-bold">
                0 / {subscription.features.apiCallsPerMonth === -1 ? '∞' : subscription.features.apiCallsPerMonth}
              </p>
            </div>
          </div>
            {subscription.id !== 'free' && (
            <div className="mt-6 pt-6 border-t">
                <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => openCustomerPortal()}
                >
                <ExternalLink className="w-4 h-4" />
                Manage Billing
                </Button>
            </div>
            )}
        </CardContent>
      </Card>

      {/* Pricing Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Available Plans</h2>
        <PricingCards currentTier={subscription.id} />
      </div>
    </div>
  )
}