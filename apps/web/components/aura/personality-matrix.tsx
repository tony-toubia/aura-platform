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
} from 'lucide-react'
import type { Personality } from '@/types'


// --- 2. COMPONENT PROPS ---
// The component's props are updated to handle the new personality structure.
interface PersonalityMatrixProps {
  personality: Personality
  // onChange now sends a partial update of the personality object.
  onChange: (update: Partial<Personality>) => void
}

// --- 3. EXPANDED CONSTANTS ---
// These constants define the options for the new UI elements.
const CORE_TRAITS = [
  { id: 'warmth', name: 'Warmth', low: 'Reserved', high: 'Affectionate', icon: Heart },
  { id: 'playfulness', name: 'Playfulness', low: 'Serious', high: 'Jovial', icon: Star },
  { id: 'verbosity', name: 'Verbosity', low: 'Concise', high: 'Expressive', icon: MessageCircle },
  { id: 'empathy', name: 'Empathy', low: 'Objective', high: 'Compassionate', icon: Users },
  { id: 'creativity', name: 'Creativity', low: 'Literal', high: 'Imaginative', icon: Sparkles },
]

const PERSONAS = [
  { id: 'balanced', name: 'Balanced', icon: BrainCircuit, description: 'A neutral, helpful starting point.', settings: { warmth: 50, playfulness: 50, empathy: 60, creativity: 50, tone: 'casual', vocabulary: 'average' } },
  { id: 'sage', name: 'Sage', icon: GraduationCap, description: 'Wise, knowledgeable, and formal.', settings: { warmth: 30, playfulness: 20, verbosity: 70, empathy: 50, creativity: 40, tone: 'formal', vocabulary: 'scholarly' } },
  { id: 'muse', name: 'Muse', icon: Palette, description: 'Creative, poetic, and inspiring.', settings: { warmth: 60, playfulness: 70, verbosity: 80, empathy: 70, creativity: 90, tone: 'poetic', vocabulary: 'average' } },
  { id: 'jester', name: 'Jester', icon: Drama, description: 'Playful, humorous, and witty.', settings: { warmth: 70, playfulness: 90, verbosity: 60, empathy: 40, creativity: 80, tone: 'humorous', vocabulary: 'simple' } },
  { id: 'assistant', name: 'Assistant', icon: Bot, description: 'Concise, objective, and helpful.', settings: { warmth: 40, playfulness: 30, verbosity: 30, empathy: 60, creativity: 30, tone: 'formal', vocabulary: 'simple' } },
  { id: 'explorer', name: 'Explorer', icon: Rocket, description: 'Curious, adventurous, and enthusiastic.', settings: { warmth: 80, playfulness: 80, verbosity: 70, empathy: 60, creativity: 70, tone: 'casual', vocabulary: 'average' } },
] as const

const TONE_OPTIONS = [
  { id: 'casual', name: 'Casual', description: 'Friendly and conversational.' },
  { id: 'formal', name: 'Formal', description: 'Polite and structured.' },
  { id: 'poetic', name: 'Poetic', description: 'Artistic and expressive.' },
  { id: 'humorous', name: 'Humorous', description: 'Witty and lighthearted.' },
]

const VOCABULARY_OPTIONS = [
  { id: 'simple', name: 'Simple', description: 'Easy to understand language.' },
  { id: 'average', name: 'Average', description: 'Standard, everyday vocabulary.' },
  { id: 'scholarly', name: 'Scholarly', description: 'Uses advanced and specific terms.' },
]

const QUIRK_OPTIONS = [
  { id: 'uses_emojis', name: 'Uses Emojis', icon: SmilePlus },
  { id: 'asks_questions', name: 'Asks Questions', icon: HelpCircle },
  { id: 'uses_metaphors', name: 'Uses Metaphors', icon: Lightbulb },
  { id: 'is_terse', name: 'Is Terse', icon: FileText },
  { id: 'uses_quotes', name: 'Uses Quotes', icon: MessageSquareQuote },
]

/**
 * Generates a sample sentence based on the current personality settings.
 * This provides users with immediate, tangible feedback on their choices.
 * @param p The current personality object.
 * @returns A string representing a sample response.
 */
function generatePreview(p: Personality): string {
  let preview = ''

  // Start with a persona-based opening
  if (p.persona === 'sage') preview += 'Drawing upon a wealth of knowledge, '
  else if (p.persona === 'muse') preview += 'Let me paint you a picture with words. '
  else if (p.persona === 'jester') preview += 'Well, well, well, what do we have here? '
  else if (p.persona === 'assistant') preview += 'As requested, here is the information: '
  else if (p.persona === 'explorer') preview += `That's a fantastic question! Let's explore it together. `

  // Combine warmth, empathy, and tone
  if (p.warmth > 70 && p.empathy > 70) {
    preview += `I'm here for you, and I genuinely feel that `
  } else if (p.tone === 'formal') {
    preview += `it is my assessment that `
  } else if (p.tone === 'casual') {
    preview += `I get the sense that `
  } else if (p.tone === 'humorous') {
    preview += `my gut, which is just a series of tubes and wires, tells me that `
  } else {
    preview += `my understanding is that `
  }
  
  // Factor in verbosity and vocabulary
  if (p.verbosity < 30) {
    preview += `the answer is straightforward.`
  } else if (p.vocabulary === 'scholarly') {
    preview += `the epistemological framework suggests a multifaceted conclusion.`
  } else if (p.vocabulary === 'simple') {
    preview += `the main point is pretty clear.`
  } else {
    preview += `there are a few interesting things to consider.`
  }

  // Add quirks
  if (p.quirks.includes('uses_quotes')) preview += ` As a great mind once said, "The journey is the reward."`
  if (p.quirks.includes('uses_emojis')) preview += ` 🤔`
  if (p.quirks.includes('asks_questions')) preview += ` What are your thoughts on this?`

  return preview
}

