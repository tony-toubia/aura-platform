// lib/services/channels/in-app-messenger.ts

import { createClient } from '@/lib/supabase/client'
import type { DeliveryResult, ProactiveMessage } from '@/types/notifications'

interface RealtimeUpdate {
  type: 'proactive_message'
  auraId: string
  conversationId: string
  message: any
  timestamp: string
}

export class InAppMessenger {
  private supabase = createClient()

  /**
   * Deliver a proactive message to the in-app conversation
   */
  async deliver(notification: any): Promise<DeliveryResult> {
    try {
      console.log(`📱 Delivering in-app message: ${notification.id}`)

      // Ensure we have a conversation
      const conversationId = await this.ensureConversation(notification.aura_id)

      // Add message to conversation as a regular message
      await this.addMessageToConversation(conversationId, notification)

      // Update conversation unread counters
      await this.updateUnreadStatus(conversationId)

      // Trigger real-time update for connected clients
      await this.notifyClient(notification.aura.user_id, {
        type: 'proactive_message',
        auraId: notification.aura_id,
        conversationId,
        message: notification,
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        messageId: notification.id
      }
    } catch (error) {
      console.error('❌ In-app delivery failed:', error)
      return {
        success: false,
        error: String(error),
        retryable: true
      }
    }
  }

  /**
   * Create or get existing conversation for the aura
   */
  private async ensureConversation(auraId: string): Promise<string> {
    // First try to find an existing active conversation
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

    // Create a new conversation
    const sessionId = `proactive_${Date.now()}_${Math.random().toString(36).slice(2)}`
    
    const { data: newConversation, error: createError } = await this.supabase
      .from('conversations')
      .insert({
        aura_id: auraId,
        session_id: sessionId,
        context: {
          type: 'proactive',
          createdBy: 'system'
        }
      })
      .select('id')
      .single()

    if (createError) {
      throw new Error(`Failed to create conversation: ${createError.message}`)
    }

    return newConversation.id
  }

  /**
   * Add the proactive message as a regular conversation message
   */
  private async addMessageToConversation(
    conversationId: string,
    notification: any
  ): Promise<void> {
    // Add as an aura message in the conversation
    const messageData = {
      conversation_id: conversationId,
      role: 'aura',
      content: notification.message,
      metadata: {
        type: 'proactive',
        ruleId: notification.rule_id,
        ruleName: notification.rule?.name,
        triggerData: notification.trigger_data,
        notificationId: notification.id,
        influences: [`Rule: ${notification.rule?.name || 'Unknown'}`],
        senseData: this.extractSenseData(notification.trigger_data)
      }
    }

    const { error } = await this.supabase
      .from('messages')
      .insert(messageData)

    if (error) {
      throw new Error(`Failed to add message to conversation: ${error.message}`)
    }
  }

  /**
   * Update conversation's unread status for proactive messages
   */
  private async updateUnreadStatus(conversationId: string): Promise<void> {
    // Get current unread count
    const { data: conversation, error: fetchError } = await this.supabase
      .from('conversations')
      .select('unread_proactive_count')
      .eq('id', conversationId)
      .single()

    if (fetchError) {
      console.error('⚠️  Failed to fetch conversation for unread update:', fetchError)
      return
    }

    const currentCount = conversation?.unread_proactive_count || 0

    // Update unread counters
    const { error: updateError } = await this.supabase
      .from('conversations')
      .update({
        has_unread_proactive: true,
        unread_proactive_count: currentCount + 1
      })
      .eq('id', conversationId)

    if (updateError) {
      console.error('⚠️  Failed to update unread status:', updateError)
    }
  }

  /**
   * Trigger real-time update for connected clients
   */
  private async notifyClient(userId: string, update: RealtimeUpdate): Promise<void> {
    try {
      // Send real-time update via Supabase Realtime
      // This will be picked up by clients listening to the notifications channel
      const { error } = await this.supabase
        .from('proactive_messages')
        .update({ 
          metadata: { 
            ...update,
            realtimeTriggered: true 
          } 
        })
        .eq('id', update.message.id)

      if (error) {
        console.error('⚠️  Failed to trigger realtime update:', error)
      } else {
        console.log(`📡 Real-time update sent for user ${userId}`)
      }
    } catch (error) {
      console.error('⚠️  Error sending real-time notification:', error)
    }
  }

  /**
   * Extract sense data for metadata compatibility with existing system
   */
  private extractSenseData(triggerData: any): any[] {
    if (!triggerData?.sensorData) return []

    return Object.entries(triggerData.sensorData).map(([senseId, data]) => ({
      sense: senseId,
      timestamp: new Date().toISOString()
    }))
  }

  /**
   * Mark proactive messages as read when user views conversation
   */
  async markConversationProactiveMessagesAsRead(conversationId: string): Promise<void> {
    try {
      // Mark all unread proactive messages in this conversation as read
      const { error: updateProactiveError } = await this.supabase
        .from('proactive_messages')
        .update({
          status: 'READ',
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .in('status', ['DELIVERED'])

      if (updateProactiveError) {
        console.error('⚠️  Failed to mark proactive messages as read:', updateProactiveError)
      }

      // Reset conversation unread counters
      const { error: updateConversationError } = await this.supabase
        .from('conversations')
        .update({
          has_unread_proactive: false,
          unread_proactive_count: 0
        })
        .eq('id', conversationId)

      if (updateConversationError) {
        console.error('⚠️  Failed to reset conversation unread counters:', updateConversationError)
      }

    } catch (error) {
      console.error('❌ Failed to mark proactive messages as read:', error)
    }
  }

  /**
   * Get unread proactive message count for a user
   */
  async getUnreadCount(userId: string, auraId?: string): Promise<number> {
    try {
      let query = this.supabase
        .from('proactive_messages')
        .select('id', { count: 'exact' })
        .eq('status', 'DELIVERED')

      if (auraId) {
        query = query.eq('aura_id', auraId)
      } else {
        // Get count across all user's auras
        const { data: userAuras } = await this.supabase
          .from('auras')
          .select('id')
          .eq('user_id', userId)

        if (userAuras && userAuras.length > 0) {
          query = query.in('aura_id', userAuras.map(a => a.id))
        } else {
          return 0
        }
      }

      const { count, error } = await query

      if (error) {
        console.error('⚠️  Failed to get unread count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('❌ Failed to get unread count:', error)
      return 0
    }
  }

  /**
   * Get recent proactive messages for a conversation
   */
  async getRecentProactiveMessages(
    conversationId: string, 
    limit: number = 10
  ): Promise<ProactiveMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from('proactive_messages')
        .select(`
          *,
          rule:behavior_rules(name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('⚠️  Failed to fetch recent proactive messages:', error)
        return []
      }

      return (data || []).map(msg => ({
        ...msg,
        createdAt: msg.created_at,
        deliveredAt: msg.delivered_at,
        readAt: msg.read_at,
        deliveryChannel: msg.delivery_channel,
        retryCount: msg.retry_count,
        errorMessage: msg.error_message
      }))
    } catch (error) {
      console.error('❌ Failed to fetch recent proactive messages:', error)
      return []
    }
  }
}