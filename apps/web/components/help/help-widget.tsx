// apps/web/components/help/help-widget.tsx

"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  HelpCircle,
  Search,
  BookOpen,
  Lightbulb,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Target,
  Zap,
  Settings,
  Play,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContextualHelp } from './contextual-help-provider'

interface HelpWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  showQuickTips?: boolean
  showSearch?: boolean
  showTours?: boolean
  className?: string
}

export function HelpWidget({
  position = 'bottom-right',
  showQuickTips = true,
  showSearch = true,
  showTours = true,
  className
}: HelpWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'tips' | 'search' | 'tours'>('tips')
  const [searchTerm, setSearchTerm] = useState('')
  
  const helpContext = useContextualHelp()
  const { 
    getRecommendedTips, 
    availableTips, 
    showTip, 
    startTour, 
    userProgress,
    toggleHelpMode 
  } = helpContext

  const recommendedTips = getRecommendedTips()
  
  const filteredTips = searchTerm 
    ? availableTips.filter(tip => 
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : []

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      default:
        return 'bottom-4 right-4'
    }
  }

  const tours = [
    {
      id: 'first-time-user',
      name: 'Getting Started',
      description: 'Perfect for new users',
      icon: Star,
      estimatedTime: '5 minutes',
      difficulty: 'beginner'
    },
    {
      id: 'rule-builder-mastery',
      name: 'Rule Builder Mastery',
      description: 'Advanced rule techniques',
      icon: Zap,
      estimatedTime: '8 minutes',
      difficulty: 'intermediate'
    }
  ]

  if (!isExpanded) {
    return (
      <div className={cn("fixed z-50", getPositionClasses(), className)}>
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-110 transition-all duration-200"
        >
          <HelpCircle className="w-6 h-6 text-white" />
        </Button>
        
        {/* Notification badge for new tips */}
        {recommendedTips.length > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{recommendedTips.length}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("fixed z-50", getPositionClasses(), className)}>
      <Card className="w-80 max-h-96 shadow-xl border-2 border-purple-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              Help & Tips
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>{userProgress.completedTips.length} completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-blue-500" />
              <span>{userProgress.preferences.difficulty} level</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {showQuickTips && (
              <button
                onClick={() => setActiveTab('tips')}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === 'tips'
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Lightbulb className="w-4 h-4 mx-auto mb-1" />
                Tips
              </button>
            )}
            {showSearch && (
              <button
                onClick={() => setActiveTab('search')}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === 'search'
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Search className="w-4 h-4 mx-auto mb-1" />
                Search
              </button>
            )}
            {showTours && (
              <button
                onClick={() => setActiveTab('tours')}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === 'tours'
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Play className="w-4 h-4 mx-auto mb-1" />
                Tours
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 max-h-64 overflow-y-auto">
            {activeTab === 'tips' && (
              <div className="space-y-3">
                {recommendedTips.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">You're all caught up!</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleHelpMode}
                      className="mt-2"
                    >
                      Browse All Tips
                    </Button>
                  </div>
                ) : (
                  recommendedTips.map((tip) => (
                    <div
                      key={tip.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                      onClick={() => {
                        showTip(tip.id)
                        setIsExpanded(false)
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                        <Badge variant="outline" className="text-xs ml-2">
                          {tip.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {tip.content.slice(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {tip.estimatedReadTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {tip.estimatedReadTime}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search help topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
                
                {searchTerm && (
                  <div className="space-y-2">
                    {filteredTips.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No tips found for "{searchTerm}"
                      </p>
                    ) : (
                      filteredTips.slice(0, 5).map((tip) => (
                        <div
                          key={tip.id}
                          className="p-2 border border-gray-200 rounded cursor-pointer hover:border-purple-300 transition-colors"
                          onClick={() => {
                            showTip(tip.id)
                            setIsExpanded(false)
                          }}
                        >
                          <h5 className="font-medium text-sm text-gray-900">{tip.title}</h5>
                          <p className="text-xs text-gray-600">{tip.content.slice(0, 60)}...</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tours' && (
              <div className="space-y-3">
                {tours.map((tour) => {
                  const Icon = tour.icon
                  return (
                    <div
                      key={tour.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                      onClick={() => {
                        startTour(tour.id)
                        setIsExpanded(false)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">{tour.name}</h4>
                          <p className="text-xs text-gray-600 mb-2">{tour.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {tour.difficulty}
                              </Badge>
                              <span className="text-xs text-gray-500">{tour.estimatedTime}</span>
                            </div>
                            <Play className="w-3 h-3 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toggleHelpMode()
                setIsExpanded(false)
              }}
              className="w-full text-xs"
            >
              <BookOpen className="w-3 h-3 mr-2" />
              Open Full Help Center
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Floating help button that can be placed anywhere
export function FloatingHelpButton({
  helpId,
  title,
  content,
  className
}: {
  helpId?: string
  title?: string
  content?: string
  className?: string
}) {
  const helpContext = useContextualHelp()

  const handleClick = () => {
    if (helpId) {
      helpContext.showTip(helpId)
    } else {
      helpContext.toggleHelpMode()
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        "w-8 h-8 p-0 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors",
        className
      )}
      title={title || "Get help"}
    >
      <HelpCircle className="w-4 h-4" />
    </Button>
  )
}

// Progress indicator for help completion
export function HelpProgress({ className }: { className?: string }) {
  const { userProgress, availableTips } = useContextualHelp()
  
  const totalTips = availableTips.filter(tip => tip.difficulty === userProgress.preferences.difficulty || tip.difficulty === 'beginner').length
  const completedTips = userProgress.completedTips.length
  const progressPercentage = totalTips > 0 ? (completedTips / totalTips) * 100 : 0

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Help Progress</span>
        <span className="text-gray-900 font-medium">{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">
        {completedTips} of {totalTips} tips completed
      </div>
    </div>
  )
}