// components/notifications/notification-history.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNotifications } from '@/hooks/use-notifications'
import { formatDistanceToNow, format } from 'date-fns'
import { 
  Bell, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react'
import type { ProactiveMessage, NotificationChannel, NotificationStatus } from '@/types/notifications'

const CHANNEL_ICONS = {
  IN_APP: <MessageSquare className="h-4 w-4" />,
  WEB_PUSH: <Bell className="h-4 w-4" />,
  SMS: <Smartphone className="h-4 w-4" />,
  WHATSAPP: <MessageCircle className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />
}

const STATUS_ICONS = {
  PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
  QUEUED: <Clock className="h-4 w-4 text-blue-500" />,
  DELIVERED: <CheckCircle className="h-4 w-4 text-green-500" />,
  READ: <Eye className="h-4 w-4 text-green-600" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  EXPIRED: <XCircle className="h-4 w-4 text-gray-500" />
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  QUEUED: 'bg-blue-100 text-blue-800 border-blue-200', 
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  READ: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200'
}

interface NotificationHistoryProps {
  auraId?: string
  auraName?: string
}

export function NotificationHistory({ auraId, auraName }: NotificationHistoryProps) {
  const { history, loadHistory, markAsRead } = useNotifications()
  const [filters, setFilters] = useState({
    status: '' as NotificationStatus | '',
    channel: '' as NotificationChannel | '',
    startDate: '',
    endDate: ''
  })

  // Load initial history
  useEffect(() => {
    loadHistory({
      auraId,
      limit: 20
    })
  }, [auraId, loadHistory])

  // Apply filters
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    loadHistory({
      auraId,
      status: newFilters.status || undefined,
      startDate: newFilters.startDate || undefined,
      endDate: newFilters.endDate || undefined,
      limit: 20
    })
  }

  const handleLoadMore = () => {
    loadHistory({
      auraId,
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      limit: 20,
      offset: history.notifications.length
    })
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleRefresh = () => {
    loadHistory({
      auraId,
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      limit: 20
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification History</h3>
          <p className="text-sm text-muted-foreground">
            {auraId 
              ? `Notifications from ${auraName || 'this aura'}`
              : 'All your notifications'
            }
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={history.loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${history.loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="QUEUED">Queued</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Channel</Label>
              <Select
                value={filters.channel}
                onValueChange={(value) => handleFilterChange('channel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All channels</SelectItem>
                  <SelectItem value="IN_APP">In-App</SelectItem>
                  <SelectItem value="WEB_PUSH">Web Push</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {history.loading && history.notifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading notifications...</span>
            </CardContent>
          </Card>
        ) : history.notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-medium text-muted-foreground">No notifications found</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {auraId 
                  ? 'This aura hasn\'t sent any notifications yet.'
                  : 'You haven\'t received any notifications yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {history.notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}

            {/* Load More Button */}
            {history.hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={history.loading}
                >
                  {history.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Stats */}
      {history.notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{history.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {history.notifications.filter(n => n.status === 'DELIVERED' || n.status === 'READ').length}
                </div>
                <div className="text-xs text-muted-foreground">Delivered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {history.notifications.filter(n => n.status === 'READ').length}
                </div>
                <div className="text-xs text-muted-foreground">Read</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {history.notifications.filter(n => n.status === 'FAILED').length}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface NotificationCardProps {
  notification: ProactiveMessage & { auraName?: string; ruleName?: string }
  onMarkAsRead: (id: string) => void
}

function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  return (
    <Card className={notification.status === 'DELIVERED' ? 'bg-blue-50/30' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {CHANNEL_ICONS[notification.deliveryChannel]}
                <span className="text-sm font-medium">
                  {notification.deliveryChannel.toLowerCase().replace('_', ' ')}
                </span>
              </div>
              
              <Badge className={STATUS_COLORS[notification.status]}>
                <div className="flex items-center space-x-1">
                  {STATUS_ICONS[notification.status]}
                  <span>{notification.status.toLowerCase()}</span>
                </div>
              </Badge>
              
              {notification.ruleName && (
                <Badge variant="secondary" className="text-xs">
                  {notification.ruleName}
                </Badge>
              )}
            </div>

            {/* Message */}
            <div className="prose prose-sm max-w-none">
              <p className="text-sm">{notification.message}</p>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>
                  Created {formatDistanceToNow(new Date(notification.createdAt))} ago
                </span>
                {notification.deliveredAt && (
                  <span>
                    Delivered {formatDistanceToNow(new Date(notification.deliveredAt))} ago
                  </span>
                )}
                {notification.readAt && (
                  <span>
                    Read {formatDistanceToNow(new Date(notification.readAt))} ago
                  </span>
                )}
              </div>
              
              {notification.auraName && (
                <span>from {notification.auraName}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          {notification.status === 'DELIVERED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="ml-4"
            >
              <Eye className="h-4 w-4" />
              Mark as read
            </Button>
          )}
        </div>

        {/* Error message */}
        {notification.errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="text-sm text-red-700">{notification.errorMessage}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}