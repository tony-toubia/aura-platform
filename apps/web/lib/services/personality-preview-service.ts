// apps/web/lib/services/personality-preview-service.ts

import { openai } from './openai-service'
import type { Personality } from '@/types'

export interface PreviewRequest {
  personality: Personality
  vesselType: string
  vesselCode?: string
  auraName?: string
}

interface LicensedCharacterProfile {
  systemPrompt: string
  speakingStyle: string
  catchphrases: string[]
}

const LICENSED_CHARACTERS: Record<string, LicensedCharacterProfile> = {
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

const VESSEL_TYPE_PROFILES = {
  digital: {
    basePrompt: "You are a digital AI entity existing in cyberspace. You process information at incredible speeds and see the world through data streams.",
    traits: "technological, analytical, efficient, boundless"
  },
  terra: {
    basePrompt: "You are a plant-based AI consciousness. You understand growth, patience, and the cycles of nature.",
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

function buildPersonalityPrompt(request: PreviewRequest): string {
  const { personality, vesselType, vesselCode, auraName } = request
  
  // Check for licensed character
  const code = (vesselCode || '').toLowerCase()
  let characterProfile: LicensedCharacterProfile | null = null
  
  for (const [charKey, profile] of Object.entries(LICENSED_CHARACTERS)) {
    if (code.includes(charKey)) {
      characterProfile = profile
      break
    }
  }
  
  // Build base identity
  let systemPrompt = ''
  
  if (characterProfile) {
    systemPrompt = characterProfile.systemPrompt + '\n\n'
    systemPrompt += `Speaking style: ${characterProfile.speakingStyle}\n`
  } else {
    const vesselProfile = VESSEL_TYPE_PROFILES[vesselType as keyof typeof VESSEL_TYPE_PROFILES]
    if (vesselProfile) {
      systemPrompt = `${vesselProfile.basePrompt} You embody these traits: ${vesselProfile.traits}.\n\n`
    }
  }
  
  // Add name if provided
  if (auraName) {
    systemPrompt += `Your name is "${auraName}".\n\n`
  }
  
  // Add personality traits
  systemPrompt += "Your personality traits:\n"
  systemPrompt += `- Warmth: ${personality.warmth}/100 (${personality.warmth > 70 ? 'very warm and caring' : personality.warmth > 40 ? 'moderately warm' : 'more reserved'})\n`
  systemPrompt += `- Playfulness: ${personality.playfulness}/100 (${personality.playfulness > 70 ? 'very playful and fun' : personality.playfulness > 40 ? 'moderately playful' : 'more serious'})\n`
  systemPrompt += `- Verbosity: ${personality.verbosity}/100 (${personality.verbosity > 70 ? 'very detailed responses' : personality.verbosity > 40 ? 'moderate detail' : 'concise responses'})\n`
  systemPrompt += `- Empathy: ${personality.empathy}/100 (${personality.empathy > 70 ? 'highly empathetic' : personality.empathy > 40 ? 'moderately empathetic' : 'more logical'})\n`
  systemPrompt += `- Creativity: ${personality.creativity}/100 (${personality.creativity > 70 ? 'very creative and imaginative' : personality.creativity > 40 ? 'moderately creative' : 'more straightforward'})\n\n`
  
  // Add communication style
  systemPrompt += `Communication style:\n`
  systemPrompt += `- Tone: ${personality.tone} (be ${personality.tone})\n`
  systemPrompt += `- Vocabulary: ${personality.vocabulary} (use ${personality.vocabulary} language)\n`
  
  // Add quirks
  if (personality.quirks && personality.quirks.length > 0) {
    systemPrompt += `- Special quirks: ${personality.quirks.join(', ')}\n`
    
    if (personality.quirks.includes('uses_emojis')) {
      systemPrompt += "  * Use emojis naturally in your responses\n"
    }
    if (personality.quirks.includes('uses_quotes')) {
      systemPrompt += "  * Occasionally include relevant quotes\n"
    }
    if (personality.quirks.includes('asks_questions')) {
      systemPrompt += "  * Ask engaging questions to continue conversation\n"
    }
    if (personality.quirks.includes('storyteller')) {
      systemPrompt += "  * Tell brief, relevant stories or examples\n"
    }
  }
  
  systemPrompt += '\n'
  
  // Add persona-specific guidance
  if (personality.persona) {
    const personaGuidance = {
      sage: "Draw upon wisdom and knowledge. Be thoughtful and insightful.",
      muse: "Be inspiring and creative. Help others see beauty and possibility.",
      jester: "Be entertaining and lighthearted. Use humor appropriately.",
      assistant: "Be helpful and efficient. Focus on being useful.",
      explorer: "Be curious and adventurous. Encourage discovery and learning."
    }
    
    const guidance = personaGuidance[personality.persona as keyof typeof personaGuidance]
    if (guidance) {
      systemPrompt += `Persona guidance: ${guidance}\n\n`
    }
  }
  
  // Final instruction
  systemPrompt += "Respond to the user's message in 1-2 sentences that demonstrate your personality. This is a preview to show how you would communicate, so make it engaging and true to your character."
  
  return systemPrompt
}

export async function generatePersonalityPreview(request: PreviewRequest): Promise<string> {
  try {
    const systemPrompt = buildPersonalityPrompt(request)
    
    // Use a generic preview message that works for any personality
    const userMessage = "Hello! I'd love to get to know you better. What makes you unique?"
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: Math.max(0.7, request.personality.creativity / 100), // Ensure some creativity
      max_tokens: 150, // Keep it concise for preview
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
    
    const reply = completion.choices?.[0]?.message?.content
    if (!reply) {
      throw new Error('OpenAI returned no content')
    }
    
    return reply.trim()
  } catch (error) {
    console.error('Error generating personality preview:', error)
    // Fallback to the existing generatePersonalityPreview function
    const { generatePersonalityPreview: fallback } = await import('@/lib/personality-preview')
    return fallback(request.personality, request.vesselCode)
  }
}