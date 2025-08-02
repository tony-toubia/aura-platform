// apps/web/components/help/floating-help-widget.tsx

"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  MessageCircle,
  BookOpen,
  Lightbulb,
  Play,
  Settings,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Target,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContextualHelp } from './contextual-help-provider'

export function FloatingHelpWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { 
    toggleHelpMode, 
    startTour, 
    getRecommendedTips, 
    showTip, 
    userProgress,
    isHelpMode 
  } = useContextualHelp()
  
  const recommendedTips = getRecommendedTips()
  const hasRecommendations = recommendedTips.length > 0

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Help Panel */}
      {isExpanded && (
        <Card className="mb-4 w-80 shadow-xl border-2 border-purple-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Need Help?</h3>
                <p className="text-xs text-gray-600">Get guidance and tips</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              {/* Start Tour */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => startTour('first-time-user')}
                className="w-full justify-start gap-2 h-10"
              >
                <Play className="w-4 h-4 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">Take a Tour</div>
                  <div className="text-xs text-gray-500">First-time user walkthrough</div>
                </div>
              </Button>

              {/* Browse All Help */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleHelpMode}
                className="w-full justify-start gap-2 h-10"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">Browse Help</div>
                  <div className="text-xs text-gray-500">All tips and guides</div>
                </div>
              </Button>

              {/* Rule Builder Help */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => startTour('rule-builder-mastery')}
                className="w-full justify-start gap-2 h-10"
              >
                <Zap className="w-4 h-4 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">Rule Builder Guide</div>
                  <div className="text-xs text-gray-500">Master advanced rules</div>
                </div>
              </Button>
            </div>

            {/* Recommended Tips */}
            {hasRecommendations && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4 text-orange-500" />
                  Recommended for You
                </h4>
                <div className="space-y-2">
                  {recommendedTips.slice(0, 2).map((tip) => (
                    <button
                      key={tip.id}
                      onClick={() => {
                        showTip(tip.id)
                        setIsExpanded(false)
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-purple-50 transition-colors border border-gray-200 hover:border-purple-300"
                    >
                      <div className="font-medium text-xs text-gray-900">{tip.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {tip.content.slice(0, 60)}...
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {tip.difficulty}
                        </Badge>
                        {tip.estimatedReadTime && (
                          <span className="text-xs text-gray-500">{tip.estimatedReadTime}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{userProgress.completedTips.length} tips completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (userProgress.completedTips.length / 10) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Help Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
          "border-2 border-white",
          isExpanded && "rotate-180",
          isHelpMode && "ring-4 ring-purple-300 ring-opacity-50"
        )}
      >
        {isExpanded ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <HelpCircle className="w-6 h-6 text-white" />
            {hasRecommendations && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            )}
          </div>
        )}
      </Button>

      {/* Pulsing animation for new users */}
      {userProgress.completedTips.length === 0 && !isExpanded && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-ping opacity-20" />
      )}
    </div>
  )
}