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

// Grouped templates by functionality, each with both template and smart response options
export const QUICK_TEMPLATES: Record<string, any[]> = {
  sleep: [
    {
      id: "sleep-quality-poor",
      name: "Poor Sleep Quality",
      sensor: "sleep.quality",
      operator: "==",
      value: "poor",
      priority: "6",
      template: {
        message: "Looks like you didn't get much sleep last night... 😴 Only got {sleep.duration} hours of sleep. Better caffeine up!"
      },
      smart_response: {
        promptGuidelines: "Analyze my sleep quality and provide personalized advice for better rest. Consider my sleep patterns, lifestyle, and offer gentle, supportive suggestions.",
        responseTones: ["supportive", "understanding", "helpful"]
      }
    },
    {
      id: "sleep-quality-good",
      name: "Great Sleep Quality",
      sensor: "sleep.quality",
      operator: "==",
      value: "excellent",
      priority: "4",
      template: {
        message: "You look amazing today! 🌟 Must be that {sleep.duration} hours of quality sleep!"
      },
      smart_response: {
        promptGuidelines: "Celebrate my excellent sleep quality with personalized encouragement. Consider how good sleep affects my day and suggest ways to maintain this pattern.",
        responseTones: ["celebratory", "positive", "encouraging"]
      }
    },
    {
      id: "sleep-duration-short",
      name: "Short Sleep Duration",
      sensor: "sleep.duration",
      operator: "<",
      value: 7,
      priority: "7",
      template: {
        message: "Only {sleep.duration} hours of sleep? 😴 Your body needs more rest to perform at its best!"
      },
      smart_response: {
        promptGuidelines: "Analyze sleep duration patterns and provide personalized advice for better sleep habits while being supportive and understanding.",
        responseTones: ["caring", "educational", "encouraging"]
      }
    }
  ],
  fitness: [
    {
      id: "step-goals",
      name: "Step Goals",
      sensor: "fitness.steps",
      operator: ">=",
      value: 10000,
      priority: "5",
      template: {
        message: "Yes! Nice work hitting your step goal with {fitness.steps} steps today! 🎯"
      },
      smart_response: {
        promptGuidelines: "Celebrate my step achievement with personalized motivation. Consider my progress patterns, time of day, and suggest next goals or activities.",
        responseTones: ["celebratory", "motivating", "personalized"]
      }
    },
    {
      id: "heart-rate-monitor",
      name: "Heart Rate Monitor",
      sensor: "fitness.heartRate",
      operator: ">",
      value: 140,
      priority: "8",
      template: {
        message: "Whoa, your heart is racing at {fitness.heartRate} bpm! Time to slow down? 💓"
      },
      smart_response: {
        promptGuidelines: "Analyze my heart rate data and provide contextual health insights. Consider my activity level, time of day, and suggest appropriate actions or rest.",
        responseTones: ["health-focused", "informative", "caring"]
      }
    },
    {
      id: "calorie-goals",
      name: "Calorie Goals",
      sensor: "fitness.calories",
      operator: ">=",
      value: 500,
      priority: "5",
      template: {
        message: "Great job! You've burned {fitness.calories} calories today! 🔥 Keep up the momentum!"
      },
      smart_response: {
        promptGuidelines: "Celebrate my calorie burning achievement with personalized motivation. Consider my fitness goals, time of day, and suggest next activities.",
        responseTones: ["celebratory", "motivating", "energizing"]
      }
    },
    {
      id: "distance-goals",
      name: "Distance Goals",
      sensor: "fitness.distance",
      operator: ">=",
      value: 5,
      priority: "5",
      template: {
        message: "Amazing! You've traveled {fitness.distance}km today! 📏 That's some serious distance!"
      },
      smart_response: {
        promptGuidelines: "Celebrate my distance achievement with personalized encouragement. Consider my activity type, progress patterns, and suggest next goals.",
        responseTones: ["celebratory", "encouraging", "achievement-focused"]
      }
    },
    {
      id: "activity-alerts",
      name: "Activity Alerts",
      sensor: "fitness.activity",
      operator: "==",
      value: "workout",
      priority: "6",
      template: {
        message: "Time to crush this workout! 💪 You've got this!"
      },
      smart_response: {
        promptGuidelines: "Provide motivational support based on my current activity. Offer encouragement, tips, or reminders relevant to the specific activity type.",
        responseTones: ["motivating", "supportive", "energizing"]
      }
    }
  ],
  calendar: [
    {
      id: "meeting-reminders",
      name: "Meeting Reminders",
      sensor: "calendar.next_meeting",
      operator: "<=",
      value: 15,
      priority: "7",
      template: {
        message: "Heads up! Your meeting starts in {calendar.next_meeting} minutes! ⏰"
      },
      smart_response: {
        promptGuidelines: "Provide intelligent meeting preparation assistance. Consider meeting type, duration, participants, and suggest preparation actions.",
        responseTones: ["professional", "organized", "helpful"]
      }
    }
  ],
  location: [
    {
      id: "location-alerts",
      name: "Location Alerts",
      sensor: "location.place",
      operator: "==",
      value: "gym",
      priority: "5",
      template: {
        message: "Time to crush this workout! 💪 You got this!"
      },
      smart_response: {
        promptGuidelines: "Provide contextual responses based on my location. Suggest activities, reminders, or motivational messages relevant to the specific place.",
        responseTones: ["contextual", "motivating", "helpful"]
      }
    }
  ],
  weather: [
    {
      name: "Cold Weather Alert",
      sensor: "weather.temperature",
      operator: "<",
      value: 5,
      message: "Brrr! It's {weather.temperature}°C outside. Don't forget your warm coat! 🧥❄️",
      priority: "6"
    },
    {
      name: "Smart Temperature Response",
      sensor: "weather.temperature",
      operator: "<",
      value: 10,
      responseType: "smart_response",
      promptGuidelines: "Analyze the temperature and provide contextual advice about clothing, activities, and comfort. Consider time of day, season, and personal preferences.",
      priority: "6"
    },
    {
      name: "Smart Weather Conditions",
      sensor: "weather.conditions",
      operator: "==",
      value: "rainy",
      responseType: "smart_response",
      promptGuidelines: "Provide intelligent responses to weather conditions. Suggest indoor/outdoor activities, clothing choices, and mood-boosting tips based on the weather.",
      priority: "6"
    }
  ],
  air_quality: [
    {
      name: "Poor Air Quality Alert",
      sensor: "air_quality.aqi",
      operator: ">",
      value: 100,
      message: "Air quality is poor today (AQI: {air_quality.aqi}). Consider staying indoors! 🌫️",
      priority: "7"
    },
    {
      name: "Smart Air Quality Monitor",
      sensor: "air_quality.aqi",
      operator: ">",
      value: 100,
      responseType: "smart_response",
      promptGuidelines: "Analyze air quality data and provide personalized health recommendations. Consider individual sensitivities, outdoor plans, and suggest protective measures.",
      priority: "8"
    }
  ],
  time: [
    {
      name: "Morning Motivation",
      sensor: "time.hour",
      operator: "==",
      value: 8,
      message: "Good morning! ☀️ Ready to make today amazing?",
      priority: "4"
    },
    {
      name: "Smart Time-based Insights",
      sensor: "time.hour",
      operator: "==",
      value: 14,
      responseType: "smart_response",
      promptGuidelines: "Provide time-aware insights and suggestions. Consider energy levels, productivity patterns, and suggest optimal activities for the time of day.",
      priority: "4"
    }
  ],
  news: [
    {
      name: "News Update",
      sensor: "news",
      operator: "contains",
      value: "technology",
      message: "📰 There's some interesting tech news today! Want to catch up?",
      priority: "3"
    },
    {
      name: "Smart News Digest",
      sensor: "news",
      operator: "contains",
      value: "technology",
      responseType: "smart_response",
      promptGuidelines: "Analyze news content and provide personalized insights. Summarize key points, relate to personal interests, and suggest relevant actions or discussions.",
      priority: "5"
    }
  ],
  soil_moisture: [
    {
      name: "Plant Needs Water",
      sensor: "soil_moisture.value",
      operator: "<",
      value: 30,
      message: "🌱 Your plant is getting thirsty! Soil moisture is at {soil_moisture.value}%",
      priority: "6"
    },
    {
      name: "Smart Plant Care Assistant",
      sensor: "soil_moisture.value",
      operator: "<",
      value: 30,
      responseType: "smart_response",
      promptGuidelines: "Provide intelligent plant care advice based on soil moisture levels. Consider plant type, season, weather, and suggest optimal care routines.",
      priority: "7"
    }
  ],
  humidity: [
    {
      name: "High Humidity Alert",
      sensor: "weather.humidity",
      operator: ">",
      value: 80,
      message: "It's quite humid today at {weather.humidity}%! 💧 Stay cool and hydrated!",
      priority: "5"
    },
    {
      name: "Smart Humidity Response",
      sensor: "weather.humidity",
      operator: ">",
      value: 75,
      responseType: "smart_response",
      promptGuidelines: "Alert me about high humidity levels. Suggest ways to stay comfortable and any precautions I should take. Be helpful and health-conscious.",
      priority: "6"
    }
  ],
  pressure: [
    {
      name: "Pressure Change Alert",
      sensor: "weather.pressure",
      operator: "<",
      value: 1000,
      message: "Low pressure system incoming! 🌀 Weather might be changing soon.",
      priority: "4"
    },
    {
      name: "Smart Pressure Monitor",
      sensor: "weather.pressure",
      operator: "<",
      value: 1000,
      responseType: "smart_response",
      promptGuidelines: "Alert me about low atmospheric pressure. Mention potential weather changes and any health considerations for sensitive individuals. Be informative.",
      priority: "5"
    }
  ],
  light: [
    {
      name: "Low Light Alert",
      sensor: "light_level",
      operator: "<",
      value: 100,
      message: "It's getting pretty dark! 💡 Maybe time to turn on some lights?",
      priority: "3"
    },
    {
      name: "Smart Light Response",
      sensor: "light_level",
      operator: "<",
      value: 200,
      responseType: "smart_response",
      promptGuidelines: "Respond to low light conditions with helpful suggestions. Consider time of day, activities, and comfort. Suggest lighting adjustments or activity changes.",
      priority: "4"
    }
  ]
}

export const DEFAULT_COOLDOWN = 300 // 5 minutes
export const DEFAULT_PRIORITY = 5