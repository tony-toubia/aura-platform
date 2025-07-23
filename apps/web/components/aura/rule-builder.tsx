// apps/web/components/aura/rule-builder-dynamic.tsx

"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
  Activity,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, SensorMetadata, RuleTrigger } from "@/types"
import { SENSOR_CONFIGS, getSensorConfig, getOperatorsForSensor } from "@/types"

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

// Operator labels
const OPERATOR_LABELS: Record<string, string> = {
  "<": "Less than",
  "<=": "Less than or equal",
  ">": "Greater than",
  ">=": "Greater than or equal",
  "==": "Equals",
  "!=": "Not equals",
  "contains": "Contains",
  "between": "Between"
}

// Value input component that adapts to sensor type
const SensorValueInput: React.FC<{
  sensor: SensorMetadata
  operator: string
  value: any
  onChange: (value: any) => void
}> = ({ sensor, operator, value, onChange }) => {
  switch (sensor.type) {
    case 'numeric':
    case 'duration':
      if (operator === 'between') {
        const [min = sensor.range?.min || 0, max = sensor.range?.max || 100] = value || []
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={min}
                onChange={(e) => onChange([parseFloat(e.target.value), max])}
                className="w-24"
                placeholder="Min"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                value={max}
                onChange={(e) => onChange([min, parseFloat(e.target.value)])}
                className="w-24"
                placeholder="Max"
              />
              <span className="text-sm text-gray-600">{sensor.unit}</span>
            </div>
            {sensor.range && (
              <div className="space-y-2">
                <Slider
                  value={[min, max]}
                  onValueChange={onChange}
                  min={sensor.range.min}
                  max={sensor.range.max}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{sensor.range.min} {sensor.unit}</span>
                  <span>{sensor.range.max} {sensor.unit}</span>
                </div>
              </div>
            )}
          </div>
        )
      }
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              placeholder={`e.g., ${sensor.range ? Math.round((sensor.range.min + sensor.range.max) / 2) : 50}`}
              className="flex-1"
            />
            {sensor.unit && <span className="text-sm text-gray-600">{sensor.unit}</span>}
          </div>
          {sensor.range && (
            <div className="space-y-2">
              <Slider
                value={[value || sensor.range.min]}
                onValueChange={([v]) => onChange(v)}
                min={sensor.range.min}
                max={sensor.range.max}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{sensor.range.min}</span>
                <span className="font-medium text-purple-600">{value || sensor.range.min}</span>
                <span>{sensor.range.max}</span>
              </div>
            </div>
          )}
        </div>
      )

    case 'enum':
      return (
        <RadioGroup value={value || ''} onValueChange={onChange}>
          <div className="grid grid-cols-2 gap-3">
            {sensor.enumValues?.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  value === option.value
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <span className="font-medium">{option.label}</span>
              </Label>
            ))}
          </div>
        </RadioGroup>
      )

    case 'boolean':
      return (
        <RadioGroup value={String(value || false)} onValueChange={(v) => onChange(v === 'true')}>
          <div className="flex gap-4">
            <Label className="flex items-center gap-2">
              <RadioGroupItem value="true" />
              <span>True</span>
            </Label>
            <Label className="flex items-center gap-2">
              <RadioGroupItem value="false" />
              <span>False</span>
            </Label>
          </div>
        </RadioGroup>
      )

    case 'text':
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter text to match"
          className="w-full"
        />
      )

    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value"
          className="w-full"
        />
      )
  }
}

