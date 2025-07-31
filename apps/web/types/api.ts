// apps/web/types/api.ts
// API-specific types and schemas

import { z } from 'zod'
import type { Personality, BehaviorRule } from './index'

// ============================================================================
// COMMON API SCHEMAS
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  details: z.any().optional(),
})

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number().min(0),
  totalPages: z.number().min(0),
})

// ============================================================================
// AURA API TYPES
// ============================================================================

export const PersonalitySchema = z.object({
  warmth: z.number().min(0).max(100),
  playfulness: z.number().min(0).max(100),
  verbosity: z.number().min(0).max(100),
  empathy: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  persona: z.string(),
  tone: z.enum(['casual', 'formal', 'poetic', 'humorous']),
  vocabulary: z.enum(['simple', 'average', 'scholarly']),
  quirks: z.array(z.string()),
})

export const BehaviorRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  trigger: z.any().optional(),
  action: z.any().optional(),
  enabled: z.boolean().optional().default(true),
  priority: z.number().optional().default(5),
})

export const CreateAuraSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  vesselType: z.string().min(1, 'Vessel type is required'),
  vesselCode: z.string().optional().default(''),
  personality: PersonalitySchema,
  senses: z.array(z.string()).default([]),
  rules: z.array(BehaviorRuleSchema).optional().default([]),
  // Location and news configuration from agent
  locationInfo: z.object({
    city: z.string(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  newsType: z.enum(['local', 'global', 'both']).optional(),
})

export const UpdateAuraSchema = CreateAuraSchema.partial().omit({ userId: true })

// ============================================================================
// CHAT API TYPES
// ============================================================================

export const ChatMessageSchema = z.object({
  auraId: z.string().uuid(),
  message: z.string().min(1),
  context: z.object({
    senseData: z.record(z.string(), z.any()).optional(),
    location: z.string().optional(),
    timestamp: z.string().optional(),
  }).optional(),
})

export interface ChatResponse {
  success: boolean
  response?: string
  messageId?: string
  error?: string
  metadata?: {
    influences?: string[]
    senseData?: Array<{ sense: string; timestamp: string | Date }>
    triggeredRule?: string
    processingTime?: number
  }
}

// ============================================================================
// RULE API TYPES
// ============================================================================

export const RuleTriggerSchema: z.ZodType<any> = z.object({
  type: z.enum(['simple', 'compound', 'time', 'threshold']),
  sensor: z.string().optional(),
  operator: z.enum(['<', '<=', '>', '>=', '==', '!=', 'contains', 'between']).optional(),
  value: z.any().optional(),
  conditions: z.array(z.lazy(() => RuleTriggerSchema)).optional(),
  logic: z.enum(['AND', 'OR']).optional(),
  timeRange: z.tuple([z.number(), z.number()]).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  cooldown: z.number().optional(),
  frequencyLimit: z.number().optional(),
  frequencyPeriod: z.enum(['hour', 'day', 'week', 'month']).optional(),
  minimumGap: z.number().optional(),
})

export const RuleActionSchema = z.object({
  type: z.enum(['notify', 'alert', 'respond', 'log', 'webhook']),
  message: z.string().optional(),
  defaultMessage: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  template: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const CreateRuleSchema = z.object({
  auraId: z.string().uuid(),
  name: z.string().min(1),
  trigger: RuleTriggerSchema,
  action: RuleActionSchema,
  priority: z.number().min(1).max(10).default(5),
  enabled: z.boolean().default(true),
})

// ============================================================================
// SENSE API TYPES
// ============================================================================

export interface SenseDataRequest {
  auraId: string
  senseIds: string[]
  timeRange?: {
    start: Date
    end: Date
  }
}

export interface SenseDataResponse {
  success: boolean
  data?: Record<string, any>
  error?: string
  lastUpdated?: Date
}

// ============================================================================
// SUBSCRIPTION API TYPES
// ============================================================================

export const CreateCheckoutSessionSchema = z.object({
  tierId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export interface SubscriptionStatus {
  tier: 'free' | 'personal' | 'family' | 'business'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
}

// ============================================================================
// WILDLIFE API TYPES
// ============================================================================

export interface WildlifeTrackPoint {
  lat: number
  lon: number
  timestamp?: string
  individual_id?: string
  study_id?: number
}

export interface WildlifeDataRequest {
  studyId?: number
  individualId?: string
  startDate?: string
  endDate?: string
  limit?: number
}

// ============================================================================
// ANALYTICS API TYPES
// ============================================================================

export interface AnalyticsRequest {
  auraId?: string
  timeRange: {
    start: Date
    end: Date
  }
  metrics: string[]
}

export interface AnalyticsResponse {
  success: boolean
  data?: {
    conversations: number
    messages: number
    rulesTriggered: number
    senseActivations: number
    timeSeriesData?: Array<{
      date: string
      value: number
      metric: string
    }>
  }
  error?: string
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateAuraRequest = z.infer<typeof CreateAuraSchema>
export type UpdateAuraRequest = z.infer<typeof UpdateAuraSchema>
export type ChatMessageRequest = z.infer<typeof ChatMessageSchema>
export type CreateRuleRequest = z.infer<typeof CreateRuleSchema>
export type CreateCheckoutSessionRequest = z.infer<typeof CreateCheckoutSessionSchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const validateApiRequest = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}

export const createApiError = (message: string, details?: any): { success: false; error: string; details?: any } => ({
  success: false,
  error: message,
  details,
})

export const createApiSuccess = <T>(data?: T, message?: string): { success: true; data?: T; message?: string } => ({
  success: true,
  data,
  message,
})