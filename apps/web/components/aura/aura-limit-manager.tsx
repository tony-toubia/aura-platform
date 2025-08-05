'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Crown,
  Power,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuraLimitStatus {
  currentCount: number
  maxAllowed: number
  isOverLimit: boolean
  excessCount: number
  disabledAuras: string[]
}

interface DisabledAura {
  id: string
  name: string
  created_at: string
  updated_at: string
}

interface PrioritySuggestion {
  id: string
  name: string
  enabled: boolean
  priorityScore: number
  senseCount: number
  ruleCount: number
  daysSinceUpdate: number
  created_at: string
  updated_at: string
}

interface AuraLimitData {
  status: AuraLimitStatus
  disabledAuras: DisabledAura[]
  prioritySuggestions: PrioritySuggestion[]
}

interface AuraLimitManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuraToggled?: () => void
}

export function AuraLimitManager({ open, onOpenChange, onAuraToggled }: AuraLimitManagerProps) {
  const router = useRouter()
  const [data, setData] = useState<AuraLimitData | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchLimitData()
    }
  }, [open])

  const fetchLimitData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auras/limit-management')
      if (response.ok) {
        const limitData = await response.json()
        setData(limitData)
      }
    } catch (error) {
      console.error('Failed to fetch limit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAura = async (auraId: string, enabled: boolean) => {
    setActionLoading(auraId)
    try {
      const response = await fetch('/api/auras/limit-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: enabled ? 'enable' : 'disable',
          auraId
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        await fetchLimitData() // Refresh data
        onAuraToggled?.() // Notify parent component
      } else {
        const error = await response.json()
        console.error('Failed to toggle aura:', error.error)
      }
    } catch (error) {
      console.error('Error toggling aura:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getPriorityBadge = (score: number) => {
    if (score >= 40) return { label: 'High Priority', color: 'bg-green-100 text-green-800' }
    if (score >= 20) return { label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Low Priority', color: 'bg-gray-100 text-gray-800' }
  }

  const getActivityStatus = (daysSinceUpdate: number) => {
    if (daysSinceUpdate <= 7) return { label: 'Recently Active', icon: TrendingUp, color: 'text-green-600' }
    if (daysSinceUpdate <= 30) return { label: 'Moderately Active', icon: Clock, color: 'text-yellow-600' }
    return { label: 'Inactive', icon: XCircle, color: 'text-gray-500' }
  }

  if (loading || !data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Aura Management</DialogTitle>
            <DialogDescription>
              Please wait while we load your aura information...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const { status, disabledAuras, prioritySuggestions } = data
  const enabledAuras = prioritySuggestions.filter(a => a.enabled)
  const disabledAurasList = prioritySuggestions.filter(a => !a.enabled)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              status.isOverLimit ? "bg-red-100" : "bg-blue-100"
            )}>
              {status.isOverLimit ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">
                {status.isOverLimit ? 'Aura Limit Exceeded' : 'Aura Management'}
              </DialogTitle>
              <DialogDescription className="text-left mt-1">
                {status.maxAllowed === -1 
                  ? `You have unlimited auras with your current plan`
                  : `You have ${status.currentCount} of ${status.maxAllowed} auras active`
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{status.currentCount}</div>
                  <div className="text-sm text-gray-600">Active Auras</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {status.maxAllowed === -1 ? '∞' : status.maxAllowed}
                  </div>
                  <div className="text-sm text-gray-600">Max Allowed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{disabledAurasList.length}</div>
                  <div className="text-sm text-gray-600">Disabled</div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    status.isOverLimit ? "text-red-600" : "text-green-600"
                  )}>
                    {status.isOverLimit ? status.excessCount : '✓'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.isOverLimit ? 'Over Limit' : 'Within Limit'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Auras */}
          {enabledAuras.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Power className="w-5 h-5 text-green-600" />
                  Active Auras ({enabledAuras.length})
                </CardTitle>
                <CardDescription>
                  These auras are currently active and count toward your subscription limit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enabledAuras.map((aura) => {
                    const priority = getPriorityBadge(aura.priorityScore)
                    const activity = getActivityStatus(aura.daysSinceUpdate)
                    
                    return (
                      <div key={aura.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-medium truncate">{aura.name}</h4>
                              <Badge className={priority.color}>{priority.label}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Switch
                              checked={true}
                              onCheckedChange={(enabled) => handleToggleAura(aura.id, enabled)}
                              disabled={actionLoading === aura.id}
                              className="data-[state=checked]:bg-green-500"
                            />
                            {actionLoading === aura.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <activity.icon className={cn("w-4 h-4", activity.color)} />
                            <span className="hidden sm:inline">{activity.label}</span>
                            <span className="sm:hidden">{activity.label.split(' ')[0]}</span>
                          </div>
                          <span>{aura.senseCount} senses</span>
                          <span>{aura.ruleCount} rules</span>
                          <span className="hidden sm:inline">Updated {aura.daysSinceUpdate}d ago</span>
                          <span className="sm:hidden">{aura.daysSinceUpdate}d ago</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disabled Auras */}
          {disabledAurasList.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-gray-500" />
                  Disabled Auras ({disabledAurasList.length})
                </CardTitle>
                <CardDescription>
                  These auras are disabled and don't count toward your limit. Enable them if you have available slots.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {disabledAurasList.map((aura) => {
                    const priority = getPriorityBadge(aura.priorityScore)
                    const activity = getActivityStatus(aura.daysSinceUpdate)
                    const canEnable = status.currentCount < status.maxAllowed || status.maxAllowed === -1
                    
                    return (
                      <div key={aura.id} className="border rounded-lg bg-gray-50 p-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-medium text-gray-700 truncate">{aura.name}</h4>
                              <Badge className={priority.color}>{priority.label}</Badge>
                              {!canEnable && (
                                <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                                  Limit Reached
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Switch
                              checked={false}
                              onCheckedChange={(enabled) => handleToggleAura(aura.id, enabled)}
                              disabled={!canEnable || actionLoading === aura.id}
                              className="data-[state=checked]:bg-green-500"
                            />
                            {actionLoading === aura.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <activity.icon className={cn("w-4 h-4", activity.color)} />
                            <span className="hidden sm:inline">{activity.label}</span>
                            <span className="sm:hidden">{activity.label.split(' ')[0]}</span>
                          </div>
                          <span>{aura.senseCount} senses</span>
                          <span>{aura.ruleCount} rules</span>
                          <span className="hidden sm:inline">Updated {aura.daysSinceUpdate}d ago</span>
                          <span className="sm:hidden">{aura.daysSinceUpdate}d ago</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Prompt */}
          {status.isOverLimit && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-purple-800 mb-2">
                    Need More Active Auras?
                  </h3>
                  <p className="text-purple-700 mb-6">
                    Upgrade your plan to activate more auras simultaneously and unlock additional features.
                  </p>
                  <Button
                    onClick={() => router.push('/subscription')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    View Upgrade Options
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}