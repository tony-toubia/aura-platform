// apps/web/components/aura/creation-wizard/steps/welcome-step.tsx

"use client"

import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCreationContext } from '@/hooks/use-creation-context'
import { useContextualHelp } from '@/components/help/contextual-help-provider'
import {
  Sparkles,
  Bot,
  Heart,
  Zap,
  ArrowRight,
  Clock,
  Star,
  Users,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickStartOption {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  recommended?: boolean
  onSelect: () => void
}

export function WelcomeStep() {
  const { nextStep, updateConfiguration, updateContext } = useCreationContext()
  const { showTip, shouldShowTip, userProgress } = useContextualHelp()

  // Auto-show welcome tip for new users (only once)
  useEffect(() => {
    const hasShownWelcome = userProgress.completedTips.includes('welcome-to-aura') ||
                           userProgress.skippedTips.includes('welcome-to-aura')
    
    if (!hasShownWelcome && shouldShowTip('welcome-to-aura')) {
      const timer = setTimeout(() => {
        showTip('welcome-to-aura')
      }, 1000) // Show after 1 second to let the page load

      return () => clearTimeout(timer)
    }
  }, [showTip, shouldShowTip, userProgress.completedTips, userProgress.skippedTips])

  const quickStartOptions: QuickStartOption[] = [
    {
      id: 'ai-companion',
      title: 'AI Companion',
      description: 'A friendly, conversational AI that learns your preferences and provides emotional support',
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      estimatedTime: '5 minutes',
      difficulty: 'easy',
      recommended: true,
      onSelect: () => {
        updateConfiguration({
          name: 'Companion',
          vesselType: 'digital',
          personality: {
            warmth: 80,
            playfulness: 60,
            verbosity: 50,
            empathy: 90,
            creativity: 70,
            persona: 'supportive companion',
            tone: 'casual',
            vocabulary: 'average',
            quirks: ['uses encouraging emojis', 'remembers important dates']
          }
        })
        updateContext({ method: 'ai' })
        nextStep()
      }
    },
    {
      id: 'productivity-assistant',
      title: 'Productivity Assistant',
      description: 'A focused AI that helps with task management, scheduling, and goal achievement',
      icon: Zap,
      gradient: 'from-blue-500 to-indigo-500',
      estimatedTime: '7 minutes',
      difficulty: 'medium',
      onSelect: () => {
        updateConfiguration({
          name: 'Assistant',
          vesselType: 'digital',
          personality: {
            warmth: 50,
            playfulness: 30,
            verbosity: 40,
            empathy: 60,
            creativity: 50,
            persona: 'efficient assistant',
            tone: 'formal',
            vocabulary: 'scholarly',
            quirks: ['provides structured responses', 'suggests optimizations']
          }
        })
        updateContext({ method: 'ai' })
        nextStep()
      }
    },
    {
      id: 'creative-muse',
      title: 'Creative Muse',
      description: 'An imaginative AI that inspires creativity and helps with artistic projects',
      icon: Lightbulb,
      gradient: 'from-purple-500 to-pink-500',
      estimatedTime: '6 minutes',
      difficulty: 'medium',
      onSelect: () => {
        updateConfiguration({
          name: 'Muse',
          vesselType: 'digital',
          personality: {
            warmth: 70,
            playfulness: 90,
            verbosity: 70,
            empathy: 70,
            creativity: 95,
            persona: 'artistic inspiration',
            tone: 'poetic',
            vocabulary: 'average',
            quirks: ['uses metaphors', 'suggests creative exercises']
          }
        })
        updateContext({ method: 'ai' })
        nextStep()
      }
    },
    {
      id: 'custom-build',
      title: 'Custom Build',
      description: 'Start from scratch and build exactly what you want with full customization',
      icon: Bot,
      gradient: 'from-emerald-500 to-teal-500',
      estimatedTime: '15+ minutes',
      difficulty: 'hard',
      onSelect: () => {
        nextStep()
      }
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-bounce delay-300">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create Your Perfect Aura
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Welcome to the future of AI companionship. Design a unique digital being that understands you, 
            learns from you, and grows with you. Your Aura will be as individual as you are.
          </p>
        </div>
      </div>

      {/* Quick Start Options */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Start Templates</h2>
          <p className="text-gray-600">Choose a template to get started quickly, or build from scratch</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickStartOptions.map((option) => {
            const Icon = option.icon
            const isRecommended = option.recommended

            return (
              <Card
                key={option.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 group",
                  isRecommended 
                    ? "border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50" 
                    : "border-gray-200 hover:border-purple-300"
                )}
                onClick={option.onSelect}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                      `bg-gradient-to-r ${option.gradient}`
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {isRecommended && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                          <Star className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {option.estimatedTime}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
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
                    
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features Preview */}
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">What Makes Aura Special?</h3>
            <p className="text-gray-600">Every Aura is unique, just like you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Emotional Intelligence</h4>
              <p className="text-sm text-gray-600">
                Your Aura understands emotions and responds with empathy and care
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Adaptive Learning</h4>
              <p className="text-sm text-gray-600">
                Continuously learns from your interactions to become more helpful over time
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Personal Connection</h4>
              <p className="text-sm text-gray-600">
                Forms genuine connections and remembers what matters most to you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-gray-600 mb-6">
          Ready to begin this incredible journey? Choose a template above or start building from scratch.
        </p>
        <Button
          onClick={nextStep}
          size="lg"
          className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          data-help="create-aura-button"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start Creating
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}