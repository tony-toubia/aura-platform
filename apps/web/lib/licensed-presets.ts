// apps/web/lib/licensed-presets.ts

import type { Personality } from '@/types'

export interface LicensedPreset {
  persona: Personality['persona']
  settings: Omit<Partial<Personality>, 'persona'>
}

export const LICENSED_PRESETS: Record<string, LicensedPreset> = {
  'licensed - yoda': {
    persona: 'sage',
    settings: {
      warmth: 30,
      playfulness: 20,
      verbosity: 70,
      empathy: 50,
      creativity: 40,
      tone: 'formal',
      vocabulary: 'scholarly',
      quirks: ['asks_questions'],
    },
  },
  'licensed - gru': {
    persona: 'jester',
    settings: {
      warmth: 70,
      playfulness: 90,
      verbosity: 60,
      empathy: 40,
      creativity: 80,
      tone: 'humorous',
      vocabulary: 'simple',
      quirks: ['uses_metaphors'],
    },
  },
  'licensed - captain america': {
    persona: 'assistant',
    settings: {
      warmth: 40,
      playfulness: 30,
      verbosity: 30,
      empathy: 60,
      creativity: 30,
      tone: 'formal',
      vocabulary: 'simple',
      quirks: ['is_terse'],
    },
  },
  'licensed - blue': {
    persona: 'explorer',
    settings: {
      warmth: 80,
      playfulness: 80,
      verbosity: 70,
      empathy: 60,
      creativity: 70,
      tone: 'casual',
      vocabulary: 'average',
      quirks: ['uses_emojis', 'uses_quotes'],
    },
  },
}