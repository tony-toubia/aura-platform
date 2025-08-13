// lib/services/notification-service.ts

import { createClient } from '@/lib/supabase/client'
import { InAppMessenger } from './channels/in-app-messenger'
import type { 
  NotificationPayload,
  DeliveryResult,
  NotificationChannel,
  NotificationPreference,
  QuietHours,
  NotificationErrorCode
} from '@/types/notifications'
import type { Aura } from '@/types'

interface QueuedNotification {
  id: string
  auraId: string
  ruleId?: string
  message: string
  priority: number
  channels: NotificationChannel[]
  context: Record<string, any>
  userId: string
}

interface ProcessResult {
  processed: number
  succeeded: number
  failed: number
  errors: string[]
}

export class NotificationService {
  private static supabase = createClient()
  private static inAppMessenger = new InAppMessenger()

  /**
   * Queue a notification for delivery
   */
  static async queue(payload: NotificationPayload): Promise<string> {
    try {
      // Get aura to determine user
      const { data: aura, error: auraError } = await this.supabase
        .from('auras')
        .select('user_id')
        .eq('id', payload.auraId)
        .single()

      if (auraError || !aura) {
        throw new Error(`Failed to find aura: ${auraError?.message}`)
      }

      // Create conversation if needed (for in-app messages)
      let conversationId: string | null = null
      if (payload.channels.includes('IN_APP')) {
        conversationId = await this.getOrCreateConversation(payload.auraId)
      }

      // Create proactive message record
      const { data: notification, error: insertError } = await this.supabase
        .from('proactive_messages')
        .insert({
          aura_id: payload.auraId,
          rule_id: payload.ruleId,
          conversation_id: conversationId,
          message: payload.message,
          trigger_data: payload.context,
          status: 'QUEUED',
          delivery_channel: payload.channels[0] || 'IN_APP', // Primary channel
          metadata: {
            allChannels: payload.channels,
            priority: payload.priority,
            queuedAt: new Date().toISOString()
          }
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(`Failed to queue notification: ${insertError.message}`)
      }

      console.log(`📩 Notification queued: ${notification.id}`)
      
      // Process immediately (in production this would be handled by a queue processor)
      setImmediate(() => this.processNotification(notification.id))
      
      return notification.id
    } catch (error) {
      console.error('❌ Failed to queue notification:', error)
      throw error
    }
  }

  /**
   * Process a specific queued notification
   */
  static async processNotification(notificationId: string): Promise<void> {
    try {
      // Get notification details
      const { data: notification, error } = await this.supabase
        .from('proactive_messages')
        .select(`
          *,
          aura:auras(user_id, name),
          rule:behavior_rules(name, notification_channels)
        `)
        .eq('id', notificationId)
        .single()

      if (error || !notification) {
        console.error('❌ Notification not found:', notificationId)
        return
      }

      if (notification.status !== 'QUEUED') {
        console.log(`ℹ️  Notification ${notificationId} already processed (status: ${notification.status})`)
        return
      }

      const userId = notification.aura.user_id
      const channels = notification.metadata?.allChannels || [notification.delivery_channel]
      
      // Check delivery constraints for each channel
      const deliveryResults: DeliveryResult[] = []
      
      for (const channel of channels) {
        try {
          const canDeliver = await this.checkDeliveryConstraints(userId, channel, notification.aura_id)
          
          if (!canDeliver.allowed) {
            console.log(`⏸️  Delivery blocked for channel ${channel}: ${canDeliver.reason}`)
            continue
          }

          // Route to appropriate channel
          const result = await this.routeNotification(notification, channel)
          deliveryResults.push({ ...result, channel })
          
          // Log delivery attempt
          await this.logDeliveryAttempt(notificationId, channel, result)
          
          if (result.success) {
            console.log(`✅ Notification delivered via ${channel}: ${notificationId}`)
          } else {
            console.error(`❌ Failed to deliver via ${channel}: ${result.error}`)
          }
        } catch (error) {
          console.error(`💥 Channel delivery error (${channel}):`, error)
          const result = { success: false, error: String(error) }
          deliveryResults.push({ ...result, channel })
          await this.logDeliveryAttempt(notificationId, channel, result)
        }
      }

      // Update notification status
      const hasSuccessfulDelivery = deliveryResults.some(r => r.success)
      const allFailed = deliveryResults.every(r => !r.success)
      
      const updates: any = {}
      if (hasSuccessfulDelivery) {
        updates.status = 'DELIVERED'
        updates.delivered_at = new Date().toISOString()
      } else if (allFailed) {
        updates.status = 'FAILED'
        updates.error_message = deliveryResults.map(r => r.error).join('; ')
      }

      if (Object.keys(updates).length > 0) {
        await this.supabase
          .from('proactive_messages')
          .update(updates)
          .eq('id', notificationId)
      }

    } catch (error) {
      console.error(`💥 Failed to process notification ${notificationId}:`, error)
      
      // Mark as failed
      await this.supabase
        .from('proactive_messages')
        .update({
          status: 'FAILED',
          error_message: String(error)
        })
        .eq('id', notificationId)
    }
  }

  /**
   * Process queued notifications (batch processing)
   */
  static async processQueue(): Promise<ProcessResult> {
    const startTime = Date.now()
    console.log('🔄 Processing notification queue')

    try {
      // Get queued notifications
      const { data: notifications, error } = await this.supabase
        .from('proactive_messages')
        .select('id')
        .eq('status', 'QUEUED')
        .order('created_at', { ascending: true })
        .limit(100) // Process in batches

      if (error) {
        throw new Error(`Failed to fetch queued notifications: ${error.message}`)
      }

      if (!notifications || notifications.length === 0) {
        return { processed: 0, succeeded: 0, failed: 0, errors: [] }
      }

      console.log(`📋 Processing ${notifications.length} queued notifications`)

      // Process each notification
      const results = await Promise.allSettled(
        notifications.map(n => this.processNotification(n.id))
      )

      let succeeded = 0
      let failed = 0
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          succeeded++
        } else {
          failed++
          errors.push(`Notification ${notifications[index].id}: ${result.reason}`)
        }
      })

