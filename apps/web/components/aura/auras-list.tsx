// apps/web/components/aura/auras-list.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { EmptyState } from '@/components/ui/empty-state'
import { SubscriptionGuard } from '@/components/subscription/subscription-guard'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VESSEL_TYPE_CONFIG } from '@/lib/vessel-config'
import { countAuraSenses, countTotalSenses, getAllAuraSenses } from '@/lib/utils/sense-counting'
import {
  Plus,
  Brain,
  Edit3,
  GitBranch,
  Sparkles,
  Heart,
  Zap,
  Trash2,
  Settings,
  Activity,
  ArrowRight,
  Power,
  Crown,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { deleteAuraAction } from '@/app/actions/delete-aura'
import { cn } from '@/lib/utils'
import type { Aura } from '@/types'
import { useSubscription } from '@/lib/contexts/subscription-context'
import { useAuras } from '@/lib/hooks/use-auras'

interface AurasListProps {
  initialAuras: Aura[]
}

export function AurasList({ initialAuras }: AurasListProps) {
  const router = useRouter()
  const { subscription, checkFeatureAccess } = useSubscription()
  const { auras, loading, error, refresh, updateAura, removeAura } = useAuras({ initialAuras })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [auraToDelete, setAuraToDelete] = useState<Aura | null>(null)
  const [limitDialogOpen, setLimitDialogOpen] = useState(false)
  const [limitErrorMessage, setLimitErrorMessage] = useState<string>('')
  const [activeAuraCount, setActiveAuraCount] = useState(auras.filter(a => a.enabled).length)
  const [refreshKey, setRefreshKey] = useState(0)
  const [canCreateAura, setCanCreateAura] = useState<boolean | null>(null)

  // Update active aura count and refresh key when auras change
  useEffect(() => {
    const newActiveCount = auras.filter(a => a.enabled).length
    setActiveAuraCount(newActiveCount)
    setRefreshKey(prev => prev + 1) // Force subscription guard refresh
  }, [auras])

  // Check if user can create more auras
  useEffect(() => {
    const checkAuraCreation = async () => {
      try {
        console.log('AurasList: Checking aura creation access', {
          subscription: subscription?.id,
          activeAuraCount,
          maxAuras: subscription?.features?.maxAuras
        })
        const canCreate = await checkFeatureAccess('maxAuras')
        console.log('AurasList: Can create aura result:', canCreate)
        setCanCreateAura(canCreate)
      } catch (error) {
        console.error('Error checking aura creation access:', error)
        setCanCreateAura(false)
      }
    }
    
    if (subscription) {
      checkAuraCreation()
    } else {
      console.log('AurasList: No subscription available yet')
    }
  }, [subscription, activeAuraCount, checkFeatureAccess])

  const handleDeleteClick = (aura: Aura) => {
    setAuraToDelete(aura)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (auraToDelete) {
      try {
        // Use API call instead of server action for better state management
        const response = await fetch(`/api/auras/${auraToDelete.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Update local state to remove the deleted aura
          removeAura(auraToDelete.id)
          setAuraToDelete(null)
          setDeleteDialogOpen(false)
          
          // Refresh the page to update subscription guards
          router.refresh()
        } else {
          console.error('Failed to delete aura')
          // Optionally show an error message to the user
        }
      } catch (error) {
        console.error('Error deleting aura:', error)
        // Optionally show an error message to the user
      }
    }
  }

  const handleDeactivateConfirm = async () => {
    if (auraToDelete) {
      await handleToggleEnabled(auraToDelete, false)
      setAuraToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleToggleEnabled = async (aura: Aura, enabled: boolean) => {
    console.log('Toggle aura:', aura.id, 'to', enabled);
    
    try {
      // Use the new limit management API
      const response = await fetch('/api/auras/limit-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: enabled ? 'enable' : 'disable',
          auraId: aura.id
        }),
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        // Update local state with confirmed data from server
        if (responseData.aura) {
          console.log('Updating aura state:', responseData.aura);
          updateAura(aura.id, { enabled: responseData.aura.enabled });
        } else {
          // Fallback: update with the intended state if no aura data returned
          console.log('No aura data in response, using fallback update');
          updateAura(aura.id, { enabled });
        }
      } else {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        
        // Check if it's a subscription limit error
        if (response.status === 403) {
          setLimitErrorMessage(errorData.error || 'You have reached your subscription limit for active auras.');
          setLimitDialogOpen(true);
          return; // Don't proceed with the update
        }
        
        console.error('Failed to update aura status:', errorData.error);
      }
    } catch (error) {
      console.error('Error updating aura status:', error);
    }
  };


  return (
    <div className="w-full">
      {/* Enhanced Header */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            Aura Collection
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Auras
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage and interact with your digital AI companions
          </p>
          
          {/* Refresh button for manual cache refresh */}
          {auras.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="mt-4"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          )}
        </div>

        {/* Stats Overview - Only show when auras exist */}
        {auras.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{auras.length}</div>
              <div className="text-sm text-purple-600">Total Auras</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {auras.filter(a => a.enabled).length}
              </div>
              <div className="text-sm text-green-600">Active</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {countTotalSenses(auras)}
              </div>
              <div className="text-sm text-blue-600">Total Senses</div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-700">
                {auras.reduce((acc, aura) => acc + (aura.rules?.length || 0), 0)}
              </div>
              <div className="text-sm text-amber-600">Total Rules</div>
            </div>
          </div>
        )}

        {/* Action Buttons - Always show */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="w-full flex flex-col items-center">
            {/* Show loading state while checking subscription */}
            {canCreateAura === null ? (
              <div className="w-full max-w-md">
                <div className="border-gray-200 bg-gray-50 border rounded-lg">
                  <div className="p-6 text-center">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : canCreateAura ? (
              <Button
                onClick={() => router.push('/auras/create-select')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
                data-help="create-aura-button"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create New Aura
              </Button>
            ) : (
              <div className="w-full max-w-md">
                <div className="border-amber-200 bg-amber-50 border rounded-lg">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-amber-100 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900">Upgrade Required</h3>
                        <p className="text-sm text-amber-700 mt-1">
                          You&apos;ve reached the maximum number of active Auras for your current plan.
                        </p>
                        <Button 
                          onClick={() => router.push('/subscription')}
                          className="mt-4" 
                          size="sm"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          View Upgrade Options
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      {auras.length === 0 && !loading ? (
        <EmptyState
          icon={Brain}
          iconGradient="from-purple-500 to-blue-500"
          title="Create Your Digital Aura"
          description="Welcome to the future of AI companions! Your digital Aura will be a powerful,
                  personalized AI that lives in the cloud and can connect to all your digital life."
        >
          {/* Vessel Types Preview */}
          <div className="mt-12 relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-10 mx-4">
              <h3 className="text-2xl font-bold text-center mb-10 text-purple-800">
                A Vessel for Every Aura
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 text-center max-w-7xl mx-auto">
                {[
                  { key: 'digital', available: true },
                  { key: 'terra', available: false },
                  { key: 'companion', available: false },
                  { key: 'memory', available: false }
                ].map(({ key, available }) => {
                  const config = VESSEL_TYPE_CONFIG[key as keyof typeof VESSEL_TYPE_CONFIG]
                  if (!config) return null
                  
                  return (
                    <div key={key} className="space-y-3 relative">
                      {/* Coming Soon Badge for non-digital vessels */}
                      {!available && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5">
                            Coming Soon
                          </Badge>
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "w-16 h-16 mx-auto bg-gradient-to-r rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all duration-300",
                          available ? config.color : "from-gray-400 to-gray-500",
                          available && "hover:scale-110 cursor-pointer"
                        )}
                        onClick={available ? () => router.push('/auras/create-select') : undefined}
                      >
                        {config.icon}
                      </div>
                      <h3 className={cn(
                        "font-semibold",
                        available ? "text-purple-700" : "text-gray-500"
                      )}>
                        {config.name}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        available ? "text-gray-600" : "text-gray-400"
                      )}>
                        {config.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auras.map((aura) => {
            const config = VESSEL_TYPE_CONFIG[aura.vesselType]
            
            return (
              <div 
                key={aura.id} 
                className="group relative bg-white rounded-3xl border-2 border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Enhanced Aura Card */}
                <div className={cn(
                  "relative p-6 bg-gradient-to-br",
                  config?.bgColor || "from-gray-50 to-gray-100"
                )}>
                  {/* Vessel Type Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white shadow-md",
                      config?.color || "from-gray-500 to-gray-600"
                    )}>
                      {config?.icon} {config?.name || aura.vesselType}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 left-4">
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      aura.enabled 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        aura.enabled ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      )} />
                      {aura.enabled ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {/* Avatar & Name */}
                  <div className="text-center pt-8 pb-4">
                    <div className="text-6xl mb-4 bg-white/70 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      {aura.avatar || config?.icon || '✨'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 truncate px-2" title={aura.name}>{aura.name}</h3>
                    <p className="text-sm text-gray-600">
                      {countAuraSenses(aura)} senses • {aura.rules?.length || 0} rules
                    </p>
                  </div>

                  {/* Senses Preview */}
                  <div className="mb-4 min-h-[60px] flex items-center justify-center px-2">
                    {(() => {
                      const allSenses = getAllAuraSenses(aura)
                      return allSenses.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {allSenses.slice(0, 4).map((sense, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white/70 text-gray-700 px-2 py-1 rounded-full"
                            >
                              {sense.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {allSenses.length > 4 && (
                            <span className="text-xs bg-white/70 text-gray-700 px-2 py-1 rounded-full">
                              +{allSenses.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-500">
                          <p className="mb-2">No senses added yet.</p>
                          <Link href={`/auras/${aura.id}/edit-select`} className="inline-flex items-center gap-1 text-purple-600 hover:underline font-semibold">
                            <Plus className="w-3 h-3" />
                            Add Senses
                          </Link>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => router.push(`/auras/${aura.id}`)}
                      disabled={!aura.enabled}
                      className={cn(
                        "shadow-md flex-1",
                        aura.enabled
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      )}
                      title={aura.enabled ? "Chat with this aura" : "Activate aura to enable chat"}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>

                {/* Management Controls */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Last active: {new Date(aura.updatedAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/auras/${aura.id}/edit-select`)}
                        className="hover:bg-purple-50 hover:text-purple-600"
                        title="Edit Aura"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(aura)}
                        className="hover:bg-red-50 hover:text-red-600"
                        title="Delete Aura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Activation Toggle */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Power className={cn("w-4 h-4", aura.enabled ? "text-green-600" : "text-gray-400")} />
                      <span className="text-sm font-medium text-gray-700">
                        {aura.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Switch
                      checked={aura.enabled}
                      onCheckedChange={(enabled) => handleToggleEnabled(aura, enabled)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            )
          })}
        </div>
      )}

      {/* Enhanced Footer CTA */}
      {auras.length > 0 && (
        <div className="mt-16">
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-3xl p-8 text-white text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Expand Your Collection?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Your journey with AI companions is just beginning. Explore new possibilities!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Temporarily bypassed SubscriptionGuard - same issue as other pages */}
                <div>
                  <Button
                    onClick={() => router.push('/auras/create-select')}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg px-8 h-12 w-full sm:w-auto"
                    data-help="create-aura-button"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Another Aura
                  </Button>
                </div>
                <div className="relative">
                  <Button
                    size="lg"
                    variant="outline"
                    disabled
                    className="border-2 border-white text-gray-400 cursor-not-allowed px-8 h-12"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Browse Vessels
                  </Button>
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5">
                    Coming Soon
                  </Badge>
                </div>
              </div>
              <div className="mt-6 text-sm opacity-75">
                ✨ Join thousands creating magical AI relationships
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Aura"
        description={`Are you sure you want to delete "${auraToDelete?.name}"? This action cannot be undone. Messages, rules and any senses not connected to other Auras will be lost.`}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        deactivateText="Just Deactivate"
        onConfirm={handleDeleteConfirm}
        onDeactivate={handleDeactivateConfirm}
        variant="destructive"
      />

      {/* Subscription Limit Dialog */}
      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-left">Active Aura Limit Reached</DialogTitle>
              </div>
            </div>
          </DialogHeader>
          <DialogDescription className="text-left mt-2">
            {limitErrorMessage}
          </DialogDescription>
          
          <div className="mt-4 text-sm text-gray-600">
            To activate this aura, you can:
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-purple-700">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Deactivate or delete another aura</p>
                <p className="text-sm text-gray-600">Free up a slot by deactivating or deleting one of your currently active auras</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-px h-8 bg-gray-200 ml-3"></div>
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-purple-700">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Upgrade your plan</p>
                <p className="text-sm text-gray-600">Get more active aura slots with a higher tier plan</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setLimitDialogOpen(false)}
            >
              Got it
            </Button>
            <Button
              onClick={() => router.push('/subscription')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}