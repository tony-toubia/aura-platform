"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Unlink,
  MapPin,
  Activity,
  Moon,
  Calendar,
  Wifi,
  WifiOff,
  Clock
} from "lucide-react"

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

interface ConnectionCardProps {
  sense: SenseConnection
  onDisconnect: (connectionId?: string) => void
}

const getProviderDisplayName = (provider: string) => {
  const providerMap: Record<string, string> = {
    'google': 'Google Calendar',
    'google_fit': 'Google Fit',
    'outlook': 'Microsoft Outlook',
    'strava': 'Strava',
    'fitbit': 'Fitbit',
    'apple_health': 'Apple Health',
    'oura': 'Oura Ring',
    'whoop': 'WHOOP'
  }
  return providerMap[provider] || provider
}

const isConnectionExpired = (connection: OAuthConnection) => {
  if (!connection.expires_at) return false
  return new Date(connection.expires_at) < new Date()
}

export function ConnectionCard({ sense, onDisconnect }: ConnectionCardProps) {
  const IconComponent = sense.icon
  const hasConnections = sense.connections.length > 0
  const isLocationSense = sense.sense_type === 'location'
  
  // For location sense, show as connected if enabled
  const isConnected = isLocationSense ? sense.isEnabled : hasConnections

  return (
    <Card className={isConnected ? "border-green-200 bg-green-50/50" : "border-gray-200"}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{sense.sense_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Not Connected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLocationSense ? (
          // Special handling for location sense
          <div className="space-y-3">
            {sense.isEnabled ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Browser Location</p>
                    <p className="text-sm text-muted-foreground">Using device GPS and network location</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDisconnect()}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Unlink className="h-4 w-4 mr-1" />
                  Disable
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Location services not enabled</p>
              </div>
            )}
          </div>
        ) : (
          // OAuth connections
          <div className="space-y-3">
            {sense.connections.length > 0 ? (
              sense.connections.map((connection) => {
                const isExpired = isConnectionExpired(connection)
                return (
                  <div key={connection.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-orange-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="font-medium">{getProviderDisplayName(connection.provider)}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Connected {new Date(connection.created_at).toLocaleDateString()}</span>
                          {isExpired && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 text-orange-600">
                                <Clock className="h-3 w-3" />
                                <span>Expired</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDisconnect(connection.id)}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6">
                <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No connected services</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect services when creating or editing an Aura
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}