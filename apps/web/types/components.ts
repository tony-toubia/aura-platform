// apps/web/types/components.ts
// Common component prop types and interfaces

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import type { 
  Aura, 
  BehaviorRule, 
  Message, 
  Personality, 
  SensorMetadata
} from './index'

// Define these types locally since they're not exported from index
export type VesselTypeId = 'digital' | 'terra' | 'companion' | 'memory' | 'sage'
export type SenseId = string
import type { 
  BaseComponentProps, 
  EntityOperations, 
  LoadingState,
  StatCardData,
  SelectOption,
  ModalProps,
  FormProps
} from './shared'

// ============================================================================
// AURA COMPONENT TYPES
// ============================================================================

export interface AuraCardProps extends BaseComponentProps {
  aura: Aura
  onDelete?: (id: string) => void
  onExport?: (id: string) => void
  onEdit?: (id: string) => void
}

export interface AuraListProps extends BaseComponentProps, LoadingState {
  auras: Aura[]
  operations?: EntityOperations<Aura>
  emptyStateMessage?: string
}

export interface AuraFormProps extends FormProps<Aura> {
  vesselTypes?: VesselTypeId[]
  availableSenses?: SenseId[]
  mode?: 'create' | 'edit'
}

export interface AuraConfigurationAgentProps extends BaseComponentProps {
  onConfigurationComplete: (config: any) => void
  initialConfig?: any
  availableSenses: string[]
}

// ============================================================================
// PERSONALITY COMPONENT TYPES
// ============================================================================

export interface PersonalityMatrixProps extends BaseComponentProps {
  personality: Personality
  vesselCode?: string
  vesselType?: VesselTypeId
  auraName?: string
  onChange: (updates: Partial<Personality>) => void
  readOnly?: boolean
}

