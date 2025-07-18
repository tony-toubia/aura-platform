// apps/web/lib/services/conversation-service.ts
import { createClient } from '@/lib/supabase/client'
import { SenseDataService } from './sense-data-service'
import { RuleEngine, RuleContext } from './rule-engine'
import type { Aura, Message, BehaviorRule } from '@/types'

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
   * Sends the user’s message, checks for rule triggers,
   * generates an Aura reply (via OpenAI fallback to canned),
   * persists both, and returns the Aura’s reply.
   */
  static async generateResponse(
    aura: Aura,
    userMessage: string,
    conversationId: string
  ): Promise<Message> {
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
      auraPersonality: aura.personality,
      timeOfDay:
        hour < 12 ? 'morning' :
        hour < 18 ? 'afternoon' :
        'evening',
      dayOfWeek: days[now.getDay()]!,  // <-- safe non-null assertion
    }

    // 1c) Fetch and evaluate rules
    const rules = await this.getAuraRules(aura.id)
    const triggeredRules = RuleEngine.evaluateRules(rules, ruleContext)

    // 1d) If any high-priority rule triggered, use its message
    if (triggeredRules.length > 0) {
      // now TS knows [0] exists
      const highestPriority = triggeredRules[0]!
      const supabase = createClient()
      const { data: savedMessage, error: insertErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role:            'aura',
          content:         highestPriority.message ?? 'A rule was triggered!',
          metadata: {
            triggeredRule: highestPriority.rule.name,
            influences:    [`Rule: ${highestPriority.rule.name}`],
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

    // 2) No rule triggered → Generate Aura reply via OpenAI
    const { generateAuraReply } = await import('./openai-service')
    let content: string
    try {
      content = await generateAuraReply(aura, userMessage, raw)
    } catch (e) {
      console.warn('OpenAI error, falling back:', e)
      content = this.getFallbackResponse(aura, userMessage)
    }

    // 3) Persist the user’s message
    const supabase = createClient()
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role:            'user',
      content:         userMessage,
    })

    // 4) Persist the Aura’s reply, storing metadata
    const { data: saved, error: insertErr2 } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role:            'aura',
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

  /** Completely canned fallback if OpenAI isn’t available */
  private static getFallbackResponse(aura: Aura, message: string): string {
    const map: Record<Aura['vesselType'], string[]> = {
      terra: [
        "As a plant, I thrive on sunlight and water—and good chat!",
        "My leaves rustle with curiosity about your words.",
        "Every day in my pot brings new growth.",
      ],
      companion: [
        "Elephants value memory and community—just like us!",
        "In the savanna, we learn resilience and empathy.",
        "I'm here to share stories from the wild.",
      ],
      memory: [
        "That reminds me of a cherished moment from the past.",
        "Memories connect us—let me tell you one!",
        "I treasure recollections across time.",
      ],
      sage: [
        "Ancient wisdom often shines a guiding light.",
        "Throughout history, patterns repeat in fascinating ways.",
        "Let me share a thought from centuries of knowledge.",
      ],
    }
    const choices = map[aura.vesselType] || []
    if (!choices.length) {
      return "I'm here and ready to chat!"
    }
    return choices[Math.floor(Math.random() * choices.length)]!
  }
}
