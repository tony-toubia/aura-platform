// apps/web/components/personality/option-card.tsx

"use client"

import React from 'react'
import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { ToggleGroupItem } from "@/components/ui/toggle-group"
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptionCardProps {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  isSelected: boolean
  type: 'radio' | 'toggle'
  groupName?: string
}

export function OptionCard({
  id,
  name,
  description,
  emoji,
  color,
  isSelected,
  type,
  groupName
}: OptionCardProps) {
  const cardContent = (
    <>
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all',
        isSelected
          ? cn('bg-gradient-to-r text-white shadow-md', color)
          : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100'
      )}>
        <span className="text-2xl">{emoji}</span>
      </div>
      
      <span className={cn(
        'font-semibold text-sm mb-1',
        isSelected ? 'text-purple-700' : 'text-gray-700'
      )}>
        {name}
      </span>
      <span className="text-xs text-gray-500 text-center leading-relaxed">
        {description}
      </span>
      
      {isSelected && (
        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-2" />
      )}
    </>
  )

  const cardClassName = cn(
    'flex flex-col items-center justify-center rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group',
    isSelected 
      ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 shadow-md'
      : 'border-gray-200 hover:border-purple-300 bg-white'
  )

  if (type === 'radio' && groupName) {
    return (
      <Label
        htmlFor={`${groupName}-${id}`}
        className={cardClassName}
      >
        <RadioGroupItem value={id} id={`${groupName}-${id}`} className="sr-only" />
        {cardContent}
      </Label>
    )
  }

  return (
    <ToggleGroupItem 
      value={id} 
      aria-label={name}
      className={cn(
        cardClassName,
        'h-auto data-[state=on]:scale-105',
        isSelected && 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-50 data-[state=on]:to-blue-50'
      )}
    >
      {cardContent}
    </ToggleGroupItem>
  )
}