"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Unlink } from "lucide-react"

interface OAuthConnection {
  id: string
  provider: string
  sense_type: string
  created_at: string
  expires_at?: string
  provider_user_id?: string
  device_info?: any
}

interface DisconnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  connection?: OAuthConnection
  senseType?: string
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

const getSenseDisplayName = (senseType: string) => {
  const senseMap: Record<string, string> = {
    'fitness': 'Fitness & Activity',
    'sleep': 'Sleep Tracking',
    'calendar': 'Calendar Events',
    'location': 'Location Services'
  }
  return senseMap[senseType] || senseType
}

export function DisconnectModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  connection, 
  senseType 
}: DisconnectModalProps) {
  const isLocationSense = senseType === 'location'
  const serviceName = connection 
    ? getProviderDisplayName(connection.provider)
    : isLocationSense 
    ? 'Location Services'
    : 'Service'

  const senseDisplayName = senseType ? getSenseDisplayName(senseType) : 'Unknown'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlink className="h-5 w-5 text-red-600" />
            Disconnect {serviceName}
          </DialogTitle>
          <DialogDescription>
            {isLocationSense 
              ? "This will disable location services for all your Auras."
              : `This will disconnect ${serviceName} from your account.`
            }
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action cannot be undone. 
            {isLocationSense 
              ? " Your Auras will no longer have access to location data for weather and local information."
              : ` Your Auras will lose access to ${senseDisplayName.toLowerCase()} data from ${serviceName}.`
            }
          </AlertDescription>
        </Alert>

        {connection && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Connection Details:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>Service: {serviceName}</div>
              <div>Type: {getSenseDisplayName(connection.sense_type)}</div>
              <div>Connected: {new Date(connection.created_at).toLocaleDateString()}</div>
              {connection.expires_at && (
                <div>Expires: {new Date(connection.expires_at).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Unlink className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}