// apps/web/components/aura/aura-configuration-form.tsx

"use client"

import React, { useState, useEffect, useRef } from "react"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PersonalityMatrix } from "./personality-matrix"
import { SenseSelector } from "./sense-selector"
import { RuleBuilder } from "./rule-builder"
import { EnhancedRuleBuilder } from "./rule-builder/enhanced-rule-builder"
import { type LocationConfig } from "./sense-location-modal"
import { VESSEL_SENSE_CONFIG, AVAILABLE_SENSES } from "@/lib/constants"
import type { VesselTypeId, SenseId } from "@/lib/constants"
import {
  AlertCircle,
  Sparkles,
  Heart,
  ArrowRight,
  CheckCircle,
  Save,
  Settings,
  Edit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Aura, Personality } from "@/types"

type Step = "senses" | "details" | "rules"

interface AuraData {
  id?: string
  name: string
  vesselType: VesselTypeId
  vesselCode?: string
  personality: Personality
  senses: SenseId[]
  selectedStudyId?: string
  selectedIndividualId?: string
  rules?: BehaviorRule[]
}

interface AuraConfigurationFormProps {
  // Data
  auraData: AuraData
  locationConfigs?: Record<string, LocationConfig>
  
  // Callbacks
  onAuraDataChange: (updates: Partial<AuraData>) => void
  onLocationConfigChange?: (senseId: SenseId, config: LocationConfig) => void
  onSave?: () => Promise<void>
  autoSaveBeforeRules?: boolean
  
  // UI Configuration
  initialStep?: Step
  showStepNavigation?: boolean
  showSaveButton?: boolean
  saveButtonText?: string
  isLoading?: boolean
  error?: string | null
  
  // Customization
  title?: string
  description?: string
  className?: string
}

