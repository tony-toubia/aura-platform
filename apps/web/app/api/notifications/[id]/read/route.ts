// app/api/notifications/[id]/read/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/services/notification-service'

interface MarkReadResponse {
  success: boolean
  readAt: string
}

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notificationId = params.id

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    // Verify notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('proactive_messages')
      .select(`
        id,
        status,
        aura:auras!inner(user_id)
      `)
      .eq('id', notificationId)
      .single()

    if (fetchError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.aura.user_id !== user.id) {
      return NextResponse.json({ error: 'Notification not owned by user' }, { status: 403 })
    }

    // Only mark delivered notifications as read
    if (notification.status !== 'DELIVERED') {
      return NextResponse.json({ 
        error: 'Only delivered notifications can be marked as read',
        currentStatus: notification.status
      }, { status: 400 })
    }

    // Mark as read using the notification service
    await NotificationService.markAsRead(notificationId)

    const readAt = new Date().toISOString()

    const response: MarkReadResponse = {
      success: true,
      readAt
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}