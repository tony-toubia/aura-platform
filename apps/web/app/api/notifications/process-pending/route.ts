// app/api/notifications/process-pending/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('[NOTIF-PROCESSOR] Starting notification processing...')
    
    // Create service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Service role key not configured'
      }, { status: 500 })
    }

    // Get all pending notifications
    console.log('[NOTIF-PROCESSOR] Fetching pending notifications...')
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('proactive_messages')
      .select(`
        id,
        aura_id,
        message,
        trigger_data,
        metadata,
        delivery_channel,
        created_at,
        auras (
          id,
          name,
          user_id
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('[NOTIF-PROCESSOR] Failed to fetch notifications:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch pending notifications',
        details: fetchError.message
      }, { status: 500 })
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('[NOTIF-PROCESSOR] No pending notifications found')
      return NextResponse.json({
        success: true,
        message: 'No pending notifications to process',
        processed: 0
      })
    }

    console.log(`[NOTIF-PROCESSOR] Found ${pendingNotifications.length} pending notifications`)

    const results = []

    // Process each notification
    for (const notification of pendingNotifications) {
      try {
        const auraInfo = Array.isArray(notification.auras) ? notification.auras[0] : notification.auras
        console.log(`[NOTIF-PROCESSOR] Processing notification ${notification.id} for aura ${auraInfo?.name}`)

        // Find or create conversation for the aura
        let conversationId = null
        
        // Try to find existing conversation
        console.log(`[NOTIF-PROCESSOR] Looking for conversation for aura ${notification.aura_id}`)
        const { data: existingConversation, error: convFindError } = await supabase
          .from('conversations')
          .select('id, session_id')
          .eq('aura_id', notification.aura_id)
          .order('started_at', { ascending: false })
          .limit(1)
          .single()

        if (convFindError && convFindError.code !== 'PGRST116') {
          console.error(`[NOTIF-PROCESSOR] Error finding conversation:`, convFindError)
        }

        if (existingConversation) {
          conversationId = existingConversation.id
          console.log(`[NOTIF-PROCESSOR] Using existing conversation: ${conversationId}`)
        } else {
          // Create new conversation
          console.log(`[NOTIF-PROCESSOR] Creating new conversation for aura ${notification.aura_id}`)
          const { data: newConversation, error: convError } = await supabase
            .from('conversations')
            .insert({
              aura_id: notification.aura_id,
              session_id: `proactive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              context: { createdFor: 'proactive_notification', notificationId: notification.id }
            })
            .select()
            .single()

          if (convError) {
            console.error(`[NOTIF-PROCESSOR] Failed to create conversation:`, convError)
            results.push({
              notificationId: notification.id,
              status: 'failed',
              error: `Failed to create conversation: ${convError.message}`
            })
            continue
          }

          conversationId = newConversation.id
          console.log(`[NOTIF-PROCESSOR] Created new conversation: ${conversationId}`)
        }

        // Create the message in the conversation
        console.log(`[NOTIF-PROCESSOR] Creating message in conversation ${conversationId}`)
        console.log(`[NOTIF-PROCESSOR] Message content: "${notification.message}"`)
        
        const messageData = {
          conversation_id: conversationId,
          role: 'aura',  // Fixed: Use 'aura' instead of 'assistant'
          content: notification.message,
          metadata: {
            type: 'proactive_notification',
            notification_id: notification.id,
            trigger_data: notification.trigger_data,
            delivery_channel: notification.delivery_channel,
            created_from: 'notification_processor'
          }
        }
        
        console.log(`[NOTIF-PROCESSOR] Inserting message data:`, messageData)
        
        const { data: message, error: messageError } = await supabase
          .from('messages')
          .insert(messageData)
          .select()
          .single()

        if (messageError) {
          console.error(`[NOTIF-PROCESSOR] Failed to create message:`, messageError)
          results.push({
            notificationId: notification.id,
            status: 'failed',
            error: `Failed to create message: ${messageError.message}`
          })
          continue
        }

        // Update notification status to delivered
        const { error: updateError } = await supabase
          .from('proactive_messages')
          .update({
            status: 'delivered',
            conversation_id: conversationId,
            delivered_at: new Date().toISOString()
          })
          .eq('id', notification.id)

        if (updateError) {
          console.error(`[NOTIF-PROCESSOR] Failed to update notification status:`, updateError)
          // Don't fail the whole process, just log it
        }

        // Update conversation unread count
        const { error: unreadError } = await supabase
          .from('conversations')
          .update({
            has_unread_proactive: true,
            unread_proactive_count: 1 // Simplified for now
          })
          .eq('id', conversationId)

        if (unreadError) {
          console.error(`[NOTIF-PROCESSOR] Failed to update unread count:`, unreadError)
          // Don't fail the whole process
        }

        console.log(`[NOTIF-PROCESSOR] Successfully processed notification ${notification.id}`)
        results.push({
          notificationId: notification.id,
          status: 'success',
          conversationId,
          messageId: message.id,
          auraName: auraInfo?.name
        })

      } catch (error) {
        console.error(`[NOTIF-PROCESSOR] Error processing notification ${notification.id}:`, error)
        results.push({
          notificationId: notification.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status !== 'success').length

    console.log(`[NOTIF-PROCESSOR] Processing complete: ${successCount} success, ${failedCount} failed`)
    
    // Log failed results for debugging
    if (failedCount > 0) {
      console.log('[NOTIF-PROCESSOR] Failed results:', results.filter(r => r.status !== 'success'))
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingNotifications.length} notifications`,
      processed: successCount,
      failed: failedCount,
      results,
      debug: {
        foundNotifications: pendingNotifications.length,
        successCount,
        failedCount,
        failedErrors: results.filter(r => r.status !== 'success').map(r => ({
          notificationId: r.notificationId,
          error: r.error
        }))
      }
    })

  } catch (error) {
    console.error('[NOTIF-PROCESSOR] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Allow manual triggering
export async function GET(request: NextRequest) {
  return POST(request)
}