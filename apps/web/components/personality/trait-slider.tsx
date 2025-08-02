// apps/web/components/personality/trait-slider.tsx

"use client"

import React from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { getTraitIntensity } from '@/lib/constants/personality'
import type { PersonalityTrait } from '@/types/personality'

interface TraitSliderProps {
  trait: PersonalityTrait
  value: number
  onChange: (value: number) => void
}

export function TraitSlider({ trait, value, onChange }: TraitSliderProps) {
  const intensity = getTraitIntensity(value)
  
  return (
    <div className={cn(
      'p-6 rounded-2xl border-2 bg-gradient-to-r transition-all duration-300',
      trait.bgColor,
      'border-gray-200 hover:border-purple-300'
    )}>
      {/* Trait Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r text-white shadow-md',
            trait.color
          )}>
            <trait.icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{trait.name}</h4>
            <p className="text-sm text-gray-600">{trait.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-700">{value}</div>
          <div className={cn('text-xs font-medium', intensity.color)}>
            {intensity.label}
          </div>
        </div>
      </div>
      
      {/* Enhanced Slider */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 w-24 text-right font-medium">{trait.low}</span>
          <div className="flex-1">
            <Slider
              value={[value]}
              onValueChange={([v]) => onChange(v!)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <span className="text-sm text-gray-600 w-24 font-medium">{trait.high}</span>
        </div>
        
        {/* Value indicators */}
        <div className="flex justify-between text-xs text-gray-400 px-24">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </div>
  )
}