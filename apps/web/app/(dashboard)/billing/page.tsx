import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server.server"
import { SubscriptionService } from "@/lib/services/subscription-service"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomerPortalButton } from "@/components/subscription/customer-portal-button"
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Receipt, 
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

// Force this page to revalidate on every request to show fresh billing data
export const revalidate = 0

export default async function BillingPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get subscription directly from server-side Supabase
  const { data: subscriptionRow, error } = await supabase
    .from('subscriptions')
    .select('tier, status, created_at, updated_at')
    .eq('user_id', user.id)
    .single()

  // Import SUBSCRIPTION_TIERS directly to avoid client-side issues
  const { SUBSCRIPTION_TIERS } = await import('@/lib/services/subscription-service')
  
  const subscription = subscriptionRow && !error
    ? SUBSCRIPTION_TIERS[subscriptionRow.tier as keyof typeof SUBSCRIPTION_TIERS] ?? SUBSCRIPTION_TIERS.free
    : SUBSCRIPTION_TIERS.free

  const subscriptionStatus = subscriptionRow?.status || 'active'
  const subscriptionCreated = subscriptionRow?.created_at
  const subscriptionUpdated = subscriptionRow?.updated_at

  // Calculate next billing date (mock for now - in real app this would come from Stripe)
  const nextBillingDate = subscription.id !== 'free' 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    : null

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><Clock className="w-3 h-3 mr-1" />Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {/* Hero */}
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Billing & Payments
        </h1>
        <p className="text-lg text-gray-600">
          Manage your subscription, view billing history, and update payment methods.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Current Subscription */}
        <Card className="bg-white/90 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Your active plan and billing details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-purple-700">{subscription.name}</h3>
                <p className="text-sm text-gray-600">
                  {subscription.price > 0 ? `$${subscription.price}/month` : 'Free forever'}
                </p>
              </div>
              {getStatusBadge(subscriptionStatus)}
            </div>

            {subscription.id !== 'free' && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Next billing date:</span>
                  <span className="font-medium">
                    {nextBillingDate?.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${subscription.price}</span>
                </div>
              </div>
            )}

            {subscription.id !== 'free' && (
              <div className="pt-4">
                <CustomerPortalButton />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="bg-white/90 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Billing History
            </CardTitle>
            <CardDescription>
              View your past invoices and payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription.id === 'free' ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No billing history yet</p>
                <p className="text-sm text-gray-500">
                  Upgrade to a paid plan to see your billing history here.
                </p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/subscription">
                    View Plans
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mock billing history - in real app this would come from Stripe */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">December 2024</p>
                    <p className="text-sm text-gray-600">{subscription.name} Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${subscription.price}</p>
                    <Badge variant="outline" className="text-xs">Paid</Badge>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <CustomerPortalButton variant="outline" size="sm" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Details */}
      <Card className="bg-white/90 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Subscription Details
          </CardTitle>
          <CardDescription>
            Detailed information about your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Plan Features</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• {subscription.features.maxAuras === -1 ? 'Unlimited' : subscription.features.maxAuras} Active Auras</li>
                <li>• {subscription.features.maxConversations === -1 ? 'Unlimited' : subscription.features.maxConversations.toLocaleString()} Conversations/month</li>
                <li>• {subscription.features.hasAnalytics ? 'Advanced Analytics' : 'Basic Analytics'}</li>
                <li>• {subscription.features.hasApiAccess ? 'API Access' : 'No API Access'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Subscription Info</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Started:</span>
                  <p className="font-medium">
                    {subscriptionCreated 
                      ? new Date(subscriptionCreated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <p className="font-medium">
                    {subscriptionUpdated 
                      ? new Date(subscriptionUpdated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Support Level</h4>
              <p className="text-sm text-gray-600 capitalize mb-4">
                {subscription.features.supportLevel} Support
              </p>
              
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/subscription">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Change Plan
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {subscription.id === 'free' && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Ready to Upgrade?
            </h3>
            <p className="text-gray-600 mb-4">
              Unlock more features and capabilities with a paid plan.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Link href="/subscription">
                View Available Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}