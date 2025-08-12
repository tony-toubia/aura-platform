// apps/web/components/aura/rule-builder/visual-rule-builder.tsx

"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sparkles,
  Plus,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Settings,
  Zap,
  MessageCircle,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Play,
  Pause,
  AlertTriangle,
  Info,
  CheckCircle,
  BarChart3,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSensorConfig, SENSOR_CONFIGS } from '@/types'
import type { BehaviorRule, SensorMetadata } from '@/types'

interface VisualRuleBuilderProps {
  auraId: string
  availableSenses: string[]
  existingRules: BehaviorRule[]
  onRuleUpdate: (rules: BehaviorRule[]) => void
  onCreateRule: () => void
  onEditRule: (rule: BehaviorRule) => void
}

export function VisualRuleBuilder({
  auraId,
  availableSenses,
  existingRules,
  onRuleUpdate,
  onCreateRule,
  onEditRule
}: VisualRuleBuilderProps) {
  const [selectedRule, setSelectedRule] = useState<BehaviorRule | null>(null)
  const [viewMode, setViewMode] = useState<'enhanced' | 'compact'>('enhanced')
  const [showInactive, setShowInactive] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'created'>('priority')

  // Filter rules based on search and visibility settings
  const filteredRules = useMemo(() => {
    const filtered = existingRules.filter(rule => {
      if (!showInactive && !rule.enabled) return false
      if (searchTerm && !rule.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })

    // Sort rules
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (b.priority || 5) - (a.priority || 5)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [existingRules, showInactive, searchTerm, sortBy])

  const handleRuleToggle = useCallback((ruleId: string, enabled: boolean) => {
    const updatedRules = existingRules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled } : rule
    )
    onRuleUpdate(updatedRules)
  }, [existingRules, onRuleUpdate])

  const handleRuleDelete = useCallback((ruleId: string) => {
    const updatedRules = existingRules.filter(rule => rule.id !== ruleId)
    onRuleUpdate(updatedRules)
  }, [existingRules, onRuleUpdate])

  const handleRuleDuplicate = useCallback((rule: BehaviorRule) => {
    const duplicatedRule = {
      ...rule,
      id: `${rule.id}-copy-${Date.now()}`,
      name: `${rule.name} (Copy)`,
      enabled: false
    }
    onRuleUpdate([...existingRules, duplicatedRule])
  }, [existingRules, onRuleUpdate])

  const handlePriorityChange = useCallback((ruleId: string, newPriority: number) => {
    const updatedRules = existingRules.map(rule =>
      rule.id === ruleId ? { ...rule, priority: newPriority } : rule
    )
    onRuleUpdate(updatedRules)
  }, [existingRules, onRuleUpdate])

  const getRulePriorityColor = (priority: number = 5) => {
    if (priority <= 3) return 'border-green-400 bg-green-50'
    if (priority <= 6) return 'border-yellow-400 bg-yellow-50'
    if (priority <= 8) return 'border-orange-400 bg-orange-50'
    return 'border-red-400 bg-red-50'
  }

  const getRuleStatusIcon = (rule: BehaviorRule) => {
    if (!rule.enabled) return <Pause className="w-4 h-4 text-gray-400" />
    return <Play className="w-4 h-4 text-green-500" />
  }

  const getRulePriorityLabel = (priority: number = 5) => {
    if (priority <= 3) return { label: 'Low', color: 'text-green-700' }
    if (priority <= 6) return { label: 'Medium', color: 'text-yellow-700' }
    if (priority <= 8) return { label: 'High', color: 'text-orange-700' }
    return { label: 'Critical', color: 'text-red-700' }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600" />
            Enhanced Rule Management
          </h3>
          <Badge variant="outline" className="text-sm">
            {filteredRules.length} of {existingRules.length} rules
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              className="gap-2"
            >
              {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showInactive ? 'Hide' : 'Show'} Inactive
            </Button>
          </div>

          <Button
            onClick={onCreateRule}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 border-gray-200 focus:border-purple-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 text-sm"
          >
            <option value="priority">Sort by Priority</option>
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Enhanced Rules List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No rules found</h4>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first rule to get started'}
            </p>
            <Button onClick={onCreateRule} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Rule
            </Button>
          </div>
        ) : (
          filteredRules.map((rule, index) => {
            const priorityInfo = getRulePriorityLabel(rule.priority)
            const sensorConfig = rule.trigger.sensor ? getSensorConfig(rule.trigger.sensor) : null

            return (
              <Card
                key={rule.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-lg border-2",
                  getRulePriorityColor(rule.priority),
                  !rule.enabled && "opacity-60",
                  selectedRule?.id === rule.id && "ring-2 ring-purple-400"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Priority and Status Column */}
                    <div className="flex flex-col items-center gap-2 min-w-[80px]">
                      {/* Priority Controls */}
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePriorityChange(rule.id, Math.min(10, (rule.priority || 5) + 1))}
                          className="h-6 w-6 p-0 hover:bg-purple-100"
                          disabled={(rule.priority || 5) >= 10}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        
                        <div className="text-center">
                          <Badge variant="outline" className={cn("text-xs px-2", priorityInfo.color)}>
                            {rule.priority || 5}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {priorityInfo.label}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePriorityChange(rule.id, Math.max(1, (rule.priority || 5) - 1))}
                          className="h-6 w-6 p-0 hover:bg-purple-100"
                          disabled={(rule.priority || 5) <= 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1 mt-2">
                        {getRuleStatusIcon(rule)}
                      </div>
                    </div>

                    {/* Rule Content */}
                    <div className="flex-1 min-w-0">
                      {/* Rule Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900 mb-1">
                            {rule.name}
                          </h4>
                          <div className="text-sm text-gray-500">
                            Created {rule.createdAt ? new Date(rule.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRuleToggle(rule.id, !rule.enabled)}
                            className="h-8 px-3"
                          >
                            {rule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span className="ml-1 text-xs">
                              {rule.enabled ? 'Pause' : 'Activate'}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRuleDuplicate(rule)}
                            className="h-8 px-3"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditRule(rule)}
                            className="h-8 px-3"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRuleDelete(rule.id)}
                            className="h-8 px-3 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Visual Rule Flow */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                          {/* Trigger */}
                          <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full">
                            {sensorConfig?.icon && <span className="text-lg">{sensorConfig.icon}</span>}
                            <span className="font-medium">
                              {sensorConfig?.name || 'Unknown Sensor'}
                            </span>
                          </div>

                          <ArrowRight className="w-4 h-4 text-gray-400" />

                          {/* Condition */}
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full">
                            <span className="text-sm font-medium">
                              {rule.trigger.operator} {rule.trigger.value}
                            </span>
                          </div>

                          <ArrowRight className="w-4 h-4 text-gray-400" />

                          {/* Action */}
                          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {rule.action.type === 'prompt_respond' ? 'AI Response' : 'Template Message'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rule Preview */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-purple-700">
                            {rule.action.message ? (
                              <p className="italic">"{rule.action.message}"</p>
                            ) : rule.action.promptGuidelines ? (
                              <div>
                                <p className="font-medium mb-2">🤖 AI-Generated Response</p>
                                <p className="italic text-xs bg-purple-100 p-2 rounded">
                                  "{rule.action.promptGuidelines}"
                                </p>
                                {rule.action.responseTones && rule.action.responseTones.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    <span className="text-xs">Tones:</span>
                                    {rule.action.responseTones.map((tone) => (
                                      <Badge key={tone} variant="outline" className="text-xs">
                                        {tone}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="italic text-purple-600">AI-generated response based on context</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {existingRules.filter(r => r.enabled).length}
            </div>
            <div className="text-sm text-green-700 font-medium">Active Rules</div>
            <div className="text-xs text-green-600 mt-1">
              {existingRules.length > 0 
                ? `${Math.round((existingRules.filter(r => r.enabled).length / existingRules.length) * 100)}% of total`
                : 'No rules yet'
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {existingRules.filter(r => !r.enabled).length}
            </div>
            <div className="text-sm text-gray-700 font-medium">Inactive Rules</div>
            <div className="text-xs text-gray-600 mt-1">
              Ready to activate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {existingRules.filter(r => (r.priority || 5) >= 8).length}
            </div>
            <div className="text-sm text-red-700 font-medium">High Priority</div>
            <div className="text-xs text-red-600 mt-1">
              Critical responses
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {availableSenses.length}
            </div>
            <div className="text-sm text-blue-700 font-medium">Available Senses</div>
            <div className="text-xs text-blue-600 mt-1">
              Connected data sources
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}