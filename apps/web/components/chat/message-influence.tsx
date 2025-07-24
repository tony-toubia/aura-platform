// apps/web/components/chat/message-influence.tsx

"use client"

import React from 'react'
import { TrendingUp, CheckCircle, Sparkles, AlertCircle } from 'lucide-react'
import { INFLUENCE_CATEGORIES } from '@/lib/constants/chat'
import type { Message } from '@/types'

interface MessageInfluenceProps {
  message: Message
}

export function MessageInfluence({ message }: MessageInfluenceProps) {
  if (!message.metadata || message.role !== 'aura') return null

  const { metadata } = message

  const renderInfluenceSection = (
    influences: string[] | undefined,
    categoryKey: 'general' | 'sense' | 'personality'
  ) => {
    if (!influences || influences.length === 0) return null

    const category = INFLUENCE_CATEGORIES[categoryKey]!
    const SectionIcon = category.icon
    const ItemIcon    = categoryKey === 'general' ? TrendingUp
                      : categoryKey === 'sense'   ? CheckCircle
                      : Sparkles

    return (
      <div className={`${category.bgColor} border ${category.borderColor} rounded-lg p-3`}>
        <h5 className={`text-xs font-semibold ${category.textColor} mb-2 flex items-center gap-1`}>
          <SectionIcon className="w-3 h-3" />
          {category.title}
        </h5>
        <div className="space-y-1">
          {influences.map((inf: string, idx: number) => (
            <div key={idx} className={`flex items-center gap-2 text-xs ${category.iconColor}`}>
              <ItemIcon className="w-3 h-3" />
              <span>{inf}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      {renderInfluenceSection(metadata.influences, 'general')}
      {renderInfluenceSection(metadata.senseInfluences, 'sense')}
      {renderInfluenceSection(metadata.personalityFactors, 'personality')}
      
      {(() => {
        const errCat = INFLUENCE_CATEGORIES.error
        if (!metadata.isError || !errCat) return null

        const ErrorIcon = errCat.icon
        return (
          <div className={`${errCat.bgColor} border ${errCat.borderColor} rounded-lg p-3`}>
            <div className={`flex items-center gap-2 text-xs ${errCat.iconColor}`}>
              <ErrorIcon className="w-3 h-3" />
              <span>Connection error occurred</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}