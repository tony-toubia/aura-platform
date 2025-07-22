// apps/web/components/aura/rule-builder.tsx

"use client"

import React, { useState, useEffect, useRef, useMemo  } from "react"
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
  Settings,
  Sparkles,
  Brain,
  MessageCircle,
  CheckCircle2,
  Timer,
  AlertTriangle,
  Lightbulb,
  Save,
  X,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Personality } from "@/types"

interface RuleBuilderProps {
  auraId: string
  vesselType?: string
  vesselCode?: string
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
  "news.importance": "News Importance",
  "wildlife.activity": "Wildlife Activity",
  "system.uptime": "System Uptime",
}

const OPERATORS = {
  "<": "Less than",
  "<=": "Less than or equal",
  ">": "Greater than",
  ">=": "Greater than or equal",
  "==": "Equals",
  "!=": "Not equals",
}

const vesselConfig = {
  terra: {
    icon: Leaf,
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50",
    name: "Terra Spirit"
  },
  companion: {
    icon: Globe,
    color: "from-blue-500 to-sky-600",
    bgColor: "from-blue-50 to-sky-50",
    name: "Companion Spirit"
  },
  digital: {
    icon: Zap,
    color: "from-purple-500 to-violet-600",
    bgColor: "from-purple-50 to-violet-50",
    name: "Digital Being"
  }
}

