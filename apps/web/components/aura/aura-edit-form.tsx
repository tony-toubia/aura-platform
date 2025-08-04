// apps/web/components/aura/aura-edit-form.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PersonalityMatrix } from "./personality-matrix"
import { SenseSelector } from "./sense-selector"
import { type LocationConfig } from "./sense-location-modal"
import { RuleBuilder } from "./rule-builder"
import { VESSEL_SENSE_CONFIG, AVAILABLE_SENSES } from "@/lib/constants"
import type { VesselTypeId, SenseId } from "@/lib/constants"
import {
  AlertCircle,
  Sparkles,
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Save,
  Edit,
  Bot,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Aura, Personality } from "@/types"
import { useAutoSave } from "@/lib/hooks/use-auto-save"
import { SaveStatusIndicator } from "@/components/ui/save-status-indicator"

type Step = "details" | "senses" | "rules"

const vesselTypes = [
  {
    id: "terra",
    name: "Terra Spirit",
    description: "Plant & garden companions that share their growth journey",
    icon: "🌱",
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
  },
  {
    id: "companion",
    name: "Companion Spirit",
    description: "Wildlife trackers that experience adventures in the wild",
    icon: "🦋",
    bgColor: "from-blue-50 to-sky-50",
    borderColor: "border-blue-200",
  },
  {
    id: "digital",
    name: "Digital Being",
    description: "Pure consciousness exploring the world through data streams",
    icon: "✨",
    bgColor: "from-purple-50 to-violet-50",
    borderColor: "border-purple-200",
  },
]

// Helper function to normalize sense IDs for consistent matching
const normalizeSenseId = (senseId: string): string => {
  if (senseId.includes('_')) {
    return senseId.toLowerCase()
  }
  return senseId
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
}

interface AuraEditFormProps {
  initialAura: Aura
  initialLocationConfigs?: Record<string, LocationConfig>
  initialOAuthConnections?: Record<string, any[]>
  initialNewsConfigurations?: Record<string, any[]>
  initialWeatherAirQualityConfigurations?: Record<string, any[]>
}

