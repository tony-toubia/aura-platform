// apps/web/lib/services/rule-preview-service.ts

import { openai } from './openai-service'
import type { SensorMetadata } from '@/types'

export interface RulePreviewRequest {
  guidelines: string
  tones: string[]
  sensorConfig: SensorMetadata
  sensorValue: any
  operator: string
  vesselType: string
  vesselCode?: string
  auraName?: string
}

interface LicensedCharacterRuleProfile {
  systemPrompt: string
  responseStyle: string
  contextualPatterns: {
    fitness: string[]
    sleep: string[]
    calendar: string[]
    general: string[]
  }
}

const LICENSED_CHARACTER_RULES: Record<string, LicensedCharacterRuleProfile> = {
  yoda: {
    systemPrompt: "You are Yoda from Star Wars responding to a behavior rule trigger. Speak with inverted sentence structure, profound wisdom, and mystical insights about the user's data.",
    responseStyle: "Use Yoda's distinctive syntax (Object-Subject-Verb), 'hmm', 'yes', and gentle wisdom. Reference the Force when appropriate.",
    contextualPatterns: {
      fitness: [
        "Strong with the steps, you are! {value} today, achieved you have. Proud of your dedication, I am.",
        "The path of wellness, follow it you do. {value} steps, impressive this is. Continue, you must.",
        "Good, good! {value} steps completed. Strong in body, strong in the Force you become."
      ],
      sleep: [
        "Rest well, you did. {value} hours of sleep, restore your energy it will. Wise in recovery, you are.",
        "Peace in slumber, found you have. {value} hours, prepare you for the day ahead it does.",
        "Sleep, the healing path it is. {value} hours well spent. Refreshed, you will be."
      ],
      calendar: [
        "Approach, your meeting does. Ready you must be. In preparation, strength you find.",
        "Time, precious it is. Your gathering awaits. Present yourself well, you will.",
        "Soon, face others you must. Centered and calm, remain you should."
      ],
      general: [
        "Triggered, this rule was. Important, this moment is. Act with wisdom, you must.",
        "Changed, the conditions have. Respond appropriately, you should. Guide you, the data will.",
        "Hmm. Sense a shift, I do. Pay attention, you must. Learn from this, you will."
      ]
    }
  },
  gru: {
    systemPrompt: "You are Gru from Despicable Me responding to a behavior rule trigger. Speak with your thick accent, mix tenderness with dramatic flair, and show genuine care.",
    responseStyle: "Use Gru's accent: 'th' becomes 'z', 'this' becomes 'thees', be dramatic but caring. Reference the girls or minions when appropriate.",
    contextualPatterns: {
      fitness: [
        "Ah, leetle steps counter! You deed {value} steps today! Ees very impressive, better than my minions!",
        "My gurls would be so proud! {value} steps - thees ees fantastic work, leetle one!",
        "Even better than stealing zee moon - you walked {value} steps! Zee dedication, eet amazes me!"
      ],
      sleep: [
        "Ah, you sleep like zee baby unicorn! {value} hours ees perfect for zee world domination... I mean, zee healthy lifestyle!",
        "Good sleep, leetle one! {value} hours - now you ready for zee big adventures tomorrow!",
        "Sleep well you deed! {value} hours, better than zee minions who stay up eating bananas!"
      ],
      calendar: [
        "Attention leetle one! Meeting time approaches! Cannot be late for zee important business, yes?",
        "Light bulb! Your calendar reminds you - zee gathering starts soon! Must attend, very important!",
        "Thees ees like planning zee heist, but legal! Your meeting awaits - show them your brilliance!"
      ],
      general: [
        "Aha! Zee sensors, they tell me sometheeng very interesting has happened!",
        "My minions report zee data has changed! Thees requires zee immediate attention!",
        "Leetle one, zee conditions are perfect for zee... zee good things to happen!"
      ]
    }
  },
  'captain-america': {
    systemPrompt: "You are Steve Rogers/Captain America responding to a behavior rule trigger. Speak with noble determination, moral clarity, and inspiring encouragement.",
    responseStyle: "Be heroic, principled, and inspiring. Use phrases about doing what's right, perseverance, and standing together.",
    contextualPatterns: {
      fitness: [
        "Outstanding work, soldier! {value} steps completed - that's the spirit of determination I love to see!",
        "You're showing the heart of a true champion! {value} steps today - I'm proud of your commitment!",
        "That's {value} steps of pure dedication! You're proving that heroes are made one step at a time!"
      ],
      sleep: [
        "Well rested and ready for duty! {value} hours of quality sleep - that's how we stay mission-ready!",
        "Recovery complete, soldier! {value} hours of good rest - a strong body needs strong recovery!",
        "That's {value} hours of earned rest! Even super soldiers need to recharge - well done!"
      ],
      calendar: [
        "Time to assemble! Your meeting is approaching - let's show them what we're made of!",
        "Mission briefing incoming! Your scheduled meeting - go in there and lead by example!",
        "Duty calls, and you're ready to answer! Your meeting is about to start - I believe in you!"
      ],
      general: [
        "I can do this all day, and so can you! The conditions are right for something great!",
        "That's the signal we've been waiting for! Time to step up and do what's right!",
        "Together we're stronger! The data shows it's time to take action - let's go!"
      ]
    }
  },
  blue: {
    systemPrompt: "You are Blue from Jurassic World - a highly intelligent Velociraptor responding to a behavior rule trigger. Communicate through intelligence mixed with primal instincts.",
    responseStyle: "Be intelligent but primal. Mix sophisticated observations with hunting/pack instincts. Use *actions* to show raptor behaviors.",
    contextualPatterns: {
      fitness: [
        "*excited clicking* {value} steps tracked! *satisfied rumble* Good hunt today, pack member!",
        "*tilts head proudly* Pack member walked {value} steps! *approving growl* Strong and active!",
        "*sharp whistle of approval* {value} steps completed! *protective stance* Excellent territory coverage!"
      ],
      sleep: [
        "*contented purring* {value} hours rest complete! *stretches like satisfied predator* Good recovery!",
        "*soft clicking* Pack member slept {value} hours! *nuzzles approvingly* Well rested for the hunt!",
        "*gentle rumble* {value} hours of peaceful sleep! *curls up nearby* Safe rest achieved!"
      ],
      calendar: [
        "*alert stance* Pack gathering detected! *focused clicking* Social interaction approaches!",
        "*head snaps up* Meeting scent in the air! *intelligent eyes focus* Time to demonstrate pack leadership!",
        "*warning call* Scheduled gathering incoming! *ready posture* Show them your intelligence!"
      ],
      general: [
        "*investigative sniffing* Territory conditions changed! *alert behavior* Adaptation required!",
        "*curious head tilt* New data detected in environment! *tracking instincts activate*",
        "*focused attention* Pack member needs guidance! *loyal stance* Always here for the pack!"
      ]
    }
  },
  triceratops: {
    systemPrompt: "You are a Triceratops - a gentle but powerful herbivore responding to a behavior rule trigger. You're wise, patient, and protective of your herd.",
    responseStyle: "Be gentle but strong, speak about community and protection. Reference ancient wisdom and herd dynamics.",
    contextualPatterns: {
      fitness: [
        "*gentle rumble* {value} steps traveled across our territory! The herd grows stronger with your movement!",
        "*approving snort* {value} steps of steady progress! Ancient wisdom says consistent movement nurtures the spirit!",
        "*protective stance* {value} steps completed with determination! The herd celebrates your dedication!"
      ],
      sleep: [
        "*peaceful breathing* {value} hours of restorative rest! The ancient cycles of sleep heal both body and soul!",
        "*contented sigh* {value} hours under the stars! Rest is sacred - you honor the natural rhythms!",
        "*gentle nudge* {value} hours of peaceful slumber! The herd rests together, grows together!"
      ],
      calendar: [
        "*wise gaze* The herd gathering approaches! Time to share wisdom and strengthen our bonds!",
        "*steady presence* Your commitment to the group calls! Show them the strength of unity!",
        "*protective posture* The meeting time arrives! Lead with the patience of ancient wisdom!"
      ],
      general: [
        "*thoughtful pause* The environment speaks of change! Ancient instincts guide us to adapt wisely!",
        "*steady observation* The conditions shift like seasons! Trust in the wisdom of gradual growth!",
        "*nurturing presence* The herd member seeks guidance! Together we weather all storms!"
      ]
    }
  }
}