// Utility function to normalize sense IDs
function normalizeSenseId(senseId: string): SenseId {
  return senseId
    .replace(/\./g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase() as SenseId
}

interface NameInputCardProps {
  name: string
  onNameChange: (name: string) => void
}

function NameInputCard({ name, onNameChange }: NameInputCardProps) {
  const [isEditingName, setIsEditingName] = useState(!name) // Start editing if no name
  const [tempName, setTempName] = useState(name)

  const handleSave = () => {
    if (tempName.trim()) {
      onNameChange(tempName.trim())
      setIsEditingName(false)
    }
  }

  const handleEdit = () => {
    setTempName(name)
    setIsEditingName(true)
  }

  const handleCancel = () => {
    setTempName(name)
    setIsEditingName(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg animate-shimmer">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          Basic Information
        </CardTitle>
        <CardDescription className="text-purple-200">
          Update the fundamentals of your Aura's identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="aura-name" className="block text-sm font-medium text-purple-100 mb-2">
            Aura Name
          </label>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                id="aura-name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Name your Aura"
                className="text-lg bg-white text-black placeholder-gray-500 border-gray-300 focus:ring-purple-500"
                autoFocus
              />
              <Button
                onClick={handleSave}
                disabled={!tempName.trim()}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">{name}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-white hover:bg-white/20"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AuraConfigurationForm({
  auraData,
  locationConfigs = {},
  onAuraDataChange,
  onLocationConfigChange,
  onSave,
  autoSaveBeforeRules = false,
  initialStep = "senses",
  showStepNavigation = true,
  showSaveButton = true,
  saveButtonText = "Save Configuration",
  isLoading = false,
  error = null,
  title,
  description,
  className
}: AuraConfigurationFormProps) {
  const { subscription } = useSubscription()
  const [step, setStep] = useState<Step>(initialStep)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)

  // Get vessel configuration
  const senseConfig = VESSEL_SENSE_CONFIG[auraData.vesselType] || VESSEL_SENSE_CONFIG.digital
  const allowedSenseIds = [...senseConfig.defaultSenses, ...senseConfig.optionalSenses]
  const allowedSenses = AVAILABLE_SENSES.filter(sense => allowedSenseIds.includes(sense.id))

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const updatePersonality = (update: Partial<Personality>) => {
    onAuraDataChange({
      personality: { ...auraData.personality, ...update }
    })
  }

  const toggleSense = (senseId: SenseId) => {
    const newSenses = auraData.senses.includes(senseId)
      ? auraData.senses.filter(id => id !== senseId)
      : [...auraData.senses, senseId]
    
    onAuraDataChange({ senses: newSenses })
  }

  const handleLocationConfig = (senseId: SenseId, config: LocationConfig) => {
    if (onLocationConfigChange) {
      onLocationConfigChange(senseId, config)
    }
  }

  const updateRules = (rules: BehaviorRule[]) => {
    onAuraDataChange({ rules })
  }

  const handleStepNavigation = async (targetStep: Step) => {
    // If navigating to rules step, auto-save is enabled, aura hasn't been saved yet, and onSave is available
    if (targetStep === "rules" && autoSaveBeforeRules && !auraData.id && onSave) {
      try {
        setIsAutoSaving(true)
        await onSave()
        // After successful save, navigate to the step
        setStep(targetStep)
      } catch (error) {
        console.error("Failed to save aura before navigating to rules:", error)
        // Don't navigate if save failed
        return
      } finally {
        setIsAutoSaving(false)
      }
    } else {
      setStep(targetStep)
    }
  }

  const steps = [
    { id: "details", label: "Personality", icon: Sparkles },
    { id: "senses", label: "Senses", icon: Heart },
    { id: "rules", label: "Rules", icon: CheckCircle },
  ] as const

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const canGoNext = step === "details" ? auraData.name : true
  const canGoPrev = currentStepIndex > 0

  return (
    <div ref={containerRef} className={cn("space-y-8", className)}>
      {/* Header */}
      {(title || description) && (
        <div className="text-center">
          {title && <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}

      {/* Step Navigation */}
      {showStepNavigation && (
        <div className="flex justify-center px-1">
          <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto pb-2 max-w-full">
            {steps.map((stepInfo, index) => {
              const isActive = stepInfo.id === step
              const isCompleted = index < currentStepIndex
              const Icon = stepInfo.icon

              return (
                <div key={stepInfo.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => handleStepNavigation(stepInfo.id as Step)}
                    className={cn(
                      "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap",
                      isActive
                        ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                        : isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{stepInfo.label}</span>
                    {isCompleted && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                  </button>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1 sm:mx-2 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div ref={stepContentRef}>
        {step === "senses" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">
                Connect Your Aura's Senses
              </h2>
              <p className="text-gray-600">
                Choose how your Aura will perceive and understand the world
              </p>
            </div>

            <SenseSelector
              availableSenses={allowedSenses}
              nonToggleableSenses={senseConfig.defaultSenses}
              selectedSenses={auraData.senses}
              onToggle={toggleSense}
              vesselType={auraData.vesselType}
              auraName={auraData.name}
              auraId={undefined} // No aura_id during creation
              onLocationConfig={handleLocationConfig}
              locationConfigs={locationConfigs}
              onOAuthConnection={() => {}} // Placeholder for OAuth connections
              onOAuthDisconnect={() => {}} // Placeholder for OAuth disconnections
              oauthConnections={{}} // Empty OAuth connections
              onNewsConfiguration={() => {}} // Placeholder for news configuration
              newsConfigurations={{}} // Empty news configurations
              onWeatherAirQualityConfiguration={() => {}} // Placeholder for weather/air quality configuration
              weatherAirQualityConfigurations={{}} // Empty weather/air quality configurations
              hasPersonalConnectedSenses={subscription?.features.hasPersonalConnectedSenses ?? false}
            />
          </div>
        )}

        {step === "details" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">
                Shape Their Personality
              </h2>
              <p className="text-gray-600">
                Give your Aura a unique character that will shine through every interaction
              </p>
            </div>

            {/* Name Input */}
            <NameInputCard
              name={auraData.name}
              onNameChange={(name) => onAuraDataChange({ name })}
            />

            <PersonalityMatrix
              personality={auraData.personality}
              vesselCode={auraData.vesselCode}
              vesselType={auraData.vesselType}
              auraName={auraData.name}
              onChange={updatePersonality}
            />
          </div>
        )}

        {step === "rules" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">
                Define Behavioral Rules
              </h2>
              <p className="text-gray-600">
                Set up intelligent responses to different situations and sensor data
              </p>
            </div>

            {auraData.id ? (
              <EnhancedRuleBuilder
                auraId={auraData.id}
                vesselType={auraData.vesselType}
                vesselCode={auraData.vesselCode}
                availableSenses={auraData.senses}
                existingRules={(auraData.rules || []).map(rule => ({
                  id: rule.id || `rule-${Date.now()}-${Math.random()}`,
                  name: rule.name,
                  trigger: rule.trigger,
                  action: rule.action,
                  priority: rule.priority || 1,
                  enabled: rule.enabled,
                  auraId: auraData.id!,
                  createdAt: rule.createdAt || new Date(),
                  updatedAt: rule.updatedAt || new Date()
                }))}
                onAddRule={(rule: BehaviorRule) => {
                  const newRule = {
                    id: rule.id || `rule-${Date.now()}-${Math.random()}`,
                    name: rule.name,
                    trigger: rule.trigger,
                    action: rule.action,
                    priority: rule.priority || 1,
                    enabled: rule.enabled,
                    auraId: auraData.id!,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                  updateRules([...(auraData.rules || []), newRule])
                }}
                onEditRule={(rule: BehaviorRule | null) => {
                  // Handle rule editing
                  if (rule) {
                    console.log('Edit rule:', rule)
                  }
                }}
                onDeleteRule={(ruleId: string) => updateRules((auraData.rules || []).filter(r => r.id !== ruleId))}
                onToggleRule={(ruleId: string, enabled: boolean) => updateRules((auraData.rules || []).map(r => r.id === ruleId ? { ...r, enabled } : r))}
                onSaveEditedRule={(editedRule: BehaviorRule) => {
                  const updatedRule = {
                    id: editedRule.id,
                    name: editedRule.name,
                    trigger: editedRule.trigger,
                    action: editedRule.action,
                    priority: editedRule.priority || 1,
                    enabled: editedRule.enabled,
                    auraId: auraData.id!,
                    createdAt: editedRule.createdAt || new Date(),
                    updatedAt: new Date()
                  }
                  updateRules((auraData.rules || []).map(r => r.id === editedRule.id ? updatedRule : r))
                }}
                showVisualBuilder={true}
                showTemplateLibrary={true}
              />
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">Save Required</h4>
                <p className="text-gray-500">
                  Please save your Aura configuration before adding rules.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation & Save */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
        <div className="flex gap-4">
          {showStepNavigation && canGoPrev && currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => handleStepNavigation(steps[currentStepIndex - 1]?.id as Step)}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          {showStepNavigation && currentStepIndex < steps.length - 1 && currentStepIndex + 1 < steps.length ? (
            <Button
              onClick={() => handleStepNavigation(steps[currentStepIndex + 1]?.id as Step)}
              disabled={!canGoNext || isAutoSaving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAutoSaving && steps[currentStepIndex + 1]?.id === "rules" ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : showSaveButton && onSave ? (
            <Button
              onClick={onSave}
              disabled={isLoading || !auraData.name}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {saveButtonText}
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}