// apps/web/app/api/aura/chat/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { SenseDataService } from '@/lib/services/sense-data-service'
import { AuraServiceServer } from '@/lib/services/aura-service.server'
import { generateAuraReply } from '@/lib/services/openai-service'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { auraId, userMessage, conversationId, senseData: providedSenseData } = await req.json() as {
    auraId: string
    userMessage: string
    conversationId?: string
    senseData?: Record<string, any>
  }

  // 1) Load aura with vessel code
  const { data: auraData, error: auraError } = await supabase
    .from('auras')
    .select(`
      *,
      aura_senses (
        sense:senses ( code )
      )
    `)
    .eq('id', auraId)
    .eq('user_id', user.id)
    .single()

  if (auraError || !auraData) {
    return NextResponse.json({ error: 'Aura not found' }, { status: 404 })
  }

  // Transform to Aura type
  const aura = {
    id: auraData.id,
    name: auraData.name,
    vesselType: auraData.vessel_type as any,
    personality: auraData.personality,
    senses: auraData.aura_senses?.map((as: any) => as.sense.code) || [],
    avatar: auraData.avatar || '🤖',
    rules: [],
    enabled: auraData.enabled,
    createdAt: new Date(auraData.created_at),
    updatedAt: new Date(auraData.updated_at),
    selectedStudyId: auraData.selected_study_id,
    selectedIndividualId: auraData.selected_individual_id,
  }

  // 2) Load live sense-data (use provided data if available, otherwise fetch fresh)
  const rawSenseData = providedSenseData 
    ? Object.entries(providedSenseData).map(([senseId, data]) => ({ 
        senseId, 
        data, 
        timestamp: new Date()
      }))
    : await SenseDataService.getSenseData(aura.senses)

  // 3) Extract vessel code if present (stored in the database or passed)
  const vesselCode = auraData.vessel_code || ''

  // 4) Analyze what influences this response
  const influences = analyzeInfluences(userMessage, aura, rawSenseData)

  // 5) Check for triggered rules
  const triggeredRule = checkTriggeredRules(auraData.rules || [], rawSenseData, userMessage)

  // 6) Generate reply with full context
  let reply: string
  try {
    reply = await generateAuraReply(aura, userMessage, rawSenseData, conversationId, vesselCode)
  } catch (error) {
    console.error('Failed to generate AI response:', error)
    // Fallback response
    reply = "I'm having trouble connecting right now, but I'm still here with you. Please try again in a moment."
  }

  // 7) Build rich metadata
  const metadata = {
    influences: influences.general,
    senseData: influences.senseData,
    triggeredRule: triggeredRule?.name,
    senseInfluences: influences.senseInfluences,
    personalityFactors: influences.personalityFactors
  }

  // 8) Ensure conversation exists and persist both messages with metadata
  let finalConversationId = conversationId
  
  if (!conversationId) {
    // Create a new conversation
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        aura_id: auraId,
        session_id: sessionId,
        context: {},
        started_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (convError || !newConversation) {
      console.error('Failed to create conversation:', convError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }
    
    finalConversationId = newConversation.id
    console.log('Created new conversation:', finalConversationId)
  } else {
    // Verify conversation exists and belongs to user's aura
    const { data: existingConv, error: convCheckError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('aura_id', auraId)
      .single()
    
    if (convCheckError || !existingConv) {
      console.error('Conversation not found or access denied:', convCheckError)
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
  }

  // Insert messages (try most common role values first)
  const { data: insertedMessages, error: messageError } = await supabase
    .from('messages')
    .insert([
      { 
        conversation_id: finalConversationId, 
        role: 'human', 
        content: userMessage,
        metadata: {} 
      },
      { 
        conversation_id: finalConversationId, 
        role: 'assistant', 
        content: reply,
        metadata: metadata
      },
    ])
    .select()
  
  if (messageError) {
    console.error('Failed to save messages:', messageError)
    // Try alternative role values
    const { data: altMessages, error: altError } = await supabase
      .from('messages')
      .insert([
        { 
          conversation_id: finalConversationId, 
          role: 'user', 
          content: userMessage,
          metadata: {} 
        },
        { 
          conversation_id: finalConversationId, 
          role: 'aura', 
          content: reply,
          metadata: metadata
        },
      ])
      .select()
    
    if (altError) {
      console.error('Failed to save messages with alternative roles:', altError)
      return NextResponse.json({ error: 'Failed to save messages', details: altError }, { status: 500 })
    }
    
    console.log('Messages saved with alternative roles:', altMessages?.length || 0)
  } else {
    console.log('Messages saved with standard roles:', insertedMessages?.length || 0)
  }

  // Update conversation's last activity timestamp
  await supabase
    .from('conversations')
    .update({ 
      context: { last_message_at: new Date().toISOString() }
    })
    .eq('id', finalConversationId)

  // 9) Return JSON with rich metadata including conversation ID
  return NextResponse.json({ 
    reply, 
    metadata,
    conversationId: finalConversationId,
    // Also send individual fields for backwards compatibility
    influences: influences.general,
    senseInfluences: influences.senseInfluences,
    personalityFactors: influences.personalityFactors,
    triggeredRule: triggeredRule?.name
  }, { status: 200 })
}

// Helper function to analyze what influenced this response
function analyzeInfluences(userMessage: string, aura: any, senseData: any[]) {
  const influences = {
    general: [] as string[],
    senseData: [] as { sense: string; timestamp: string | Date }[],
    senseInfluences: [] as string[],
    personalityFactors: [] as string[]
  }

  const messageWords = userMessage.toLowerCase()
  const timestamp = new Date()

  // Analyze message content for sense references
  const senseKeywords = {
    weather: ['weather', 'temperature', 'hot', 'cold', 'warm', 'cool', 'climate', 'humid', 'dry'],
    air_quality: ['air', 'pollution', 'smog', 'aqi', 'air quality', 'breathing', 'fresh', 'stuffy'],
    soil_moisture: ['soil', 'water', 'moisture', 'thirsty', 'dry', 'wet', 'watering', 'hydration'],
    light_level: ['light', 'bright', 'dark', 'sunny', 'shade', 'illumination', 'shadow', 'glow'],
    news: ['news', 'headlines', 'current events', 'happening', 'world', 'today', 'events'],
    wildlife: ['animals', 'wildlife', 'nature', 'birds', 'creatures', 'habitat', 'ecosystem']
  }

  // Check which senses the user mentioned
  Object.entries(senseKeywords).forEach(([senseId, keywords]) => {
    if (aura.senses.includes(senseId) && keywords.some(keyword => messageWords.includes(keyword))) {
      influences.general.push(`User mentioned ${senseId.replace('_', ' ')}`)
      
      // Find corresponding sense data
      const senseDataItem = senseData.find(item => item.senseId === senseId)
      if (senseDataItem) {
        influences.senseData.push({
          sense: senseId.replace('_', ' '),
          timestamp: timestamp
        })
        
        // Add specific sense influence
        switch (senseId) {
          case 'weather':
            if (senseDataItem.data?.main?.temp) {
              influences.senseInfluences.push(`Current temperature: ${Math.round(senseDataItem.data.main.temp)}°C`)
            }
            if (senseDataItem.data?.weather?.[0]?.description) {
              influences.senseInfluences.push(`Weather: ${senseDataItem.data.weather[0].description}`)
            }
            break
          case 'air_quality':
            if (senseDataItem.data?.aqi) {
              influences.senseInfluences.push(`Air Quality Index: ${senseDataItem.data.aqi}`)
            }
            break
          case 'soil_moisture':
            influences.senseInfluences.push(`Soil moisture: ${Math.round(senseDataItem.data)}%`)
            break
          case 'light_level':
            influences.senseInfluences.push(`Light level: ${Math.round(senseDataItem.data)} lux`)
            break
          case 'news':
            if (senseDataItem.data?.articles?.length) {
              influences.senseInfluences.push(`${senseDataItem.data.articles.length} recent news articles`)
            }
            break
          case 'wildlife':
            if (senseDataItem.data?.species) {
              influences.senseInfluences.push(`Wildlife activity detected: ${senseDataItem.data.species}`)
            }
            break
        }
      }
    }
  })

  // Analyze personality influences based on message tone and content
  if (messageWords.includes('feel') || messageWords.includes('emotion') || messageWords.includes('feeling')) {
    if (aura.personality.empathy > 60) {
      influences.personalityFactors.push('High empathy - responding with emotional understanding')
    }
    if (aura.personality.warmth > 60) {
      influences.personalityFactors.push('High warmth - caring and supportive tone')
    }
  }

  if (messageWords.includes('help') || messageWords.includes('advice') || messageWords.includes('suggest')) {
    if (aura.personality.empathy > 50) {
      influences.personalityFactors.push('Empathy - eager to help and support')
    }
  }

  if (messageWords.includes('fun') || messageWords.includes('play') || messageWords.includes('joke') || messageWords.includes('laugh')) {
    if (aura.personality.playfulness > 60) {
      influences.personalityFactors.push('High playfulness - adding humor and lightness')
    }
  }

  // Analyze response length needs
  if (messageWords.includes('explain') || messageWords.includes('detail') || messageWords.includes('how') || messageWords.includes('why')) {
    if (aura.personality.verbosity > 60) {
      influences.personalityFactors.push('High verbosity - providing detailed explanations')
    } else if (aura.personality.verbosity < 40) {
      influences.personalityFactors.push('Low verbosity - keeping explanation concise')
    }
  }

  // Add creativity factors for open-ended questions
  if (messageWords.includes('what do you think') || messageWords.includes('imagine') || messageWords.includes('creative') || messageWords.includes('idea')) {
    if (aura.personality.creativity > 60) {
      influences.personalityFactors.push('High creativity - generating imaginative responses')
    }
  }

  // Add vessel-specific influences
  if (aura.vesselType === 'terra') {
    influences.general.push('Terra vessel - plant care perspective')
  } else if (aura.vesselType === 'companion') {
    influences.general.push('Companion vessel - wildlife connection')
  }

  // Add general influences
  if (influences.senseInfluences.length > 0) {
    influences.general.push(`${influences.senseInfluences.length} sensor readings incorporated`)
  }

  if (aura.senses.length > 0) {
    influences.general.push(`Aura has ${aura.senses.length} active senses`)
  }

  // Add personality summary
  const dominantTraits = []
  if (aura.personality.warmth > 70) dominantTraits.push('warm')
  if (aura.personality.playfulness > 70) dominantTraits.push('playful')
  if (aura.personality.empathy > 70) dominantTraits.push('empathetic')
  if (aura.personality.creativity > 70) dominantTraits.push('creative')
  
  if (dominantTraits.length > 0) {
    influences.general.push(`Dominant traits: ${dominantTraits.join(', ')}`)
  }

  return influences
}

// Helper function to check if any rules were triggered
function checkTriggeredRules(rules: any[], senseData: any[], userMessage: string) {
  if (!rules || rules.length === 0) return null

  for (const rule of rules) {
    if (!rule.enabled) continue

    const senseDataItem = senseData.find(item => 
      item.senseId === rule.trigger?.sensor?.replace('.value', '').replace('.', '_')
    )

    if (senseDataItem && rule.trigger) {
      const value = typeof senseDataItem.data === 'object' 
        ? senseDataItem.data[rule.trigger.sensor?.split('.')[1] || 'value']
        : senseDataItem.data

      if (value !== undefined && rule.trigger.value !== undefined) {
        const triggered = checkRuleCondition(value, rule.trigger.operator, rule.trigger.value)
        if (triggered) {
          return rule
        }
      }
    }
  }

  return null
}

// Helper function to check rule conditions
function checkRuleCondition(senseValue: number, operator: string, ruleValue: number): boolean {
  switch (operator) {
    case '<': return senseValue < ruleValue
    case '<=': return senseValue <= ruleValue
    case '>': return senseValue > ruleValue
    case '>=': return senseValue >= ruleValue
    case '==': return senseValue === ruleValue
    case '!=': return senseValue !== ruleValue
    default: return false
  }
}