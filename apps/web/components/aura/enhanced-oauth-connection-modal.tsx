// components/aura/enhanced-oauth-connection-modal.tsx
"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Activity,
  Moon,
  MapPin,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Plus,
  Settings,
  Library,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { GoogleCalendarOAuth } from "@/lib/oauth/google-calendar"
import { MicrosoftOutlookOAuth } from "@/lib/oauth/microsoft-outlook"
import { BrowserLocationService, type LocationConfig, type LocationData } from "@/lib/oauth/browser-location"
import { LocationConnectionModal } from "./location-connection-modal"
import { AppleHealthOAuth } from "@/lib/oauth/apple-health"
import { GoogleFitOAuth } from "@/lib/oauth/google-fit"
import { FitbitOAuth } from "@/lib/oauth/fitbit"
import { StravaOAuth } from "@/lib/oauth/strava"
import { OAuthLibrarySelector, type LibraryConnection as OriginalLibraryConnection } from "./oauth-library-selector"

// Extended interface to handle both library and direct connections
interface LibraryConnection extends OriginalLibraryConnection {
  is_direct_connection?: boolean
  source_aura_id?: string
}

export type PersonalSenseType = 'calendar' | 'fitness' | 'sleep' | 'location'

export type OAuthProvider = {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  color: string
  bgColor: string
  popular?: boolean
  comingSoon?: boolean
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnecting'

export interface ConnectedCalendar {
  id: string
  providerId: string
  providerName: string
  accountEmail?: string
  calendarName?: string
  connectedAt: Date
  lastSync?: Date
  deviceInfo?: {
    browser: string
    os: string
    platform: string
    language: string
    screenInfo: string
    userAgent: string
  }
}

interface EnhancedOAuthConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  senseType: PersonalSenseType
  onConnectionComplete: (provider: string, connectionData: any) => void
  onDisconnect: (connectionId: string) => void
  onCancel: () => void
  existingConnections?: ConnectedCalendar[]
  auraId?: string // Add aura_id to associate connections with specific aura
}

// OAuth providers for different sense types
const OAUTH_PROVIDERS: Record<PersonalSenseType, OAuthProvider[]> = {
  calendar: [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Connect your Google Calendar events and schedules',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      popular: true,
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      icon: Calendar,
      description: 'Sync your Outlook calendar and appointments',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-indigo-50',
      popular: true,
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: Calendar,
      description: 'Import your iCloud calendar events',
      color: 'from-gray-700 to-gray-800',
      bgColor: 'bg-gray-50',
      comingSoon: true,
    },
    {
      id: 'calendly',
      name: 'Calendly',
      icon: Calendar,
      description: 'Connect your Calendly scheduled meetings',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      comingSoon: true,
    },
  ],
  fitness: [
    {
      id: 'apple_health',
      name: 'Apple Health',
      icon: Activity,
      description: 'Sync your iPhone health and activity data',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      popular: true,
      comingSoon: true,
    },
    {
      id: 'google_fit',
      name: 'Google Fit',
      icon: Activity,
      description: 'Connect your Google Fit activity tracking',
      color: 'from-green-500 to-blue-500',
      bgColor: 'bg-green-50',
      popular: true,
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: Activity,
      description: 'Import your Fitbit health and fitness data',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      comingSoon: true,
    },
    {
      id: 'strava',
      name: 'Strava',
      icon: Activity,
      description: 'Connect your Strava workouts and activities',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
  ],
  sleep: [
    {
      id: 'apple_health',
      name: 'Apple Health',
      icon: Moon,
      description: 'Import your iPhone sleep tracking data',
      color: 'from-purple-500 to-blue-500',
      bgColor: 'bg-purple-50',
      popular: true,
      comingSoon: true,
    },
    {
      id: 'google_fit',
      name: 'Google Fit',
      icon: Moon,
      description: 'Sync your Google Fit sleep data',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'oura',
      name: 'Oura Ring',
      icon: Moon,
      description: 'Connect your Oura sleep and recovery data',
      color: 'from-gray-800 to-black',
      bgColor: 'bg-gray-50',
      popular: true,
      comingSoon: true,
    },
    {
      id: 'whoop',
      name: 'WHOOP',
      icon: Moon,
      description: 'Import your WHOOP recovery and sleep metrics',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      comingSoon: true,
    },
  ],
  location: [
    {
      id: 'device_location',
      name: 'Device Location',
      icon: MapPin,
      description: 'Track location from this device using browser location services',
      color: 'from-green-500 to-blue-500',
      bgColor: 'bg-green-50',
      popular: true,
    },
  ],
}

