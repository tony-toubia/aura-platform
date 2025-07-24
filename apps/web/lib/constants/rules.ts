// apps/web/lib/constants/rules.ts

import type { RuleTemplate, PriorityConfig } from '@/types/rules'

export const OPERATOR_LABELS: Record<string, string> = {
  "<": "Less than",
  "<=": "Less than or equal",
  ">": "Greater than",
  ">=": "Greater than or equal",
  "==": "Equals",
  "!=": "Not equals",
  "contains": "Contains",
  "between": "Between"
}

export const PRIORITY_CONFIGS: PriorityConfig[] = [
  { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50', min: 8 },
  { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50', min: 6 },
  { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50', min: 4 },
  { label: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-50', min: 0 }
]

export const getPriorityConfig = (priority: number): PriorityConfig =>
  PRIORITY_CONFIGS.find((c) => priority >= c.min)!

export const QUICK_TEMPLATES: Record<string, RuleTemplate[]> = {
  sleep: [
    {
      name: "Poor Sleep Alert",
      sensor: "sleep.quality",
      operator: "==",
      value: "poor",
      message: "I didn't sleep well last night 😴 Only got {sleep.duration} hours of sleep.",
      priority: "6"
    },
    {
      name: "Great Sleep Celebration",
      sensor: "sleep.quality",
      operator: "==",
      value: "excellent",
      message: "I feel amazing today! 🌟 Had {sleep.duration} hours of quality sleep!",
      priority: "4"
    }
  ],
  fitness: [
    {
      name: "Step Goal Achieved",
      sensor: "fitness.steps",
      operator: ">=",
      value: 10000,
      message: "Yes! Hit my step goal with {fitness.steps} steps today! 🎯",
      priority: "5"
    },
    {
      name: "High Heart Rate Warning",
      sensor: "fitness.heartRate",
      operator: ">",
      value: 160,
      message: "Whoa, my heart is racing at {fitness.heartRate} bpm! Time to slow down? 💓",
      priority: "8"
    }
  ],
  calendar: [
    {
      name: "Meeting Reminder",
      sensor: "calendar.timeUntilNext",
      operator: "<=",
      value: 15,
      message: "Heads up! Your {calendar.nextEvent} starts in {calendar.timeUntilNext} minutes! ⏰",
      priority: "7"
    }
  ],
  location: [
    {
      name: "Arrived at Gym",
      sensor: "location.place",
      operator: "==",
      value: "gym",
      message: "Time to crush this workout! 💪 Let's do this!",
      priority: "5"
    }
  ]
}

export const DEFAULT_COOLDOWN = 300 // 5 minutes
export const DEFAULT_PRIORITY = 5