export interface TraitSliderProps extends BaseComponentProps {
  trait: {
    id: string
    name: string
    low: string
    high: string
    icon?: LucideIcon
    color?: string
  }
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export interface PersonaOptionProps extends BaseComponentProps {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  selected: boolean
  onClick: (id: string) => void
  disabled?: boolean
}

// ============================================================================
// RULE COMPONENT TYPES
// ============================================================================

export interface RuleBuilderProps extends BaseComponentProps {
  auraId: string
  vesselType?: VesselTypeId
  vesselCode?: string
  availableSenses: string[]
  existingRules?: BehaviorRule[]
  editingRule?: BehaviorRule | null
  onEditRule?: (rule: BehaviorRule | null) => void
  onSaveEditedRule?: (rule: BehaviorRule) => void
  onAddRule: (rule: BehaviorRule) => void
  onDeleteRule?: (ruleId: string) => void
  onToggleRule?: (ruleId: string, enabled: boolean) => void
}

export interface RuleCardProps extends BaseComponentProps {
  rule: BehaviorRule
  onEdit?: (rule: BehaviorRule) => void
  onDelete?: (ruleId: string) => void
  onToggle?: (ruleId: string, enabled: boolean) => void
  showActions?: boolean
}

export interface SensorValueInputProps extends BaseComponentProps {
  sensor: SensorMetadata
  operator: string
  value: any
  onChange: (value: any) => void
  disabled?: boolean
}

export interface CooldownConfigProps extends BaseComponentProps {
  cooldownConfig: {
    cooldown: number
    frequencyLimit?: number
    frequencyPeriod?: 'hour' | 'day' | 'week' | 'month'
    minimumGap?: number
    setCooldown: (value: number) => void
    setFrequencyLimit: (value?: number) => void
    setFrequencyPeriod: (value?: 'hour' | 'day' | 'week' | 'month') => void
    setMinimumGap: (value?: number) => void
  }
}

// ============================================================================
// CHAT COMPONENT TYPES
// ============================================================================

export interface ChatInterfaceProps extends BaseComponentProps {
  auraId: string
  initialMessages?: Message[]
  senseData?: Record<string, any>
  onMessageSent?: (message: Message) => void
}

export interface MessageInfluenceProps extends BaseComponentProps {
  message: Message
  showDetails?: boolean
}

export interface SenseStatusProps extends BaseComponentProps {
  senses: string[]
  senseData: Record<string, any>
  isLoading: boolean
  onRefresh?: () => void
}

// ============================================================================
// DASHBOARD COMPONENT TYPES
// ============================================================================

export interface DashboardStatCardProps extends BaseComponentProps {
  title: string
  value: number | string
  description: string
  icon?: LucideIcon
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red'
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  onClick?: () => void
}

export interface SensorDashboardProps extends BaseComponentProps {
  senseData: any
  auraId?: string
  onSenseToggle?: (senseId: string, enabled: boolean) => void
}

// ============================================================================
// SENSE COMPONENT TYPES
// ============================================================================

export interface SenseSelectorProps extends BaseComponentProps {
  availableSenses: readonly any[]
  defaultSenses: string[]
  selectedSenses: string[]
  onSenseToggle: (senseId: string, enabled: boolean) => void
  vesselType?: VesselTypeId
  userTier?: string
}

export interface SenseLocationModalProps extends ModalProps {
  onLocationSet: (location: { lat: number; lng: number; address: string }) => void
}

// ============================================================================
// VESSEL COMPONENT TYPES
// ============================================================================

export interface VesselProductCardProps extends BaseComponentProps {
  product: any
  typeConfig: any
  onSelect?: (productId: string) => void
  selected?: boolean
  disabled?: boolean
}

export interface PlantSelectorProps extends BaseComponentProps {
  selectedPlant?: string
  onSelectPlant: (plantId: string) => void
  category?: string
}

export interface AnimalSelectorProps extends BaseComponentProps {
  onStudyChange: (id: number) => void
  onIndividualChange: (id: string) => void
  selectedStudy?: number
  selectedIndividual?: string
}

// ============================================================================
// SUBSCRIPTION COMPONENT TYPES
// ============================================================================

export interface PricingCardsProps extends BaseComponentProps {
  currentTier?: string
  onSelectTier?: (tierId: string) => void
  showFeatureComparison?: boolean
}

export interface UpgradePromptProps extends BaseComponentProps {
  feature: string
  requiredTier: string
  currentTier: string
  onUpgrade?: () => void
  onDismiss?: () => void
}

// ============================================================================
// LAYOUT COMPONENT TYPES
// ============================================================================

export interface HeaderProps extends BaseComponentProps {
  user?: {
    email: string
    name?: string
  }
  navigation?: Array<{
    href: string
    label: string
    active?: boolean
  }>
  onSignOut?: () => Promise<void>
}

export interface SidebarProps extends BaseComponentProps {
  navigation: Array<{
    href: string
    label: string
    icon?: LucideIcon
    active?: boolean
    badge?: string | number
  }>
  user?: {
    email: string
    name?: string
    avatar?: string
  }
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export interface MobileNavProps extends BaseComponentProps {
  navItems: Array<{
    href: string
    label: string
    icon?: LucideIcon
    disabled?: boolean
    comingSoon?: boolean
  }>
  userEmail?: string | null
  signOutAction: () => Promise<void>
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export interface EmptyStateProps extends BaseComponentProps {
  icon: LucideIcon
  iconGradient?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
}

export interface StatCardProps extends BaseComponentProps {
  data: StatCardData
  onClick?: () => void
  loading?: boolean
}

export interface OptionCardProps extends BaseComponentProps {
  id: string
  name: string
  description: string
  emoji?: string
  icon?: LucideIcon
  color?: string
  selected: boolean
  onClick: (id: string) => void
  disabled?: boolean
}

// ============================================================================
// MAP COMPONENT TYPES
// ============================================================================

export interface WildlifeMapProps extends BaseComponentProps {
  points: Array<{
    lat: number
    lon: number
    timestamp?: string
    individual_id?: string
  }>
  center?: [number, number]
  zoom?: number
  onPointClick?: (point: any) => void
}

// ============================================================================
// FORM COMPONENT TYPES
// ============================================================================

export interface FormFieldProps extends BaseComponentProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  options?: SelectOption[]
  value?: any
  onChange?: (value: any) => void
}

export interface FormSectionProps extends BaseComponentProps {
  title: string
  description?: string
  required?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
}

// ============================================================================
// ANALYTICS COMPONENT TYPES
// ============================================================================

export interface AnalyticsChartProps extends BaseComponentProps {
  data: Array<{
    date: string
    value: number
    label?: string
  }>
  type: 'line' | 'bar' | 'area'
  title?: string
  color?: string
  height?: number
}

export interface MetricCardProps extends BaseComponentProps {
  metric: {
    name: string
    value: number | string
    change?: number
    changeLabel?: string
    icon?: LucideIcon
    color?: string
  }
  period?: string
}