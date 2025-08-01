// apps/web/components/aura/aura-creator.tsx

"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PersonalityMatrix } from "./personality-matrix"
import { SenseSelector } from "./sense-selector"
import { RuleBuilder } from "./rule-builder"
import { PlantSelector } from "./plant-selector"
import { PLANT_DATABASE } from "@/lib/plant-database"
import type { LocationConfig } from "./sense-location-modal"
import {
  VESSEL_SENSE_CONFIG,
  AVAILABLE_SENSES,
  type VesselTypeId,
  type SenseId,
} from "@/lib/constants"
import { VESSEL_TYPE_CONFIG } from "@/lib/vessel-config"
import { LICENSED_PRESETS } from "@/lib/licensed-presets"
import { MANUAL_VESSEL_OPTIONS, type AuraFormData, type AuraFormStep } from "@/types/aura-forms"
import {
  AlertCircle,
  Sparkles,
  Heart,
  ArrowRight,
  CheckCircle,
  QrCode,
  Scan,
  Package,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Personality } from "@/types"

// Vessel categories for better organization
const VESSEL_CATEGORIES = {
  terra: {
    name: "Terra Vessels",
    description: "Plant companions with environmental sensors",
    vessels: MANUAL_VESSEL_OPTIONS.filter(v => v.type === "terra")
  },
  companion: {
    name: "Companion Vessels",
    description: "Wildlife friends that come to life",
    vessels: MANUAL_VESSEL_OPTIONS.filter(v => v.type === "companion")
  },
  licensed: {
    name: "Licensed Characters",
    description: "Iconic personalities with preset traits",
    vessels: MANUAL_VESSEL_OPTIONS.filter(v => v.code.startsWith("licensed"))
  }
}

