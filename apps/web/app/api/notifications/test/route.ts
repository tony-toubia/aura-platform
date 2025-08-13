// app/api/notifications/test/route.ts

import { createServerSupabase } from '@/lib/supabase/server.server'
import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/services/notification-service'
import type { TestNotificationRequest, NotificationChannel } from '@/types/notifications'

/**
 * POST /api/notifications/test
 * Send a test notification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: TestNotificationRequest = await request.json()

    // Validate request
    if (!body.auraId || !body.channel || !body.message) {
      return NextResponse.json({ 
        error: 'Missing required fields: auraId, channel, and message are required' 
      }, { status: 400 })
    }

    // Validate channel
    const validChannels: NotificationChannel[] = ['IN_APP', 'WEB_PUSH', 'SMS', 'WHATSAPP', 'EMAIL']
    if (!validChannels.includes(body.channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    // Verify aura ownership
    const { data: aura, error: auraError } = await supabase
      .from('auras')
      .select('id, name, user_id')
      .eq('id', body.auraId)
      .single()

    if (auraError || !aura || aura.user_id !== user.id) {
      return NextResponse.json({ error: 'Aura not found or not owned by user' }, { status: 404 })
    }

    // Check if the channel is supported for the user's tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier || 'FREE'
    
    // Define tier limits
    const TIER_CHANNELS = {
      FREE: ['IN_APP'],
      PERSONAL: ['IN_APP', 'WEB_PUSH'],
      FAMILY: ['IN_APP', 'WEB_PUSH', 'SMS'],
      BUSINESS: ['IN_APP', 'WEB_PUSH', 'SMS', 'WHATSAPP', 'EMAIL']
    }

    const allowedChannels = TIER_CHANNELS[tier as keyof typeof TIER_CHANNELS] || TIER_CHANNELS.FREE
    
    if (!allowedChannels.includes(body.channel)) {
      return NextResponse.json({ 
        error: `Channel ${body.channel} not available for tier ${tier}. Available channels: ${allowedChannels.join(', ')}`,
        tier,
        allowedChannels
      }, { status: 403 })
    }

    // Create test notification payload
    const payload = {
      auraId: body.auraId,
      ruleId: 'test-rule', // Special identifier for test notifications
      message: `🧪 Test notification: ${body.message}`,
      priority: 10, // High priority for test messages
      channels: [body.channel],
      context: {
        isTest: true,
        requestedBy: user.id,
        timestamp: new Date().toISOString(),
        auraName: aura.name
      }
    }

    // Queue the test notification
    const notificationId = await NotificationService.queue(payload)

    return NextResponse.json({ 
      success: true,
      notificationId,
      message: `Test notification queued for delivery via ${body.channel}`,
      auraName: aura.name
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}