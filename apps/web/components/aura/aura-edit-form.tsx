// apps/web/components/aura/aura-edit-form.tsx
"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { VESSEL_TYPES, AVAILABLE_SENSES } from "@/lib/constants"
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

export interface AuraForm {
  id: string
  name: string
  vesselType: "digital" | "terra" | "companion" | "memory" | "sage"
  personality: {
    warmth: number
    playfulness: number
    verbosity: number
    empathy: number
    creativity: number
  }
  senses: string[]
  rules: BehaviorRule[]
}

interface AuraEditFormProps {
  initialAura: AuraForm
}

export function AuraEditForm({ initialAura }: AuraEditFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as
    | "basics"
    | "personality"
    | "senses"
    | "rules") ?? "basics"

  const [activeTab, setActiveTab] = useState<typeof initialTab>(initialTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [auraData, setAuraData] = useState<AuraForm>(initialAura)

  // track editing-rule state if needed
  const [editingRule, setEditingRule] = useState<BehaviorRule | null>(null)

  const updatePersonality = (trait: string, value: number) =>
    setAuraData((p) => ({ ...p, personality: { ...p.personality, [trait]: value } }))
  const toggleSense = (senseId: string) =>
    setAuraData((p) => ({
      ...p,
      senses: p.senses.includes(senseId)
        ? p.senses.filter((id) => id !== senseId)
        : [...p.senses, senseId],
    }))

  const handleSaveAura = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/auras/${encodeURIComponent(auraData.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: auraData.name,
          vesselType: auraData.vesselType,
          personality: auraData.personality,
          senses: auraData.senses,
        }),
      })
      if (!res.ok) throw new Error("Failed to save Aura")
      router.push(`/auras/${auraData.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Aura</CardTitle>
          <CardDescription>Modify your Aura's settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics" className="flex items-center gap-2">
                <Info className="w-4 h-4" /> Basics
              </TabsTrigger>
              <TabsTrigger value="personality" className="flex items-center gap-2">
                <Brain className="w-4 h-4" /> Personality
              </TabsTrigger>
              <TabsTrigger value="senses" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Senses
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" /> Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-6">
              {/* …basics content… */}
            </TabsContent>

            <TabsContent value="personality">
              <PersonalityMatrix
                personality={auraData.personality}
                onChange={updatePersonality}
              />
            </TabsContent>

            <TabsContent value="senses">
              <SenseSelector
                availableSenses={AVAILABLE_SENSES}
                selectedSenses={auraData.senses}
                onToggle={toggleSense}
              />
            </TabsContent>

            <TabsContent value="rules">
              <RuleBuilder
                auraId={auraData.id}
                vesselType={auraData.vesselType}
                availableSenses={auraData.senses}
                existingRules={auraData.rules}
                editingRule={editingRule}
                onEditRule={setEditingRule}
                onSaveEditedRule={(r) =>
                  setAuraData((p) => ({
                    ...p,
                    rules: p.rules.map((x) => (x.id === r.id ? r : x)),
                  }))
                }
                onAddRule={(r) => setAuraData((p) => ({ ...p, rules: [...p.rules, r] }))}
                onDeleteRule={(id) =>
                  setAuraData((p) => ({ ...p, rules: p.rules.filter((x) => x.id !== id) }))
                }
                onToggleRule={(id, en) =>
                  setAuraData((p) => ({
                    ...p,
                    rules: p.rules.map((x) => (x.id === id ? { ...x, enabled: en } : x)),
                  }))
                }
              />
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {activeTab !== "rules" && (
            <div className="flex justify-end mt-8 pt-6 border-t">
              <Button onClick={handleSaveAura} disabled={loading} size="lg">
                <Save className="w-4 h-4" />
                {loading ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
