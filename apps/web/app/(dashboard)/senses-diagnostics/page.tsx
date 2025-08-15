// app/(dashboard)/senses-diagnostics/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  RefreshCw, 
  Activity, 
  Wifi, 
  MapPin, 
  Newspaper, 
  Cloud, 
  Wind, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Eye,
  Settings,
  Database,
  Zap,
  Users,
  Calendar,
  Heart,
  Smartphone,
  ExternalLink,
  Copy,
  Download,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Safe date formatting utility
const formatDateSafely = (dateString: string | undefined, formatStr: string): string => {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return format(date, formatStr)
  } catch (error) {
    console.warn('Date formatting error:', error, 'for date:', dateString)
    return 'Format Error'
  }
}

interface SenseData {
  id: string
  name: string
  type: 'connected' | 'location' | 'data' | 'configuration'
  status: 'active' | 'inactive' | 'error' | 'warning'
  lastUpdate?: string
  value?: any
  config?: any
  error?: string
  connections?: any[]
  metadata?: any
}

interface DiagnosticData {
  auras: Array<{
    id: string
    name: string
    enabled: boolean
    senseCount: number
    ruleCount: number
    notificationCount: number
  }>
  senseData: SenseData[]
  oauthConnections: Record<string, any[]>
  notifications: Array<{
    id: string
    auraName: string
    message: string
    status: string
    createdAt: string
    deliveredAt?: string
    errorMessage?: string
  }>
  systemStatus: {
    totalSenses: number
    activeSenses: number
    totalRules: number
    activeRules: number
    notificationsToday: number
    lastCronRun?: string
    lastRuleEvaluation?: string
    lastNotificationProcessed?: string
  }
}

