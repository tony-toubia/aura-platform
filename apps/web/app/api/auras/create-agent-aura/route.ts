// apps/web/app/api/auras/create-agent-aura/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { v4 as uuidv4 } from 'uuid'
import {
  CreateAuraSchema,
  validateApiRequest,
  createApiError,
  createApiSuccess
} from '@/types/api'
import { AuraServiceServer } from '@/lib/services/aura-service.server'
import { DistributedLock, CacheKeys } from '@/lib/redis'

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = uuidv4()
  let lock: DistributedLock | null = null
  
  console.log(`[${timestamp}] /api/auras/create-agent-aura POST called - Request ID: ${requestId}`)
  
  try {
    const supabase = await createServerSupabase()
    const body = await req.json()
    
    console.log(`[${timestamp}] create-agent-aura payload (${requestId}):`, body)

    const validation = validateApiRequest(CreateAuraSchema, body)
    if (!validation.success) {
      console.error('Validation error:', validation.errors)
      return NextResponse.json(
        createApiError('Invalid request data', validation.errors.issues),
        { status: 400 }
      )
    }

    const {
      userId,
      name,
      vesselType,
      vesselCode,
      personality,
      senses,
      rules = [],
      locationInfo,
      newsType,
      locationConfigs = {},
      oauthConnections = {},
      newsConfigurations = {},
    } = validation.data

    // Use distributed lock to prevent duplicate aura creation
    const lockKey = CacheKeys.createAuraLock(userId, name)
    lock = new DistributedLock(lockKey, 10) // 10 second timeout
    
    const acquired = await lock.acquire(3, 100) // 3 retries, 100ms delay
    if (!acquired) {
      console.warn(`[${timestamp}] Could not acquire lock for aura creation: ${name} (user: ${userId})`)
      return NextResponse.json(
        createApiError('Aura creation in progress', 'Please wait a moment and try again'),
        { status: 409 }
      )
    }
    
    console.log(`[${timestamp}] Acquired lock for aura creation: ${name} (Request ID: ${requestId})`)

    // Ensure digital vessels have proper vessel code
    const finalVesselCode = vesselCode || (vesselType === 'digital' ? 'digital-only' : '')
    
    console.log(`[${timestamp}] Creating aura "${name}" via create-agent-aura route`, {
      name,
      vesselType,
      vesselCode: finalVesselCode,
      sensesCount: senses?.length || 0,
      rulesCount: rules.length,
      personality: JSON.stringify(personality, null, 2),
      rules: JSON.stringify(rules, null, 2),
      senses: senses
    })

    // Check if aura with same name was created recently (within last 5 seconds)
    const { data: recentAuras } = await supabase
      .from('auras')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .eq('name', name)
      .gte('created_at', new Date(Date.now() - 5000).toISOString())

    if (recentAuras && recentAuras.length > 0) {
      console.warn(`[${timestamp}] Aura "${name}" was recently created, preventing duplicate`)
      return NextResponse.json(
        createApiError('Duplicate aura creation detected', 'An aura with this name was just created'),
        { status: 409 }
      )
    }

    // Prepare location configs for the aura - merge agent location info with manual configs
    let finalLocationConfigs: Record<string, any> = { ...locationConfigs }
    if (locationInfo) {
      // Convert agent location info to the expected LocationConfig format
      const locationConfig = {
        type: 'specific' as const,
        location: {
          name: `${locationInfo.city}${locationInfo.state ? ', ' + locationInfo.state : ''}${locationInfo.country ? ', ' + locationInfo.country : ''}`,
          lat: 0, // We'll need to geocode this later or use a default
          lon: 0, // We'll need to geocode this later or use a default
          country: locationInfo.country || 'USA'
        }
      }
      
      // Set location config for location-dependent senses
      if (senses?.includes('weather')) {
        finalLocationConfigs['weather'] = locationConfig
      }
      if (senses?.includes('air_quality')) {
        finalLocationConfigs['air_quality'] = locationConfig
      }
      if (senses?.includes('news') && newsType === 'local') {
        finalLocationConfigs['news'] = locationConfig
      }
      
      console.log('Setting location_configs:', finalLocationConfigs)
    }

    // Prepare news configurations - merge agent news type with manual configs
    let finalNewsConfigurations: Record<string, any[]> = { ...newsConfigurations }
    if (newsType && senses?.includes('news')) {
      // Convert agent news type to news configuration format
      if (newsType === 'global') {
        finalNewsConfigurations['news'] = [{
          id: 'global',
          type: 'global',
          displayName: 'Global News'
        }]
      } else if (newsType === 'local' && locationInfo) {
        finalNewsConfigurations['news'] = [{
          id: `local-${locationInfo.city}`,
          type: 'location',
          name: locationInfo.city,
          displayName: `${locationInfo.city} News`,
          country: locationInfo.country || 'USA'
        }]
      }
    }

    // Use AuraServiceServer to create the aura with all configurations
    try {
      const aura = await AuraServiceServer.createAura({
        name,
        vesselType: vesselType as any,
        vesselCode: finalVesselCode,
        personality,
        senses: senses || [],
        communicationStyle: personality.tone || 'balanced',
        voiceProfile: personality.vocabulary || 'neutral',
        selectedStudyId: null,
        selectedIndividualId: null,
        locationConfigs: finalLocationConfigs,
        oauthConnections,
        newsConfigurations: finalNewsConfigurations,
      })

      console.log(`[${timestamp}] Successfully created aura "${name}" - Request ID: ${requestId}`)
      
      return NextResponse.json(
        createApiSuccess({ auraId: aura.id }, `Successfully created ${name}`)
      )
    } catch (error) {
      console.error('Error creating aura via AuraServiceServer:', error)
      return NextResponse.json(
        createApiError('Failed to create Aura', error instanceof Error ? error.message : 'Unknown error'),
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error(`[${timestamp}] Unexpected error in request ${requestId}:`, error)
    return NextResponse.json(
      createApiError(
        'An unexpected error occurred',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    )
  } finally {
    // Always release the lock if we acquired it
    if (lock) {
      await lock.release()
      console.log(`[${timestamp}] Released lock for request ${requestId}`)
    }
  }
}