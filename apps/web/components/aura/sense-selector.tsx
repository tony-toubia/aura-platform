// apps/web/components/aura/sense-selector.tsx

"use client"

import React, { useState, useEffect } from "react"
import { AVAILABLE_SENSES, type SenseId, type VesselTypeId } from "@/lib/constants"
import { TIER_CONFIG } from "@/lib/ui-constants"
import { SenseLocationModal, type LocationConfig } from "./sense-location-modal"
import { EnhancedOAuthConnectionModal, type PersonalSenseType, type ConnectedCalendar } from "./enhanced-oauth-connection-modal"
import { NewsConfigurationModal, type NewsLocation } from "./news-configuration-modal"
import { WeatherAirQualityConfigurationModal, type WeatherAirQualityLocation } from "./weather-air-quality-configuration-modal"
import { countAuraSenses } from "@/lib/utils/sense-counting"
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
  Newspaper,
  Smartphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Aura } from "@/types"

// derive the element type from your constant
export type AvailableSense = typeof AVAILABLE_SENSES[number]

export interface ConnectedProvider {
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
}

export interface OAuthConnectionData {
  tokens?: {
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    scope?: string;
  };
  providerName?: string;
  accountEmail?: string;
  deviceInfo?: any;
  useLibrary?: boolean;
  isLibraryConnection?: boolean;
  id?: string;
  connectedAt?: Date;
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
  /** Aura ID for associating OAuth connections */
  auraId?: string
  /** Initial aura data for proper sense counting */
  initialAura?: Aura
  /** Callback for when location is configured */
  onLocationConfig?: (senseId: SenseId, config: LocationConfig) => void
  /** Current location configurations */
  locationConfigs?: Record<string, LocationConfig>
  /** Callback for when OAuth connection is completed */
  onOAuthConnection?: (senseId: SenseId, providerId: string, connectionData: OAuthConnectionData) => void
  /** Callback for when OAuth connection is disconnected */
  onOAuthDisconnect?: (senseId: SenseId, connectionId: string) => void
  /** Current OAuth connections */
  oauthConnections?: Record<string, ConnectedProvider[]>
  /** Callback for when news configuration is completed */
  onNewsConfiguration?: (senseId: SenseId, locations: NewsLocation[]) => void
  /** Current news configurations */
  newsConfigurations?: Record<string, NewsLocation[]>
  /** Callback for when weather/air quality configuration is completed */
  onWeatherAirQualityConfiguration?: (senseId: SenseId, locations: WeatherAirQualityLocation[]) => void
  /** Current weather/air quality configurations */
  weatherAirQualityConfigurations?: Record<string, WeatherAirQualityLocation[]>
  /** Whether user has access to personal connected senses */
  hasPersonalConnectedSenses?: boolean
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
  auraId,
  initialAura,
  onLocationConfig,
  locationConfigs = {},
  onOAuthConnection,
  onOAuthDisconnect,
  oauthConnections = {},
  onNewsConfiguration,
  newsConfigurations = {},
  onWeatherAirQualityConfiguration,
  weatherAirQualityConfigurations = {},
  hasPersonalConnectedSenses = false,
}: SenseSelectorProps) {
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [configuringSense, setConfiguringSense] = useState<'weather' | 'air_quality' | null>(null)
  const [oauthModalOpen, setOauthModalOpen] = useState(false)
  const [connectingSense, setConnectingSense] = useState<PersonalSenseType | null>(null)
  const [newsModalOpen, setNewsModalOpen] = useState(false)
  const [weatherAirQualityModalOpen, setWeatherAirQualityModalOpen] = useState(false)
  
  // Local state to track actual connections made during this session
  const [sessionConnections, setSessionConnections] = useState<Record<string, ConnectedProvider[]>>({})
  
  // Local state to track news configurations in case parent doesn't manage them properly
  const [localNewsConfigurations, setLocalNewsConfigurations] = useState<Record<string, NewsLocation[]>>({})
  
  // Local state to track weather/air quality configurations
  const [localWeatherAirQualityConfigurations, setLocalWeatherAirQualityConfigurations] = useState<Record<string, WeatherAirQualityLocation[]>>({})

  // Initialize local weather/air quality configurations from props
  useEffect(() => {
    if (Object.keys(weatherAirQualityConfigurations).length > 0) {
      setLocalWeatherAirQualityConfigurations(weatherAirQualityConfigurations)
    }
  }, [weatherAirQualityConfigurations])

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

  const isSelected = (id: string) => {
    const normalizedId = normalizeSenseId(id) as SenseId
    
    // For location-aware senses (news, weather, air_quality), check if they have configurations
    if (normalizedId === 'news') {
      const parentLocs = newsConfigurations['news'] || []
      const localLocs = localNewsConfigurations['news'] || []
      const hasConfigurations = parentLocs.length > 0 || localLocs.length > 0
      return hasConfigurations || selectedSenses.includes(normalizedId)
    }
    
    if (normalizedId === 'weather') {
      const parentLocs = weatherAirQualityConfigurations['weather'] || []
      const localLocs = localWeatherAirQualityConfigurations['weather'] || []
      const hasConfigurations = parentLocs.length > 0 || localLocs.length > 0
      return hasConfigurations || selectedSenses.includes(normalizedId)
    }
    
    if (normalizedId === 'air_quality') {
      const parentLocs = weatherAirQualityConfigurations['air_quality'] || []
      const localLocs = localWeatherAirQualityConfigurations['air_quality'] || []
      const hasConfigurations = parentLocs.length > 0 || localLocs.length > 0
      return hasConfigurations || selectedSenses.includes(normalizedId)
    }
    
    // For connected senses (location, fitness, sleep, calendar), check if they have OAuth connections
    if (CONNECTED_SENSE_IDS.includes(normalizedId)) {
      const sessionConns = sessionConnections[normalizedId] || []
      const propConns = oauthConnections[normalizedId] || []
      const hasConnections = sessionConns.length > 0 || propConns.length > 0
      return hasConnections || selectedSenses.includes(normalizedId)
    }
    
    // For all other senses, use the traditional selectedSenses check
    return selectedSenses.includes(normalizedId)
  }

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
    
    // If this is the news sense, show the news configuration modal
    if (normalizedId === 'news') {
      setNewsModalOpen(true)
    }
    // If this is weather or air quality, show the new multi-location configuration modal
    else if (normalizedId === 'weather' || normalizedId === 'air_quality') {
      setConfiguringSense(normalizedId)
      setWeatherAirQualityModalOpen(true)
    }
    // If this is a connected sense (calendar, fitness, etc.)
    else if (CONNECTED_SENSE_IDS.includes(normalizedId)) {
      // Always show the OAuth modal for connected senses, whether they're enabled or not
      // This allows users to manage existing connections or add new ones
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

  const handleNewsConfiguration = (locations: NewsLocation[]) => {
    // Store locally to ensure persistence
    setLocalNewsConfigurations(prev => ({
      ...prev,
      news: locations
    }))
    
    // Don't call onToggle here - let the parent component handle enabling the sense
    // The parent AuraEditForm already handles this in its handleNewsConfiguration function
    // Calling onToggle here can create a race condition that toggles the sense off
    
    // Save the news configuration
    if (onNewsConfiguration) {
      onNewsConfiguration('news' as SenseId, locations)
    }
    
    setNewsModalOpen(false)
  }

  const handleNewsCancel = () => {
    setNewsModalOpen(false)
  }

  const handleWeatherAirQualityConfiguration = (locations: WeatherAirQualityLocation[]) => {
    if (configuringSense) {
      // Store locally to ensure persistence
      setLocalWeatherAirQualityConfigurations(prev => ({
        ...prev,
        [configuringSense]: locations
      }))
      
      // Don't call onToggle here - let the parent component handle enabling the sense
      // The parent AuraEditForm already handles this in its handleWeatherAirQualityConfiguration function
      // Calling onToggle here can create a race condition that toggles the sense off
      
      // Save the configuration via parent callback
      if (onWeatherAirQualityConfiguration) {
        onWeatherAirQualityConfiguration(configuringSense as SenseId, locations)
      }
      
      setWeatherAirQualityModalOpen(false)
      setConfiguringSense(null)
    }
  }

  const handleWeatherAirQualityCancel = () => {
    setWeatherAirQualityModalOpen(false)
    setConfiguringSense(null)
  }

  const handleOAuthComplete = (providerId: string, connectionData: any) => {
    if (connectingSense) {
      // If we have an auraId, let the parent component handle persistence
      // This prevents duplicate connections in the UI
      if (auraId && onOAuthConnection) {
        // Defer state updates to avoid React render cycle conflicts
        setTimeout(() => {
          // Notify parent component of the OAuth connection - parent will handle adding to state
          onOAuthConnection(connectingSense as SenseId, providerId, connectionData)
          
          // The sense will be automatically considered "active" due to the improved isSelected logic
          // that checks for OAuth connections, so we don't need to call onToggle here
        }, 0)
      } else {
        // Fallback for when no auraId is present (e.g., debug mode)
        // Create a new connection record
        const newConnection: ConnectedProvider = {
          id: `${providerId}-${Date.now()}`, // Simple ID generation
          name: connectionData.providerName || providerId,
          type: connectingSense,
          connectedAt: new Date(),
          providerId: providerId,
          accountEmail: connectionData.accountEmail || `Connected ${providerId} account`,
        }
        
        // Add to session connections - this will automatically make the sense "active"
        setSessionConnections(prev => ({
          ...prev,
          [connectingSense]: [...(prev[connectingSense] || []), newConnection]
        }))
        
        // Defer state updates to avoid React render cycle conflicts
        setTimeout(() => {
          // Notify parent component of the OAuth connection
          if (onOAuthConnection) {
            onOAuthConnection(connectingSense as SenseId, providerId, connectionData)
          }
        }, 0)
      }
      
      // Don't automatically close the modal - let users manage multiple connections
      // The modal has a "Done" button for when they're finished
    }
  }

  const handleOAuthDisconnect = (connectionId: string) => {
    if (connectingSense) {
      // If we have an auraId, let the parent component handle disconnection
      // This prevents state conflicts and ensures proper database cleanup
      if (auraId && onOAuthDisconnect) {
        // Defer state updates to avoid React render cycle conflicts
        setTimeout(() => {
          // Notify parent component of the disconnection - parent will handle state updates
          const senseId = connectingSense as SenseId
          onOAuthDisconnect(senseId, connectionId)
          
          // The sense will be automatically considered "inactive" due to the improved isSelected logic
          // that checks for OAuth connections, so we don't need to manually call onToggle
        }, 0)
      } else {
        // Fallback for when no auraId is present (e.g., debug mode)
        // Remove from session connections - this will automatically make the sense "inactive" if no connections remain
        setSessionConnections(prev => {
          const senseConnections = prev[connectingSense] || []
          const updatedConnections = senseConnections.filter(conn => conn.id !== connectionId)
          
          // Defer state updates to avoid React render cycle conflicts
          setTimeout(() => {
            // Notify parent component of the disconnection
            const senseId = connectingSense as SenseId
            if (onOAuthDisconnect) {
              onOAuthDisconnect(senseId, connectionId)
            }
            console.log(`✅ OAuth disconnection completed for ${connectingSense} (fallback mode), sense auto-deactivated if no connections remain`)
          }, 0)
          
          return {
            ...prev,
            [connectingSense]: updatedConnections
          }
        })
      }
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
    // Get connections from both session and props, but deduplicate properly
    const sessionConns = sessionConnections[senseId] || []
    const propConns = oauthConnections[senseId] || []
    
    
    // Deduplicate connections by provider + account email to prevent showing duplicates
    const allConnectionsMap = new Map()
    
    // Add prop connections first (from database) - these are the authoritative source
    propConns.forEach(conn => {
      const key = `${conn.providerId || 'unknown'}-${conn.accountEmail || conn.name || 'default'}`
      allConnectionsMap.set(key, conn)
    })
    
    // Add session connections only if they don't already exist (by provider + account)
    // This prevents duplicates when the same connection exists in both states
    sessionConns.forEach(conn => {
      const key = `${conn.providerId || 'unknown'}-${conn.accountEmail || conn.name || 'default'}`
      if (!allConnectionsMap.has(key)) {
        allConnectionsMap.set(key, conn)
      }
    })
    
    const allConnections = Array.from(allConnectionsMap.values())
    
    
    if (allConnections.length === 0) return null
    
    // Always return count format for the first badge - this is used for the main summary badge
    // Show count format for all OAuth senses
    if (senseId === 'location') {
      return `${allConnections.length} device${allConnections.length !== 1 ? 's' : ''} connected`
    }
    if (senseId === 'fitness') {
      return `${allConnections.length} fitness tracker${allConnections.length !== 1 ? 's' : ''} connected`
    }
    if (senseId === 'sleep') {
      return `${allConnections.length} sleep monitor${allConnections.length !== 1 ? 's' : ''} connected`
    }
    if (senseId === 'calendar') {
      return `${allConnections.length} calendar${allConnections.length !== 1 ? 's' : ''} connected`
    }
    return `${allConnections.length} service${allConnections.length !== 1 ? 's' : ''} connected`
  }

  const getLocationDevices = (senseId: string): ConnectedProvider[] => {
    // Get connections from both session and props for location sense, but deduplicate properly
    const sessionConns = sessionConnections[senseId] || []
    const propConns = oauthConnections[senseId] || []
    
    // Deduplicate connections by provider + account email
    const connectionsMap = new Map()
    
    // Add prop connections first (from database) - these are the authoritative source
    propConns.forEach(conn => {
      const key = `${conn.providerId || 'unknown'}-${conn.accountEmail || conn.name || 'default'}`
      connectionsMap.set(key, conn)
    })
    
    // Add session connections only if they don't already exist (by provider + account)
    sessionConns.forEach(conn => {
      const key = `${conn.providerId || 'unknown'}-${conn.accountEmail || conn.name || 'default'}`
      if (!connectionsMap.has(key)) {
        connectionsMap.set(key, conn)
      }
    })
    
    return Array.from(connectionsMap.values())
  }

  const getNewsDisplay = (senseId: string): string | null => {
    // Use local state if parent state is empty, otherwise use parent state
    const parentLocs = newsConfigurations[senseId] || []
    const localLocs = localNewsConfigurations[senseId] || []
    const newsLocs = parentLocs.length > 0 ? parentLocs : localLocs
    console.log(`Getting news display for ${senseId}:`, newsLocs)
    if (newsLocs.length === 0) return null
    return `Tracking ${newsLocs.length} location${newsLocs.length !== 1 ? 's' : ''}`
  }

  const getNewsLocations = (senseId: string): NewsLocation[] => {
    // Use local state if parent state is empty, otherwise use parent state
    const parentLocs = newsConfigurations[senseId] || []
    const localLocs = localNewsConfigurations[senseId] || []
    return parentLocs.length > 0 ? parentLocs : localLocs
  }

  const getWeatherAirQualityDisplay = (senseId: string): string | null => {
    // Use parent state if available, otherwise use local state
    const parentLocs = weatherAirQualityConfigurations[senseId] || []
    const localLocs = localWeatherAirQualityConfigurations[senseId] || []
    const locations = parentLocs.length > 0 ? parentLocs : localLocs
    console.log(`Getting weather/air quality display for ${senseId}:`, locations)
    if (locations.length === 0) return null
    return `Tracking ${locations.length} location${locations.length !== 1 ? 's' : ''}`
  }

  const getWeatherAirQualityLocations = (senseId: string): WeatherAirQualityLocation[] => {
    // Use parent state if available, otherwise use local state
    const parentLocs = weatherAirQualityConfigurations[senseId] || []
    const localLocs = localWeatherAirQualityConfigurations[senseId] || []
    return parentLocs.length > 0 ? parentLocs : localLocs
  }

  const getConnectedCalendars = (senseId: string): ConnectedCalendar[] => {
    // Get connections from both session and props, but deduplicate properly
    const sessionConns = sessionConnections[senseId] || []
    const propConns = oauthConnections[senseId] || []
    
    // Deduplicate connections by provider + account email
    const connectionsMap = new Map()
    
    // Add prop connections first (from database) - these are the authoritative source
    propConns.forEach(conn => {
      const key = `${conn.providerId || 'unknown'}-${conn.accountEmail || conn.name || 'default'}`
      connectionsMap.set(key, conn)
    })
    
    // Add session connections only if they don't already exist (by provider + account)
    sessionConns.forEach(conn => {
      const key = `${conn.providerId || 'unknown'}-${conn.accountEmail || conn.name || 'default'}`
      if (!connectionsMap.has(key)) {
        connectionsMap.set(key, conn)
      }
    })
    
    const allConnections = Array.from(connectionsMap.values())
    
    return allConnections.map(conn => ({
      id: conn.id,
      providerId: conn.providerId || 'unknown',
      providerName: conn.name,
      accountEmail: conn.accountEmail,
      connectedAt: conn.connectedAt,
    }))
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
              const newsDisplay = getNewsDisplay(sense.id)
              const weatherAirQualityDisplay = getWeatherAirQualityDisplay(sense.id)
              const needsLocation = LOCATION_AWARE_SENSES.includes(sense.id as SenseId) && sense.id !== 'news' && !weatherAirQualityDisplay
              const isNewsConfigured = sense.id === 'news' && newsDisplay
              const isWeatherAirQualityConfigured = (sense.id === 'weather' || sense.id === 'air_quality') && weatherAirQualityDisplay
              
              // Check if this sense is available based on subscription
              const isSenseAvailable = availableSenses.some(availableSense => availableSense.id === sense.id)
              
              if (!isSenseAvailable) {
                return (
                  <div key={sense.id} className="group relative p-5 rounded-2xl border-2 border-gray-200 bg-gray-50 text-left opacity-60">
                    <div className="absolute top-3 right-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gray-300 text-gray-500">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-500 mb-1">{sense.name}</h4>
                        <p className="text-sm text-gray-400 mb-2">{sense.category}</p>
                      </div>
                    </div>
                  </div>
                )
              }
              
              return (
                  <button
                    onClick={() => handleSenseToggle(sense.id as SenseId)}
                    className={cn(
                      "group relative p-5 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg",
                      active
                        ? "border-green-500 bg-gradient-to-br from-green-100 to-blue-100 shadow-lg ring-2 ring-green-200"
                        : cn("border-gray-200 hover:border-green-300 bg-white", tierInfo.bgColor)
                    )}
                  >
                  {active && (
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
                      {newsDisplay && (
                        <div className="space-y-2 mb-2">
                          <div className={cn(
                            "flex items-center gap-1 text-xs px-2 py-1 rounded-md",
                            active
                              ? "text-purple-700 bg-purple-50 border border-purple-200"
                              : "text-orange-600 bg-orange-50 border border-orange-200"
                          )}>
                            <Newspaper className="w-3 h-3" />
                            <span className="font-medium">{newsDisplay}</span>
                          </div>
                          {/* Show individual news locations */}
                          <div className="flex flex-wrap gap-1">
                            {getNewsLocations(sense.id).map((location) => (
                              <div
                                key={location.id}
                                className={cn(
                                  "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                                  location.type === 'global'
                                    ? active
                                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                                      : "bg-blue-50 text-blue-600 border border-blue-100"
                                    : location.type === 'device'
                                    ? active
                                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                                      : "bg-blue-50 text-blue-600 border border-blue-100"
                                    : active
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-green-50 text-green-600 border border-green-100"
                                )}
                              >
                                {location.type === 'global' ? (
                                  <Globe className="w-2.5 h-2.5" />
                                ) : location.type === 'device' ? (
                                  <Globe className="w-2.5 h-2.5" />
                                ) : (
                                  <MapPin className="w-2.5 h-2.5" />
                                )}
                                <span className="font-medium">
                                  {location.type === 'global' ? 'Global' :
                                   location.type === 'device' ? 'Device Location' :
                                   (location.displayName || (location.country ? `${location.name}, ${location.country}` : location.name))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {weatherAirQualityDisplay && (
                        <div className="space-y-2 mb-2">
                          <div className={cn(
                            "flex items-center gap-1 text-xs px-2 py-1 rounded-md",
                            active
                              ? "text-purple-700 bg-purple-50 border border-purple-200"
                              : "text-green-600 bg-green-50 border border-green-200"
                          )}>
                            {sense.id === 'weather' ? (
                              <Cloud className="w-3 h-3" />
                            ) : (
                              <Wind className="w-3 h-3" />
                            )}
                            <span className="font-medium">{weatherAirQualityDisplay}</span>
                          </div>
                          {/* Show individual weather/air quality locations */}
                          <div className="flex flex-wrap gap-1">
                            {getWeatherAirQualityLocations(sense.id).map((location) => (
                              <div
                                key={location.id}
                                className={cn(
                                  "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                                  location.type === 'device'
                                    ? active
                                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                                      : "bg-blue-50 text-blue-600 border border-blue-100"
                                    : active
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-green-50 text-green-600 border border-green-100"
                                )}
                              >
                                {location.type === 'device' ? (
                                  <Globe className="w-2.5 h-2.5" />
                                ) : (
                                  <MapPin className="w-2.5 h-2.5" />
                                )}
                                <span className="font-medium">
                                  {location.type === 'device' ? 'Device Location' :
                                   (location.displayName || (location.country ? `${location.name}, ${location.country}` : location.name))}
                                </span>
                              </div>
                            ))}
                          </div>
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
                            : needsLocation
                            ? "bg-gray-100 text-gray-600 group-hover:bg-green-50 group-hover:text-green-600"
                            : "bg-gray-100 text-gray-600 group-hover:bg-green-50 group-hover:text-green-600"
                        )}>
                          {active
                            ? "Connected"
                            : locationDisplay
                            ? "Location configured"
                            : isNewsConfigured
                            ? "News configured"
                            : needsLocation
                            ? "Configure location"
                            : sense.id === 'news'
                            ? "Configure news sources"
                            : isWeatherAirQualityConfigured
                            ? `${sense.id === 'weather' ? 'Weather' : 'Air quality'} configured`
                            : (sense.id === 'weather' || sense.id === 'air_quality')
                            ? `Configure ${sense.id === 'weather' ? 'weather' : 'air quality'} locations`
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

      {/* Personal Connected Senses */}
      {connectedSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <WifiCog className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Personal Connected Senses</h3>
            <span className="text-sm text-gray-500">(Sync your data)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedSenses.map(sense => {
              const Icon = senseIcons[sense.id] ?? Info
              const active = isSelected(sense.id)
              const tierInfo = getTierConfig(sense.tier)
              const oauthDisplay = getOAuthDisplay(sense.id)
              const locationDevices = sense.id === 'location' ? getLocationDevices(sense.id) : []
              const connectedCalendars = sense.id === 'calendar' ? getConnectedCalendars(sense.id) : []
              
              // Check if user has access to personal connected senses
              if (!hasPersonalConnectedSenses) {
                return (
                  <div key={sense.id} className="group relative p-5 rounded-2xl border-2 border-gray-200 bg-gray-50 text-left opacity-60">
                    <div className="absolute top-3 right-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gray-300 text-gray-500">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-500 mb-1">{sense.name}</h4>
                        <p className="text-sm text-gray-400 mb-2">{sense.category}</p>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-400">Premium Feature</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              
              return (
                  <button
                    onClick={() => handleSenseToggle(sense.id as SenseId)}
                    className={cn(
                      "group relative p-5 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg",
                      active
                        ? "border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg ring-2 ring-purple-200"
                        : cn("border-gray-200 hover:border-purple-300 bg-white", tierInfo.bgColor)
                    )}
                  >
                    {active && (
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <CheckCircle2 className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl transition-all duration-300",
                        active
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
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
                        
                        {/* OAuth Connection Display - First Badge (Connection Count) */}
                        {oauthDisplay && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs mb-2 px-2 py-1 rounded-md font-medium",
                            active
                              ? "text-purple-700 bg-purple-100 border border-purple-300"
                              : "text-green-700 bg-green-100 border border-green-300"
                          )}>
                            <WifiCog className="w-3 h-3" />
                            <span>{oauthDisplay}</span>
                          </div>
                        )}
                        
                        {/* Location Device Details - Second Badge (Device Specifics) */}
                        {sense.id === 'location' && locationDevices.length > 0 && (
                          <div className="space-y-1 mb-2">
                            <div className="flex flex-wrap gap-1">
                              {locationDevices.map((device) => (
                                <div
                                  key={device.id}
                                  className={cn(
                                    "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium max-w-full",
                                    active
                                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                                      : "bg-blue-50 text-blue-700 border border-blue-200"
                                  )}
                                >
                                  <Smartphone className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                                    {device.deviceInfo?.browser || 'Browser'} {device.deviceInfo?.os || 'OS'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Fitness/Sleep Connection Details - Second Badge (Provider Specifics) */}
                        {(sense.id === 'fitness' || sense.id === 'sleep') && (() => {
                          const sessionConns = sessionConnections[sense.id] || []
                          const propConns = oauthConnections[sense.id] || []
                          const connectionsMap = new Map()
                          
                          propConns.forEach(conn => {
                            const key = `${conn.providerId || 'unknown'}-${conn.accountEmail || conn.name || 'default'}`
                            connectionsMap.set(key, conn)
                          })
                          
                          sessionConns.forEach(conn => {
                            const key = `${conn.providerId || 'unknown'}-${conn.accountEmail || conn.name || 'default'}`
                            if (!connectionsMap.has(key)) {
                              connectionsMap.set(key, conn)
                            }
                          })
                          
                          const allConnections = Array.from(connectionsMap.values())
                          
                          return allConnections.length > 0 ? (
                            <div className="space-y-1 mb-2">
                              <div className="flex flex-wrap gap-1">
                                {allConnections.map((connection) => (
                                  <div
                                    key={connection.id}
                                    className={cn(
                                      "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium",
                                      active
                                        ? "bg-green-100 text-green-800 border border-green-300"
                                        : "bg-green-50 text-green-700 border border-green-200"
                                    )}
                                  >
                                    <Activity className="w-3 h-3" />
                                    <span>
                                      {connection.name || connection.providerId || 'Connected Service'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null
                        })()}
                        
                        {/* Calendar Connection Details - Second Badge (Provider Specifics) */}
                        {sense.id === 'calendar' && connectedCalendars.length > 0 && (
                          <div className="space-y-1 mb-2">
                            <div className="flex flex-wrap gap-1">
                              {connectedCalendars.map((calendar) => (
                                <div
                                  key={calendar.id}
                                  className={cn(
                                    "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium",
                                    active
                                      ? "bg-orange-100 text-orange-800 border border-orange-300"
                                      : "bg-orange-50 text-orange-700 border border-orange-200"
                                  )}
                                >
                                  <WifiCog className="w-3 h-3" />
                                  <span>
                                    {calendar.providerName || 'Calendar'} - {calendar.accountEmail}
                                  </span>
                                </div>
                              ))}
                            </div>
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
                              ? "bg-purple-100 text-purple-700"
                              : oauthDisplay
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600 group-hover:bg-purple-50 group-hover:text-purple-600"
                          )}>
                            {active
                              ? "Connected"
                              : oauthDisplay
                              ? "Ready to sync"
                              : "Connect service"}
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Sense Configuration Summary</h3>
            <p className="text-sm text-gray-600">Your aura's sensory capabilities</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {requiredSenses.filter(s => isSelected(s.id)).length}
            </div>
            <div className="text-xs text-gray-600">Essential</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {optionalSenses.filter(s => isSelected(s.id)).length}
            </div>
            <div className="text-xs text-gray-600">Additional</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {connectedSenses.filter(s => isSelected(s.id)).length}
            </div>
            <div className="text-xs text-gray-600">Connected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {availableSenses.filter(s => isSelected(s.id)).length}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SenseLocationModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        onLocationSet={handleLocationSet}
        vesselName={auraName}
        senseType={configuringSense || 'weather'}
      />

      <EnhancedOAuthConnectionModal
        open={oauthModalOpen}
        onOpenChange={setOauthModalOpen}
        onConnectionComplete={handleOAuthComplete}
        onDisconnect={handleOAuthDisconnect}
        onCancel={handleOAuthCancel}
        senseType={connectingSense || 'location'}
        auraId={auraId}
        existingConnections={connectingSense ? getConnectedCalendars(connectingSense) : []}
      />

      <NewsConfigurationModal
        open={newsModalOpen}
        onOpenChange={setNewsModalOpen}
        onConfigurationComplete={handleNewsConfiguration}
        vesselName={auraName}
        existingLocations={getNewsLocations('news')}
        existingLocationConnections={getLocationDevices('location')}
      />

      <WeatherAirQualityConfigurationModal
        open={weatherAirQualityModalOpen}
        onOpenChange={setWeatherAirQualityModalOpen}
        onConfigurationComplete={handleWeatherAirQualityConfiguration}
        vesselName={auraName}
        senseType={configuringSense || 'weather'}
        existingLocations={configuringSense ? getWeatherAirQualityLocations(configuringSense) : []}
        existingLocationConnections={getLocationDevices('location')}
      />
    </div>
  )
}