// apps/web/components/rules/rule-card.tsx

"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Edit2,
  Trash2,
  Clock,
  Zap,
  AlertTriangle,
  Info,
  Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSensorConfig } from '@/types'
import type { BehaviorRule } from '@/types'

interface RuleCardProps {
  rule: BehaviorRule
  onEdit?: (rule: BehaviorRule) => void
  onToggle?: (ruleId: string, enabled: boolean) => void
  onDelete?: (ruleId: string) => void
}

const OPERATOR_LABELS: Record<string, string> = {
  '==': 'equals',
  '!=': 'does not equal',
  '>': 'is greater than',
  '>=': 'is greater than or equal to',
  '<': 'is less than',
  '<=': 'is less than or equal to',
  'between': 'is between',
  'contains': 'contains',
  'not_contains': 'does not contain'
}

const getPriorityColor = (priority: number = 5) => {
  if (priority <= 3) return 'bg-green-100 text-green-700 border-green-200'
  if (priority <= 6) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (priority <= 8) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

const formatCooldown = (rule: BehaviorRule) => {
  const trigger = rule.trigger as any // Type cast for new properties
  
  if (trigger.frequencyLimit && trigger.frequencyPeriod) {
    const periods: Record<string, string> = {
      hour: 'hour',
      day: 'day', 
      week: 'week',
      month: 'month'
    }
    const period = periods[trigger.frequencyPeriod] || 'day'
    return `Max ${trigger.frequencyLimit}/${period}`
  }
  
  const cooldown = trigger.cooldown || 0
  if (cooldown < 60) return `${cooldown}s cooldown`
  if (cooldown < 3600) return `${Math.floor(cooldown / 60)}m cooldown`
  return `${Math.floor(cooldown / 3600)}h cooldown`
}

export function RuleCard({ rule, onEdit, onToggle, onDelete }: RuleCardProps) {
  const sensorConfig = rule.trigger.sensor ? getSensorConfig(rule.trigger.sensor) : null
  const priorityColor = getPriorityColor(rule.priority)

  return (
    <div className={cn(
      "bg-white border-2 rounded-xl p-4 transition-all duration-200",
      rule.enabled 
        ? "border-purple-200 shadow-md hover:shadow-lg hover:border-purple-300" 
        : "border-gray-200 bg-gray-50 opacity-75"
    )}>
      {/* Mobile Layout */}
      <div className="space-y-4">
        {/* Header Row - Rule name and toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className={cn(
              "font-semibold text-base leading-tight",
              rule.enabled ? "text-gray-800" : "text-gray-500"
            )}>
              {rule.name}
            </h4>
          </div>
          
          {/* Toggle Switch */}
          <div className="flex-shrink-0">
            <Switch
              checked={rule.enabled}
              onCheckedChange={(enabled) => onToggle?.(rule.id, enabled)}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </div>

        {/* Trigger Info Row */}
        <div className="flex items-center gap-2 text-sm">
          {sensorConfig && (
            <>
              <span className="text-lg flex-shrink-0">{sensorConfig.icon}</span>
              <span className="text-gray-600 min-w-0">
                When <span className="font-medium text-gray-800">{sensorConfig.name}</span>
                {rule.trigger.operator && (
                  <> <span className="text-purple-600">{OPERATOR_LABELS[rule.trigger.operator]}</span></>
                )}
                {rule.trigger.value !== undefined && (
                  <> <span className="font-medium text-gray-800">
                    {typeof rule.trigger.value === 'object' 
                      ? JSON.stringify(rule.trigger.value)
                      : String(rule.trigger.value)}
                  </span></>
                )}
              </span>
            </>
          )}
        </div>

        {/* Response Message */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-purple-700 leading-relaxed">
              "{rule.action.message}"
            </p>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Priority Badge */}
          <Badge variant="outline" className={cn("border", priorityColor)}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Priority {rule.priority || 5}
          </Badge>

          {/* Cooldown Badge */}
          <Badge variant="outline" className="border-gray-200 text-gray-600">
            <Timer className="w-3 h-3 mr-1" />
            {formatCooldown(rule)}
          </Badge>

          {/* Status Badge */}
          <Badge 
            variant="outline" 
            className={cn(
              "border",
              rule.enabled 
                ? "border-green-200 text-green-700 bg-green-50" 
                : "border-gray-200 text-gray-500 bg-gray-50"
            )}
          >
            {rule.enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {rule.updatedAt ? (
              <>Updated {new Date(rule.updatedAt).toLocaleDateString()}</>
            ) : rule.createdAt ? (
              <>Created {new Date(rule.createdAt).toLocaleDateString()}</>
            ) : (
              'No date available'
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(rule)}
                className="h-8 px-3 hover:bg-purple-50 hover:text-purple-600"
              >
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Edit</span>
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(rule.id)}
                className="h-8 px-3 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}