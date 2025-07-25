// apps/web/lib/constants/cooldown.ts

export const FREQUENCY_PERIODS = [
  { value: 'hour', label: 'per hour', seconds: 3600 },
  { value: 'day', label: 'per day', seconds: 86400 },
  { value: 'week', label: 'per week', seconds: 604800 },
  { value: 'month', label: 'per month', seconds: 2592000 }
] as const

export const COMMON_FREQUENCIES = [
  { limit: 1, period: 'day', label: 'Once daily', description: 'Maximum 1 time per day' },
  { limit: 2, period: 'day', label: 'Twice daily', description: 'Maximum 2 times per day' },
  { limit: 1, period: 'week', label: 'Weekly', description: 'Maximum 1 time per week' },
  { limit: 3, period: 'day', label: 'Three times daily', description: 'Maximum 3 times per day' },
  { limit: 1, period: 'hour', label: 'Hourly max', description: 'Maximum 1 time per hour' }
] as const

export type FrequencyPeriod = typeof FREQUENCY_PERIODS[number]['value']
export type CommonFrequency = typeof COMMON_FREQUENCIES[number]