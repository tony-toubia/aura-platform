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
  const config = vesselConfig[vesselType as keyof typeof vesselConfig]

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
    if (sensor.includes("moisture")) return "💧"
    if (sensor.includes("light")) return "☀️"
    if (sensor.includes("air")) return "💨"
    if (sensor.includes("news")) return "📰"
    if (sensor.includes("wildlife")) return "🦋"
    if (sensor.includes("system")) return "⚙️"
    return "📊"
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-red-600 bg-red-50"
    if (priority >= 6) return "text-orange-600 bg-orange-50"
    if (priority >= 4) return "text-yellow-600 bg-yellow-50"
    return "text-blue-600 bg-blue-50"
  }

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return "Urgent"
    if (priority >= 6) return "High"
    if (priority >= 4) return "Medium"
    return "Low"
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            <Brain className="w-4 h-4" />
            Behavior Rules
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Set up automatic responses so your Aura can share their experiences and react to the world around them
        </p>
      </div>

      {/* Active Rules List */}
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
          <CardContent className="p-6 space-y-4">
            {existingRules.map((rule) => (
              <div
                key={rule.id}
                className="group relative p-5 rounded-2xl border-2 border-gray-200 hover:border-purple-300 bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-blue-50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      {getSensorIcon(rule.trigger.sensor || "")}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-lg text-gray-800">{rule.name}</h4>
                        <div className="flex items-center gap-2">
                          {rule.enabled ? (
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
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
                        size="sm"
                        onClick={() => onDeleteRule(rule.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Enhanced Add/Edit Form */}
      <Card className="border-2 border-purple-100">
        <CardHeader className={cn(
          "bg-gradient-to-r",
          isEditing ? "from-blue-50 to-purple-50" : "from-purple-50 to-blue-50"
        )}>
          <CardTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit2 className="w-5 h-5 text-blue-600" />
                Edit Rule
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-purple-600" />
                Create New Rule
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Modify this rule's settings and behavior"
              : "Define when and how your Aura should respond to sensor data"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Rule Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Rule Name
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
              <Settings className="w-5 h-5 text-purple-600" />
              When should this rule trigger?
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
                      <SelectItem key={val} value={val}>
                        {lab}
                      </SelectItem>
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
              <Sparkles className="w-4 h-4" />
              Response Message
            </label>
            <Input
              placeholder="What should your Aura say? e.g., I'm feeling thirsty! 💧"
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
              className="text-lg py-6 border-2 border-purple-200 focus:border-purple-400"
            />
            <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded flex items-center gap-2">
              <Lightbulb className="w-3 h-3" />
              <span>Use <code>{"{sensor.value}"}</code> to include the actual sensor reading in your message</span>
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Priority (1–10)
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-purple-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10].map(p => (
                    <SelectItem key={p} value={p.toString()}>
                      {p} - {getPriorityLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Cooldown (seconds)
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
                "flex-1 py-6 text-lg font-semibold bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all",
                isEditing 
                  ? "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              )}
              disabled={!ruleName || !selectedSensor || !threshold || !actionMessage}
            >
              {isEditing ? (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Rule
                </>
              )}
            </Button>
            
            {isEditing && (
              <Button
                variant="outline"
                onClick={clearForm}
                className="px-6 py-6 border-2"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Template Section */}
      <Card className="border-2 border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Quick Start Templates
          </CardTitle>
          <CardDescription>
            Click any template to instantly configure a rule, then customize it to fit your needs
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {/* Digital Rules */}
          {vesselType === "digital" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800">Digital Being Templates</h4>
                <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  {vesselConfig.digital.name}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Digital rule templates... */}
                {availableSenses.includes("news") && (
                  <Button
                    variant="outline"
                    className="h-auto p-5 text-left flex flex-col items-start space-y-2 border-2 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all group"
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
                    <div className="font-semibold text-lg group-hover:text-purple-700">📰 Breaking News Alert</div>
                    <div className="text-sm text-muted-foreground">When news importance {">"} 7</div>
                    <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Click to use</div>
                  </Button>
                )}
                
                {/* Add other digital templates... */}
              </div>
            </div>
          )}

          {/* Terra Rules */}
          {vesselType === "terra" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800">Terra Spirit Templates</h4>
                <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  Plant & Garden
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSenses.includes("soil_moisture") && (
                  <Button
                    variant="outline"
                    className="h-auto p-5 text-left flex flex-col items-start space-y-2 border-2 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all group"
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
                    <div className="font-semibold text-lg group-hover:text-green-700">💧 Low Moisture Alert</div>
                    <div className="text-sm text-muted-foreground">When soil {"<"} 20%</div>
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Click to use</div>
                  </Button>
                )}
                
                {/* Add other terra templates... */}
              </div>
            </div>
          )}

          {/* Companion Rules */}
          {vesselType === "companion" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800">Companion Spirit Templates</h4>
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  Wildlife & Adventure
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSenses.includes("weather") && (
                  <Button
                    variant="outline"
                    className="h-auto p-5 text-left flex flex-col items-start space-y-2 border-2 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-sky-50 transition-all group"
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
                    <div className="font-semibold text-lg group-hover:text-blue-700">⛈️ Storm Warning</div>
                    <div className="text-sm text-muted-foreground">When humidity {">"} 85%</div>
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Click to use</div>
                  </Button>
                )}
                
                {/* Add other companion templates... */}
              </div>
            </div>
          )}

          {/* No Templates Available */}
          {(!vesselType || 
            (vesselType === "terra" && !availableSenses.some(s => ["soil_moisture", "light_level", "weather"].includes(s))) ||
            (vesselType === "companion" && !availableSenses.some(s => ["weather", "air_quality", "light_level"].includes(s))) ||
            (vesselType === "digital" && !availableSenses.some(s => ["news", "wildlife", "light_level", "air_quality", "weather"].includes(s)))
          ) && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Templates Available</h3>
              <p className="text-gray-600 mb-4">No rule templates match your current vessel type and sensor configuration.</p>
              <p className="text-sm text-gray-500">Use the form above to create custom rules that fit your unique setup!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}