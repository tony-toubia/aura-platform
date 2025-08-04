"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Unlink,
  MapPin,
  Activity,
  Moon,
  Calendar,
  Wifi,
  WifiOff
} from "lucide-react"
import { ConnectionCard } from "./connection-card"
import { DisconnectModal } from "./disconnect-modal"

interface OAuthConnection {
  id: string
  provider: string
  sense_type: string
  created_at: string
  expires_at?: string
  provider_user_id?: string
  device_info?: any
}

interface SenseConnection {
  sense_type: string
  sense_name: string
  icon: React.ComponentType<any>
  connections: OAuthConnection[]
  requiresOAuth: boolean
  isEnabled: boolean
}

interface ConnectionsManagerProps {
  userId: string
}

const SENSE_CONFIG = {
  fitness: {
    name: "Fitness & Activity",
    icon: Activity,
    requiresOAuth: true,
    description: "Connect fitness trackers and activity apps"
  },
  sleep: {
    name: "Sleep Tracking",
    icon: Moon,
    requiresOAuth: true,
    description: "Monitor your sleep patterns and quality"
  },
  calendar: {
    name: "Calendar Events",
    icon: Calendar,
    requiresOAuth: true,
    description: "Access your calendar for scheduling insights"
  },
  location: {
    name: "Location Services",
    icon: MapPin,
    requiresOAuth: false,
    description: "Browser-based location for weather and local data"
  }
}

export function ConnectionsManager({ userId }: ConnectionsManagerProps) {
  const [connections, setConnections] = useState<OAuthConnection[]>([])
  const [senseConnections, setSenseConnections] = useState<SenseConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnectModal, setDisconnectModal] = useState<{
    isOpen: boolean
    connection?: OAuthConnection
    senseType?: string
  }>({ isOpen: false })

  useEffect(() => {
    fetchConnections()
  }, [userId])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch OAuth connections
      const oauthResponse = await fetch('/api/oauth-connections')
      if (!oauthResponse.ok) {
        throw new Error('Failed to fetch OAuth connections')
      }
      const oauthData = await oauthResponse.json()

      // Fetch user's auras to see which senses are enabled
      const aurasResponse = await fetch('/api/auras')
      if (!aurasResponse.ok) {
        throw new Error('Failed to fetch auras')
      }
      const aurasData = await aurasResponse.json()

      // Get all enabled senses across all auras
      const enabledSenses = new Set<string>()
      aurasData.forEach((aura: any) => {
        if (aura.senses) {
          aura.senses.forEach((sense: string) => enabledSenses.add(sense))
        }
      })

      // Check if location is enabled (browser-based)
      const hasLocationSense = enabledSenses.has('location')

      // Group connections by sense type
      const senseMap = new Map<string, OAuthConnection[]>()
      oauthData.forEach((conn: OAuthConnection) => {
        if (!senseMap.has(conn.sense_type)) {
          senseMap.set(conn.sense_type, [])
        }
        senseMap.get(conn.sense_type)!.push(conn)
      })

      // Build sense connections array
      const senseConnections: SenseConnection[] = []
      
      Object.entries(SENSE_CONFIG).forEach(([senseType, config]) => {
        const connections = senseMap.get(senseType) || []
        const isEnabled = enabledSenses.has(senseType)
        
        // Special handling for location sense
        if (senseType === 'location') {
          senseConnections.push({
            sense_type: senseType,
            sense_name: config.name,
            icon: config.icon,
            connections: [], // Location doesn't have OAuth connections
            requiresOAuth: false,
            isEnabled: hasLocationSense
          })
        } else if (isEnabled || connections.length > 0) {
          senseConnections.push({
            sense_type: senseType,
            sense_name: config.name,
            icon: config.icon,
            connections,
            requiresOAuth: config.requiresOAuth,
            isEnabled
          })
        }
      })

      setConnections(oauthData)
      setSenseConnections(senseConnections)
    } catch (err) {
      console.error('Error fetching connections:', err)
      setError(err instanceof Error ? err.message : 'Failed to load connections')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (connectionId?: string, senseType?: string) => {
    try {
      if (connectionId) {
        // Disconnect OAuth connection
        const response = await fetch(`/api/oauth-connections/${connectionId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Failed to disconnect service')
        }
      } else if (senseType === 'location') {
        // For location, we need to remove it from all auras
        const response = await fetch('/api/settings/location', {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Failed to disable location services')
        }
      }

      // Refresh connections
      await fetchConnections()
      setDisconnectModal({ isOpen: false })
    } catch (err) {
      console.error('Error disconnecting:', err)
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const connectedCount = senseConnections.filter(s => 
    s.connections.length > 0 || (s.sense_type === 'location' && s.isEnabled)
  ).length
  const totalSenses = senseConnections.length

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Connection Overview
          </CardTitle>
          <CardDescription>
            You have {connectedCount} of {totalSenses} available senses connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Connected ({connectedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Available ({totalSenses - connectedCount})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sense Connections */}
      <div className="grid gap-6 md:grid-cols-2">
        {senseConnections.map((sense) => (
          <ConnectionCard
            key={sense.sense_type}
            sense={sense}
            onDisconnect={(connectionId?: string) =>
              setDisconnectModal({
                isOpen: true,
                connection: connectionId ? sense.connections.find(c => c.id === connectionId) : undefined,
                senseType: sense.sense_type
              })
            }
          />
        ))}
      </div>

      {senseConnections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Connected Services</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don't have any connected services yet. Create an Aura with senses to start connecting services.
            </p>
            <Button asChild>
              <a href="/auras/create">Create Your First Aura</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Disconnect Modal */}
      <DisconnectModal
        isOpen={disconnectModal.isOpen}
        onClose={() => setDisconnectModal({ isOpen: false })}
        onConfirm={() => handleDisconnect(
          disconnectModal.connection?.id,
          disconnectModal.senseType
        )}
        connection={disconnectModal.connection}
        senseType={disconnectModal.senseType}
      />
    </div>
  )
}