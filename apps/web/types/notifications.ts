// types/notifications.ts

export type NotificationStatus = 
  | 'PENDING' 
  | 'QUEUED'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'EXPIRED'

export type NotificationChannel =
  | 'IN_APP'
  | 'WEB_PUSH' 
  | 'SMS'
  | 'WHATSAPP'
  | 'EMAIL'

export type NotificationErrorCode =
  | 'DELIVERY_FAILED'
  | 'RATE_LIMITED'  
  | 'QUIET_HOURS'
  | 'USER_DISABLED'
  | 'INVALID_CHANNEL'
  | 'EXTERNAL_SERVICE_ERROR'

export interface NotificationPayload {
  auraId: string
  ruleId?: string
  message: string
  priority: number
  channels: NotificationChannel[]
  context: Record<string, any>
}

export interface DeliveryResult {
  success: boolean
  messageId?: string
  error?: string
  errorCode?: NotificationErrorCode
  retryable?: boolean
  channel?: NotificationChannel
}

export interface QuietHours {
  enabled: boolean
  start: string      // "HH:MM" format
  end: string        // "HH:MM" format  
  timezone: string   // IANA timezone
}

export interface NotificationPreference {
  id: string
  userId: string
  auraId: string | null
  channel: NotificationChannel
  enabled: boolean
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  timezone: string
  maxPerDay?: number
  priorityThreshold: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ProactiveMessage {
  id: string
  auraId: string
  ruleId?: string
  conversationId?: string
  message: string
  triggerData: Record<string, any>
  metadata: Record<string, any>
  createdAt: string
  deliveredAt?: string
  readAt?: string
  status: NotificationStatus
  deliveryChannel: NotificationChannel
  retryCount: number
  errorMessage?: string
}

export interface UpdatePreferencesRequest {
  auraId?: string
  channel: NotificationChannel
  settings: {
    enabled: boolean
    quietHours?: QuietHours
    maxPerDay?: number
    priorityThreshold?: number
  }
}

export interface TestNotificationRequest {
  auraId: string
  channel: NotificationChannel
  message: string
}

export interface GetHistoryRequest {
  auraId?: string
  status?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface GetHistoryResponse {
  notifications: (ProactiveMessage & { auraName?: string; ruleName?: string })[]
  total: number
  hasMore: boolean
}

export interface RuleEvaluatorConfig {
  batchSize: number
  evaluationTimeout: number
  sensorDataTTL: number
  maxRetries: number
}

export interface WorkerResult {
  processed: number
  succeeded: number
  failed: number
  duration: number
  errors: string[]
}

export interface BatchResult {
  succeeded: number
  failed: number
  errors: string[]
}

export interface EvaluationResult {
  auraId: string
  triggered: boolean
  rules: Array<{
    ruleId: string
    triggered: boolean
    message?: string
    error?: string
  }>
  sensorData: Record<string, any>
  duration: number
}

export interface TierLimits {
  evaluationFrequency: number
  maxNotificationsPerDay: number
  maxRulesPerAura: number
  channels: NotificationChannel[]
  sensorDataCacheTTL: number
  priority: number
}