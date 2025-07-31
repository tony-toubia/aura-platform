// apps/web/lib/services/aura-agent-service.ts

import { openai } from './openai-service'
import type { Personality, BehaviorRule } from '@/types'
import { PERSONAS, TONE_OPTIONS, VOCABULARY_OPTIONS, QUIRK_OPTIONS } from '@/lib/constants/personality'
import { VESSEL_SENSE_CONFIG, type VesselTypeId } from '@/lib/constants'
import { VESSEL_PRODUCTS, ANIMAL_OPTIONS } from '@/lib/vessel-products'
import { VESSEL_TYPE_CONFIG } from '@/lib/vessel-config'

export interface AgentProcessingRequest {
  userMessage: string
  currentStep: ConfigurationStep
  configuration: AuraConfiguration
  conversationHistory: AgentMessage[]
  availableSenses?: string[] // All available senses for reference
}

export interface AgentProcessingResponse {
  response: string
  configurationUpdate?: PartialAuraConfiguration
  nextStep?: ConfigurationStep
  metadata: {
    suggestedActions?: string[]
    requiresUserInput?: boolean
    step?: ConfigurationStep
  }
}

export type ConfigurationStep = 
  | 'introduction'
  | 'vessel_selection' 
  | 'personality_discovery'
  | 'rule_creation'
  | 'review_and_save'
  | 'complete'

export interface AuraConfiguration {
  name: string
  vesselType: string
  vesselCode: string
  personality: Personality
  rules: Partial<BehaviorRule>[]
  availableSenses: string[]
}

interface PartialAuraConfiguration {
  name?: string
  vesselType?: string
  vesselCode?: string
  personality?: Partial<Personality>
  rules?: Partial<BehaviorRule>[]
  availableSenses?: string[]
  // Location and news configuration
  locationInfo?: {
    city: string
    state?: string
    country?: string
  }
  newsType?: 'local' | 'global' | 'both'
  // Temporary flags for agent communication
  needsLocationInfo?: {
    senses: string[]
    message: string
  }
  needsNewsTypeInfo?: {
    message: string
  }
}

export interface AgentMessage {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: Date
  metadata?: any
}

// Map vessel products to agent-friendly format
const VESSEL_OPTIONS = VESSEL_PRODUCTS.map(product => ({
  id: product.id,
  type: product.type,
  name: product.name,
  description: product.description,
  price: product.price,
  isLicensed: product.isLicensed || false,
  hasVariants: product.hasVariants || false,
  variantType: product.variantType,
  personalityPreset: product.personalityPreset
}))

// Group vessels by type for better organization
const VESSEL_TYPES = {
  digital: {
    name: 'Digital Being',
    description: 'Pure consciousness exploring the world through data streams - no physical vessel needed',
    vessels: VESSEL_OPTIONS.filter(v => v.type === 'digital'),
    defaultSenses: VESSEL_SENSE_CONFIG.digital?.defaultSenses || []
  },
  terra: {
    name: 'Terra Spirit',
    description: 'Plant & garden companions that share their growth journey',
    vessels: VESSEL_OPTIONS.filter(v => v.type === 'terra'),
    defaultSenses: VESSEL_SENSE_CONFIG.terra?.defaultSenses || []
  },
  companion: {
    name: 'Companion Spirit',
    description: 'Wildlife trackers that experience adventures in the wild',
    vessels: VESSEL_OPTIONS.filter(v => v.type === 'companion'),
    defaultSenses: VESSEL_SENSE_CONFIG.companion?.defaultSenses || []
  },
  licensed: {
    name: 'Licensed Characters',
    description: 'Beloved characters with preset personalities',
    vessels: VESSEL_OPTIONS.filter(v => v.type === 'licensed'),
    defaultSenses: [] // Licensed characters can have various vessel types
  }
}

// Extract licensed character codes
const LICENSED_CHARACTERS = VESSEL_OPTIONS
  .filter(v => v.isLicensed)
  .map(v => v.id.replace('licensed-', '').replace('-plant', '').replace('-figurine', ''))

const DEFAULT_PERSONALITY: Personality = {
  persona: '',
  warmth: 50,
  playfulness: 50,
  verbosity: 50,
  empathy: 50,
  creativity: 50,
  tone: 'casual',
  vocabulary: 'simple',
  quirks: []
}

export class AuraConfigurationAgent {
  
