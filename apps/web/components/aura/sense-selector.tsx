// apps/web/components/aura/sense-selector.tsx

"use client"

import React, { useState } from "react"
import { AVAILABLE_SENSES, type SenseId, type VesselTypeId } from "@/lib/constants"
import { TIER_CONFIG } from "@/lib/ui-constants"
import { SenseLocationModal, type LocationConfig } from "./sense-location-modal"
import { OAuthConnectionModal, type PersonalSenseType } from "./oauth-connection-modal"
import {
  Cloud,
  Droplets,
  Sun,
  Globe,
  Activity,
  Wind,
  Info,
  Lock,
  Sparkles,
  Zap,
  Eye,
  CheckCircle2,
  WifiCog,
  MapPin,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

// derive the element type from your constant
export type AvailableSense = typeof AVAILABLE_SENSES[number]

export interface ConnectedProvider {
  id: string
  name: string
  type: PersonalSenseType
  connectedAt: Date
}

interface SenseSelectorProps {
  /** only render these senses */
  availableSenses: readonly AvailableSense[]
  /** built-in senses that cannot be turned off */
  nonToggleableSenses?: SenseId[]
  /** currently selected IDs */
  selectedSenses: SenseId[]
  /** toggle callback */
  onToggle: (senseId: SenseId) => void
  /** The type of vessel the aura is associated with */
  vesselType: VesselTypeId
  /** Aura name for location modal */
  auraName?: string
  /** Callback for when location is configured */
  onLocationConfig?: (senseId: SenseId, config: LocationConfig) => void
  /** Current location configurations */
  locationConfigs?: Record<string, LocationConfig>
  /** Callback for when OAuth connection is completed */
  onOAuthConnection?: (senseId: SenseId, providerId: string) => void
  /** Current OAuth connections */
  oauthConnections?: Record<string, ConnectedProvider>
}

// Normalize IDs for matching
const normalizeSenseId = (senseId: string): string =>
  senseId.includes("_")
    ? senseId.toLowerCase()
    : senseId.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

// Icon lookup
const senseIcons: Record<string, React.ComponentType<any>> = {
  weather: Cloud,
  soil_moisture: Droplets,
  light_level: Sun,
  news: Globe,
  wildlife: Activity,
  air_quality: Wind,
  location: Globe,
  fitness: Activity,
  sleep: Droplets,
  calendar: Info,
}

// IDs for connected/synced senses
const CONNECTED_SENSE_IDS: readonly SenseId[] = [
  'location',
  'fitness',
  'sleep',
  'calendar',
]

// Senses that need location configuration
const LOCATION_AWARE_SENSES: readonly SenseId[] = [
  'weather',
  'air_quality',
  'news',
]

export function SenseSelector({
  availableSenses,
  nonToggleableSenses = [],
  selectedSenses,
  onToggle,
  vesselType,
  auraName = "Your Aura",
  onLocationConfig,
  locationConfigs = {},
  onOAuthConnection,
  oauthConnections = {},
}: SenseSelectorProps) {
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [configuringSense, setConfiguringSense] = useState<'weather' | 'air_quality' | 'news' | null>(null)
  const [oauthModalOpen, setOauthModalOpen] = useState(false)
  const [connectingSense, setConnectingSense] = useState<PersonalSenseType | null>(null)

  const normalizedRequired = nonToggleableSenses.map(normalizeSenseId)
  const requiredSenses = availableSenses.filter(s =>
    normalizedRequired.includes(normalizeSenseId(s.id))
  )
  const optionalSenses = availableSenses.filter(s =>
    !normalizedRequired.includes(normalizeSenseId(s.id)) &&
    !CONNECTED_SENSE_IDS.includes(s.id as SenseId)
  )
  const connectedSenses = availableSenses.filter(s =>
    CONNECTED_SENSE_IDS.includes(s.id as SenseId)
  )

  const isSelected = (id: string) =>
    selectedSenses.includes(normalizeSenseId(id) as SenseId)

  // Map tier names to our config - handle both casing
  const getTierConfig = (tier: string) => {
    const normalizedTier = tier.toLowerCase()
    if (normalizedTier === 'free') return TIER_CONFIG.free
    if (normalizedTier === 'vessel') return TIER_CONFIG.vessel
    if (normalizedTier === 'premium') return TIER_CONFIG.premium
    if (normalizedTier === 'personal') return TIER_CONFIG.personal
    return TIER_CONFIG.free // default
  }

  const handleSenseToggle = (senseId: SenseId) => {
    const normalizedId = normalizeSenseId(senseId) as SenseId
    
    // If enabling a location-aware sense, show configuration modal
    if (!isSelected(senseId) && LOCATION_AWARE_SENSES.includes(normalizedId)) {
      setConfiguringSense(normalizedId as 'weather' | 'air_quality' | 'news')
      setLocationModalOpen(true)
    }
    // If enabling a connected/personal sense, show OAuth modal
    else if (!isSelected(senseId) && CONNECTED_SENSE_IDS.includes(normalizedId)) {
      setConnectingSense(normalizedId as PersonalSenseType)
      setOauthModalOpen(true)
    }
    // Otherwise, just toggle the sense normally
    else {
      onToggle(senseId)
    }
  }

  const handleLocationSet = (config: LocationConfig) => {
    if (configuringSense) {
      // Enable the sense
      onToggle(configuringSense as SenseId)
      
      // Save the location configuration
      if (onLocationConfig) {
        onLocationConfig(configuringSense as SenseId, config)
      }
      
      setLocationModalOpen(false)
      setConfiguringSense(null)
    }
  }

  const handleOAuthComplete = (providerId: string) => {
    if (connectingSense) {
      // Enable the sense after successful OAuth
      onToggle(connectingSense as SenseId)
      
      // Notify parent component of the OAuth connection
      if (onOAuthConnection) {
        onOAuthConnection(connectingSense as SenseId, providerId)
      }
      
      setOauthModalOpen(false)
      setConnectingSense(null)
    }
  }

  const handleOAuthCancel = () => {
    setOauthModalOpen(false)
    setConnectingSense(null)
  }

  const getLocationDisplay = (senseId: string): string | null => {
    const config = locationConfigs[senseId]
    if (!config) return null
    
    if (config.type === 'user') return "Your Location"
    if (config.type === 'global') return "Global"
    if (config.location) {
      // Proper case the location name
      return config.location.name
        .split(', ')
        .map((part: string) => 
          part.split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        )
        .join(', ')
    }
    return null
  }

  const getOAuthDisplay = (senseId: string): string | null => {
    const connection = oauthConnections[senseId]
    return connection ? connection.name : null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            <Eye className="w-4 h-4" /> Sense Configuration
          </div>
        </div>
        <div className="flex justify-center gap-3">
          {Object.entries(TIER_CONFIG).slice(0, 3).map(([tier, config]) => (
            <div key={tier} className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r",
              config.bgColor,
              config.textColor
            )}>
              <span>{config.icon}</span>
              <span className="capitalize">{tier}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Essential Senses */}
      {requiredSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Essential Senses</h3>
            <span className="text-sm text-gray-500">(Always enabled)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredSenses.map(sense => {
              const Icon = senseIcons[sense.id] ?? Info
              const tierInfo = getTierConfig(sense.tier)
              const locationDisplay = getLocationDisplay(sense.id)
              
              return (
                <div key={sense.id} className={cn(
                  "relative p-5 rounded-2xl border-2 bg-gradient-to-br",
                  tierInfo.bgColor,
                  tierInfo.borderColor,
                  "opacity-90"
                )}>
                  {/* Group icons in the top-right corner */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-r text-white shadow-md",
                      tierInfo.color
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{sense.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{sense.category}</p>
                      {locationDisplay && (
                        <div className="flex items-center gap-1 text-xs text-blue-700 mb-2 px-2 py-1 rounded-md bg-blue-50 border border-blue-200">
                          <MapPin className="w-3 h-3" />
                          <span className="font-medium">{locationDisplay}</span>
                        </div>
                      )}
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full bg-gradient-to-r",
                        tierInfo.bgColor,
                        tierInfo.textColor
                      )}>
                        {tierInfo.icon} {sense.tier}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Additional Senses */}
      {optionalSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Additional Senses</h3>
            <span className="text-sm text-gray-500">(Choose what feels right)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionalSenses.map(sense => {
              const Icon = senseIcons[sense.id] ?? Info
              const active = isSelected(sense.id)
              const tierInfo = getTierConfig(sense.tier)
              const locationDisplay = getLocationDisplay(sense.id)
              const needsLocation = LOCATION_AWARE_SENSES.includes(sense.id as SenseId)
              
              return (
                <button
                  key={sense.id}
                  onClick={() => handleSenseToggle(sense.id as SenseId)}
                  className={cn(
                    "group relative p-5 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg",
                    active
                      ? "border-green-400 bg-gradient-to-br from-green-50 to-blue-50 shadow-md"
                      : cn("border-gray-200 hover:border-green-300 bg-white", tierInfo.bgColor)
                  )}
                >
                  {active && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      active
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                        : cn("bg-gradient-to-r text-white shadow-md group-hover:scale-110", tierInfo.color)
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "font-semibold transition-colors",
                          active ? "text-purple-800" : "text-gray-800"
                        )}>{sense.name}</h4>
                        {active && (
                          <Zap className="w-4 h-4 text-purple-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{sense.category}</p>
                      {locationDisplay && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs mb-2 px-2 py-1 rounded-md",
                          active 
                            ? "text-purple-700 bg-purple-50 border border-purple-200" 
                            : "text-blue-600 bg-blue-50 border border-blue-200"
                        )}>
                          <MapPin className="w-3 h-3" />
                          <span className="font-medium">{locationDisplay}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full bg-gradient-to-r font-medium",
                          tierInfo.bgColor,
                          tierInfo.textColor
                        )}>
                          {tierInfo.icon} {sense.tier}
                        </span>
                        <div className={cn(
                          "text-xs px-2 py-1 rounded-full transition-all font-medium",
                          active 
                            ? "bg-green-100 text-green-700" 
                            : locationDisplay
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600 group-hover:bg-green-50 group-hover:text-green-600"
                        )}>
                          {active 
                            ? "Connected" 
                            : locationDisplay 
                            ? "Location configured" 
                            : needsLocation 
                            ? "Configure location" 
                            : "Click to add"}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Connected Senses */}
      {connectedSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <WifiCog className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Personal Connected Senses</h3>
            <span className="text-sm text-gray-500">(About you, not your vessel)</span>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 mb-1">
                  <strong>These sensors share data about YOU with your Aura</strong>
                </p>
                <p className="text-orange-700">
                  We use secure OAuth connections and only access the minimum data needed. 
                  You can disconnect at any time in your account settings.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedSenses.map(sense => {
              const Icon = senseIcons[sense.id] ?? Info
              const active = isSelected(sense.id)
              const tierInfo = getTierConfig(sense.tier)
              const oauthProvider = getOAuthDisplay(sense.id)
              const locationDisplay = getLocationDisplay(sense.id)
              
              return (
                <button
                  key={sense.id}
                  onClick={() => handleSenseToggle(sense.id as SenseId)}
                  className={cn(
                    "group relative p-5 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-lg text-left",
                    active
                      ? "border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 shadow-md"
                      : cn("border-gray-200 hover:border-orange-300 bg-white", tierInfo.bgColor)
                  )}
                >
                  {active && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      active
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                        : cn("bg-gradient-to-r text-white shadow-md group-hover:scale-110", tierInfo.color)
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "font-semibold transition-colors",
                          active ? "text-purple-800" : "text-gray-800"
                        )}>{sense.name}</h4>
                        {active && (
                          <Zap className="w-4 h-4 text-purple-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{sense.category}</p>
                      {active && oauthProvider && (
                        <div className="flex items-center gap-1 text-xs text-orange-700 mb-2 px-2 py-1 rounded-md bg-orange-50 border border-orange-200">
                          <Shield className="w-3 h-3" />
                          <span className="font-medium">Connected via {oauthProvider}</span>
                        </div>
                      )}
                      {/* Show location for OAuth senses that might need it */}
                      {active && locationDisplay && (
                        <div className="flex items-center gap-1 text-xs text-purple-700 mb-2 px-2 py-1 rounded-md bg-purple-50 border border-purple-200">
                          <MapPin className="w-3 h-3" />
                          <span className="font-medium">{locationDisplay}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full bg-gradient-to-r font-medium",
                          tierInfo.bgColor,
                          tierInfo.textColor
                        )}>
                          {tierInfo.icon} {sense.tier}
                        </span>
                        <div className={cn(
                          "text-xs px-2 py-1 rounded-full transition-all",
                          active 
                            ? "bg-orange-100 text-orange-700" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-orange-50 group-hover:text-orange-600"
                        )}>
                          {active ? "Connected" : "Connect service"}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Sense Configuration Summary
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-purple-800">Active Senses:</span>
                <span className="text-purple-700 ml-2">{selectedSenses.length}</span>
              </div>
              <div>
                <span className="font-medium text-purple-800">Essential:</span>
                <span className="text-purple-700 ml-2">{requiredSenses.length}</span>
              </div>
              <div>
                <span className="font-medium text-purple-800">Connected Services:</span>
                <span className="text-purple-700 ml-2">{Object.keys(oauthConnections).length}</span>
              </div>
            </div>
            <p className="text-purple-700 mt-3 leading-relaxed">
              Each sense adds unique context to your Aura's understanding of the world. Essential senses provide core awareness, while additional senses enrich their personality and responses.
            </p>
            {selectedSenses.length > requiredSenses.length && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Your Aura has enhanced awareness through {selectedSenses.length - requiredSenses.length} additional sense{selectedSenses.length - requiredSenses.length !== 1 ? 's' : ''}!
                </span>
              </div>
            )}
            {Object.keys(oauthConnections).length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-orange-700">
                <Shield className="w-4 h-4" />
                <span>
                  {Object.keys(oauthConnections).length} personal service{Object.keys(oauthConnections).length !== 1 ? 's' : ''} securely connected
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Configuration Modal */}
      {configuringSense && (
        <SenseLocationModal
          open={locationModalOpen}
          onOpenChange={setLocationModalOpen}
          senseType={configuringSense}
          vesselName={auraName}
          onLocationSet={handleLocationSet}
        />
      )}

      {/* OAuth Connection Modal */}
      {connectingSense && (
        <OAuthConnectionModal
          open={oauthModalOpen}
          onOpenChange={setOauthModalOpen}
          senseType={connectingSense}
          onConnectionComplete={handleOAuthComplete}
          onCancel={handleOAuthCancel}
        />
      )}
    </div>
  )
}