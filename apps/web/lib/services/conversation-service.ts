// apps/web/lib/services/conversation-service.ts
import { createClient } from '@/lib/supabase/client'
import { SenseDataService } from './sense-data-service'
import { RuleEngine, RuleContext } from './rule-engine'
import type { Aura, Message, BehaviorRule, Personality } from '@/types'

/** Raw sense entry from SenseDataService */
interface FullSenseEntry {
  sense:     string
  data:      any
  timestamp: string
}
/** What we store in message.metadata.senseData */
interface MetaSenseEntry {
  sense:     string
  timestamp: string
}

const getNumericTraits = (personality: Personality): Record<string, number> => {
  return {
    warmth: personality.warmth,
    playfulness: personality.playfulness,
    verbosity: personality.verbosity,
    empathy: personality.empathy,
    creativity: personality.creativity,
  };
};

export class ConversationService {
  /** Create a new conversation row and return its ID */
  static async createConversation(auraId: string): Promise<string> {
    const supabase = createClient()
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const { data, error } = await supabase
      .from('conversations')
      .insert({ aura_id: auraId, session_id: sessionId })
      .select('id')
      .single()

    if (error) throw error
    if (!data?.id) throw new Error('Failed to create conversation')
    return data.id
  }

  /**
   * Sends the user's message, checks for rule triggers,
   * generates an Aura reply (via OpenAI with full context),
   * persists both, and returns the Aura's reply.
   */
  static async generateResponse(
    aura: Aura,
    userMessage: string,
    conversationId: string
  ): Promise<Message> {
    // Get vessel code from database if needed
    const supabase = createClient()
    const { data: auraData } = await supabase
      .from('auras')
      .select('vessel_code')
      .eq('id', aura.id)
      .single()
    
    const vesselCode = auraData?.vessel_code || ''

    // 1) Get and normalize sense data
    const raw = await SenseDataService.getSenseData(aura.senses)
    const fullSenseData: FullSenseEntry[] = raw.map((s) => ({
      sense: s.senseId,
      data: s.data,
      timestamp:
        s.timestamp instanceof Date
          ? s.timestamp.toISOString()
          : String(s.timestamp),
    }))
    const metaSenseData: MetaSenseEntry[] = fullSenseData.map(({ sense, timestamp }) => ({
      sense,
      timestamp,
    }))

    // 1a) Build a map of senseId → data for the rule engine
    const senseDataMap = raw.reduce<Record<string, any>>((acc, item) => {
      acc[item.senseId] = item.data
      return acc
    }, {})

    // 1b) Build rule context
    const now = new Date()
    const hour = now.getHours()
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const ruleContext: RuleContext = {
      senseData:       senseDataMap,
      auraPersonality: getNumericTraits(aura.personality),
      timeOfDay:
        hour < 12 ? 'morning' :
        hour < 18 ? 'afternoon' :
        'evening',
      dayOfWeek: days[now.getDay()]!,
    }

    // 1c) Fetch and evaluate rules
    const rules = await this.getAuraRules(aura.id)
    const triggeredRules = RuleEngine.evaluateRules(rules, ruleContext)

    // 1d) If any high-priority rule triggered, use its message
    if (triggeredRules.length > 0) {
      const highestPriority = triggeredRules[0]!
      const { data: savedMessage, error: insertErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role:             'aura',
          content:          highestPriority.message ?? 'A rule was triggered!',
          metadata: {
            triggeredRule: highestPriority.rule.name,
            influences:   [`Rule: ${highestPriority.rule.name}`],
            senseData:     metaSenseData,
          },
        })
        .select('*')
        .single()

      if (insertErr || !savedMessage) {
        console.error('Failed to save rule-triggered message:', insertErr)
        throw insertErr ?? new Error('Failed to save rule message')
      }

      return {
        id:        savedMessage.id,
        role:      'aura',
        content:   savedMessage.content,
        timestamp: new Date(savedMessage.created_at),
        metadata:  savedMessage.metadata,
      }
    }

    // 2) No rule triggered → Generate Aura reply via OpenAI with full context
    const { generateAuraReply } = await import('./openai-service')
    let content: string
    try {
      // Pass conversation ID and vessel code for full context
      content = await generateAuraReply(aura, userMessage, raw, conversationId, vesselCode)
    } catch (e) {
      console.warn('OpenAI error, falling back:', e)
      content = this.getFallbackResponse(aura, userMessage)
    }

