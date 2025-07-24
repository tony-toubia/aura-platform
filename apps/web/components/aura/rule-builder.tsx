// apps/web/components/aura/rule-builder-dynamic.tsx

"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
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
import {
  Plus,
  Edit2,
  Settings,
  Sparkles,
  MessageCircle,
  AlertTriangle,
  Timer,
  Lightbulb,
  Save,
  X,
  Activity,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RuleCard } from "@/components/rules/rule-card"
import { SensorValueInput } from "@/components/rules/sensor-value-input"
import { 
  OPERATOR_LABELS, 
  QUICK_TEMPLATES, 
  DEFAULT_COOLDOWN, 
  DEFAULT_PRIORITY,
  getPriorityConfig 
} from "@/lib/constants/rules"
import { SENSOR_CONFIGS, getSensorConfig, getOperatorsForSensor } from "@/types"
import type { BehaviorRule, SensorMetadata, RuleTrigger } from "@/types"
import type { RuleBuilderProps } from "@/types/rules"

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
  const [priority, setPriority] = useState(String(DEFAULT_PRIORITY))
  const [cooldown, setCooldown] = useState(String(DEFAULT_COOLDOWN))

  const isEditing = editingRule !== null
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Get sensor configuration
  const selectedSensorConfig = selectedSensor ? getSensorConfig(selectedSensor) : null
  const availableOperators = selectedSensor ? getOperatorsForSensor(selectedSensor) : []

  // Get available sensor configs
  const availableSensorConfigs = useMemo(() => {
    return Object.values(SENSOR_CONFIGS).filter(sensor => {
      const baseKey = sensor.id.split('.')[0]
      if (!baseKey) return false
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
      grouped[sensor.category]!.push(sensor)
    })
    return grouped
  }, [availableSensorConfigs])

  // Get relevant templates
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
      setPriority(String(editingRule.priority ?? DEFAULT_PRIORITY))
      setCooldown(String(editingRule.trigger.cooldown ?? DEFAULT_COOLDOWN))
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
    setPriority(String(DEFAULT_PRIORITY))
    setCooldown(String(DEFAULT_COOLDOWN))
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
    setCooldown(template.cooldown || String(DEFAULT_COOLDOWN))
    nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
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
            {existingRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={onEditRule}
                onToggle={onToggleRule}
                onDelete={onDeleteRule}
              />
            ))}
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
                  {[1,2,3,4,5,6,7,8,9,10].map((p) => {
                    const config = getPriorityConfig(p)
                    return (
                      <SelectItem key={p} value={p.toString()}>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs px-2 py-0.5 rounded", config.color, config.bgColor)}>
                            {config.label}
                          </span>
                          <span>Priority {p}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
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