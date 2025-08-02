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
    sensor: 'sleep.wake_time',
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