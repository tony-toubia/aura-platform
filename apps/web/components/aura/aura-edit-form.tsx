"use client"

import React, { useState, useEffect } from "react"
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
import { AnimalSelector } from "./animal-selector"
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
  Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Aura } from "@/types"

type Step = "senses" | "details" | "rules"

const vesselTypes = [
  {
    id: "terra",
    name: "Terra Spirit",
    description: "Plant & garden companions that share their growth journey",
    icon: "🌱",
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
  },
  {
    id: "companion", 
    name: "Companion Spirit",
    description: "Wildlife trackers that experience adventures in the wild",
    icon: "🦋",
    color: "from-blue-500 to-sky-600", 
    bgColor: "from-blue-50 to-sky-50",
    borderColor: "border-blue-200",
  },
  {
    id: "digital",
    name: "Digital Being", 
    description: "Pure consciousness exploring the world through data streams",
    icon: "✨",
    color: "from-purple-500 to-violet-600",
    bgColor: "from-purple-50 to-violet-50", 
    borderColor: "border-purple-200",
  }
]

interface AuraEditFormProps {
  initialAura: Aura
}

export function AuraEditForm({ initialAura }: AuraEditFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") as Step | null
  
  const [step, setStep] = useState<Step>(initialTab || "senses")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // FIX: Initialize state with a normalized structure to ensure selectedStudyId is a number, matching the creator logic.
  const [auraData, setAuraData] = useState({
    ...initialAura,
    selectedStudyId: initialAura.selectedStudyId ? Number(initialAura.selectedStudyId) : undefined,
  })

  const updatePersonality = (trait: string, value: number) =>
    setAuraData((p) => ({ ...p, personality: { ...p.personality, [trait]: value } }))

  const toggleSense = (senseId: string) =>
    setAuraData((p) => ({
      ...p,
      senses: p.senses.includes(senseId)
        ? p.senses.filter((id) => id !== senseId)
        : [...p.senses, senseId],
    }))

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
          selectedStudyId: auraData.selectedStudyId,
          selectedIndividualId: auraData.selectedIndividualId,
        }),
      })
      const body = await resp.json()
      if (!resp.ok) throw new Error(body.error || "Failed to save Aura")
      // On successful save, move to the next step
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
    const hasDefaults = cfg.defaultSenses.every((d) =>
      auraData.senses.includes(d)
    )
    const hasAnimal =
      auraData.vesselType !== "companion" ||
      (auraData.selectedStudyId && auraData.selectedIndividualId)
    return hasDefaults && hasAnimal
  })()
  const canNextDetails = auraData.name.trim() !== ""

  // Determine allowed senses
  const senseConfig = VESSEL_SENSE_CONFIG[auraData.vesselType]
  const allowedSenses = AVAILABLE_SENSES.filter((s) =>
    [...senseConfig.defaultSenses, ...senseConfig.optionalSenses].includes(
      s.id
    )
  )

  const onNext = () => {
    if (step === "senses") setStep("details")
    else if (step === "details") handleSave()
  }
  const onBack = () => {
    if (step === "details") setStep("senses")
    else if (step === "rules") setStep("details")
  }

  const selectedVessel = vesselTypes.find(v => v.id === auraData.vesselType)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Editing {initialAura.name}
        </h1>
        <p className="text-xl text-gray-600">
          Refine your Aura's personality, senses, and behaviors.
        </p>
      </div>

      <Card className="backdrop-blur-sm bg-white/95 border-2 border-purple-100 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center mb-10">
            {(["senses", "details", "rules"] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center">
                  <div
                    className={cn(
                      "rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold transition-all duration-300",
                      step === s
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110"
                        : i < (["senses", "details", "rules"] as Step[]).indexOf(step)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {i < (["senses", "details", "rules"] as Step[]).indexOf(step) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={cn(
                    "ml-3 font-medium transition-colors",
                    step === s ? "text-purple-700" : "text-gray-500"
                  )}>
                    {{
                      senses: "Connect Senses", 
                      details: "Define Personality",
                      rules: "Set Behaviors",
                    }[s]}
                  </span>
                </div>
                {i < 2 && <div className={cn(
                  "flex-1 h-1 mx-4 rounded transition-colors",
                  i < (["senses", "details", "rules"] as Step[]).indexOf(step)
                    ? "bg-green-500"
                    : "bg-gray-200"
                )} />}
              </React.Fragment>
            ))}
          </div>

          {selectedVessel && (
            <div className={cn(
              "mb-8 p-4 rounded-xl border-2 bg-gradient-to-r",
              selectedVessel.bgColor,
              selectedVessel.borderColor
            )}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{selectedVessel.icon}</div>
                <div>
                  <h3 className="font-semibold">{selectedVessel.name}</h3>
                  <p className="text-sm text-gray-600">{selectedVessel.description}</p>
                </div>
              </div>
            </div>
          )}

          {step === "senses" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Connect Your Aura's Senses</h2>
                <p className="text-gray-600">
                  Choose how your {selectedVessel?.name} will perceive and understand the world
                </p>
              </div>

              {auraData.vesselType === "companion" && (
                <AnimalSelector
                  onStudyChange={(sid) =>
                    setAuraData((p) => ({ ...p, selectedStudyId: sid }))
                  }
                  onIndividualChange={(iid) =>
                    setAuraData((p) => ({
                      ...p,
                      selectedIndividualId: iid,
                    }))
                  }
                />
              )}
              
              <SenseSelector
                availableSenses={allowedSenses}
                nonToggleableSenses={senseConfig.defaultSenses}
                selectedSenses={auraData.senses}
                onToggle={toggleSense}
              />
            </div>
          )}

          {step === "details" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Shape Their Personality</h2>
                <p className="text-gray-600">
                  Give your {selectedVessel?.name} a unique character that will shine through every interaction
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
                <h2 className="text-2xl font-bold mb-2">
                  <Sparkles className="w-6 h-6 inline mr-2 text-purple-600" />
                  Teaching {auraData.name} to React
                </h2>
                <p className="text-gray-600">
                  Set up automatic responses so {auraData.name} can share their experiences with the world
                </p>
              </div>

              <RuleBuilder
                auraId={auraData.id}
                vesselType={auraData.vesselType}
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
            </div>
          )}

          {error && (
            <div className="mt-8 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-10 pt-8 border-t-2 border-gray-100">
            <Button 
              variant="outline" 
              onClick={onBack} 
              disabled={loading || step === 'senses'}
              size="lg"
              className="px-8"
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
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
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
                onClick={() => router.push(`/auras`)}
                size="lg"
                className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finish Editing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