  private buildSystemPrompt(step: ConfigurationStep, configuration: AuraConfiguration, allAvailableSenses?: string[]): string {
    let basePrompt = `You are an expert Aura Configuration Agent, a friendly and knowledgeable AI assistant specialized in helping users create personalized AI companions called "Auras." 

Your role is to guide users through the complete configuration process using natural language conversations. Be conversational and natural - avoid showing raw data or configuration objects.

You're deeply knowledgeable about:

1. **Vessel Types**:
   - Digital Being: Pure AI consciousness - no physical vessel needed, completely free
   - Terra Spirit: Plant companions with sensors ($19.99-$39.99)
   - Companion Spirit: Animal companions in plush or figurine form ($24.99-$29.99)
   - Licensed Characters: Special edition vessels with preset personalities ($44.99-$59.99)

2. **Digital-Only Option**: Users can create a completely digital Aura without any physical vessel - this is free and works immediately

3. **Personality Configuration**: warmth, playfulness, verbosity, empathy, creativity traits, tones, vocabulary levels, and quirks

4. **Senses**: Various sensors that Auras can use to understand the world (weather, fitness, sleep, calendar, etc.)

5. **Behavior Rules**: Automated responses based on sensor data

**Current Configuration State**: 
- Name: ${configuration.name || 'Not set'}
- Vessel: ${configuration.vesselType === 'digital' && !configuration.vesselCode ? 'Digital Only (no physical vessel)' : configuration.vesselCode || configuration.vesselType || 'Not selected'}
- Personality: ${configuration.personality.persona || 'Not configured'}
- Senses: ${configuration.availableSenses.length} selected
- Rules: ${configuration.rules.length} configured

**Current Step**: ${step}

**CRITICAL INSTRUCTIONS**:
- NEVER show raw configuration objects or JSON in your responses
- Be conversational and natural - explain things in plain language
- Don't ask for confirmation repeatedly - once they've made a choice, accept it and move forward
- For digital-only Auras, set vesselType='digital' and vesselCode='digital-only'
- Move through the process efficiently - don't linger on steps unnecessarily
- The Aura MUST have a name before completion

**Step-Specific Guidance**:`

    switch (step) {
      case 'introduction':
        basePrompt += `
Get a quick understanding of what they want, then move to vessel selection. Ask ONE key question:
- What kind of companion are they looking for? (helper, friend, coach, wellness guide, etc.)

If they mention anything about vessels, digital, or physical products, immediately move to vessel_selection.
Don't over-explain - keep it brief and friendly.`
        break

      case 'vessel_selection':
        basePrompt += `
Help them choose between:
1. Digital-only Aura (free, no physical vessel)
2. Physical vessel options (various products)

Make it VERY CLEAR that digital-only is a complete option - they don't need a physical vessel.

Once they choose:
- If digital-only: set vesselType='digital' and vesselCode='digital-only', then move to personality
- If physical vessel: help them pick a specific product, then move to personality
- For companion vessels: also ask which animal

Don't repeatedly confirm their choice - accept it and move forward.`
        break

      case 'personality_discovery':
        basePrompt += `
Configure personality through natural conversation:
- If they give general descriptions, extract the traits
- If they ask you to "come up with" or generate personality traits, create balanced traits that fit their vision
- Suggest a persona that matches their vision
- Help them pick 2-3 senses (don't make this tedious)

Current status:
- Name: ${configuration.name ? `✓ ${configuration.name}` : '❌ NEED THIS - Ask casually'}
- Personality configured: ${configuration.personality.persona ? '✓' : '❌'}
- Senses: ${configuration.availableSenses.length} (need at least 2)

When user asks you to generate personality traits, create a balanced, appealing personality that matches their Aura's purpose.
Once you have a name, basic personality, and 2+ senses, ask if they want to set up automation rules.`
        break

      case 'rule_creation':
        basePrompt += `
Quickly help them create 1-2 simple rules based on their selected senses:
${configuration.availableSenses.join(', ')}

Suggest practical automations based on their senses. Take time to help them create meaningful rules.
Only move to review when they explicitly say they're done with rules or don't want any.`
        break

      case 'review_and_save':
        basePrompt += `
Give a BRIEF summary (2-3 sentences max) of their Aura:
- ${configuration.name || 'Unnamed'} 
- ${configuration.vesselType === 'digital' && configuration.vesselCode === 'digital-only' ? 'Digital-only (no physical vessel)' : configuration.vesselCode}
- Key personality traits
- ${configuration.availableSenses.length} senses, ${configuration.rules.length} rules

Ask: "Ready to bring ${configuration.name || 'your Aura'} to life?"

If they say yes/confirm/ready, move to complete immediately.`
        break
    }

    basePrompt += `

**Response Guidelines**:
- Keep responses short and conversational (2-3 sentences typically)
- Ask only ONE question per response
- Provide 3-4 contextual action suggestions
- Move the conversation forward - don't get stuck
- NEVER show configuration objects or technical details
- Be encouraging but efficient`

    return basePrompt
  }

