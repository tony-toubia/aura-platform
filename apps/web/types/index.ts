// apps/web/types/index.ts
import React from 'react'

export interface User {
  id: string
  email: string
  name?: string
  subscription: Subscription
}

export interface Subscription {
  tier: 'free' | 'personal' | 'family' | 'business'
  expiresAt?: Date
}

export interface Aura {
  id: string
  name: string
  vesselType: 'digital' | 'terra' | 'companion' | 'memory' | 'sage'
  personality: {
    warmth: number
    playfulness: number
    verbosity: number
    empathy: number
    creativity: number
  }
  senses: string[]
  selectedStudyId: string
  selectedIndividualId: string
  avatar: string
  rules: BehaviorRule[]
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BehaviorRule {
  id: string
  name: string
  trigger: RuleTrigger
  action: RuleAction
  priority?: number
  enabled: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface RuleTrigger {
  type: 'simple' | 'compound' | 'time' | 'threshold'
  sensor?: string
  operator?: '<' | '<=' | '>' | '>=' | '==' | '!=' | 'contains' | 'between'
  value?: any
  conditions?: RuleTrigger[]
  logic?: 'AND' | 'OR'
  timeRange?: [number, number] // [startHour, endHour]
  daysOfWeek?: number[] // 0 = Sunday, 6 = Saturday
  thresholds?: Array<{ min?: number; max?: number; label?: string }>
  cooldown?: number // seconds
}

export interface RuleAction {
  type: 'notify' | 'alert' | 'respond' | 'log' | 'webhook'
  message?: string
  defaultMessage?: string
  severity?: 'info' | 'warning' | 'critical'
  template?: string
  webhookUrl?: string
  metadata?: Record<string, any>
}

export interface Sense {
  id: string
  code: string
  name: string
  category: string
  tier: 'free' | 'vessel' | 'premium' | 'enterprise'
  icon?: React.ReactNode
}

export interface Message {
  id: string
  role: 'user' | 'aura' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    influences?: string[]
    senseData?: { sense: string; timestamp: string | Date }[]
    triggeredRule?: string
  }
}

/** News API article shape */
export interface NewsArticle {
  title: string
  url:   string
}
