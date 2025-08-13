// components/notifications/notification-dashboard.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationSettings } from './notification-settings'
import { NotificationHistory } from './notification-history'
import { NotificationBadgeWrapper } from './notification-badge'
import { useNotifications } from '@/hooks/use-notifications'
import { useAuth } from '@/hooks/use-auth'
import { 
  Bell, 
  Settings, 
  History, 
  TrendingUp,
  MessageSquare,
  Smartphone,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NotificationDashboardProps {
  auras?: Array<{ id: string; name: string }>
  selectedAuraId?: string
  onAuraSelect?: (auraId: string) => void
}

export function NotificationDashboard({ 
  auras = [],
  selectedAuraId,
  onAuraSelect
}: NotificationDashboardProps) {
  const { user } = useAuth()
  const { unreadCount, history, loadHistory } = useNotifications()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [stats, setStats] = useState({
    total24h: 0,
    delivered24h: 0,
    failed24h: 0,
    channelBreakdown: {} as Record<string, number>
  })

  // Load stats on mount and when history changes
  useEffect(() => {
    if (history.notifications.length > 0) {
      const last24h = history.notifications.filter(n => {
        const createdAt = new Date(n.createdAt)
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return createdAt >= cutoff
      })

      const channelBreakdown = last24h.reduce((acc, n) => {
        acc[n.deliveryChannel] = (acc[n.deliveryChannel] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      setStats({
        total24h: last24h.length,
        delivered24h: last24h.filter(n => n.status === 'DELIVERED' || n.status === 'READ').length,
        failed24h: last24h.filter(n => n.status === 'FAILED').length,
        channelBreakdown
      })
    }
  }, [history.notifications])

  // Load initial history for stats
  useEffect(() => {
    loadHistory({ limit: 100 })
  }, [loadHistory])

  const channelIcons = {
    IN_APP: <MessageSquare className="h-4 w-4" />,
    WEB_PUSH: <Bell className="h-4 w-4" />,
    SMS: <Smartphone className="h-4 w-4" />,
    WHATSAPP: <MessageCircle className="h-4 w-4" />,
    EMAIL: <Mail className="h-4 w-4" />
  }

  const selectedAura = auras.find(a => a.id === selectedAuraId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground">
            Manage your proactive notification preferences and history
          </p>
        </div>
        
        <NotificationBadgeWrapper count={unreadCount}>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </NotificationBadgeWrapper>
      </div>

      {/* Aura Selector */}
      {auras.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aura Selection</CardTitle>
            <CardDescription>
              Choose an aura to view specific settings and history, or leave unselected for global settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedAuraId ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAuraSelect?.('')}
              >
                Global Settings
              </Button>
              {auras.map(aura => (
                <Button
                  key={aura.id}
                  variant={selectedAuraId === aura.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAuraSelect?.(aura.id)}
                >
                  {aura.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Bell className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.total24h}</div>
                    <div className="text-xs text-muted-foreground">Last 24 hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.delivered24h}</div>
                    <div className="text-xs text-muted-foreground">Delivered</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.failed24h}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Breakdown */}
          {Object.keys(stats.channelBreakdown).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Channel Breakdown (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.channelBreakdown).map(([channel, count]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {channelIcons[channel as keyof typeof channelIcons]}
                        <span className="capitalize">
                          {channel.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Notifications */}
          {history.notifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Notifications</CardTitle>
                <CardDescription>
                  Your latest proactive messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.notifications.slice(0, 5).map(notification => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      {channelIcons[notification.deliveryChannel]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{notification.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={notification.status === 'READ' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {notification.status.toLowerCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt))} ago
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {history.notifications.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setSelectedTab('history')}
                  >
                    View all notifications
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* No notifications state */}
          {history.notifications.length === 0 && !history.loading && (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-muted-foreground mb-2">
                  No notifications yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your auras will send proactive notifications when their rules are triggered
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTab('settings')}
                >
                  Configure Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <NotificationSettings 
            auraId={selectedAuraId}
            auraName={selectedAura?.name}
          />
        </TabsContent>

        <TabsContent value="history">
          <NotificationHistory 
            auraId={selectedAuraId}
            auraName={selectedAura?.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}