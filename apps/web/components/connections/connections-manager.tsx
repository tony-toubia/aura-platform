"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link2, MapPin, Unlink, AlertTriangle } from "lucide-react"
import { ConfirmationDialog } from "./confirmation-dialog"

interface OAuthConnection {
  id: string
  provider: string
  sense_type: string
  created_at: string
  aura_count?: number
  affected_rules?: number
  is_library_connection?: boolean
  associated_auras?: Array<{
    id: string
    name: string
  }>
}

interface LocationSense {
  id: string
  aura: {
    id: string
    name: string
  }
}

interface ConnectionsManagerProps {
  userId: string
}

export function ConnectionsManager({ userId }: ConnectionsManagerProps) {
  const [oauthConnections, setOauthConnections] = useState<OAuthConnection[]>([])
  const [locationSenses, setLocationSenses] = useState<LocationSense[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'oauth' | 'location'
    connection?: OAuthConnection
    onConfirm?: () => void
  }>({ isOpen: false, type: 'oauth' })

  useEffect(() => {
    fetchConnections()
  }, [userId])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      
      // Fetch OAuth connections with aura count
      const oauthResponse = await fetch('/api/connections/oauth-info')
      const oauthData = await oauthResponse.json()
      
      // Fetch location senses
      const locationResponse = await fetch('/api/connections/location-info')
      const locationData = await locationResponse.json()
      
      setOauthConnections(oauthData)
      setLocationSenses(locationData)
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthDisconnect = async (connectionId: string) => {
    try {
      // First try to delete from library (safe delete - only if no associations)
      const libraryResponse = await fetch('/api/oauth-connections/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId })
      })
      
      if (libraryResponse.ok) {
        await fetchConnections() // Refresh data
        return
      }
      
      // If library delete failed, fall back to regular disconnect
      const response = await fetch('/api/oauth-connections/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId })
      })
      
      if (response.ok) {
        await fetchConnections() // Refresh data
      }
    } catch (error) {
      console.error('Error disconnecting OAuth:', error)
    }
  }

  const handleLocationDisable = async () => {
    try {
      const response = await fetch('/api/connections/location/disable', {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchConnections() // Refresh data
      }
    } catch (error) {
      console.error('Error disabling location:', error)
    }
  }

  const openOAuthConfirmation = (connection: OAuthConnection) => {
    setConfirmDialog({
      isOpen: true,
      type: 'oauth',
      connection,
      onConfirm: () => {
        handleOAuthDisconnect(connection.id)
        setConfirmDialog({ isOpen: false, type: 'oauth' })
      }
    })
  }

  const openLocationConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'location',
      onConfirm: () => {
        handleLocationDisable()
        setConfirmDialog({ isOpen: false, type: 'oauth' })
      }
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Connected Services</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connected Services</h1>
          <p className="text-muted-foreground">
            Manage your OAuth connections and data sources
          </p>
        </div>

        <div className="space-y-6">
          {/* OAuth Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                OAuth Connections
              </CardTitle>
              <CardDescription>
                Third-party services connected to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {oauthConnections.length > 0 ? (
                <div className="space-y-4">
                  {oauthConnections.map((connection) => (
                    <div key={connection.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium capitalize">{connection.provider}</div>
                            {connection.is_library_connection && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                📚 Library
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {connection.sense_type} • Connected {new Date(connection.created_at).toLocaleDateString()}
                            {connection.aura_count && (
                              <span> • Used by {connection.aura_count} Aura{connection.aura_count !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                          {connection.is_library_connection && connection.associated_auras && connection.associated_auras.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">Associated Auras:</div>
                              <div className="flex flex-wrap gap-1">
                                {connection.associated_auras.map((aura) => (
                                  <span
                                    key={aura.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {aura.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOAuthConfirmation(connection)}
                        >
                          <Unlink className="h-4 w-4 mr-1" />
                          {connection.is_library_connection ? 'Remove from Library' : 'Disconnect'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No OAuth connections found</p>
              )}
            </CardContent>
          </Card>

          {/* Location Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Services
              </CardTitle>
              <CardDescription>
                Browser-based location access for weather and local data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {locationSenses.length > 0 ? (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Browser Location</div>
                    <div className="text-sm text-muted-foreground">
                      Used by {locationSenses.length} Aura{locationSenses.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={openLocationConfirmation}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Disable
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Location services not enabled</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, type: 'oauth' })}
          onConfirm={confirmDialog.onConfirm}
          type={confirmDialog.type}
          connection={confirmDialog.connection}
          locationCount={locationSenses.length}
        />
      </div>
    </div>
  )
}