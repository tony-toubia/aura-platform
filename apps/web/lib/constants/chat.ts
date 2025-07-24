// apps/web/lib/constants/chat.ts

import {
  Cloud,
  Droplets,
  Sun,
  Globe,
  Wind,
  Activity,
  Brain,
  Heart,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Zap,
  CheckCircle,
} from "lucide-react"
import type { SenseIconMap, InfluenceCategory } from '@/types/chat'

export const SENSE_ICONS: SenseIconMap = {
  weather: Cloud,
  soil_moisture: Droplets,
  light_level: Sun,
  news: Globe,
  wildlife: Activity,
  air_quality: Wind,
}

export const SENSE_CONFIG = {
  weather: {
    icon: Cloud,
    color: 'from-blue-500 to-sky-600',
    borderColor: 'border-blue-200',
    label: 'Weather',
  },
  soil_moisture: {
    icon: Droplets,
    color: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-200',
    label: 'Soil Moisture',
  },
  light_level: {
    icon: Sun,
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-200',
    label: 'Light Level',
  },
  news: {
    icon: Globe,
    color: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-200',
    label: 'News',
  },
  air_quality: {
    icon: Wind,
    color: 'from-gray-500 to-slate-600',
    borderColor: 'border-gray-200',
    label: 'Air Quality',
  },
  wildlife: {
    icon: Activity,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-200',
    label: 'Wildlife',
  },
}

export const INFLUENCE_CATEGORIES: Record<string, InfluenceCategory> = {
  general: {
    type: 'general',
    title: 'Response Influences',
    icon: Brain,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-700',
  },
  sense: {
    type: 'sense',
    title: 'Sensor Data Used',
    icon: Activity,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-700',
  },
  personality: {
    type: 'personality',
    title: 'Personality Traits',
    icon: Heart,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-700',
  },
  error: {
    type: 'error',
    title: 'Connection Error',
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-700',
  },
}

export const CHAT_REFRESH_INTERVAL = 60_000 // 1 minute