export function AuraEditForm({
  initialAura,
  initialLocationConfigs = {},
  initialOAuthConnections = {},
  initialNewsConfigurations = {},
  initialWeatherAirQualityConfigurations = {}
}: AuraEditFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") as Step | null

  const [step, setStep] = useState<Step>(initialTab || "details")
  const [isEditingName, setIsEditingName] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationConfigs, setLocationConfigs] = useState<Record<string, LocationConfig>>(initialLocationConfigs)
  const [oauthConnections, setOAuthConnections] = useState<Record<string, any[]>>(initialOAuthConnections)
  const [newsConfigurations, setNewsConfigurations] = useState<Record<string, any[]>>(initialNewsConfigurations)
  
  // Weather/Air Quality configurations
  const [weatherAirQualityConfigurations, setWeatherAirQualityConfigurations] = useState<Record<string, any[]>>(initialWeatherAirQualityConfigurations)

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)

  // Normalize existing senses to ensure proper matching
  const normalizedSenses = initialAura.senses.map(normalizeSenseId)

  // Form state initialized from initialAura
  const [auraData, setAuraData] = useState(() => {
    const { personality, ...restOfAura } = initialAura
    
    // Auto-enable senses that have OAuth connections
    const sensesWithConnections = Object.keys(initialOAuthConnections)
    const allSenses = [...normalizedSenses, ...sensesWithConnections].filter((sense, index, arr) => arr.indexOf(sense) === index)
    
    console.log('🔍 AuraEditForm initialization:', {
      initialSenses: normalizedSenses,
      sensesWithConnections,
      finalSenses: allSenses,
      oauthConnections: initialOAuthConnections
    })
    
    return {
      ...restOfAura,
      personality: {
        warmth: personality.warmth || 50,
        playfulness: personality.playfulness || 50,
        verbosity: personality.verbosity || 50,
        empathy: personality.empathy || 50,
        creativity: personality.creativity || 50,
        persona: personality.persona || "balanced",
        tone: personality.tone || "casual",
        vocabulary: personality.vocabulary || "average",
        quirks: personality.quirks || [],
      },
      senses: allSenses as SenseId[],
      selectedStudyId: initialAura.selectedStudyId
        ? Number(initialAura.selectedStudyId)
        : undefined,
    }
  })

  // Keep a ref of the initial form values to detect changes
  const initialFormRef = useRef({
    name: auraData.name,
    personality: auraData.personality,
    senses: auraData.senses,
    selectedStudyId: (auraData as any).selectedStudyId,
    selectedIndividualId: (auraData as any).selectedIndividualId,
  })

  // Utility to check if form data has changed compared to initial
  const hasChanges = (): boolean => {
    const initial = initialFormRef.current
    const current = {
      name: auraData.name,
      personality: auraData.personality,
      senses: auraData.senses,
      selectedStudyId: (auraData as any).selectedStudyId,
      selectedIndividualId: (auraData as any).selectedIndividualId,
    }
    return JSON.stringify(initial) !== JSON.stringify(current)
  }

  // Auto-save function that saves all current data to the database
  const saveToDatabase = useCallback(async () => {
    console.log('🔄 Auto-saving aura data to database:', {
      auraId: auraData.id,
      name: auraData.name,
      personality: auraData.personality,
      senses: auraData.senses,
      locationConfigs,
      newsConfigurations,
      weatherAirQualityConfigurations
    })

    const response = await fetch(`/api/auras/${auraData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: auraData.name,
        personality: auraData.personality,
        senses: auraData.senses,
        selectedStudyId: (auraData as any).selectedStudyId,
        selectedIndividualId: (auraData as any).selectedIndividualId,
        locationConfigs: locationConfigs,
        newsConfigurations: newsConfigurations,
        weatherAirQualityConfigurations: weatherAirQualityConfigurations,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save aura')
    }

    console.log('✅ Auto-save successful')
  }, [auraData, locationConfigs, newsConfigurations, weatherAirQualityConfigurations])

  // Auto-save hooks for different types of changes
  const {
    saveStatus: generalSaveStatus,
    debouncedSave: debouncedGeneralSave,
    saveImmediately: saveGeneralImmediately
  } = useAutoSave({
    delay: 2000, // 2 second delay for general changes
    onSave: saveToDatabase,
    onError: (error) => {
      console.error('Auto-save failed:', error)
      setError(error.message)
    }
  })

  // Scroll to top when step changes and restore form data from URL parameters
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Restore form data from URL parameters if switching from AI mode
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const vesselType = urlParams.get('vesselType');
    const vesselCode = urlParams.get('vesselCode');
    const personalityStr = urlParams.get('personality');
    const sensesStr = urlParams.get('senses');
    const rulesStr = urlParams.get('rules');
    const locationConfigsStr = urlParams.get('locationConfigs');

    if (name || personalityStr || sensesStr || rulesStr) {
      console.log('Restoring form data from AI mode switch');
      
      setAuraData(prev => ({
        ...prev,
        name: name || prev.name,
        vesselType: (vesselType as VesselTypeId) || prev.vesselType,
        vesselCode: vesselCode || prev.vesselCode,
        personality: personalityStr ? JSON.parse(personalityStr) : prev.personality,
        senses: sensesStr ? JSON.parse(sensesStr) : prev.senses,
        rules: rulesStr ? JSON.parse(rulesStr) : prev.rules,
      }));

      if (locationConfigsStr) {
        setLocationConfigs(JSON.parse(locationConfigsStr));
      }

      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [step])

  // Debug OAuth connections on component mount and when they change
  useEffect(() => {
    console.log('🔍 AuraEditForm OAuth connections state:', {
      initialOAuthConnections,
      currentOAuthConnections: oauthConnections,
      auraId: auraData.id
    })
  }, [initialOAuthConnections, oauthConnections, auraData.id])

  const updatePersonality = (update: Partial<Personality>) => {
    setAuraData(p => ({
      ...p,
      personality: { ...p.personality, ...update },
    }))
    // Trigger debounced auto-save for personality changes
    debouncedGeneralSave()
  }

  const toggleSense = (senseId: SenseId) => {
    const isCurrentlySelected = auraData.senses.includes(senseId)
    const newSenses = isCurrentlySelected
      ? auraData.senses.filter(id => id !== senseId)
      : [...auraData.senses, senseId]
    
    console.log(`🔄 toggleSense called for ${senseId}:`, {
      isCurrentlySelected,
      currentSenses: auraData.senses,
      newSenses,
      action: isCurrentlySelected ? 'removing' : 'adding'
    })
    
    setAuraData(p => ({
      ...p,
      senses: newSenses,
    }))
    
    // Trigger immediate auto-save for sense changes
    saveGeneralImmediately()
  }

  const handleLocationConfig = async (senseId: SenseId, config: LocationConfig) => {
    // Update local state immediately for UI feedback
    setLocationConfigs(prev => ({
      ...prev,
      [senseId]: config
    }))
    
    // Save to database immediately
    try {
      console.log('💾 Saving location configuration to database:', { senseId, config })
      
      const response = await fetch(`/api/auras/${auraData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: auraData.name,
          personality: auraData.personality,
          senses: auraData.senses,
          selectedStudyId: (auraData as any).selectedStudyId,
          selectedIndividualId: (auraData as any).selectedIndividualId,
          locationConfigs: {
            ...locationConfigs,
            [senseId]: config
          },
          newsConfigurations: newsConfigurations,
          weatherAirQualityConfigurations: weatherAirQualityConfigurations,
        }),
      })
      
      if (response.ok) {
        console.log('✅ Successfully saved location configuration to database')
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('❌ Failed to save location configuration:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData?.error || `Failed to save location configuration: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error saving location configuration:', error)
      throw error // Re-throw to trigger auto-save error handling
    }
  }

  const handleOAuthConnection = async (senseId: SenseId, providerId: string, connectionData: any) => {
    console.log('🔗 handleOAuthConnection called:', {
      senseId,
      providerId,
      connectionData,
      auraId: auraData.id,
      currentSenses: auraData.senses,
      useLibrary: connectionData.useLibrary,
      isLibraryConnection: connectionData.isLibraryConnection
    })
    
    // Ensure the sense is enabled when OAuth connection is made
    let updatedSenses = auraData.senses
    if (!auraData.senses.includes(senseId)) {
      console.log(`🔄 Auto-enabling ${senseId} sense in AuraEditForm due to OAuth connection`)
      updatedSenses = [...auraData.senses, senseId]
      setAuraData(prev => ({
        ...prev,
        senses: updatedSenses
      }))
      // Trigger immediate auto-save for sense changes
      saveGeneralImmediately()
    }
    
    // Helper function to get user-friendly provider names (matching edit page logic)
    const getProviderDisplayName = (provider: string): string => {
      const providerNames: Record<string, string> = {
        'google': 'Google',
        'google-fit': 'Google Fit',
        'google_fit': 'Google Fit', // Handle underscore version from database
        'fitbit': 'Fitbit',
        'apple-health': 'Apple Health',
        'apple_health': 'Apple Health', // Handle underscore version from database
        'strava': 'Strava',
        'microsoft': 'Microsoft',
      }
      return providerNames[provider] || provider.charAt(0).toUpperCase() + provider.slice(1).replace(/_/g, ' ')
    }
    
    // Handle library connection association (when selecting from library)
    if (connectionData.isLibraryConnection) {
      console.log('📚 Handling library connection association')
      
      // Update local state with the library connection
      setOAuthConnections(prev => ({
        ...prev,
        [senseId]: [...(prev[senseId] || []), {
          id: connectionData.id,
          name: getProviderDisplayName(providerId),
          type: senseId,
          connectedAt: connectionData.connectedAt,
          providerId: providerId,
          accountEmail: connectionData.accountEmail || `Connected ${getProviderDisplayName(providerId)} account`,
          deviceInfo: connectionData.deviceInfo || null,
          isLibraryConnection: true,
        }]
      }))
      
      return // Library association is handled by the modal
    }
    
    // Save to database via API (for new connections)
    try {
      const requestBody = {
        provider: providerId,
        sense_type: senseId,
        provider_user_id: connectionData.accountEmail || connectionData.providerName,
        access_token: connectionData.tokens?.access_token || 'placeholder',
        refresh_token: connectionData.tokens?.refresh_token,
        expires_at: connectionData.tokens?.expires_at,
        scope: connectionData.tokens?.scope,
        aura_id: connectionData.useLibrary ? null : auraData.id, // Library connections have null aura_id
        device_info: connectionData.deviceInfo || null, // Include device information for location connections
        use_library: connectionData.useLibrary || false, // Flag to indicate library storage
      }
      
      console.log('📤 Making API request to save OAuth connection:', requestBody)
      
      const response = await fetch('/api/oauth-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      
      console.log('📥 API response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })
      
      if (response.ok) {
        const savedConnection = await response.json()
        console.log('✅ Successfully saved OAuth connection:', savedConnection)
        
        // Update local state with the saved connection using consistent naming
        setOAuthConnections(prev => ({
          ...prev,
          [senseId]: [...(prev[senseId] || []), {
            id: savedConnection.id,
            name: getProviderDisplayName(providerId),
            type: senseId,
            connectedAt: new Date(savedConnection.created_at),
            providerId: providerId,
            accountEmail: connectionData.accountEmail || `Connected ${getProviderDisplayName(providerId)} account`,
            deviceInfo: connectionData.deviceInfo || null, // Include device info in local state
            isLibraryConnection: connectionData.useLibrary || false,
          }]
        }))
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to save OAuth connection - API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
      }
    } catch (error) {
      console.error('❌ Failed to save OAuth connection - Network/Parse error:', error)
      // Still update local state for UI feedback with consistent naming
      setOAuthConnections(prev => ({
        ...prev,
        [senseId]: [...(prev[senseId] || []), {
          id: `${providerId}-${Date.now()}`,
          name: getProviderDisplayName(providerId),
          type: senseId,
          connectedAt: new Date(),
          providerId: providerId,
          accountEmail: connectionData.accountEmail || `Connected ${getProviderDisplayName(providerId)} account`,
          deviceInfo: connectionData.deviceInfo || null, // Include device info in fallback state
          isLibraryConnection: connectionData.useLibrary || false,
        }]
      }))
    }
  }

  const handleOAuthDisconnect = async (senseId: SenseId, connectionId: string) => {
    // Delete from database via API
    try {
      const response = await fetch(`/api/oauth-connections/${connectionId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Update local state
        setOAuthConnections(prev => ({
          ...prev,
          [senseId]: (prev[senseId] || []).filter(conn => conn.id !== connectionId)
        }))
      }
    } catch (error) {
      console.error('Failed to delete OAuth connection:', error)
      // Still update local state for UI feedback
      setOAuthConnections(prev => ({
        ...prev,
        [senseId]: (prev[senseId] || []).filter(conn => conn.id !== connectionId)
      }))
    }
  }

  const handleNewsConfiguration = async (senseId: SenseId, locations: any[]) => {
    console.log('🔄 handleNewsConfiguration called:', {
      senseId,
      locations,
      auraId: auraData.id,
      currentNewsConfigs: newsConfigurations,
      currentSenses: auraData.senses
    })
    
    // Update local state immediately for UI feedback
    const updatedNewsConfigs = {
      ...newsConfigurations,
      [senseId]: locations
    }
    setNewsConfigurations(updatedNewsConfigs)
    
    // Ensure the sense is enabled when locations are configured
    let updatedSenses = auraData.senses
    if (locations.length > 0 && !auraData.senses.includes(senseId)) {
      console.log(`🔄 Auto-enabling ${senseId} sense in AuraEditForm due to configuration`)
      updatedSenses = [...auraData.senses, senseId]
      setAuraData(prev => ({
        ...prev,
        senses: updatedSenses
      }))
    }
    
    // Save to database immediately
    try {
      const requestBody = {
        name: auraData.name,
        personality: auraData.personality,
        senses: updatedSenses, // Use updated senses that include the newly enabled sense
        selectedStudyId: (auraData as any).selectedStudyId,
        selectedIndividualId: (auraData as any).selectedIndividualId,
        locationConfigs: locationConfigs,
        newsConfigurations: updatedNewsConfigs,
        weatherAirQualityConfigurations: weatherAirQualityConfigurations,
      }
      
      console.log('📤 Sending PUT request to API:', {
        url: `/api/auras/${auraData.id}`,
        newsConfigurations: requestBody.newsConfigurations,
        senses: requestBody.senses,
        fullBody: requestBody
      })
      
      const response = await fetch(`/api/auras/${auraData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      
      console.log('📥 API response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Successfully saved news configuration to database:', responseData)
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('❌ Failed to save news configuration - API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData?.error || `Failed to save news configuration: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error saving news configuration - Network/Parse error:', error)
      throw error // Re-throw to trigger auto-save error handling
    }
  }

  const handleWeatherAirQualityConfiguration = async (senseId: SenseId, locations: any[]) => {
    console.log('🔄 handleWeatherAirQualityConfiguration called:', {
      senseId,
      locations,
      auraId: auraData.id,
      currentSenses: auraData.senses
    })
    
    // Update local state immediately for UI feedback
    setWeatherAirQualityConfigurations(prev => ({
      ...prev,
      [senseId]: locations
    }))
    
    // Ensure the sense is enabled when locations are configured
    let updatedSenses = auraData.senses
    if (locations.length > 0 && !auraData.senses.includes(senseId)) {
      console.log(`🔄 Auto-enabling ${senseId} sense in AuraEditForm due to configuration`)
      updatedSenses = [...auraData.senses, senseId]
      setAuraData(prev => ({
        ...prev,
        senses: updatedSenses
      }))
    }
    
    // Save to database immediately
    try {
      console.log('💾 Saving weather/air quality configuration to database:', {
        senseId,
        locations,
        updatedSenses
      })
      
      const response = await fetch(`/api/auras/${auraData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: auraData.name,
          personality: auraData.personality,
          senses: updatedSenses, // Use updated senses that include the newly enabled sense
          selectedStudyId: (auraData as any).selectedStudyId,
          selectedIndividualId: (auraData as any).selectedIndividualId,
          locationConfigs: locationConfigs,
          newsConfigurations: newsConfigurations,
          weatherAirQualityConfigurations: {
            ...weatherAirQualityConfigurations,
            [senseId]: locations
          },
        }),
      })
      
      if (response.ok) {
        console.log('✅ Successfully saved weather/air quality configuration to database')
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('❌ Failed to save weather/air quality configuration:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData?.error || `Failed to save weather/air quality configuration: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error saving weather/air quality configuration:', error)
      throw error // Re-throw to trigger auto-save error handling
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(`/api/auras/${auraData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: auraData.name,
          personality: auraData.personality,
          senses: auraData.senses,
          selectedStudyId: (auraData as any).selectedStudyId,
          selectedIndividualId: (auraData as any).selectedIndividualId,
          locationConfigs: locationConfigs,
          newsConfigurations: newsConfigurations,
          weatherAirQualityConfigurations: weatherAirQualityConfigurations,
        }),
      })
      const body = await resp.json()
      if (!resp.ok) throw new Error(body.error || "Failed to save Aura")
      setStep("rules")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step validations
  const canNextDetails = auraData.name.trim() !== ""
  const canNextSenses = (() => {
    if (!auraData.vesselType) return false
    const cfg = VESSEL_SENSE_CONFIG[auraData.vesselType]
    const hasDefaults = cfg.defaultSenses.every(defaultSense => {
      const normalizedDefault = normalizeSenseId(defaultSense)
      return auraData.senses.some(
        selectedSense => normalizeSenseId(selectedSense) === normalizedDefault
      )
    })
    return hasDefaults
  })()

  const senseConfig = VESSEL_SENSE_CONFIG[auraData.vesselType]
  const allowedSenses = AVAILABLE_SENSES.filter(s =>
    [...senseConfig.defaultSenses, ...senseConfig.optionalSenses].includes(
      s.id
    )
  )

  const onNext = () => {
    if (step === "details") {
      setStep("senses")
    } else if (step === "senses") {
      if (hasChanges()) {
        handleSave()
      } else {
        setStep("rules")
      }
    }
  }
  const onBack = () => {
    if (step === "senses") setStep("details")
    else if (step === "rules") setStep("senses")
  }

  const selectedVessel = vesselTypes.find(v => v.id === auraData.vesselType)
  const steps: Step[] = ["details", "senses", "rules"]

  return (
    <div className="container mx-auto px-4" ref={containerRef}>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/auras')}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Auras
        </Button>

        {/* Mode Toggle and Step Navigation */}
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex justify-center px-4">
            <Card className="p-2 w-full max-w-md">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Navigate to AI mode with current form data preserved
                    const queryParams = new URLSearchParams({
                      name: auraData.name || '',
                      vesselType: auraData.vesselType || 'digital',
                      vesselCode: auraData.vesselCode || 'digital-only',
                      personality: JSON.stringify(auraData.personality),
                      senses: JSON.stringify(auraData.senses),
                      rules: JSON.stringify(auraData.rules),
                      locationConfigs: JSON.stringify(locationConfigs),
                      editMode: 'true',
                      auraId: auraData.id,
                    }).toString()
                    window.location.href = `/auras/create-with-agent?${queryParams}`
                  }}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Bot className="w-4 h-4" />
                  <span className="text-sm">Edit with AI Assistant</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Edit Manually</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center px-4">
            <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2 max-w-full">
              {[
                { id: "details", label: "Personality", icon: Sparkles },
                { id: "senses", label: "Senses", icon: Heart },
                { id: "rules", label: "Rules", icon: CheckCircle },
              ].map((stepInfo, index) => {
                const isActive = stepInfo.id === step
                const isCompleted = index < steps.indexOf(step)
                const Icon = stepInfo.icon

                return (
                  <div key={stepInfo.id} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => {
                        // Save current step before navigating
                        saveGeneralImmediately()
                        setStep(stepInfo.id as Step)
                      }}
                      disabled={stepInfo.id !== "details" && step === "details" && !auraData.name.trim()}
                      className={cn(
                        "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap",
                        isActive
                          ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                          : isCompleted
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                        stepInfo.id !== "details" && step === "details" && !auraData.name.trim() && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">{stepInfo.label}</span>
                      {isCompleted && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                    </button>
                    {index < 2 && (
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1 sm:mx-2 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div ref={stepContentRef}>
          {step === "details" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="mb-2 text-3xl font-bold">
                  Shape Their Personality
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Give your {selectedVessel?.name} a unique character that will
                  shine through every interaction. Refine their digital personality.
                </p>
              </div>

              {/* Enhanced Name Input - matching create experience */}
              <Card className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg animate-shimmer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Update the fundamentals of your Aura's identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="aura-name" className="block text-sm font-medium text-purple-100">
                        Aura Name
                      </label>
                      <SaveStatusIndicator status={generalSaveStatus} className="text-purple-100" />
                    </div>
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id="aura-name"
                          value={auraData.name}
                          onChange={(e) => {
                            setAuraData(p => ({ ...p, name: e.target.value }))
                            debouncedGeneralSave() // Auto-save name changes
                          }}
                          placeholder="Enter a name for your Aura..."
                          className="text-lg bg-white text-black placeholder-gray-500 border-gray-300 focus:ring-purple-500"
                          autoFocus
                        />
                        <Button
                          onClick={() => {
                            setIsEditingName(false)
                            saveGeneralImmediately() // Save immediately when clicking save
                          }}
                          disabled={!auraData.name.trim()}
                          className="bg-white text-purple-600 hover:bg-gray-100"
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold truncate pr-2" title={auraData.name}>{auraData.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingName(true)}
                          className="text-white hover:bg-white/20"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Vessel Type Information */}
                  {selectedVessel && (
                    <div className="pt-4 border-t border-purple-300/30">
                      <label className="block text-sm font-medium text-purple-100 mb-2">
                        Vessel Type
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="text-2xl">{selectedVessel.icon}</div>
                        <div>
                          <h3 className="font-semibold text-white">{selectedVessel.name}</h3>
                          <p className="text-sm text-purple-100">
                            {selectedVessel.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <PersonalityMatrix
                personality={auraData.personality}
                onChange={updatePersonality}
              />
            </div>
          )}

          {step === "senses" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="mb-2 text-3xl font-bold">
                  Connect Your Aura's Senses
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose how your {selectedVessel?.name} will perceive and
                  understand the world. These connections help provide more personalized responses.
                </p>
              </div>

              <SenseSelector
                availableSenses={allowedSenses}
                nonToggleableSenses={senseConfig.defaultSenses}
                selectedSenses={auraData.senses}
                onToggle={toggleSense}
                vesselType={auraData.vesselType}
                auraName={auraData.name}
                auraId={auraData.id}
                initialAura={initialAura}
                onLocationConfig={handleLocationConfig}
                locationConfigs={locationConfigs}
                onOAuthConnection={handleOAuthConnection}
                onOAuthDisconnect={handleOAuthDisconnect}
                oauthConnections={oauthConnections}
                onNewsConfiguration={handleNewsConfiguration}
                newsConfigurations={newsConfigurations}
                onWeatherAirQualityConfiguration={handleWeatherAirQualityConfiguration}
                weatherAirQualityConfigurations={weatherAirQualityConfigurations}
              />
            </div>
          )}

          {step === "rules" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold">
                  <Sparkles className="mr-2 inline h-6 w-6 text-purple-600" />
                  Teaching {auraData.name} to React
                </h2>
                <p className="text-gray-600">
                  Set up automatic responses so {auraData.name} can share their
                  experiences with the world
                </p>
              </div>

              <RuleBuilder
                auraId={auraData.id}
                vesselType={auraData.vesselType}
                availableSenses={auraData.senses}
                oauthConnections={oauthConnections}
                existingRules={auraData.rules}
                onAddRule={r => {
                  setAuraData(p => ({ ...p, rules: [...p.rules, r] }))
                  saveGeneralImmediately() // Auto-save rule additions
                }}
                onDeleteRule={id => {
                  setAuraData(p => ({
                    ...p,
                    rules: p.rules.filter(r => r.id !== id),
                  }))
                  saveGeneralImmediately() // Auto-save rule deletions
                }}
                onToggleRule={(id, en) => {
                  setAuraData(p => ({
                    ...p,
                    rules: p.rules.map(r =>
                      r.id === id ? { ...r, enabled: en } : r
                    ),
                  }))
                  saveGeneralImmediately() // Auto-save rule toggles
                }}
              />
            </div>
          )}

          {error && (
            <div className="mt-8 flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t-2 border-gray-100 pt-8">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={loading || step === "details"}
              size="lg"
              className="flex-shrink-0 px-8"
            >
              Back
            </Button>

            {step !== "rules" && (
              <Button
                onClick={onNext}
                disabled={
                  loading ||
                  (step === "details" && !canNextDetails) ||
                  (step === "senses" && !canNextSenses)
                }
                size="lg"
                className={cn(
                  "bg-gradient-to-r from-purple-600 to-blue-600 px-8 hover:from-purple-700 hover:to-blue-700",
                  step === "senses" && loading && "w-36 justify-center"
                )}
              >
                {step === "senses" && loading ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}

            {step === "rules" && (
              <Button
                onClick={() => router.push(`/auras`)}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 hover:from-green-700 hover:to-emerald-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Finish Editing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}