export function AuraCreator() {
  const router = useRouter()
  const [step, setStep] = useState<AuraFormStep>("vessel")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs for scrolling and preventing duplicate creation
  const containerRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)
  const isCreatingRef = useRef(false)

  // Manual entry + focus state
  const [manualInput, setManualInput] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showVesselSelector, setShowVesselSelector] = useState(false)

  // Location configurations for location-aware senses
  const [locationConfigs, setLocationConfigs] = useState<Record<string, LocationConfig>>({})

  const [auraData, setAuraData] = useState<AuraFormData>({
    id: '',
    name: '',
    vesselType: 'digital',
    vesselCode: '',
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
    availableSenses: [], // ✅ Add this line
    rules: [],
    selectedStudyId: undefined,
    selectedIndividualId: undefined,
  })


  // Scroll to top when step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // Apply licensed presets
  useEffect(() => {
    const code = auraData.vesselCode
    if (!code) return

    const preset = LICENSED_PRESETS[code]
    if (preset) {
      setAuraData((prev: AuraFormData) => ({
        ...prev,
        personality: {
          ...prev.personality,
          persona: preset.persona,
          ...preset.settings,
        },
      }))
    }
  }, [auraData.vesselCode])

  // Initialize senses and IDs based on vessel type
  useEffect(() => {
    if (!auraData.vesselType) return

    const cfg = VESSEL_SENSE_CONFIG[auraData.vesselType]

    let studyId: string | undefined
    let individualId: string | undefined
    if (auraData.vesselType === "companion") {
      studyId = crypto.randomUUID()
      individualId = crypto.randomUUID()
    }

    setAuraData(prev => ({
      ...prev,
      senses: cfg.defaultSenses,
      selectedStudyId: studyId,
      selectedIndividualId: individualId,
    }))
    setError(null)
  }, [auraData.vesselType])

  const handleManualSubmit = () => {
    const raw = manualInput.trim()
    const val = raw.toLowerCase()
    const found = MANUAL_VESSEL_OPTIONS.find(o => o.code.toLowerCase() === val)
    
    if (found) {
      handleVesselOptionSelect(found)
    } else {
      setError("Vessel code not recognized. Please select from the available options below.")
      setShowVesselSelector(true)
    }
  }

  const handleVesselOptionSelect = (option: typeof MANUAL_VESSEL_OPTIONS[0]) => {
    setAuraData((prev: AuraFormData) => ({
      ...prev,
      vesselType: option.type,
      vesselCode: option.code,
    }))
    setStep(option.type === "terra" ? "plant" : "senses")
    setError(null)
    setShowVesselSelector(false)
    setManualInput("")
  }

  const handleVesselSelect = (vesselType: VesselTypeId) => {
    setAuraData((prev: AuraFormData) => ({
      ...prev,
      vesselType,
      vesselCode: vesselType === "digital" ? "" : vesselType,
    }))
    setStep(vesselType === "terra" ? "plant" : "senses")
    setError(null)
  }

  const toggleSense = (senseId: SenseId) =>
    setAuraData((prev: AuraFormData) => ({
      ...prev,
      senses: prev.senses.includes(senseId)
        ? prev.senses.filter((id) => id !== senseId)
        : [...prev.senses, senseId],
    }))

  // Handler for location configuration
  const handleLocationConfig = (senseId: SenseId, config: LocationConfig) => {
    setLocationConfigs(prev => ({
      ...prev,
      [senseId]: config
    }))
  }

  const handleCreate = async () => {
    console.log('handleCreate called - starting aura creation (full)')
    if (loading || isCreatingRef.current) {
      console.log('Already creating aura, ignoring duplicate call')
      return
    }
    isCreatingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const senseCodes = auraData.senses.map((id) =>
        id.replace(/([A-Z])/g, "_$1").toLowerCase()
      )
      const resp = await fetch("/api/auras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: auraData.name,
          vesselType: auraData.vesselType,
          vesselCode: auraData.vesselCode || undefined,
          plantType: auraData.plantType || undefined,
          personality: auraData.personality,
          senses: senseCodes,
          locationConfigs, // Add location configurations
          selectedStudyId: auraData.selectedStudyId,
          selectedIndividualId: auraData.selectedIndividualId,
        }),
      })
      const body = await resp.json()
      console.log('Aura creation response (full):', { status: resp.status, body })
      if (!resp.ok) throw new Error(body.error || "Failed to create Aura")
      setAuraData((prev: AuraFormData) => ({ ...prev, id: body.id }))
      console.log('Aura created successfully with ID (full):', body.id)
      setStep("rules")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      isCreatingRef.current = false
    }
  }

  const canNextPlant = auraData.vesselType === "terra" && auraData.plantType
  const canNextSenses = (() => {
    if (!auraData.vesselType) return false
    const cfg = VESSEL_SENSE_CONFIG[auraData.vesselType]
    return cfg.defaultSenses.every((d) => auraData.senses.includes(d))
  })()
  const canNextDetails = auraData.name.trim() !== ""

  const senseConfig = auraData.vesselType
    ? VESSEL_SENSE_CONFIG[auraData.vesselType]
    : { defaultSenses: [], optionalSenses: [] }
  
  const allowedSenses = AVAILABLE_SENSES.filter((s) => {
    const isDefault = senseConfig.defaultSenses.includes(s.id)
    const isOptional = senseConfig.optionalSenses.includes(s.id)
    const isConnected = ["sleep", "fitness", "calendar", "location"].includes(s.id)
    return isDefault || isOptional || isConnected
  })

  const onNext = () => {
    if (step === "plant") {
      setStep("senses")
    } else if (step === "senses") {
      setStep("details")
    } else if (step === "details") {
      handleCreate()
    }
  }

  const onBack = () => {
    if (step === "plant") setStep("vessel")
    else if (step === "senses") {
      setStep(auraData.vesselType === "terra" ? "plant" : "vessel")
    }
    else if (step === "details") setStep("senses")
    else if (step === "rules") setStep("details")
  }

  const selectedVessel = auraData.vesselType ? VESSEL_TYPE_CONFIG[auraData.vesselType] : null
  const digitalVessel = VESSEL_TYPE_CONFIG.digital
  
  const steps: AuraFormStep[] = auraData.vesselType === "terra" 
    ? ["vessel", "plant", "senses", "details", "rules"]
    : ["vessel", "senses", "details", "rules"]
  const meetButtonText =
    auraData.name.length > 12 ? "Meet Your Aura" : `Meet ${auraData.name}`

  return (
    <div className="max-w-5xl mx-auto" ref={containerRef}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Create Your Aura
        </h1>
        <p className="text-xl text-gray-600">
          Bring a unique personality to life through magical connection and understanding
        </p>
      </div>

      <Card className="backdrop-blur-sm bg-white/95 border-2 border-purple-100 shadow-xl">
        <CardContent className="p-6 sm:p-8">
          <div ref={stepContentRef}>
            {step === "vessel" ? (
              <div className="space-y-8">
                {/* Physical Vessel Option */}
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                      <Package className="w-6 h-6 text-purple-600" />
                      Do you have a physical vessel?
                    </h2>
                    <p className="text-gray-600">
                      Connect with a physical companion by entering its code or selecting from available vessels
                    </p>
                  </div>

                  <div className="max-w-md mx-auto space-y-4">
                    <div className="relative">
                      <Input
                        value={manualInput}
                        onChange={(e) => {
                          setManualInput(e.target.value)
                          setError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && manualInput.trim()) {
                            handleManualSubmit()
                          }
                        }}
                        placeholder="Enter vessel code (e.g., TERRA-POT-001)"
                        className="text-center text-lg py-6 border-2 border-purple-200 focus:border-purple-400 pr-12"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <QrCode className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleManualSubmit}
                        disabled={!manualInput.trim()}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Connect Vessel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowVesselSelector(!showVesselSelector)}
                        className="border-2 border-purple-200 hover:border-purple-400"
                      >
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform",
                          showVesselSelector && "rotate-180"
                        )} />
                      </Button>
                    </div>

                    {/* Available Vessels Dropdown */}
                    {showVesselSelector && (
                      <div className="mt-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-100 space-y-4">
                        <p className="text-sm font-medium text-purple-700">
                          Select from available vessels:
                        </p>
                        
                        {Object.entries(VESSEL_CATEGORIES).map(([key, category]) => (
                          <div key={key} className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {category.name}
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {category.vessels.map((vessel) => (
                                <button
                                  key={vessel.code}
                                  onClick={() => {
                                  // just populate the input, don't auto-advance
                                  setManualInput(vessel.code)
                                  setError(null)
                                  setShowVesselSelector(false)
                                }}
                                className="text-left p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                                >
                                <div className="flex items-center justify-between">
                                  {/* ManualVesselOption only has .code and .type */}
                                  <span className="font-medium text-sm">{vessel.code}</span>
                                  <span className="text-xs text-gray-500 font-mono">{vessel.code}</span>
                                </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  <span className="text-gray-500 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Digital Only Option */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      Create a Digital Being
                    </h3>
                    <p className="text-gray-600">
                      No physical vessel? No problem! Create a pure digital consciousness
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <button
                      onClick={() => handleVesselSelect("digital")}
                      className={cn(
                        "group relative w-full p-8 rounded-2xl border-3 transition-all duration-300 text-center hover:scale-105 hover:shadow-xl",
                        digitalVessel.borderColor,
                        "bg-gradient-to-br",
                        digitalVessel.bgColor
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="text-6xl mb-2">{digitalVessel.icon}</div>
                        </div>

                        <div>
                          <h4 className="text-2xl font-bold mb-3 text-purple-800">
                            {digitalVessel.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            {digitalVessel.description}
                          </p>
                          <div className="bg-white/70 p-4 rounded-lg border border-white/50">
                            <p className="text-sm italic text-gray-700">
                              {digitalVessel.example}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <span className="text-purple-600 font-medium">
                            Start Creating Magic
                          </span>
                          <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    ✨ Digital beings can later be connected to any vessel type
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Stepper */}
                <div className="flex items-center justify-center sm:justify-start mb-10 px-4 sm:px-0">
                  {steps.map((s, i) => (
                    <React.Fragment key={s}>
                      <div className="flex flex-col sm:flex-row items-center">
                        <div
                          className={cn(
                            "rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0",
                            step === s
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110"
                              : i < steps.indexOf(step)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          )}
                        >
                          {i < steps.indexOf(step) ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span
                          className={cn(
                            "ml-0 sm:ml-3 mt-2 sm:mt-0 text-center sm:text-left font-medium transition-colors text-xs sm:text-base",
                            step === s ? "text-purple-700" : "text-gray-500"
                          )}
                        >
                          {{
                            vessel: "Choose Vessel",
                            plant: "Select Plant",
                            senses: "Connect Senses",
                            details: "Define Personality",
                            rules: "Set Behaviors",
                          }[s]}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className={cn(
                            "flex-1 h-1 mx-2 sm:mx-4 rounded transition-colors",
                            i < steps.indexOf(step)
                              ? "bg-green-500"
                              : "bg-gray-200"
                          )}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Selected Vessel Display */}
                {selectedVessel && (
                  <div
                    className={cn(
                      "mb-8 p-4 rounded-xl border-2 bg-gradient-to-r",
                      selectedVessel.bgColor,
                      selectedVessel.borderColor.replace("hover:", "")
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{selectedVessel.icon}</div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold flex items-baseline">
                          {selectedVessel.name}
                          {auraData.vesselCode && selectedVessel.id !== "digital" && (
                            <span className="ml-2 text-sm text-gray-500">
                              ({auraData.vesselCode})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedVessel.description}
                        </p>

                        {/* Terra: show the chosen plant */}
                        {auraData.vesselType === "terra" && auraData.plantType && (
                          <p className="text-sm">
                            <span className="font-medium">Plant:</span>{" "}
                            {PLANT_DATABASE[auraData.plantType]?.name ?? auraData.plantType}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Plant Selection Step (Terra only) */}
                {step === "plant" && auraData.vesselType === "terra" && (
                  <div className="space-y-8">
                    <PlantSelector
                      selectedPlant={auraData.plantType}
                      onSelectPlant={(plantId) => 
                        setAuraData(prev => ({ ...prev, plantType: plantId }))
                      }
                    />
                  </div>
                )}

                {/* Senses Step with Location Support */}
                {step === "senses" && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">
                        Connect Your Aura's Senses
                      </h2>
                      <p className="text-gray-600">
                        Choose how your {selectedVessel?.name} will perceive and understand the world
                      </p>
                    </div>

                    <SenseSelector
                      availableSenses={allowedSenses}
                      nonToggleableSenses={senseConfig.defaultSenses}
                      selectedSenses={auraData.senses}
                      onToggle={toggleSense}
                      vesselType={auraData.vesselType as VesselTypeId}
                      auraName={auraData.name || "Your Aura"}
                      onLocationConfig={handleLocationConfig}
                      locationConfigs={locationConfigs}
                    />
                  </div>
                )}

                {/* Details Step */}
                {step === "details" && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">
                        Shape Their Personality
                      </h2>
                      <p className="text-gray-600">
                        Give your {selectedVessel?.name} a unique character that will
                        shine through every interaction
                      </p>
                    </div>

                    <div className="max-w-md mx-auto">
                      <label className="block text-sm font-medium mb-3 text-center">
                        What should we call your Aura?
                      </label>
                      <Input
                        value={auraData.name}
                        onChange={(e) =>
                          setAuraData((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Give your Aura a magical name..."
                        className="text-center text-lg py-6 border-2 border-purple-200 focus:border-purple-400"
                        autoFocus
                      />
                    </div>
                    <PersonalityMatrix
                      personality={auraData.personality}
                      vesselCode={auraData.vesselCode}
                      vesselType={auraData.vesselType}
                      auraName={auraData.name}
                      onChange={(update) =>
                        setAuraData((p) => ({
                          ...p,
                          personality: { ...p.personality, ...update },
                        }))
                      }
                    />
                  </div>
                )}

                {/* Rules Step */}
                {step === "rules" && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">
                        <Sparkles className="w-6 h-6 inline mr-2" />
                        Teaching {auraData.name} to React
                      </h2>
                      <p className="text-gray-600">
                        Set up automatic responses so {auraData.name} can share
                        their experiences with the world
                      </p>
                    </div>

                    <RuleBuilder
                      auraId={auraData.id}
                      vesselType={auraData.vesselType as VesselTypeId}
                      vesselCode={auraData.vesselCode}
                      availableSenses={auraData.senses}
                      existingRules={auraData.rules}
                      onAddRule={(r) =>
                        setAuraData((p) => ({ ...p, rules: [...p.rules, r] }))
                      }
                      onDeleteRule={(id) =>
                        setAuraData((p) => ({
                          ...p,
                          rules: p.rules.filter((r) => r.id !== id),
                        }))
                      }
                      onToggleRule={(id, en) =>
                        setAuraData((p) => ({
                          ...p,
                          rules: p.rules.map((r) =>
                            r.id === id ? { ...r, enabled: en } : r
                          ),
                        }))
                      }
                    />

                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                      <Heart className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        🎉 {auraData.name} is ready to come alive!
                      </h3>
                      <p className="text-green-700">
                        Your Aura is now configured and ready to start experiencing
                        the world. You can always add more rules or adjust their
                        personality later.
                      </p>
                    </div>
                  </div>
                )}

                {/* API Error */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Enhanced Navigation - Consistent Layout */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 mt-10 pt-8 border-t-2 border-gray-100">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={loading}
                    size="lg"
                    className="px-8 w-full sm:w-auto order-2 sm:order-1"
                  >
                    Back
                  </Button>

                  {step !== "rules" ? (
                    <Button
                      onClick={onNext}
                      disabled={
                        loading ||
                        (step === "plant" && !canNextPlant) ||
                        (step === "senses" && !canNextSenses) ||
                        (step === "details" && !canNextDetails)
                      }
                      size="lg"
                      className="px-8 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 order-1 sm:order-2"
                    >
                      {step === "details" && loading ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Creating Magic...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push(`/auras/${auraData.id}`)}
                      size="lg"
                      className="px-8 w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold order-1 sm:order-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Chat with {auraData.name}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}