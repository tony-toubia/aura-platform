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
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Personality } from "@/types"
import { useAsync, useFormSubmit } from "@/hooks/use-async"
import { auraApi } from "@/lib/api/client"
import { getCurrentUserId } from "@/lib/oauth/token-storage"

type DigitalStep = "welcome" | "senses" | "details" | "rules" | "review"

export function AuraCreatorDigital() {
  const router = useRouter()
  const [step, setStep] = useState<DigitalStep>("welcome")
  const [error, setError] = useState<string | null>(null)

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)

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

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
        locationConfigs
      })

      const response = await auraApi.createAura({
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

      if (!response.success) {
        throw new Error(response.error || "Failed to create Aura")
      }

      console.log("Digital Aura saved successfully:", response.data?.auraId)
      setAuraData((prev) => ({
        ...prev,
        id: response.data?.auraId || "",
      }))

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
      : [...auraData.senses, senseId]
    
    setAuraData(prev => ({
      ...prev,
      senses: newSenses,
      availableSenses: newSenses
    }))
  }

  const handleLocationConfig = (senseId: SenseId, config: LocationConfig) => {
    setLocationConfigs(prev => ({ ...prev, [senseId]: config }))
  }

  const updateRules = (rules: BehaviorRule[]) => {
    setAuraData(prev => ({ ...prev, rules }))
  }

  const handleSave = async () => {
    await saveAura(auraData)
  }

  const navigateToAura = () => {
    if (auraData.id) {
      router.push(`/auras/${auraData.id}`)
    }
  }

  const steps = [
    { id: "welcome", label: "Welcome", icon: Rocket },
    { id: "senses", label: "Senses", icon: Heart },
    { id: "details", label: "Personality", icon: Sparkles },
    { id: "rules", label: "Rules", icon: CheckCircle },
    { id: "review", label: "Complete", icon: Star },
  ] as const

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const canGoNext = step === "senses" ? auraData.senses.length > 0 : step === "details" ? auraData.name : true
  const canGoPrev = currentStepIndex > 0

  return (
    <div ref={containerRef} className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Navigation */}
        {step !== "welcome" && step !== "review" && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {steps.slice(1, -1).map((stepInfo, index) => {
                const actualIndex = index + 1 // Adjust for skipping welcome
                const isActive = stepInfo.id === step
                const isCompleted = actualIndex < currentStepIndex
                const Icon = stepInfo.icon

                return (
                  <div key={stepInfo.id} className="flex items-center">
                    <button
                      onClick={() => setStep(stepInfo.id as DigitalStep)}
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
                    {actualIndex < steps.length - 2 && (
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                    )}
                  </div>
                )
              })}
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
          {step === "welcome" && (
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Create Your Digital Aura
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                  Welcome to the future of AI companions! Your digital Aura will be a powerful, 
                  personalized AI that lives in the cloud and can connect to all your digital life.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <Card className="text-center p-6">
                  <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Always Available</h3>
                  <p className="text-sm text-gray-600">Access your Aura from any device, anywhere in the world</p>
                </Card>
                <Card className="text-center p-6">
                  <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Fully Personalized</h3>
                  <p className="text-sm text-gray-600">Customize personality, connect your data, and create unique responses</p>
                </Card>
                <Card className="text-center p-6">
                  <Gift className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Completely Free</h3>
                  <p className="text-sm text-gray-600">Launch special - digital Auras are free during our initial release</p>
                </Card>
              </div>

              <Button
                onClick={() => setStep("senses")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-6 text-lg"
              >
                Let's Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Coming Soon Preview */}
              <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200 mt-12">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Gift className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Physical Vessels Coming Soon</h3>
                    <p className="text-gray-600 text-sm">
                      Start with digital now, transfer to physical vessels when they launch!
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {COMING_SOON_VESSELS.map((vessel) => (
                      <div key={vessel.id} className="text-center p-3 bg-white/60 rounded-lg">
                        <div className="text-2xl mb-1">{vessel.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{vessel.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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

              {/* Name Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Start with the fundamentals of your Aura's digital identity
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
                      onChange={(e) => setAuraData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter a name for your digital Aura..."
                      className="text-lg"
                    />
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
                auraId={auraData.id || "temp"}
                availableSenses={auraData.senses}
                existingRules={auraData.rules}
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
        {step !== "welcome" && step !== "review" && (
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <div className="flex gap-4">
              {canGoPrev && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const prevStep = steps[currentStepIndex - 1]?.id as DigitalStep
                    if (prevStep) setStep(prevStep)
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
                    if (nextStep) setStep(nextStep)
                  }}
                  disabled={!canGoNext}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}