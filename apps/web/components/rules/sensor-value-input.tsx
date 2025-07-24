// apps/web/components/rules/sensor-value-input.tsx

"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { SensorMetadata } from '@/types'

interface SensorValueInputProps {
  sensor: SensorMetadata
  operator: string
  value: any
  onChange: (value: any) => void
}

export function SensorValueInput({ sensor, operator, value, onChange }: SensorValueInputProps) {
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