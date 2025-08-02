'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function WebhookDebugPage() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    // Get the current domain for webhook URL
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/stripe/webhook`)
    }
  }, [])

  const testWebhookEndpoint = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/webhook-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'webhook connectivity' })
      })
      
      const result = await response.json()
      setTestResult({ success: response.ok, ...result })
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const simulateWebhook = async (eventType: string, tierId: string) => {
    setSimulating(true)
    try {
      // Get current user ID (you might need to implement this)
      const response = await fetch('/api/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          userId: 'current-user-id', // This should be the actual user ID
          tierId
        })
      })
      
      const result = await response.json()
      setSimulationResult({ success: response.ok, ...result })
    } catch (error) {
      setSimulationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Webhook Debug Center</h1>
      
      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Webhook URL for Stripe Dashboard:</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Test Webhook URL:</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                {webhookUrl.replace('/stripe/webhook', '/webhook-test')}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl.replace('/stripe/webhook', '/webhook-test'))}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Required Stripe Events:</strong> checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Connectivity Test */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Connectivity Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Test if your webhook endpoint is accessible and responding correctly.
          </p>
          
          <Button 
            onClick={testWebhookEndpoint} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Webhook Endpoint'
            )}
          </Button>

          {testResult && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <Badge variant={testResult.success ? 'default' : 'destructive'}>
                  {testResult.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Event Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Test your webhook processing logic by simulating Stripe events directly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => simulateWebhook('checkout.session.completed', 'personal')}
              disabled={simulating}
              variant="outline"
              className="w-full"
            >
              {simulating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Simulate Personal Upgrade
            </Button>
            
            <Button
              onClick={() => simulateWebhook('checkout.session.completed', 'family')}
              disabled={simulating}
              variant="outline"
              className="w-full"
            >
              {simulating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Simulate Family Upgrade
            </Button>
            
            <Button
              onClick={() => simulateWebhook('customer.subscription.deleted', 'free')}
              disabled={simulating}
              variant="outline"
              className="w-full"
            >
              {simulating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Simulate Cancellation
            </Button>
          </div>

          {simulationResult && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                {simulationResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <Badge variant={simulationResult.success ? 'default' : 'destructive'}>
                  {simulationResult.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(simulationResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> These simulations bypass Stripe and directly test your webhook processing logic.
              Use this to verify your subscription updates work correctly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Debugging Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Debugging Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-medium">Check Stripe Dashboard</h4>
                <p className="text-sm text-gray-600">Go to Stripe Dashboard → Developers → Webhooks</p>
                <Button size="sm" variant="outline" className="mt-1" asChild>
                  <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open Stripe Webhooks
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-medium">Verify Webhook URL</h4>
                <p className="text-sm text-gray-600">Ensure the webhook URL in Stripe matches the one above</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-medium">Check Events</h4>
                <p className="text-sm text-gray-600">Verify these events are enabled: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-medium">Test Webhook Delivery</h4>
                <p className="text-sm text-gray-600">In Stripe Dashboard, click "Send test webhook" to see if it reaches your endpoint</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">5</div>
              <div>
                <h4 className="font-medium">Check Server Logs</h4>
                <p className="text-sm text-gray-600">Monitor your server logs for webhook emoji indicators (🔔, ✅, ❌) during checkout</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Local Development:</strong> If testing locally, Stripe cannot reach localhost.
              Use ngrok or similar to expose your local server, then update the webhook URL in Stripe.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}