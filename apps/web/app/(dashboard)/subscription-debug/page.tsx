'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

export default function SubscriptionDebugPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      // Get subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setSubscription(sub)
    }
    
    setLoading(false)
  }

  const manualUpdate = async (tierId: string) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/subscription/manual-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(`Success: ${result.message}`)
        await loadData() // Reload data
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Subscription Debug</h1>
      
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          ) : (
            <p>Not logged in</p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-2">
              <p><strong>Tier:</strong> <Badge>{subscription.tier}</Badge></p>
              <p><strong>Status:</strong> <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>{subscription.status}</Badge></p>
              <p><strong>Stripe Customer ID:</strong> {subscription.stripe_customer_id || 'None'}</p>
              <p><strong>Stripe Subscription ID:</strong> {subscription.stripe_subscription_id || 'None'}</p>
              <p><strong>Created:</strong> {new Date(subscription.created_at).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(subscription.updated_at).toLocaleString()}</p>
            </div>
          ) : (
            <p>No subscription record found</p>
          )}
        </CardContent>
      </Card>

      {/* Manual Update Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Subscription Update (Testing)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Use these buttons to manually update your subscription for testing purposes:
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => manualUpdate('free')} 
                disabled={updating}
                variant="outline"
              >
                Set to Free
              </Button>
              <Button 
                onClick={() => manualUpdate('personal')} 
                disabled={updating}
                variant="outline"
              >
                Set to Personal
              </Button>
              <Button 
                onClick={() => manualUpdate('family')} 
                disabled={updating}
                variant="outline"
              >
                Set to Family
              </Button>
              <Button 
                onClick={() => manualUpdate('business')} 
                disabled={updating}
                variant="outline"
              >
                Set to Business
              </Button>
            </div>
            {updating && <p className="text-sm text-blue-600">Updating...</p>}
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <Button onClick={loadData} variant="outline">
        Refresh Data
      </Button>
    </div>
  )
}