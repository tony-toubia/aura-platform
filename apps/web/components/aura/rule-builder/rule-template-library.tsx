// apps/web/components/aura/rule-builder/rule-template-library.tsx

"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sparkles,
  Search,
  Filter,
  Clock,
  Zap,
  Heart,
  Brain,
  Activity,
  Sun,
  Moon,
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Star,
  TrendingUp,
  Shield,
  Bell,
  MessageCircle,
  Plus,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSensorConfig } from '@/types'

interface RuleTemplate {
  id: string
  name: string
  description: string
  category: 'wellness' | 'productivity' | 'environment' | 'social' | 'safety'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  sensor: string
  operator: string
  value: any
  responseType: 'prompt' | 'template'
  promptGuidelines?: string
  responseTones?: string[]
  message?: string
  priority: number
  cooldown: number
  tags: string[]
  estimatedSetupTime: string
  popularity: number
}

interface RuleTemplateLibraryProps {
  availableSenses: string[]
  onApplyTemplate: (template: RuleTemplate) => void
  onClose?: () => void
}

const RULE_TEMPLATES: RuleTemplate[] = [
  // Wellness Templates
  {
    id: 'morning-motivation',
    name: 'Morning Motivation Boost',
    description: 'Start your day with an encouraging message when you wake up',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Sun,
    gradient: 'from-yellow-400 to-orange-500',
    sensor: 'sleep.wakeTime',
    operator: '!=',
    value: null,
    responseType: 'prompt',
    promptGuidelines: 'Give me an energetic, positive morning greeting. Mention the weather if available and encourage me to have a great day. Use emojis and be upbeat.',
    responseTones: ['encouraging', 'motivational', 'playful'],
    priority: 6,
    cooldown: 3600,
    tags: ['morning', 'motivation', 'wellness'],
    estimatedSetupTime: '2 minutes',
    popularity: 95
  },
  {
    id: 'step-goal-celebration',
    name: 'Step Goal Achievement',
    description: 'Celebrate when you reach your daily step goal',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Activity,
    gradient: 'from-green-400 to-emerald-500',
    sensor: 'fitness.steps',
    operator: '>=',
    value: 10000,
    responseType: 'prompt',
    promptGuidelines: 'Celebrate enthusiastically that I hit my step goal! Mention the exact step count and encourage me to keep up the great work. Be proud and motivational.',
    responseTones: ['encouraging', 'celebratory', 'motivational'],
    priority: 7,
    cooldown: 1800,
    tags: ['fitness', 'goals', 'celebration'],
    estimatedSetupTime: '1 minute',
    popularity: 88
  },
  {
    id: 'hydration-reminder',
    name: 'Hydration Check-in',
    description: 'Gentle reminders to stay hydrated throughout the day',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Droplets,
    gradient: 'from-blue-400 to-cyan-500',
    sensor: 'time.hour',
    operator: '==',
    value: 14,
    responseType: 'template',
    message: 'Time for a hydration break! 💧 How about a refreshing glass of water?',
    priority: 4,
    cooldown: 7200,
    tags: ['health', 'hydration', 'reminders'],
    estimatedSetupTime: '1 minute',
    popularity: 76
  },

  // Productivity Templates
  {
    id: 'meeting-preparation',
    name: 'Meeting Preparation Alert',
    description: 'Get notified 15 minutes before your next meeting',
    category: 'productivity',
    difficulty: 'intermediate',
    icon: Calendar,
    gradient: 'from-purple-400 to-indigo-500',
    sensor: 'calendar.next_meeting',
    operator: '<=',
    value: 15,
    responseType: 'prompt',
    promptGuidelines: 'Alert me about my upcoming meeting. Include the meeting title if available and suggest I prepare or wrap up current tasks. Be professional but friendly.',
    responseTones: ['professional', 'helpful'],
    priority: 8,
    cooldown: 900,
    tags: ['meetings', 'calendar', 'productivity'],
    estimatedSetupTime: '3 minutes',
    popularity: 82
  },
  {
    id: 'focus-time-start',
    name: 'Deep Focus Session',
    description: 'Begin focused work sessions with motivational prompts',
    category: 'productivity',
    difficulty: 'intermediate',
    icon: Brain,
    gradient: 'from-indigo-400 to-purple-500',
    sensor: 'time.hour',
    operator: '==',
    value: 9,
    responseType: 'prompt',
    promptGuidelines: 'Help me start a focused work session. Suggest turning off distractions, setting a timer, and remind me of my most important task for today. Be motivating and clear.',
    responseTones: ['motivational', 'professional', 'focused'],
    priority: 7,
    cooldown: 3600,
    tags: ['focus', 'productivity', 'work'],
    estimatedSetupTime: '2 minutes',
    popularity: 71
  },

  // Environment Templates
  {
    id: 'weather-outfit-suggestion',
    name: 'Weather-Based Outfit',
    description: 'Get clothing suggestions based on current weather',
    category: 'environment',
    difficulty: 'beginner',
    icon: Thermometer,
    gradient: 'from-orange-400 to-red-500',
    sensor: 'weather.temperature',
    operator: '<',
    value: 10,
    responseType: 'template',
    message: 'Brrr! It\'s {weather.temperature}°C outside. Don\'t forget your warm coat and maybe some gloves! 🧥❄️',
    priority: 5,
    cooldown: 1800,
    tags: ['weather', 'clothing', 'temperature'],
    estimatedSetupTime: '2 minutes',
    popularity: 64
  },
  {
    id: 'air-quality-alert',
    name: 'Air Quality Warning',
    description: 'Get alerts when air quality is poor for outdoor activities',
    category: 'environment',
    difficulty: 'intermediate',
    icon: Wind,
    gradient: 'from-gray-400 to-slate-500',
    sensor: 'air_quality.aqi',
    operator: '>',
    value: 100,
    responseType: 'prompt',
    promptGuidelines: 'Warn me about poor air quality today. Suggest staying indoors or wearing a mask if I need to go out. Include the AQI number and be health-conscious.',
    responseTones: ['caring', 'informative'],
    priority: 8,
    cooldown: 3600,
    tags: ['air quality', 'health', 'environment'],
    estimatedSetupTime: '2 minutes',
    popularity: 58
  },

  // Social Templates
  {
    id: 'evening-reflection',
    name: 'Evening Reflection',
    description: 'End your day with thoughtful reflection prompts',
    category: 'social',
    difficulty: 'beginner',
    icon: Moon,
    gradient: 'from-indigo-400 to-purple-600',
    sensor: 'time.hour',
    operator: '==',
    value: 21,
    responseType: 'prompt',
    promptGuidelines: 'Help me reflect on my day. Ask about highlights, challenges, or things I\'m grateful for. Be warm, thoughtful, and encourage positive reflection.',
    responseTones: ['caring', 'thoughtful', 'warm'],
    priority: 5,
    cooldown: 3600,
    tags: ['reflection', 'evening', 'mindfulness'],
    estimatedSetupTime: '1 minute',
    popularity: 67
  },

  // Safety Templates
  {
    id: 'location-check-in',
    name: 'Safe Arrival Check',
    description: 'Confirm safe arrival at important locations',
    category: 'safety',
    difficulty: 'advanced',
    icon: MapPin,
    gradient: 'from-red-400 to-pink-500',
    sensor: 'location.current',
    operator: '==',
    value: 'work',
    responseType: 'template',
    message: 'Great! I see you\'ve arrived safely at work. Have a productive day! 🏢✨',
    priority: 6,
    cooldown: 1800,
    tags: ['location', 'safety', 'check-in'],
    estimatedSetupTime: '4 minutes',
    popularity: 45
  },

  // PROMPT TEMPLATE COUNTERPARTS FOR FIXED MESSAGE TEMPLATES
  {
    id: 'hydration-reminder-prompt',
    name: 'Smart Hydration Check-in',
    description: 'AI-powered hydration reminders that adapt to your day',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Droplets,
    gradient: 'from-blue-400 to-cyan-500',
    sensor: 'time.hour',
    operator: '==',
    value: 14,
    responseType: 'prompt',
    promptGuidelines: 'Remind me to stay hydrated in a friendly, personalized way. Consider the time of day, weather if available, and encourage healthy habits. Be caring and motivational.',
    responseTones: ['caring', 'encouraging', 'friendly'],
    priority: 4,
    cooldown: 7200,
    tags: ['health', 'hydration', 'reminders', 'AI'],
    estimatedSetupTime: '2 minutes',
    popularity: 78
  },
  {
    id: 'weather-outfit-prompt',
    name: 'AI Weather Stylist',
    description: 'Get personalized outfit suggestions based on weather conditions',
    category: 'environment',
    difficulty: 'beginner',
    icon: Thermometer,
    gradient: 'from-orange-400 to-red-500',
    sensor: 'weather.temperature',
    operator: '<',
    value: 10,
    responseType: 'prompt',
    promptGuidelines: 'Give me clothing suggestions based on the current weather. Include temperature, conditions, and practical advice. Be helpful and consider comfort and style.',
    responseTones: ['helpful', 'practical', 'friendly'],
    priority: 5,
    cooldown: 1800,
    tags: ['weather', 'clothing', 'temperature', 'AI'],
    estimatedSetupTime: '2 minutes',
    popularity: 68
  },
  {
    id: 'location-check-in-prompt',
    name: 'Smart Arrival Assistant',
    description: 'AI-powered location check-ins with contextual responses',
    category: 'safety',
    difficulty: 'advanced',
    icon: MapPin,
    gradient: 'from-red-400 to-pink-500',
    sensor: 'location.current',
    operator: '==',
    value: 'work',
    responseType: 'prompt',
    promptGuidelines: 'Acknowledge my safe arrival at this location. Be warm and encouraging, mention the location name, and wish me well for my time there. Consider the time of day.',
    responseTones: ['caring', 'encouraging', 'warm'],
    priority: 6,
    cooldown: 1800,
    tags: ['location', 'safety', 'check-in', 'AI'],
    estimatedSetupTime: '4 minutes',
    popularity: 52
  },

  // ADDITIONAL TEMPLATES FOR MISSING SENSORS
  
  // Weather sensors
  {
    id: 'weather-conditions-alert',
    name: 'Weather Conditions Update',
    description: 'Get notified about changing weather conditions',
    category: 'environment',
    difficulty: 'beginner',
    icon: Sun,
    gradient: 'from-yellow-400 to-orange-500',
    sensor: 'weather.conditions',
    operator: '==',
    value: 'rainy',
    responseType: 'prompt',
    promptGuidelines: 'Alert me about the current weather conditions. Give practical advice about what to expect and how to prepare. Be informative and helpful.',
    responseTones: ['informative', 'helpful', 'practical'],
    priority: 5,
    cooldown: 3600,
    tags: ['weather', 'conditions', 'alerts'],
    estimatedSetupTime: '2 minutes',
    popularity: 72
  },
  {
    id: 'humidity-comfort-check',
    name: 'Humidity Comfort Alert',
    description: 'Get notified when humidity levels affect comfort',
    category: 'environment',
    difficulty: 'intermediate',
    icon: Droplets,
    gradient: 'from-blue-300 to-teal-400',
    sensor: 'weather.humidity',
    operator: '>',
    value: 80,
    responseType: 'prompt',
    promptGuidelines: 'Alert me about high humidity levels. Suggest ways to stay comfortable and any precautions I should take. Be helpful and health-conscious.',
    responseTones: ['helpful', 'caring', 'informative'],
    priority: 4,
    cooldown: 3600,
    tags: ['humidity', 'comfort', 'health'],
    estimatedSetupTime: '2 minutes',
    popularity: 58
  },
  {
    id: 'pressure-weather-change',
    name: 'Barometric Pressure Alert',
    description: 'Get notified about pressure changes that might affect you',
    category: 'environment',
    difficulty: 'advanced',
    icon: Wind,
    gradient: 'from-gray-400 to-blue-500',
    sensor: 'weather.pressure',
    operator: '<',
    value: 1000,
    responseType: 'prompt',
    promptGuidelines: 'Alert me about low atmospheric pressure. Mention potential weather changes and any health considerations for sensitive individuals. Be informative.',
    responseTones: ['informative', 'caring', 'professional'],
    priority: 3,
    cooldown: 7200,
    tags: ['pressure', 'weather', 'health'],
    estimatedSetupTime: '3 minutes',
    popularity: 35
  },

  // Sleep sensors
  {
    id: 'sleep-quality-feedback',
    name: 'Sleep Quality Insights',
    description: 'Get feedback and tips based on your sleep quality',
    category: 'wellness',
    difficulty: 'intermediate',
    icon: Moon,
    gradient: 'from-purple-400 to-indigo-500',
    sensor: 'sleep.quality',
    operator: '==',
    value: 'poor',
    responseType: 'prompt',
    promptGuidelines: 'Acknowledge my poor sleep quality with empathy. Offer gentle suggestions for better sleep tonight and encourage self-care. Be supportive and understanding.',
    responseTones: ['empathetic', 'supportive', 'caring'],
    priority: 7,
    cooldown: 3600,
    tags: ['sleep', 'quality', 'wellness'],
    estimatedSetupTime: '2 minutes',
    popularity: 81
  },
  {
    id: 'sleep-duration-check',
    name: 'Sleep Duration Feedback',
    description: 'Get insights about your sleep duration patterns',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Clock,
    gradient: 'from-indigo-400 to-purple-500',
    sensor: 'sleep.duration',
    operator: '<',
    value: 6,
    responseType: 'prompt',
    promptGuidelines: 'Express concern about my short sleep duration. Offer gentle encouragement to prioritize rest and suggest ways to improve sleep habits. Be caring but not preachy.',
    responseTones: ['caring', 'encouraging', 'supportive'],
    priority: 7,
    cooldown: 3600,
    tags: ['sleep', 'duration', 'health'],
    estimatedSetupTime: '2 minutes',
    popularity: 75
  },
  {
    id: 'bedtime-routine-reminder',
    name: 'Bedtime Routine Helper',
    description: 'Get reminded to start your bedtime routine',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Moon,
    gradient: 'from-indigo-500 to-purple-600',
    sensor: 'sleep.bedtime',
    operator: '<=',
    value: 30,
    responseType: 'prompt',
    promptGuidelines: 'Gently remind me that bedtime is approaching. Suggest starting my bedtime routine and winding down. Be calm and soothing.',
    responseTones: ['calm', 'soothing', 'gentle'],
    priority: 6,
    cooldown: 3600,
    tags: ['bedtime', 'routine', 'sleep'],
    estimatedSetupTime: '2 minutes',
    popularity: 69
  },

  // Fitness sensors
  {
    id: 'heart-rate-zone-alert',
    name: 'Heart Rate Zone Monitor',
    description: 'Get alerts when your heart rate enters specific zones',
    category: 'wellness',
    difficulty: 'intermediate',
    icon: Heart,
    gradient: 'from-red-400 to-pink-500',
    sensor: 'fitness.heartRate',
    operator: '>',
    value: 150,
    responseType: 'prompt',
    promptGuidelines: 'Alert me about my elevated heart rate. Provide context about heart rate zones and suggest appropriate actions. Be informative and health-focused.',
    responseTones: ['informative', 'caring', 'professional'],
    priority: 8,
    cooldown: 1800,
    tags: ['heart rate', 'fitness', 'health'],
    estimatedSetupTime: '3 minutes',
    popularity: 64
  },
  {
    id: 'activity-encouragement',
    name: 'Activity Level Motivator',
    description: 'Get motivated based on your current activity level',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Activity,
    gradient: 'from-green-400 to-blue-500',
    sensor: 'fitness.activity',
    operator: '==',
    value: 'sedentary',
    responseType: 'prompt',
    promptGuidelines: 'Gently encourage me to be more active since I\'ve been sedentary. Suggest simple activities or movement breaks. Be motivating but not pushy.',
    responseTones: ['encouraging', 'motivational', 'gentle'],
    priority: 5,
    cooldown: 3600,
    tags: ['activity', 'movement', 'motivation'],
    estimatedSetupTime: '2 minutes',
    popularity: 73
  },
  {
    id: 'calorie-milestone',
    name: 'Calorie Burn Celebration',
    description: 'Celebrate reaching calorie burn milestones',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Star,
    gradient: 'from-orange-400 to-red-500',
    sensor: 'fitness.calories',
    operator: '>=',
    value: 500,
    responseType: 'prompt',
    promptGuidelines: 'Celebrate my calorie burn achievement! Be enthusiastic and encouraging. Mention the milestone and motivate me to keep up the great work.',
    responseTones: ['celebratory', 'enthusiastic', 'motivational'],
    priority: 6,
    cooldown: 3600,
    tags: ['calories', 'fitness', 'achievement'],
    estimatedSetupTime: '2 minutes',
    popularity: 67
  },
  {
    id: 'distance-tracker',
    name: 'Distance Achievement Alert',
    description: 'Get notified when you reach distance goals',
    category: 'wellness',
    difficulty: 'beginner',
    icon: TrendingUp,
    gradient: 'from-blue-400 to-green-500',
    sensor: 'fitness.distance',
    operator: '>=',
    value: 5,
    responseType: 'prompt',
    promptGuidelines: 'Congratulate me on reaching my distance goal! Be proud and encouraging. Mention the achievement and inspire me to keep moving.',
    responseTones: ['proud', 'encouraging', 'celebratory'],
    priority: 6,
    cooldown: 3600,
    tags: ['distance', 'goals', 'achievement'],
    estimatedSetupTime: '2 minutes',
    popularity: 61
  },

  // Location sensors
  {
    id: 'movement-status-update',
    name: 'Movement Status Tracker',
    description: 'Get updates about your movement patterns',
    category: 'personal',
    difficulty: 'intermediate',
    icon: Activity,
    gradient: 'from-green-400 to-teal-500',
    sensor: 'location.movement',
    operator: '==',
    value: 'walking',
    responseType: 'prompt',
    promptGuidelines: 'Acknowledge that I\'m walking and encourage this healthy activity. Be positive and supportive of my movement. Maybe suggest enjoying the journey.',
    responseTones: ['encouraging', 'positive', 'supportive'],
    priority: 4,
    cooldown: 3600,
    tags: ['movement', 'walking', 'health'],
    estimatedSetupTime: '2 minutes',
    popularity: 56
  },
  {
    id: 'city-location-welcome',
    name: 'City Welcome Message',
    description: 'Get welcomed when you arrive in a new city',
    category: 'personal',
    difficulty: 'intermediate',
    icon: MapPin,
    gradient: 'from-purple-400 to-pink-500',
    sensor: 'location.city',
    operator: '!=',
    value: 'home_city',
    responseType: 'prompt',
    promptGuidelines: 'Welcome me to this new city! Be excited and helpful. Suggest things to explore or enjoy about being in a new place. Be warm and encouraging.',
    responseTones: ['welcoming', 'excited', 'helpful'],
    priority: 5,
    cooldown: 7200,
    tags: ['travel', 'city', 'exploration'],
    estimatedSetupTime: '3 minutes',
    popularity: 48
  },

  // Air quality sensors
  {
    id: 'pm25-health-alert',
    name: 'PM2.5 Health Warning',
    description: 'Get health alerts for PM2.5 pollution levels',
    category: 'environment',
    difficulty: 'intermediate',
    icon: Shield,
    gradient: 'from-yellow-400 to-orange-500',
    sensor: 'air_quality.pm25',
    operator: '>',
    value: 35,
    responseType: 'prompt',
    promptGuidelines: 'Alert me about elevated PM2.5 levels. Explain health implications and suggest protective measures like wearing a mask or staying indoors. Be health-focused and caring.',
    responseTones: ['caring', 'informative', 'protective'],
    priority: 8,
    cooldown: 3600,
    tags: ['air quality', 'PM2.5', 'health'],
    estimatedSetupTime: '3 minutes',
    popularity: 54
  },

  // Soil moisture sensor
  {
    id: 'plant-care-reminder',
    name: 'Plant Care Assistant',
    description: 'Get reminded when your plants need attention',
    category: 'environment',
    difficulty: 'beginner',
    icon: Droplets,
    gradient: 'from-green-400 to-blue-500',
    sensor: 'soil_moisture.value',
    operator: '<',
    value: 30,
    responseType: 'prompt',
    promptGuidelines: 'Alert me that my plants need watering based on soil moisture levels. Be caring about plant health and give gentle reminders about plant care. Be nurturing.',
    responseTones: ['nurturing', 'caring', 'gentle'],
    priority: 5,
    cooldown: 7200,
    tags: ['plants', 'gardening', 'care'],
    estimatedSetupTime: '2 minutes',
    popularity: 43
  },

  // Calendar sensors
  {
    id: 'event-type-preparation',
    name: 'Event Type Preparation',
    description: 'Get preparation tips based on your next event type',
    category: 'productivity',
    difficulty: 'intermediate',
    icon: Calendar,
    gradient: 'from-blue-400 to-purple-500',
    sensor: 'calendar.nextEvent',
    operator: '==',
    value: 'appointment',
    responseType: 'prompt',
    promptGuidelines: 'Help me prepare for my upcoming appointment. Give relevant preparation tips and reminders. Be helpful and organized.',
    responseTones: ['helpful', 'organized', 'professional'],
    priority: 7,
    cooldown: 1800,
    tags: ['calendar', 'appointments', 'preparation'],
    estimatedSetupTime: '3 minutes',
    popularity: 59
  },

  // Time-based sensors
  {
    id: 'hourly-check-in',
    name: 'Hourly Wellness Check',
    description: 'Regular check-ins throughout your day',
    category: 'wellness',
    difficulty: 'beginner',
    icon: Clock,
    gradient: 'from-purple-400 to-blue-500',
    sensor: 'time.hour',
    operator: '==',
    value: 12,
    responseType: 'prompt',
    promptGuidelines: 'Check in with me at midday. Ask how I\'m feeling, remind me to take breaks, and encourage healthy habits. Be caring and supportive.',
    responseTones: ['caring', 'supportive', 'encouraging'],
    priority: 4,
    cooldown: 3600,
    tags: ['check-in', 'wellness', 'midday'],
    estimatedSetupTime: '1 minute',
    popularity: 71
  },
  {
    id: 'weekend-motivation',
    name: 'Weekend Motivation',
    description: 'Special weekend encouragement and activity suggestions',
    category: 'social',
    difficulty: 'beginner',
    icon: Star,
    gradient: 'from-yellow-400 to-pink-500',
    sensor: 'time.day_of_week',
    operator: '==',
    value: 'saturday',
    responseType: 'prompt',
    promptGuidelines: 'Celebrate that it\'s the weekend! Suggest fun activities, encourage relaxation or adventure. Be upbeat and excited about weekend possibilities.',
    responseTones: ['upbeat', 'excited', 'encouraging'],
    priority: 5,
    cooldown: 86400,
    tags: ['weekend', 'motivation', 'fun'],
    estimatedSetupTime: '2 minutes',
    popularity: 78
  },

  // News sensor
  {
    id: 'news-discussion',
    name: 'News Discussion Starter',
    description: 'Engage in thoughtful discussions about current events',
    category: 'social',
    difficulty: 'advanced',
    icon: MessageCircle,
    gradient: 'from-blue-400 to-indigo-500',
    sensor: 'news',
    operator: 'contains',
    value: 'technology',
    responseType: 'prompt',
    promptGuidelines: 'Start a thoughtful conversation about this news topic. Ask for my thoughts, provide context, and encourage critical thinking. Be engaging and intellectually curious.',
    responseTones: ['thoughtful', 'engaging', 'curious'],
    priority: 4,
    cooldown: 7200,
    tags: ['news', 'discussion', 'current events'],
    estimatedSetupTime: '4 minutes',
    popularity: 41
  },

  // ADDITIONAL TEMPLATES FOR REMAINING SENSORS
  
  // Sleep stage sensor
  {
    id: 'sleep-stage-optimization',
    name: 'Sleep Stage Insights',
    description: 'Get insights about your sleep stages for better rest',
    category: 'wellness',
    difficulty: 'advanced',
    icon: Moon,
    gradient: 'from-purple-500 to-indigo-600',
    sensor: 'sleep.stage',
    operator: '==',
    value: 'rem',
    responseType: 'prompt',
    promptGuidelines: 'Provide insights about my current sleep stage. Explain what REM sleep means for recovery and cognitive function. Be educational and encouraging about healthy sleep.',
    responseTones: ['educational', 'encouraging', 'informative'],
    priority: 3,
    cooldown: 7200,
    tags: ['sleep', 'stages', 'recovery'],
    estimatedSetupTime: '3 minutes',
    popularity: 38
  },

  // Calendar time until next event
  {
    id: 'event-countdown-alert',
    name: 'Event Countdown Reminder',
    description: 'Get time-sensitive reminders for upcoming events',
    category: 'productivity',
    difficulty: 'intermediate',
    icon: Bell,
    gradient: 'from-yellow-400 to-orange-500',
    sensor: 'calendar.timeUntilNext',
    operator: '<=',
    value: 30,
    responseType: 'prompt',
    promptGuidelines: 'Alert me that my next event is coming up soon. Help me prepare and transition from my current activity. Be helpful and time-conscious.',
    responseTones: ['helpful', 'urgent', 'organized'],
    priority: 8,
    cooldown: 900,
    tags: ['calendar', 'countdown', 'preparation'],
    estimatedSetupTime: '3 minutes',
    popularity: 76
  },

  // Location place sensor
  {
    id: 'place-context-awareness',
    name: 'Place-Based Suggestions',
    description: 'Get contextual suggestions based on your current place',
    category: 'personal',
    difficulty: 'intermediate',
    icon: MapPin,
    gradient: 'from-green-400 to-blue-500',
    sensor: 'location.place',
    operator: '==',
    value: 'gym',
    responseType: 'prompt',
    promptGuidelines: 'Acknowledge that I\'m at the gym and provide motivational support for my workout. Encourage me to make the most of my time here and stay focused on my fitness goals.',
    responseTones: ['motivational', 'energetic', 'supportive'],
    priority: 6,
    cooldown: 3600,
    tags: ['location', 'gym', 'motivation'],
    estimatedSetupTime: '2 minutes',
    popularity: 63
  },

  // Location weather sensor
  {
    id: 'location-weather-advisory',
    name: 'Location Weather Update',
    description: 'Get weather updates specific to your current location',
    category: 'environment',
    difficulty: 'beginner',
    icon: Sun,
    gradient: 'from-yellow-400 to-orange-500',
    sensor: 'location.weather',
    operator: '==',
    value: 'sunny',
    responseType: 'prompt',
    promptGuidelines: 'Comment on the beautiful sunny weather at my location. Suggest activities I might enjoy or remind me about sun protection. Be upbeat and weather-aware.',
    responseTones: ['upbeat', 'cheerful', 'helpful'],
    priority: 4,
    cooldown: 3600,
    tags: ['location', 'weather', 'sunny'],
    estimatedSetupTime: '2 minutes',
    popularity: 55
  },

  // Time minute sensor
  {
    id: 'precise-timing-reminder',
    name: 'Precise Timing Alert',
    description: 'Get alerts at specific minute intervals for precise timing',
    category: 'productivity',
    difficulty: 'advanced',
    icon: Clock,
    gradient: 'from-blue-400 to-purple-500',
    sensor: 'time.minute',
    operator: '==',
    value: 0,
    responseType: 'prompt',
    promptGuidelines: 'Mark the top of the hour with a brief check-in. Ask how I\'m doing and if I need to refocus or take a break. Be brief and supportive.',
    responseTones: ['brief', 'supportive', 'focused'],
    priority: 3,
    cooldown: 3600,
    tags: ['timing', 'hourly', 'check-in'],
    estimatedSetupTime: '2 minutes',
    popularity: 29
  },

  // Sleep wake time analysis
  {
    id: 'wake-time-analysis',
    name: 'Wake Time Pattern Analysis',
    description: 'Get insights about your wake time patterns',
    category: 'wellness',
    difficulty: 'intermediate',
    icon: Sun,
    gradient: 'from-yellow-400 to-orange-500',
    sensor: 'sleep.wakeTime',
    operator: '>',
    value: '08:00',
    responseType: 'prompt',
    promptGuidelines: 'Acknowledge that I woke up later than usual. Be understanding and help me start the day positively without judgment. Suggest ways to make the most of the remaining day.',
    responseTones: ['understanding', 'positive', 'encouraging'],
    priority: 5,
    cooldown: 3600,
    tags: ['wake time', 'sleep', 'morning'],
    estimatedSetupTime: '2 minutes',
    popularity: 52
  }
]

