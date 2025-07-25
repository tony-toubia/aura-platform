// apps/web/components/rules/cooldown-config.tsx

"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Timer, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FREQUENCY_PERIODS, COMMON_FREQUENCIES } from '@/lib/constants/cooldown'
import type { CooldownHookReturn } from '@/hooks/use-cooldown-config'

interface CooldownConfigProps {
  cooldownConfig: CooldownHookReturn
}

export function CooldownConfig({ cooldownConfig }: CooldownConfigProps) {
  const {
    type,
    simpleCooldown,
    frequencyLimit,
    frequencyPeriod,
    minimumGap,
    setCooldownType,
    setSimpleCooldown,
    setFrequencyLimit,
    setFrequencyPeriod,
    setMinimumGap
  } = cooldownConfig

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Timer className="w-4 h-4" /> Trigger Frequency Control
      </label>
      
      {/* Cooldown Type Selector */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={type === 'simple' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCooldownType('simple')}
          className="h-auto p-3 flex flex-col items-center gap-1"
        >
          <Timer className="w-4 h-4" />
          <span className="text-xs">Simple Cooldown</span>
        </Button>
        <Button
          type="button"
          variant={type === 'frequency' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCooldownType('frequency')}
          className="h-auto p-3 flex flex-col items-center gap-1"
        >
          <Activity className="w-4 h-4" />
          <span className="text-xs">Frequency Limit</span>
        </Button>
      </div>

      {type === 'simple' ? (
        /* Simple Cooldown */
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Minimum time between triggers</label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              value={simpleCooldown}
              onChange={(e) => setSimpleCooldown(e.target.value)}
              className="border-2 border-gray-200 focus:border-purple-400"
              placeholder="60"
            />
            <span className="flex items-center text-sm text-gray-500 px-3">seconds</span>
          </div>
          <p className="text-xs text-gray-500">
            Rule won't trigger again for this many seconds
          </p>
        </div>
      ) : (
        /* Frequency-based Cooldown */
        <div className="space-y-4">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Quick presets</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_FREQUENCIES.map((preset) => (
                <Button
                  key={`${preset.limit}-${preset.period}`}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFrequencyLimit(String(preset.limit))
                    setFrequencyPeriod(preset.period)
                  }}
                  className={cn(
                    "h-auto p-3 text-left justify-start",
                    frequencyLimit === String(preset.limit) && frequencyPeriod === preset.period && 
                    "border-purple-400 bg-purple-50"
                  )}
                >
                  <div>
                    <div className="font-medium text-sm">{preset.label}</div>
                    <div className="text-xs text-gray-500">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Frequency Settings */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-gray-700">Custom frequency limit</div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Maximum triggers</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={frequencyLimit}
                  onChange={(e) => setFrequencyLimit(e.target.value)}
                  className="border-2 border-gray-200 focus:border-purple-400"
                  placeholder="3"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Time period</label>
                <Select value={frequencyPeriod} onValueChange={setFrequencyPeriod}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Minimum Gap */}
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Minimum gap between triggers</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={minimumGap}
                  onChange={(e) => setMinimumGap(e.target.value)}
                  className="border-2 border-gray-200 focus:border-purple-400"
                  placeholder="300"
                />
                <span className="flex items-center text-sm text-gray-500 px-3">seconds</span>
              </div>
              <p className="text-xs text-gray-500">
                Even within the frequency limit, wait this long between triggers
              </p>
            </div>

            {/* Preview */}
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <div className="text-xs font-medium text-purple-700 mb-1">Preview:</div>
              <div className="text-xs text-purple-600">
                Maximum {frequencyLimit} {parseInt(frequencyLimit) === 1 ? 'time' : 'times'} {FREQUENCY_PERIODS.find(p => p.value === frequencyPeriod)?.label},
                with at least {Math.floor(parseInt(minimumGap) / 60)} minutes between each trigger
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}