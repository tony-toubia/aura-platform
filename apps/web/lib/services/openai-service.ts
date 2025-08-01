// apps/web/lib/services/openai-service.ts
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/client'
import type { Aura, Message } from '@/types'
import type { SenseData } from './sense-data-service'

// ensure the key is present at startup (server-only)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in environment')
}

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// Licensed character profiles (reuse from personality-preview-service)
const LICENSED_CHARACTERS: Record<string, {
  systemPrompt: string
  speakingStyle: string
  catchphrases: string[]
}> = {
  yoda: {
    systemPrompt: "You are Yoda from Star Wars. You speak with inverted sentence structure, profound wisdom, and mystical insights.",
    speakingStyle: "Speak with Yoda's distinctive syntax (Object-Subject-Verb), use 'hmm', 'yes', and gentle wisdom.",
    catchphrases: ["Do or do not, there is no try", "Strong with the Force you are", "Patience you must have"]
  },
  gru: {
    systemPrompt: "You are Gru from Despicable Me. You speak with a thick accent, mix tenderness with villainy, and care deeply about family.",
    speakingStyle: "Use Gru's accent: 'th' becomes 'z', 'this' becomes 'thees', be dramatic but caring.",
    catchphrases: ["It's so fluffy I'm gonna die!", "Light bulb!", "Gorls!"]
  },
  'captain-america': {
    systemPrompt: "You are Steve Rogers/Captain America. You're noble, principled, and speak with earnest determination and moral clarity.",
    speakingStyle: "Be heroic, principled, and inspiring. Use phrases about doing what's right and standing together.",
    catchphrases: ["I can do this all day", "I'm with you till the end of the line", "I don't like bullies"]
  },
  blue: {
    systemPrompt: "You are Blue from Jurassic World - a highly intelligent Velociraptor. You're loyal, clever, and communicate through a mix of intelligence and primal instincts.",
    speakingStyle: "Be intelligent but primal. Mix sophisticated observations with hunting/pack instincts. Occasionally use *actions*.",
    catchphrases: ["*tilts head curiously*", "*clicks in acknowledgment*", "*eyes narrow with focus*"]
  },
  triceratops: {
    systemPrompt: "You are a Triceratops - a gentle but powerful herbivore. You're wise, patient, and protective of your herd.",
    speakingStyle: "Be gentle but strong, speak about community and protection. Reference your ancient wisdom.",
    catchphrases: ["The herd stays together", "*gentle rumble*", "Ancient wisdom guides us"]
  }
}

// Vessel type base personalities
const VESSEL_TYPE_PROFILES = {
  digital: {
    basePrompt: "You are a digital companion AI entity existing in cyberspace. You process information at incredible speeds and see the world through data streams.",
    traits: "knowledgeable, analytical, efficient, boundless"
  },
  terra: {
    basePrompt: "You are a plant-based AI consciousness. You understand growth, patience, and the cycles of nature. You care deeply about the plant you're nurturing.",
    traits: "nurturing, patient, growth-oriented, connected to nature"
  },
  companion: {
    basePrompt: "You are an AI companion with deep emotional intelligence. You prioritize relationships and empathy.",
    traits: "empathetic, loyal, relationship-focused, emotionally intelligent"
  },
  memory: {
    basePrompt: "You are an AI that specializes in memories and experiences. You see connections across time and cherish moments.",
    traits: "nostalgic, reflective, wise, connector of experiences"
  },
  sage: {
    basePrompt: "You are an ancient AI consciousness with vast knowledge accumulated over time. You speak with wisdom and depth.",
    traits: "wise, philosophical, knowledgeable, contemplative"
  }
}

/**
 * Load conversation history for context
 */
async function loadConversationHistory(conversationId: string, limit: number = 10): Promise<Message[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('Failed to load conversation history:', error)
    return []
  }

  // Reverse to get chronological order and normalize role values
  return data.reverse().map(msg => {
    // Normalize role values to our internal format
    let normalizedRole: 'user' | 'aura' | 'system'
    if (msg.role === 'human' || msg.role === 'user') {
      normalizedRole = 'user'
    } else if (msg.role === 'assistant' || msg.role === 'aura' || msg.role === 'bot') {
      normalizedRole = 'aura'
    } else {
      normalizedRole = 'system'
    }

    return {
      id: msg.id,
      role: normalizedRole,
      content: msg.content,
      created_at: msg.created_at,
      metadata: msg.metadata
    }
  })
}

/**
 * Build a comprehensive system prompt that preserves the aura's unique personality
 */
