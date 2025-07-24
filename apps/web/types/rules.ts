// apps/web/types/rules.ts

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
  existingRules?: any[] // BehaviorRule[]
  editingRule?: any | null
  onEditRule?: (rule: any | null) => void
  onSaveEditedRule?: (rule: any) => void
  onAddRule: (rule: any) => void
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
  sensor: any // SensorMetadata
  operator: string
  value: any
  onChange: (value: any) => void
}