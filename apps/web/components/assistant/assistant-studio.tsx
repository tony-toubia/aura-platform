"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PersonalityMatrix } from "../aura/personality-matrix"
import { SenseSelector, type OAuthConnectionData } from "../aura/sense-selector"
import { RuleBuilder } from "../aura/rule-builder"
import { UpgradePrompt } from "../subscription/upgrade-prompt"
import type { LocationConfig } from "../aura/sense-location-modal"
import type { NewsLocation } from "../aura/news-configuration-modal"
import type { WeatherAirQualityLocation } from "../aura/weather-air-quality-configuration-modal"
import type { PersonalSenseType } from "../aura/enhanced-oauth-connection-modal"
import {
  VESSEL_SENSE_CONFIG,
  AVAILABLE_SENSES,
  type VesselTypeId,
  type SenseId,
} from "@/lib/constants"
import { type AuraFormData } from "@/types/aura-forms"
import {
  Bot,
  Brain,
  Zap,
  Calendar,
  Activity,
  MessageCircle,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Target,
  Heart,
  Star,
  Lightbulb,
  Workflow,
  Database,
  Link,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Personality } from "@/types"
import { useFormSubmit } from "@/hooks/use-async"
import { auraApi } from "@/lib/api/client"

// Define a more flexible connection type that works with all senses
interface FlexibleConnectedProvider {
  id: string
  name: string
  type: PersonalSenseType
  connectedAt: Date
  providerId?: string
  accountEmail?: string
  deviceInfo?: {
    browser: string
    os: string
    platform: string
    language: string
    screenInfo: string
    userAgent: string
  }
  isLibraryConnection?: boolean
}

type AssistantStep = "welcome" | "personality" | "connections" | "rules" | "review" | "deploy"

interface AssistantStudioProps {
  canCreate: boolean
}

