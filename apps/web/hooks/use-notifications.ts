// hooks/use-notifications.ts

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { 
  NotificationPreference, 
  ProactiveMessage, 
  GetHistoryResponse,
  NotificationChannel,
  UpdatePreferencesRequest 
} from '@/types/notifications'

interface UseNotificationsReturn {
  // Preferences
  preferences: {
    global: NotificationPreference[]
    byAura: Record<string, NotificationPreference[]>
    loading: boolean
    error: string | null
  }
  
  // History
  history: {
    notifications: ProactiveMessage[]
    total: number
    hasMore: boolean
    loading: boolean
    error: string | null
  }
  
  // Unread count
  unreadCount: number
  
  // Actions
  updatePreferences: (request: UpdatePreferencesRequest) => Promise<void>
  loadHistory: (options?: {
    auraId?: string
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  sendTestNotification: (auraId: string, channel: NotificationChannel, message: string) => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth()
  const supabase = createClient()
  
  // Preferences state
  const [preferences, setPreferences] = useState<{
    global: NotificationPreference[]
    byAura: Record<string, NotificationPreference[]>
    loading: boolean
    error: string | null
  }>({
    global: [],
    byAura: {},
    loading: false,
    error: null
  })

  // History state  
  const [history, setHistory] = useState<{
    notifications: ProactiveMessage[]
    total: number
    hasMore: boolean
    loading: boolean
    error: string | null
  }>({
    notifications: [],
    total: 0,
    hasMore: false,
    loading: false,
    error: null
  })

  // Unread count
  const [unreadCount, setUnreadCount] = useState(0)

  /**
   * Load user's notification preferences
   */
  const loadPreferences = useCallback(async () => {
    if (!user) return

    setPreferences(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/notifications/preferences')
      if (!response.ok) {
        throw new Error('Failed to load preferences')
      }

      const data = await response.json()
      setPreferences(prev => ({
        ...prev,
        global: data.global || [],
        byAura: data.byAura || {},
        loading: false
      }))
    } catch (error) {
      console.error('Failed to load preferences:', error)
      setPreferences(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [user])

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback(async (request: UpdatePreferencesRequest) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update preferences')
      }

      // Reload preferences after update
      await loadPreferences()
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }, [loadPreferences])

  /**
   * Load notification history
   */
  const loadHistory = useCallback(async (options: {
    auraId?: string
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  } = {}) => {
    if (!user) return

    setHistory(prev => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams()
      if (options.auraId) params.append('auraId', options.auraId)
      if (options.status) params.append('status', options.status)
      if (options.startDate) params.append('startDate', options.startDate)
      if (options.endDate) params.append('endDate', options.endDate)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())

      const response = await fetch(`/api/notifications/history?${params}`)
      if (!response.ok) {
        throw new Error('Failed to load history')
      }

      const data: GetHistoryResponse = await response.json()
      
      setHistory(prev => ({
        ...prev,
        notifications: options.offset ? [...prev.notifications, ...data.notifications] : data.notifications,
        total: data.total,
        hasMore: data.hasMore,
        loading: false
      }))
    } catch (error) {
      console.error('Failed to load history:', error)
      setHistory(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [user])

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }

      // Update local state
      setHistory(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId
            ? { ...n, status: 'READ', readAt: new Date().toISOString() }
            : n
        )
      }))

      // Refresh unread count
      await refreshUnreadCount()
    } catch (error) {
      console.error('Failed to mark as read:', error)
      throw error
    }
  }, [])

  /**
   * Send test notification
   */
  const sendTestNotification = useCallback(async (
    auraId: string, 
    channel: NotificationChannel, 
    message: string
  ) => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auraId, channel, message })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send test notification')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to send test notification:', error)
      throw error
    }
  }, [])

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return

    try {
      // First get user's aura IDs
      const { data: auras, error: auraError } = await supabase
        .from('auras')
        .select('id')
        .eq('user_id', user.id)

      if (auraError || !auras || auras.length === 0) {
        setUnreadCount(0)
        return
      }

      const auraIds = auras.map(a => a.id)

      // Get unread count from local supabase query
      const { count, error } = await supabase
        .from('proactive_messages')
        .select('id', { count: 'exact' })
        .eq('status', 'DELIVERED')
        .in('aura_id', auraIds)

      if (error) {
        console.error('Failed to get unread count:', error)
      } else {
        setUnreadCount(count || 0)
      }
    } catch (error) {
      console.error('Failed to refresh unread count:', error)
    }
  }, [user, supabase])

  /**
   * Set up real-time subscription for new notifications
   */
  useEffect(() => {
    if (!user) return

    let subscription: any = null

    const setupRealtime = async () => {
      try {
        // Get user's aura IDs
        const { data: auras } = await supabase
          .from('auras')
          .select('id')
          .eq('user_id', user.id)

        if (!auras || auras.length === 0) return

        const auraIds = auras.map(a => a.id)

        // Subscribe to proactive messages for user's auras
        subscription = supabase
          .channel('proactive_notifications')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'proactive_messages',
            filter: `aura_id=in.(${auraIds.join(',')})`
          }, (payload) => {
            console.log('📩 New proactive notification:', payload.new)
            refreshUnreadCount()
          })
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'proactive_messages',
            filter: `aura_id=in.(${auraIds.join(',')})`
          }, (payload) => {
            console.log('📝 Proactive notification updated:', payload.new)
            refreshUnreadCount()
          })
          .subscribe()

      } catch (error) {
        console.error('Failed to setup realtime subscription:', error)
      }
    }

    setupRealtime()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [user, supabase, refreshUnreadCount])

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      loadPreferences()
      refreshUnreadCount()
    }
  }, [user, loadPreferences, refreshUnreadCount])

  return {
    preferences,
    history,
    unreadCount,
    updatePreferences,
    loadHistory,
    markAsRead,
    sendTestNotification,
    refreshUnreadCount
  }
}