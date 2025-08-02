// apps/web/types/creation-wizard.ts

export type CreationStep = 'welcome' | 'method' | 'vessel' | 'config' | 'review' | 'success'

export type CreationMethod = 'ai' | 'manual' | 'hybrid'

export type VesselTypeId = 'digital' | 'terra' | 'companion' | 'memory' | 'sage'

export interface CreationContext {
  // Current wizard state
  step: CreationStep
  progress: number
  
  // User selections
  method: CreationMethod | null
  vessel: VesselTypeId | null
  
  // Aura configuration
  configuration: AuraConfiguration
  
  // Session management
  sessionId: string
  lastSaved: Date | null
  isDirty: boolean
}

export interface AuraConfiguration {
  id?: string
  name: string
  vesselType: VesselTypeId
  vesselCode?: string
  personality: PersonalityConfig
  senses: string[]
  rules: BehaviorRuleConfig[]
  locationInfo?: LocationInfo
  newsType?: 'local' | 'global' | 'both'
}

export interface PersonalityConfig {
  warmth: number
  playfulness: number
  verbosity: number
  empathy: number
  creativity: number
  persona: string
  tone: 'casual' | 'formal' | 'poetic' | 'humorous'
  vocabulary: 'simple' | 'average' | 'scholarly'
  quirks: string[]
}

export interface BehaviorRuleConfig {
  id?: string
  name: string
  trigger: RuleTriggerConfig
  action: RuleActionConfig
  priority: number
  enabled: boolean
}

export interface RuleTriggerConfig {
  type: 'simple' | 'compound' | 'time' | 'threshold'
  sensor?: string
  operator?: '<' | '<=' | '>' | '>=' | '==' | '!=' | 'contains' | 'between'
  value?: any
  conditions?: RuleTriggerConfig[]
  logic?: 'AND' | 'OR'
  cooldown?: number
}

export interface RuleActionConfig {
  type: 'notify' | 'alert' | 'respond' | 'log' | 'webhook' | 'prompt' | 'prompt_respond'
  message?: string
  severity?: 'info' | 'warning' | 'critical'
  promptGuidelines?: string
  responseTones?: string[]
  responseType?: 'prompt' | 'template'
}

export interface LocationInfo {
  city: string
  state?: string
  country?: string
}

export interface WizardStep {
  id: CreationStep
  title: string
  description: string
  isCompleted?: boolean
  isActive?: boolean
  canNavigate?: boolean
}

export interface CreationContextActions {
  updateContext: (updates: Partial<CreationContext>) => void
  updateConfiguration: (updates: Partial<AuraConfiguration>) => void
  goToStep: (step: CreationStep) => void
  nextStep: () => Promise<void>
  prevStep: () => void
  canGoNext: boolean
  canGoPrev: boolean
  saveProgress: () => Promise<string | null>
  restoreSession: (sessionId: string) => Promise<void>
  clearSession: () => void
  resetWizard: () => void
  completeWizard: () => void
}

export interface QuickStartOption {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  onSelect: () => void
  recommended?: boolean
}

export interface MethodOption {
  id: CreationMethod
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  features: string[]
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  recommended?: boolean
  badge?: string
}

export interface VesselOption {
  id: VesselTypeId
  name: string
  description: string
  icon: string
  gradient: string
  available: boolean
  featured?: boolean
  comingSoon?: boolean
  price?: number
  features: string[]
  example?: string
}