export function RuleTemplateLibrary({ availableSenses, onApplyTemplate, onClose }: RuleTemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'difficulty'>('popularity')

  // Filter templates based on available senses and user filters
  const filteredTemplates = useMemo(() => {
    let filtered = RULE_TEMPLATES.filter(template => {
      // Check if sensor is available
      const sensorBase = template.sensor.split('.')[0]
      const sensorAvailable = availableSenses.includes(template.sensor) || 
                             availableSenses.includes(sensorBase!)

      if (!sensorAvailable) return false

      // Apply search filter
      if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !template.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false
      }

      // Apply category filter
      if (selectedCategory !== 'all' && template.category !== selectedCategory) return false

      // Apply difficulty filter
      if (selectedDifficulty !== 'all' && template.difficulty !== selectedDifficulty) return false

      return true
    })

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'name':
          return a.name.localeCompare(b.name)
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        default:
          return 0
      }
    })

    return filtered
  }, [availableSenses, searchTerm, selectedCategory, selectedDifficulty, sortBy])

  const categories = [
    { id: 'all', name: 'All Categories', icon: Star },
    { id: 'wellness', name: 'Wellness', icon: Heart },
    { id: 'productivity', name: 'Productivity', icon: TrendingUp },
    { id: 'environment', name: 'Environment', icon: Thermometer },
    { id: 'social', name: 'Social', icon: MessageCircle },
    { id: 'safety', name: 'Safety', icon: Shield }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Rule Template Library
          </h2>
          <p className="text-gray-600 mt-1">
            Choose from {filteredTemplates.length} pre-built rule templates to get started quickly
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="popularity">Most Popular</option>
          <option value="name">Name A-Z</option>
          <option value="difficulty">Difficulty</option>
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No templates found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const Icon = template.icon
            const sensorConfig = getSensorConfig(template.sensor)

            return (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-300 cursor-pointer group"
                onClick={() => onApplyTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      `bg-gradient-to-r ${template.gradient}`
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {template.popularity}%
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-purple-700 transition-colors">
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Template Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{template.estimatedSetupTime} setup</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      {sensorConfig?.icon && <span>{sensorConfig.icon}</span>}
                      <span className="text-gray-600">
                        Uses {sensorConfig?.name || template.sensor}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Apply Button */}
                  <Button 
                    className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Use This Template
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}