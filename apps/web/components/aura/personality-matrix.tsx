// apps/web/components/aura/personality-matrix.tsx

"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup } from "@/components/ui/radio-group"
import { ToggleGroup } from "@/components/ui/toggle-group"
import {
  Heart,
  Palette,
  Crown,
  CheckCircle2,
  ArrowRight,
  Wand2,
  Feather,
  MessageCircle,
  GraduationCap,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TraitSlider } from '@/components/personality/trait-slider'
import { OptionCard } from '@/components/personality/option-card'
import { generatePersonalityPreview } from '@/lib/personality-preview'
import { 
  CORE_TRAITS, 
  PERSONAS, 
  TONE_OPTIONS, 
  VOCABULARY_OPTIONS, 
  QUIRK_OPTIONS 
} from '@/lib/constants/personality'
import type { Personality } from '@/types'

interface PersonalityMatrixProps {
  personality: Personality
  vesselCode?: string
  onChange: (update: Partial<Personality>) => void
}

export function PersonalityMatrix({
  personality,
  vesselCode = "",
  onChange
}: PersonalityMatrixProps) {
  const [activeTab, setActiveTab] = useState('personas')

  const handlePersonaSelect = (personaId: string) => {
    const selected = PERSONAS.find(p => p.id === personaId)
    if (selected) {
      onChange({ persona: personaId, ...selected.settings })
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
          <Wand2 className="w-4 h-4" />
          Personality Configuration
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Enhanced Tabs List */}
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100 rounded-2xl p-1">
          <TabsTrigger 
            value="personas" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl"
          >
            <Crown className="w-4 h-4 mr-2" />
            1. Persona
          </TabsTrigger>
          <TabsTrigger 
            value="traits"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl"
          >
            <Heart className="w-4 h-4 mr-2" />
            2. Core Traits
          </TabsTrigger>
          <TabsTrigger 
            value="style"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl"
          >
            <Palette className="w-4 h-4 mr-2" />
            3. Voice & Style
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Enhanced Personas */}
        <TabsContent value="personas" className="mt-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Archetype</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select a personality archetype as your starting point. Each one brings unique traits and communication styles that you can further customize.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERSONAS.map(persona => {
              const isSelected = personality.persona === persona.id
              return (
                <Card
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona.id)}
                  className={cn(
                    'cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 group border-2',
                    isSelected 
                      ? 'ring-4 ring-purple-300 shadow-2xl scale-105 border-purple-400' 
                      : 'hover:border-purple-300 border-gray-200'
                  )}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300',
                      isSelected 
                        ? cn('bg-gradient-to-r text-white shadow-lg', persona.color)
                        : cn('bg-gradient-to-r group-hover:scale-110', persona.bgColor, 'text-gray-700')
                    )}>
                      <div className="text-3xl">{persona.emoji}</div>
                    </div>
                    
                    <CardTitle className={cn(
                      'text-xl transition-colors',
                      isSelected ? 'text-purple-700' : 'text-gray-800'
                    )}>
                      {persona.name}
                    </CardTitle>
                    
                    {isSelected && (
                      <div className="flex items-center justify-center gap-2 text-purple-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600 leading-relaxed">{persona.description}</p>
                    {isSelected && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-purple-600 text-sm font-medium">
                        <span>Click "2. Core Traits" to fine-tune</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Tab 2: Enhanced Core Traits */}
        <TabsContent value="traits" className="mt-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Fine-Tune Core Traits</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Adjust the fundamental aspects of your Aura's personality. Move the sliders to find the perfect balance.
            </p>
          </div>
          
          <div className="space-y-8">
            {CORE_TRAITS.map(trait => (
              <TraitSlider
                key={trait.id}
                trait={trait}
                value={(personality[trait.id as keyof Personality] as number) || 50}
                onChange={(value) => onChange({ [trait.id]: value })}
              />
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Enhanced Voice & Style */}
        <TabsContent value="style" className="mt-8 space-y-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Voice & Style</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Define how your Aura communicates and add unique personality quirks that make them special.
            </p>
          </div>

          {/* Enhanced Tone Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              Conversational Tone
            </h4>
            <RadioGroup
              value={personality.tone}
              onValueChange={(v: string) => onChange({ tone: v as Personality['tone'] })}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {TONE_OPTIONS.map(opt => (
                <OptionCard
                  key={opt.id}
                  id={opt.id}
                  name={opt.name}
                  description={opt.description}
                  emoji={opt.emoji}
                  color={opt.color}
                  isSelected={personality.tone === opt.id}
                  type="radio"
                  groupName="tone"
                />
              ))}
            </RadioGroup>
          </div>

          {/* Enhanced Vocabulary Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Vocabulary Level
            </h4>
            <RadioGroup
              value={personality.vocabulary}
              onValueChange={(v: string) => onChange({ vocabulary: v as Personality['vocabulary'] })}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {VOCABULARY_OPTIONS.map(opt => (
                <OptionCard
                  key={opt.id}
                  id={opt.id}
                  name={opt.name}
                  description={opt.description}
                  emoji={opt.emoji}
                  color={opt.color}
                  isSelected={personality.vocabulary === opt.id}
                  type="radio"
                  groupName="vocab"
                />
              ))}
            </RadioGroup>
          </div>

          {/* Enhanced Quirks Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Communication Quirks
            </h4>
            <p className="text-gray-600 mb-6">Add special touches that make your Aura's communication style unique and memorable.</p>
            
            <ToggleGroup 
              type="multiple" 
              value={personality.quirks} 
              onValueChange={(v: string[]) => onChange({ quirks: v })} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {QUIRK_OPTIONS.map(opt => (
                <OptionCard
                  key={opt.id}
                  id={opt.id}
                  name={opt.name}
                  description={opt.description}
                  emoji={opt.emoji}
                  color="from-purple-500 to-blue-500"
                  isSelected={personality.quirks.includes(opt.id)}
                  type="toggle"
                />
              ))}
            </ToggleGroup>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Live Preview Section */}
      <div className="mt-12 pt-8 border-t-2 border-gray-100">
        <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Feather className="w-5 h-5 text-white" />
          </div>
          Live Personality Preview
        </h4>
        
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-600">Sample Response</span>
                </div>
                <p className="text-gray-800 leading-relaxed italic">
                  "{generatePersonalityPreview(personality, vesselCode)}"
                </p>
              </div>
              
              {/* Personality Summary */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Persona</div>
                  <div className="font-medium text-purple-700 capitalize">
                    {personality.persona || 'None'}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Tone</div>
                  <div className="font-medium text-blue-700 capitalize">
                    {personality.tone || 'Casual'}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Quirks</div>
                  <div className="font-medium text-green-700">
                    {personality.quirks?.length || 0} active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ✨ This preview updates in real-time as you adjust the personality settings
          </p>
        </div>
      </div>
    </div>
  )
}