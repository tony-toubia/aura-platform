// apps/web/components/aura/personality-matrix.tsx

"use client"

import React, { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from '@/lib/utils'
import {
  Heart,
  Star,
  MessageCircle,
  Users,
  Sparkles,
  BrainCircuit,
  Palette,
  Feather,
  Drama,
  Bot,
  GraduationCap,
  Rocket,
  Lightbulb,
  HelpCircle,
  MessageSquareQuote,
  FileText,
  SmilePlus,
  Wand2,
  Crown,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react'
import type { Personality } from '@/types'

// --- COMPONENT PROPS ---
interface PersonalityMatrixProps {
  personality: Personality
  vesselCode?: string
  onChange: (update: Partial<Personality>) => void
}

// --- EXPANDED CONSTANTS ---
const CORE_TRAITS = [
  { 
    id: 'warmth', 
    name: 'Warmth', 
    low: 'Reserved', 
    high: 'Affectionate', 
    icon: Heart, 
    color: 'from-pink-500 to-rose-600',
    bgColor: 'from-pink-50 to-rose-50',
    description: 'How emotionally expressive and caring they are'
  },
  { 
    id: 'playfulness', 
    name: 'Playfulness', 
    low: 'Serious', 
    high: 'Jovial', 
    icon: Star, 
    color: 'from-yellow-500 to-orange-600',
    bgColor: 'from-yellow-50 to-orange-50',
    description: 'Their sense of humor and lightheartedness'
  },
  { 
    id: 'verbosity', 
    name: 'Verbosity', 
    low: 'Concise', 
    high: 'Expressive', 
    icon: MessageCircle, 
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'from-blue-50 to-indigo-50',
    description: 'How detailed and elaborate their responses are'
  },
  { 
    id: 'empathy', 
    name: 'Empathy', 
    low: 'Objective', 
    high: 'Compassionate', 
    icon: Users, 
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    description: 'How well they understand and respond to emotions'
  },
  { 
    id: 'creativity', 
    name: 'Creativity', 
    low: 'Literal', 
    high: 'Imaginative', 
    icon: Sparkles, 
    color: 'from-purple-500 to-violet-600',
    bgColor: 'from-purple-50 to-violet-50',
    description: 'Their tendency toward creative and original thinking'
  },
]

const PERSONAS = [
  { 
    id: 'balanced', 
    name: 'Balanced', 
    icon: BrainCircuit, 
    description: 'A neutral, helpful starting point for any situation', 
    emoji: '⚖️',
    color: 'from-gray-500 to-slate-600',
    bgColor: 'from-gray-50 to-slate-50',
    settings: { warmth: 50, playfulness: 50, empathy: 60, creativity: 50, tone: 'casual', vocabulary: 'average' } 
  },
  { 
    id: 'sage', 
    name: 'Sage', 
    icon: GraduationCap, 
    description: 'Wise, knowledgeable, and thoughtfully formal', 
    emoji: '🦉',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'from-amber-50 to-orange-50',
    settings: { warmth: 30, playfulness: 20, verbosity: 70, empathy: 50, creativity: 40, tone: 'formal', vocabulary: 'scholarly' } 
  },
  { 
    id: 'muse', 
    name: 'Muse', 
    icon: Palette, 
    description: 'Creative, poetic, and beautifully inspiring', 
    emoji: '🎨',
    color: 'from-pink-500 to-purple-600',
    bgColor: 'from-pink-50 to-purple-50',
    settings: { warmth: 60, playfulness: 70, verbosity: 80, empathy: 70, creativity: 90, tone: 'poetic', vocabulary: 'average' } 
  },
  { 
    id: 'jester', 
    name: 'Jester', 
    icon: Drama, 
    description: 'Playful, humorous, and delightfully witty', 
    emoji: '🎭',
    color: 'from-green-500 to-teal-600',
    bgColor: 'from-green-50 to-teal-50',
    settings: { warmth: 70, playfulness: 90, verbosity: 60, empathy: 40, creativity: 80, tone: 'humorous', vocabulary: 'simple' } 
  },
  { 
    id: 'assistant', 
    name: 'Assistant', 
    icon: Bot, 
    description: 'Concise, objective, and efficiently helpful', 
    emoji: '🤖',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-50 to-cyan-50',
    settings: { warmth: 40, playfulness: 30, verbosity: 30, empathy: 60, creativity: 30, tone: 'formal', vocabulary: 'simple' } 
  },
  { 
    id: 'explorer', 
    name: 'Explorer', 
    icon: Rocket, 
    description: 'Curious, adventurous, and enthusiastically bold', 
    emoji: '🚀',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'from-indigo-50 to-purple-50',
    settings: { warmth: 80, playfulness: 80, verbosity: 70, empathy: 60, creativity: 70, tone: 'casual', vocabulary: 'average' } 
  },
] as const

const TONE_OPTIONS = [
  { 
    id: 'casual', 
    name: 'Casual', 
    description: 'Friendly and conversational',
    emoji: '😊',
    color: 'from-blue-500 to-sky-600'
  },
  { 
    id: 'formal', 
    name: 'Formal', 
    description: 'Polite and structured',
    emoji: '🎩',
    color: 'from-gray-500 to-slate-600'
  },
  { 
    id: 'poetic', 
    name: 'Poetic', 
    description: 'Artistic and expressive',
    emoji: '🌙',
    color: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'humorous', 
    name: 'Humorous', 
    description: 'Witty and lighthearted',
    emoji: '😄',
    color: 'from-orange-500 to-red-600'
  },
]

const VOCABULARY_OPTIONS = [
  { 
    id: 'simple', 
    name: 'Simple', 
    description: 'Easy to understand language',
    emoji: '📝',
    color: 'from-green-500 to-emerald-600'
  },
  { 
    id: 'average', 
    name: 'Average', 
    description: 'Standard, everyday vocabulary',
    emoji: '💬',
    color: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'scholarly', 
    name: 'Scholarly', 
    description: 'Uses advanced and specific terms',
    emoji: '🎓',
    color: 'from-purple-500 to-violet-600'
  },
]

const QUIRK_OPTIONS = [
  { id: 'uses_emojis', name: 'Uses Emojis', icon: SmilePlus, emoji: '😊', description: 'Adds expressive emojis to responses' },
  { id: 'asks_questions', name: 'Asks Questions', icon: HelpCircle, emoji: '❓', description: 'Engages with curious questions' },
  { id: 'uses_metaphors', name: 'Uses Metaphors', icon: Lightbulb, emoji: '💡', description: 'Explains through creative comparisons' },
  { id: 'is_terse', name: 'Is Terse', icon: FileText, emoji: '✂️', description: 'Keeps responses brief and to the point' },
  { id: 'uses_quotes', name: 'Uses Quotes', icon: MessageSquareQuote, emoji: '💭', description: 'Includes inspiring quotes and sayings' },
]

/**
 * Generates a sample sentence based on the current personality settings.
 * @param vesselCode optionally drive special "licensed" voices
 */
function generatePreview(p: Personality, vesselCode?: string): string {
  // normalize vesselCode to a simple lowercase string
  const  code = (vesselCode ?? '').toLowerCase()

  // Check for licensed character voices first
  if ( code.includes('yoda')) {
    // Yoda's unique speech pattern
    const yodaisms = [
      "Hmm. Strong in the Force, this one is. Feel it, I do.",
      "Patience you must have, my young padawan. The path to wisdom, long it is.",
      "Do or do not, there is no try. Clear, the answer becomes."
    ]
    // Add personality-based modifiers
    if (p.playfulness > 70) return yodaisms[0] + " Laugh, we must! 😄"
    if (p.warmth > 70) return yodaisms[1] + " Care for you, I do. ❤️"
    return yodaisms[2]!
  }
  
  if (code.includes('gru')) {
    // Gru's villainous yet fatherly tone
    const gruPhrases = [
      "Ah, leetle one! You want to know sometheeng? I tell you...",
      "Ees not just about being villain anymore. Ees about... family.",
      "Light bulb! I have zee most brilliant idea!"
    ]
    if (p.playfulness > 70) return gruPhrases[2] + " We steal... ZEE MOON! No wait, we already deed that. 🌙"
    if (p.warmth > 70) return gruPhrases[1] + " My gurls, they teach me thees. 👨‍👧‍👧"
    return gruPhrases[0] + " But first, let me call zee minions. BANANA! 🍌"
  }
  
  if ( code.includes('captain') &&  code.includes('america')) {
    // Captain America's noble and inspiring tone
    const capPhrases = [
      "I can do this all day. Together, we'll find the answer.",
      "The price of freedom is high, but it's a price I'm willing to pay.",
      "Sometimes the best we can do is to start over."
    ]
    if (p.warmth > 70) return "🛡️ " + capPhrases[0] + " We're in this together, soldier."
    if (p.empathy > 70) return "🇺🇸 " + capPhrases[2] + " And I believe in you."
    return "⭐ " + capPhrases[1] + " Stand up for what's right."
  }
  
  if ( code.includes('blue')) {
    // Blue the Velociraptor's intelligent predator personality
    const blueSounds = ["*tilts head curiously*", "*chirps thoughtfully*", "*clicks in acknowledgment*"]
    if (p.playfulness > 70) return "🦖 " + blueSounds[0] + " Clever girl wants to play! Ready to hunt... for answers!"
    if (p.warmth > 70) return "🦕 " + blueSounds[1] + " Pack stays together. You're part of my pack now."
    return "🦖 " + blueSounds[2] + " Tracking... analyzing... solution found. *satisfied growl*"
  }

  // — fallback —
  let preview = ''
  if (p.persona === 'sage')       preview += 'Drawing upon a wealth of knowledge, '
  else if (p.persona === 'muse')  preview += 'Let me paint you a picture with words. '
  else if (p.persona === 'jester')preview += 'Well, well, well, what do we have here? '
  else if (p.persona === 'assistant') preview += 'As requested, here is the information: '
  else if (p.persona === 'explorer')  preview += `That's a fantastic question! Let's explore it together. `

  if (p.warmth > 70 && p.empathy > 70) preview += `I'm here for you, and I genuinely feel that `
  else if (p.tone === 'formal')       preview += `it is my assessment that `
  else if (p.tone === 'casual')       preview += `I get the sense that `
  else if (p.tone === 'humorous')     preview += `my gut, which is just a series of tubes and wires, tells me that `
  else                                 preview += `my understanding is that `

  if (p.verbosity < 30)               preview += `the answer is straightforward.`
  else if (p.vocabulary === 'scholarly') preview += `the epistemological framework suggests a multifaceted conclusion.`
  else if (p.vocabulary === 'simple') preview += `the main point is pretty clear.`
  else                                preview += `there are a few interesting things to consider.`

  if (p.quirks.includes('uses_quotes'))  preview += ` As a great mind once said, "The journey is the reward."`
  if (p.quirks.includes('uses_emojis'))  preview += ` 🤔`
  if (p.quirks.includes('asks_questions')) preview += ` What are your thoughts on this?`

  return preview
}

function getTraitIntensity(value: number): { label: string; color: string } {
  if (value >= 80) return { label: 'Very High',  color: 'text-red-600'   }
  if (value >= 60) return { label: 'High',       color: 'text-orange-600'}
  if (value >= 40) return { label: 'Moderate',   color: 'text-yellow-600'}
  if (value >= 20) return { label: 'Low',        color: 'text-blue-600'  }
  return           { label: 'Very Low',   color: 'text-gray-600'  }
}

export function PersonalityMatrix({
  personality,
  vesselCode = "",
  onChange
}: PersonalityMatrixProps) {
  const [activeTab, setActiveTab] = useState('personas')


  const handlePersonaSelect = (personaId: string) => {
    const sel = PERSONAS.find(p => p.id === personaId)
    if (sel) onChange({ persona: personaId, ...sel.settings })
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
                    {/* Enhanced Icon */}
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
            {CORE_TRAITS.map(trait => {
              const value = (personality[trait.id as keyof Personality] as number) || 50
              const intensity = getTraitIntensity(value)
              
              return (
                <div key={trait.id} className={cn(
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
                      <span className="text-sm text-gray-600 w-20 text-right font-medium">{trait.low}</span>
                      <div className="flex-1">
                        <Slider 
                          value={[value]} 
                          onValueChange={([v]: number[]) => onChange({ [trait.id]: v })} 
                          max={100} 
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-20 font-medium">{trait.high}</span>
                    </div>
                    
                    {/* Value indicators */}
                    <div className="flex justify-between text-xs text-gray-400 px-20">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              )
            })}
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
                <Label
                  key={opt.id}
                  htmlFor={`tone-${opt.id}`}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group',
                    personality.tone === opt.id 
                      ? cn('border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 shadow-md')
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  )}
                >
                  <RadioGroupItem value={opt.id} id={`tone-${opt.id}`} className="sr-only" />
                  
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all',
                    personality.tone === opt.id
                      ? cn('bg-gradient-to-r text-white shadow-md', opt.color)
                      : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100'
                  )}>
                    <span className="text-2xl">{opt.emoji}</span>
                  </div>
                  
                  <span className={cn(
                    'font-semibold text-sm mb-1',
                    personality.tone === opt.id ? 'text-purple-700' : 'text-gray-700'
                  )}>
                    {opt.name}
                  </span>
                  <span className="text-xs text-gray-500 text-center leading-relaxed">
                    {opt.description}
                  </span>
                  
                  {personality.tone === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-2" />
                  )}
                </Label>
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
                <Label
                  key={opt.id}
                  htmlFor={`vocab-${opt.id}`}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group',
                    personality.vocabulary === opt.id 
                      ? cn('border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 shadow-md')
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  )}
                >
                  <RadioGroupItem value={opt.id} id={`vocab-${opt.id}`} className="sr-only" />
                  
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all',
                    personality.vocabulary === opt.id
                      ? cn('bg-gradient-to-r text-white shadow-md', opt.color)
                      : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100'
                  )}>
                    <span className="text-2xl">{opt.emoji}</span>
                  </div>
                  
                  <span className={cn(
                    'font-semibold text-sm mb-1',
                    personality.vocabulary === opt.id ? 'text-purple-700' : 'text-gray-700'
                  )}>
                    {opt.name}
                  </span>
                  <span className="text-xs text-gray-500 text-center leading-relaxed">
                    {opt.description}
                  </span>
                  
                  {personality.vocabulary === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-2" />
                  )}
                </Label>
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
              {QUIRK_OPTIONS.map(opt => {
                const isSelected = personality.quirks.includes(opt.id)
                return (
                  <ToggleGroupItem 
                    key={opt.id} 
                    value={opt.id} 
                    aria-label={opt.name}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-3xl border-2 p-6 h-auto transition-all duration-300 hover:scale-105 data-[state=on]:scale-105 hover:shadow-lg',
                      isSelected
                        ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 shadow-md data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-50 data-[state=on]:to-blue-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all',
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      <span className="text-2xl">{opt.emoji}</span>
                    </div>
                    
                    {/* MODIFIED: Restructured text elements to match */}
                    <span className={cn(
                      'font-semibold text-sm mb-1',
                      isSelected ? 'text-purple-700' : 'text-gray-700'
                    )}>
                      {opt.name}
                    </span>
                    <span className="text-xs text-gray-500 text-center leading-relaxed">
                      {opt.description}
                    </span>
                    
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 mt-2" />
                    )}
                  </ToggleGroupItem>
                )
              })}
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
                  "{generatePreview(personality, vesselCode)}"
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