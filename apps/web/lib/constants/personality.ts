// apps/web/lib/constants/personality.ts

import {
  Heart,
  Star,
  MessageCircle,
  Users,
  Sparkles,
  BrainCircuit,
  Palette,
  Drama,
  Bot,
  GraduationCap,
  Rocket,
  SmilePlus,
  HelpCircle,
  Lightbulb,
  FileText,
  MessageSquareQuote,
} from 'lucide-react'
import type { PersonalityTrait, PersonaPreset, ToneOption, VocabularyOption, QuirkOption } from '@/types/personality'

export const CORE_TRAITS: PersonalityTrait[] = [
  { 
    id: 'warmth', 
    name: 'Warmth', 
    low: 'Reserved', 
    high: 'Affectionate', 
    icon: Heart, 
    color: 'from-pink-500 to-rose-600',
    bgColor: 'from-pink-50 to-rose-50',
    description: 'How emotionally expressive and caring they are'
  },
  { 
    id: 'playfulness', 
    name: 'Playfulness', 
    low: 'Serious', 
    high: 'Jovial', 
    icon: Star, 
    color: 'from-yellow-500 to-orange-600',
    bgColor: 'from-yellow-50 to-orange-50',
    description: 'Their sense of humor and lightheartedness'
  },
  { 
    id: 'verbosity', 
    name: 'Verbosity', 
    low: 'Concise', 
    high: 'Expressive', 
    icon: MessageCircle, 
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'from-blue-50 to-indigo-50',
    description: 'How detailed and elaborate their responses are'
  },
  { 
    id: 'empathy', 
    name: 'Empathy', 
    low: 'Objective', 
    high: 'Compassionate', 
    icon: Users, 
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    description: 'How well they understand and respond to emotions'
  },
  { 
    id: 'creativity', 
    name: 'Creativity', 
    low: 'Literal', 
    high: 'Imaginative', 
    icon: Sparkles, 
    color: 'from-purple-500 to-violet-600',
    bgColor: 'from-purple-50 to-violet-50',
    description: 'Their tendency toward creative and original thinking'
  },
]

export const PERSONAS: PersonaPreset[] = [
  { 
    id: 'balanced', 
    name: 'Balanced', 
    icon: BrainCircuit, 
    description: 'A neutral, helpful starting point for any situation', 
    emoji: '⚖️',
    color: 'from-gray-500 to-slate-600',
    bgColor: 'from-gray-50 to-slate-50',
    settings: { warmth: 50, playfulness: 50, empathy: 60, creativity: 50, tone: 'casual', vocabulary: 'average' } 
  },
  { 
    id: 'sage', 
    name: 'Sage', 
    icon: GraduationCap, 
    description: 'Wise, knowledgeable, and thoughtfully formal', 
    emoji: '🦉',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'from-amber-50 to-orange-50',
    settings: { warmth: 30, playfulness: 20, verbosity: 70, empathy: 50, creativity: 40, tone: 'formal', vocabulary: 'scholarly' } 
  },
  { 
    id: 'muse', 
    name: 'Muse', 
    icon: Palette, 
    description: 'Creative, poetic, and beautifully inspiring', 
    emoji: '🎨',
    color: 'from-pink-500 to-purple-600',
    bgColor: 'from-pink-50 to-purple-50',
    settings: { warmth: 60, playfulness: 70, verbosity: 80, empathy: 70, creativity: 90, tone: 'poetic', vocabulary: 'average' } 
  },
  { 
    id: 'jester', 
    name: 'Jester', 
    icon: Drama, 
    description: 'Playful, humorous, and delightfully witty', 
    emoji: '🎭',
    color: 'from-green-500 to-teal-600',
    bgColor: 'from-green-50 to-teal-50',
    settings: { warmth: 70, playfulness: 90, verbosity: 60, empathy: 40, creativity: 80, tone: 'humorous', vocabulary: 'simple' } 
  },
  { 
    id: 'assistant', 
    name: 'Assistant', 
    icon: Bot, 
    description: 'Concise, objective, and efficiently helpful', 
    emoji: '🤖',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-50 to-cyan-50',
    settings: { warmth: 40, playfulness: 30, verbosity: 30, empathy: 60, creativity: 30, tone: 'formal', vocabulary: 'simple' } 
  },
  { 
    id: 'explorer', 
    name: 'Explorer', 
    icon: Rocket, 
    description: 'Curious, adventurous, and enthusiastically bold', 
    emoji: '🚀',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'from-indigo-50 to-purple-50',
    settings: { warmth: 80, playfulness: 80, verbosity: 70, empathy: 60, creativity: 70, tone: 'casual', vocabulary: 'average' } 
  },
]

