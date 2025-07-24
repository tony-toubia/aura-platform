// apps/web/lib/constants/dashboard.ts

import type { SubscriptionConfig } from '@/types/dashboard'

export const SUBSCRIPTION_CONFIG: Record<string, SubscriptionConfig> = {
  free: {
    icon: '✨',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    name: 'Free Tier',
    description: 'Getting started with Aura magic'
  },
  personal: {
    icon: '⭐',
    color: 'from-blue-500 to-sky-600',
    bgColor: 'from-blue-50 to-sky-50',
    name: 'Personal',
    description: 'Enhanced features for creators'
  },
  family: {
    icon: '👑',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'from-purple-50 to-violet-50',
    name: 'Family',
    description: 'Share the magic with loved ones'
  },
  business: {
    icon: '💎',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'from-amber-50 to-orange-50',
    name: 'Business',
    description: 'Enterprise-grade capabilities'
  }
}

export const EMPTY_STATE_MESSAGES = {
  auras: {
    zero: "Ready to create your first magical companion?",
    one: "Your Aura is waiting to chat!",
    multiple: (count: number) => `${count} personalities ready to interact`
  },
  conversations: {
    zero: "Start your first magical conversation",
    one: "Keep the conversation going!",
    multiple: (count: number) => `${count} conversations and counting`
  }
}