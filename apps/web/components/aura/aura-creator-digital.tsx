// apps/web/components/aura/aura-creator-digital.tsx

"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PersonalityMatrix } from "./personality-matrix"
import { SenseSelector } from "./sense-selector"
import { RuleBuilder } from "./rule-builder"
import type { LocationConfig } from "./sense-location-modal"
import {
  VESSEL_SENSE_CONFIG,
  AVAILABLE_SENSES,
  COMING_SOON_VESSELS,
  type VesselTypeId,
  type SenseId,
} from "@/lib/constants"
import { type AuraFormData } from "@/types/aura-forms"
import {
  AlertCircle,
  Sparkles,
  Heart,
  ArrowRight,
  CheckCircle,
  Rocket,
  Gift,
  Star,
  ArrowLeft,
  Edit,
  Bot,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Personality } from "@/types"
import { useAsync, useFormSubmit } from "@/hooks/use-async"
import { auraApi } from "@/lib/api/client"
import { getCurrentUserId } from "@/lib/oauth/token-storage"

type DigitalStep = "details" | "senses" | "rules" | "review"

export function AuraCreatorDigital() {
  const router = useRouter()
  const [step, setStep] = useState<DigitalStep>("details")
  const [error, setError] = useState<string | null>(null)
  const [isEditingName, setIsEditingName] = useState(true)
  const [editingRule, setEditingRule] = useState<BehaviorRule | null>(null)

  // Refs for scrolling and preventing duplicate saves
  const containerRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)
  const isSavingRef = useRef(false)

  // Location configurations for location-aware senses
  const [locationConfigs, setLocationConfigs] = useState<Record<string, LocationConfig>>({})

  const [auraData, setAuraData] = useState<AuraFormData>({
    id: '',
    name: '',
    vesselType: 'digital',
    vesselCode: 'digital-only',
    plantType: undefined,
    personality: {
      warmth: 50,
      playfulness: 50,
      verbosity: 50,
      empathy: 50,
      creativity: 50,
      persona: 'balanced',
      tone: 'casual',
      vocabulary: 'average',
      quirks: [],
    },
    senses: [],
    availableSenses: [],
    rules: [],
    selectedStudyId: undefined,
    selectedIndividualId: undefined,
  })

  // Auto-scroll to top when step changes and restore form data from URL parameters
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Restore form data from URL parameters if switching from AI mode
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const vesselType = urlParams.get('vesselType');
    const vesselCode = urlParams.get('vesselCode');
    const personalityStr = urlParams.get('personality');
    const sensesStr = urlParams.get('senses');
    const rulesStr = urlParams.get('rules');
    const locationConfigsStr = urlParams.get('locationConfigs');

    if (name || personalityStr || sensesStr || rulesStr) {
      console.log('Restoring form data from AI mode switch');
      
      setAuraData(prev => ({
        ...prev,
        name: name || prev.name,
        vesselType: (vesselType as VesselTypeId) || prev.vesselType,
        vesselCode: vesselCode || prev.vesselCode,
        personality: personalityStr ? JSON.parse(personalityStr) : prev.personality,
        senses: sensesStr ? JSON.parse(sensesStr) : prev.senses,
        availableSenses: sensesStr ? JSON.parse(sensesStr) : prev.availableSenses,
        rules: rulesStr ? JSON.parse(rulesStr) : prev.rules,
      }));

      if (locationConfigsStr) {
        setLocationConfigs(JSON.parse(locationConfigsStr));
      }

      // If we have a name, exit editing mode
      if (name) {
        setIsEditingName(false);
      }

      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [step])

  // Use the form submission hook
  const {
    submit: saveAura,
    isSubmitting: isSaving,
    error: saveError,
    clearError,
  } = useFormSubmit(
    async (data: AuraFormData) => {
      // Validate required fields
      if (!data.name) {
        throw new Error("Aura name is required")
      }

      const userId = await getCurrentUserId()
      if (!userId) throw new Error("User not authenticated")

      const senseCodes = data.availableSenses.map((s) =>
        s.includes(".") ? s.replace(/\./g, "_") : s
      )

      console.log("Saving digital aura with config:", {
        name: data.name,
        vesselType: data.vesselType,
        vesselCode: data.vesselCode,
        sensesCount: senseCodes.length,
        rulesCount: data.rules.length,
        personality: data.personality,
        rules: data.rules,
        senses: senseCodes,
        locationConfigs,
        isUpdate: !!data.id
      })

      let response
      
      if (data.id) {
        // Update existing aura
        console.log(`Updating existing aura with ID: ${data.id}`)
        response = await auraApi.updateAura(data.id, {
          name: data.name,
          personality: data.personality,
          senses: senseCodes,
          rules: data.rules.filter((r) => r.name && r.name.trim()),
          locationConfigs,
        })
      } else {
        // Create new aura
        console.log("Creating new aura")
        response = await auraApi.createAura({
          userId,
          name: data.name,
          vesselType: data.vesselType,
          vesselCode: data.vesselCode,
          personality: data.personality,
          senses: senseCodes,
          rules: data.rules.filter((r) => r.name && r.name.trim()),
          locationInfo: data.locationInfo,
          newsType: data.newsType,
          locationConfigs,
        })
      }

      if (!response.success) {
        throw new Error(response.error || `Failed to ${data.id ? 'update' : 'create'} Aura`)
      }

      const auraId = response.data?.auraId || response.data?.id || data.id
      console.log(`Digital Aura ${data.id ? 'updated' : 'created'} successfully:`, auraId)
      
      // Only update the ID if we don't have one yet (for new auras)
      if (!data.id && auraId) {
        setAuraData((prev) => ({
          ...prev,
          id: auraId,
        }))
      }

      return response.data
    },
    {
      onSuccess: () => {
        console.log("Digital Aura creation successful")
        setStep("review")
      },
      onError: (error) => {
        console.error("Save error:", error)
        setError(error.message)
      },
    }
  )

  const updatePersonality = (update: Partial<Personality>) => {
    setAuraData(prev => ({
      ...prev,
      personality: { ...prev.personality, ...update }
    }))
  }

  const toggleSense = (senseId: SenseId) => {
    const newSenses = auraData.senses.includes(senseId)
      ? auraData.senses.filter(id => id !== senseId)
      : [...auraData.senses, senseId];
    
    setAuraData(prev => ({
      ...prev,
      senses: newSenses,
      availableSenses: newSenses,
    }));
  };

  const handleLocationConfig = (senseId: SenseId, config: LocationConfig) => {
    setLocationConfigs(prev => ({ ...prev, [senseId]: config }))
  }

  const updateRules = (rules: BehaviorRule[]) => {
    setAuraData(prev => ({ ...prev, rules }))
  }

  const handleEditRule = (rule: BehaviorRule | null) => {
    setEditingRule(rule)
  }

  const handleSaveEditedRule = (updatedRule: BehaviorRule) => {
    const updatedRules = auraData.rules.map(r => r.id === updatedRule.id ? updatedRule : r)
    updateRules(updatedRules)
    setEditingRule(null)
  }

  // Shared save function with duplicate prevention
  const performSave = async (caller: string) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] performSave called by: ${caller}`)
    
    if (isSavingRef.current) {
      console.log(`[${timestamp}] Already saving, ignoring duplicate call from: ${caller}`)
      return
    }
    
    isSavingRef.current = true
    try {
      console.log(`[${timestamp}] Calling saveAura from: ${caller} (${auraData.id ? 'update' : 'create'})`)
      await saveAura(auraData)
    } finally {
      isSavingRef.current = false
    }
  }

  const handleSave = async () => {
    await performSave('handleSave')
  }

  const handleStepNavigation = async (targetStep: DigitalStep) => {
    if (step === "details" && !auraData.name.trim()) return

    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] handleStepNavigation called - targetStep: ${targetStep}, auraData.id: ${auraData.id}`)
    
    // If navigating to rules step and aura hasn't been saved yet, save it first
    if (targetStep === "rules" && !auraData.id) {
      try {
        await performSave('handleStepNavigation')
        // After successful save, the auraData.id should be set by the saveAura function
        setStep(targetStep)
      } catch (error) {
        console.error("Failed to save aura before navigating to rules:", error)
        // Don't navigate if save failed
        return
      }
    } else {
      setStep(targetStep)
    }
  }

  const navigateToAura = () => {
    if (auraData.id) {
      router.push(`/auras/${auraData.id}`)
    }
  }

  const steps = [
    { id: "details", label: "Personality", icon: Sparkles },
    { id: "senses", label: "Senses", icon: Heart },
    { id: "rules", label: "Rules", icon: CheckCircle },
    { id: "review", label: "Complete", icon: Star },
  ] as const

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const canGoNext = step === "details" ? !!auraData.name.trim() : true
  const canGoPrev = currentStepIndex > 0

  return (
    <div ref={containerRef} className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Mode Toggle and Step Navigation */}
        {step !== "review" && (
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex justify-center">
              <Card className="p-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to AI mode with current form data preserved
                      const queryParams = new URLSearchParams({
                        name: auraData.name || '',
                        vesselType: auraData.vesselType || 'digital',
                        vesselCode: auraData.vesselCode || 'digital-only',
                        personality: JSON.stringify(auraData.personality),
                        senses: JSON.stringify(auraData.senses),
                        rules: JSON.stringify(auraData.rules),
                        locationConfigs: JSON.stringify(locationConfigs),
                      }).toString()
                      window.location.href = `/auras/create-with-agent?${queryParams}`
                    }}
                    className="flex items-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    Switch to AI Assistant
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Manual Configuration
                  </Button>
                </div>
              </Card>
            </div>

            {/* Step Navigation */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {steps.slice(0, -1).map((stepInfo, index) => {
                  const actualIndex = index // Adjust for skipping welcome
                  const isActive = stepInfo.id === step
                  const isCompleted = actualIndex < currentStepIndex
                  const Icon = stepInfo.icon

                  return (
                    <div key={stepInfo.id} className="flex items-center">
                      <button
                        onClick={() => handleStepNavigation(stepInfo.id as DigitalStep)}
                        disabled={stepInfo.id !== "details" && step === "details" && !auraData.name.trim()}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                          isActive
                            ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                            : isCompleted
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                          stepInfo.id !== "details" && step === "details" && !auraData.name.trim() && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{stepInfo.label}</span>
                        {isCompleted && <CheckCircle className="w-4 h-4" />}
                      </button>
                      {actualIndex < steps.length - 2 && (
                        <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(error || saveError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error || saveError}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null)
                  clearError()
                }}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div ref={stepContentRef}>
          {step === "details" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="mb-2 text-3xl font-bold">
                  Shape Their Digital Personality
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Give your digital Aura a unique character that will shine through every interaction. 
                  This personality will be preserved when you upgrade to physical vessels.
                </p>
              </div>

              {/* Name Input with Vessel Type */}
              <Card className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg animate-shimmer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Start with the fundamentals of your Aura's digital identity
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
                          value={auraData.name}
                          onChange={(e) => setAuraData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter a name for your digital Aura..."
                          className="text-lg bg-white text-black placeholder-gray-500 border-gray-300 focus:ring-purple-500"
                        />
                        <Button onClick={() => setIsEditingName(false)} disabled={!auraData.name.trim()}>
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold">{auraData.name}</p>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Vessel Type Information */}
                  <div className="pt-4 border-t border-purple-300/30">
                    <label className="block text-sm font-medium text-purple-100 mb-2">
                      Vessel Type
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl">✨</div>
                      <div>
                        <h3 className="font-semibold text-white">Digital Being</h3>
                        <p className="text-sm text-purple-100">
                          Pure consciousness exploring the world through data streams
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <PersonalityMatrix
                personality={auraData.personality}
                vesselCode="digital-only"
                vesselType="digital"
                auraName={auraData.name}
                onChange={updatePersonality}
              />
            </div>
          )}

          {step === "senses" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="mb-2 text-3xl font-bold">
                  Connect Your Digital Senses
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose how your digital Aura will perceive and understand your world. 
                  These connections help your Aura provide more personalized and contextual responses.
                </p>
              </div>

              <SenseSelector
                availableSenses={AVAILABLE_SENSES.filter(sense => 
                  VESSEL_SENSE_CONFIG.digital.optionalSenses.includes(sense.id)
                )}
                nonToggleableSenses={VESSEL_SENSE_CONFIG.digital.defaultSenses}
                selectedSenses={auraData.senses}
                onToggle={toggleSense}
                vesselType="digital"
                auraName={auraData.name}
                onLocationConfig={handleLocationConfig}
                locationConfigs={locationConfigs}
              />
            </div>
          )}

          {step === "rules" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="mb-2 text-3xl font-bold">
                  Define Intelligent Behaviors
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Set up smart responses to different situations and data from your connected senses. 
                  Your digital Aura will use these rules to provide contextual, helpful interactions.
                </p>
              </div>

              <RuleBuilder
                auraId={auraData.id}
                vesselType="digital"
                vesselCode="digital-only"
                availableSenses={auraData.availableSenses}
                existingRules={auraData.rules}
                editingRule={editingRule}
                onEditRule={handleEditRule}
                onSaveEditedRule={handleSaveEditedRule}
                onAddRule={(rule) => updateRules([...auraData.rules, rule])}
                onDeleteRule={(ruleId) => updateRules(auraData.rules.filter(r => r.id !== ruleId))}
                onToggleRule={(ruleId, enabled) => updateRules(auraData.rules.map(r => r.id === ruleId ? { ...r, enabled } : r))}
              />
            </div>
          )}

          {step === "review" && (
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  🎉 Your Digital Aura is Ready!
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                  <strong>{auraData.name}</strong> has been created and is ready to start their digital journey with you.
                </p>
              </div>

              <Card className="max-w-2xl mx-auto">
                <CardContent className="space-y-6 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-700 mb-2">Name</h3>
                      <p className="text-lg">{auraData.name}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-700 mb-2">Type</h3>
                      <p className="text-lg">Digital Aura</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-700 mb-2">Rules</h3>
                      <p className="text-lg">{auraData.rules.length} configured</p>
                    </div>
                  </div>

                  {auraData.senses.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Connected Senses</h3>
                      <div className="flex flex-wrap gap-2">
                        {auraData.senses.map((senseId, index) => {
                          const sense = AVAILABLE_SENSES.find(s => s.id === senseId)
                          return (
                            <span key={index} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                              {sense?.name || senseId.replace("_", " ").replace(".", ": ")}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setStep("details")}
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Make Changes
                </Button>
                <Button
                  onClick={navigateToAura}
                  disabled={!auraData.id}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Meet Your Aura
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step !== "review" && (
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <div className="flex gap-4">
              {canGoPrev && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const prevStep = steps[currentStepIndex - 1]?.id as DigitalStep
                    if (prevStep) handleStepNavigation(prevStep)
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-4">
              {step === "rules" ? (
                <Button
                  onClick={handleSave}
                  disabled={!auraData.name || isSaving}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isSaving ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Digital Aura
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const nextStep = steps[currentStepIndex + 1]?.id as DigitalStep
                    if (nextStep) handleStepNavigation(nextStep)
                  }}
                  disabled={!canGoNext || isSaving}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSaving && steps[currentStepIndex + 1]?.id === "rules" ? (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}