// Quick templates for common rules
const QUICK_TEMPLATES = {
  sleep: [
    {
      name: "Poor Sleep Alert",
      sensor: "sleep.quality",
      operator: "==",
      value: "poor",
      message: "I didn't sleep well last night 😴 Only got {sleep.duration} hours of sleep.",
      priority: "6"
    },
    {
      name: "Great Sleep Celebration",
      sensor: "sleep.quality",
      operator: "==",
      value: "excellent",
      message: "I feel amazing today! 🌟 Had {sleep.duration} hours of quality sleep!",
      priority: "4"
    }
  ],
  fitness: [
    {
      name: "Step Goal Achieved",
      sensor: "fitness.steps",
      operator: ">=",
      value: 10000,
      message: "Yes! Hit my step goal with {fitness.steps} steps today! 🎯",
      priority: "5"
    },
    {
      name: "High Heart Rate Warning",
      sensor: "fitness.heartRate",
      operator: ">",
      value: 160,
      message: "Whoa, my heart is racing at {fitness.heartRate} bpm! Time to slow down? 💓",
      priority: "8"
    }
  ],
  calendar: [
    {
      name: "Meeting Reminder",
      sensor: "calendar.timeUntilNext",
      operator: "<=",
      value: 15,
      message: "Heads up! Your {calendar.nextEvent} starts in {calendar.timeUntilNext} minutes! ⏰",
      priority: "7"
    }
  ],
  location: [
    {
      name: "Arrived at Gym",
      sensor: "location.place",
      operator: "==",
      value: "gym",
      message: "Time to crush this workout! 💪 Let's do this!",
      priority: "5"
    }
  ]
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

  // Form state
  const [ruleName, setRuleName] = useState("")
  const [selectedSensor, setSelectedSensor] = useState("")
  const [operator, setOperator] = useState<string>("==")
  const [sensorValue, setSensorValue] = useState<any>(null)
  const [actionMessage, setActionMessage] = useState("")
  const [priority, setPriority] = useState("5")
  const [cooldown, setCooldown] = useState("300")

  const isEditing = editingRule !== null
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Get sensor configuration
  const selectedSensorConfig = selectedSensor ? getSensorConfig(selectedSensor) : null
  const availableOperators = selectedSensor ? getOperatorsForSensor(selectedSensor) : []

  // ✅ FIX: Added a type guard to ensure `baseKey` is not undefined.
  const availableSensorConfigs = useMemo(() => {
    return Object.values(SENSOR_CONFIGS).filter(sensor => {
      const baseKey = sensor.id.split('.')[0]
      if (!baseKey) return false; // Ensure baseKey is a valid string
      return availableSenses.includes(sensor.id) || availableSenses.includes(baseKey)
    })
  }, [availableSenses])

  // Group sensors by category
  const sensorsByCategory = useMemo(() => {
    const grouped: Record<string, SensorMetadata[]> = {}
    availableSensorConfigs.forEach(sensor => {
      if (!grouped[sensor.category]) {
        grouped[sensor.category] = []
      }
      grouped[sensor.category]!.push(sensor) // Using non-null assertion as we just initialized it
    })
    return grouped
  }, [availableSensorConfigs])

  // Reset operator when sensor changes
  useEffect(() => {
    if (selectedSensor && availableOperators.length > 0) {
      if (!availableOperators.includes(operator as any)) {
        setOperator(availableOperators[0] || '==')
      }
    }
  }, [selectedSensor, availableOperators, operator])

  // Handle editing rule
  useEffect(() => {
    if (editingRule) {
      setRuleName(editingRule.name)
      setSelectedSensor(editingRule.trigger.sensor || "")
      setOperator(editingRule.trigger.operator || "==")
      setSensorValue(editingRule.trigger.value ?? null)
      setActionMessage(editingRule.action.message || "")
      setPriority(String(editingRule.priority ?? 5))
      setCooldown(String(editingRule.trigger.cooldown ?? 300))
      setTimeout(() => {
        nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [editingRule])

  const clearForm = () => {
    setRuleName("")
    setSelectedSensor("")
    setOperator("==")
    setSensorValue(null)
    setActionMessage("")
    setPriority("5")
    setCooldown("300")
    onEditRule?.(null)
  }

  const handleAddOrSave = async () => {
    if (!ruleName || !selectedSensor || sensorValue === null || !actionMessage) return

    const payload = {
      auraId,
      name: ruleName,
      trigger: {
        type: "simple" as const,
        sensor: selectedSensor,
        operator: operator as RuleTrigger['operator'],
        value: sensorValue,
        cooldown: parseInt(cooldown, 10),
      },
      action: {
        type: "respond" as const,
        message: actionMessage,
        severity: "info" as const,
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

  const applyTemplate = (template: any) => {
    setRuleName(template.name)
    setSelectedSensor(template.sensor)
    setOperator(template.operator)
    setSensorValue(template.value)
    setActionMessage(template.message)
    setPriority(template.priority)
    setCooldown(template.cooldown || "300")
    nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
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

  // ✅ FIX: Added a type guard to ensure `sensorBase` is not undefined.
  const relevantTemplates = useMemo(() => {
    const templates: any[] = []
    Object.entries(QUICK_TEMPLATES).forEach(([category, categoryTemplates]) => {
      categoryTemplates.forEach(template => {
        const sensorBase = template.sensor.split('.')[0]
        if (sensorBase && (availableSenses.includes(template.sensor) || availableSenses.includes(sensorBase))) {
          templates.push({ ...template, category })
        }
      })
    })
    return templates
  }, [availableSenses])

  return (
    // ... The rest of the component JSX remains the same
    <div className="space-y-8">
      {/* Quick Templates */}
      {relevantTemplates.length > 0 && (
        <>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
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
                  Click any template to instantly configure a rule, then customize it
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relevantTemplates.map((template, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start space-y-2 border-2 hover:border-purple-400 transition-all"
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-2xl">{getSensorConfig(template.sensor)?.icon}</span>
                        <span className="font-semibold text-left">{template.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground text-left">
                        When {getSensorConfig(template.sensor)?.name} {OPERATOR_LABELS[template.operator]} {
                          typeof template.value === 'string' 
                            ? getSensorConfig(template.sensor)?.enumValues?.find(e => e.value === template.value)?.label || template.value
                            : template.value
                        }
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}


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
            {existingRules.map((rule) => {
              const sensorConfig = getSensorConfig(rule.trigger.sensor || '')
              return (
                <div
                  key={rule.id}
                  className="group relative p-5 rounded-2xl border-2 border-gray-200 hover:border-purple-300 bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-blue-50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                        {sensorConfig?.icon || '📊'}
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
                            {sensorConfig?.name || rule.trigger.sensor}{" "}
                            {OPERATOR_LABELS[rule.trigger.operator || '==']}{" "}
                            <span className="font-semibold text-purple-600">
                              {sensorConfig?.type === 'enum' && sensorConfig.enumValues
                                ? sensorConfig.enumValues.find(e => e.value === rule.trigger.value)?.label || rule.trigger.value
                                : rule.trigger.value}
                              {sensorConfig?.unit ? ` ${sensorConfig.unit}` : ''}
                            </span>
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
                          onCheckedChange={(ch) => rule.id && onToggleRule(rule.id, ch)}
                        />
                      )}
                      {onDeleteRule && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rule.id && onDeleteRule(rule.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Rule Form */}
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
        <CardContent className="p-6 space-y-6">
          {/* Rule Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Rule Name
            </label>
            <Input
              ref={nameInputRef}
              placeholder="e.g., Morning Wellness Check, Meeting Reminder"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="text-lg py-6 border-2 border-purple-200 focus:border-purple-400"
            />
          </div>

          {/* Sensor Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" /> When should this rule trigger?
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Sensor</label>
              <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-purple-400">
                  <SelectValue placeholder="Choose a sensor to monitor" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sensorsByCategory).map(([category, sensors]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 capitalize">
                        {category}
                      </div>
                      {sensors.map((sensor) => (
                        <SelectItem key={sensor.id} value={sensor.id}>
                          <div className="flex items-center gap-2">
                            <span>{sensor.icon}</span>
                            <span>{sensor.name}</span>
                            {sensor.unit && (
                              <span className="text-xs text-gray-500">({sensor.unit})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Condition Configuration */}
            {selectedSensorConfig && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">Configure {selectedSensorConfig.name} Condition</span>
                </div>

                {/* Operator Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Condition Type</label>
                  <Select value={operator} onValueChange={setOperator}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOperators.map((op) => (
                        <SelectItem key={op} value={op!}>
                          {OPERATOR_LABELS[op!]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic Value Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Value {operator === 'between' ? 'Range' : ''}
                  </label>
                  <SensorValueInput
                    sensor={selectedSensorConfig}
                    operator={operator}
                    value={sensorValue}
                    onChange={setSensorValue}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Response Message */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Response Message
            </label>
            <Input
              placeholder="What should your Aura say? e.g., Time for your meeting! 📅"
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
              className="text-lg py-6 border-2 border-purple-200 focus:border-purple-400"
            />
            <div className="space-y-2">
              <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded flex items-center gap-2">
                <Lightbulb className="w-3 h-3" /> 
                <span>Use variables to include sensor data in your message:</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedSensorConfig && (
                  <code className="bg-gray-100 p-2 rounded">{`{${selectedSensorConfig.id}}`}</code>
                )}
                {availableSensorConfigs.slice(0, 3).map(sensor => (
                  <code key={sensor.id} className="bg-gray-100 p-2 rounded">{`{${sensor.id}}`}</code>
                ))}
              </div>
            </div>
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
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded", getPriorityColor(p))}>
                          {getPriorityLabel(p)}
                        </span>
                        <span>Priority {p}</span>
                      </div>
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
              <p className="text-xs text-gray-500">
                Minimum time before this rule can trigger again
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddOrSave}
              className={cn(
                "flex-1 py-6 text-lg font-semibold shadow-lg transition-all bg-gradient-to-r",
                isEditing
                  ? "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              )}
              disabled={!ruleName || !selectedSensor || sensorValue === null || !actionMessage}
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