// apps/web/components/aura/aura-edit-form.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PersonalityMatrix } from "./personality-matrix"
import { SenseSelector } from "./sense-selector"
import { type LocationConfig } from "./sense-location-modal"
import { RuleBuilder } from "./rule-builder"
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

const vesselTypes = [
  {
    id: "terra",
    name: "Terra Spirit",
    description: "Plant & garden companions that share their growth journey",
    icon: "🌱",
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
  },
  {
    id: "companion",
    name: "Companion Spirit",
    description: "Wildlife trackers that experience adventures in the wild",
    icon: "🦋",
    bgColor: "from-blue-50 to-sky-50",
    borderColor: "border-blue-200",
  },
  {
    id: "digital",
    name: "Digital Being",
    description: "Pure consciousness exploring the world through data streams",
    icon: "✨",
    bgColor: "from-purple-50 to-violet-50",
    borderColor: "border-purple-200",
  },
]

// Helper function to normalize sense IDs for consistent matching
const normalizeSenseId = (senseId: string): string => {
  if (senseId.includes('_')) {
    return senseId.toLowerCase()
  }
  return senseId
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
}

interface AuraEditFormProps {
  initialAura: Aura
  initialLocationConfigs?: Record<string, LocationConfig>
}

export function AuraEditForm({ initialAura, initialLocationConfigs = {} }: AuraEditFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") as Step | null

  const [step, setStep] = useState<Step>(initialTab || "senses")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationConfigs, setLocationConfigs] = useState<Record<string, LocationConfig>>(initialLocationConfigs)

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)

  // Normalize existing senses to ensure proper matching
  const normalizedSenses = initialAura.senses.map(normalizeSenseId)

  // Form state initialized from initialAura
  const [auraData, setAuraData] = useState(() => {
    const { personality, ...restOfAura } = initialAura
    return {
      ...restOfAura,
      personality: {
        warmth: personality.warmth || 50,
        playfulness: personality.playfulness || 50,
        verbosity: personality.verbosity || 50,
        empathy: personality.empathy || 50,
        creativity: personality.creativity || 50,
        persona: personality.persona || "balanced",
        tone: personality.tone || "casual",
        vocabulary: personality.vocabulary || "average",
        quirks: personality.quirks || [],
      },
      senses: normalizedSenses as SenseId[],
      selectedStudyId: initialAura.selectedStudyId
        ? Number(initialAura.selectedStudyId)
        : undefined,
    }
  })

  // Keep a ref of the initial form values to detect changes
  const initialFormRef = useRef({
    name: auraData.name,
    personality: auraData.personality,
    senses: auraData.senses,
    selectedStudyId: (auraData as any).selectedStudyId,
    selectedIndividualId: (auraData as any).selectedIndividualId,
  })

  // Utility to check if form data has changed compared to initial
  const hasChanges = (): boolean => {
    const initial = initialFormRef.current
    const current = {
      name: auraData.name,
      personality: auraData.personality,
      senses: auraData.senses,
      selectedStudyId: (auraData as any).selectedStudyId,
      selectedIndividualId: (auraData as any).selectedIndividualId,
    }
    return JSON.stringify(initial) !== JSON.stringify(current)
  }

  // Scroll to top when step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const updatePersonality = (update: Partial<Personality>) => {
    setAuraData(p => ({
      ...p,
      personality: { ...p.personality, ...update },
    }))
  }

  const toggleSense = (senseId: SenseId) => {
    setAuraData(p => ({
      ...p,
      senses: p.senses.includes(senseId)
        ? p.senses.filter(id => id !== senseId)
        : [...p.senses, senseId],
    }))
  }

  const handleLocationConfig = (senseId: SenseId, config: LocationConfig) => {
    setLocationConfigs(prev => ({
      ...prev,
      [senseId]: config
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(`/api/auras/${auraData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: auraData.name,
          personality: auraData.personality,
          senses: auraData.senses,
          selectedStudyId: (auraData as any).selectedStudyId,
          selectedIndividualId: (auraData as any).selectedIndividualId,
          locationConfigs: locationConfigs,
        }),
      })
      const body = await resp.json()
      if (!resp.ok) throw new Error(body.error || "Failed to save Aura")
      setStep("rules")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step validations
  const canNextSenses = (() => {
    if (!auraData.vesselType) return false
    const cfg = VESSEL_SENSE_CONFIG[auraData.vesselType]
    const hasDefaults = cfg.defaultSenses.every(defaultSense => {
      const normalizedDefault = normalizeSenseId(defaultSense)
      return auraData.senses.some(
        selectedSense => normalizeSenseId(selectedSense) === normalizedDefault
      )
    })
    return hasDefaults
  })()
  const canNextDetails = auraData.name.trim() !== ""

  const senseConfig = VESSEL_SENSE_CONFIG[auraData.vesselType]
  const allowedSenses = AVAILABLE_SENSES.filter(s =>
    [...senseConfig.defaultSenses, ...senseConfig.optionalSenses].includes(
      s.id
    )
  )

  const onNext = () => {
    if (step === "senses") {
      setStep("details")
    } else if (step === "details") {
      if (hasChanges()) {
        handleSave()
      } else {
        setStep("rules")
      }
    }
  }
  const onBack = () => {
    if (step === "details") setStep("senses")
    else if (step === "rules") setStep("details")
  }

  const selectedVessel = vesselTypes.find(v => v.id === auraData.vesselType)
  const steps: Step[] = ["senses", "details", "rules"]

  return (
    <div className="mx-auto max-w-5xl" ref={containerRef}>
      <div className="mb-8 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
          Editing {initialAura.name}
        </h1>
        <p className="text-xl text-gray-600">
          Refine your Aura's personality, senses, and behaviors.
        </p>
      </div>

      <Card className="border-2 border-purple-100 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <div ref={stepContentRef}>
            {/* Enhanced Stepper */}
            <div className="mb-10 flex items-center justify-center px-4 sm:justify-start sm:px-0">
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center sm:flex-row">
                    <div
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                        step === s
                          ? "scale-110 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                          : i < steps.indexOf(step)
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      )}
                    >
                      {i < steps.indexOf(step) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "ml-0 mt-2 text-center font-medium transition-colors sm:ml-3 sm:mt-0 sm:text-left",
                        "text-xs sm:text-base",
                        step === s ? "text-purple-700" : "text-gray-500"
                      )}
                    >
                      {
                        {
                          senses: "Connect Senses",
                          details: "Define Personality",
                          rules: "Set Behaviors",
                        }[s]
                      }
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-1 flex-1 rounded transition-colors sm:mx-4",
                        i < steps.indexOf(step) ? "bg-green-500" : "bg-gray-200"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {selectedVessel && (
              <div
                className={cn(
                  "mb-8 rounded-xl border-2 bg-gradient-to-r p-4",
                  selectedVessel.bgColor,
                  selectedVessel.borderColor
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{selectedVessel.icon}</div>
                  <div>
                    <h3 className="font-semibold">{selectedVessel.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedVessel.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === "senses" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="mb-2 text-2xl font-bold">
                    Connect Your Aura's Senses
                  </h2>
                  <p className="text-gray-600">
                    Choose how your {selectedVessel?.name} will perceive and
                    understand the world
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
                    Give your {selectedVessel?.name} a unique character that will
                    shine through every interaction
                  </p>
                </div>

                <div className="mx-auto max-w-md">
                  <label className="mb-3 block text-center text-sm font-medium">
                    What should we call your Aura?
                  </label>
                  <Input
                    value={auraData.name}
                    onChange={e =>
                      setAuraData(p => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Give your Aura a magical name..."
                    className="border-2 border-purple-200 py-6 text-center text-lg focus:border-purple-400"
                    autoFocus
                  />
                </div>

                <PersonalityMatrix
                  personality={auraData.personality}
                  onChange={updatePersonality}
                />
              </div>
            )}

            {step === "rules" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="mb-2 text-2xl font-bold">
                    <Sparkles className="mr-2 inline h-6 w-6 text-purple-600" />
                    Teaching {auraData.name} to React
                  </h2>
                  <p className="text-gray-600">
                    Set up automatic responses so {auraData.name} can share their
                    experiences with the world
                  </p>
                </div>

                <RuleBuilder
                  auraId={auraData.id}
                  vesselType={auraData.vesselType}
                  availableSenses={auraData.senses}
                  existingRules={auraData.rules}
                  onAddRule={r =>
                    setAuraData(p => ({ ...p, rules: [...p.rules, r] }))
                  }
                  onDeleteRule={id =>
                    setAuraData(p => ({
                      ...p,
                      rules: p.rules.filter(r => r.id !== id),
                    }))
                  }
                  onToggleRule={(id, en) =>
                    setAuraData(p => ({
                      ...p,
                      rules: p.rules.map(r =>
                        r.id === id ? { ...r, enabled: en } : r
                      ),
                    }))
                  }
                />
              </div>
            )}

            {error && (
              <div className="mt-8 flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between border-t-2 border-gray-100 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={loading || step === "senses"}
                size="lg"
                className="flex-shrink-0 px-8"
              >
                Back
              </Button>

              {step !== "rules" && (
                <Button
                  onClick={onNext}
                  disabled={
                    loading ||
                    (step === "senses" && !canNextSenses) ||
                    (step === "details" && !canNextDetails)
                  }
                  size="lg"
                  className={cn(
                    "bg-gradient-to-r from-purple-600 to-blue-600 px-8 hover:from-purple-700 hover:to-blue-700",
                    step === "details" && loading && "w-36 justify-center"
                  )}
                >
                  {step === "details" && loading ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}

              {step === "rules" && (
                <Button
                  onClick={() => router.push(`/auras`)}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finish Editing
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}