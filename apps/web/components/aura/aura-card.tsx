// apps/web/components/aura/aura-card.tsx


"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, BarChart3, Download, Trash2 } from 'lucide-react'
import type { Aura } from '@/types'

interface AuraCardProps {
  aura: Aura
  onDelete?: (id: string) => void
}

export function AuraCard({ aura, onDelete }: AuraCardProps) {
  const router = useRouter()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{aura.avatar}</div>
            <div>
              <h3 className="font-bold text-lg">{aura.name}</h3>
              <p className="text-sm text-muted-foreground">{aura.vesselType}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => console.log('Export', aura.id)}
            >
              <Download className="w-4 h-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(aura.id)}
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
              {aura.senses.slice(0, 3).map((senseId) => (
                <div
                  key={senseId}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs"
                >
                  {senseId}
                </div>
              ))}
              {aura.senses.length > 3 && (
                <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs">
                  +{aura.senses.length - 3} more
                </div>
              )}
            </div>
          </div>
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
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}