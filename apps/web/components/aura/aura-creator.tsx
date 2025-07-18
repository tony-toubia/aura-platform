// apps/web/components/aura/aura-creator.tsx
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RuleBuilder } from "./rule-builder"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PersonalityMatrix } from "./personality-matrix"
import { SenseSelector } from "./sense-selector"
import { AnimalSelector } from "./animal-selector"
import { VESSEL_TYPES } from "@/lib/constants"
import {
  Info,
  Brain,
  Wifi,
  GitBranch,
  Save,
  Check,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule } from "@/types"

interface AuraForm {
  id: string
  name: string
  vesselType: "terra" | "companion" | "memory" | "sage"
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
  const [activeTab, setActiveTab] = useState("basics")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [auraData, setAuraData] = useState<AuraForm>({
    id: "",
    name: "",
    vesselType: "terra",
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

  const updatePersonality = (trait: string, value: number) =>
    setAuraData((prev) => ({
      ...prev,
      personality: { ...prev.personality, [trait]: value },
    }))

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
          personality: auraData.personality,
          senses: senseCodes,
          selectedStudyId: auraData.selectedStudyId,
          selectedIndividualId: auraData.selectedIndividualId,
        }),
      })
      const body = await resp.json()
      if (!resp.ok) throw new Error(body.error || "Failed to create Aura")

      setAuraData((prev) => ({ ...prev, id: body.id }))
      setActiveTab("rules")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const canCreate = Boolean(auraData.name && auraData.senses.length)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Aura</CardTitle>
          <CardDescription>
            Design a unique personality that will inhabit your chosen vessel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basics" className="flex items-center gap-2">
                <Info className="w-4 h-4" /> Basics
              </TabsTrigger>
              <TabsTrigger
                value="personality"
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" /> Personality
              </TabsTrigger>
              <TabsTrigger value="senses" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Senses
              </TabsTrigger>
              <TabsTrigger
                value="rules"
                disabled={!auraData.id}
                className="flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" /> Rules
              </TabsTrigger>
            </TabsList>

            {/* BASICS */}
            <TabsContent value="basics" className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Aura Name
                </label>
                <Input
                  placeholder="Give your Aura a unique name..."
                  value={auraData.name}
                  onChange={(e) =>
                    setAuraData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-4">
                  Select Vessel Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {VESSEL_TYPES.map((v) => {
                    const isSelected = auraData.vesselType === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          setAuraData((prev) => ({
                            ...prev,
                            vesselType: v.id,
                          }))
                        }
                        className={cn(
                          "relative p-6 rounded-xl border-2 transition-all group",
                          isSelected
                            ? "border-purple-700 bg-purple-50 shadow-md"
                            : "border-border hover:border-gray-300"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-purple-700 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <div className="text-4xl mb-3">{v.icon}</div>
                        <div className="font-semibold text-lg mb-1">
                          {v.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {v.description}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            {/* PERSONALITY */}
            <TabsContent value="personality">
              <PersonalityMatrix
                personality={auraData.personality}
                onChange={updatePersonality}
              />
            </TabsContent>

            {/* SENSES */}
            <TabsContent value="senses" className="space-y-6">
              {/* only for Companion vessels */}
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
                selectedSenses={auraData.senses}
                onToggle={toggleSense}
              />
            </TabsContent>

            {/* RULES */}
            <TabsContent value="rules">
              {!auraData.id ? (
                <div className="p-8 text-center text-gray-700">
                  <p className="mb-2">Please finish creating the Aura first.</p>
                  <Button
                    onClick={handleCreate}
                    disabled={!canCreate || loading}
                  >
                    {loading ? "Creating…" : "Create Aura"}
                  </Button>
                </div>
              ) : (
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
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Create Button on Basics/Personality/Senses */}
          {["basics", "personality", "senses"].includes(activeTab) && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                {canCreate ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Ready to create
                  </span>
                ) : (
                  <span>Complete all required fields</span>
                )}
              </div>
              <Button
                onClick={handleCreate}
                disabled={!canCreate || loading}
                size="lg"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Creating…" : "Create Aura"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