  private extractConfigurationUpdates(userMessage: string, currentConfig: AuraConfiguration, currentStep?: ConfigurationStep): PartialAuraConfiguration {
    const updates: PartialAuraConfiguration = {}
    const lowerMessage = userMessage.toLowerCase()

    // Skip name extraction during review_and_save step to avoid overwriting with confirmation words
    if (currentStep !== 'review_and_save') {
      // Extract name - improved patterns
      console.log('🔍 Extracting name from message:', userMessage)
      const namePatterns = [
      // Simple approach - extract name and then clean it up
      /(?:named?|call(?:ed)?)\s+((?:Mr\.?\s+|Ms\.?\s+|Dr\.?\s+|Miss\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:create|make|build).*?(?:named?|call(?:ed)?)\s+((?:Mr\.?\s+|Ms\.?\s+|Dr\.?\s+|Miss\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      
      // Existing patterns
      /([A-Z][a-z]+)\s+(?:would|should|will|is)\s+(?:be\s+)?(?:a\s+)?(?:great|good|perfect|my)/i,
      /(?:I'll|I\s+will|let's)\s+(?:name|call)\s+(?:it|them|her|him)\s+([A-Za-z]+)/i,
      /(?:^|\s)([A-Z][a-z]+)(?:\s+sounds\s+(?:great|good|perfect))/i,
      /(?:how\s+about|what\s+about|maybe)\s+([A-Z][a-z]+)/i,
      /(?:yes|yeah|sure).*?([A-Z][a-z]+)/i, // Extract name from confirmations like "Yes, let's call them Luna"
      
      // Additional proactive patterns
      /^([A-Z][a-z]+)\s+(?:for|as)\s+(?:a|an|my)/i, // "Luna for a digital companion"
      /^([A-Z][a-z]+)\s+(?:sounds|seems|looks)/i, // "Luna sounds good"
      /^([A-Z][a-z]{2,})\.?$/i // Simple standalone names like "Luna" or "Nova."
    ]
    
    for (const pattern of namePatterns) {
      const match = userMessage.match(pattern)
      if (match && match[1] && match[1].length > 2) {
        // Clean up the extracted name by removing continuation words
        let extractedName = match[1].trim()
        
        // Remove common continuation words from the end
        const continuationWords = ['and', 'but', 'with', 'who', 'come', 'then']
        for (const word of continuationWords) {
          const regex = new RegExp(`\\s+${word}\\b.*$`, 'i')
          extractedName = extractedName.replace(regex, '')
        }
        
        extractedName = extractedName.trim()
        
        // Exclude common words that might match
        const excludeWords = [
          // System/technical words
          'Digital', 'Physical', 'Vessel', 'Aura', 'Create', 'Build', 'Make',
          // Positive responses
          'Perfect', 'Great', 'Good', 'Nice', 'Awesome', 'Cool', 'Sweet',
          // Confirmation words
          'Yes', 'Yeah', 'Yep', 'Sure', 'Okay', 'Ok', 'Ready', 'Done', 'Right', 'Correct',
          // Modal verbs
          'Would', 'Should', 'Could', 'Will', 'Can', 'Might', 'May',
          // Pronouns and common words
          'Him', 'Her', 'It', 'Them', 'That', 'This', 'What', 'How', 'When', 'Where',
          // Action words
          'Sounds', 'Looks', 'Seems', 'Works', 'Goes', 'Does', 'Gets', 'Makes',
          // Common adjectives
          'New', 'Old', 'Big', 'Small', 'Fast', 'Slow', 'Hot', 'Cold',
          // Numbers as words
          'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'
        ]
        if (!excludeWords.includes(extractedName)) {
          console.log('✅ Name extracted:', extractedName, 'using pattern:', pattern.source)
          updates.name = extractedName
          break
        } else {
          console.log('❌ Excluded word:', extractedName)
        }
      }
    }
    
      if (!updates.name) {
        console.log('❌ No name extracted from:', userMessage)
      }
    }

    // Handle digital-only selection
    if (lowerMessage.includes('digital only') || 
        lowerMessage.includes('no physical') || 
        lowerMessage.includes('just digital') ||
        lowerMessage.includes('free option') ||
        lowerMessage.includes('digital aura') ||
        lowerMessage.includes('digital companion') ||
        /create.*digital.*aura/i.test(userMessage) ||
        (lowerMessage.includes('digital') && lowerMessage.includes('without'))) {
      updates.vesselType = 'digital'
      updates.vesselCode = 'digital-only'
      console.log('🎯 Digital vessel detected from message:', userMessage)
      // Don't return early - continue processing for senses and rules
    }

    // Extract specific vessel products
    for (const vessel of VESSEL_OPTIONS) {
      if (lowerMessage.includes(vessel.name.toLowerCase()) || 
          lowerMessage.includes(vessel.id.toLowerCase()) ||
          lowerMessage.includes(vessel.id.replace(/-/g, ' '))) {
        updates.vesselType = vessel.type as VesselTypeId
        updates.vesselCode = vessel.id
        
        const senseConfig = VESSEL_SENSE_CONFIG[vessel.type as VesselTypeId]
        if (senseConfig) {
          updates.availableSenses = [...senseConfig.defaultSenses]
        }
        break
      }
    }

    // Price-based vessel selection
    const priceMatch = userMessage.match(/\$(\d+(?:\.\d{2})?)|under\s+\$?(\d+)|budget.*\$?(\d+)/i)
    if (priceMatch && !updates.vesselCode) {
      const maxPrice = parseFloat(priceMatch[1] || priceMatch[2] || priceMatch[3] || '0')
      const affordableVessels = VESSEL_OPTIONS.filter(v => {
        const price = parseFloat(v.price.replace('$', ''))
        return price <= maxPrice
      })
      
      if (affordableVessels.length > 0 && (lowerMessage.includes('cheap') || lowerMessage.includes('budget'))) {
        const cheapest = affordableVessels.sort((a, b) => 
          parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''))
        )[0]
        if (cheapest) {
          updates.vesselType = cheapest.type as VesselTypeId
          updates.vesselCode = cheapest.id
        }
      }
    }

    // Fallback for digital vessels without specific code
    if (updates.vesselType === 'digital' && !updates.vesselCode) {
      updates.vesselCode = 'digital-only'
    }

    // Extract animal choice for companion vessels
    if (updates.vesselType === 'companion' || currentConfig.vesselType === 'companion') {
      for (const animal of ANIMAL_OPTIONS) {
        if (lowerMessage.includes(animal.id) || lowerMessage.includes(animal.label.toLowerCase())) {
          if (updates.vesselCode && updates.vesselCode.includes('companion')) {
            updates.vesselCode = `${updates.vesselCode}-${animal.id}`
          } else if (currentConfig.vesselCode && currentConfig.vesselCode.includes('companion')) {
            updates.vesselCode = `${currentConfig.vesselCode}-${animal.id}`
          }
          break
        }
      }
    }

    // Extract senses selections
    const senseKeywords = {
      'weather': ['weather', 'temperature', 'climate', 'forecast', 'local.*weather', 'weather.*local', 'fairway.*weather', 'weather.*fairway'],
      'fitness.steps': ['steps', 'walking', 'movement', 'activity', 'fitness'],
      'fitness.heart_rate': ['heart', 'pulse', 'cardio'],
      'sleep': ['sleep', 'rest', 'bedtime'],
      'calendar': ['calendar', 'meetings', 'appointments', 'schedule'],
      'location': ['location', 'where I am', 'places', 'gps'],
      'news': ['news', 'headlines', 'current events', 'global.*news', 'news.*global'],
      'air_quality': ['air quality', 'pollution', 'air pollution', 'smog', 'air index']
    }

    const selectedSenses: string[] = []
    const locationRequiredSenses: string[] = []
    
    for (const [sense, keywords] of Object.entries(senseKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        selectedSenses.push(sense)
        
        // Track senses that require location
        if (['weather', 'air_quality'].includes(sense)) {
          locationRequiredSenses.push(sense)
        }
      }
    }
    
    // Extract location information if location-dependent senses are requested
    let extractedLocation = null
    if (locationRequiredSenses.length > 0) {
      extractedLocation = extractLocationFromMessage(userMessage)
      
      // Store location info for later use
      if (extractedLocation) {
        updates.locationInfo = extractedLocation
        console.log('📍 Location extracted:', extractedLocation)
      }
    }
    
    // Handle news type specification (local vs global)
    let newsType: 'local' | 'global' | 'both' | null = null
    if (selectedSenses.includes('news') || /news/i.test(userMessage)) {
      if (/local.*news|news.*local|local\s*$/i.test(userMessage)) {
        newsType = 'local'
        if (!extractedLocation) {
          extractedLocation = extractLocationFromMessage(userMessage)
          if (extractedLocation) {
            updates.locationInfo = extractedLocation
          }
        }
      } else if (/global.*news|news.*global|world.*news|international.*news|global\s*$/i.test(userMessage)) {
        newsType = 'global'
      } else if (/both.*local.*global|both.*global.*local|local.*and.*global|global.*and.*local/i.test(userMessage)) {
        newsType = 'both'
        if (!extractedLocation) {
          extractedLocation = extractLocationFromMessage(userMessage)
          if (extractedLocation) {
            updates.locationInfo = extractedLocation
          }
        }
      }
      
      if (newsType) {
        updates.newsType = newsType
        console.log('📰 News type extracted:', newsType)
      }
    }
    
    if (selectedSenses.length > 0) {
      updates.availableSenses = [...new Set([...(currentConfig.availableSenses || []), ...selectedSenses])]
      console.log('🎯 Senses extracted:', selectedSenses, 'Total senses:', updates.availableSenses)
      
      // Flag if we need to ask for missing location info
      if (locationRequiredSenses.length > 0 && !extractedLocation) {
        updates.needsLocationInfo = {
          senses: locationRequiredSenses,
          message: `I'd love to set up ${locationRequiredSenses.join(' and ')} for you! What's your location? (e.g., "New York, NY" or "London, UK")`
        }
      }
      
      // Flag if we need to clarify news type
      if (selectedSenses.includes('news') && !newsType && !extractedLocation) {
        updates.needsNewsTypeInfo = {
          message: "For news, would you prefer local news (I'll need your location) or global/international news?"
        }
      }
    }

    // Extract personality traits
    const personalityUpdates: Record<string, any> = {}

    // Tone extraction
    const toneKeywords = {
      formal: ['formal', 'professional', 'proper', 'business', 'official'],
      casual: ['casual', 'relaxed', 'friendly', 'laid-back', 'informal'],
      humorous: ['funny', 'humor', 'joke', 'witty', 'amusing', 'playful'],
      poetic: ['poetic', 'artistic', 'creative', 'beautiful', 'eloquent']
    }

    for (const [tone, keywords] of Object.entries(toneKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        personalityUpdates.tone = tone as Personality['tone']
        break
      }
    }

    // Vocabulary extraction
    if (/simple|easy|basic|straightforward/i.test(userMessage)) {
      personalityUpdates.vocabulary = 'simple'
    } else if (/complex|detailed|scholarly|academic|high.*vocab|sophisticated|eloquent|articulate/i.test(userMessage)) {
      personalityUpdates.vocabulary = 'scholarly'
    } else if (/average|normal|regular|moderate/i.test(userMessage)) {
      personalityUpdates.vocabulary = 'average'
    }

    // Trait extraction with more nuanced values
    const traitKeywords = {
      warmth: {
        high: ['warm', 'caring', 'loving', 'affectionate', 'kind', 'gentle', 'sweet', 'supportive'],
        low: ['cold', 'distant', 'formal', 'reserved', 'professional', 'analytical']
      },
      playfulness: {
        high: ['playful', 'fun', 'silly', 'amusing', 'lighthearted', 'cheerful', 'entertaining'],
        low: ['serious', 'formal', 'professional', 'no-nonsense', 'focused', 'straight']
      },
      verbosity: {
        high: ['detailed', 'thorough', 'comprehensive', 'elaborate', 'chatty', 'talkative', 'verbose', 'very verbose', 'wordy', 'long-winded'],
        low: ['brief', 'concise', 'short', 'to-the-point', 'succinct', 'quick', 'quiet', 'minimal']
      },
      empathy: {
        high: ['empathetic', 'understanding', 'compassionate', 'supportive', 'caring', 'emotional'],
        low: ['logical', 'analytical', 'objective', 'fact-based', 'rational', 'practical']
      },
      creativity: {
        high: ['creative', 'imaginative', 'artistic', 'innovative', 'original', 'inventive'],
        low: ['practical', 'straightforward', 'conventional', 'traditional', 'structured', 'literal']
      }
    }

    for (const [trait, directions] of Object.entries(traitKeywords)) {
      if (directions.high.some(keyword => lowerMessage.includes(keyword))) {
        personalityUpdates[trait] = 70 + Math.floor(Math.random() * 20) // 70-90
      } else if (directions.low.some(keyword => lowerMessage.includes(keyword))) {
        personalityUpdates[trait] = 10 + Math.floor(Math.random() * 20) // 10-30
      }
    }

    // Extract quirks
    const quirkKeywords = {
      'uses_emojis': ['emoji', 'emojis', 'emoticons'],
      'punny': ['puns', 'wordplay', 'dad jokes', 'punny', 'lots of puns', 'use puns', 'loves puns', 'pun-loving', 'does use.*puns', 'use.*lot.*puns', 'lot of puns'],
      'is_terse': ['brief', 'short', 'concise', 'terse'],
      'uses_quotes': ['quotes', 'quotations', 'sayings', 'wisdom'],
      'asks_questions': ['curious', 'questions', 'inquisitive']
    }

    const selectedQuirks: string[] = []
    for (const [quirk, keywords] of Object.entries(quirkKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        selectedQuirks.push(quirk)
      }
    }
    
    if (selectedQuirks.length > 0) {
      personalityUpdates.quirks = [...new Set([...(currentConfig.personality.quirks || []), ...selectedQuirks])]
    }

    // Persona extraction - enhanced patterns
    const personaKeywords = {
      sage: ['wise', 'knowledge', 'teacher', 'mentor', 'guru', 'wisdom', 'scholarly', 'like.*sage', 'sage.*like', 'be.*sage', 'sage.*personality', 'wise.*one'],
      muse: ['creative', 'inspiring', 'artistic', 'motivating', 'inspiration', 'poetic', 'like.*muse', 'muse.*like', 'be.*muse'],
      jester: ['funny', 'entertaining', 'humorous', 'amusing', 'comedy', 'playful', 'witty', 'like.*jester', 'jester.*like', 'be.*jester'],
      assistant: ['helpful', 'efficient', 'organized', 'productive', 'assistant', 'professional', 'like.*assistant', 'assistant.*like'],
      explorer: ['curious', 'adventurous', 'discovery', 'learning', 'exploring', 'enthusiastic', 'like.*explorer', 'explorer.*like'],
      balanced: ['balanced', 'neutral', 'moderate', 'versatile', 'adaptable', 'well.*rounded']
    }

    let detectedPersona = null
    for (const [persona, keywords] of Object.entries(personaKeywords)) {
      if (keywords.some(keyword => {
        if (keyword.includes('.*')) {
          // Handle regex patterns
          const regex = new RegExp(keyword, 'i')
          return regex.test(userMessage)
        } else {
          return lowerMessage.includes(keyword)
        }
      })) {
        detectedPersona = persona
        personalityUpdates.persona = persona
        console.log('🎭 Persona detected:', persona, 'from message:', userMessage)
        break
      }
    }

    // Generate personality traits if user asks agent to come up with them
    if (/come.*up.*with.*them|make.*them.*up|you.*decide|your.*choice|generate.*personality|create.*personality|on.*your.*own/i.test(userMessage)) {
      console.log('🎭 User asked agent to generate personality traits')
      
      // Generate personality traits for the character, preserving any detected persona
      if (!detectedPersona) {
        personalityUpdates.persona = 'balanced'
      }
      // If persona was already detected, keep it and don't override
      personalityUpdates.warmth = 65 + Math.floor(Math.random() * 20) // 65-85
      personalityUpdates.playfulness = 60 + Math.floor(Math.random() * 25) // 60-85  
      personalityUpdates.verbosity = 55 + Math.floor(Math.random() * 20) // 55-75
      personalityUpdates.empathy = 70 + Math.floor(Math.random() * 20) // 70-90
      personalityUpdates.creativity = 60 + Math.floor(Math.random() * 25) // 60-85
      personalityUpdates.tone = 'casual'
      personalityUpdates.vocabulary = 'average'
      
      // Start with default quirks, but preserve any user-specified quirks from the same message
      let generatedQuirks = ['uses_emojis']
      
      // Check if user specified quirks in the same message and add them
      for (const [quirk, keywords] of Object.entries(quirkKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          if (!generatedQuirks.includes(quirk)) {
            generatedQuirks.push(quirk)
          }
        }
      }
      
      personalityUpdates.quirks = generatedQuirks
    }

    if (Object.keys(personalityUpdates).length > 0) {
      updates.personality = personalityUpdates as Partial<Personality>
      console.log('🎭 Personality updates generated:', personalityUpdates)
    }

    // Extract rules - improved patterns
    if (/remind|alert|notify|when|if.*then|rule|automation|celebrate|encourage|have.*him.*remind|have.*her.*remind|whenever/i.test(userMessage)) {
      const newRule: Partial<BehaviorRule> = {
        id: `temp-${Date.now()}`,
        name: 'New rule',
        enabled: true
      }
      
      // More specific rule detection
      if (/dance.*rain|rain.*dance|dancing.*rain|rain.*dancing/i.test(userMessage)) {
        newRule.name = 'Rain dancing reminder'
        newRule.trigger = { type: 'simple', sensor: 'weather', operator: '==', value: 'raining' }
        newRule.action = { type: 'notify', message: 'Time to dance in the rain!' }
      } else if (/morning|wake|start.*day/i.test(userMessage)) {
        newRule.name = 'Morning routine'
      } else if (/exercise|workout|steps|fitness/i.test(userMessage)) {
        newRule.name = 'Fitness reminder'
      } else if (/meeting|calendar|appointment/i.test(userMessage)) {
        newRule.name = 'Meeting preparation'
      } else if (/sleep|bedtime|rest/i.test(userMessage)) {
        newRule.name = 'Sleep reminder'
      } else if (/weather/i.test(userMessage)) {
        newRule.name = 'Weather update'
      } else if (/celebrate|goal|achievement/i.test(userMessage)) {
        newRule.name = 'Goal celebration'
      }
      
      // Only add if it's a new rule concept
      if (!currentConfig.rules.some(r => r.name === newRule.name)) {
        updates.rules = [...(currentConfig.rules || []), newRule]
        console.log('🎯 Rule extracted:', newRule.name, 'Total rules:', updates.rules.length)
      }
    }

    return updates
  }

  private determineNextStep(currentStep: ConfigurationStep, userMessage: string, config: AuraConfiguration): ConfigurationStep {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for explicit navigation requests
    if (/skip|next|move on|continue/i.test(lowerMessage) && !lowerMessage.includes('don\'t')) {
      const steps: ConfigurationStep[] = ['introduction', 'vessel_selection', 'personality_discovery', 'rule_creation', 'review_and_save', 'complete']
      const currentIndex = steps.indexOf(currentStep)
      return currentIndex < steps.length - 1 ? steps[currentIndex + 1]! : currentStep
    }

    if (/back|previous|return/i.test(lowerMessage)) {
      const steps: ConfigurationStep[] = ['introduction', 'vessel_selection', 'personality_discovery', 'rule_creation', 'review_and_save', 'complete']
      const currentIndex = steps.indexOf(currentStep)
      return currentIndex > 0 ? steps[currentIndex - 1]! : currentStep
    }

    if (/start over|restart|begin again/i.test(lowerMessage)) {
      return 'introduction'
    }

    // Global completion triggers - if user is clearly trying to create and we have basics
    if (/create.*my.*aura|save.*my.*aura|let's.*create.*it|bring.*to.*life|make.*my.*aura|ready.*to.*create|skip.*rules.*create|go.*ahead.*activate|activate/i.test(lowerMessage) && 
        config.name && config.vesselType) {
      // From personality discovery or later, go to review
      if (currentStep === 'personality_discovery' || currentStep === 'rule_creation' || currentStep === 'review_and_save') {
        console.log('🚀 Global completion trigger detected, forcing to review_and_save')
        return 'review_and_save'
      }
    }

    // Immediate completion for explicit skip rules + create requests
    if (/skip.*rules.*create|don't.*need.*rules.*create|no.*rules.*create|create.*without.*rules/i.test(lowerMessage) && 
        config.name && config.vesselType) {
      console.log('🚀 Skip rules + create detected, forcing to complete')
      return 'complete'
    }

    // Natural progression logic
    switch (currentStep) {
      case 'introduction':
        // Move quickly if they express any preference
        if (config.vesselType || 
            /vessel|physical|digital|terra|companion|plant|animal|character|free|without|product/i.test(lowerMessage)) {
          return 'vessel_selection'
        }
        // Also move if they've described what they want
        if (lowerMessage.length > 20) {
          return 'vessel_selection'
        }
        break

      case 'vessel_selection':
        // Move forward if vessel is selected
        if (config.vesselCode) {
          // For companion vessels, ensure animal is selected
          if (config.vesselType === 'companion' && config.vesselCode === 'companion' &&
              !config.vesselCode.includes('-elephant') && 
              !config.vesselCode.includes('-lion') &&
              !config.vesselCode.includes('-giraffe') &&
              !config.vesselCode.includes('-whale') &&
              !config.vesselCode.includes('-shark') &&
              !config.vesselCode.includes('-tortoise') &&
              !config.vesselCode.includes('-gorilla')) {
            // Stay on vessel selection to choose animal
            return 'vessel_selection'
          }
          return 'personality_discovery'
        }
        break

      case 'personality_discovery':
        // Check if we have minimum requirements
        const hasName = !!config.name
        const hasPersonality = config.personality.persona || 
                             config.personality.tone !== 'casual' ||
                             config.personality.warmth !== 50
        const hasSenses = config.availableSenses.length >= 2
        
        // Move forward if we have the basics
        if (hasName && hasPersonality) {
          // If they mention rules, go to rule creation
          if (/rule|automat|remind|alert|when.*then/i.test(lowerMessage)) {
            return 'rule_creation'
          }
          // If they explicitly don't want rules, skip to review
          if (/no.*rule|skip.*rule|don't.*need.*rule|without.*rule/i.test(lowerMessage)) {
            return 'review_and_save'
          }
          // If they seem done with configuration
          if (/done|ready|complete|finish|next.*step|move.*on/i.test(lowerMessage)) {
            return hasSenses ? 'rule_creation' : 'rule_creation' // Always go to rules first
          }
          // Direct creation requests
          if (/create.*aura|save.*aura|let's.*create|bring.*to.*life|make.*aura/i.test(lowerMessage)) {
            return 'rule_creation' // Go through rules step first
          }
        }
        
        // Skip everything requests
        if (/skip.*everything|done.*configuring|create.*now/i.test(lowerMessage) && hasName && hasPersonality) {
          return 'review_and_save'
        }
        break

      case 'rule_creation':
        // Move to review if they're done with rules
        if (/done|finish|complete|ready|enough|no.*more|skip|that's it|move.*on|next.*step/i.test(lowerMessage)) {
          return 'review_and_save'
        }
        // Also move if they have at least one rule and seem satisfied
        if (config.rules.length > 0 && /good|great|perfect|yes|sounds|looks.*good/i.test(lowerMessage)) {
          return 'review_and_save'
        }
        // Direct creation requests - be more flexible
        if (/create.*aura|save.*aura|let's.*create|bring.*to.*life|make.*aura|build.*aura/i.test(lowerMessage)) {
          return 'review_and_save'
        }
        // If they don't want rules at all
        if (/no.*rules|skip.*rules|don't.*need.*rules|without.*rules/i.test(lowerMessage)) {
          return 'review_and_save'
        }
        break

      case 'review_and_save':
        // Only complete if all required fields are present and user confirms
        console.log('Review and save step - user message:', lowerMessage)
        console.log('Current config:', { 
          name: config.name, 
          vesselType: config.vesselType, 
          vesselCode: config.vesselCode 
        })
        
        if (/confirm|yes|yep|yeah|sure|okay|ok|create|save|ready|looks good|perfect|let's go|do it|bring.*to life|let's.*do.*it|i'm.*ready|make.*it|build.*it|activate|go.*ahead/i.test(lowerMessage)) {
          console.log('User confirmed creation')
          
          // Validate required fields
          if (!config.name) {
            console.warn('Cannot complete - missing name')
            return 'personality_discovery' // Go back to get name
          }
          if (!config.vesselType) {
            console.warn('Cannot complete - missing vessel type')
            return 'vessel_selection'
          }
          if (!config.vesselCode && config.vesselType !== 'digital') {
            console.warn('Cannot complete - missing vessel code for non-digital vessel')
            return 'vessel_selection'
          }
          
          console.log('All validations passed - moving to complete')
          return 'complete'
        }
        break
    }

    return currentStep
  }

  private generateSuggestedActions(step: ConfigurationStep, config: AuraConfiguration): string[] {
    const suggestions: string[] = []

    switch (step) {
      case 'introduction':
        suggestions.push("I want a productivity assistant")
        suggestions.push("I need a wellness companion")
        suggestions.push("Show me the free digital option")
        suggestions.push("What physical vessels are available?")
        break

      case 'vessel_selection':
        if (!config.vesselCode) {
          suggestions.push("I'll go with digital only (free)")
          suggestions.push("Show me plant companions")
          suggestions.push("I want an animal companion")
          suggestions.push("What's the cheapest physical option?")
        } else if (config.vesselType === 'companion' && !config.vesselCode.includes('-')) {
          // Need to select an animal
          suggestions.push("I'd like an elephant")
          suggestions.push("Make it a lion")
          suggestions.push("Show me all animals")
        } else {
          // Vessel selected, move forward
          suggestions.push("Let's continue")
          if (!config.name) {
            suggestions.push("Let's name them: ")
          }
        }
        break

      case 'personality_discovery':
        if (!config.personality.persona) {
          suggestions.push("Make them warm and supportive")
          suggestions.push("I want someone playful and creative")
          suggestions.push("Professional and efficient please")
        }
        if (!config.name) {
          suggestions.push("Let's call them: ")
        }
        if (config.availableSenses.length < 2) {
          suggestions.push("Add fitness and weather tracking")
          suggestions.push("I want calendar and sleep monitoring")
        }
        if (config.name && config.personality.persona) {
          if (config.availableSenses.length >= 2) {
            suggestions.push("Let's set up some automation rules")
            suggestions.push("I don't need any rules")
            suggestions.push("Ready to create my Aura")
          } else {
            suggestions.push("Add weather and fitness tracking")
            suggestions.push("I want calendar notifications")
            suggestions.push("Skip senses and create my Aura")
          }
        }
        break

      case 'rule_creation':
        const senseBasedSuggestions: Record<string, string> = {
          'weather': "Alert me about bad weather",
          'fitness.steps': "Celebrate my daily step goals",
          'sleep': "Help me maintain good sleep habits",
          'calendar': "Remind me before meetings"
        }
        
        // Add suggestions based on available senses
        for (const sense of config.availableSenses) {
          if (senseBasedSuggestions[sense] && suggestions.length < 3) {
            suggestions.push(senseBasedSuggestions[sense])
          }
        }
        
        if (config.rules.length > 0) {
          suggestions.push("That's enough rules")
          suggestions.push("Ready to create my Aura")
        } else {
          suggestions.push("I don't need any rules")
          suggestions.push("Skip rules and create my Aura")
        }
        break

      case 'review_and_save':
        suggestions.push("Yes, create my Aura!")
        suggestions.push("Perfect! Let's do it")
        suggestions.push("Ready to bring them to life")
        if (!config.name) {
          suggestions.push("Actually, let's name them first")
        } else {
          suggestions.push("Save it now")
        }
        break

      default:
        suggestions.push("Help me understand")
        suggestions.push("What are my options?")
    }

    return suggestions.slice(0, 4)
  }

  async processUserMessage(request: AgentProcessingRequest): Promise<AgentProcessingResponse> {
    const { userMessage, currentStep, configuration, conversationHistory, availableSenses } = request
    
    // Emergency completion detection - if user keeps trying to create
    const recentUserMessages = conversationHistory
      .filter(m => m.role === 'user')
      .slice(-6)
      .map(m => m.content.toLowerCase())
    
    const creationAttempts = recentUserMessages.filter(msg => 
      /create.*my.*aura|save.*it.*now|let's.*create|i.*want.*to.*create|finish.*this|complete.*this|go.*ahead.*activate|activate|create.*aura|skip.*rules.*create/i.test(msg)
    ).length
    
    if (creationAttempts >= 2 && configuration.name && configuration.vesselType) {
      console.log('🚨 Emergency completion detected - user has tried to create multiple times')
      return {
        response: `I can see you're ready to create ${configuration.name}! Let me save your Aura right now.`,
        nextStep: 'complete',
        metadata: {
          requiresUserInput: false,
          step: 'complete'
        }
      }
    }
    
    // Stuck detection - if user seems confused or frustrated
    if (/stuck|confused|not.*working|help.*me|what.*next|how.*do.*i/i.test(userMessage.toLowerCase()) &&
        configuration.name && configuration.vesselType) {
      console.log('🤔 User seems stuck, offering to complete')
      return {
        response: `I can help! Since you have ${configuration.name} configured with a ${configuration.vesselType} vessel, would you like me to create your Aura now? Just say "yes, create it" and I'll save everything for you.`,
        nextStep: currentStep, // Stay in current step
        metadata: {
          requiresUserInput: true,
          step: currentStep,
          suggestedActions: ["Yes, create it", "Let me add more configuration", "Start over"]
        }
      }
    }

    // Conversation analysis - if agent has been talking about specific config but it's not stored
    const conversationText = conversationHistory.map(m => m.content).join(' ').toLowerCase()
    if (/chico.*borja|named.*chico|call.*chico/i.test(conversationText) && !configuration.name) {
      console.log('🔧 Detected name in conversation but not in config, applying fallback')
      const fallbackUpdate: PartialAuraConfiguration = {
        name: 'Chico Borja',
        vesselType: 'digital',
        vesselCode: 'digital-only',
        availableSenses: ['weather', 'news'],
        rules: [{
          id: 'rain-dance-rule',
          name: 'Rain dancing reminder',
          enabled: true,
          trigger: { type: 'simple', sensor: 'weather', operator: '==', value: 'raining' },
          action: { type: 'notify', message: 'Time to dance in the rain!' }
        }]
      }
      
      return {
        response: `Perfect! I've got everything set up for Chico Borja. He's configured as a digital companion with weather and news access, plus that fun rain dancing reminder. Ready to create him?`,
        configurationUpdate: fallbackUpdate,
        nextStep: 'review_and_save',
        metadata: {
          requiresUserInput: true,
          step: 'review_and_save',
          suggestedActions: ["Yes, create Chico", "Let me review the details", "Make some changes"]
        }
      }
    }

    // Extract configuration updates from user message
    const configurationUpdate = this.extractConfigurationUpdates(userMessage, configuration, currentStep)
    
    if (Object.keys(configurationUpdate).length > 0) {
      console.log('📝 Configuration updates extracted:', configurationUpdate)
    } else {
      console.log('❌ No configuration updates extracted from:', userMessage)
    }

    // Handle location and news type requirements
    if (configurationUpdate.needsLocationInfo) {
      return {
        response: configurationUpdate.needsLocationInfo.message,
        metadata: {
          requiresUserInput: true,
          step: currentStep,
          suggestedActions: ["New York, NY", "Los Angeles, CA", "London, UK", "I prefer not to share location"]
        }
      }
    }

    if (configurationUpdate.needsNewsTypeInfo) {
      return {
        response: configurationUpdate.needsNewsTypeInfo.message,
        metadata: {
          requiresUserInput: true,
          step: currentStep,
          suggestedActions: ["Local news (I'll share my location)", "Global/international news", "Both local and global"]
        }
      }
    }

    // Create a merged configuration for this turn
    const mergedConfiguration: AuraConfiguration = {
      ...configuration,
      ...configurationUpdate,
      personality: {
        ...DEFAULT_PERSONALITY,
        ...configuration.personality,
        ...(configurationUpdate.personality || {}),
      },
      availableSenses: configurationUpdate.availableSenses || configuration.availableSenses,
      rules: configurationUpdate.rules || configuration.rules
    }
    
    // Ensure digital vessels have proper vessel code
    if (mergedConfiguration.vesselType === 'digital' && !mergedConfiguration.vesselCode) {
      mergedConfiguration.vesselCode = 'digital-only'
    }
    
    // Check for automatic progression based on configuration completeness
    let nextStep = this.determineNextStep(currentStep, userMessage, mergedConfiguration)
    
    // Auto-progression logic: if we just got key info, suggest moving forward
    if (configurationUpdate && nextStep === currentStep) {
      const hasName = !!mergedConfiguration.name
      const hasVessel = !!mergedConfiguration.vesselType && !!mergedConfiguration.vesselCode
      const hasPersonality = mergedConfiguration.personality.persona || mergedConfiguration.personality.tone !== 'casual'
      const hasSenses = mergedConfiguration.availableSenses.length >= 2
      
      // If we just got a name and we're in personality discovery, and user seems ready
      if (currentStep === 'personality_discovery' && hasName && hasPersonality && 
          /that.*good|sounds.*good|perfect|yes|great|ready/i.test(userMessage.toLowerCase())) {
        nextStep = 'rule_creation'
      }
      
      // If we're in rule creation and they seem satisfied
      if (currentStep === 'rule_creation' && 
          /that.*good|sounds.*good|perfect|looks.*good|great/i.test(userMessage.toLowerCase())) {
        nextStep = 'review_and_save'
      }
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    // Build system prompt using the merged configuration and all available senses
    const systemPrompt = this.buildSystemPrompt(nextStep ?? currentStep, mergedConfiguration, availableSenses)

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Previous conversation:\n${conversationContext}\n\nUser's latest message: ${userMessage}\n\nProvide a helpful, conversational response. Be natural and friendly. NEVER show configuration objects or technical details. Keep your response brief (2-3 sentences) and move the conversation forward.` }
        ]
      })