const SENSE_CONFIG = {
  calendar: {
    title: 'Manage Calendar Connections',
    description: 'Connect multiple calendar services to give your Aura complete visibility into your schedule.',
    icon: Calendar,
    color: 'text-blue-600',
  },
  fitness: {
    title: 'Connect Your Fitness Data',
    description: 'Share your activity, workouts, and health metrics so your Aura can understand your wellness journey.',
    icon: Activity,
    color: 'text-green-600',
  },
  sleep: {
    title: 'Connect Your Sleep Data',
    description: 'Help your Aura understand your rest patterns and energy levels for better personalized interactions.',
    icon: Moon,
    color: 'text-purple-600',
  },
  location: {
    title: 'Connect Your Location',
    description: 'Allow your Aura to understand your movement patterns and favorite places for location-aware responses.',
    icon: MapPin,
    color: 'text-orange-600',
  },
}

export function EnhancedOAuthConnectionModal({
  open,
  onOpenChange,
  senseType,
  onConnectionComplete,
  onDisconnect,
  onCancel,
  existingConnections = [],
  auraId,
}: EnhancedOAuthConnectionModalProps) {
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionStatus>>({})
  const [locationService] = useState(() => new BrowserLocationService())
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [libraryConnections, setLibraryConnections] = useState<Record<string, LibraryConnection[]>>({})
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  
  const senseConfig = SENSE_CONFIG[senseType]
  const providers = OAUTH_PROVIDERS[senseType] || []
  
  // Fetch library connections when modal opens
  React.useEffect(() => {
    if (open) {
      fetchLibraryConnections()
    }
  }, [open, senseType])

  const fetchLibraryConnections = async () => {
    setLoadingLibrary(true)
    try {
      // Fetch both library connections and all user connections for this sense type
      const [libraryResponse, allConnectionsResponse] = await Promise.all([
        fetch(`/api/oauth-connections/library?sense_type=${encodeURIComponent(senseType)}`),
        fetch(`/api/oauth-connections?include_library=true`)
      ])
      
      console.log('🔍 API responses:', {
        library: { ok: libraryResponse.ok, status: libraryResponse.status },
        all: { ok: allConnectionsResponse.ok, status: allConnectionsResponse.status }
      })
      
      let allAvailableConnections: LibraryConnection[] = []
      
      // Get library connections (aura_id = null) - handle gracefully if API fails
      if (libraryResponse.ok) {
        try {
          const libraryData = await libraryResponse.json()
          allAvailableConnections = [...libraryData]
        } catch (parseError) {
          console.warn('⚠️ Failed to parse library connections response:', parseError)
        }
      } else {
        console.warn('⚠️ Library connections API failed:', libraryResponse.status, libraryResponse.statusText)
      }
      
      // Get all user connections and filter for reusable ones - handle gracefully if API fails
      if (allConnectionsResponse.ok) {
        try {
          const allData = await allConnectionsResponse.json()
          
          console.log('🔍 All connections data:', {
            totalConnections: allData.length,
            senseType,
            auraId,
            connections: allData.map((conn: any) => ({
              id: conn.id,
              provider: conn.provider,
              sense_type: conn.sense_type,
              aura_id: conn.aura_id,
              created_at: conn.created_at
            }))
          })
          
          // Filter connections that match the sense type and are not already associated with this aura
          const reusableConnections = allData
            .filter((conn: any) => {
              const matches = conn.sense_type === senseType &&
                conn.aura_id !== auraId && // Not already connected to this aura
                conn.aura_id !== null // Direct connections from other auras (exclude library connections)
              
              console.log('🔍 Connection filter check:', {
                id: conn.id,
                provider: conn.provider,
                sense_type: conn.sense_type,
                aura_id: conn.aura_id,
                targetSenseType: senseType,
                targetAuraId: auraId,
                matches
              })
              
              return matches
            })
            .map((conn: any) => ({
              id: conn.id,
              provider: conn.provider,
              provider_user_id: conn.provider_user_id,
              sense_type: conn.sense_type,
              created_at: conn.created_at,
              expires_at: conn.expires_at,
              scope: conn.scope,
              device_info: conn.device_info,
              is_direct_connection: true, // Mark as direct connection for UI
              source_aura_id: conn.aura_id // Track which aura it's from
            }))
          
          console.log('🔍 Filtered reusable connections:', {
            count: reusableConnections.length,
            connections: reusableConnections
          })
          
          allAvailableConnections = [...allAvailableConnections, ...reusableConnections]
        } catch (parseError) {
          console.warn('⚠️ Failed to parse all connections response:', parseError)
        }
      } else {
        console.warn('⚠️ All connections API failed:', allConnectionsResponse.status, allConnectionsResponse.statusText)
      }
      
      console.log('📚 All available connections:', {
        senseType,
        connections: allAvailableConnections,
        count: allAvailableConnections.length
      })
      
      setLibraryConnections(prev => ({
        ...prev,
        [senseType]: allAvailableConnections
      }))
      
    } catch (error) {
      console.error('❌ Error fetching connections:', error)
      // Continue gracefully - the UI will just not show library connections
    } finally {
      setLoadingLibrary(false)
    }
  }
  
  const handleConnect = async (providerId: string, useLibrary: boolean = true) => {
    console.log('🎯 handleConnect called:', {
      providerId,
      senseType,
      auraId,
      useLibrary,
      timestamp: new Date().toISOString()
    })
    
    setConnectionStatus(prev => ({ ...prev, [providerId]: 'connecting' }))
    
    try {
      if (providerId === 'google' && senseType === 'calendar') {
        // Real Google Calendar OAuth
        const { ConfigService } = await import('@/lib/services/config-service')
        const clientId = await ConfigService.getGoogleClientId()
        
        if (!clientId) {
          throw new Error('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.')
        }

        const googleOAuth = new GoogleCalendarOAuth({
          clientId,
          redirectUri: `${window.location.origin}/auth/google/callback`,
          scopes: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events.readonly'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await googleOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'google',
          providerName: 'Google Calendar',
          accountEmail: 'Google Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
          useLibrary,
          senseType,
          auraId: useLibrary ? undefined : auraId, // Library connections don't have aura_id
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'outlook' && senseType === 'calendar') {
        // Real Microsoft Outlook OAuth
        const { ConfigService } = await import('@/lib/services/config-service')
        const clientId = await ConfigService.getMicrosoftClientId()
        
        if (!clientId) {
          throw new Error('Microsoft Client ID not configured. Please add NEXT_PUBLIC_MICROSOFT_CLIENT_ID to your environment variables.')
        }

        const microsoftOAuth = new MicrosoftOutlookOAuth({
          clientId,
          redirectUri: `${window.location.origin}/auth/microsoft/callback`,
          scopes: [
            'https://graph.microsoft.com/calendars.read',
            'https://graph.microsoft.com/user.read',
            'offline_access'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await microsoftOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'outlook',
          providerName: 'Microsoft Outlook',
          accountEmail: 'Microsoft Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
          useLibrary,
          senseType,
          auraId: useLibrary ? undefined : auraId, // Library connections don't have aura_id
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'device_location' && senseType === 'location') {
        // Show dedicated location modal for device location
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        setShowLocationModal(true)
        return
        
      } else if (providerId === 'apple_health' && senseType === 'fitness') {
        // Apple Health OAuth integration
        const { ConfigService } = await import('@/lib/services/config-service')
        const clientId = await ConfigService.getAppleHealthClientId()
        
        if (!clientId) {
          throw new Error('Apple Health Client ID not configured. Please add NEXT_PUBLIC_APPLE_HEALTH_CLIENT_ID to your environment variables.')
        }

        const appleHealthOAuth = new AppleHealthOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/apple-health/callback`,
          scopes: [
            'https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifierstepcount',
            'https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifierheartrate',
            'https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifieractiveenergyburned'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await appleHealthOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'apple_health',
          providerName: 'Apple Health',
          accountEmail: 'Apple Health Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
          useLibrary,
          senseType,
          auraId: useLibrary ? undefined : auraId, // Library connections don't have aura_id
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'google_fit' && senseType === 'fitness') {
        // Google Fit OAuth integration (reuses existing Google credentials)
        const { ConfigService } = await import('@/lib/services/config-service')
        const clientId = await ConfigService.getGoogleClientId()
        
        console.log('🔑 Environment check:', {
          clientId: clientId ? clientId.substring(0, 10) + '...' : 'NOT_SET'
        })
        
        if (!clientId) {
          throw new Error('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.')
        }

        const googleFitOAuth = new GoogleFitOAuth({
          clientId,
          redirectUri: `${window.location.origin}/auth/google-fit/callback`,
          scopes: [
            'https://www.googleapis.com/auth/fitness.activity.read',
            'https://www.googleapis.com/auth/fitness.heart_rate.read',
            'https://www.googleapis.com/auth/fitness.location.read',
            'https://www.googleapis.com/auth/fitness.body.read'
          ]
        })

        // Initiate OAuth flow and get tokens
        console.log('🚀 Starting Google Fit OAuth flow...')
        let tokenResponse
        try {
          tokenResponse = await googleFitOAuth.initiateOAuth()
        } catch (oauthError) {
          console.error('❌ OAuth flow failed:', oauthError)
          throw new Error(`OAuth failed: ${oauthError instanceof Error ? oauthError.message : String(oauthError)}`)
        }
        console.log('🎉 Google Fit OAuth completed:', {
          hasAccessToken: !!tokenResponse.access_token,
          hasRefreshToken: !!tokenResponse.refresh_token,
          expiresIn: tokenResponse.expires_in,
          scope: tokenResponse.scope,
          fullResponse: tokenResponse
        })
        
        // Create connection data
        const connectionData = {
          providerId: 'google_fit',
          providerName: 'Google Fit',
          accountEmail: 'Google Fit Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
          useLibrary,
          senseType,
          auraId: useLibrary ? undefined : auraId, // Library connections don't have aura_id
        }
        
        console.log('📋 Created connection data:', connectionData)
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        console.log('📞 Calling onConnectionComplete with:', {
          providerId,
          connectionData,
          auraId
        })
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'fitbit' && senseType === 'fitness') {
        // Fitbit OAuth integration
        const { ConfigService } = await import('@/lib/services/config-service')
        const clientId = await ConfigService.getFitbitClientId()
        
        if (!clientId) {
          throw new Error('Fitbit Client ID not configured. Please add NEXT_PUBLIC_FITBIT_CLIENT_ID to your environment variables.')
        }

        const fitbitOAuth = new FitbitOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/fitbit/callback`,
          scopes: [
            'activity',
            'heartrate',
            'location',
            'nutrition',
            'profile',
            'settings',
            'sleep',
            'social',
            'weight'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await fitbitOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'fitbit',
          providerName: 'Fitbit',
          accountEmail: 'Fitbit Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
          useLibrary,
          senseType,
          auraId: useLibrary ? undefined : auraId, // Library connections don't have aura_id
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'strava' && senseType === 'fitness') {
        // Strava OAuth integration
        const { ConfigService } = await import('@/lib/services/config-service')
        const clientId = await ConfigService.getStravaClientId()
        
        if (!clientId) {
          throw new Error('Strava Client ID not configured. Please add NEXT_PUBLIC_STRAVA_CLIENT_ID to your environment variables.')
        }

        const stravaOAuth = new StravaOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/strava/callback`,
          scopes: [
            'read',
            'activity:read_all',
            'profile:read_all'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await stravaOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'strava',
          providerName: 'Strava',
          accountEmail: 'Strava Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
          useLibrary,
          senseType,
          auraId: useLibrary ? undefined : auraId, // Library connections don't have aura_id
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else {
        // Simulate other providers
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const connectionData = {
          providerId,
          providerName: providers.find(p => p.id === providerId)?.name || 'Unknown',
          accountEmail: 'user@example.com',
          connectedAt: new Date(),
          useLibrary,
          senseType,
          auraId: useLibrary ? undefined : auraId, // Library connections don't have aura_id
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
      }
      
    } catch (error) {
      console.error('❌ OAuth connection failed:', {
        providerId,
        senseType,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      setConnectionStatus(prev => ({ ...prev, [providerId]: 'error' }))
      
      // Show user-friendly error message
      let errorMessage = 'Connection failed'
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Handle specific error cases
        if (errorMessage.includes('already exists')) {
          // Check if there's an expired library connection
          const libraryConnections = getProviderLibraryConnections(providerId)
          const hasExpiredConnection = libraryConnections.some(conn =>
            conn.expires_at && new Date(conn.expires_at) < new Date()
          )
          
          if (hasExpiredConnection) {
            errorMessage = 'An expired connection exists for this provider. Please contact support to refresh your connection.'
          } else {
            errorMessage = 'A connection already exists for this provider. Please check your existing connections or try disconnecting first.'
          }
        }
      }
      
      alert(errorMessage)
    }
  }

  const handleLibraryConnectionSelect = async (connection: LibraryConnection) => {
    console.log('🎯 handleLibraryConnectionSelect called:', {
      connection,
      auraId,
      isDirectConnection: connection.is_direct_connection,
      timestamp: new Date().toISOString()
    })

    if (!auraId) {
      console.error('❌ No aura ID provided for connection association')
      alert('Error: Assistant needs to be saved before adding connections. Please save your assistant first.')
      return
    }

    try {
      if (connection.is_direct_connection) {
        // For direct connections from other auras, we need to create a new association
        // or convert it to a library connection first
        console.log('🔄 Handling direct connection reuse')
        
        // First, convert the direct connection to a library connection
        const convertResponse = await fetch('/api/oauth-connections/convert-to-library', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connection_id: connection.id,
          }),
        })

        if (!convertResponse.ok) {
          throw new Error(`Failed to convert connection to library: ${convertResponse.statusText}`)
        }

        const convertedConnection = await convertResponse.json()
        
        // Now associate the library connection with this aura
        const associateResponse = await fetch('/api/oauth-connections/library/associate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connection_id: convertedConnection.id, // Use connection_id as per API
            aura_id: auraId,
          }),
        })

        if (!associateResponse.ok) {
          throw new Error(`Failed to associate converted connection: ${associateResponse.statusText}`)
        }

      } else {
        // For library connections, just associate with this aura
        console.log('📚 Handling library connection association')
        
        const response = await fetch('/api/oauth-connections/library/associate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connection_id: connection.id, // Use connection_id as per API
            aura_id: auraId,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Association API error:', { status: response.status, statusText: response.statusText, body: errorText })
          throw new Error(`Failed to associate library connection: ${response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ Association result:', result)
      }

      // Create connection data in the format expected by the parent component
      const connectionData = {
        id: connection.id,
        providerId: connection.provider,
        providerName: connection.provider,
        accountEmail: connection.provider_user_id,
        connectedAt: new Date(connection.created_at),
        isLibraryConnection: !connection.is_direct_connection,
        wasDirectConnection: connection.is_direct_connection,
      }

      console.log('✅ Connection associated successfully:', connectionData)
      onConnectionComplete(connection.provider, connectionData)
      
    } catch (error) {
      console.error('❌ Failed to associate connection:', error)
      alert(`Failed to use existing connection: ${error instanceof Error ? error.message : error}`)
    }
  }

  // Get library connections for a specific provider
  const getProviderLibraryConnections = (providerId: string): LibraryConnection[] => {
    const connections = libraryConnections[senseType] || []
    
    // Log all provider values to debug mismatch
    console.log('🔍 All connection providers:', connections.map(c => ({
      id: c.id,
      provider: c.provider,
      provider_user_id: c.provider_user_id
    })))
    
    // Handle provider name variations (e.g., 'google_fit' vs 'google-fit')
    const normalizedProviderId = providerId.replace(/-/g, '_').toLowerCase()
    
    // Filter connections that match the provider AND are not already connected to this aura
    const filtered = connections.filter(conn => {
      const normalizedConnProvider = conn.provider.replace(/-/g, '_').toLowerCase()
      const matchesProvider = normalizedConnProvider === normalizedProviderId
      
      // Check if this connection is already associated with the current aura
      const isAlreadyConnected = existingConnections.some(existing =>
        existing.id === conn.id ||
        (existing.providerId === conn.provider && existing.accountEmail === conn.provider_user_id)
      )
      
      console.log(`Comparing: ${conn.provider} (normalized: ${normalizedConnProvider}) with ${providerId} (normalized: ${normalizedProviderId}) = ${matchesProvider}, already connected: ${isAlreadyConnected}`)
      
      return matchesProvider && !isAlreadyConnected
    })
    
    console.log('🔍 getProviderLibraryConnections:', {
      providerId,
      normalizedProviderId,
      senseType,
      allConnections: connections,
      filteredConnections: filtered,
      existingConnectionIds: existingConnections.map(c => c.id),
      libraryConnectionsState: libraryConnections,
      timestamp: new Date().toISOString()
    })
    
    return filtered
  }

  const handleLocationConnection = (connectionData: any) => {
    setShowLocationModal(false)
    // Use device_location as the provider ID but include device info for identification
    const enhancedConnectionData = {
      ...connectionData,
      providerId: 'device_location',
      providerName: 'Device Location',
      deviceInfo: getDeviceInfo(),
    }
    onConnectionComplete('device_location', enhancedConnectionData)
  }

  // Device detection utility functions
  const detectDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent)
    
    if (isTablet) return 'tablet_browser'
    if (isMobile) return 'mobile_browser'
    return 'desktop_browser'
  }

  const getDeviceDisplayName = (deviceType: string): string => {
    switch (deviceType) {
      case 'desktop_browser': return 'Desktop Browser'
      case 'mobile_browser': return 'Mobile Browser'
      case 'tablet_browser': return 'Tablet Browser'
      default: return 'Browser Location'
    }
  }

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const language = navigator.language
    
    // Extract browser info
    let browserName = 'Unknown Browser'
    if (userAgent.includes('Chrome')) browserName = 'Chrome'
    else if (userAgent.includes('Firefox')) browserName = 'Firefox'
    else if (userAgent.includes('Safari')) browserName = 'Safari'
    else if (userAgent.includes('Edge')) browserName = 'Edge'
    
    // Extract OS info
    let osName = 'Unknown OS'
    if (platform.includes('Win')) osName = 'Windows'
    else if (platform.includes('Mac')) osName = 'macOS'
    else if (platform.includes('Linux')) osName = 'Linux'
    else if (userAgent.includes('Android')) osName = 'Android'
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) osName = 'iOS'
    
    // Add screen info for device fingerprinting
    const screenInfo = `${screen.width}x${screen.height}`
    
    return {
      browser: browserName,
      os: osName,
      platform,
      language,
      screenInfo,
      userAgent: userAgent.substring(0, 100) + '...', // Truncate for privacy
    }
  }

  // Create a unique device fingerprint for duplicate detection
  const createDeviceFingerprint = () => {
    const deviceInfo = getDeviceInfo()
    // Create a fingerprint based on browser, OS, platform, and screen resolution
    const screenInfo = `${screen.width}x${screen.height}`
    const fingerprint = `${deviceInfo.browser}-${deviceInfo.os}-${deviceInfo.platform}-${screenInfo}`
    return fingerprint
  }

  // Check if current device is already configured
  const isCurrentDeviceConfigured = () => {
    const currentFingerprint = createDeviceFingerprint()
    return existingConnections.some(conn =>
      conn.providerId === 'device_location' &&
      conn.deviceInfo &&
      createConnectionFingerprint(conn.deviceInfo) === currentFingerprint
    )
  }

  // Create fingerprint from stored device info
  const createConnectionFingerprint = (deviceInfo: any) => {
    if (!deviceInfo) return ''
    // Try to recreate the same fingerprint format
    const screenInfo = deviceInfo.screenInfo || 'unknown'
    return `${deviceInfo.browser}-${deviceInfo.os}-${deviceInfo.platform}-${screenInfo}`
  }

  const handleLocationCancel = () => {
    setShowLocationModal(false)
  }

  const handleDisconnect = async (connectionId: string) => {
    setConnectionStatus(prev => ({ ...prev, [connectionId]: 'disconnecting' }))
    
    try {
      // Simulate disconnect process
      await new Promise(resolve => setTimeout(resolve, 1000))
      onDisconnect(connectionId)
      
      // Reset any provider connection status that might be stuck
      const disconnectedConnection = existingConnections.find(conn => conn.id === connectionId)
      if (disconnectedConnection) {
        setConnectionStatus(prev => ({ ...prev, [disconnectedConnection.providerId]: 'idle' }))
      }
      
      setConnectionStatus(prev => ({ ...prev, [connectionId]: 'idle' }))
    } catch (error) {
      console.error('Disconnect failed:', error)
      setConnectionStatus(prev => ({ ...prev, [connectionId]: 'error' }))
    }
  }

  const getStatusIcon = (providerId: string) => {
    const status = connectionStatus[providerId] || 'idle'
    switch (status) {
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'disconnecting':
        return <Loader2 className="w-4 h-4 animate-spin text-red-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <ExternalLink className="w-4 h-4" />
    }
  }

  const getButtonText = (providerId: string) => {
    const status = connectionStatus[providerId] || 'idle'
    switch (status) {
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        return 'Connected!'
      case 'disconnecting':
        return 'Disconnecting...'
      case 'error':
        return 'Try Again'
      default:
        return 'Connect'
    }
  }

  const isProviderConnected = (providerId: string) => {
    return existingConnections.some(conn => conn.providerId === providerId)
  }

  const getProviderConnections = (providerId: string) => {
    return existingConnections.filter(conn => conn.providerId === providerId)
  }

  // Check if a provider should be prevented from duplicate connections
  const shouldPreventDuplicateConnection = (providerId: string): { prevent: boolean; reason: string } => {
    const existingConns = getProviderConnections(providerId)
    
    // For device location, prevent duplicates of the same device
    if (providerId === 'device_location') {
      const isCurrentDeviceAlreadyConfigured = isCurrentDeviceConfigured()
      if (isCurrentDeviceAlreadyConfigured) {
        return { prevent: true, reason: 'This device is already configured' }
      }
    }
    
    // For single-account providers (like personal health data), prevent duplicates
    const singleAccountProviders = ['apple_health', 'oura', 'whoop']
    if (singleAccountProviders.includes(providerId) && existingConns.length > 0) {
      return { prevent: true, reason: 'Only one account can be connected for this service' }
    }
    
    // For providers that typically have one main account but could have multiple
    const limitedAccountProviders = ['google', 'outlook', 'google_fit', 'fitbit', 'strava']
    if (limitedAccountProviders.includes(providerId) && existingConns.length >= 2) {
      return { prevent: true, reason: 'Maximum of 2 accounts allowed for this service' }
    }
    
    return { prevent: false, reason: '' }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-xl bg-gradient-to-r text-white",
                senseConfig.color.replace('text-', 'from-').replace('-600', '-500') + ' to-' + senseConfig.color.replace('text-', '').replace('-600', '-600')
              )}>
                <senseConfig.icon className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">{senseConfig.title}</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {senseConfig.description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Existing Connections */}
        {existingConnections.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {senseType === 'location'
                ? `Connected Devices (${existingConnections.length})`
                : senseType === 'fitness'
                ? `Connected Fitness Services (${existingConnections.length})`
                : senseType === 'sleep'
                ? `Connected Sleep Trackers (${existingConnections.length})`
                : `Connected Calendars (${existingConnections.length})`
              }
            </h3>
            
            <div className="grid gap-3">
              {existingConnections.map((connection) => {
                const provider = providers.find(p => p.id === connection.providerId)
                const status = connectionStatus[connection.id] || 'idle'
                const isDisconnecting = status === 'disconnecting'
                
                return (
                  <div
                    key={connection.id}
                    className="border border-green-300 bg-green-50 rounded-xl p-4 w-full overflow-hidden"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={cn(
                          "p-3 rounded-lg bg-gradient-to-r text-white flex-shrink-0",
                          provider?.color || "from-gray-500 to-gray-600"
                        )}>
                          {provider?.icon ? <provider.icon className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800 truncate">
                              {connection.providerName}
                            </h4>
                            {senseType === 'location' && (
                              <span className="text-lg flex-shrink-0">
                                {connection.providerId?.includes('mobile') ? '📱' :
                                 connection.providerId?.includes('tablet') ? '📱' :
                                 connection.providerId?.includes('desktop') ? '💻' : '📍'}
                              </span>
                            )}
                          </div>
                          {connection.accountEmail && (
                            <p className="text-sm text-gray-600 mb-1 truncate max-w-full">
                              {connection.accountEmail}
                            </p>
                          )}
                          <p className="text-xs text-green-600 break-words">
                            <span className="block sm:inline">
                              Connected {connection.connectedAt instanceof Date ? connection.connectedAt.toLocaleDateString() : new Date(connection.connectedAt).toLocaleDateString()}
                            </span>
                            {connection.lastSync && (
                              <span className="block sm:inline sm:ml-2">
                                Last sync: {connection.lastSync instanceof Date ? connection.lastSync.toLocaleDateString() : new Date(connection.lastSync).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800 flex-1 sm:flex-none"
                          onClick={() => alert(`Settings for ${connection.providerName} - Feature coming soon!`)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </Button>
                        <Button
                          onClick={() => handleDisconnect(connection.id)}
                          disabled={isDisconnecting}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400 flex-1 sm:flex-none"
                        >
                          {isDisconnecting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Your Privacy is Protected</p>
              <p className="text-blue-700">
                We only access the minimum data needed to enhance your Aura's understanding. 
                You can disconnect any service at any time, and we never share your personal data.
              </p>
            </div>
          </div>
        </div>

        {/* Add New Connection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {senseType === 'location'
              ? 'Add Device Location'
              : senseType === 'fitness'
              ? 'Add New Fitness Connection'
              : senseType === 'sleep'
              ? 'Add New Sleep Tracker'
              : 'Add New Calendar Connection'
            }
          </h3>
          
          <div className="grid gap-3">
            {providers.map((provider) => {
              const status = connectionStatus[provider.id] || 'idle'
              const isConnecting = status === 'connecting'
              const isConnected = status === 'connected'
              const hasError = status === 'error'
              const hasExistingConnection = isProviderConnected(provider.id)
              const isCurrentDeviceAlreadyConfigured = provider.id === 'device_location' && isCurrentDeviceConfigured()
              const duplicateCheck = shouldPreventDuplicateConnection(provider.id)
              const shouldPreventConnection = duplicateCheck.prevent || provider.comingSoon
              
              return (
                <div
                  key={provider.id}
                  className={cn(
                    "relative border rounded-xl p-4 transition-all",
                    provider.popular && !hasExistingConnection && !provider.comingSoon && "ring-2 ring-blue-200 border-blue-300",
                    isConnected && "border-green-300 bg-green-50",
                    hasError && "border-red-300 bg-red-50",
                    hasExistingConnection && "border-gray-300 bg-gray-50",
                    provider.comingSoon && "border-orange-300 bg-orange-50 opacity-75",
                    !isConnected && !hasError && !hasExistingConnection && !provider.comingSoon && provider.bgColor
                  )}
                >
                  {provider.popular && !hasExistingConnection && !provider.comingSoon && (
                    <div className="absolute -top-2 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Popular Choice
                    </div>
                  )}
                  {provider.comingSoon && (
                    <div className="absolute -top-2 right-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-r text-white",
                        provider.color,
                        provider.comingSoon && "opacity-60"
                      )}>
                        <provider.icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-semibold mb-1",
                          provider.comingSoon ? "text-gray-600" : "text-gray-800"
                        )}>
                          {provider.name}
                        </h4>
                        <p className={cn(
                          "text-sm",
                          provider.comingSoon ? "text-gray-500" : "text-gray-600"
                        )}>
                          {provider.description}
                        </p>
                        {provider.comingSoon && (
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            🚧 Integration coming soon
                          </p>
                        )}
                        {!provider.comingSoon && (provider.id === 'google' || provider.id === 'outlook') && senseType === 'calendar' && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ Full integration available
                          </p>
                        )}
                        {!provider.comingSoon && (provider.id === 'google_fit' || provider.id === 'strava') && senseType === 'fitness' && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ Full integration available
                          </p>
                        )}
                        {!provider.comingSoon && provider.id === 'device_location' && senseType === 'location' && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ Native browser location • No external accounts needed
                          </p>
                        )}
                        {provider.id === 'device_location' && isCurrentDeviceAlreadyConfigured && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            ✓ This device is already configured
                          </p>
                        )}
                        {hasExistingConnection && provider.id !== 'device_location' && !shouldPreventConnection && !provider.comingSoon && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            ✓ Already connected • You can add multiple accounts
                          </p>
                        )}
                        {!provider.comingSoon && shouldPreventConnection && (
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            ⚠ {duplicateCheck.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {(() => {
                      const providerLibraryConnections = getProviderLibraryConnections(provider.id)
                      const hasLibraryConnections = providerLibraryConnections.length > 0
                      
                      if (hasLibraryConnections && !shouldPreventConnection && !provider.comingSoon) {
                        // Show simple buttons when library connections are available
                        return (
                          <div
                            className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
                            onClick={(e) => {
                              console.log('🔍 Parent div clicked:', {
                                target: e.target,
                                currentTarget: e.currentTarget,
                                className: (e.target as HTMLElement).className,
                                tagName: (e.target as HTMLElement).tagName,
                                provider: provider.id
                              })
                            }}
                          >
                            <Button
                              onClick={() => {
                                console.log('🆕 Connect New button clicked for:', provider.id)
                                handleConnect(provider.id, true)
                              }}
                              disabled={isConnecting}
                              variant={hasExistingConnection ? "outline" : "default"}
                              size="sm"
                              className={cn(
                                "w-full sm:w-auto",
                                hasError && "border-red-300 text-red-700 bg-red-50",
                                hasExistingConnection && "border-blue-300 text-blue-700 bg-blue-50"
                              )}
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(provider.id)}
                                <span>
                                  {isConnecting
                                    ? 'Connecting...'
                                    : hasError
                                    ? 'Try Again'
                                    : 'Connect New'
                                  }
                                </span>
                              </div>
                            </Button>
                            
                            {providerLibraryConnections.map((connection, index) => {
                              // Don't treat connections as expired just because access token expired
                              // Library connections should remain usable as long as they exist
                              const isExpired = false // Connections in library are always usable
                              const isDirectConnection = connection.is_direct_connection
                              const buttonId = `library-connection-${provider.id}-${connection.id}-${index}`
                              const uniqueKey = `${provider.id}-${connection.id}-${index}`
                              
                              console.log(`🔘 Rendering library button for ${provider.id}:`, {
                                buttonId,
                                uniqueKey,
                                connectionId: connection.id,
                                provider: connection.provider,
                                isExpired,
                                disabled: Boolean(isExpired),
                                index,
                                providerFromConnection: connection.provider,
                                providerFromLoop: provider.id
                              })
                              
                              return (
                                <Button
                                  key={uniqueKey}
                                  id={buttonId}
                                  onClick={() => {
                                    console.log('🖱️ Library button clicked!', {
                                      buttonId,
                                      connectionId: connection.id,
                                      provider: connection.provider,
                                      isExpired,
                                      timestamp: new Date().toISOString()
                                    })
                                    
                                    if (!isExpired) {
                                      console.log('🚀 Calling handleLibraryConnectionSelect')
                                      handleLibraryConnectionSelect(connection)
                                    } else {
                                      console.log('⚠️ Connection is expired')
                                      alert('This connection has expired and needs to be re-authenticated.')
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    console.log('🖱️ Mouse down event:', {
                                      buttonId,
                                      provider: connection.provider,
                                      timestamp: new Date().toISOString()
                                    })
                                  }}
                                  disabled={Boolean(isExpired)}
                                  variant={isExpired ? "outline" : "outline"}
                                  size="sm"
                                  className={cn(
                                    "w-full sm:w-auto",
                                    isExpired
                                      ? "opacity-50 cursor-not-allowed border-red-300 hover:bg-red-50"
                                      : "cursor-pointer hover:bg-blue-100 active:bg-blue-200"
                                  )}
                                  type="button"
                                  style={{ pointerEvents: isExpired ? 'none' : 'auto' }}
                                >
                                  <div className="flex items-center gap-1">
                                    {isDirectConnection ? (
                                      <ExternalLink className="w-3 h-3" />
                                    ) : (
                                      <Library className="w-3 h-3" />
                                    )}
                                    <span className="truncate">
                                      {isExpired ? '⚠️ Expired: ' : 'Use '}{connection.provider_user_id.substring(0, 10)}...
                                    </span>
                                    {isExpired ? (
                                      <span className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded ml-1">
                                        Re-auth needed
                                      </span>
                                    ) : isDirectConnection ? (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded ml-1 hidden sm:inline">
                                        Reuse
                                      </span>
                                    ) : (
                                      <span className="text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded ml-1 hidden sm:inline">
                                        Library
                                      </span>
                                    )}
                                  </div>
                                </Button>
                              )
                            })}
                          </div>
                        )
                      } else {
                        // Show regular button when no library connections or other conditions
                        return (
                          <Button
                            onClick={() => handleConnect(provider.id, true)} // Use library by default
                            disabled={isConnecting || shouldPreventConnection}
                            variant={hasExistingConnection || shouldPreventConnection ? "outline" : "default"}
                            className={cn(
                              "w-full sm:w-auto sm:min-w-[120px]",
                              hasError && "border-red-300 text-red-700 bg-red-50",
                              (hasExistingConnection || shouldPreventConnection) && "border-blue-300 text-blue-700 bg-blue-50",
                              shouldPreventConnection && "opacity-60 cursor-not-allowed",
                              provider.comingSoon && "border-orange-300 text-orange-700 bg-orange-50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {getStatusIcon(provider.id)}
                              <span>
                                {provider.comingSoon
                                  ? 'Coming Soon'
                                  : shouldPreventConnection
                                  ? 'Cannot Connect'
                                  : hasExistingConnection && !isConnecting && !shouldPreventConnection
                                  ? 'Add Another'
                                  : isConnecting
                                  ? 'Connecting...'
                                  : hasError
                                  ? 'Try Again'
                                  : 'Connect'
                                }
                              </span>
                            </div>
                          </Button>
                        )
                      }
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t mt-8 mb-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            You can manage all connected services in your account settings
          </p>
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Done
          </Button>
        </div>

        {/* Location Connection Modal */}
        <LocationConnectionModal
          open={showLocationModal}
          onOpenChange={setShowLocationModal}
          onConnectionComplete={handleLocationConnection}
          onCancel={handleLocationCancel}
        />
      </DialogContent>
    </Dialog>
  )
}