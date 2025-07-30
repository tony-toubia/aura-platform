// apps/web/components/aura/personality-matrix.tsx

"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup } from "@/components/ui/radio-group"
import { ToggleGroup } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Palette,
  Crown,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Feather,
  MessageCircle,
  GraduationCap,
  Zap,
  CheckCircle,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TraitSlider } from '@/components/personality/trait-slider'
import { OptionCard } from '@/components/personality/option-card'
import { usePersonalityPreview } from '@/hooks/use-personality-preview'
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
  vesselType?: string
  auraName?: string
  onChange: (update: Partial<Personality>) => void
}

// Debounce hook for delayed API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function PersonalityMatrix({
  personality,
  vesselCode = "",
  vesselType = "digital",
  auraName = "Your Aura",
  onChange
}: PersonalityMatrixProps) {
  const [activeTab, setActiveTab] = useState('personas')
  
  // Enhanced preview hook
  const { 
    preview, 
    isLoading: previewLoading, 
    error: previewError, 
    generatePreview, 
    clearError 
  } = usePersonalityPreview()

  // Debounce personality changes to avoid excessive API calls
  const debouncedPersonality = useDebounce(personality, 1000) // 1 second delay
  const debouncedAuraName = useDebounce(auraName, 800) // Slightly less delay for name changes

  // Track if this is the initial load
  const hasGeneratedInitialPreview = useRef(false)
  const previousPersonalityRef = useRef<string>('')
  const previousNameRef = useRef<string>('')

  const handlePersonaSelect = (personaId: string) => {
    const selected = PERSONAS.find(p => p.id === personaId)
    if (selected) {
      onChange({ persona: personaId, ...selected.settings })
    }
  }

  const isPersonaSelected = !!personality.persona
  const areTraitsCustomized = true // Always allow progression from traits
  const isStyleConfigured = personality.tone && personality.vocabulary

  const tabs = [
    { id: 'personas', label: '1. Persona', icon: Crown, completed: isPersonaSelected },
    { id: 'traits', label: '2. Core Traits', icon: Heart, completed: areTraitsCustomized },
    { id: 'style', label: '3. Voice & Style', icon: Palette, completed: isStyleConfigured }
  ]

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab)
  const canGoNext = currentTabIndex < tabs.length - 1
  const canGoPrev = currentTabIndex > 0

  const goToNextTab = () => {
    if (canGoNext) {
      setActiveTab(tabs[currentTabIndex + 1]!.id)
    }
  }

  const goToPrevTab = () => {
    if (canGoPrev) {
      setActiveTab(tabs[currentTabIndex - 1]!.id)
    }
  }

  // Function to trigger AI preview generation
  const handleGeneratePreview = useCallback(async (forceRefresh = false) => {
    clearError()
    await generatePreview({
      personality: forceRefresh ? personality : debouncedPersonality,
      vesselType,
      vesselCode,
      auraName: forceRefresh ? auraName : debouncedAuraName
    })
  }, [debouncedPersonality, debouncedAuraName, vesselType, vesselCode, generatePreview, clearError, personality, auraName])

  // Auto-generate preview when debounced values change, but not on every keystroke
  useEffect(() => {
    const personalityString = JSON.stringify(debouncedPersonality)
    const nameString = debouncedAuraName
    
    // Check if we have basic personality data
    const hasBasicPersonality = debouncedPersonality.persona || debouncedPersonality.tone || debouncedPersonality.vocabulary
    
    // Only generate if:
    // 1. We have basic personality data AND
    // 2. Either this is the first load OR something meaningful changed
    if (hasBasicPersonality) {
      const personalityChanged = previousPersonalityRef.current !== personalityString
      const nameChanged = previousNameRef.current !== nameString
      
      if (!hasGeneratedInitialPreview.current || personalityChanged || nameChanged) {
        handleGeneratePreview()
        hasGeneratedInitialPreview.current = true
        previousPersonalityRef.current = personalityString
        previousNameRef.current = nameString
      }
    }
  }, [debouncedPersonality, debouncedAuraName, handleGeneratePreview])

  // Fallback preview using the original static function
  const fallbackPreview = generatePersonalityPreview(personality, vesselCode)

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Progress */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
          <Wand2 className="w-4 h-4" />
          Personality Configuration
        </div>
        
        {/* Progress Indicators */}
        <div className="flex items-center justify-center gap-2">
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <div 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-purple-600 text-white shadow-lg scale-105" 
                    : tab.completed 
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.completed && activeTab !== tab.id ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <tab.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{index + 1}</span>
              </div>
              {index < tabs.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 rounded",
                  tabs[index]!.completed ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab 1: Enhanced Personas */}
        <TabsContent value="personas" className="mt-8 space-y-8">
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
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Navigation for Personas */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={goToNextTab}
              disabled={!isPersonaSelected}
              size="lg"
              className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Continue to Core Traits
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </TabsContent>

        {/* Tab 2: Enhanced Core Traits */}
        <TabsContent value="traits" className="mt-8 space-y-8">
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

          {/* Navigation for Traits - Mobile Stacked */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 pt-4">
            <Button
              onClick={goToPrevTab}
              variant="outline"
              size="lg"
              className="px-8 w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Persona
            </Button>
            <Button
              onClick={goToNextTab}
              size="lg"
              className="px-8 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 order-1 sm:order-2"
            >
              Continue to Voice & Style
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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

          {/* Navigation for Style */}
          <div className="flex flex-col items-center pt-4 space-y-4">
            {/* Completion indicator on its own line */}
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Personality Complete!</span>
            </div>

            {/* Back button below */}
            <Button
              onClick={goToPrevTab}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Core Traits
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Live Preview Section with Real AI */}
      <div className="mt-12 pt-8 border-t-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Feather className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Live Personality Preview
          </h4>
          
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGeneratePreview(true)} // Force refresh with current values
            disabled={previewLoading}
            className="flex items-center gap-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
          >
            {previewLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {previewLoading ? 'Generating...' : 'Refresh'}
            </span>
          </Button>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-4 sm:p-8">
          {/* Desktop Layout: Side by side */}
          <div className="hidden sm:flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    previewLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-pulse"
                  )}></div>
                  <span className="text-sm font-medium text-gray-600">
                    {previewLoading ? 'Generating AI Preview...' : 'AI Preview Response'}
                  </span>
                </div>
                
                {previewError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      ⚠️ {previewError}
                    </p>
                  </div>
                )}
                
                <div className="min-h-[60px] flex items-center">
                  {previewLoading ? (
                    <div className="flex items-center gap-3 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="italic">Generating your Aura's unique personality...</span>
                    </div>
                  ) : (
                    <p className="text-gray-800 leading-relaxed italic">
                      "{preview || fallbackPreview}"
                    </p>
                  )}
                </div>
                
                {!previewLoading && preview && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Generated using AI • Each refresh creates a unique response</span>
                  </div>
                )}
                
                {!previewLoading && !preview && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>Static preview • Click refresh for AI-generated response</span>
                  </div>
                )}
              </div>
              
              {/* Desktop Personality Summary */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Persona</div>
                  <div className="font-medium text-purple-700 capitalize text-sm">
                    {personality.persona || 'None'}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Tone</div>
                  <div className="font-medium text-blue-700 capitalize text-sm">
                    {personality.tone || 'Casual'}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Quirks</div>
                  <div className="font-medium text-green-700 text-sm">
                    {personality.quirks?.length || 0} active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout: Stacked */}
          <div className="sm:hidden space-y-4">
            {/* Mobile message bubble - full width */}
            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  previewLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-pulse"
                )}></div>
                <span className="text-sm font-medium text-gray-600">
                  {previewLoading ? 'Generating...' : 'AI Preview'}
                </span>
              </div>
              
              {previewError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  ⚠️ {previewError}
                </div>
              )}
              
              <div className="min-h-[50px] flex items-center">
                {previewLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="italic text-sm">Generating personality...</span>
                  </div>
                ) : (
                  <p className="text-gray-800 leading-relaxed italic text-sm">
                    "{preview || fallbackPreview}"
                  </p>
                )}
              </div>
            </div>
            
            {/* Mobile Personality Summary - Full width grid */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white/70 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Persona:</span>
                <span className="font-semibold text-purple-700 capitalize text-sm">
                  {personality.persona || 'None Selected'}
                </span>
              </div>
              <div className="bg-white/70 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Tone:</span>
                <span className="font-semibold text-blue-700 capitalize text-sm">
                  {personality.tone || 'Casual'}
                </span>
              </div>
              <div className="bg-white/70 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Vocabulary:</span>
                <span className="font-semibold text-emerald-700 capitalize text-sm">
                  {personality.vocabulary || 'Simple'}
                </span>
              </div>
              {personality.quirks && personality.quirks.length > 0 && (
                <div className="bg-white/70 rounded-lg p-3">
                  <div className="text-sm text-gray-600 font-medium mb-2">Active Quirks:</div>
                  <div className="flex flex-wrap gap-2">
                    {personality.quirks.map((quirk, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {QUIRK_OPTIONS.find(q => q.id === quirk)?.emoji} {QUIRK_OPTIONS.find(q => q.id === quirk)?.name || quirk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            ✨ This preview uses AI to show how your Aura will actually communicate
            {vesselCode && ` • Featuring ${vesselCode.charAt(0).toUpperCase() + vesselCode.slice(1)} personality`}
          </p>
        </div>
      </div>
    </div>
  )
}