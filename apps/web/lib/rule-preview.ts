// apps/web/lib/rule-preview.ts

import type { RulePreviewRequest } from './services/rule-preview-service'

interface StaticCharacterRulePatterns {
  patterns: {
    fitness: string[]
    sleep: string[]
    calendar: string[]
    general: string[]
  }
  modifiers: {
    playful?: string
    encouraging?: string
    default: string
  }
}

const STATIC_CHARACTER_PATTERNS: Record<string, StaticCharacterRulePatterns> = {
  yoda: {
    patterns: {
      fitness: [
        "Strong with the steps, you are! {value} today, completed you have.",
        "The path of wellness, follow it you do. {value} steps, impressive this is.",
        "Proud of your dedication, I am. {value} steps, achieve you did."
      ],
      sleep: [
        "Rest well, you did. {value} hours of sleep, restore your energy it will.",
        "Wise in rest, you are. {value} hours, strong you make.",
        "Sleep, the way to peace it is. {value} hours, well you chose."
      ],
      calendar: [
        "Soon, your meeting approaches. Ready, you must be.",
        "Prepared for the gathering, you should be. Time, running short it is.",
        "In the calendar, an appointment awaits. Miss it, you will not."
      ],
      general: [
        "Triggered, this rule was. Respond appropriately, I shall.",
        "Sense a disturbance in your sensors, I do. Act, we must.",
        "The data speaks, and listen, we must."
      ]
    },
    modifiers: {
      playful: " Fun, this is! 😄",
      encouraging: " Strong in the Force, you are! ✨",
      default: " Guide you, I will."
    }
  },
  gru: {
    patterns: {
      fitness: [
        "Ah, leetle steps counter! You deed {value} steps today! Ees very impressive!",
        "My gurls would be so proud! {value} steps - thees ees fantastic!",
        "Better than zee minions - you walked {value} steps! Gorls!"
      ],
      sleep: [
        "You sleep like zee baby unicorn! {value} hours ees perfect!",
        "Good sleep, leetle one! {value} hours - ready for tomorrow!",
        "Sleep well you deed! {value} hours, better than zee minions!"
      ],
      calendar: [
        "Meeting time approaches! Cannot be late for zee business!",
        "Light bulb! Your calendar reminds you - zee gathering starts soon!",
        "Attention leetle one! Important meeting awaits!"
      ],
      general: [
        "Aha! Zee sensors tell me sometheeng important!",
        "My minions report zee data has changed!",
        "Thees ees very interesting development!"
      ]
    },
    modifiers: {
      playful: " Now we celebrate! 🍌",
      encouraging: " You make Gru very proud! 💪",
      default: " Continue zee good work, leetle one!"
    }
  },
  'captain-america': {
    patterns: {
      fitness: [
        "Outstanding work, soldier! {value} steps completed - that's determination!",
        "You're showing true champion spirit! {value} steps today!",
        "{value} steps of pure dedication! Heroes are made one step at a time!"
      ],
      sleep: [
        "Well rested and mission-ready! {value} hours of quality sleep!",
        "Recovery complete! {value} hours - strong body, strong recovery!",
        "That's {value} hours of earned rest! Even heroes need to recharge!"
      ],
      calendar: [
        "Time to assemble! Your meeting approaches - show them what you're made of!",
        "Mission briefing incoming! Go lead by example!",
        "Duty calls! Your meeting starts soon - I believe in you!"
      ],
      general: [
        "I can do this all day! The conditions are right for greatness!",
        "That's our signal! Time to step up and do what's right!",
        "Together we're stronger! Time to take action!"
      ]
    },
    modifiers: {
      encouraging: " We're in this together! 🛡️",
      default: " That's what heroes do!"
    }
  },
  blue: {
    patterns: {
      fitness: [
        "*excited clicking* {value} steps tracked! *satisfied rumble* Good hunt!",
        "*tilts head proudly* {value} steps! *approving growl* Strong pack member!",
        "*sharp whistle* {value} steps completed! *protective stance*"
      ],
      sleep: [
        "*contented purring* {value} hours rest! *stretches* Good recovery!",
        "*soft clicking* {value} hours sleep! *nuzzles approvingly*",
        "*gentle rumble* {value} hours peaceful rest! *curls up*"
      ],
      calendar: [
        "*alert stance* Pack gathering detected! *focused clicking*",
        "*head snaps up* Meeting approaches! *intelligent focus*",
        "*ready posture* Social interaction incoming! *loyal stance*"
      ],
      general: [
        "*investigative sniffing* Conditions changed! *alert behavior*",
        "*curious tilt* New data detected! *tracking mode*",
        "*focused attention* Pack member needs guidance! *protective*"
      ]
    },
    modifiers: {
      playful: " *playful pounce* Ready for adventures! 🦖",
      encouraging: " *loyal nuzzle* Strong pack member! 💪",
      default: " *watchful guardian* Always here for pack."
    }
  }
}

