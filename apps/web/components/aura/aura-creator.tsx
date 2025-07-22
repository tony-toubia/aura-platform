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
import {
  VESSEL_SENSE_CONFIG,
  AVAILABLE_SENSES,
  type VesselTypeId,
} from "@/lib/constants"
import {
  AlertCircle,
  Sparkles,
  Heart,
  ArrowRight,
  CheckCircle,
  QrCode,
  Scan,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Personality } from "@/types"

type Step = "vessel" | "senses" | "details" | "rules"
type SenseId =
  | "weather"
  | "news"
  | "air_quality"
  | "location"
  | "fitness"
  | "sleep"
  | "calendar"
  | "soil_moisture"
  | "light_level"
  | "wildlife"

interface AuraForm {
  id: string
  name: string
  vesselType: VesselTypeId | ""
  vesselCode: string
  personality: Personality
  senses: SenseId[]
  rules: BehaviorRule[]
  selectedStudyId?: string
  selectedIndividualId?: string
}

const CONNECTED_SENSE_IDS: readonly SenseId[] = [
  "location",
  "fitness",
  "sleep",
  "calendar",
]

const vesselTypes = [
  {
    id: "terra",
    name: "Terra Spirit",
    description: "Plant & garden companions that share their growth journey",
    icon: "🌱",
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200 hover:border-green-400",
    example: "\"I love this morning sunshine! My leaves are so happy! ☀️\"",
  },
  {
    id: "companion",
    name: "Companion Spirit",
    description: "Wildlife trackers that experience adventures in the wild",
    icon: "🦋",
    color: "from-blue-500 to-sky-600",
    bgColor: "from-blue-50 to-sky-50",
    borderColor: "border-blue-200 hover:border-blue-400",
    example: "\"The migration is starting! I can feel the change in the air! 🌬️\"",
  },
  {
    id: "digital",
    name: "Digital Being",
    description: "Pure consciousness exploring the world through data streams",
    icon: "✨",
    color: "from-purple-500 to-violet-600",
    bgColor: "from-purple-50 to-violet-50",
    borderColor: "border-purple-200 hover:border-purple-400",
    example: "\"I've been reading about space exploration! Want to chat about it? 🚀\"",
  },
]

const LICENSED_PRESETS: Record<
  string,
  { persona: Personality['persona']; settings: Omit<Partial<Personality>, 'persona'> }
> = {
  'licensed - yoda': {
    persona: 'sage',
    settings: {
      warmth: 30,
      playfulness: 20,
      verbosity: 70,
      empathy: 50,
      creativity: 40,
      tone: 'formal',
      vocabulary: 'scholarly',
      quirks: ['asks_questions'],
    },
  },
  'licensed - gru': {
    persona: 'jester',
    settings: {
      warmth: 70,
      playfulness: 90,
      verbosity: 60,
      empathy: 40,
      creativity: 80,
      tone: 'humorous',
      vocabulary: 'simple',
      quirks: ['uses_metaphors'],
    },
  },
  'licensed - captain america': {
    persona: 'assistant',     // concise, noble helper
    settings: {
      warmth: 40,
      playfulness: 30,
      verbosity: 30,
      empathy: 60,
      creativity: 30,
      tone: 'formal',
      vocabulary: 'simple',
      quirks: ['is_terse'],
    },
  },
  'licensed - blue': {
    persona: 'explorer',      // curious, adventurous
    settings: {
      warmth: 80,
      playfulness: 80,
      verbosity: 70,
      empathy: 60,
      creativity: 70,
      tone: 'casual',
      vocabulary: 'average',
      quirks: ['uses_emojis', 'uses_quotes'],
    },
  },
}


