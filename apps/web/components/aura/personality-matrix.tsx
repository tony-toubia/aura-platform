"use client"

import React from 'react'
import { Slider } from '@/components/ui/slider'
import { PERSONALITY_TRAITS } from '@/lib/constants'
import { Heart, Star, MessageCircle, Users, Sparkles } from 'lucide-react'

interface PersonalityMatrixProps {
  personality: Record<string, number>
  onChange: (trait: string, value: number) => void
}

const traitIcons = {
  warmth: Heart,
  playfulness: Star,
  verbosity: MessageCircle,
  empathy: Users,
  creativity: Sparkles,
}

export function PersonalityMatrix({ personality, onChange }: PersonalityMatrixProps) {
  return (
    <div className="space-y-6">
      {PERSONALITY_TRAITS.map((trait) => {
        const Icon = traitIcons[trait.id as keyof typeof traitIcons]
        const value = personality[trait.id] || 50

        return (
          <div key={trait.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="font-medium">{trait.name}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-muted-foreground w-20 text-right">{trait.low}</span>
                <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  {value}%
                </span>
                <span className="text-muted-foreground w-20">{trait.high}</span>
              </div>
            </div>
            <Slider
              value={[value]}
              onValueChange={([newValue]) => onChange(trait.id, newValue || 0)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        )
      })}

      <div className="mt-8 p-4 bg-primary/5 rounded-lg">
        <h4 className="font-medium mb-2">Personality Preview</h4>
        <p className="text-sm text-muted-foreground">
          This Aura will be
          {(personality.warmth || 50) > 50 ? ' warm and friendly' : ' analytical and objective'},
          {(personality.playfulness || 50) > 50 ? ' with a playful spirit' : ' maintaining a serious demeanor'},
          {(personality.verbosity || 50) > 50 ? ' expressing thoughts in detail' : ' keeping responses concise'},
          {(personality.empathy || 50) > 50 ? ' showing deep empathy' : ' remaining objective'}, and
          {(personality.creativity || 50) > 50 ? ' thinking creatively' : ' sticking to facts'}.
        </p>
      </div>
    </div>
  )
}