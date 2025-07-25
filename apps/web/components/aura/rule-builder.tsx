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
  Lightbulb,
  Save,
  X,
  Activity,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RuleCard } from "@/components/rules/rule-card"
import { SensorValueInput } from "@/components/rules/sensor-value-input"
import { CooldownConfig } from "@/components/rules/cooldown-config"
import { useCooldownConfig } from "@/hooks/use-cooldown-config"
import { 
  OPERATOR_LABELS, 
  QUICK_TEMPLATES, 
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
  const cooldownConfig = useCooldownConfig()

  // Form state
  const [ruleName, setRuleName] = useState("")
  const [selectedSensor, setSelectedSensor] = useState("")
  const [operator, setOperator] = useState<string>("==")
  const [sensorValue, setSensorValue] = useState<any>(null)
  const [priority, setPriority] = useState(String(DEFAULT_PRIORITY))

  // Enhanced response state
  const [responseType, setResponseType] = useState<'prompt' | 'template'>('prompt')
  const [responseGuidelines, setResponseGuidelines] = useState("")
  const [responseTones, setResponseTones] = useState<string[]>(['encouraging'])
  const [actionMessage, setActionMessage] = useState("")
  const [showAllPromptVariables, setShowAllPromptVariables] = useState(false)
  const [showAllTemplateVariables, setShowAllTemplateVariables] = useState(false)

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

  // Helper function to generate example responses
  const generateExampleResponse = (
    guidelines: string, 
    tones: string[], 
    sensorConfig: any, 
    value: any
  ) => {
    if (!guidelines || !sensorConfig) {
      return "Configure your response guidelines to see an example..."
    }

    const toneWords = {
      encouraging: ['Great job', 'Keep it up', 'You\'re doing amazing'],
      casual: ['Nice', 'Cool', 'Sweet'],
      professional: ['Well done', 'Excellent work', 'Outstanding'],
      playful: ['Awesome sauce', 'You rock', 'Way to go'],
      caring: ['I\'m proud of you', 'Take care of yourself', 'You matter'],
      motivational: ['Crush it', 'You\'ve got this', 'Push forward']
    }

    const activeTones = tones.length > 0 ? tones : ['encouraging']
    const randomTone = activeTones[Math.floor(Math.random() * activeTones.length)]
    const tonePhrase = toneWords[randomTone as keyof typeof toneWords]?.[0] || 'Great'

    // Generate a contextual example based on the sensor and guidelines
    if (guidelines.toLowerCase().includes('step')) {
      return `${tonePhrase}! You hit ${value || '10,000'} steps today - your dedication to staying active really shows! 🚶‍♀️✨`
    } else if (guidelines.toLowerCase().includes('sleep')) {
      return `${tonePhrase}! That ${value || '8'} hours of ${sensorConfig.name?.toLowerCase()} really paid off - you're glowing today! 😴💫`
    } else if (guidelines.toLowerCase().includes('meeting') || guidelines.toLowerCase().includes('calendar')) {
      return `${tonePhrase}! Your ${value || 'next meeting'} is coming up in ${Math.floor(Math.random() * 15) + 5} minutes. You've got this! 📅⚡`
    }

    return `${tonePhrase}! Based on your ${sensorConfig?.name || 'sensor'} reading of ${value || 'current value'}, here's some encouragement based on your guidelines! 🌟`
  }

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
      setPriority(String(editingRule.priority ?? DEFAULT_PRIORITY))
      
      // Handle different response types
      const action = editingRule.action as any
      if (action.responseType === 'prompt') {
        setResponseType('prompt')
        setResponseGuidelines(action.promptGuidelines || "")
        setResponseTones(action.responseTones || ['encouraging'])
      } else {
        setResponseType(action.responseType || 'template')
        setActionMessage(action.message || "")
      }
      
      // Apply cooldown config from editing rule
      cooldownConfig.applyEditingRule(editingRule)
      
      setTimeout(() => {
        nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [editingRule, cooldownConfig])

  const clearForm = () => {
    setRuleName("")
    setSelectedSensor("")
    setOperator("==")
    setSensorValue(null)
    setActionMessage("")
    setResponseType('prompt')
    setResponseGuidelines("")
    setResponseTones(['encouraging'])
    setShowAllPromptVariables(false)
    setShowAllTemplateVariables(false)
    setPriority(String(DEFAULT_PRIORITY))
    cooldownConfig.clearCooldownConfig()
    onEditRule?.(null)
  }

  const handleAddOrSave = async () => {
    if (!ruleName || !selectedSensor || sensorValue === null) return
    
    // Validate based on response type
    if (responseType === 'template' && !actionMessage) return
    if (responseType === 'prompt' && !responseGuidelines) return

    const cooldownPayload = cooldownConfig.getCooldownPayload()

    const payload = {
      auraId,
      name: ruleName,
      trigger: {
        type: "simple" as const,
        sensor: selectedSensor,
        operator: operator as RuleTrigger['operator'],
        value: sensorValue,
        ...cooldownPayload
      },
      action: {
        type: responseType === 'prompt' ? "prompt_respond" : "respond" as const,
        message: responseType === 'prompt' ? undefined : actionMessage,
        promptGuidelines: responseType === 'prompt' ? responseGuidelines : undefined,
        responseTones: responseType === 'prompt' ? responseTones : undefined,
        responseType,
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
    setResponseType('template') // Templates use template mode
    // Templates use simple cooldown for now
    cooldownConfig.setCooldownType('simple')
    cooldownConfig.setSimpleCooldown(template.cooldown || '60')
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
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
          <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
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
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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

          {/* Enhanced Response Configuration */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Response Style & Tone
            </label>
            
            {responseType === 'prompt' && (
              <div className="flex justify-center sm:justify-end">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">AI-Generated</span>
                </div>
              </div>
            )}

            {/* Response Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant={responseType === 'prompt' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setResponseType('prompt')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">Smart Response</div>
                  <div className={cn(
                    "text-xs",
                    responseType === 'prompt' ? "text-white/90" : "text-gray-500"
                  )}>
                    AI varies the message each time
                  </div>
                </div>
              </Button>
              <Button
                type="button"
                variant={responseType === 'template' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setResponseType('template')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">Template</div>
                  <div className={cn(
                    "text-xs",
                    responseType === 'template' ? "text-white/90" : "text-gray-500"
                  )}>
                    Fixed message with variables
                  </div>
                </div>
              </Button>
            </div>

            {/* Dynamic Input Based on Type */}
            {responseType === 'prompt' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* Header with icon - only on larger screens */}
                    <div className="flex items-start gap-3">
                      <div className="hidden sm:flex w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-0">
                          <div className="sm:hidden w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <h4 className="font-medium text-gray-800">Response Guidelines</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 mb-3">
                          Describe how your Aura should respond. The AI will generate varied messages based on your guidelines.
                        </p>
                      </div>
                    </div>
                    
                    {/* Textarea - full width */}
                    <textarea
                      placeholder="e.g., Celebrate enthusiastically when I hit my step goal. Mention the exact step count and encourage me to keep up the great work. Use emojis and be upbeat."
                      value={responseGuidelines}
                      onChange={(e) => setResponseGuidelines(e.target.value)}
                      className="w-full h-20 px-3 py-2 border-2 border-purple-200 focus:border-purple-400 rounded-lg resize-none text-sm"
                    />
                    
                    {/* Available Variables - moved here for prompt mode */}
                    <div className="space-y-2 pt-2 border-t border-purple-200/50">
                      <p className="text-xs text-purple-700 font-medium">
                        💡 Available data to reference in your guidelines:
                      </p>
                      <div className="space-y-2">
                        {/* Current sensor variable */}
                        {selectedSensorConfig && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-600 font-medium">Current sensor:</span>
                            <code className="bg-white/70 text-purple-700 px-2 py-1 rounded text-xs font-mono break-all">
                              {selectedSensorConfig.name} ({selectedSensorConfig.id})
                            </code>
                          </div>
                        )}
                        
                        {/* Other available variables */}
                        {availableSensorConfigs.length > 1 && (
                          <div className="space-y-1">
                            <span className="text-xs text-gray-600 font-medium">Other sensors you can reference:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {availableSensorConfigs
                                .filter(sensor => sensor.id !== selectedSensor)
                                .slice(0, showAllPromptVariables ? undefined : 4)
                                .map(sensor => (
                                  <code 
                                    key={sensor.id} 
                                    className="bg-white/70 text-purple-700 px-2 py-1 rounded text-xs font-mono break-all max-w-full"
                                    title={sensor.name}
                                  >
                                    {sensor.name}
                                  </code>
                                ))}
                              {!showAllPromptVariables && availableSensorConfigs.length > 5 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllPromptVariables(true)}
                                  className="text-xs text-purple-600 hover:text-purple-700 underline px-2 py-1 font-medium"
                                >
                                  +{availableSensorConfigs.length - 5} more
                                </button>
                              )}
                              {showAllPromptVariables && availableSensorConfigs.length > 5 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllPromptVariables(false)}
                                  className="text-xs text-purple-600 hover:text-purple-700 underline px-2 py-1 font-medium"
                                >
                                  show less
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Tone Modifiers */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">Response Tone:</label>
                      <div className="flex flex-wrap gap-2">
                        {['encouraging', 'casual', 'professional', 'playful', 'caring', 'motivational'].map((tone) => (
                          <Button
                            key={tone}
                            type="button"
                            variant={responseTones.includes(tone) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setResponseTones(prev => 
                                prev.includes(tone) 
                                  ? prev.filter(t => t !== tone)
                                  : [...prev, tone]
                              )
                            }}
                            className="h-auto px-3 py-1 text-xs capitalize"
                          >
                            {tone}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example Preview */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Example AI Response:</span>
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    "{generateExampleResponse(responseGuidelines, responseTones, selectedSensorConfig, sensorValue)}"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ✨ Each response will be unique while following your guidelines
                  </p>
                </div>
              </div>
            )}

            {responseType === 'template' && (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">Message Template</h4>
                      <p className="text-sm text-gray-600">
                        Create a message template with variables, or write a fixed message without variables.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Input
                  placeholder="e.g., Great job hitting {fitness.steps} steps today! 🎯 OR Time for your meeting! 📅"
                  value={actionMessage}
                  onChange={(e) => setActionMessage(e.target.value)}
                  className="text-lg py-6 border-2 border-yellow-200 focus:border-yellow-400"
                />
              </div>
            )}

            {/* Variable Helper Section - Only for Template mode now */}
            {responseType === 'template' && (
              <div className="space-y-3">
                <p className="text-xs text-purple-600 bg-purple-50 p-3 rounded flex items-start gap-2">
                  <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" /> 
                  <span>Use variables to include sensor data in your message:</span>
                </p>
                <div className="space-y-2">
                  {/* Current sensor variable */}
                  {selectedSensorConfig && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-600 font-medium">Current sensor:</span>
                      <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono break-all">
                        {`{${selectedSensorConfig.id}}`}
                      </code>
                    </div>
                  )}
                  
                  {/* Other available variables */}
                  {availableSensorConfigs.length > 1 && (
                    <div className="space-y-1">
                      <span className="text-xs text-gray-600 font-medium">Other available variables:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableSensorConfigs
                          .filter(sensor => sensor.id !== selectedSensor)
                          .slice(0, showAllTemplateVariables ? undefined : 4)
                          .map(sensor => (
                            <code 
                              key={sensor.id} 
                              className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono break-all max-w-full"
                              title={sensor.name}
                            >
                              {`{${sensor.id}}`}
                            </code>
                          ))}
                        {!showAllTemplateVariables && availableSensorConfigs.length > 5 && (
                          <button
                            type="button"
                            onClick={() => setShowAllTemplateVariables(true)}
                            className="text-xs text-purple-600 hover:text-purple-700 underline px-2 py-1 font-medium"
                          >
                            +{availableSensorConfigs.length - 5} more
                          </button>
                        )}
                        {showAllTemplateVariables && availableSensorConfigs.length > 5 && (
                          <button
                            type="button"
                            onClick={() => setShowAllTemplateVariables(false)}
                            className="text-xs text-purple-600 hover:text-purple-700 underline px-2 py-1 font-medium"
                          >
                            show less
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 gap-6">
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
            
            {/* Enhanced Cooldown Section */}
            <CooldownConfig cooldownConfig={cooldownConfig} />
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
              disabled={
                !ruleName || 
                !selectedSensor || 
                sensorValue === null || 
                (responseType === 'prompt' && !responseGuidelines) ||
                (responseType === 'template' && !actionMessage)
              }
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