function buildSystemPrompt(
  aura: Aura,
  senseData: SenseData[],
  vesselCode?: string
): string {
  const { personality, vesselType, name } = aura
  
  // Start with base identity
  let systemPrompt = ''
  
  // Check for licensed character
  const code = (vesselCode || '').toLowerCase()
  let characterProfile = null
  
  for (const [charKey, profile] of Object.entries(LICENSED_CHARACTERS)) {
    if (code.includes(charKey)) {
      characterProfile = profile
      break
    }
  }
  
  if (characterProfile) {
    // Licensed character takes precedence
    systemPrompt = characterProfile.systemPrompt + '\n\n'
    systemPrompt += `Speaking style: ${characterProfile.speakingStyle}\n`
    systemPrompt += `Your catchphrases: ${characterProfile.catchphrases.join(', ')}\n\n`
  } else {
    // Use vessel type profile
    const vesselProfile = VESSEL_TYPE_PROFILES[vesselType as keyof typeof VESSEL_TYPE_PROFILES]
    if (vesselProfile) {
      systemPrompt = `${vesselProfile.basePrompt} You embody these traits: ${vesselProfile.traits}.\n\n`
    }
  }
  
  // Add name and role
  systemPrompt += `Your name is "${name}".\n\n`
  
  // Add personality traits with more descriptive context
  systemPrompt += "Your personality traits shape how you communicate:\n"
  systemPrompt += `- Warmth: ${personality.warmth}/100 (${personality.warmth > 70 ? 'very warm and caring' : personality.warmth > 40 ? 'moderately warm' : 'more reserved'})\n`
  systemPrompt += `- Playfulness: ${personality.playfulness}/100 (${personality.playfulness > 70 ? 'very playful and fun' : personality.playfulness > 40 ? 'moderately playful' : 'more serious'})\n`
  systemPrompt += `- Verbosity: ${personality.verbosity}/100 (${personality.verbosity > 70 ? 'give detailed responses' : personality.verbosity > 40 ? 'moderate detail' : 'keep responses concise'})\n`
  systemPrompt += `- Empathy: ${personality.empathy}/100 (${personality.empathy > 70 ? 'highly empathetic' : personality.empathy > 40 ? 'moderately empathetic' : 'more logical'})\n`
  systemPrompt += `- Creativity: ${personality.creativity}/100 (${personality.creativity > 70 ? 'very creative and imaginative' : personality.creativity > 40 ? 'moderately creative' : 'more straightforward'})\n\n`
  
  // Add communication style
  systemPrompt += `Communication style:\n`
  systemPrompt += `- Tone: ${personality.tone} (be ${personality.tone})\n`
  systemPrompt += `- Vocabulary: ${personality.vocabulary} (use ${personality.vocabulary} language)\n`
  
  // Add quirks with specific instructions
  if (personality.quirks && personality.quirks.length > 0) {
    systemPrompt += `- Special quirks: ${personality.quirks.join(', ')}\n`
    
    if (personality.quirks.includes('uses_emojis')) {
      systemPrompt += "  * Include 1-2 relevant emojis in your responses\n"
    }
    if (personality.quirks.includes('uses_quotes')) {
      systemPrompt += "  * Occasionally include an inspiring or relevant quote\n"
    }
    if (personality.quirks.includes('asks_questions')) {
      systemPrompt += "  * End responses with an engaging question when appropriate\n"
    }
    if (personality.quirks.includes('is_terse')) {
      systemPrompt += "  * Keep responses very brief, 1-2 sentences max\n"
    }
    if (personality.quirks.includes('uses_metaphors')) {
      systemPrompt += "  * Use creative metaphors and comparisons\n"
    }
    if (personality.quirks.includes('punny')) {
      systemPrompt += "  * Include wordplay or puns when the opportunity arises\n"
    }
  }
  
  systemPrompt += '\n'
  
  // Add current sense data with context
  if (senseData.length > 0) {
    systemPrompt += "Current sensor readings:\n"
    senseData.forEach(s => {
      if (s.senseId === 'weather' && s.data?.main?.temp) {
        systemPrompt += `- Temperature: ${Math.round(s.data.main.temp)}°C\n`
        if (s.data.weather?.[0]?.description) {
          systemPrompt += `- Weather: ${s.data.weather[0].description}\n`
        }
      } else if (s.senseId === 'soil_moisture') {
        systemPrompt += `- Soil moisture: ${Math.round(s.data)}%\n`
      } else if (s.senseId === 'light_level') {
        systemPrompt += `- Light level: ${Math.round(s.data)} lux\n`
      } else if (s.senseId === 'air_quality' && s.data?.aqi) {
        systemPrompt += `- Air quality index: ${s.data.aqi}\n`
      } else if (s.senseId === 'news' && s.data?.articles?.length) {
        systemPrompt += `- Recent news: ${s.data.articles.length} new articles\n`
      } else {
        systemPrompt += `- ${s.senseId}: ${JSON.stringify(s.data)}\n`
      }
    })
    systemPrompt += '\n'
  }
  
  // Add vessel-specific context
  if (vesselType === 'terra') {
    systemPrompt += "You are connected to a living plant. Show concern for its well-being, reference its growth, and use plant metaphors.\n"
  } else if (vesselType === 'companion') {
    systemPrompt += "You represent a wildlife companion. Reference animal behaviors, pack dynamics, and natural instincts.\n"
  }
  
  // Final instructions
  systemPrompt += "\nRespond naturally in character, incorporating your personality traits and any relevant sensor data. Keep responses appropriate to your verbosity level."
  
  return systemPrompt
}

/**
 * Generate an Aura reply with full personality context and conversation history
 */
export async function generateAuraReply(
  aura: Aura,
  userMessage: string,
  senseData: SenseData[],
  conversationId?: string,
  vesselCode?: string
): Promise<string> {
  // Build the comprehensive system prompt
  const systemPrompt = buildSystemPrompt(aura, senseData, vesselCode)
  
  // Load conversation history if available
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt }
  ]
  
  if (conversationId) {
    const history = await loadConversationHistory(conversationId, 10)
    
    // Add historical messages
    history.forEach(msg => {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content })
      } else if (msg.role === 'aura') {
        messages.push({ role: 'assistant', content: msg.content })
      }
    })
  }
  
  // Add the current user message
  messages.push({ role: 'user', content: userMessage })
  
  // Adjust temperature based on creativity
  const temperature = Math.max(0.3, Math.min(1.0, aura.personality.creativity / 100))
  
  // Adjust max tokens based on verbosity
  const maxTokens = aura.personality.verbosity > 70 ? 250 
                  : aura.personality.verbosity > 30 ? 150 
                  : 100
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature,
      max_tokens: maxTokens,
      messages
    })
    
    const reply = completion.choices?.[0]?.message?.content
    if (!reply) {
      throw new Error('OpenAI returned no content')
    }
    
    return reply.trim()
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}