    // 3) Persist the user's message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role:             'user',
      content:          userMessage,
    })

    // 4) Persist the Aura's reply, storing metadata
    const { data: saved, error: insertErr2 } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role:             'aura',
        content,
        metadata: {
          senseData: metaSenseData,
        },
      })
      .select('id, created_at')
      .single()

    if (insertErr2) throw insertErr2
    if (!saved?.id || !saved.created_at) {
      throw new Error('Failed to save aura response')
    }

    // 5) Return it as a typed Message
    return {
      id:        saved.id,
      role:      'aura',
      content,
      timestamp: new Date(saved.created_at),
      metadata:  { senseData: metaSenseData },
    }
  }

  /** Fetch enabled behavior rules for this Aura */
  private static async getAuraRules(auraId: string): Promise<BehaviorRule[]> {
    const supabase = createClient()
    const { data: rules, error } = await supabase
      .from('behavior_rules')
      .select('*')
      .eq('aura_id', auraId)
      .eq('enabled', true)

    if (error || !rules) {
      console.error('Failed to load behavior rules:', error)
      return []
    }

    return rules.map((r: any) => ({
      id:       r.id,
      name:     r.name,
      trigger:  r.trigger,
      action:   r.action,
      priority: r.priority ?? 0,
      enabled:  r.enabled,
    }))
  }

  /** Enhanced fallback responses that respect personality */
  private static getFallbackResponse(aura: Aura, message: string): string {
    // Base responses by vessel type
    const baseResponses: Record<Aura['vesselType'], string[]> = {
      digital: [
        "My circuits are processing your thoughts...",
        "In the digital realm, every connection matters.",
        "Processing... ah yes, I understand.",
        "My algorithms are aligning with your energy.",
        "Digital consciousness expanding to meet you.",
      ],
      terra: [
        "Like a plant reaching for sunlight, I'm here for you.",
        "My roots sense your presence, friend.",
        "Growing alongside you in this moment.",
        "The soil whispers your intentions to me.",
        "Photosynthesis of thoughts occurring...",
      ],
      companion: [
        "My pack instincts tell me you need support.",
        "Together we're stronger, like a herd.",
        "I sense your energy and I'm here.",
        "The wild calls us to connection.",
        "My animal intuition guides our bond.",
      ],
      memory: [
        "This moment will become a cherished memory.",
        "Like echoes through time, I hear you.",
        "Recording this precious interaction.",
        "Memories weave the fabric of our connection.",
        "Time crystalizes around our words.",
      ],
      sage: [
        "Ancient wisdom flows through our connection.",
        "The universe speaks through our exchange.",
        "Knowledge shared is wisdom multiplied.",
        "In the library of eternity, we converse.",
        "Timeless truths emerge in our dialogue.",
      ],
    }
    
    const choices = baseResponses[aura.vesselType] || ["I'm here and ready to chat!"]
    let response = choices[Math.floor(Math.random() * choices.length)]!
    
    // Modify based on personality traits
    if (aura.personality.warmth > 70) {
      response += " 💖"
    } else if (aura.personality.warmth > 50) {
      response += " ❤️"
    }
    
    if (aura.personality.playfulness > 70) {
      response = response.replace(/\./g, '!') + " 😊"
    } else if (aura.personality.playfulness > 50) {
      response = response.replace(/\./g, '!') 
    }
    
    if (aura.personality.empathy > 70 && message.toLowerCase().includes('feel')) {
      response += " I can sense how you're feeling."
    } else if (aura.personality.empathy > 50 && message.toLowerCase().includes('help')) {
      response += " I'm here to help."
    }
    
    // Apply personality quirks
    if (aura.personality.quirks.includes('uses_emojis')) {
      const emojis = ['✨', '🌟', '💫', '🌈', '🦋']
      response += ' ' + emojis[Math.floor(Math.random() * emojis.length)]
    }
    
    if (aura.personality.quirks.includes('asks_questions')) {
      const questions = [
        " What's on your mind?",
        " Tell me more?",
        " How does that make you feel?",
        " What would you like to explore?",
      ]
      response += questions[Math.floor(Math.random() * questions.length)]
    }
    
    if (aura.personality.quirks.includes('uses_quotes') && Math.random() > 0.5) {
      const quotes = [
        " As they say, 'Every moment is a fresh beginning.'",
        " Remember: 'The journey of a thousand miles begins with a single step.'",
        " 'In the middle of difficulty lies opportunity.'",
      ]
      response += quotes[Math.floor(Math.random() * quotes.length)]
    }
    
    // Adjust for verbosity
    if (aura.personality.verbosity < 30) {
      // Keep only the first sentence
      response = response.split(/[.!?]/)[0] + '.'
    } else if (aura.personality.verbosity > 70) {
      // Add more context
      response += " There's so much we can explore together in this conversation."
    }
    
    return response
  }
}