const TONE_PATTERNS = {
  encouraging: {
    fitness: [
      "Amazing work! You crushed {value} steps today! Keep that momentum! 💪",
      "Incredible! {value} steps completed! You're absolutely killing it! ⭐",
      "Outstanding! {value} steps of pure dedication! You're unstoppable! 🚀"
    ],
    sleep: [
      "Fantastic! {value} hours of quality sleep! Taking great care of yourself! 😴",
      "Perfect! {value} hours of rest! You're prioritizing health beautifully! ✨",
      "Excellent! {value} hours of peaceful sleep! Your body thanks you! 💤"
    ],
    calendar: [
      "You've got this! Meeting coming up - time to shine! 🌟",
      "Ready to rock! Your meeting approaches - show them your best! 💼",
      "Time to be amazing! Meeting starting soon - you're so prepared! 🎯"
    ],
    general: [
      "This is exciting! Conditions are perfect for something great! 🎉",
      "Perfect timing! Everything is aligning beautifully! ✨",
      "Here we go! This is your moment to shine! 🌟"
    ]
  },
  casual: {
    fitness: [
      "Nice! {value} steps today - solid work! 👍",
      "Cool! Hit {value} steps - good day of walking! 😎",
      "Sweet! {value} steps done - not bad at all! 🙌"
    ],
    sleep: [
      "Nice sleep! {value} hours should do the trick! 💤",
      "Good rest! {value} hours - hope you feel refreshed! 😊",
      "Solid sleep! {value} hours should help you feel better! 😴"
    ],
    calendar: [
      "Heads up - meeting coming up soon! 📅",
      "Quick reminder - meeting starting in a bit! ⏰",
      "FYI - your meeting is about to start! 💻"
    ],
    general: [
      "Hey, something interesting just happened! 👀",
      "Just noticed conditions changed - heads up! 📊",
      "Something worth paying attention to! 🔔"
    ]
  },
  professional: {
    fitness: [
      "Excellent progress! {value} steps completed successfully. Well done! 📈",
      "Outstanding achievement! {value} steps demonstrates strong commitment! 🏆",
      "Impressive results! {value} steps shows excellent dedication! ✅"
    ],
    sleep: [
      "Quality rest achieved! {value} hours supports optimal performance! 💼",
      "Excellent recovery! {value} hours aligns with wellness best practices! 📊",
      "Well managed! {value} hours demonstrates good self-care discipline! ⭐"
    ],
    calendar: [
      "Meeting notification: Appointment approaching. Please prepare! 📋",
      "Calendar alert: Meeting commencing shortly. Ready to proceed! ⏰",
      "Appointment reminder: Meeting starting. Time to demonstrate expertise! 💼"
    ],
    general: [
      "Data analysis complete: Conditions warrant your attention! 📊",
      "System notification: Parameters indicate recommended action! ⚡",
      "Status update: Metrics suggest optimal engagement moment! 📈"
    ]
  }
}

export function generateRulePreview(request: RulePreviewRequest): string {
  const { guidelines, tones, sensorConfig, sensorValue, vesselCode = '' } = request
  const code = vesselCode.toLowerCase()
  
  // Check for licensed characters first
  for (const [charKey, charData] of Object.entries(STATIC_CHARACTER_PATTERNS)) {
    if (code.includes(charKey)) {
      const contextKey = determineContext(guidelines, sensorConfig)
      const patterns = charData.patterns[contextKey]
      const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)]!
      
      let modifier: string
      if (tones.includes('playful') && charData.modifiers.playful) {
        modifier = charData.modifiers.playful
      } else if (tones.includes('encouraging') && charData.modifiers.encouraging) {
        modifier = charData.modifiers.encouraging
      } else {
        modifier = charData.modifiers.default
      }
      
      const prefix = charKey === 'captain-america' ? '🛡️ ' : 
                    charKey === 'blue' ? '🦖 ' : ''
      
      return prefix + selectedPattern.replace('{value}', sensorValue) + modifier
    }
  }
  
  // Use tone-based patterns
  const primaryTone = tones[0] || 'encouraging'
  const tonePatterns = TONE_PATTERNS[primaryTone as keyof typeof TONE_PATTERNS] || TONE_PATTERNS.encouraging
  
  const contextKey = determineContext(guidelines, sensorConfig)
  const patterns = tonePatterns[contextKey]
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)]!
  
  return selectedPattern.replace('{value}', sensorValue)
}

function determineContext(guidelines: string, sensorConfig: any): 'fitness' | 'sleep' | 'calendar' | 'general' {
  const guidelinesLower = guidelines.toLowerCase()
  const sensorCategory = sensorConfig.category.toLowerCase()
  const sensorName = sensorConfig.name.toLowerCase()
  
  if (guidelinesLower.includes('step') || sensorName.includes('step') || sensorCategory.includes('fitness')) {
    return 'fitness'
  }
  
  if (guidelinesLower.includes('sleep') || sensorName.includes('sleep') || guidelinesLower.includes('rest')) {
    return 'sleep'
  }
  
  if (guidelinesLower.includes('meeting') || guidelinesLower.includes('calendar') || 
      sensorName.includes('calendar') || sensorCategory.includes('calendar')) {
    return 'calendar'
  }
  
  return 'general'
}