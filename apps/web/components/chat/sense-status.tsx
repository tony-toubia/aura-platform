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
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
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

  if (isMobile) {
    // Mobile-optimized layout
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-white/90 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            Live Awareness
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-6 px-2 text-white hover:bg-white/20"
          >
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {senses.map(senseId => {
            const config = SENSE_CONFIG[senseId as keyof typeof SENSE_CONFIG]
            if (!config) return null

            const data = senseData[senseId]
            if (!data) return null

            const Icon = config.icon

            const getValue = () => {
              switch (senseId) {
                case 'weather':
                  if (data.main?.temp) {
                    return `${Math.round(data.main.temp)}°C`
                  }
                  if (data.temperature) {
                    return `${data.temperature}°C`
                  }
                  return 'Loading...'
                
                case 'soil_moisture':
                  return `${Math.round(data)}%`
                
                case 'light_level':
                  return `${Math.round(data)} lux`
                
                case 'news':
                  return `${(data.articles as NewsArticle[])?.length || 0} new`
                
                case 'air_quality':
                  return `AQI ${data.aqi || 'N/A'}`
                
                case 'wildlife':
                  return `${data.activity || 'N/A'}%`
                
                default:
                  return 'N/A'
              }
            }

            return (
              <div
                key={senseId}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg"
              >
                <Icon className="w-4 h-4 text-white/80" />
                <div className="text-xs text-white">
                  <div className="font-medium">{config.label}</div>
                  <div className="opacity-80">{getValue()}</div>
                </div>
              </div>
            )
          })}
        </div>

        {Object.keys(senseData).length === 0 && (
          <div className="text-center py-2 text-white/60">
            <AlertCircle className="w-4 h-4 mx-auto mb-1 opacity-50" />
            <p className="text-xs">No sense data available</p>
          </div>
        )}
      </div>
    )
  }

  // Desktop layout
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