// apps/web/components/aura/aura-card.tsx

"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, BarChart3, Download, Trash2 } from 'lucide-react'
import { AURA_CARD_CONFIG } from '@/lib/constants/aura'
import { VESSEL_TYPE_CONFIG } from '@/lib/vessel-config'
import { cn } from '@/lib/utils'
import type { AuraCardProps } from '@/types/components'

export function AuraCard({ aura, onDelete, onExport, onEdit, className }: AuraCardProps) {
  const router = useRouter()
  const vesselConfig = VESSEL_TYPE_CONFIG[aura.vesselType] || {
    name: aura.vesselType,
    color: 'from-gray-500 to-gray-600'
  }

  const handleExport = () => {
    if (onExport) {
      onExport(aura.id)
    } else {
      console.log('Export', aura.id)
    }
  }

  const renderSenseTag = (senseId: string, index: number) => {
    const isVisible = index < AURA_CARD_CONFIG.maxVisibleSenses
    
    if (!isVisible && index === AURA_CARD_CONFIG.maxVisibleSenses) {
      const remaining = aura.senses.length - AURA_CARD_CONFIG.maxVisibleSenses
      return (
        <div
          key="more"
          className={`${AURA_CARD_CONFIG.gradients.moreIndicator} px-3 py-1 rounded-full text-xs`}
        >
          +{remaining} more
        </div>
      )
    }
    
    if (!isVisible) return null
    
    return (
      <div
        key={senseId}
        className={`${AURA_CARD_CONFIG.gradients.sense} px-3 py-1 rounded-full text-xs`}
      >
        {senseId.replace(/_/g, ' ')}
      </div>
    )
  }

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      <CardHeader className={`bg-gradient-to-r ${AURA_CARD_CONFIG.gradients.header}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{aura.avatar}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate" title={aura.name}>{aura.name}</h3>
              <p className="text-sm text-muted-foreground">{vesselConfig.name}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              title="Export Aura"
            >
              <Download className="w-4 h-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(aura.id)}
                title="Delete Aura"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Active Senses
            </div>
            <div className="flex flex-wrap gap-2">
              {aura.senses.map((senseId, index) => renderSenseTag(senseId, index))}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <div className={`flex items-center gap-2 ${aura.enabled ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${aura.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {aura.enabled ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Rules Count */}
          {aura.rules && aura.rules.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rules</span>
              <span className="font-medium">{aura.rules.length} active</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex space-x-2">
        <Button
          className="flex-1"
          onClick={() => router.push(`/auras/${aura.id}`)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Interact
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/auras/${aura.id}/analytics`)}
          title="View Analytics"
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}