export function AssistantStudio({ canCreate }: AssistantStudioProps) {
  const router = useRouter()
  const [step, setStep] = useState<AssistantStep>("welcome")
  const [error, setError] = useState<string | null>(null)
  const [isEditingName, setIsEditingName] = useState(true)
  const [editingRule, setEditingRule] = useState<BehaviorRule | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Refs for scrolling and preventing duplicate saves
  const containerRef = useRef<HTMLDivElement>(null)
  const isSavingRef = useRef(false)

  // Location configurations for location-aware senses
  const [locationConfigs, setLocationConfigs] = useState<Record<string, LocationConfig>>({})
  
  // OAuth connections for connected senses
  const [oauthConnections, setOauthConnections] = useState<Record<string, FlexibleConnectedProvider[]>>({})
  
  // News configurations for news sense
  const [newsConfigurations, setNewsConfigurations] = useState<Record<string, NewsLocation[]>>({})
  
  // Weather/Air Quality configurations
  const [weatherAirQualityConfigurations, setWeatherAirQualityConfigurations] = useState<Record<string, WeatherAirQualityLocation[]>>({})

  const [assistantData, setAssistantData] = useState<AuraFormData>({
    id: '',
    name: '',
    vesselType: 'digital',
    vesselCode: 'assistant',
    plantType: undefined,
    personality: {
      warmth: 70,
      playfulness: 40,
      verbosity: 60,
      empathy: 80,
      creativity: 50,
      persona: 'helpful',
      tone: 'formal',
      vocabulary: 'scholarly',
      quirks: [],
    },
    senses: [],
    availableSenses: [],
    rules: [],
    selectedStudyId: undefined,
    selectedIndividualId: undefined,
    enabled: true,
  })

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // Use the form submission hook for final save
  const {
    submit: saveAssistant,
    isSubmitting: isSaving,
    error: saveError,
    clearError,
  } = useFormSubmit(
    async (data: AuraFormData) => {
      // Transform the data for assistant-specific API call
      const assistantPayload = {
        ...data,
        vesselType: 'digital' as VesselTypeId,
        vesselCode: 'assistant',
        name: data.name || 'My AI Assistant',
      }
      return await auraApi.createAura(assistantPayload)
    },
    {
      onSuccess: (result) => {
        console.log("Assistant creation successful", result)
        setStep("deploy")
      },
      onError: (error) => {
        console.error("Save error:", error)
        setError(error.message)
      },
    }
  )

  const handleStepChange = (newStep: AssistantStep) => {
    setError(null)
    clearError()
    setStep(newStep)
  }

  const handlePersonalityChange = (update: Partial<Personality>) => {
    setAssistantData(prev => ({ 
      ...prev, 
      personality: { ...prev.personality, ...update }
    }))
  }

  const toggleSense = (senseId: SenseId) => {
    setAssistantData(prev => {
      const newSenses = prev.senses.includes(senseId)
        ? prev.senses.filter(s => s !== senseId)
        : [...prev.senses, senseId]
      
      return {
        ...prev,
        senses: newSenses,
        availableSenses: newSenses
      }
    })
  }

  const handleRulesChange = (rules: BehaviorRule[]) => {
    setAssistantData(prev => ({ ...prev, rules }))
  }

  const handleNameChange = (name: string) => {
    setAssistantData(prev => ({ ...prev, name }))
  }

  if (!canCreate) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <UpgradePrompt feature="maxAuras" requiredTier="personal" currentTier="free" />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Assistant Studio
              </h1>
              <p className="text-sm text-gray-500">Build your intelligent companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="text-gray-600 hover:text-blue-600"
            >
              {isPreviewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { id: 'welcome', label: 'Welcome', icon: Sparkles },
              { id: 'personality', label: 'Personality', icon: Brain },
              { id: 'connections', label: 'Data Sources', icon: Database },
              { id: 'rules', label: 'Behaviors', icon: Workflow },
              { id: 'review', label: 'Review', icon: Eye },
              { id: 'deploy', label: 'Deploy', icon: Zap },
            ].map((stepInfo, index) => {
              const isActive = step === stepInfo.id
              const isCompleted = ['welcome', 'personality', 'connections', 'rules', 'review'].indexOf(step) > 
                                 ['welcome', 'personality', 'connections', 'rules', 'review'].indexOf(stepInfo.id)
              const Icon = stepInfo.icon
              
              return (
                <div key={stepInfo.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all",
                    isActive && "bg-blue-100 text-blue-700",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-gray-400"
                  )}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">{stepInfo.label}</span>
                  </div>
                  {index < 5 && (
                    <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {step === "welcome" && (
            <WelcomeStep
              assistantData={assistantData}
              onNameChange={handleNameChange}
              onNext={() => handleStepChange("personality")}
              isEditingName={isEditingName}
              setIsEditingName={setIsEditingName}
            />
          )}

          {step === "personality" && (
            <PersonalityStep
              personality={assistantData.personality}
              onPersonalityChange={handlePersonalityChange}
              onNext={() => handleStepChange("connections")}
              onBack={() => handleStepChange("welcome")}
            />
          )}

          {step === "connections" && (
            <ConnectionsStep
              senses={assistantData.senses}
              onToggleSense={toggleSense}
              locationConfigs={locationConfigs}
              setLocationConfigs={setLocationConfigs}
              oauthConnections={oauthConnections}
              setOauthConnections={setOauthConnections}
              newsConfigurations={newsConfigurations}
              setNewsConfigurations={setNewsConfigurations}
              weatherAirQualityConfigurations={weatherAirQualityConfigurations}
              setWeatherAirQualityConfigurations={setWeatherAirQualityConfigurations}
              onNext={() => handleStepChange("rules")}
              onBack={() => handleStepChange("personality")}
            />
          )}

          {step === "rules" && (
            <RulesStep
              rules={assistantData.rules}
              senses={assistantData.senses}
              onRulesChange={handleRulesChange}
              editingRule={editingRule}
              setEditingRule={setEditingRule}
              onNext={() => handleStepChange("review")}
              onBack={() => handleStepChange("connections")}
            />
          )}

          {step === "review" && (
            <ReviewStep
              assistantData={assistantData}
              onSave={() => saveAssistant(assistantData)}
              isSaving={isSaving}
              onBack={() => handleStepChange("rules")}
              onEdit={(stepName: AssistantStep) => handleStepChange(stepName)}
            />
          )}

          {step === "deploy" && (
            <DeployStep
              assistantData={assistantData}
              onDashboard={() => router.push('/dashboard')}
              onCreateAnother={() => {
                setStep("welcome")
                setAssistantData({
                  id: '',
                  name: '',
                  vesselType: 'digital',
                  vesselCode: 'assistant',
                  plantType: undefined,
                  personality: {
                    warmth: 70,
                    playfulness: 40,
                    verbosity: 60,
                    empathy: 80,
                    creativity: 50,
                    persona: 'helpful',
                    tone: 'formal',
                    vocabulary: 'scholarly',
                    quirks: [],
                  },
                  senses: [],
                  availableSenses: [],
                  rules: [],
                  selectedStudyId: undefined,
                  selectedIndividualId: undefined,
                  enabled: true,
                })
                setIsEditingName(true)
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}

// Welcome Step Component
function WelcomeStep({ 
  assistantData, 
  onNameChange, 
  onNext, 
  isEditingName, 
  setIsEditingName 
}: {
  assistantData: AuraFormData
  onNameChange: (name: string) => void
  onNext: () => void
  isEditingName: boolean
  setIsEditingName: (editing: boolean) => void
}) {
  const [tempName, setTempName] = useState(assistantData.name)

  const handleSaveName = () => {
    onNameChange(tempName)
    setIsEditingName(false)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
          <Bot className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="block text-gray-900">Build Your</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create an intelligent companion that understands your world through your data. 
            Connect calendars, fitness trackers, location, and more to build an assistant 
            that truly knows you and helps you achieve your goals.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 my-12">
        <Card className="border-2 hover:border-blue-200 transition-colors group">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Conversational Partner</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Get more done with a conversational AI that understands context, 
              remembers your preferences, and adapts to your communication style.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-blue-200 transition-colors group">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Behavior Change</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Build and change habits with an assistant that tracks your progress, 
              provides gentle nudges, and celebrates your wins.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-blue-200 transition-colors group">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Link className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-xl">Smart Integrations</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Connect your digital life - calendars, fitness data, location, weather, 
              and more. Your assistant can even make changes to your schedule.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Name Input */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Name Your Assistant
          </CardTitle>
          <CardDescription>
            Give your AI assistant a name that reflects its personality and role in your life.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingName ? (
            <div className="flex gap-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="e.g., Alex, Maya, or Assistant"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveName()
                  }
                }}
              />
              <Button onClick={handleSaveName} disabled={!tempName.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{assistantData.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingName(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!assistantData.name.trim()}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
        >
          Start Building
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Personality Step Component
function PersonalityStep({ 
  personality, 
  onPersonalityChange, 
  onNext, 
  onBack 
}: {
  personality: Personality
  onPersonalityChange: (update: Partial<Personality>) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Define Your Assistant's Personality</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Shape how your assistant communicates and interacts with you. These traits will influence 
          every conversation and make your assistant uniquely yours.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Personality Matrix</CardTitle>
          <CardDescription>
            Adjust these sliders to create the perfect personality for your assistant. 
            Think about how you want them to communicate and what role they'll play in your life.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalityMatrix
            personality={personality}
            onChange={onPersonalityChange}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Connections Step Component
function ConnectionsStep({ 
  senses,
  onToggleSense,
  locationConfigs,
  setLocationConfigs,
  oauthConnections,
  setOauthConnections,
  newsConfigurations,
  setNewsConfigurations,
  weatherAirQualityConfigurations,
  setWeatherAirQualityConfigurations,
  onNext, 
  onBack 
}: {
  senses: SenseId[]
  onToggleSense: (senseId: SenseId) => void
  locationConfigs: Record<string, LocationConfig>
  setLocationConfigs: (configs: Record<string, LocationConfig>) => void
  oauthConnections: Record<string, FlexibleConnectedProvider[]>
  setOauthConnections: (connections: Record<string, FlexibleConnectedProvider[]>) => void
  newsConfigurations: Record<string, NewsLocation[]>
  setNewsConfigurations: (configs: Record<string, NewsLocation[]>) => void
  weatherAirQualityConfigurations: Record<string, WeatherAirQualityLocation[]>
  setWeatherAirQualityConfigurations: (configs: Record<string, WeatherAirQualityLocation[]>) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Connect Your Data Sources</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose what information your assistant can access to better understand and help you. 
          The more context you provide, the more personalized and useful your assistant becomes.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Available Data Sources</CardTitle>
          <CardDescription>
            Select the data sources you want your assistant to have access to. 
            These will enable your assistant to provide contextual help and insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SenseSelector
            availableSenses={AVAILABLE_SENSES.filter(sense =>
              VESSEL_SENSE_CONFIG.digital.optionalSenses.includes(sense.id)
            )}
            nonToggleableSenses={VESSEL_SENSE_CONFIG.digital.defaultSenses}
            selectedSenses={senses}
            onToggle={onToggleSense}
            vesselType="digital"
            auraName="Your Assistant"
            onLocationConfig={(senseId, config) => {
              setLocationConfigs(prev => ({ ...prev, [senseId]: config }))
            }}
            locationConfigs={locationConfigs}
            onOAuthConnection={(senseId, providerId, connectionData) => {
              setOauthConnections(prev => ({
                ...prev,
                [senseId]: [...(prev[senseId] || []), {
                  id: connectionData.id,
                  name: connectionData.name,
                  type: connectionData.type,
                  connectedAt: new Date(),
                  providerId,
                  accountEmail: connectionData.accountEmail,
                  deviceInfo: connectionData.deviceInfo,
                  isLibraryConnection: connectionData.isLibraryConnection,
                }]
              }))
            }}
            onOAuthDisconnect={(senseId, connectionId) => {
              setOauthConnections(prev => ({
                ...prev,
                [senseId]: (prev[senseId] || []).filter(conn => conn.id !== connectionId)
              }))
            }}
            oauthConnections={oauthConnections as Record<string, import("../aura/sense-selector").ConnectedProvider[]>}
            onNewsConfiguration={(senseId, locations) => {
              setNewsConfigurations(prev => ({ ...prev, [senseId]: locations }))
            }}
            newsConfigurations={newsConfigurations}
            onWeatherAirQualityConfiguration={(senseId, locations) => {
              setWeatherAirQualityConfigurations(prev => ({ ...prev, [senseId]: locations }))
            }}
            weatherAirQualityConfigurations={weatherAirQualityConfigurations}
            hasPersonalConnectedSenses={true}
            assistantMode={true}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Rules Step Component
function RulesStep({ 
  rules,
  senses,
  onRulesChange,
  editingRule,
  setEditingRule,
  onNext, 
  onBack 
}: {
  rules: BehaviorRule[]
  senses: SenseId[]
  onRulesChange: (rules: BehaviorRule[]) => void
  editingRule: BehaviorRule | null
  setEditingRule: (rule: BehaviorRule | null) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <Workflow className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Define Assistant Behaviors</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create rules that determine how your assistant responds to different situations. 
          These behaviors make your assistant proactive and helpful in achieving your goals.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Behavior Rules</CardTitle>
          <CardDescription>
            Set up rules for when and how your assistant should interact with you. 
            Use templates from the community or create custom behaviors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RuleBuilder
            auraId="assistant-temp"
            vesselType="digital"
            vesselCode="assistant"
            availableSenses={senses}
            existingRules={rules}
            editingRule={editingRule}
            onEditRule={setEditingRule}
            onSaveEditedRule={(rule) => {
              const updatedRules = rules.map(r => r.id === rule.id ? rule : r)
              onRulesChange(updatedRules)
              setEditingRule(null)
            }}
            onAddRule={(rule) => onRulesChange([...rules, rule])}
            onDeleteRule={(ruleId) => onRulesChange(rules.filter(r => r.id !== ruleId))}
            onToggleRule={(ruleId, enabled) => onRulesChange(rules.map(r => r.id === ruleId ? { ...r, enabled } : r))}
            assistantMode={true}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Review Step Component
function ReviewStep({ 
  assistantData,
  onSave,
  isSaving,
  onBack,
  onEdit
}: {
  assistantData: AuraFormData
  onSave: () => void
  isSaving: boolean
  onBack: () => void
  onEdit: (step: AssistantStep) => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Review Your Assistant</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Take a final look at your assistant's configuration before deployment. 
          You can always make changes later from your dashboard.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Basic Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Name and core settings</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit("welcome")}>
              <Edit3 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="font-medium">{assistantData.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Type</Label>
              <p className="font-medium">AI Assistant</p>
            </div>
          </CardContent>
        </Card>

        {/* Personality */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personality</CardTitle>
              <CardDescription>Communication style and traits</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit("personality")}>
              <Edit3 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Warmth:</span> {assistantData.personality.warmth}%
              </div>
              <div>
                <span className="text-gray-500">Empathy:</span> {assistantData.personality.empathy}%
              </div>
              <div>
                <span className="text-gray-500">Verbosity:</span> {assistantData.personality.verbosity}%
              </div>
              <div>
                <span className="text-gray-500">Creativity:</span> {assistantData.personality.creativity}%
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{assistantData.personality.tone}</Badge>
              <Badge variant="secondary">{assistantData.personality.persona}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Connected information streams</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit("connections")}>
              <Edit3 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {assistantData.senses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assistantData.senses.map((sense) => {
                  const senseConfig = AVAILABLE_SENSES.find(s => s.id === sense)
                  return (
                    <Badge key={sense} variant="outline">
                      {senseConfig?.name || sense}
                    </Badge>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data sources connected</p>
            )}
          </CardContent>
        </Card>

        {/* Behaviors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Behaviors</CardTitle>
              <CardDescription>Rules and responses</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit("rules")}>
              <Edit3 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {assistantData.rules.length > 0 ? (
              <div className="space-y-2">
                {assistantData.rules.slice(0, 3).map((rule, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-gray-600 text-xs">{rule.description}</p>
                  </div>
                ))}
                {assistantData.rules.length > 3 && (
                  <p className="text-sm text-gray-500">
                    +{assistantData.rules.length - 3} more rules
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No behavior rules defined</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Deploy Assistant
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Deploy Step Component
function DeployStep({ 
  assistantData,
  onDashboard,
  onCreateAnother
}: {
  assistantData: AuraFormData
  onDashboard: () => void
  onCreateAnother: () => void
}) {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-6">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">
            🎉 Assistant Deployed!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            <strong>{assistantData.name}</strong> is now live and ready to help you. 
            Your assistant will start learning from your connected data sources and 
            can begin conversations right away.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Start a conversation</p>
              <p className="text-sm text-gray-600">
                Head to your dashboard and begin chatting with your new assistant
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Fine-tune behaviors</p>
              <p className="text-sm text-gray-600">
                Add more rules and adjust personality as you learn what works best
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Explore community templates</p>
              <p className="text-sm text-gray-600">
                Discover rule templates and configurations shared by other users
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={onDashboard}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Go to Dashboard
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onCreateAnother}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Another Assistant
        </Button>
      </div>
    </div>
  )
}