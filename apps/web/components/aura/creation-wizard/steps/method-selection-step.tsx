// apps/web/components/aura/creation-wizard/steps/method-selection-step.tsx

"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCreationContext } from '@/hooks/use-creation-context'
import {
  Bot,
  Settings,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Zap,
  Heart,
  Brain,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreationMethod } from '@/types/creation-wizard'

interface MethodOption {
  id: CreationMethod
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  features: string[]
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  recommended?: boolean
  badge?: string
}

export function MethodSelectionStep() {
  const { method, updateContext } = useCreationContext()

  const methodOptions: MethodOption[] = [
    {
      id: 'ai',
      title: 'AI-Guided Creation',
      subtitle: 'Let our AI assistant guide you',
      description: 'Have a natural conversation with our AI assistant who will ask thoughtful questions and make personalized recommendations based on your responses. Perfect for first-time users or anyone who wants a guided experience.',
      icon: Bot,
      gradient: 'from-purple-500 to-blue-500',
      features: [
        'Natural conversation interface',
        'Personalized recommendations',
        'Smart configuration suggestions',
        'Learns from your preferences',
        'Quick setup process'
      ],
      estimatedTime: '5-10 minutes',
      difficulty: 'easy',
      recommended: true,
      badge: 'Most Popular'
    },
    {
      id: 'manual',
      title: 'Manual Configuration',
      subtitle: 'Full control over every detail',
      description: 'Configure every aspect of your Aura manually with detailed forms and advanced options. Ideal for experienced users who want precise control over personality traits, behaviors, and capabilities.',
      icon: Settings,
      gradient: 'from-emerald-500 to-teal-500',
      features: [
        'Complete customization control',
        'Advanced configuration options',
        'Detailed personality sliders',
        'Custom behavior rules',
        'Professional-grade settings'
      ],
      estimatedTime: '15-30 minutes',
      difficulty: 'hard',
      badge: 'Advanced'
    },
    {
      id: 'hybrid',
      title: 'Hybrid Approach',
      subtitle: 'Best of both worlds',
      description: 'Start with AI guidance for the basics, then switch to manual mode for fine-tuning. This approach combines the convenience of AI assistance with the precision of manual control.',
      icon: Brain,
      gradient: 'from-indigo-500 to-purple-500',
      features: [
        'AI-guided foundation',
        'Manual fine-tuning',
        'Flexible switching',
        'Balanced approach',
        'Optimal for most users'
      ],
      estimatedTime: '10-20 minutes',
      difficulty: 'medium',
      badge: 'Balanced'
    }
  ]

  const handleMethodSelect = (selectedMethod: CreationMethod) => {
    updateContext({ method: selectedMethod })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Choose Your Creation Method
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          How would you like to create your Aura? Each method offers a different experience 
          tailored to your preferences and expertise level.
        </p>
      </div>

      {/* Method Options */}
      <div className="space-y-6">
        {methodOptions.map((option) => {
          const Icon = option.icon
          const isSelected = method === option.id
          const isRecommended = option.recommended

          return (
            <Card
              key={option.id}
              className={cn(
                "cursor-pointer transition-all duration-300 border-2 group",
                isSelected
                  ? "border-purple-500 bg-purple-50 shadow-lg scale-105"
                  : "border-gray-200 hover:border-purple-300 hover:shadow-md hover:scale-102"
              )}
              onClick={() => handleMethodSelect(option.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                    `bg-gradient-to-r ${option.gradient}`,
                    isSelected ? "scale-110" : "group-hover:scale-105"
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={cn(
                            "text-xl font-bold transition-colors",
                            isSelected ? "text-purple-700" : "text-gray-900 group-hover:text-purple-700"
                          )}>
                            {option.title}
                          </h3>
                          {isRecommended && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                              <Star className="w-3 h-3 mr-1" />
                              {option.badge}
                            </Badge>
                          )}
                          {!isRecommended && option.badge && (
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-2">
                          {option.subtitle}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          {option.description}
                        </p>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            `bg-gradient-to-r ${option.gradient}`
                          )} />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {option.estimatedTime}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            option.difficulty === 'easy' && "border-green-300 text-green-700",
                            option.difficulty === 'medium' && "border-yellow-300 text-yellow-700",
                            option.difficulty === 'hard' && "border-red-300 text-red-700"
                          )}
                        >
                          {option.difficulty.charAt(0).toUpperCase() + option.difficulty.slice(1)}
                        </Badge>
                      </div>

                      {isSelected && (
                        <Button
                          size="sm"
                          className={cn(
                            "transition-all duration-300",
                            `bg-gradient-to-r ${option.gradient} hover:opacity-90`
                          )}
                        >
                          Selected
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>First time?</strong> Try AI-guided for the best experience</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Want control?</strong> Manual gives you complete freedom</span>
                </div>
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Can't decide?</strong> Hybrid combines both approaches</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Don't worry - you can switch between methods at any time during the creation process
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}