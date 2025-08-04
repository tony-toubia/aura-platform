// apps/web/types/rules.ts

import type { BehaviorRule, SensorMetadata } from './index'

export interface RuleTemplate {
  name: string
  sensor: string
  operator: string
  value: any
  message: string
  priority: string
  cooldown?: string
  category?: string
}

export interface RuleBuilderProps {
  auraId: string
  vesselType?: string
  vesselCode?: string
  availableSenses: string[]
  oauthConnections?: Record<string, any[]>
  existingRules?: BehaviorRule[]
  editingRule?: BehaviorRule | null
  onEditRule?: (rule: BehaviorRule | null) => void
  onSaveEditedRule?: (rule: BehaviorRule) => void
  onAddRule: (rule: BehaviorRule) => void
  onDeleteRule?: (ruleId: string) => void
  onToggleRule?: (ruleId: string, enabled: boolean) => void
}

export interface PriorityConfig {
  label: string
  color: string
  bgColor: string
  min: number
}

export interface SensorValueInputProps {
  sensor: SensorMetadata
  operator: string
  value: any
  onChange: (value: any) => void
}

// New types for the enhanced cooldown system
export type FrequencyPeriod = 'hour' | 'day' | 'week' | 'month'

export interface FrequencyPreset {
  limit: number
  period: FrequencyPeriod
  label: string
  description: string
}

export interface CooldownPayload {
  cooldown: number
  frequencyLimit?: number
  frequencyPeriod?: FrequencyPeriod
  minimumGap?: number
}