"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

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

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  type: 'oauth' | 'location'
  connection?: OAuthConnection
  locationCount?: number
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  connection,
  locationCount = 0
}: ConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    if (!onConfirm) return
    
    setIsProcessing(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error in confirmation action:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isOAuth = type === 'oauth'
  const serviceName = isOAuth ? connection?.provider : 'Location Services'
  const affectedCount = isOAuth ? connection?.aura_count || 0 : locationCount
  const senseType = isOAuth ? connection?.sense_type : 'location'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {isOAuth ? 'Disconnect Service' : 'Disable Location Services'}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {isOAuth ? 'disconnect' : 'disable'} {serviceName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Impact Summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-2">Impact Summary:</p>
                <ul className="text-amber-700 space-y-1 list-disc list-inside">
                  <li>
                    This will affect <strong>{affectedCount}</strong> Aura{affectedCount !== 1 ? 's' : ''} 
                    {affectedCount > 0 ? ' using this service' : ''}
                  </li>
                  <li>
                    Any behavior rules that depend on <strong>{senseType}</strong> data will be 
                    <strong> temporarily disabled</strong>
                  </li>
                  <li>
                    Disabled rules will remain inactive until you either:
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Reconnect this service, or</li>
                      <li>• Edit the rules to remove the {senseType} dependency</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Warning for OAuth */}
          {isOAuth && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-1">
                    {connection?.is_library_connection ? 'Remove from Library:' : 'Complete Disconnection:'}
                  </p>
                  <p className="text-red-700">
                    {connection?.is_library_connection ? (
                      <>
                        This will remove {serviceName} from your connection library and disconnect it from all associated Auras.
                        {connection.associated_auras && connection.associated_auras.length > 0 && (
                          <span className="block mt-2">
                            <strong>Affected Auras:</strong> {connection.associated_auras.map(a => a.name).join(', ')}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        This will completely disconnect {serviceName} from your account.
                        All Auras using this connection will lose access to {senseType} data.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isOAuth ? 'Disconnecting...' : 'Disabling...'}
              </>
            ) : (
              isOAuth ? (connection?.is_library_connection ? 'Remove from Library' : 'Disconnect Service') : 'Disable Location'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}