export default function SensesDiagnosticsPage() {
  const [data, setData] = useState<DiagnosticData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAura, setSelectedAura] = useState<string>('all')
  const [testingSense, setTestingSense] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDiagnosticData = async (skipLoading = false) => {
    try {
      if (!skipLoading) setLoading(true)
      setRefreshing(true)
      setError(null)

      const response = await fetch('/api/debug/senses-diagnostics')
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diagnostic data')
      console.error('Diagnostics fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const testSenseData = async (senseId: string) => {
    try {
      setTestingSense(senseId)
      const response = await fetch('/api/debug/test-sense-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senseId, auraId: selectedAura !== 'all' ? selectedAura : null })
      })
      
      const result = await response.json()
      console.log(`Test result for ${senseId}:`, result)
      
      // Refresh data to show updated values
      await fetchDiagnosticData(true)
    } catch (err) {
      console.error(`Failed to test sense ${senseId}:`, err)
    } finally {
      setTestingSense(null)
    }
  }

  const triggerNotificationTest = async () => {
    try {
      console.log('Sending test notification...')
      const response = await fetch('/api/debug/test-simple-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auraId: selectedAura !== 'all' ? selectedAura : data?.auras[0]?.id,
          channel: 'IN_APP',
          message: 'Test notification from Senses Diagnostics'
        })
      })
      
      const result = await response.json()
      console.log('Test notification result:', result)
      
      if (response.ok) {
        // Refresh to show new notification
        setTimeout(() => fetchDiagnosticData(true), 2000)
      } else {
        console.error('Test notification failed:', result)
      }
    } catch (err) {
      console.error('Failed to send test notification:', err)
    }
  }

  const copyDiagnosticData = () => {
    if (!data) return
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      systemStatus: data.systemStatus,
      aurasSummary: data.auras.map(a => ({
        name: a.name,
        enabled: a.enabled,
        senses: a.senseCount,
        rules: a.ruleCount
      })),
      sensesSummary: data.senseData.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        status: s.status,
        hasValue: s.value !== undefined,
        lastUpdate: s.lastUpdate
      }))
    }
    
    navigator.clipboard.writeText(JSON.stringify(diagnostic, null, 2))
  }

  useEffect(() => {
    fetchDiagnosticData()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-2 text-lg">Loading diagnostics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Diagnostics Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => fetchDiagnosticData()} 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Senses Diagnostics
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and debug sensor data, connections, and notification system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={copyDiagnosticData}
            variant="outline"
            size="sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Report
          </Button>
          <Button
            onClick={() => fetchDiagnosticData()}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Senses</p>
                <p className="text-2xl font-bold">
                  {data?.systemStatus.activeSenses || 0}/{data?.systemStatus.totalSenses || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold">
                  {data?.systemStatus.activeRules || 0}/{data?.systemStatus.totalRules || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications Today</p>
                <p className="text-2xl font-bold">{data?.systemStatus.notificationsToday || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Cron Run</p>
                <p className="text-sm">
                  {formatDateSafely(data?.systemStatus.lastCronRun, 'HH:mm:ss')}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aura Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Filter by Aura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedAura === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedAura('all')}
            >
              All Auras
            </Button>
            {data?.auras.map(aura => (
              <Button
                key={aura.id}
                variant={selectedAura === aura.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAura(aura.id)}
                className={cn(
                  !aura.enabled && "opacity-50"
                )}
              >
                {aura.name}
                {!aura.enabled && <XCircle className="h-3 w-3 ml-1" />}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="senses" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="senses">Sensor Data</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="senses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.senseData.map(sense => (
              <Card key={sense.id} className={cn(
                "border-2",
                sense.status === 'active' && "border-green-200 bg-green-50",
                sense.status === 'warning' && "border-yellow-200 bg-yellow-50",
                sense.status === 'error' && "border-red-200 bg-red-50",
                sense.status === 'inactive' && "border-gray-200 bg-gray-50"
              )}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center">
                      {sense.status === 'active' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />}
                      {sense.status === 'warning' && <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />}
                      {sense.status === 'error' && <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                      {sense.status === 'inactive' && <XCircle className="h-4 w-4 mr-2 text-gray-400" />}
                      {sense.name}
                    </span>
                    <Badge variant={
                      sense.type === 'connected' ? 'default' : 
                      sense.type === 'location' ? 'secondary' :
                      sense.type === 'data' ? 'outline' : 'destructive'
                    }>
                      {sense.type}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    ID: {sense.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {sense.value && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Current Value</Label>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {typeof sense.value === 'object' ? JSON.stringify(sense.value, null, 2) : sense.value}
                      </pre>
                    </div>
                  )}
                  
                  {sense.config && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Configuration</Label>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(sense.config, null, 2)}
                      </pre>
                    </div>
                  )}

                  {sense.connections && sense.connections.length > 0 && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Connections ({sense.connections.length})</Label>
                      <div className="space-y-1 mt-1">
                        {sense.connections.map((conn: any, idx: number) => (
                          <div key={idx} className="text-xs bg-blue-50 p-2 rounded">
                            <span className="font-medium">{conn.name || conn.providerId}</span>
                            {conn.accountEmail && <span className="text-gray-600 ml-2">({conn.accountEmail})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sense.error && (
                    <div>
                      <Label className="text-xs font-medium text-red-600">Error</Label>
                      <p className="text-xs text-red-700 bg-red-50 p-2 rounded mt-1">{sense.error}</p>
                    </div>
                  )}

                  {sense.lastUpdate && (
                    <p className="text-xs text-gray-500">
                      Last updated: {format(new Date(sense.lastUpdate), 'MMM dd, HH:mm:ss')}
                    </p>
                  )}

                  <Button
                    onClick={() => testSenseData(sense.id)}
                    disabled={testingSense === sense.id}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    {testingSense === sense.id ? (
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-3 w-3 mr-2" />
                    )}
                    Test Data Fetch
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          {Object.entries(data?.oauthConnections || {}).map(([senseType, connections]: [string, any]) => (
            <Card key={senseType}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  {senseType} Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connections.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No connections found</p>
                ) : (
                  <div className="space-y-2">
                    {connections.map((conn: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{conn.name || conn.provider_id || conn.sense_type}</span>
                          {(conn.account_email || conn.accountEmail) && (
                            <span className="text-sm text-gray-600 ml-2">({conn.account_email || conn.accountEmail})</span>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Connected: {formatDateSafely(conn.created_at || conn.connected_at || conn.connectedAt, 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                        <Badge variant={conn.isActive ? 'default' : 'secondary'}>
                          {conn.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Notifications</h3>
            <div className="flex gap-2">
              <Button onClick={triggerNotificationTest} size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
              <Button 
                onClick={async () => {
                  console.log('Processing pending notifications...')
                  try {
                    const response = await fetch('/api/notifications/process-pending', {
                      method: 'POST'
                    })
                    const result = await response.json()
                    console.log('Process result:', result)
                    
                    if (result.success) {
                      if (result.processed > 0) {
                        toast.success(`Processed ${result.processed} notifications successfully!`)
                        // Refresh data after processing
                        setData(prev => prev ? { ...prev, lastUpdate: Date.now() } : null)
                      } else if (result.failed > 0) {
                        toast.error(`All ${result.failed} notifications failed. Check console for details.`)
                        console.log('Failed notification details:', result.debug?.failedErrors)
                      } else {
                        toast.info('No pending notifications to process')
                      }
                    } else {
                      toast.error(`Failed to process: ${result.error}`)
                    }
                  } catch (error) {
                    console.error('Process error:', error)
                    toast.error('Failed to process notifications')
                  }
                }}
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Zap className="h-4 w-4 mr-2" />
                Process Pending
              </Button>
              
              <Button 
                onClick={async () => {
                  console.log('Checking database schema...')
                  try {
                    const response = await fetch('/api/debug/check-db-schema')
                    const result = await response.json()
                    console.log('Database schema check:', result)
                    
                    const issues = []
                    if (!result.results.proactive_messages?.exists) issues.push('proactive_messages')
                    if (!result.results.conversations?.exists) issues.push('conversations') 
                    if (!result.results.messages?.exists) issues.push('messages')
                    if (!result.results.auras?.exists) issues.push('auras')
                    
                    if (issues.length > 0) {
                      toast.error(`Missing tables: ${issues.join(', ')}`)
                    } else {
                      toast.success(`Database schema OK. ${result.results.pending_notifications?.count || 0} pending notifications`)
                    }
                  } catch (error) {
                    console.error('Schema check error:', error)
                    toast.error('Failed to check database schema')
                  }
                }}
                size="sm"
                variant="outline"
              >
                <Database className="h-4 w-4 mr-2" />
                Check DB
              </Button>
              
              <Button 
                onClick={async () => {
                  console.log('Checking messages accessibility...')
                  try {
                    const response = await fetch('/api/debug/check-messages')
                    const result = await response.json()
                    console.log('Message check results:', result)
                    
                    const serviceCount = result.results?.serviceRoleMessages?.count || 0
                    const userCount = result.results?.userMessages?.count || 0
                    const totalConvMessages = result.results?.allConversationMessages?.count || 0
                    
                    if (serviceCount === 0) {
                      toast.error('Messages not found in database!')
                    } else if (userCount === 0 && serviceCount > 0) {
                      toast.error(`RLS blocking access! ${serviceCount} messages exist but user can't see them`)
                    } else if (userCount === serviceCount) {
                      toast.success(`✅ Found ${serviceCount} messages. Total in conversation: ${totalConvMessages}`)
                    } else {
                      toast.warning(`Partial access: ${userCount}/${serviceCount} messages visible to user`)
                    }
                  } catch (error) {
                    console.error('Message check error:', error)
                    toast.error('Failed to check message accessibility')
                  }
                }}
                size="sm"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Check Messages
              </Button>
              
              <Button 
                onClick={async () => {
                  const conversationId = '2f72d024-48fe-4dae-be2b-c5addb5fa0f0'
                  console.log(`Testing conversation API for: ${conversationId}`)
                  try {
                    const response = await fetch(`/api/conversations/${conversationId}/messages`)
                    const result = await response.json()
                    console.log('Conversation API result:', result)
                    
                    if (result.conversation) {
                      const messageCount = result.messages?.length || 0
                      toast.success(`✅ Conversation API working! Found ${messageCount} messages`)
                      if (messageCount > 0) {
                        console.log('Sample messages:', result.messages.slice(-3))
                      }
                    } else {
                      toast.error(`API Error: ${result.error || 'No conversation data'}`)
                    }
                  } catch (error) {
                    console.error('Conversation API error:', error)
                    toast.error('Failed to test conversation API')
                  }
                }}
                size="sm"
                variant="outline"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Test Conv API
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {data?.notifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  No notifications found
                </CardContent>
              </Card>
            ) : (
              data?.notifications.map((notification: any) => (
                <Card key={notification.id} className={cn(
                  "border-l-4",
                  notification.status === 'DELIVERED' && "border-l-green-500",
                  notification.status === 'FAILED' && "border-l-red-500",
                  notification.status === 'QUEUED' && "border-l-yellow-500"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{notification.auraName}</span>
                      <Badge variant={
                        notification.status === 'DELIVERED' ? 'default' :
                        notification.status === 'FAILED' ? 'destructive' : 'secondary'
                      }>
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Created: {formatDateSafely(notification.createdAt, 'MMM dd, HH:mm:ss')}</div>
                      {notification.deliveredAt && (
                        <div>Delivered: {formatDateSafely(notification.deliveredAt, 'MMM dd, HH:mm:ss')}</div>
                      )}
                      {notification.errorMessage && (
                        <div className="text-red-600">Error: {notification.errorMessage}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Rules Status</CardTitle>
              <CardDescription>
                Rules evaluation and trigger monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Rule diagnostics coming soon...
                <br />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('/api/debug/enum-values', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Debug Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Auras:</span>
                    <span className="font-medium">{data?.auras.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Auras:</span>
                    <span className="font-medium">{data?.auras.filter(a => a.enabled).length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Rules:</span>
                    <span className="font-medium">{data?.systemStatus.totalRules || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Rules:</span>
                    <span className="font-medium">{data?.systemStatus.activeRules || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Last Rule Evaluation:</span>
                    <span className="font-medium">
                      {formatDateSafely(data?.systemStatus.lastRuleEvaluation, 'HH:mm:ss')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Notification:</span>
                    <span className="font-medium">
                      {formatDateSafely(data?.systemStatus.lastNotificationProcessed, 'HH:mm:ss')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/api/debug/senses', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Raw Senses Data
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/api/debug/subscription-guard', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test Subscription Guard
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={triggerNotificationTest}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export & Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={copyDiagnosticData}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Diagnostic Report
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    const dataStr = JSON.stringify(data, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `senses-diagnostic-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}