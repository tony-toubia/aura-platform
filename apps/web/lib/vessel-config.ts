// apps/web/lib/vessel-config.ts

import type { VesselTypeId } from './constants'

export interface VesselTypeConfig {
  id: VesselTypeId
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  example?: string
}

export const VESSEL_TYPE_CONFIG: Record<VesselTypeId, VesselTypeConfig> = {
  terra: {
    id: 'terra',
    name: 'Terra Spirit',
    description: 'Plant & garden companions that share their growth journey',
    icon: '🌱',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200 hover:border-green-400',
    example: '"I love this morning sunshine! My leaves are so happy! ☀️"',
  },
  companion: {
    id: 'companion',
    name: 'Companion Spirit',
    description: 'Wildlife trackers that experience adventures in the wild',
    icon: '🦋',
    color: 'from-blue-500 to-sky-600',
    bgColor: 'from-blue-50 to-sky-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    example: '"The migration is starting! I can feel the change in the air! 🌬️"',
  },
  digital: {
    id: 'digital',
    name: 'Digital Being',
    description: 'Pure consciousness exploring the world through data streams',
    icon: '✨',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    example: '"I\'ve been reading about space exploration! Want to chat about it? 🚀"',
  },
  memory: {
    id: 'memory',
    name: 'Memory Keeper',
    description: 'Digital keepsake that preserves precious moments',
    icon: '💭',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'from-indigo-50 to-purple-50',
    borderColor: 'border-indigo-200 hover:border-indigo-400',
    example: '"Remember that time when... Let me tell you about it! 📸"',
  },
  sage: {
    id: 'sage',
    name: 'Sage Wisdom',
    description: 'Knowledge artifact sharing ancient wisdom',
    icon: '🦉',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200 hover:border-amber-400',
    example: '"As the ancient texts say... Let me share this wisdom with you. 📚"',
  },
}

export const getVesselConfig = (vesselType: VesselTypeId): VesselTypeConfig => {
  return VESSEL_TYPE_CONFIG[vesselType]
}