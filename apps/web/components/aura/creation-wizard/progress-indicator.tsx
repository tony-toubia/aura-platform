// apps/web/components/aura/creation-wizard/progress-indicator.tsx

"use client"

import React from 'react'
import { useCreationContext } from '@/hooks/use-creation-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Sparkles,
  Target,
  Globe,
  Settings,
  Eye,
  PartyPopper
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreationStep } from '@/types/creation-wizard'

interface StepInfo {
  id: CreationStep
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export function ProgressIndicator() {
  const { step, progress, goToStep, canGoNext, canGoPrev } = useCreationContext()

  const steps: StepInfo[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Getting started',
      icon: Sparkles,
      color: 'text-purple-600'
    },
    {
      id: 'method',
      title: 'Method',
      description: 'Choose approach',
      icon: Target,
      color: 'text-indigo-600'
    },
    {
      id: 'vessel',
      title: 'Vessel',
      description: 'Select vessel type',
      icon: Globe,
      color: 'text-emerald-600'
    },
    {
      id: 'config',
      title: 'Configure',
      description: 'Set up personality',
      icon: Settings,
      color: 'text-blue-600'
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Final check',
      icon: Eye,
      color: 'text-amber-600'
    },
    {
      id: 'success',
      title: 'Complete',
      description: 'Aura created!',
      icon: PartyPopper,
      color: 'text-green-600'
    }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex) return 'current'
    return 'upcoming'
  }

  const canNavigateToStep = (stepIndex: number) => {
    // Can navigate to completed steps or current step
    return stepIndex <= currentStepIndex
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((stepInfo, index) => {
            const status = getStepStatus(index)
            const Icon = stepInfo.icon
            const canNavigate = canNavigateToStep(index)

            return (
              <div key={stepInfo.id} className="flex items-center gap-4">
                {/* Step Indicator */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-10 h-10 rounded-full p-0 transition-all duration-200",
                    status === 'completed' && "bg-green-100 hover:bg-green-200",
                    status === 'current' && "bg-purple-100 hover:bg-purple-200 ring-2 ring-purple-300",
                    status === 'upcoming' && "bg-gray-100 hover:bg-gray-200",
                    canNavigate && "cursor-pointer",
                    !canNavigate && "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => canNavigate && goToStep(stepInfo.id)}
                  disabled={!canNavigate}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : status === 'current' ? (
                    <Icon className={cn("w-5 h-5", stepInfo.color)} />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </Button>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-medium transition-colors",
                      status === 'completed' && "text-green-700",
                      status === 'current' && "text-purple-700",
                      status === 'upcoming' && "text-gray-500"
                    )}>
                      {stepInfo.title}
                    </h3>
                    {status === 'current' && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className={cn(
                    "text-sm transition-colors",
                    status === 'completed' && "text-green-600",
                    status === 'current' && "text-purple-600",
                    status === 'upcoming' && "text-gray-400"
                  )}>
                    {stepInfo.description}
                  </p>
                </div>

                {/* Navigation Arrow */}
                {index < steps.length - 1 && (
                  <ArrowRight className={cn(
                    "w-4 h-4 transition-colors",
                    status === 'completed' && "text-green-400",
                    status === 'current' && "text-purple-400",
                    status === 'upcoming' && "text-gray-300"
                  )} />
                )}
              </div>
            )
          })}
        </div>

        {/* Current Step Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              {React.createElement(steps[currentStepIndex]?.icon || Sparkles, {
                className: "w-4 h-4 text-white"
              })}
            </div>
            <div>
              <h4 className="font-medium text-purple-900">
                Current: {steps[currentStepIndex]?.title}
              </h4>
              <p className="text-sm text-purple-700">
                {steps[currentStepIndex]?.description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}