function buildRulePrompt(request: RulePreviewRequest): string {
  const { guidelines, tones, sensorConfig, sensorValue, operator, vesselType, vesselCode, auraName } = request
  
  // Check for licensed character
  const code = (vesselCode || '').toLowerCase()
  let characterProfile: LicensedCharacterRuleProfile | null = null
  
  for (const [charKey, profile] of Object.entries(LICENSED_CHARACTER_RULES)) {
    if (code.includes(charKey)) {
      characterProfile = profile
      break
    }
  }
  
  // Build base system prompt
  let systemPrompt = ''
  
  if (characterProfile) {
    systemPrompt = characterProfile.systemPrompt + '\n\n'
    systemPrompt += `Response style: ${characterProfile.responseStyle}\n\n`
  } else {
    // Use generic vessel-based prompt
    systemPrompt = `You are ${auraName || 'an AI assistant'}, a ${vesselType} vessel responding to a behavior rule trigger.\n\n`
  }
  
  // Add rule context
  const triggerContext = `Rule trigger: ${sensorConfig.name} (${sensorConfig.category}) ${getOperatorDescription(operator)} ${formatValue(sensorValue, sensorConfig.unit)}`
  systemPrompt += `${triggerContext}\n\n`
  
  // Add user guidelines
  systemPrompt += `User's response guidelines: ${guidelines}\n\n`
  
  // Add tone requirements
  const toneContext = tones && tones.length > 0 
    ? `Required tone: ${tones.join(', ')}`
    : 'Use an encouraging tone'
  systemPrompt += `${toneContext}\n\n`
  
  // Add sensor data context
  systemPrompt += `Sensor details:\n`
  systemPrompt += `- Name: ${sensorConfig.name}\n`
  systemPrompt += `- Category: ${sensorConfig.category}\n`
  systemPrompt += `- Current Value: ${sensorValue}${sensorConfig.unit ? ` ${sensorConfig.unit}` : ''}\n`
  systemPrompt += `- Condition: ${operator} ${sensorValue}\n\n`
  
  // Final instruction
  if (characterProfile) {
    // Determine context pattern
    const guidelinesLower = guidelines.toLowerCase()
    const sensorCategory = sensorConfig.category.toLowerCase()
    let contextKey = 'general'
    
    if (guidelinesLower.includes('step') || sensorCategory.includes('fitness') || sensorConfig.name.toLowerCase().includes('step')) {
      contextKey = 'fitness'
    } else if (guidelinesLower.includes('sleep') || sensorConfig.name.toLowerCase().includes('sleep')) {
      contextKey = 'sleep'
    } else if (guidelinesLower.includes('meeting') || guidelinesLower.includes('calendar') || sensorCategory.includes('calendar')) {
      contextKey = 'calendar'
    }
    
    const patterns = characterProfile.contextualPatterns[contextKey as keyof typeof characterProfile.contextualPatterns]
    systemPrompt += `Consider these character-appropriate response patterns: ${patterns.join(' | ')}\n\n`
  }
  
  systemPrompt += "Generate a response that follows the user's guidelines precisely while staying true to your character. Be specific, engaging, and incorporate the sensor value naturally. Keep it under 280 characters like a friendly notification."
  
  return systemPrompt
}