export function RuleBuilder({
  auraId,
  vesselType,
  vesselCode,
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
  const [showTemplates, setShowTemplates] = useState(true)

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

  // 2. Pre-calculate template availability using useMemo
  const availableTemplate = useMemo(() => {
    const licensedTemplates: Record<
      string,
      {
        title: string
        sensor: string
        operator: string
        threshold: string
        message: string
        priority: string
        cooldown: string
      }
    > = {
      yoda: {
        title: "🌿 Yoda’s Wisdom",
        sensor: "soil_moisture.value",
        operator: "<",
        threshold: "25",
        message: "Grow strong you will! Soil moisture is at {sensor.value}%",
        priority: "8",
        cooldown: "3600",
      },
      blue: {
        title: "🦖 Raptor Alert",
        sensor: "weather.temperature",
        operator: ">",
        threshold: "30",
        message: "Clever girl! Temp {sensor.value}°C.",
        priority: "7",
        cooldown: "3600",
      },
      gru: {
        title: "🦹 Gru’s Mischief",
        sensor: "weather.temperature",
        operator: ">",
        threshold: "5",
        message: "Minions on the move! It's {sensor.value} out!",
        priority: "7",
        cooldown: "1800",
      },
      "captain america": {
        title: "🛡️ Shield Warning",
        sensor: "light_level.value",
        operator: "<=",
        threshold: "10",
        message: "Shield up! Light level is {sensor.value}",
        priority: "8",
        cooldown: "1200",
      },
    }

    const isLicensed = (vesselCode ?? "").toLowerCase().startsWith("licensed")
    if (!isLicensed) return null

    const licenseName = (vesselCode ?? "")
      .toLowerCase()
      .replace("licensed -", "")
      .trim()
    
    const templateData = licensedTemplates[licenseName]
    if (!templateData) return null

    const sensorKey = templateData.sensor
    const baseKey = sensorKey.split(".")[0]
    const isSensorAvailable =
      availableSenses.includes(sensorKey) ||
      availableSenses.includes(baseKey!)

    return isSensorAvailable ? templateData : null
  }, [vesselCode, availableSenses])


  useEffect(() => {
    if (editingRule) {
      setRuleName(editingRule.name)
      setSelectedSensor(editingRule.trigger.sensor || "")
      setOperator(editingRule.trigger.operator || ">")
      setThreshold(String(editingRule.trigger.value ?? ""))
      setActionMessage(editingRule.action.message || "")
      setPriority(String(editingRule.priority ?? 0))
      setCooldown(String(editingRule.trigger.cooldown ?? 0))
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
    if (sensor.includes("moisture")) return "💧"
    if (sensor.includes("light")) return "☀️"
    if (sensor.includes("air")) return "💨"
    if (sensor.includes("news")) return "📰"
    if (sensor.includes("wildlife")) return "🦋"
    if (sensor.includes("system")) return "⚙️"
    return "📊"
  }

  const getPriorityColor = (p: number) => {
    if (p >= 8) return "text-red-600 bg-red-50"
    if (p >= 6) return "text-orange-600 bg-orange-50"
    if (p >= 4) return "text-yellow-600 bg-yellow-50"
    return "text-blue-600 bg-blue-50"
  }

  const getPriorityLabel = (p: number) => {
    if (p >= 8) return "Urgent"
    if (p >= 6) return "High"
    if (p >= 4) return "Medium"
    return "Low"
  }

  return (
    <div className="space-y-8">
      {/* 3. Conditionally render the entire template section */}
      {availableTemplate && (
        <>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates((v) => !v)}
              className="mb-4"
            >
              {showTemplates ? "Hide" : "Show"} Quick-Start Templates
            </Button>
          </div>

          {showTemplates && (
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Quick-Start Templates
                </CardTitle>
                <CardDescription>
                  Click any template to instantly configure a rule, then
                  customize it.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">
                      Special-Edition Vessel
                    </h4>
                    <span className="text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                      {vesselCode}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-5 flex flex-col items-start space-y-2 border-2 hover:border-yellow-400 transition-all"
                      onClick={() => {
                        setRuleName(`${availableTemplate.title} Alert`)
                        setSelectedSensor(availableTemplate.sensor)
                        setOperator(availableTemplate.operator)
                        setThreshold(availableTemplate.threshold)
                        setActionMessage(availableTemplate.message)
                        setPriority(availableTemplate.priority)
                        setCooldown(availableTemplate.cooldown)
                        nameInputRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        })
                      }}
                    >
                      <span className="font-semibold text-lg">
                        {availableTemplate.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        When{" "}
                        {availableTemplate.sensor.replace(".", " ")}{" "}
                        {availableTemplate.operator}{" "}
                        {availableTemplate.threshold}
                      </span>
                      <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                        Click to use
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* — Active Rules List — */}
      {existingRules.length > 0 && (
        <Card className="border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Active Rules
            </CardTitle>
            <CardDescription>
              Your Aura will respond automatically when these conditions are met
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {existingRules.map((rule) => (
              <div
                key={rule.id}
                className="group relative p-4 sm:p-5 rounded-2xl border-2 border-gray-200 hover:border-purple-300 bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-blue-50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      {getSensorIcon(rule.trigger.sensor || "")}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-lg text-gray-800">{rule.name}</h4>
                        <div className="flex items-center gap-2">
                          {rule.enabled ? (
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                              Inactive
                            </span>
                          )}
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            getPriorityColor(rule.priority || 5)
                          )}>
                            {getPriorityLabel(rule.priority || 5)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">IF</span>{" "}
                          {SENSOR_OPTIONS[rule.trigger.sensor as keyof typeof SENSOR_OPTIONS] ||
                            rule.trigger.sensor}{" "}
                          {OPERATORS[rule.trigger.operator as keyof typeof OPERATORS]}{" "}
                          <span className="font-semibold text-purple-600">{rule.trigger.value}</span>
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">THEN:</span>{" "}
                          <span className="italic">"{rule.action.message}"</span>
                        </p>
                        {rule.trigger.cooldown && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            Cooldown: {Math.floor(rule.trigger.cooldown / 60)}m {rule.trigger.cooldown % 60}s
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditRule?.(rule)}
                      className="opacity-0 group-hover:opacity-100 p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {onToggleRule && (
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(ch) => rule.id && onToggleRule(rule.id, ch)} // ✅ FIX
                      />
                    )}
                    {onDeleteRule && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rule.id && onDeleteRule(rule.id)} // ✅ FIX
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* — Create / Edit Rule Form — */}
      <Card className="border-2 border-purple-100">
        <CardHeader
          className={cn(
            "bg-gradient-to-r",
            isEditing ? "from-blue-50 to-purple-50" : "from-purple-50 to-blue-50"
          )}
        >
          <CardTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit2 className="w-5 h-5 text-blue-600" /> Edit Rule
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-purple-600" /> Create New Rule
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Modify this rule's settings and behavior"
              : "Define when and how your Aura should respond to sensor data"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Rule Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Rule Name
            </label>
            <Input
              ref={nameInputRef}
              placeholder="e.g., Low Moisture Alert, Morning Greeting"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="text-lg py-6 border-2 border-purple-200 focus:border-purple-400"
            />
          </div>
          {/* Trigger Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" /> When should this rule trigger?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sensor</label>
                <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-purple-400">
                    <SelectValue placeholder="Choose sensor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SENSOR_OPTIONS).map(([val, lab]) => (
                      <SelectItem key={val} value={val} className="flex items-center gap-2">
                        <span className="mr-2">{getSensorIcon(val)}</span>
                        {lab}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Condition</label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPERATORS).map(([val, lab]) => (
                      <SelectItem key={val} value={val}>{lab}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Value</label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>
            </div>
          </div>
          {/* Response Message */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Response Message
            </label>
            <Input
              placeholder="What should your Aura say? e.g., I'm feeling thirsty! 💧"
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
              className="text-lg py-6 border-2 border-purple-200 focus:border-purple-400"
            />
            <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded flex items-center gap-2">
              <Lightbulb className="w-3 h-3" /> Use <code>{"{sensor.value}"}</code> to include the actual reading
            </p>
          </div>
          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Priority (1–10)
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-purple-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10].map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p} – {getPriorityLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Timer className="w-4 h-4" /> Cooldown (seconds)
              </label>
              <Input
                type="number"
                min="0"
                value={cooldown}
                onChange={(e) => setCooldown(e.target.value)}
                className="border-2 border-gray-200 focus:border-purple-400"
              />
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddOrSave}
              className={cn(
                "flex-1 py-6 text-lg font-semibold shadow-lg transition-all",
                isEditing
                  ? "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              )}
              disabled={!ruleName || !selectedSensor || !threshold || !actionMessage}
            >
              {isEditing ? (
                <>
                  <Save className="w-5 h-5 mr-2" /> Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" /> Create Rule
                </>
              )}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={clearForm} className="px-6 py-6">
                <X className="w-5 h-5 mr-2" /> Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
