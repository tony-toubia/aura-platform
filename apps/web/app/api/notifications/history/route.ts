// app/api/notifications/history/route.ts

import { createServerSupabase } from '@/lib/supabase/server.server'
import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/services/notification-service'
import type { GetHistoryRequest, GetHistoryResponse } from '@/types/notifications'

/**
 * GET /api/notifications/history
 * Get notification history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const options: GetHistoryRequest = {
      auraId: searchParams.get('auraId') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100
      offset: parseInt(searchParams.get('offset') || '0')
    }

    // Validate aura ownership if auraId is provided
    if (options.auraId) {
      const { data: aura, error: auraError } = await supabase
        .from('auras')
        .select('user_id')
        .eq('id', options.auraId)
        .single()

      if (auraError || !aura || aura.user_id !== user.id) {
        return NextResponse.json({ error: 'Aura not found or not owned by user' }, { status: 404 })
      }
    }

    // Get notification history
    const notifications = await NotificationService.getHistory(user.id, options)

    // Get total count for pagination
    let totalQuery = supabase
      .from('proactive_messages')
      .select('id', { count: 'exact' })
      .eq('aura.user_id', user.id)

    if (options.auraId) {
      totalQuery = totalQuery.eq('aura_id', options.auraId)
    }
    if (options.status) {
      totalQuery = totalQuery.eq('status', options.status)
    }
    if (options.startDate) {
      totalQuery = totalQuery.gte('created_at', options.startDate)
    }
    if (options.endDate) {
      totalQuery = totalQuery.lte('created_at', options.endDate)
    }

    const { count: total } = await totalQuery

    const response: GetHistoryResponse = {
      notifications: notifications.map(n => ({
        id: n.id,
        auraId: n.aura_id,
        ruleId: n.rule_id,
        conversationId: n.conversation_id,
        message: n.message,
        triggerData: n.trigger_data || {},
        metadata: n.metadata || {},
        createdAt: n.created_at,
        deliveredAt: n.delivered_at,
        readAt: n.read_at,
        status: n.status,
        deliveryChannel: n.delivery_channel,
        retryCount: n.retry_count,
        errorMessage: n.error_message,
        // Include additional context
        auraName: n.aura?.name,
        ruleName: n.rule?.name
      })),
      total: total || 0,
      hasMore: (options.offset || 0) + (options.limit || 20) < (total || 0)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching notification history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}