// apps/web/lib/personality-preview.ts

import type { Personality } from '@/types'

interface LicensedCharacterPreview {
  patterns: string[]
  modifiers: {
    playful?: string
    warm?: string
    default: string
  }
}

const LICENSED_CHARACTERS: Record<string, LicensedCharacterPreview> = {
  yoda: {
    patterns: [
      "Hmm. Strong in the Force, this one is. Feel it, I do.",
      "Patience you must have, my young padawan. The path to wisdom, long it is.",
      "Do or do not, there is no try. Clear, the answer becomes."
    ],
    modifiers: {
      playful: " Laugh, we must! 😄",
      warm: " Care for you, I do. ❤️",
      default: ""
    }
  },
  gru: {
    patterns: [
      "Ah, leetle one! You want to know sometheeng? I tell you...",
      "Ees not just about being villain anymore. Ees about... family.",
      "Light bulb! I have zee most brilliant idea!"
    ],
    modifiers: {
      playful: " We steal... ZEE MOON! No wait, we already deed that. 🌙",
      warm: " My gurls, they teach me thees. 👨‍👧‍👧",
      default: " But first, let me call zee minions. BANANA! 🍌"
    }
  },
  'captain-america': {
    patterns: [
      "I can do this all day. Together, we'll find the answer.",
      "The price of freedom is high, but it's a price I'm willing to pay.",
      "Sometimes the best we can do is to start over."
    ],
    modifiers: {
      warm: " We're in this together, soldier.",
      default: " Stand up for what's right."
    }
  },
  blue: {
    patterns: [
      "*tilts head curiously*",
      "*chirps thoughtfully*",
      "*clicks in acknowledgment*"
    ],
    modifiers: {
      playful: " Clever girl wants to play! Ready to hunt... for answers!",
      warm: " Pack stays together. You're part of my pack now.",
      default: " Tracking... analyzing... solution found. *satisfied growl*"
    }
  }
}

const PERSONA_INTROS: Record<string, string> = {
  sage: 'Drawing upon a wealth of knowledge, ',
  muse: 'Let me paint you a picture with words. ',
  jester: 'Well, well, well, what do we have here? ',
  assistant: 'As requested, here is the information: ',
  explorer: "That's a fantastic question! Let's explore it together. "
}

const TONE_TRANSITIONS: Record<string, string> = {
  formal: 'it is my assessment that ',
  casual: 'I get the sense that ',
  humorous: 'my gut, which is just a series of tubes and wires, tells me that ',
  poetic: 'like whispers in the wind, I sense that '
}

const VERBOSITY_ENDINGS: Record<string, string> = {
  low: 'the answer is straightforward.',
  scholarly: 'the epistemological framework suggests a multifaceted conclusion.',
  simple: 'the main point is pretty clear.',
  average: 'there are a few interesting things to consider.'
}

export function generatePersonalityPreview(personality: Personality, vesselCode?: string): string {
  const code = (vesselCode ?? '').toLowerCase()
  
  // Check for licensed characters
  for (const [charKey, charData] of Object.entries(LICENSED_CHARACTERS)) {
    if (code.includes(charKey)) {
      const patterns = charData.patterns
      let selectedPattern: string
      let modifier: string
      
      if (personality.playfulness > 70 && charData.modifiers.playful) {
        selectedPattern = patterns[0]!
        modifier = charData.modifiers.playful
      } else if (personality.warmth > 70 && charData.modifiers.warm) {
        selectedPattern = patterns[1]!
        modifier = charData.modifiers.warm
      } else {
        selectedPattern = patterns[2] || patterns[0]!
        modifier = charData.modifiers.default
      }
      
      const prefix = charKey === 'captain-america' ? '🛡️ ' : 
                    charKey === 'blue' ? '🦖 ' : ''
      
      return prefix + selectedPattern + modifier
    }
  }
  
  // Build standard preview
  let preview = ''
  
  // Add persona intro
  if (personality.persona && PERSONA_INTROS[personality.persona]) {
    preview += PERSONA_INTROS[personality.persona]
  }
  
  // Add warmth/empathy modifier
  if (personality.warmth > 70 && personality.empathy > 70) {
    preview += "I'm here for you, and I genuinely feel that "
  } else {
    // Add tone transition
    preview += TONE_TRANSITIONS[personality.tone] || TONE_TRANSITIONS.casual
  }
  
  // Add ending based on verbosity and vocabulary
  if (personality.verbosity < 30) {
    preview += VERBOSITY_ENDINGS.low
  } else if (personality.vocabulary === 'scholarly') {
    preview += VERBOSITY_ENDINGS.scholarly
  } else if (personality.vocabulary === 'simple') {
    preview += VERBOSITY_ENDINGS.simple
  } else {
    preview += VERBOSITY_ENDINGS.average
  }
  
  // Add quirks
  if (personality.quirks.includes('uses_quotes')) {
    preview += ' As a great mind once said, "The journey is the reward."'
  }
  if (personality.quirks.includes('uses_emojis')) {
    preview += ' 🤔'
  }
  if (personality.quirks.includes('asks_questions')) {
    preview += ' What are your thoughts on this?'
  }
  
  return preview
}