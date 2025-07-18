// apps/web/lib/services/openai-service.ts
import OpenAI from 'openai'
import type { Aura } from '@/types'
import type { SenseData } from './sense-data-service'

// ensure the key is present at startup (server-only)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in environment')
}

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

/**
 * Build a system prompt from the Aura’s personality & senses,
 * call OpenAI’s chat completion, and return the assistant reply.
 */
export async function generateAuraReply(
  aura: Aura,
  userMessage: string,
  senseData: SenseData[]
): Promise<string> {
  // 1) Personality summary
  const personalityDesc = Object.entries(aura.personality)
    .map(([trait, val]) => `${trait}: ${val}`)
    .join(', ')

  // 2) Live senses summary
  const sensesDesc = senseData
    .map(s => `${s.senseId} → ${JSON.stringify(s.data)}`)
    .join('\n')

  const systemPrompt = `
You are an AI Aura named "${aura.name}", vesselType="${aura.vesselType}".
Personality traits: ${personalityDesc}.
Live senses:
${sensesDesc}

Respond in 2–3 sentences using your vessel’s voice profile.
  `.trim()

  // 3) OpenAI call
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: aura.personality.creativity / 100,
    messages: [
      { role: 'system',  content: systemPrompt },
      { role: 'user',    content: userMessage  },
    ],
  })

  const reply = completion.choices?.[0]?.message?.content
  if (!reply) {
    throw new Error('OpenAI returned no content')
  }
  return reply
}
