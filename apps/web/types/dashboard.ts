// apps/web/types/dashboard.ts

export interface DashboardStats {
  auras: number
  conversations: number
  subscription: SubscriptionTier
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