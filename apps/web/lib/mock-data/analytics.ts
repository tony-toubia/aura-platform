// apps/web/lib/mock-data/analytics.ts

import type {
  TimeSeriesDataPoint,
  AuraActivityDataPoint,
  SensorUsageDataPoint,
  PersonalityTraitData,
  RulePerformanceData,
  WeeklyEngagementData,
  Milestone,
} from '@/types/analytics'

export const generateTimeSeriesData = (days: number): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      messages: Math.floor(Math.random() * 20) + 10,
      engagement: Math.floor(Math.random() * 100) + 50,
      sensorActivity: Math.floor(Math.random() * 50) + 20,
      rules: Math.floor(Math.random() * 15) + 5,
    })
  }
  return data
}

export const AURA_ACTIVITY_DATA: AuraActivityDataPoint[] = [
  { hour: '12am', Terra: 2, Companion: 1, Digital: 5 },
  { hour: '6am', Terra: 8, Companion: 3, Digital: 12 },
  { hour: '9am', Terra: 15, Companion: 8, Digital: 20 },
  { hour: '12pm', Terra: 12, Companion: 15, Digital: 18 },
  { hour: '3pm', Terra: 10, Companion: 12, Digital: 15 },
  { hour: '6pm', Terra: 18, Companion: 10, Digital: 25 },
  { hour: '9pm', Terra: 5, Companion: 6, Digital: 20 },
]

export const SENSOR_USAGE_DATA: SensorUsageDataPoint[] = [
  { name: 'Temperature', value: 35, color: '#FF6B6B' },
  { name: 'Soil Moisture', value: 28, color: '#4ECDC4' },
  { name: 'Light Level', value: 22, color: '#FFD93D' },
  { name: 'Weather', value: 15, color: '#6C5CE7' },
]

export const PERSONALITY_TRAITS_DATA: PersonalityTraitData[] = [
  { trait: 'Warmth', A: 75, B: 65, fullMark: 100 },
  { trait: 'Playfulness', A: 80, B: 70, fullMark: 100 },
  { trait: 'Verbosity', A: 60, B: 85, fullMark: 100 },
  { trait: 'Empathy', A: 85, B: 75, fullMark: 100 },
  { trait: 'Creativity', A: 70, B: 80, fullMark: 100 },
]

export const RULE_PERFORMANCE_DATA: RulePerformanceData[] = [
  { name: 'Morning Greeting', triggers: 287, success: 95 },
  { name: 'Low Moisture Alert', triggers: 156, success: 88 },
  { name: 'Good Night Message', triggers: 245, success: 92 },
  { name: 'Weather Update', triggers: 189, success: 78 },
  { name: 'Step Goal Reminder', triggers: 134, success: 85 },
]

export const WEEKLY_ENGAGEMENT_DATA: WeeklyEngagementData[] = [
  { day: 'Mon', morning: 45, afternoon: 78, evening: 92 },
  { day: 'Tue', morning: 52, afternoon: 85, evening: 88 },
  { day: 'Wed', morning: 48, afternoon: 72, evening: 95 },
  { day: 'Thu', morning: 58, afternoon: 88, evening: 90 },
  { day: 'Fri', morning: 62, afternoon: 92, evening: 85 },
  { day: 'Sat', morning: 40, afternoon: 65, evening: 78 },
  { day: 'Sun', morning: 38, afternoon: 60, evening: 82 },
]

export const MILESTONES: Milestone[] = [
  { id: 1, title: "First Hello", date: "2 weeks ago", icon: "👋", achieved: true },
  { id: 2, title: "100 Messages", date: "1 week ago", icon: "💬", achieved: true },
  { id: 3, title: "Plant Thriving", date: "3 days ago", icon: "🌱", achieved: true },
  { id: 4, title: "500 Messages", date: "Coming soon", icon: "🎯", achieved: false },
  { id: 5, title: "Aura Master", date: "Level up!", icon: "🏆", achieved: false },
]