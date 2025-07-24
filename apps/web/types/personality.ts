// apps/web/types/personality.ts

import type { LucideIcon } from 'lucide-react'

export interface PersonalityTrait {
  id: string
  name: string
  low: string
  high: string
  icon: LucideIcon
  color: string
  bgColor: string
  description: string
}

export interface PersonaPreset {
  id: string
  name: string
  icon: LucideIcon
  description: string
  emoji: string
  color: string
  bgColor: string
  settings: {
    warmth: number
    playfulness: number
    verbosity?: number
    empathy: number
    creativity: number
    tone: 'casual' | 'formal' | 'poetic' | 'humorous'
    vocabulary: 'simple' | 'average' | 'scholarly'
  }
}

export interface ToneOption {
  id: string
  name: string
  description: string
  emoji: string
  color: string
}

export interface VocabularyOption {
  id: string
  name: string
  description: string
  emoji: string
  color: string
}

export interface QuirkOption {
  id: string
  name: string
  icon: LucideIcon
  emoji: string
  description: string
}

export interface TraitIntensity {
  label: string
  color: string
}

export interface PersonalityMatrixProps {
  personality: any // Will use Personality type from main types
  vesselCode?: string
  onChange: (update: Partial<any>) => void
}