      const duration = Date.now() - startTime
      console.log(`✅ Queue processing completed in ${duration}ms: ${succeeded} succeeded, ${failed} failed`)

      return {
        processed: notifications.length,
        succeeded,
        failed,
        errors
      }
    } catch (error) {
      console.error('💥 Queue processing failed:', error)
      return {
        processed: 0,
        succeeded: 0,
        failed: 1,
        errors: [String(error)]
      }
    }
  }

  /**
   * Route notification to appropriate channel
   */
  private static async routeNotification(
    notification: any,
    channel: NotificationChannel
  ): Promise<DeliveryResult> {
    switch (channel) {
      case 'IN_APP':
        return await this.inAppMessenger.deliver(notification)
        
      case 'WEB_PUSH':
        // TODO: Implement web push delivery
        return { success: false, error: 'Web push not implemented yet' }
        
      case 'SMS':
        // TODO: Implement SMS delivery
        return { success: false, error: 'SMS not implemented yet' }
        
      case 'WHATSAPP':
        // TODO: Implement WhatsApp delivery
        return { success: false, error: 'WhatsApp not implemented yet' }
        
      case 'EMAIL':
        // TODO: Implement email delivery
        return { success: false, error: 'Email not implemented yet' }
        
      default:
        return { success: false, error: `Unknown channel: ${channel}` }
    }
  }

  /**
   * Check if we can deliver to a specific channel for a user
   */
  private static async checkDeliveryConstraints(
    userId: string,
    channel: NotificationChannel,
    auraId?: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId, channel, auraId)
      
      if (!preferences.enabled) {
        return { allowed: false, reason: 'Channel disabled in preferences' }
      }

      // Check quiet hours
      if (preferences.quietHoursEnabled) {
        const inQuietHours = this.isInQuietHours(preferences)
        if (inQuietHours) {
          return { allowed: false, reason: 'Currently in quiet hours' }
        }
      }

      // Check daily rate limits
      if (preferences.maxPerDay && preferences.maxPerDay > 0) {
        const todayCount = await this.getTodayNotificationCount(userId, channel, auraId)
        if (todayCount >= preferences.maxPerDay) {
          return { allowed: false, reason: 'Daily notification limit exceeded' }
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('⚠️  Error checking delivery constraints:', error)
      // Allow delivery if we can't check constraints
      return { allowed: true, reason: 'Could not verify constraints' }
    }
  }

  /**
   * Get user preferences for a specific channel
   */
  private static async getUserPreferences(
    userId: string,
    channel: NotificationChannel,
    auraId?: string
  ): Promise<NotificationPreference> {
    // Try to get aura-specific preference first, then fall back to global
    let { data: preference, error } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('channel', channel)
      .eq('aura_id', auraId || null)
      .single()

    if (error || !preference) {
      // Fall back to global preference
      const { data: globalPref } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('channel', channel)
        .is('aura_id', null)
        .single()

      if (globalPref) {
        preference = globalPref
      }
    }

    // Return default preferences if none found
    if (!preference) {
      return {
        id: '',
        userId,
        auraId: auraId || null,
        channel,
        enabled: true,
        quietHoursEnabled: false,
        timezone: 'UTC',
        priorityThreshold: 5,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as NotificationPreference
    }

    return preference as NotificationPreference
  }

  /**
   * Check if current time is within user's quiet hours
   */
  private static isInQuietHours(preferences: NotificationPreference): boolean {
    if (!preferences.quietHoursEnabled || !preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false
    }

    try {
      const now = new Date()
      const timezone = preferences.timezone || 'UTC'
      
      // Convert current time to user's timezone
      const userTime = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }).format(now)

      const currentTime = userTime.replace(':', '')
      const startTime = preferences.quietHoursStart.replace(':', '')
      const endTime = preferences.quietHoursEnd.replace(':', '')

      // Handle overnight quiet hours (e.g., 22:00 to 06:00)
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime
      } else {
        return currentTime >= startTime && currentTime <= endTime
      }
    } catch (error) {
      console.error('⚠️  Error checking quiet hours:', error)
      return false
    }
  }

  /**
   * Get count of notifications sent today for rate limiting
   */
  private static async getTodayNotificationCount(
    userId: string,
    channel: NotificationChannel,
    auraId?: string
  ): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let query = this.supabase
      .from('proactive_messages')
      .select('id', { count: 'exact' })
      .eq('delivery_channel', channel)
      .eq('status', 'DELIVERED')
      .gte('created_at', today.toISOString())

    if (auraId) {
      query = query.eq('aura_id', auraId)
    } else {
      // Count across all user's auras
      const { data: userAuras } = await this.supabase
        .from('auras')
        .select('id')
        .eq('user_id', userId)

      if (userAuras && userAuras.length > 0) {
        query = query.in('aura_id', userAuras.map(a => a.id))
      }
    }

    const { count, error } = await query

    if (error) {
      console.error('⚠️  Error getting notification count:', error)
      return 0
    }

    return count || 0
  }

  /**
   * Log delivery attempt for analytics
   */
  private static async logDeliveryAttempt(
    notificationId: string,
    channel: NotificationChannel,
    result: DeliveryResult
  ): Promise<void> {
    const logData: any = {
      notification_id: notificationId,
      channel,
      attempted_at: new Date().toISOString()
    }

    if (result.success) {
      logData.delivered_at = new Date().toISOString()
      logData.external_id = result.messageId
    } else {
      logData.failed_at = new Date().toISOString()
      logData.error_message = result.error
    }

    await this.supabase
      .from('notification_delivery_log')
      .insert(logData)
  }

  /**
   * Get or create conversation for in-app messaging
   */
  private static async getOrCreateConversation(auraId: string): Promise<string> {
    // Try to find existing active conversation
    const { data: existing, error: findError } = await this.supabase
      .from('conversations')
      .select('id')
      .eq('aura_id', auraId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (!findError && existing) {
      return existing.id
    }

    // Create new conversation
    const sessionId = `proactive_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const { data: newConversation, error: createError } = await this.supabase
      .from('conversations')
      .insert({
        aura_id: auraId,
        session_id: sessionId
      })
      .select('id')
      .single()

    if (createError) {
      throw new Error(`Failed to create conversation: ${createError.message}`)
    }

    return newConversation.id
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await this.supabase
      .from('proactive_messages')
      .update({
        status: 'READ',
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('status', 'DELIVERED') // Only mark delivered notifications as read
  }

  /**
   * Get notification history for a user
   */
  static async getHistory(
    userId: string,
    options: {
      auraId?: string
      status?: string
      startDate?: string
      endDate?: string
      limit?: number
      offset?: number
    } = {}
  ) {
    let query = this.supabase
      .from('proactive_messages')
      .select(`
        *,
        aura:auras!inner(name, user_id),
        rule:behavior_rules(name)
      `)
      .eq('aura.user_id', userId)
      .order('created_at', { ascending: false })

    if (options.auraId) {
      query = query.eq('aura_id', options.auraId)
    }
    if (options.status) {
      query = query.eq('status', options.status)
    }
    if (options.startDate) {
      query = query.gte('created_at', options.startDate)
    }
    if (options.endDate) {
      query = query.lte('created_at', options.endDate)
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, (options.offset || 0) + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch notification history: ${error.message}`)
    }

    return data || []
  }
}