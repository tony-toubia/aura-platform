// apps/web/types/analytics.ts

import { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface TimeSeriesDataPoint {
  date: string
  messages: number
  engagement: number
  sensorActivity: number
  rules: number
}

export interface AuraActivityDataPoint {
  hour: string
  Terra: number
  Companion: number
  Digital: number
}

export interface SensorUsageDataPoint {
  name: string
  value: number
  color: string
}

export interface PersonalityTraitData {
  trait: string
  A: number
  B: number
  fullMark: number
}

export interface RulePerformanceData {
  name: string
  triggers: number
  success: number
}

export interface WeeklyEngagementData {
  day: string
  morning: number
  afternoon: number
  evening: number
}

export interface Milestone {
  id: number
  title: string
  date: string
  icon: string
  achieved: boolean
}

export interface SensorAlert {
  time: string
  sensor: string
  message: string
  severity: 'warning' | 'error' | 'info'
}

export type TimeRange = '24h' | '7d' | '30d' | '90d'
export type AnalyticsTab = 'overview' | 'engagement' | 'sensors' | 'personality'