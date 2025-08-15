// apps/web/types/index.ts
// Main types file - imports and re-exports all type definitions
import React from 'react'

// Re-export shared types
// Export specific types to avoid conflicts
export type { 
  BaseComponentProps,
  LoadingState,
  AsyncState,
  CardProps,
  ModalProps,
  FormProps
} from './shared'

export type {
  ApiResponse,
  ApiError,
  CreateAuraRequest,
  UpdateAuraRequest,
  ChatMessageRequest
} from './api'

export type {
  AuraCardProps,
  AuraListProps,
  AuraFormProps,
  VesselTypeId,
  SenseId
} from './components'

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

export interface Personality {
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

export interface Aura {
  id: string
  name: string
  vesselType: 'digital' | 'terra' | 'companion' | 'memory' | 'sage'
  vesselCode?: string  // Add this field
  plantType?: string   // Add this field for terra vessels
  personality: Personality
  senses: string[]
  selectedStudyId: string | null
  selectedIndividualId: string | null
  avatar: string
  rules: BehaviorRule[]
  enabled: boolean
  createdAt: Date
  updatedAt: Date
  // OAuth connection configurations
  oauthConnections?: Record<string, any[]>
  newsConfigurations?: Record<string, any[]>
  weatherAirQualityConfigurations?: Record<string, any[]>
  locationConfigs?: Record<string, any>
}

export interface AuraConfiguration {
  name: string
  vesselType: 'digital' | 'terra' | 'companion' | 'memory' | 'sage'
  vesselCode?: string
  personality: Personality
  rules: BehaviorRule[]
  availableSenses: string[]
  // Location and news configuration
  locationInfo?: {
    city: string
    state?: string
    country?: string
  }
  newsType?: 'local' | 'global' | 'both'
  // Temporary flags for agent communication
  needsLocationInfo?: {
    senses: string[]
    message: string
  }
  needsNewsTypeInfo?: {
    message: string
  }
}

// Enhanced sensor types for different data structures
export type SensorType = 
  | 'numeric'      // Temperature, humidity, heart rate, etc.
  | 'boolean'      // On/off states, presence detection
  | 'enum'         // Weather conditions, sleep stages, activity types
  | 'text'         // News headlines, calendar events
  | 'location'     // GPS coordinates, places
  | 'time'         // Time-based data
  | 'duration'     // Sleep duration, workout time

// Sensor metadata to guide UI generation
export interface SensorMetadata {
  id: string
  name: string
  type: SensorType
  unit?: string
  range?: { min: number; max: number }
  enumValues?: Array<{ value: string; label: string }>
  icon: string
  category: 'environmental' | 'biological' | 'digital' | 'personal'
  operators: Array<RuleTrigger['operator']>
}

// Extended sensor configurations
export const SENSOR_CONFIGS: Record<string, SensorMetadata> = {
  // Environmental sensors
  'weather.temperature': {
    id: 'weather.temperature',
    name: 'Temperature',
    type: 'numeric',
    unit: '°C',
    range: { min: -50, max: 50 },
    icon: '🌡️',
    category: 'environmental',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  'weather.conditions': {
    id: 'weather.conditions',
    name: 'Weather Conditions',
    type: 'enum',
    enumValues: [
      { value: 'sunny', label: 'Sunny' },
      { value: 'cloudy', label: 'Cloudy' },
      { value: 'rainy', label: 'Rainy' },
      { value: 'stormy', label: 'Stormy' },
      { value: 'snowy', label: 'Snowy' },
      { value: 'foggy', label: 'Foggy' }
    ],
    icon: '☁️',
    category: 'environmental',
    operators: ['==', '!=']
  },
  'soil_moisture.value': {
    id: 'soil_moisture.value',
    name: 'Soil Moisture',
    type: 'numeric',
    unit: '%',
    range: { min: 0, max: 100 },
    icon: '💧',
    category: 'environmental',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  
  // Personal sensors
  'sleep.duration': {
    id: 'sleep.duration',
    name: 'Sleep Duration',
    type: 'duration',
    unit: 'hours',
    range: { min: 0, max: 24 },
    icon: '😴',
    category: 'personal',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  'sleep.quality': {
    id: 'sleep.quality',
    name: 'Sleep Quality',
    type: 'enum',
    enumValues: [
      { value: 'poor', label: 'Poor' },
      { value: 'fair', label: 'Fair' },
      { value: 'good', label: 'Good' },
      { value: 'excellent', label: 'Excellent' }
    ],
    icon: '🌙',
    category: 'personal',
    operators: ['==', '!=']
  },
  'sleep.stage': {
    id: 'sleep.stage',
    name: 'Sleep Stage',
    type: 'enum',
    enumValues: [
      { value: 'awake', label: 'Awake' },
      { value: 'light', label: 'Light Sleep' },
      { value: 'deep', label: 'Deep Sleep' },
      { value: 'rem', label: 'REM Sleep' }
    ],
    icon: '💤',
    category: 'personal',
    operators: ['==', '!=']
  },
  
  'fitness.heartRate': {
    id: 'fitness.heartRate',
    name: 'Heart Rate',
    type: 'numeric',
    unit: 'bpm',
    range: { min: 40, max: 200 },
    icon: '❤️',
    category: 'biological',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  'fitness.steps': {
    id: 'fitness.steps',
    name: 'Daily Steps',
    type: 'numeric',
    unit: 'steps',
    range: { min: 0, max: 50000 },
    icon: '👟',
    category: 'personal',
    operators: ['<', '<=', '>', '>=', '==', '!=']
  },
  'fitness.activity': {
    id: 'fitness.activity',
    name: 'Current Activity',
    type: 'enum',
    enumValues: [
      { value: 'sedentary', label: 'Sedentary' },
      { value: 'walking', label: 'Walking' },
      { value: 'running', label: 'Running' },
      { value: 'cycling', label: 'Cycling' },
      { value: 'workout', label: 'Working Out' },
      { value: 'sleeping', label: 'Sleeping' }
    ],
    icon: '🏃',
    category: 'personal',
    operators: ['==', '!=']
  },
  
  'calendar.nextEvent': {
    id: 'calendar.nextEvent',
    name: 'Next Event Type',
    type: 'enum',
    enumValues: [
      { value: 'meeting', label: 'Meeting' },
      { value: 'appointment', label: 'Appointment' },
      { value: 'reminder', label: 'Reminder' },
      { value: 'personal', label: 'Personal' },
      { value: 'break', label: 'Break' }
    ],
    icon: '📅',
    category: 'digital',
    operators: ['==', '!=', 'contains']
  },
  'calendar.timeUntilNext': {
    id: 'calendar.timeUntilNext',
    name: 'Time Until Next Event',
    type: 'duration',
    unit: 'minutes',
    range: { min: 0, max: 1440 },
    icon: '⏰',
    category: 'digital',
    operators: ['<', '<=', '>', '>=', 'between']
  },
  
  'location.place': {
    id: 'location.place',
    name: 'Current Place',
    type: 'enum',
    enumValues: [
      { value: 'home', label: 'Home' },
      { value: 'work', label: 'Work' },
      { value: 'gym', label: 'Gym' },
      { value: 'outdoors', label: 'Outdoors' },
      { value: 'transit', label: 'In Transit' },
      { value: 'other', label: 'Other' }
    ],
    icon: '📍',
    category: 'personal',
    operators: ['==', '!=']
  },
  'location.movement': {
    id: 'location.movement',
    name: 'Movement Status',
    type: 'enum',
    enumValues: [
      { value: 'stationary', label: 'Stationary' },
      { value: 'walking', label: 'Walking' },
      { value: 'driving', label: 'Driving' },
      { value: 'transit', label: 'Public Transit' }
    ],
    icon: '🚶',
    category: 'personal',
    operators: ['==', '!=']
  },
  
  // News sensors - supporting different news configurations
  'news': {
    id: 'news',
    name: 'News Feed',
    type: 'text',
    icon: '📰',
    category: 'digital',
    operators: ['contains']
  },
  
  // Weather sensors
  'weather.humidity': {
    id: 'weather.humidity',
    name: 'Humidity',
    type: 'numeric',
    unit: '%',
    range: { min: 0, max: 100 },
    icon: '💧',
    category: 'environmental',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  'weather.pressure': {
    id: 'weather.pressure',
    name: 'Atmospheric Pressure',
    type: 'numeric',
    unit: 'hPa',
    range: { min: 900, max: 1100 },
    icon: '🌡️',
    category: 'environmental',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  
  // Air quality sensors
  'air_quality.aqi': {
    id: 'air_quality.aqi',
    name: 'Air Quality Index',
    type: 'numeric',
    unit: 'AQI',
    range: { min: 0, max: 500 },
    icon: '🌬️',
    category: 'environmental',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  'air_quality.pm25': {
    id: 'air_quality.pm25',
    name: 'PM2.5',
    type: 'numeric',
    unit: 'μg/m³',
    range: { min: 0, max: 500 },
    icon: '🌫️',
    category: 'environmental',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  
  // Additional fitness sensors
  'fitness.calories': {
    id: 'fitness.calories',
    name: 'Calories Burned',
    type: 'numeric',
    unit: 'cal',
    range: { min: 0, max: 10000 },
    icon: '🔥',
    category: 'personal',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  'fitness.distance': {
    id: 'fitness.distance',
    name: 'Distance Traveled',
    type: 'numeric',
    unit: 'km',
    range: { min: 0, max: 100 },
    icon: '📏',
    category: 'personal',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  
  // Additional sleep sensors
  'sleep.bedtime': {
    id: 'sleep.bedtime',
    name: 'Bedtime',
    type: 'time',
    icon: '🛏️',
    category: 'personal',
    operators: ['<', '<=', '>', '>=', '==', '!=']
  },
  'sleep.wakeTime': {
    id: 'sleep.wakeTime',
    name: 'Wake Time',
    type: 'time',
    icon: '⏰',
    category: 'personal',
    operators: ['<', '<=', '>', '>=', '==', '!=']
  },
  
  // Location sensors
  'location.city': {
    id: 'location.city',
    name: 'Current City',
    type: 'text',
    icon: '🏙️',
    category: 'personal',
    operators: ['==', '!=', 'contains']
  },
  'location.weather': {
    id: 'location.weather',
    name: 'Location Weather',
    type: 'enum',
    enumValues: [
      { value: 'sunny', label: 'Sunny' },
      { value: 'cloudy', label: 'Cloudy' },
      { value: 'rainy', label: 'Rainy' },
      { value: 'stormy', label: 'Stormy' },
      { value: 'snowy', label: 'Snowy' }
    ],
    icon: '🌤️',
    category: 'personal',
    operators: ['==', '!=']
  },
  
  // Time-based sensors - always available for proactive notifications
  'time.hour': {
    id: 'time.hour',
    name: 'Current Hour',
    type: 'numeric',
    unit: 'hour (24h format)',
    range: { min: 0, max: 23 },
    icon: '🕐',
    category: 'digital',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  'time.minute': {
    id: 'time.minute',
    name: 'Current Minute',
    type: 'numeric',
    unit: 'minute',
    range: { min: 0, max: 59 },
    icon: '⏱️',
    category: 'digital',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  'time.day_of_week': {
    id: 'time.day_of_week',
    name: 'Day of Week',
    type: 'enum',
    enumValues: [
      { value: 'monday', label: 'Monday' },
      { value: 'tuesday', label: 'Tuesday' },
      { value: 'wednesday', label: 'Wednesday' },
      { value: 'thursday', label: 'Thursday' },
      { value: 'friday', label: 'Friday' },
      { value: 'saturday', label: 'Saturday' },
      { value: 'sunday', label: 'Sunday' }
    ],
    icon: '📅',
    category: 'digital',
    operators: ['==', '!=']
  },
  'time.time_of_day': {
    id: 'time.time_of_day',
    name: 'Time of Day',
    type: 'enum',
    enumValues: [
      { value: 'early_morning', label: 'Early Morning (5-8 AM)' },
      { value: 'morning', label: 'Morning (8-12 PM)' },
      { value: 'afternoon', label: 'Afternoon (12-5 PM)' },
      { value: 'evening', label: 'Evening (5-9 PM)' },
      { value: 'night', label: 'Night (9 PM-12 AM)' },
      { value: 'late_night', label: 'Late Night (12-5 AM)' }
    ],
    icon: '🌅',
    category: 'digital',
    operators: ['==', '!=']
  },
  'time.workday': {
    id: 'time.workday',
    name: 'Workday vs Weekend',
    type: 'enum',
    enumValues: [
      { value: 'weekday', label: 'Weekday (Mon-Fri)' },
      { value: 'weekend', label: 'Weekend (Sat-Sun)' }
    ],
    icon: '📈',
    category: 'digital',
    operators: ['==', '!=']
  },
  'time.specific_time': {
    id: 'time.specific_time',
    name: 'Specific Time',
    type: 'time',
    icon: '⏰',
    category: 'digital',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  
  // Additional sleep sensors
  
  // Calendar sensors
  'calendar.next_meeting': {
    id: 'calendar.next_meeting',
    name: 'Minutes Until Next Meeting',
    type: 'numeric',
    unit: 'minutes',
    range: { min: 0, max: 1440 },
    icon: '📅',
    category: 'digital',
    operators: ['<', '<=', '>', '>=', '==', '!=', 'between']
  },
  
  // Location sensors
  'location.current': {
    id: 'location.current',
    name: 'Current Location',
    type: 'enum',
    enumValues: [
      { value: 'home', label: 'Home' },
      { value: 'work', label: 'Work' },
      { value: 'gym', label: 'Gym' },
      { value: 'school', label: 'School' },
      { value: 'store', label: 'Store' },
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'outdoors', label: 'Outdoors' },
      { value: 'transit', label: 'In Transit' },
      { value: 'other', label: 'Other' }
    ],
    icon: '📍',
    category: 'personal',
    operators: ['==', '!=']
  }
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
  
  // New frequency-based cooldown properties
  frequencyLimit?: number
  frequencyPeriod?: 'hour' | 'day' | 'week' | 'month'
  minimumGap?: number
}

export interface RuleAction {
  type: 'notify' | 'alert' | 'respond' | 'log' | 'webhook' | 'prompt' | 'prompt_respond'
  message?: string
  defaultMessage?: string
  severity?: 'info' | 'warning' | 'critical'
  template?: string
  webhookUrl?: string
  metadata?: Record<string, any>
  // AI response properties
  promptGuidelines?: string
  responseTones?: string[]
  responseType?: 'prompt' | 'template'
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
  created_at: string
  metadata?: {
    influences?: string[]
    senseData?: { sense: string; timestamp: string | Date }[]
    triggeredRule?: string
    senseInfluences?: string[]
    personalityFactors?: string[]
    isError?: boolean
  }
}

/** News API article shape */
export interface NewsArticle {
  title: string
  url:   string
}

// Helper functions for rule building
export const getSensorConfig = (sensorId: string): SensorMetadata | undefined => {
  return SENSOR_CONFIGS[sensorId]
}

export const getSensorsByCategory = (category: SensorMetadata['category']): SensorMetadata[] => {
  return Object.values(SENSOR_CONFIGS).filter(sensor => sensor.category === category)
}

export const getOperatorsForSensor = (sensorId: string): Array<RuleTrigger['operator']> => {
  const config = getSensorConfig(sensorId)
  return config?.operators || ['==', '!=']
}