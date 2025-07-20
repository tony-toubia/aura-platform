// apps/web/app/api/aura/chat/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase }       from '@/lib/supabase/server.server'
import { SenseDataService }           from '@/lib/services/sense-data-service'
import { AuraServiceServer }          from '@/lib/services/aura-service.server'
import { generateAuraReply }          from '@/lib/services/openai-service'

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

  // 1) Load aura
  const aura = await AuraServiceServer.getAuraById(auraId)
  if (!aura) {
    return NextResponse.json({ error: 'Aura not found' }, { status: 404 })
  }

  // 2) Load live sense-data (use provided data if available, otherwise fetch fresh)
  const rawSenseData = providedSenseData 
    ? Object.entries(providedSenseData).map(([senseId, data]) => ({ 
        senseId, 
        data, 
        timestamp: new Date()
      }))
    : await SenseDataService.getSenseData(aura.senses)

  // 3) Analyze what influences this response
  const influences = analyzeInfluences(userMessage, aura, rawSenseData)

  // 4) Check for triggered rules
  const triggeredRule = checkTriggeredRules(aura.rules, rawSenseData, userMessage)

  // 5) Generate reply (server side OpenAI call)
  const reply = await generateAuraReply(aura, userMessage, rawSenseData)

  // 6) Build rich metadata
  const metadata = {
    influences: influences.general,
    senseData: influences.senseData,
    triggeredRule: triggeredRule?.name,
    senseInfluences: influences.senseInfluences,
    personalityFactors: influences.personalityFactors
  }

  // 7) Persist both messages with metadata
  await supabase
    .from('messages')
    .insert([
      { 
        conversation_id: conversationId, 
        aura_id: auraId, 
        role: 'user', 
        content: userMessage,
        metadata: {} 
      },
      { 
        conversation_id: conversationId, 
        aura_id: auraId, 
        role: 'aura', 
        content: reply,
        metadata: metadata
      },
    ])

  // 8) Return JSON with rich metadata
  return NextResponse.json({ 
    reply, 
    metadata,
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
    weather: ['weather', 'temperature', 'hot', 'cold', 'warm', 'cool', 'climate'],
    air_quality: ['air', 'pollution', 'smog', 'aqi', 'air quality', 'breathing'],
    soil_moisture: ['soil', 'water', 'moisture', 'thirsty', 'dry', 'wet'],
    light_level: ['light', 'bright', 'dark', 'sunny', 'shade', 'illumination'],
    news: ['news', 'headlines', 'current events', 'happening', 'world'],
    wildlife: ['animals', 'wildlife', 'nature', 'birds', 'creatures']
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
        }
      }
    }
  })

  // Analyze personality influences based on message tone and content
  if (messageWords.includes('feel') || messageWords.includes('emotion')) {
    if (aura.personality.empathy > 60) {
      influences.personalityFactors.push('High empathy - responding with emotional understanding')
    }
    if (aura.personality.warmth > 60) {
      influences.personalityFactors.push('High warmth - caring and supportive tone')
    }
  }

  if (messageWords.includes('help') || messageWords.includes('advice')) {
    if (aura.personality.empathy > 50) {
      influences.personalityFactors.push('Empathy - eager to help and support')
    }
  }

  if (messageWords.includes('fun') || messageWords.includes('play') || messageWords.includes('joke')) {
    if (aura.personality.playfulness > 60) {
      influences.personalityFactors.push('High playfulness - adding humor and lightness')
    }
  }

  // Analyze response length needs
  if (messageWords.includes('explain') || messageWords.includes('detail') || messageWords.includes('how')) {
    if (aura.personality.verbosity > 60) {
      influences.personalityFactors.push('High verbosity - providing detailed explanations')
    }
  }

  // Add creativity factors for open-ended questions
  if (messageWords.includes('what do you think') || messageWords.includes('imagine') || messageWords.includes('creative')) {
    if (aura.personality.creativity > 60) {
      influences.personalityFactors.push('High creativity - generating imaginative responses')
    }
  }

  // Add general influences
  if (influences.senseInfluences.length > 0) {
    influences.general.push(`${influences.senseInfluences.length} sensor readings incorporated`)
  }

  if (aura.senses.length > 0) {
    influences.general.push(`Aura has ${aura.senses.length} active senses`)
  }

  return influences
}

// Helper function to check if any rules were triggered
function checkTriggeredRules(rules: any[], senseData: any[], userMessage: string) {
  if (!rules || rules.length === 0) return null

  // This is a simplified rule check - you'd want to implement your actual rule logic here
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