// --- MAIN COMPONENT ---

export function PersonalityMatrix({ personality, onChange }: PersonalityMatrixProps) {
  const [activeTab, setActiveTab] = useState('personas')

  const handlePersonaSelect = (personaId: string) => {
    const selectedPersona = PERSONAS.find(p => p.id === personaId)
    if (selectedPersona) {
      onChange({ persona: personaId, ...selectedPersona.settings })
      // Automatically move user to the next step for a smoother workflow
      setActiveTab('traits')
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personas">1. Persona</TabsTrigger>
          <TabsTrigger value="traits">2. Core Traits</TabsTrigger>
          <TabsTrigger value="style">3. Voice & Style</TabsTrigger>
        </TabsList>

        {/* Tab 1: Personas */}
        <TabsContent value="personas" className="mt-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold">Choose an Archetype</h3>
            <p className="text-sm text-muted-foreground">Select a persona as a starting point. You can fine-tune everything in the next steps.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PERSONAS.map(persona => {
              const isSelected = personality.persona === persona.id
              return (
                <Card
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona.id)}
                  className={cn('cursor-pointer transition-all hover:shadow-lg hover:scale-105', isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-primary/50')}
                >
                  <CardHeader className="items-center text-center">
                    <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 mb-2', isSelected && 'bg-primary text-primary-foreground')}>
                      <persona.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-base">{persona.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground text-center">{persona.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Tab 2: Core Traits */}
        <TabsContent value="traits" className="mt-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold">Fine-Tune Core Traits</h3>
            <p className="text-sm text-muted-foreground">Adjust the fundamental aspects of the personality on a scale from 0 to 100.</p>
          </div>
          <div className="space-y-6">
            {CORE_TRAITS.map(trait => {
              const value = (personality[trait.id as keyof Personality] as number) || 50
              return (
                <div key={trait.id}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <trait.icon className="w-4 h-4 text-primary" />
                      <span>{trait.name}</span>
                    </div>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{value}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-20 text-right">{trait.low}</span>
                    <Slider value={[value]} onValueChange={([v]: number[]) => onChange({ [trait.id]: v })} max={100} step={1} />
                    <span className="text-xs text-muted-foreground w-20">{trait.high}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Voice & Style */}
        <TabsContent value="style" className="mt-6 space-y-8">
          {/* Tone Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Conversational Tone</h3>
            <RadioGroup
              value={personality.tone}
              onValueChange={(v: string) => onChange({ tone: v as Personality['tone'] })}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {TONE_OPTIONS.map(opt => (
                <Label
                  key={opt.id}
                  htmlFor={`tone-${opt.id}`}
                  className={cn('flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground', personality.tone === opt.id && 'border-primary bg-primary/5')}
                >
                  <RadioGroupItem value={opt.id} id={`tone-${opt.id}`} className="sr-only" />
                  <span className="font-semibold text-sm">{opt.name}</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center">{opt.description}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Vocabulary Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Vocabulary Level</h3>
            <RadioGroup
              value={personality.vocabulary}
              onValueChange={(v: string) => onChange({ vocabulary: v as Personality['vocabulary'] })}
              className="grid grid-cols-3 gap-4"
            >
              {VOCABULARY_OPTIONS.map(opt => (
                <Label
                  key={opt.id}
                  htmlFor={`vocab-${opt.id}`}
                  className={cn('flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground', personality.vocabulary === opt.id && 'border-primary bg-primary/5')}
                >
                  <RadioGroupItem value={opt.id} id={`vocab-${opt.id}`} className="sr-only" />
                  <span className="font-semibold text-sm">{opt.name}</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center">{opt.description}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Quirks Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Communication Quirks</h3>
            <ToggleGroup type="multiple" value={personality.quirks} onValueChange={(v: string[]) => onChange({ quirks: v })} className="flex flex-wrap gap-2 justify-start">
              {QUIRK_OPTIONS.map(opt => (
                <ToggleGroupItem key={opt.id} value={opt.id} aria-label={opt.name} className="flex gap-2 data-[state=on]:bg-primary/20">
                  <opt.icon className="w-4 h-4" />
                  {opt.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </TabsContent>
      </Tabs>

      {/* Live Preview Section */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
          <Feather className="w-5 h-5 text-primary" />
          Live Personality Preview
        </h4>
        <div className="p-4 bg-muted/50 rounded-lg min-h-[80px] flex items-center">
          <p className="text-sm text-muted-foreground italic">"{generatePreview(personality)}"</p>
        </div>
      </div>
    </div>
  )
}