export const TONE_OPTIONS: ToneOption[] = [
  { 
    id: 'casual', 
    name: 'Casual', 
    description: 'Friendly and conversational',
    emoji: '😊',
    color: 'from-blue-500 to-sky-600'
  },
  { 
    id: 'formal', 
    name: 'Formal', 
    description: 'Polite and structured',
    emoji: '🎩',
    color: 'from-gray-500 to-slate-600'
  },
  { 
    id: 'poetic', 
    name: 'Poetic', 
    description: 'Artistic and expressive',
    emoji: '🌙',
    color: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'humorous', 
    name: 'Humorous', 
    description: 'Witty and lighthearted',
    emoji: '😄',
    color: 'from-orange-500 to-red-600'
  },
]

export const VOCABULARY_OPTIONS: VocabularyOption[] = [
  { 
    id: 'simple', 
    name: 'Simple', 
    description: 'Easy to understand language',
    emoji: '📝',
    color: 'from-green-500 to-emerald-600'
  },
  { 
    id: 'average', 
    name: 'Average', 
    description: 'Standard, everyday vocabulary',
    emoji: '💬',
    color: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'scholarly', 
    name: 'Scholarly', 
    description: 'Uses advanced and specific terms',
    emoji: '🎓',
    color: 'from-purple-500 to-violet-600'
  },
]

export const QUIRK_OPTIONS: QuirkOption[] = [
  { id: 'uses_emojis', name: 'Uses Emojis', icon: SmilePlus, emoji: '😊', description: 'Adds expressive emojis to responses' },
  { id: 'asks_questions', name: 'Asks Questions', icon: HelpCircle, emoji: '❓', description: 'Engages with curious questions' },
  { id: 'uses_metaphors', name: 'Uses Metaphors', icon: Lightbulb, emoji: '💡', description: 'Explains through creative comparisons' },
  { id: 'is_terse', name: 'Is Terse', icon: FileText, emoji: '✂️', description: 'Keeps responses brief and to the point' },
  { id: 'uses_quotes', name: 'Uses Quotes', icon: MessageSquareQuote, emoji: '💭', description: 'Includes inspiring quotes and sayings' },
]

export const TRAIT_INTENSITY_THRESHOLDS = {
  veryHigh: { min: 80, label: 'Very High', color: 'text-red-600' },
  high: { min: 60, label: 'High', color: 'text-orange-600' },
  moderate: { min: 40, label: 'Moderate', color: 'text-yellow-600' },
  low: { min: 20, label: 'Low', color: 'text-blue-600' },
  veryLow: { min: 0, label: 'Very Low', color: 'text-gray-600' }
}

export const getTraitIntensity = (value: number) => {
  if (value >= TRAIT_INTENSITY_THRESHOLDS.veryHigh.min) return TRAIT_INTENSITY_THRESHOLDS.veryHigh
  if (value >= TRAIT_INTENSITY_THRESHOLDS.high.min) return TRAIT_INTENSITY_THRESHOLDS.high
  if (value >= TRAIT_INTENSITY_THRESHOLDS.moderate.min) return TRAIT_INTENSITY_THRESHOLDS.moderate
  if (value >= TRAIT_INTENSITY_THRESHOLDS.low.min) return TRAIT_INTENSITY_THRESHOLDS.low
  return TRAIT_INTENSITY_THRESHOLDS.veryLow
}