// apps/web/types/shared.ts
// Common shared types used across the application

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

// ============================================================================
// COMMON UI TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

export interface AsyncState<T = any> extends LoadingState {
  data?: T
}

// ============================================================================
// COMMON PROP PATTERNS
// ============================================================================

export interface CardProps extends BaseComponentProps {
  title?: string
  description?: string
  icon?: LucideIcon | ReactNode
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export interface FormProps<T = any> extends BaseComponentProps {
  initialData?: T
  onSubmit: (data: T) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

export interface LayoutProps {
  children: ReactNode
}

export interface NavItem {
  href: string
  label: string
  icon?: LucideIcon
  badge?: string | number
}

export interface NavigationProps {
  navItems: NavItem[]
  userEmail?: string | null
  onSignOut?: () => Promise<void>
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string
  message: string
}

export interface FormState<T = any> {
  data: T
  errors: ValidationError[]
  isValid: boolean
  isDirty: boolean
}

// ============================================================================
// COMMON OPTION TYPES
// ============================================================================

export interface SelectOption<T = string> {
  value: T
  label: string
  description?: string
  icon?: LucideIcon | ReactNode
  disabled?: boolean
}

export interface ColorOption {
  id: string
  name: string
  color: string
  bgColor?: string
  textColor?: string
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface StatCardData {
  title: string
  value: number | string
  description?: string
  icon?: LucideIcon
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red'
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
}

export interface DashboardStats {
  auras: number
  conversations: number
  subscription: string
  [key: string]: any
}

// ============================================================================
// ENTITY OPERATION TYPES
// ============================================================================

export interface EntityOperations<T = any> {
  onCreate?: (data: Partial<T>) => void | Promise<void>
  onUpdate?: (id: string, data: Partial<T>) => void | Promise<void>
  onDelete?: (id: string) => void | Promise<void>
  onView?: (id: string) => void
}

// ============================================================================
// SEARCH AND FILTER TYPES
// ============================================================================

export interface SearchState {
  query: string
  filters: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterOption {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'range'
  options?: SelectOption[]
}

// ============================================================================
// TIME AND DATE TYPES
// ============================================================================

export interface TimeRange {
  start: Date
  end: Date
  label?: string
}

export interface DateRangeOption {
  id: string
  label: string
  getValue: () => TimeRange
}

// ============================================================================
// SUBSCRIPTION AND TIER TYPES
// ============================================================================

export interface SubscriptionTier {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  disabled?: boolean
}

export interface UpgradePromptData {
  feature: string
  requiredTier: string
  currentTier: string
  upgradeUrl?: string
}

// ============================================================================
// EXPORT ALL TYPES FROM OTHER FILES
// ============================================================================

// Re-export specific types to avoid conflicts
export type { AuraFormData } from './aura-forms'
export type { PersonalityTrait } from './personality'