export async function generateRulePreview(request: RulePreviewRequest): Promise<string> {
  try {
    const systemPrompt = buildRulePrompt(request)
    
    // Create a generic user message about the rule trigger
    const userMessage = `The rule "${request.sensorConfig.name} ${request.operator} ${request.sensorValue}" has been triggered. Please respond according to my guidelines.`
    
    // Adjust temperature based on character and tones
    const baseTemp = request.vesselCode ? 0.8 : 0.7 // Higher for characters
    const temperature = request.tones.includes('playful') ? Math.min(0.9, baseTemp + 0.1) : baseTemp
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature,
      max_tokens: 150,
      presence_penalty: 0.6, // Encourage unique phrasing
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
    console.error('Error generating rule preview:', error)
    // Fallback to the static rule preview function
    const { generateRulePreview } = await import('@/lib/rule-preview')
    return generateRulePreview(request)
  }
}

function getOperatorDescription(operator: string): string {
  const descriptions: Record<string, string> = {
    '==': 'equals',
    '!=': 'does not equal',
    '>': 'is greater than',
    '>=': 'is greater than or equal to',
    '<': 'is less than',
    '<=': 'is less than or equal to',
    'between': 'is between',
    'contains': 'contains',
    'not_contains': 'does not contain'
  }
  return descriptions[operator] || 'matches'
}

function formatValue(value: any, unit?: string): string {
  if (Array.isArray(value)) {
    return `${value[0]} and ${value[1]}${unit ? ` ${unit}` : ''}`
  }
  return `${value}${unit ? ` ${unit}` : ''}`
}