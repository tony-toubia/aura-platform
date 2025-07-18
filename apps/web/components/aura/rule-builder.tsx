// apps/web/components/aura/rule-builder.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Trash2,
  Plus,
  Edit2,
  Zap,
  Leaf,
  Globe,
} from "lucide-react"
import type { BehaviorRule } from "@/types"

interface RuleBuilderProps {
  auraId: string
  availableSenses: string[]
  existingRules?: BehaviorRule[]
  editingRule?: BehaviorRule | null
  onEditRule?: (rule: BehaviorRule | null) => void
  onSaveEditedRule?: (rule: BehaviorRule) => void
  onAddRule: (rule: BehaviorRule) => void
  onDeleteRule?: (ruleId: string) => void
  onToggleRule?: (ruleId: string, enabled: boolean) => void
}

const SENSOR_OPTIONS = {
  "weather.temperature": "Weather Temperature",
  "weather.humidity": "Weather Humidity",
  "soil_moisture.value": "Soil Moisture",
  "light_level.value": "Light Level",
  "air_quality.aqi": "Air Quality Index",
}
const OPERATORS = {
  "<": "Less than",
  "<=": "Less than or equal",
  ">": "Greater than",
  ">=": "Greater than or equal",
  "==": "Equals",
  "!=": "Not equals",
}

export function RuleBuilder({
  auraId,
  availableSenses,
  existingRules = [],
  editingRule = null,
  onEditRule,
  onSaveEditedRule,
  onAddRule,
  onDeleteRule,
  onToggleRule,
}: RuleBuilderProps) {
  const router = useRouter()

  // form state
  const [ruleName, setRuleName] = useState("")
  const [selectedSensor, setSelectedSensor] = useState("")
  const [operator, setOperator] = useState<string>(">")
  const [threshold, setThreshold] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [priority, setPriority] = useState("5")
  const [cooldown, setCooldown] = useState("300")

  const isEditing = editingRule !== null
  const nameInputRef = useRef<HTMLInputElement>(null)

  // preload form when editingRule changes
  useEffect(() => {
    if (editingRule) {
      setRuleName(editingRule.name)
      setSelectedSensor(editingRule.trigger.sensor || "")
      setOperator(editingRule.trigger.operator || ">")
      setThreshold(String(editingRule.trigger.value ?? ""))
      setActionMessage(editingRule.action.message || "")
      setPriority(String(editingRule.priority ?? 0))
      setCooldown(String(editingRule.trigger.cooldown ?? 0))
      // scroll into view + autofocus
      setTimeout(() => {
        nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [editingRule])

  const clearForm = () => {
    setRuleName("")
    setSelectedSensor("")
    setOperator(">")
    setThreshold("")
    setActionMessage("")
    setPriority("5")
    setCooldown("300")
    onEditRule?.(null)
  }

  const handleAddOrSave = async () => {
    if (!ruleName || !selectedSensor || !threshold || !actionMessage) return

    const payload = {
      auraId,
      name: ruleName,
      trigger: {
        type: "simple",
        sensor: selectedSensor,
        operator,
        value: parseFloat(threshold),
        cooldown: parseInt(cooldown, 10),
      },
      action: {
        type: "respond",
        message: actionMessage,
        severity: "info",
      },
      priority: parseInt(priority, 10),
      enabled: true,
    }

    if (isEditing && editingRule) {
      // update existing
      const res = await fetch(`/api/behavior-rules/${editingRule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        console.error("Failed to save rule", await res.text())
        return
      }
      const updated: BehaviorRule = await res.json()
      onSaveEditedRule?.(updated)
    } else {
      // create new
      const res = await fetch("/api/behavior-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        console.error("Failed to save rule:", await res.text())
        return
      }
      const newRule: BehaviorRule = await res.json()
      onAddRule(newRule)
    }

    clearForm()
    router.refresh()
  }

  const getSensorIcon = (sensor: string) => {
    if (sensor.includes("temperature")) return "🌡️"
    if (sensor.includes("moisture"))     return "💧"
    if (sensor.includes("light"))        return "☀️"
    if (sensor.includes("air"))          return "💨"
    return "📊"
  }

  return (
    <div className="space-y-6">
      {/* Active Rules List */}
      {existingRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Rules</CardTitle>
            <CardDescription>Your Aura will respond when these conditions are met</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-gray-50"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getSensorIcon(rule.trigger.sensor || "")}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      {rule.enabled ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      IF{" "}
                      {SENSOR_OPTIONS[rule.trigger.sensor as keyof typeof SENSOR_OPTIONS] ||
                        rule.trigger.sensor}{" "}
                      {OPERATORS[rule.trigger.operator as keyof typeof OPERATORS]}{" "}
                      {rule.trigger.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      THEN: "{rule.action.message}"
                    </p>
                    {rule.trigger.cooldown && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Cooldown: {rule.trigger.cooldown}s
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditRule?.(rule)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {onToggleRule && (
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(ch) => onToggleRule(rule.id, ch)}
                    />
                  )}
                  {onDeleteRule && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteRule(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Rule" : "Add New Rule"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Modify this rule’s settings"
              : "Create automatic responses based on sensor conditions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rule Name</label>
            <Input
              ref={nameInputRef}
              placeholder="e.g., Low Moisture Alert"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sensor</label>
              <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sensor" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SENSOR_OPTIONS).map(([val, lab]) => (
                    <SelectItem key={val} value={val}>
                      {lab}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Condition</label>
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OPERATORS).map(([val, lab]) => (
                    <SelectItem key={val} value={val}>
                      {lab}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Value</label>
              <Input
                type="number"
                placeholder="e.g., 20"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Response Message</label>
            <Input
              placeholder="I’m thirsty! Soil moisture is low."
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{sensor.path}"} to include sensor values
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Priority (1–10)</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cooldown (sec)</label>
              <Input
                type="number"
                min="0"
                value={cooldown}
                onChange={(e) => setCooldown(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAddOrSave} className="w-full">
            {isEditing ? "Save Changes" : <><Plus className="w-4 h-4 mr-2" />Add Rule</>}
          </Button>
          {isEditing && (
            <Button
              variant="outline"
              onClick={clearForm}
              className="mt-2 w-full"
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Rule Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Examples</CardTitle>
          <CardDescription>Common rules for different vessel types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Terra (Plant)
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Alert when soil moisture drops below 20%</li>
              <li>• Celebrate when light level exceeds 1000 lux</li>
              <li>• Warn about extreme temperatures</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" /> Companion (Wildlife)
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Notify about extreme weather in habitat</li>
              <li>• Alert when tracked animal moves unusually fast</li>
              <li>• Share updates during migration seasons</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