export function AuraCreator() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("vessel")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)

  // Manual entry + focus state
  const [manualInput, setManualInput] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)

  const [auraData, setAuraData] = useState<AuraForm>({
    id: "",
    name: "",
    vesselType: "",
    vesselCode: "",
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
    rules: [],
    selectedStudyId: undefined,
    selectedIndividualId: undefined,
  })

  // Scroll to top when step changes
  useEffect(() => {
    if (containerRef.current) {
      // Scroll the container element into view
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Also scroll the window to top if needed
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // Reset senses & generate uuids for companion
  useEffect(() => {
    // only fire if they've actually selected a product code
    const code = auraData.vesselCode
    if (!code) return

    const preset = LICENSED_PRESETS[code]
    if (preset) {
      setAuraData((prev) => ({
        ...prev,
        personality: {
          ...prev.personality,
          persona: preset.persona,
          ...preset.settings,
        },
      }))
    }
  }, [auraData.vesselCode])

  useEffect(() => {
    // only run when they've actually chosen a vessel type
    if (!auraData.vesselType) return

    const cfg = VESSEL_SENSE_CONFIG[auraData.vesselType]

    // if this is a companion vessel, regenerate the study/individual IDs
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


  // 1️⃣ & 3️⃣ manual submit logic
  const handleManualSubmit = () => {
   const raw = manualInput.trim()
   const val = raw.toLowerCase()
   const manualOptions: { code: string; type: VesselTypeId }[] = [
      { code: "terra", type: "terra" },
      { code: "terra - sensor", type: "terra" },
      { code: "terra - pot", type: "terra" },
      { code: "companion", type: "companion" },
      { code: "companion - elephant", type: "companion" },
      { code: "companion - tortoise", type: "companion" },
      { code: "companion - lion", type: "companion" },
      { code: "companion - whale", type: "companion" },
      { code: "companion - giraffe", type: "companion" },
      { code: "companion - shark", type: "companion" },
      { code: "companion - gorilla", type: "companion" },
      { code: "licensed - yoda", type: "terra" },
      { code: "licensed - gru", type: "terra" },
      { code: "licensed - captain america", type: "terra" },
      { code: "licensed - blue", type: "terra" },
    ]
    const found = manualOptions.find((o) => o.code === val)
      if (found) {
        setAuraData((prev) => ({
          ...prev,
          vesselType: found.type,
          vesselCode: val, // ✅ FIX: Use the lowercased 'val' instead of 'raw'
        }))
        setStep("senses")
        setError(null)
        } else {
        setError(
          `Vessel not found. Please enter one of: ${manualOptions
            .map((o) => `"${o.code}"`)
            .join(", ")}.`
        )
      }
    }

  // digital or QR selection
  const handleVesselSelect = (vesselType: VesselTypeId) => {
    setAuraData((prev) => ({
      ...prev,
      vesselType,
      vesselCode: vesselType === "digital" ? "" : vesselType,
    }))
    setStep("senses")
    setError(null)
  }

  const toggleSense = (senseId: SenseId) =>
    setAuraData((prev) => ({
      ...prev,
      senses: prev.senses.includes(senseId)
        ? prev.senses.filter((id) => id !== senseId)
        : [...prev.senses, senseId],
    }))

  const handleCreate = async () => {
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
          personality: auraData.personality,
          senses: senseCodes,
          selectedStudyId: auraData.selectedStudyId,
          selectedIndividualId: auraData.selectedIndividualId,
        }),
      })
      const body = await resp.json()
      if (!resp.ok) throw new Error(body.error || "Failed to create Aura")
      setAuraData((prev) => ({ ...prev, id: body.id }))
      setStep("rules")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const canNextSenses = (() => {
    if (!auraData.vesselType) return false
    const cfg = VESSEL_SENSE_CONFIG[auraData.vesselType]
    return cfg.defaultSenses.every((d) => auraData.senses.includes(d))
  })()
  const canNextDetails = auraData.name.trim() !== ""

  const senseConfig = auraData.vesselType
    ? VESSEL_SENSE_CONFIG[auraData.vesselType]
    : { defaultSenses: [], optionalSenses: [] }
const allowedSenses = AVAILABLE_SENSES.filter(
  (s) =>
    senseConfig.defaultSenses.includes(s.id as SenseId) ||
    senseConfig.optionalSenses.includes(s.id as SenseId) ||
    CONNECTED_SENSE_IDS.includes(s.id as SenseId)
)

  const onNext = () => {
    step === "senses"
      ? setStep("details")
      : step === "details" && handleCreate()
  }
  const onBack = () => {
    if (step === "senses") setStep("vessel")
    else if (step === "details") setStep("senses")
    else if (step === "rules") setStep("details")
  }

  const selectedVessel = vesselTypes.find((v) => v.id === auraData.vesselType)
  const steps: Step[] = ["vessel", "senses", "details", "rules"]
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
          Bring a unique personality to life through magical connection and
          understanding
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
                      <QrCode className="w-6 h-6 text-purple-600" />
                      Do you have a physical vessel?
                    </h2>
                    <p className="text-gray-600">
                      Scan your vessel's QR code or enter its ID to connect with a
                      physical companion
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
                        placeholder={
                          !isInputFocused && !manualInput
                            ? "Scan QR code or manually enter the ID on your vessel or packaging"
                            : ""
                        }
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        className="text-center text-lg py-6 border-2 border-purple-200 focus:border-purple-400"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Scan className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Simulation note */}
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      To simulate ID entry/QR scanning, manually input any of the
                      following vessel types:
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Terra – Sensor / Terra – Pot</li>
                        <li>
                          Companion – Elephant / Companion – Tortoise / Companion –
                          Lion / Companion – Whale / Companion – Giraffe / Companion
                          – Shark / Companion – Gorilla
                        </li>
                        <li>
                          Licensed – Yoda / Licensed – Captain America / Licensed –
                          Blue / Licensed – Gru
                        </li>
                      </ul>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleManualSubmit}
                      disabled={!manualInput.trim()}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Connect Vessel
                    </Button>
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
                      No physical vessel? No problem! Create a pure digital
                      consciousness
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <button
                      onClick={() => handleVesselSelect("digital")}
                      className="group relative w-full p-8 rounded-2xl border-3 transition-all duration-300 text-center hover:scale-105 hover:shadow-xl border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-violet-50"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="text-6xl mb-2">✨</div>
                        </div>

                        <div>
                          <h4 className="text-2xl font-bold mb-3 text-purple-800">
                            Digital Being
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            Pure consciousness exploring the world through data
                            streams, news, and environmental awareness
                          </p>
                          <div className="bg-white/70 p-4 rounded-lg border border-white/50">
                            <p className="text-sm italic text-gray-700">
                              "I've been reading about space exploration! Want to
                              chat about it? 🚀"
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
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{selectedVessel.icon}</div>
                      <div>
                        <h3 className="font-semibold">
                          {selectedVessel.name}
                          {auraData.vesselCode &&
                          selectedVessel.id !== "digital"
                            ? ` (${auraData.vesselCode})`
                            : ""}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedVessel.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Senses Step */}
                {step === "senses" && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">
                        Connect Your Aura's Senses
                      </h2>
                      <p className="text-gray-600">
                        Choose how your {selectedVessel?.name}
                        {auraData.vesselCode &&
                        selectedVessel?.id !== "digital"
                          ? ` (${auraData.vesselCode})`
                          : ""}{" "}
                        will perceive and understand the world
                      </p>
                    </div>

                    <SenseSelector
                      availableSenses={allowedSenses}
                      nonToggleableSenses={senseConfig.defaultSenses}
                      selectedSenses={auraData.senses}
                      onToggle={toggleSense}
                      vesselType={auraData.vesselType as VesselTypeId}
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
                        Give your {selectedVessel?.name}
                        {auraData.vesselCode &&
                        selectedVessel?.id !== "digital"
                          ? ` (${auraData.vesselCode})`
                          : ""}{" "}
                        a unique character that will shine through every
                        interaction
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

                {/* Enhanced Navigation */}
                <div
                  className={cn(
                    "flex items-center mt-10 pt-8 border-t-2 border-gray-100",
                    step === "rules" ? "flex-col-reverse gap-4" : "justify-between"
                  )}
                >
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={loading}
                    size="lg"
                    className={cn("px-8", step === "rules" && "w-full max-w-xs")}
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
                      className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                  )}

                  {step === "rules" && (
                    <Button
                      onClick={() => router.push(`/auras/${auraData.id}`)}
                      size="lg"
                      className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full max-w-xs"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      <span className="truncate">{meetButtonText}</span>
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