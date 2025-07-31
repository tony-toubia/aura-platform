// apps/web/components/aura/aura-configuration-form.tsx

"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PersonalityMatrix } from "./personality-matrix"
import { SenseSelector } from "./sense-selector"
import { RuleBuilder } from "./rule-builder"
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

export function AuraConfigurationForm({
  auraData,
  locationConfigs = {},
  onAuraDataChange,
  onLocationConfigChange,
  onSave,
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
  const [step, setStep] = useState<Step>(initialStep)
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

  const steps = [
    { id: "senses", label: "Senses", icon: Heart },
    { id: "details", label: "Personality", icon: Sparkles },
    { id: "rules", label: "Rules", icon: CheckCircle },
  ] as const

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const canGoNext = step === "senses" ? auraData.senses.length > 0 : step === "details" ? auraData.name : true
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
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((stepInfo, index) => {
              const isActive = stepInfo.id === step
              const isCompleted = index < currentStepIndex
              const Icon = stepInfo.icon

              return (
                <div key={stepInfo.id} className="flex items-center">
                  <button
                    onClick={() => setStep(stepInfo.id as Step)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                      isActive
                        ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                        : isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{stepInfo.label}</span>
                    {isCompleted && <CheckCircle className="w-4 h-4" />}
                  </button>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
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
              onLocationConfig={handleLocationConfig}
              locationConfigs={locationConfigs}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Start with the fundamentals of your Aura's identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="aura-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Aura Name
                  </label>
                  <Input
                    id="aura-name"
                    value={auraData.name}
                    onChange={(e) => onAuraDataChange({ name: e.target.value })}
                    placeholder="Enter a name for your Aura..."
                    className="text-lg"
                  />
                </div>
              </CardContent>
            </Card>

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

            <RuleBuilder
              auraId={auraData.id || "temp"}
              availableSenses={auraData.senses}
              existingRules={auraData.rules || []}
              onAddRule={(rule) => updateRules([...(auraData.rules || []), rule])}
              onDeleteRule={(ruleId) => updateRules((auraData.rules || []).filter(r => r.id !== ruleId))}
              onToggleRule={(ruleId, enabled) => updateRules((auraData.rules || []).map(r => r.id === ruleId ? { ...r, enabled } : r))}
            />
          </div>
        )}
      </div>

      {/* Navigation & Save */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
        <div className="flex gap-4">
          {showStepNavigation && canGoPrev && currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(steps[currentStepIndex - 1]?.id as Step)}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          {showStepNavigation && currentStepIndex < steps.length - 1 && currentStepIndex + 1 < steps.length ? (
            <Button
              onClick={() => setStep(steps[currentStepIndex + 1]?.id as Step)}
              disabled={!canGoNext}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
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