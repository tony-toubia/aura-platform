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
  vesselType?: string
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
  vesselType,
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
              ? "Modify this rule's settings"
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
              placeholder="I'm thirsty! Soil moisture is low."
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
          <CardTitle>Quick Start Templates</CardTitle>
          <CardDescription>Click any example to pre-configure the rule form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Digital Rules - only show if vesselType is digital */}
          {vesselType === "digital" && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" /> Digital Rules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* News Alert - only if news sense is available */}
                {availableSenses.includes("news") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Breaking News Alert")
                      setSelectedSensor("news.importance")
                      setOperator(">")
                      setThreshold("7")
                      setActionMessage("🚨 Breaking news detected with importance level {sensor.value}! Something significant is happening.")
                      setPriority("9")
                      setCooldown("3600")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">📰 Breaking News Alert</div>
                    <div className="text-sm text-muted-foreground">When news importance {">"} 7</div>
                  </Button>
                )}

                {/* Wildlife Movement Alert - only if wildlife sense is available */}
                {availableSenses.includes("wildlife") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Wildlife Activity Spike")
                      setSelectedSensor("wildlife.activity")
                      setOperator(">")
                      setThreshold("80")
                      setActionMessage("🦋 High wildlife activity detected at {sensor.value}%! The ecosystem is buzzing with life.")
                      setPriority("4")
                      setCooldown("7200")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">🦋 Wildlife Activity Spike</div>
                    <div className="text-sm text-muted-foreground">When activity {">"} 80%</div>
                  </Button>
                )}

                {/* Data Feed Error - generic digital rule */}
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                  onClick={() => {
                    setRuleName("System Health Check")
                    setSelectedSensor("system.uptime")
                    setOperator("<")
                    setThreshold("95")
                    setActionMessage("⚠️ System performance is at {sensor.value}%. I might be experiencing some digital hiccups!")
                    setPriority("7")
                    setCooldown("1800")
                    nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }}
                >
                  <div className="font-medium text-base">⚠️ System Health Check</div>
                  <div className="text-sm text-muted-foreground">When uptime {"<"} 95%</div>
                </Button>

                {/* Light patterns for digital displays */}
                {availableSenses.includes("light_level") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Digital Display Optimization")
                      setSelectedSensor("light_level.value")
                      setOperator("<")
                      setThreshold("50")
                      setActionMessage("🌙 Ambient light is low at {sensor.value} lux. Switching to dark mode for better visibility!")
                      setPriority("2")
                      setCooldown("1800")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">🌙 Dark Mode Trigger</div>
                    <div className="text-sm text-muted-foreground">When light {"<"} 50 lux</div>
                  </Button>
                )}

                {/* Air quality for digital environments */}
                {availableSenses.includes("air_quality") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Environment Monitor")
                      setSelectedSensor("air_quality.aqi")
                      setOperator(">")
                      setThreshold("150")
                      setActionMessage("🌫️ Air quality index is {sensor.value} - that's unhealthy! Time to recommend indoor activities.")
                      setPriority("6")
                      setCooldown("10800")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">🌫️ Environment Monitor</div>
                    <div className="text-sm text-muted-foreground">When AQI {">"} 150</div>
                  </Button>
                )}

                {/* Weather for digital assistants */}
                {availableSenses.includes("weather") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Weather Advisory")
                      setSelectedSensor("weather.temperature")
                      setOperator(">")
                      setThreshold("30")
                      setActionMessage("🔥 It's a scorching {sensor.value}°C outside! Perfect weather for staying indoors with digital entertainment.")
                      setPriority("3")
                      setCooldown("14400")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">🔥 Hot Weather Advisory</div>
                    <div className="text-sm text-muted-foreground">When temp {">"} 30°C</div>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Terra (Plant) Rules - only show if vesselType is terra */}
          {vesselType === "terra" && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Leaf className="w-4 h-4" /> Terra (Plant) Rules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Low Moisture Alert - only if soil_moisture sense is available */}
                {availableSenses.includes("soil_moisture") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Low Soil Moisture Alert")
                      setSelectedSensor("soil_moisture.value")
                      setOperator("<")
                      setThreshold("20")
                      setActionMessage("I'm getting thirsty! My soil moisture is at {sensor.value}%")
                      setPriority("8")
                      setCooldown("1800")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">💧 Low Moisture Alert</div>
                    <div className="text-sm text-muted-foreground">When soil {"<"} 20%</div>
                  </Button>
                )}

                {/* Light Celebration - only if light_level sense is available */}
                {availableSenses.includes("light_level") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Perfect Light Celebration")
                      setSelectedSensor("light_level.value")
                      setOperator(">")
                      setThreshold("1000")
                      setActionMessage("Ah, perfect sunlight! I'm basking in {sensor.value} lux of beautiful light ☀️")
                      setPriority("3")
                      setCooldown("3600")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">☀️ Light Celebration</div>
                    <div className="text-sm text-muted-foreground">When light {">"} 1000 lux</div>
                  </Button>
                )}

                {/* Temperature Warning - only if weather sense is available */}
                {availableSenses.includes("weather") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Temperature Warning")
                      setSelectedSensor("weather.temperature")
                      setOperator(">")
                      setThreshold("35")
                      setActionMessage("Whew! It's getting hot out here at {sensor.value}°C. I could use some shade!")
                      setPriority("6")
                      setCooldown("7200")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">🌡️ Heat Warning</div>
                    <div className="text-sm text-muted-foreground">When temp {">"} 35°C</div>
                  </Button>
                )}

                {/* Cold Weather Alert - only if weather sense is available */}
                {availableSenses.includes("weather") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Cold Weather Alert")
                      setSelectedSensor("weather.temperature")
                      setOperator("<")
                      setThreshold("5")
                      setActionMessage("Brrr! It's only {sensor.value}°C - I hope my roots stay warm!")
                      setPriority("7")
                      setCooldown("7200")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">❄️ Cold Alert</div>
                    <div className="text-sm text-muted-foreground">When temp {"<"} 5°C</div>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Companion (Wildlife) Rules - only show if vesselType is companion */}
          {vesselType === "companion" && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" /> Companion (Wildlife) Rules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Storm Warning - only if weather sense is available */}
                {availableSenses.includes("weather") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Storm Warning")
                      setSelectedSensor("weather.humidity")
                      setOperator(">")
                      setThreshold("85")
                      setActionMessage("Storm clouds gathering! Humidity is at {sensor.value}% - my animal friends should seek shelter.")
                      setPriority("9")
                      setCooldown("3600")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">⛈️ Storm Warning</div>
                    <div className="text-sm text-muted-foreground">When humidity {">"} 85%</div>
                  </Button>
                )}

                {/* Air Quality Alert - only if air_quality sense is available */}
                {availableSenses.includes("air_quality") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Air Quality Alert")
                      setSelectedSensor("air_quality.aqi")
                      setOperator(">")
                      setThreshold("100")
                      setActionMessage("Air quality is concerning at AQI {sensor.value}. Wildlife in the area should be cautious.")
                      setPriority("8")
                      setCooldown("7200")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">💨 Air Quality Alert</div>
                    <div className="text-sm text-muted-foreground">When AQI {">"} 100</div>
                  </Button>
                )}

                {/* Perfect Conditions - only if weather sense is available */}
                {availableSenses.includes("weather") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Perfect Conditions")
                      setSelectedSensor("weather.temperature")
                      setOperator(">=")
                      setThreshold("18")
                      setActionMessage("Beautiful weather today! {sensor.value}°C is perfect for wildlife activity 🦋")
                      setPriority("2")
                      setCooldown("14400")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">🌤️ Perfect Conditions</div>
                    <div className="text-sm text-muted-foreground">When temp {">="} 18°C</div>
                  </Button>
                )}

                {/* Night Activity - only if light_level sense is available */}
                {availableSenses.includes("light_level") && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left flex flex-col items-start space-y-1"
                    onClick={() => {
                      setRuleName("Night Activity")
                      setSelectedSensor("light_level.value")
                      setOperator("<")
                      setThreshold("10")
                      setActionMessage("Night has fallen with only {sensor.value} lux. Time for nocturnal creatures to emerge! 🦉")
                      setPriority("4")
                      setCooldown("21600")
                      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }}
                  >
                    <div className="font-medium text-base">🌙 Night Activity</div>
                    <div className="text-sm text-muted-foreground">When light {"<"} 10 lux</div>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Show message if no templates are available */}
          {(!vesselType || 
            (vesselType === "terra" && !availableSenses.some(s => ["soil_moisture", "light_level", "weather"].includes(s))) ||
            (vesselType === "companion" && !availableSenses.some(s => ["weather", "air_quality", "light_level"].includes(s))) ||
            (vesselType === "digital" && !availableSenses.some(s => ["news", "wildlife", "light_level", "air_quality", "weather"].includes(s)))
          ) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No rule templates available for this vessel type and sensor configuration.</p>
              <p className="text-sm mt-2">Use the form above to create custom rules.</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Click any template above to auto-fill the form, then customize the values, message, and timing to fit your needs!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}