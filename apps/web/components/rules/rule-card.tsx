// apps/web/components/rules/rule-card.tsx

"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Edit2, Trash2, Timer, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OPERATOR_LABELS, getPriorityConfig } from '@/lib/constants/rules'
import { getSensorConfig } from '@/types'
import type { BehaviorRule } from '@/types'

interface RuleCardProps {
  rule: BehaviorRule
  onEdit?: (rule: BehaviorRule) => void
  onToggle?: (ruleId: string, enabled: boolean) => void
  onDelete?: (ruleId: string) => void
}

export function RuleCard({ rule, onEdit, onToggle, onDelete }: RuleCardProps) {
  const sensorConfig = getSensorConfig(rule.trigger.sensor || '')
  const priorityConfig = getPriorityConfig(rule.priority || 5)

  return (
    <div className="group relative p-5 rounded-2xl border-2 border-gray-200 hover:border-purple-300 bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-blue-50 transition-all duration-300">
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
                  priorityConfig.color,
                  priorityConfig.bgColor
                )}>
                  {priorityConfig.label}
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
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(rule)}
              className="opacity-0 group-hover:opacity-100 p-2"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onToggle && rule.id && (
            <Switch
              checked={rule.enabled}
              onCheckedChange={(ch) => onToggle(rule.id!, ch)}
            />
          )}
          {onDelete && rule.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(rule.id!)}
              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}