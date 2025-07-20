// apps/web/components/aura/aura-creator.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule } from "@/types"

type Step = "vessel" | "senses" | "details" | "rules"

interface AuraForm {
  id: string
  name: string
  vesselType: VesselTypeId | ""
  vesselCode: string
  personality: {
    warmth: number
    playfulness: number
    verbosity: number
    empathy: number
    creativity: number
  }
  senses: string[]
  rules: BehaviorRule[]
  selectedStudyId?: number
  selectedIndividualId?: string
}

export function AuraCreator() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("vessel")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState("")

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
    },
    senses: [],
    rules: [],
    selectedStudyId: undefined,
    selectedIndividualId: undefined,
  })

  // Whenever vesselType changes, reset senses & companion selections to defaults
  useEffect(() => {
    if (!auraData.vesselType) return

    const cfg = VESSEL_SENSE_CONFIG[auraData.vesselType]
    setAuraData((prev) => ({
      ...prev,
      senses: cfg.defaultSenses,
      selectedStudyId: undefined,
      selectedIndividualId: undefined,
    }))
    setError(null)
  }, [auraData.vesselType])

  // Handle manual QR / ID entry
  const handleManualSubmit = () => {
    const val = manualInput.trim().toLowerCase()
    if (val === "terra" || val === "companion") {
      setAuraData((prev) => ({
        ...prev,
        vesselType: val as VesselTypeId,
        vesselCode: val,
      }))
      setStep("senses")
      setError(null)
    } else {
      setError('Vessel not found. Please enter "terra" or "companion".')
    }
  }

  // Handle quick digital-vessel creation
  const handleDigitalSelect = () => {
    setAuraData((prev) => ({
      ...prev,
      vesselType: "digital",
      vesselCode: "",
    }))
    setStep("senses")
    setError(null)
  }

  const toggleSense = (senseId: string) =>
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

  // Validation for senses & details steps
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

  // Derive which senses to show
  const senseConfig = auraData.vesselType
    ? VESSEL_SENSE_CONFIG[auraData.vesselType]
    : { defaultSenses: [], optionalSenses: [] }
  const allowedSenses = AVAILABLE_SENSES.filter((s) =>
    [...senseConfig.defaultSenses, ...senseConfig.optionalSenses].includes(
      s.id
    )
  )

  const onNext = () => {
    if (step === "senses") setStep("details")
    else if (step === "details") handleCreate()
  }
  const onBack = () => {
    if (step === "senses") setStep("vessel")
    else if (step === "details") setStep("senses")
    else if (step === "rules") setStep("details")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Aura</CardTitle>
          <CardDescription>
            Follow the steps below to configure your Aura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* === STEP: Vessel === */}
          {step === "vessel" ? (
            <div className="flex flex-col items-center space-y-6 py-10">
              <h2 className="text-xl font-semibold text-center">
                Scan a vessel QR code or enter vessel ID
              </h2>
              <Input
                value={manualInput}
                onChange={(e) => {
                  setManualInput(e.target.value)
                  setError(null)
                }}
                placeholder='Enter "terra" or "companion"'
                className="max-w-sm"
              />
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                size="lg"
              >
                Continue
              </Button>
              <div className="text-sm text-gray-500">— OR —</div>
              <Button variant="outline" onClick={handleDigitalSelect} size="lg">
                Create a digital vessel aura
              </Button>
            </div>
          ) : (
            <>
              {/* === Stepper === */}
              <div className="flex items-center mb-8">
                {(["vessel", "senses", "details", "rules"] as Step[]).map(
                  (s, i) => (
                    <React.Fragment key={s}>
                      <div
                        className={cn(
                          "flex items-center",
                          step === s ? "text-purple-700" : "text-gray-400"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-full w-8 h-8 flex items-center justify-center",
                            step === s
                              ? "bg-purple-700 text-white"
                              : "bg-gray-200"
                          )}
                        >
                          {i + 1}
                        </div>
                        <span className="ml-2 capitalize">
                          {{
                            vessel: "Vessel",
                            senses: "Senses",
                            details: "Details",
                            rules: "Rules",
                          }[s]}
                        </span>
                      </div>
                      {i < 3 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
                    </React.Fragment>
                  )
                )}
              </div>

              {/* === STEP CONTENT === */}
              {step === "senses" && (
                <>
                  {auraData.vesselType === "companion" && (
                    <AnimalSelector
                      onStudyChange={(sid) =>
                        setAuraData((prev) => ({ ...prev, selectedStudyId: sid }))
                      }
                      onIndividualChange={(iid) =>
                        setAuraData((prev) => ({
                          ...prev,
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
                </>
              )}

              {step === "details" && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Aura Name
                    </label>
                    <Input
                      value={auraData.name}
                      onChange={(e) =>
                        setAuraData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Give your Aura a unique name"
                    />
                  </div>
                  <PersonalityMatrix
                    personality={auraData.personality}
                    onChange={(trait, value) =>
                      setAuraData((prev) => ({
                        ...prev,
                        personality: { ...prev.personality, [trait]: value },
                      }))
                    }
                  />
                </>
              )}

              {step === "rules" && (
                <RuleBuilder
                  auraId={auraData.id}
                  availableSenses={auraData.senses}
                  existingRules={auraData.rules}
                  onAddRule={(rule) =>
                    setAuraData((prev) => ({
                      ...prev,
                      rules: [...prev.rules, rule],
                    }))
                  }
                  onDeleteRule={(ruleId) =>
                    setAuraData((prev) => ({
                      ...prev,
                      rules: prev.rules.filter((r) => r.id !== ruleId),
                    }))
                  }
                  onToggleRule={(ruleId, enabled) =>
                    setAuraData((prev) => ({
                      ...prev,
                      rules: prev.rules.map((r) =>
                        r.id === ruleId ? { ...r, enabled } : r
                      ),
                    }))
                  }
                />
              )}

              {/* === API / creation error === */}
              {error && (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* === Navigation === */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={loading}
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
                    className="flex items-center gap-2"
                  >
                    {step === "details" && loading ? "Creating…" : "Next"}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
