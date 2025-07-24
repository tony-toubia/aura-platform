// apps/web/components/chat/sense-status.tsx

"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Brain, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SENSE_CONFIG } from '@/lib/constants/chat'
import type { NewsArticle } from '@/types'

interface SenseStatusProps {
  senses: string[]
  senseData: Record<string, any>
  isLoading: boolean
  onRefresh: () => void
}

export function SenseStatus({ senses, senseData, isLoading, onRefresh }: SenseStatusProps) {
  const renderSenseCard = (senseId: string) => {
    const config = SENSE_CONFIG[senseId as keyof typeof SENSE_CONFIG]
    if (!config) return null

    const data = senseData[senseId]
    if (!data) return null

    const Icon = config.icon

    const getValue = () => {
      switch (senseId) {
        case 'weather':
          if (data.main?.temp) {
            return `${Math.round(data.main.temp)}°C, ${data.weather?.[0]?.description || ''}`
          }
          if (data.temperature) {
            return `${data.temperature}°C, ${data.description || ''}`
          }
          return 'Loading...'
        
        case 'soil_moisture':
          return `${Math.round(data)}%`
        
        case 'light_level':
          return `${Math.round(data)} lux`
        
        case 'news':
          return `${(data.articles as NewsArticle[])?.length || 0} articles`
        
        case 'air_quality':
          return `AQI ${data.aqi || 'Unknown'}`
        
        case 'wildlife':
          return `Activity: ${data.activity || 'Unknown'}%`
        
        default:
          return 'N/A'
      }
    }

    return (
      <div
        key={senseId}
        className={cn(
          "flex items-center gap-3 bg-white/70 p-3 rounded-lg border",
          config.borderColor
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r",
          config.color
        )}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700">{config.label}</div>
          <div className="text-xs text-gray-600">{getValue()}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-purple-800 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Live Awareness
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="hover:bg-purple-100"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {senses.map(senseId => renderSenseCard(senseId))}
      </div>

      {Object.keys(senseData).length === 0 && (
        <div className="text-center py-2 text-gray-500">
          <AlertCircle className="w-5 h-5 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No sense data available</p>
        </div>
      )}
    </div>
  )
}