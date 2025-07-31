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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const body = await req.json()

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
    } = validation.data

    // Ensure digital vessels have proper vessel code
    const finalVesselCode = vesselCode || (vesselType === 'digital' ? 'digital-only' : '')
    
    console.log('Creating aura with received data:', {
      name,
      vesselType,
      vesselCode: finalVesselCode,
      sensesCount: senses?.length || 0,
      rulesCount: rules.length,
      personality: JSON.stringify(personality, null, 2),
      rules: JSON.stringify(rules, null, 2),
      senses: senses
    })

    // Prepare location configs for the aura
    let locationConfigs: Record<string, any> = {}
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
        locationConfigs['weather'] = locationConfig
      }
      if (senses?.includes('air_quality')) {
        locationConfigs['air_quality'] = locationConfig
      }
      if (senses?.includes('news') && newsType === 'local') {
        locationConfigs['news'] = locationConfig
      }
      
      console.log('Setting location_configs:', locationConfigs)
    }

    // Create Aura
    const { data: aura, error: auraError } = await supabase
      .from('auras')
      .insert({
        user_id: userId,
        name,
        vessel_type: vesselType,
        vessel_code: finalVesselCode,
        personality,
        senses: senses || [],
        communication_style: personality.tone || 'balanced',
        voice_profile: personality.vocabulary || 'neutral',
        location_configs: locationConfigs,
        enabled: true,
      })
      .select()
      .single()

    if (auraError || !aura) {
      console.error('Error creating aura:', {
        error: auraError,
        data: { name, vesselType, vesselCode: finalVesselCode }
      })
      return NextResponse.json(
        createApiError('Failed to create Aura', auraError?.message || 'Unknown database error'),
        { status: 500 }
      )
    }

    console.log('Aura created successfully:', aura.id)

// Link senses if any
if (senses && senses.length > 0) {
  // Step 1: Fetch matching sense IDs
  const { data: matchingSenses, error: lookupError } = await supabase
    .from('senses')
    .select('id, code')
    .in('code', senses)

  if (lookupError) {
    console.error('Failed to fetch sense UUIDs:', lookupError)
  }

  if (matchingSenses && matchingSenses.length > 0) {
    const senseInserts = matchingSenses.map((sense) => {
      let config = {}
      
      // Add news type configuration for news sense
      if (sense.code === 'news' && newsType) {
        config = { newsType }
        console.log(`Configuring news with type: ${newsType}`)
      }
      
      // Location-dependent senses (weather, air_quality) will get their location
      // from the aura's location_configs field automatically
      
      return {
        aura_id: aura.id,
        sense_id: sense.id,
        config,
        enabled: true,
      }
    })

    const { error: sensesError } = await supabase
      .from('aura_senses')
      .insert(senseInserts)

    if (sensesError) {
      console.error('Error linking senses:', sensesError)
      // Don't fail the whole operation if senses fail
    }
  } else {
    console.warn('No matching senses found for codes:', senses)
  }
}


    // Insert behavior rules if any
    if (rules && rules.length > 0) {
      const validRules = rules.filter(rule => rule.name)
      
      if (validRules.length > 0) {
        const ruleInserts = validRules.map((rule: any) => ({
          aura_id: aura.id,
          id: uuidv4(),
          name: rule.name,
          trigger: rule.trigger || { type: 'simple', sensor: 'time', operator: '==', value: 'morning' },
          action: rule.action || { type: 'notify', message: rule.name },
          priority: rule.priority ?? 5,
          enabled: rule.enabled ?? true,
        }))

        const { error: rulesError } = await supabase
          .from('behavior_rules')
          .insert(ruleInserts)

        if (rulesError) {
          console.error('Error creating rules:', rulesError)
          // Don't fail the whole operation if rules fail
        }
      }
    }

    return NextResponse.json(
      createApiSuccess({ auraId: aura.id }, `Successfully created ${name}`)
    )
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      createApiError(
        'An unexpected error occurred',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    )
  }
}