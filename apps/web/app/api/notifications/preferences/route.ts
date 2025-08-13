// app/api/notifications/preferences/route.ts

import { createServerSupabase } from '@/lib/supabase/server.server'
import { NextRequest, NextResponse } from 'next/server'
import type { 
  UpdatePreferencesRequest,
  NotificationChannel,
  NotificationPreference 
} from '@/types/notifications'

interface GetPreferencesResponse {
  global: NotificationPreference[]
  byAura: Record<string, NotificationPreference[]>
}

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all preferences for the user
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select(`
        *,
        aura:auras(id, name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch preferences:', error)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // Group preferences by aura
    const global: NotificationPreference[] = []
    const byAura: Record<string, NotificationPreference[]> = {}

    preferences?.forEach((pref: any) => {
      const preference: NotificationPreference = {
        id: pref.id,
        userId: pref.user_id,
        auraId: pref.aura_id,
        channel: pref.channel,
        enabled: pref.enabled,
        quietHoursEnabled: pref.quiet_hours_enabled,
        quietHoursStart: pref.quiet_hours_start,
        quietHoursEnd: pref.quiet_hours_end,
        timezone: pref.timezone,
        maxPerDay: pref.max_per_day,
        priorityThreshold: pref.priority_threshold,
        metadata: pref.metadata || {},
        createdAt: pref.created_at,
        updatedAt: pref.updated_at
      }

      if (pref.aura_id) {
        if (!byAura[pref.aura_id]) {
          byAura[pref.aura_id] = []
        }
        byAura[pref.aura_id].push(preference)
      } else {
        global.push(preference)
      }
    })

    const response: GetPreferencesResponse = {
      global,
      byAura
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in preferences GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdatePreferencesRequest = await request.json()
    
    // Validate request
    if (!body.channel || !body.settings) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate channel
    const validChannels: NotificationChannel[] = ['IN_APP', 'WEB_PUSH', 'SMS', 'WHATSAPP', 'EMAIL']
    if (!validChannels.includes(body.channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    // If aura_id is provided, verify ownership
    if (body.auraId) {
      const { data: aura, error: auraError } = await supabase
        .from('auras')
        .select('user_id')
        .eq('id', body.auraId)
        .single()

      if (auraError || !aura || aura.user_id !== user.id) {
        return NextResponse.json({ error: 'Aura not found or not owned by user' }, { status: 404 })
      }
    }

    // Prepare the preference data
    const preferenceData: any = {
      user_id: user.id,
      aura_id: body.auraId || null,
      channel: body.channel,
      enabled: body.settings.enabled,
      updated_at: new Date().toISOString()
    }

    // Add quiet hours settings if provided
    if (body.settings.quietHours) {
      preferenceData.quiet_hours_enabled = body.settings.quietHours.enabled
      preferenceData.quiet_hours_start = body.settings.quietHours.start
      preferenceData.quiet_hours_end = body.settings.quietHours.end
      preferenceData.timezone = body.settings.quietHours.timezone
    }

    // Add rate limiting settings
    if (body.settings.maxPerDay !== undefined) {
      preferenceData.max_per_day = body.settings.maxPerDay
    }

    if (body.settings.priorityThreshold !== undefined) {
      preferenceData.priority_threshold = body.settings.priorityThreshold
    }

    // Upsert the preference (update if exists, insert if not)
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(preferenceData, {
        onConflict: 'user_id,aura_id,channel'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to update preference:', error)
      return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      preference: data
    })
  } catch (error) {
    console.error('Error in preferences PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/notifications/preferences
 * Delete notification preference (reset to defaults)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const auraId = searchParams.get('auraId')
    const channel = searchParams.get('channel')

    if (!channel) {
      return NextResponse.json({ error: 'Channel is required' }, { status: 400 })
    }

    // Delete the specific preference
    const { error } = await supabase
      .from('notification_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('channel', channel)
      .eq('aura_id', auraId || null)

    if (error) {
      console.error('Failed to delete preference:', error)
      return NextResponse.json({ error: 'Failed to delete preference' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in preferences DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}