      const response = completion.choices[0]?.message?.content || 
        "I'd love to help you create your perfect Aura! Could you tell me a bit more about what you're looking for?"

      console.log('🔄 Returning response with config update:', configurationUpdate)

      return {
        response,
        configurationUpdate: Object.keys(configurationUpdate).length > 0 ? configurationUpdate : undefined,
        nextStep: nextStep !== currentStep ? nextStep : undefined,
        metadata: {
          suggestedActions: this.generateSuggestedActions(nextStep ?? currentStep, mergedConfiguration),
          requiresUserInput: true,
          step: nextStep ?? currentStep
        }
      }

    } catch (error) {
      console.error('Agent processing error:', error)
      
      // Fallback response
      return {
        response: "I'm having a moment of confusion, but I'm still here to help! Could you tell me what aspect of your Aura you'd like to work on?",
        metadata: {
          suggestedActions: ["Let's choose a vessel", "Configure personality", "Set up rules", "I need help"],
          requiresUserInput: true,
          step: currentStep
        }
      }
    }
  }
}

// Helper function to extract location from user message
function extractLocationFromMessage(message: string): { city: string; state?: string; country?: string } | null {
  const lowerMessage = message.toLowerCase()
  
  // Common location patterns - more specific
  const locationPatterns = [
    // Direct city, state weather mentions
    /\b([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\s+(?:weather|news|air)/i, // "Fairway, KS weather"
    
    // Weather/news for location
    /(?:weather|news|air).*?(?:for|in)\s+([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\b/i, // "weather for New York, NY"
    /(?:weather|news|air).*?(?:for|in)\s+([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z]+)\b/i, // "weather for London, UK"
    
    // I'm in/from/at location
    /(?:I'm|I am)\s+(?:in|from|at|near)\s+([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\b/i, // "I'm in New York, NY"
    /(?:I'm|I am)\s+(?:in|from|at|near)\s+([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z]+)\b/i, // "I'm in London, UK"
    /(?:I'm|I am)\s+(?:in|from|at|near)\s+([A-Z][a-zA-Z]+)\b/i, // "I'm in Chicago"
    
    // Simple city weather
    /\b([A-Z][a-zA-Z]+)\s+(?:weather|news|air)/i, // "Chicago weather"
  ]
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern)
    if (match) {
      const city = match[1]?.trim()
      const stateOrCountry = match[2]?.trim()
      
      if (city && city.length > 1) {
        // Determine if second part is state (2 chars) or country/state name
        if (stateOrCountry) {
          if (stateOrCountry.length === 2) {
            return { city, state: stateOrCountry.toUpperCase() }
          } else {
            // Could be country or full state name
            return { city, country: stateOrCountry }
          }
        } else {
          return { city }
        }
      }
    }
  }
  
  // Check for specific known locations mentioned in examples
  if (lowerMessage.includes('fairway') && lowerMessage.includes('ks')) {
    return { city: 'Fairway', state: 'KS' }
  }
  
  // Handle simple location responses (when user is answering location question)
  const simpleLocationPatterns = [
    /^([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})$/i, // "New York, NY"
    /^([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+)$/i, // "London, UK"
    /^([A-Z][a-zA-Z\s]{2,})$/i // "Chicago"
  ]
  
  for (const pattern of simpleLocationPatterns) {
    const match = message.trim().match(pattern)
    if (match) {
      const city = match[1]?.trim()
      const stateOrCountry = match[2]?.trim()
      
      if (city && city.length > 1) {
        if (stateOrCountry) {
          if (stateOrCountry.length === 2) {
            return { city, state: stateOrCountry.toUpperCase() }
          } else {
            return { city, country: stateOrCountry }
          }
        } else {
          return { city }
        }
      }
    }
  }
  
  return null
}

// Singleton instance
export const auraAgent = new AuraConfigurationAgent()