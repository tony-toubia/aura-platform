// apps/web/types/dashboard.ts

export interface DashboardStats {
  auras: number
  totalAuras?: number
  disabledAuras?: number
  conversations: number
  subscription: SubscriptionTier
  maxAuras?: number
  hasAvailableSlots?: boolean
}

export type SubscriptionTier = 'free' | 'personal' | 'family' | 'business'

export interface SubscriptionConfig {
  icon: string
  color: string
  bgColor: string
  name: string
  description: string
}

export interface DashboardCardConfig {
  title: string
  icon: any // LucideIcon
  color: string
  bgColor?: string
  borderColor?: string
  href: string
  actionText: string
}