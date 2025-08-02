// apps/web/components/aura/creation-wizard/steps/configuration-step.tsx

"use client"

import React from 'react'
import { useCreationContext } from '@/hooks/use-creation-context'
import { AuraConfigurationAgent } from '@/components/aura/aura-configuration-agent'
import { AuraConfigurationForm } from '@/components/aura/aura-configuration-form'
import { EnhancedRuleBuilder } from '@/components/aura/rule-builder/enhanced-rule-builder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Settings,
  Sparkles,
  ArrowRight,
  Zap,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LocationConfig } from '@/components/aura/sense-location-modal'
import type { BehaviorRule } from '@/types'

export function ConfigurationStep() {
  const creationContext = useCreationContext()
  const { method, vessel, configuration, updateConfiguration, updateContext } = creationContext

  // If no method selected, show method selection within config step
  if (!method) {
    return <InlineMethodSelection />
  }

  // Convert our configuration format to what the existing components expect
  const auraData = {
    id: configuration.id,
    name: configuration.name,
    vesselType: configuration.vesselType,
    vesselCode: configuration.vesselCode,
    personality: configuration.personality,
    senses: configuration.senses.map(sense => {
      // Convert string senses to SenseId format expected by form
      return sense.replace(/\./g, '_').toLowerCase() as any
    }),
    selectedStudyId: undefined,
    selectedIndividualId: undefined,
    rules: configuration.rules.map(rule => ({
      id: rule.id || `rule-${Date.now()}-${Math.random()}`,
      name: rule.name,
      trigger: rule.trigger,
      action: rule.action,
      priority: rule.priority || 1,
      enabled: rule.enabled,
      auraId: configuration.id || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  }

  const handleAuraDataChange = (updates: any) => {
    updateConfiguration(updates)
  }

  const handleLocationConfigChange = (senseId: string, config: LocationConfig) => {
    // Handle location config changes
    console.log('Location config changed:', senseId, config)
  }

  if (method === 'ai') {
    return (
      <div className="space-y-6">
        {/* AI Mode Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
            <Bot className="w-4 h-4" />
            AI-Guided Configuration
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Let's Create Your Perfect Aura Together
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            I'll guide you through creating {configuration.name || 'your Aura'} with personalized questions 
            and smart recommendations based on your preferences.
          </p>
        </div>

        {/* AI Configuration Component */}
        <AuraConfigurationAgent
          onConfigurationComplete={(config) => {
            // Convert AI config to our format
            updateConfiguration({
              name: config.name,
              vesselType: config.vesselType,
              vesselCode: config.vesselCode,
              personality: config.personality,
              senses: config.availableSenses || [],
              rules: (config.rules || []).map(rule => ({
                id: rule.id,
                name: rule.name,
                trigger: rule.trigger,
                action: rule.action,
                priority: rule.priority || 1,
                enabled: rule.enabled
              }))
            })
          }}
          onConfigurationUpdate={(partialConfig) => {
            // Handle real-time updates during AI conversation
            const updates: any = {}
            if (partialConfig.name) updates.name = partialConfig.name
            if (partialConfig.personality) updates.personality = partialConfig.personality
            if (partialConfig.availableSenses) updates.senses = partialConfig.availableSenses
            if (partialConfig.rules) {
              updates.rules = partialConfig.rules.map(rule => ({
                id: rule.id,
                name: rule.name,
                trigger: rule.trigger,
                action: rule.action,
                priority: rule.priority || 1,
                enabled: rule.enabled
              }))
            }
            updateConfiguration(updates)
          }}
          initialConfig={{
            name: configuration.name,
            vesselType: configuration.vesselType,
            vesselCode: configuration.vesselCode,
            personality: configuration.personality,
            availableSenses: configuration.senses,
            rules: configuration.rules.map(rule => ({
              id: rule.id || `rule-${Date.now()}-${Math.random()}`,
              name: rule.name,
              trigger: rule.trigger,
              action: rule.action,
              priority: rule.priority,
              enabled: rule.enabled,
              auraId: configuration.id || '',
              createdAt: new Date(),
              updatedAt: new Date()
            }))
          }}
          availableSenses={[
            'weather', 'news', 'air_quality', 'fitness.steps', 'fitness.heart_rate',
            'sleep.duration', 'sleep.quality', 'calendar.next_meeting', 'location.current'
          ]}
          isEditMode={false}
        />

        {/* Mode Switch Option */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Want more control?</p>
                  <p className="text-sm text-gray-600">Switch to manual configuration for detailed customization</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateContext({ method: 'manual' })}
              >
                Switch to Manual
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (method === 'manual') {
    return (
      <div className="space-y-6">
        {/* Manual Mode Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full">
            <Settings className="w-4 h-4" />
            Manual Configuration
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configure Every Detail
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take full control over {configuration.name || 'your Aura\'s'} personality, senses, and behavior rules.
            Perfect for users who want precise customization.
          </p>
        </div>

        {/* Manual Configuration Form */}
        <AuraConfigurationForm
          auraData={auraData}
          locationConfigs={{}}
          onAuraDataChange={handleAuraDataChange}
          onLocationConfigChange={handleLocationConfigChange}
          autoSaveBeforeRules={true}
          initialStep="details" // Start with personality first
          showStepNavigation={true}
          showSaveButton={false}
          title=""
          description=""
          onSave={async () => {
            // Save the aura first to get a real ID before allowing rules
            try {
              const auraId = await creationContext.saveProgress()
              if (auraId) {
                updateConfiguration({ id: auraId })
              }
            } catch (error) {
              console.error('Failed to save aura:', error)
              throw error
            }
          }}
        />

        {/* Mode Switch Option */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Need guidance?</p>
                  <p className="text-sm text-gray-600">Switch to AI-guided mode for personalized recommendations</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateContext({ method: 'ai' })}
              >
                Switch to AI Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fallback - should not reach here
  return <InlineMethodSelection />
}

function InlineMethodSelection() {
  const { updateContext } = useCreationContext()

  const methods = [
    {
      id: 'ai' as const,
      title: 'AI-Guided',
      description: 'Let our AI assistant guide you with smart recommendations',
      icon: Bot,
      gradient: 'from-purple-500 to-blue-500',
      badge: 'Recommended',
      features: ['Natural conversation', 'Smart suggestions', 'Quick setup']
    },
    {
      id: 'manual' as const,
      title: 'Manual Setup',
      description: 'Configure every detail with full control and advanced options',
      icon: Settings,
      gradient: 'from-emerald-500 to-teal-500',
      badge: 'Advanced',
      features: ['Complete control', 'Advanced options', 'Detailed customization']
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Your Configuration Method
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          How would you like to set up your Aura? You can switch between methods at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => {
          const Icon = method.icon
          return (
            <Card
              key={method.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-purple-300"
              onClick={() => updateContext({ method: method.id })}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    `bg-gradient-to-r ${method.gradient}`
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{method.title}</h3>
                      <Badge className={cn(
                        "text-xs",
                        method.id === 'ai' 
                          ? "bg-purple-100 text-purple-700 border-purple-300"
                          : "bg-emerald-100 text-emerald-700 border-emerald-300"
                      )}>
                        {method.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {method.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        `bg-gradient-to-r ${method.gradient}`
                      )} />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button className={cn(
                  "w-full",
                  `bg-gradient-to-r ${method.gradient} hover:opacity-90`
                )}>
                  Choose {method.title}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Configuration Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>AI-guided is perfect for first-time users</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Manual gives you complete control</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bot className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>You can switch methods anytime</span>
                </div>
                <div className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>Your progress is automatically saved</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}