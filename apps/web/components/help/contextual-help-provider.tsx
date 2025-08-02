// apps/web/components/help/contextual-help-provider.tsx

"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  BookOpen,
  Target,
  CheckCircle,
  Star,
  Zap,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpTip {
  id: string
  title: string
  content: string
  category: 'getting-started' | 'advanced' | 'troubleshooting' | 'best-practices'
  priority: 'low' | 'medium' | 'high'
  trigger: 'hover' | 'click' | 'auto' | 'focus'
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  element?: string // CSS selector
  showOnce?: boolean
  prerequisites?: string[]
  nextTips?: string[]
  estimatedReadTime?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

interface UserProgress {
  completedTips: string[]
  skippedTips: string[]
  currentTour?: string
  tourProgress: Record<string, number>
  preferences: {
    showTooltips: boolean
    autoAdvance: boolean
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }
}

interface HelpContextType {
  // State
  activeTip: HelpTip | null
  userProgress: UserProgress
  isHelpMode: boolean
  availableTips: HelpTip[]
  
  // Actions
  showTip: (tipId: string) => void
  hideTip: () => void
  markTipCompleted: (tipId: string) => void
  skipTip: (tipId: string) => void
  toggleHelpMode: () => void
  startTour: (tourId: string) => void
  nextTip: () => void
  previousTip: () => void
  updatePreferences: (preferences: Partial<UserProgress['preferences']>) => void
  
  // Utilities
  getTipsForElement: (elementId: string) => HelpTip[]
  shouldShowTip: (tipId: string) => boolean
  getRecommendedTips: () => HelpTip[]
}

const HelpContext = createContext<HelpContextType | null>(null)

const HELP_TIPS: HelpTip[] = [
  // Getting Started Tips
  {
    id: 'welcome-to-aura',
    title: 'Welcome to Aura Platform! 🎉',
    content: 'Aura Platform helps you create intelligent AI companions. Start by creating your first Aura using the unified creation wizard.',
    category: 'getting-started',
    priority: 'high',
    trigger: 'auto',
    position: 'bottom',
    difficulty: 'beginner',
    estimatedReadTime: '30 seconds',
    tags: ['welcome', 'overview'],
    nextTips: ['create-first-aura'],
    showOnce: true
  },
  {
    id: 'create-first-aura',
    title: 'Create Your First Aura',
    content: 'Click the "Create New Aura" button to start the guided creation process. You can choose between AI-guided setup or manual configuration.',
    category: 'getting-started',
    priority: 'high',
    trigger: 'hover',
    position: 'bottom',
    element: '[data-help="create-aura-button"]',
    difficulty: 'beginner',
    estimatedReadTime: '1 minute',
    tags: ['creation', 'getting-started'],
    prerequisites: ['welcome-to-aura'],
    nextTips: ['choose-vessel-type']
  },
  {
    id: 'choose-vessel-type',
    title: 'Understanding Vessel Types',
    content: 'Vessels determine how your Aura experiences the world. Digital vessels work anywhere, while physical vessels like Terra connect to environmental sensors.',
    category: 'getting-started',
    priority: 'medium',
    trigger: 'focus',
    position: 'right',
    element: '[data-help="vessel-selection"]',
    difficulty: 'beginner',
    estimatedReadTime: '45 seconds',
    tags: ['vessels', 'concepts'],
    prerequisites: ['create-first-aura']
  },
  
  // Rule Building Tips
  {
    id: 'understanding-rules',
    title: 'What are Behavior Rules?',
    content: 'Rules define how your Aura responds to different situations. They consist of triggers (when), conditions (if), and actions (then).',
    category: 'getting-started',
    priority: 'high',
    trigger: 'hover',
    position: 'top',
    element: '[data-help="rule-builder"]',
    difficulty: 'beginner',
    estimatedReadTime: '1 minute',
    tags: ['rules', 'concepts'],
    nextTips: ['rule-priority-system']
  },
  {
    id: 'rule-priority-system',
    title: 'Rule Priority System',
    content: 'Higher priority rules (8-10) execute first. Use high priority for important alerts and low priority (1-3) for casual interactions.',
    category: 'best-practices',
    priority: 'medium',
    trigger: 'hover',
    position: 'left',
    element: '[data-help="rule-priority"]',
    difficulty: 'intermediate',
    estimatedReadTime: '45 seconds',
    tags: ['rules', 'priority', 'best-practices'],
    prerequisites: ['understanding-rules']
  },
  {
    id: 'ai-vs-template-responses',
    title: 'AI vs Template Responses',
    content: 'AI responses are dynamic and contextual, while templates are consistent but can include variables. Choose AI for personality, templates for precision.',
    category: 'best-practices',
    priority: 'medium',
    trigger: 'click',
    position: 'bottom',
    element: '[data-help="response-type"]',
    difficulty: 'intermediate',
    estimatedReadTime: '1 minute',
    tags: ['responses', 'ai', 'templates'],
    prerequisites: ['understanding-rules']
  },
  
  // Advanced Tips
  {
    id: 'cooldown-strategies',
    title: 'Smart Cooldown Strategies',
    content: 'Use simple cooldowns for basic rules, frequency limits for recurring events, and adaptive cooldowns for context-sensitive responses.',
    category: 'advanced',
    priority: 'low',
    trigger: 'hover',
    position: 'top',
    element: '[data-help="cooldown-config"]',
    difficulty: 'advanced',
    estimatedReadTime: '2 minutes',
    tags: ['cooldowns', 'advanced', 'optimization'],
    prerequisites: ['rule-priority-system']
  },
  {
    id: 'sensor-combinations',
    title: 'Combining Multiple Sensors',
    content: 'Create powerful rules by combining data from multiple sensors. For example, use weather + calendar to suggest outfit changes for outdoor meetings.',
    category: 'advanced',
    priority: 'medium',
    trigger: 'click',
    position: 'right',
    difficulty: 'advanced',
    estimatedReadTime: '2 minutes',
    tags: ['sensors', 'combinations', 'advanced'],
    prerequisites: ['understanding-rules', 'choose-vessel-type']
  },
  
  // Troubleshooting Tips
  {
    id: 'rule-not-triggering',
    title: 'Rule Not Triggering?',
    content: 'Check: 1) Rule is enabled, 2) Sensor data is available, 3) Cooldown period has passed, 4) Priority conflicts with other rules.',
    category: 'troubleshooting',
    priority: 'high',
    trigger: 'click',
    position: 'auto',
    difficulty: 'intermediate',
    estimatedReadTime: '1 minute',
    tags: ['troubleshooting', 'debugging', 'rules']
  },
  {
    id: 'personality-not-showing',
    title: 'Personality Not Showing Through?',
    content: 'Ensure your AI response guidelines are detailed and include personality traits. Use response tones and mention specific quirks in your prompts.',
    category: 'troubleshooting',
    priority: 'medium',
    trigger: 'click',
    position: 'auto',
    difficulty: 'intermediate',
    estimatedReadTime: '1 minute',
    tags: ['troubleshooting', 'personality', 'ai']
  }
]

const HELP_TOURS = {
  'first-time-user': {
    name: 'First Time User Tour',
    description: 'Complete walkthrough for new users',
    tips: ['welcome-to-aura', 'create-first-aura', 'choose-vessel-type', 'understanding-rules']
  },
  'rule-builder-mastery': {
    name: 'Rule Builder Mastery',
    description: 'Learn advanced rule building techniques',
    tips: ['understanding-rules', 'rule-priority-system', 'ai-vs-template-responses', 'cooldown-strategies']
  }
}

export function ContextualHelpProvider({ children }: { children: React.ReactNode }) {
  const [activeTip, setActiveTip] = useState<HelpTip | null>(null)
  const [isHelpMode, setIsHelpMode] = useState(false)
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura-help-progress')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.warn('Failed to parse help progress:', e)
        }
      }
    }
    
    return {
      completedTips: [],
      skippedTips: [],
      tourProgress: {},
      preferences: {
        showTooltips: true,
        autoAdvance: false,
        difficulty: 'beginner'
      }
    }
  })

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura-help-progress', JSON.stringify(userProgress))
    }
  }, [userProgress])

  const showTip = useCallback((tipId: string) => {
    const tip = HELP_TIPS.find(t => t.id === tipId)
    if (tip && shouldShowTip(tipId)) {
      setActiveTip(tip)
    }
  }, [])

  const hideTip = useCallback(() => {
    setActiveTip(null)
  }, [])

  const markTipCompleted = useCallback((tipId: string) => {
    setUserProgress(prev => ({
      ...prev,
      completedTips: [...prev.completedTips.filter(id => id !== tipId), tipId]
    }))
    hideTip()
  }, [hideTip])

  const skipTip = useCallback((tipId: string) => {
    setUserProgress(prev => ({
      ...prev,
      skippedTips: [...prev.skippedTips.filter(id => id !== tipId), tipId]
    }))
    hideTip()
  }, [hideTip])

  const shouldShowTip = useCallback((tipId: string) => {
    const tip = HELP_TIPS.find(t => t.id === tipId)
    if (!tip) return false
    
    // Check if already completed or skipped
    if (userProgress.completedTips.includes(tipId) || userProgress.skippedTips.includes(tipId)) {
      return !tip.showOnce
    }
    
    // Check prerequisites
    if (tip.prerequisites) {
      const hasPrerequisites = tip.prerequisites.every(prereq => 
        userProgress.completedTips.includes(prereq)
      )
      if (!hasPrerequisites) return false
    }
    
    // Check difficulty preference
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
    const userLevel = difficultyOrder[userProgress.preferences.difficulty]
    const tipLevel = difficultyOrder[tip.difficulty]
    
    return tipLevel <= userLevel + 1 // Allow one level above user's preference
  }, [userProgress])

  const getTipsForElement = useCallback((elementId: string) => {
    return HELP_TIPS.filter(tip => tip.element === elementId && shouldShowTip(tip.id))
  }, [shouldShowTip])

  const getRecommendedTips = useCallback(() => {
    return HELP_TIPS
      .filter(tip => shouldShowTip(tip.id))
      .filter(tip => tip.priority === 'high' || tip.category === 'getting-started')
      .slice(0, 5)
  }, [shouldShowTip])

  const toggleHelpMode = useCallback(() => {
    setIsHelpMode(prev => !prev)
  }, [])

  const startTour = useCallback((tourId: string) => {
    const tour = HELP_TOURS[tourId as keyof typeof HELP_TOURS]
    if (tour && tour.tips.length > 0) {
      setUserProgress(prev => ({
        ...prev,
        currentTour: tourId,
        tourProgress: { ...prev.tourProgress, [tourId]: 0 }
      }))
      showTip(tour.tips[0]!)
    }
  }, [showTip])

  const nextTip = useCallback(() => {
    if (!activeTip || !userProgress.currentTour) return
    
    const tour = HELP_TOURS[userProgress.currentTour as keyof typeof HELP_TOURS]
    if (!tour) return
    
    const currentIndex = userProgress.tourProgress[userProgress.currentTour] || 0
    const nextIndex = currentIndex + 1
    
    if (nextIndex < tour.tips.length) {
      setUserProgress(prev => ({
        ...prev,
        tourProgress: { ...prev.tourProgress, [userProgress.currentTour!]: nextIndex }
      }))
      showTip(tour.tips[nextIndex]!)
    } else {
      // Tour completed
      setUserProgress(prev => ({
        ...prev,
        currentTour: undefined
      }))
      hideTip()
    }
  }, [activeTip, userProgress.currentTour, userProgress.tourProgress, showTip, hideTip])

  const previousTip = useCallback(() => {
    if (!activeTip || !userProgress.currentTour) return
    
    const currentIndex = userProgress.tourProgress[userProgress.currentTour] || 0
    const prevIndex = currentIndex - 1
    
    if (prevIndex >= 0) {
      const tour = HELP_TOURS[userProgress.currentTour as keyof typeof HELP_TOURS]
      if (tour) {
        setUserProgress(prev => ({
          ...prev,
          tourProgress: { ...prev.tourProgress, [userProgress.currentTour!]: prevIndex }
        }))
        showTip(tour.tips[prevIndex]!)
      }
    }
  }, [activeTip, userProgress.currentTour, userProgress.tourProgress, showTip])

  const updatePreferences = useCallback((preferences: Partial<UserProgress['preferences']>) => {
    setUserProgress(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences }
    }))
  }, [])

  const contextValue: HelpContextType = {
    activeTip,
    userProgress,
    isHelpMode,
    availableTips: HELP_TIPS,
    showTip,
    hideTip,
    markTipCompleted,
    skipTip,
    toggleHelpMode,
    startTour,
    nextTip,
    previousTip,
    updatePreferences,
    getTipsForElement,
    shouldShowTip,
    getRecommendedTips
  }

  return (
    <HelpContext.Provider value={contextValue}>
      {children}
      {activeTip && <HelpTooltip tip={activeTip} />}
      {isHelpMode && <HelpOverlay />}
    </HelpContext.Provider>
  )
}

function HelpTooltip({ tip }: { tip: HelpTip }) {
  const helpContext = useContext(HelpContext)
  if (!helpContext) return null

  const { markTipCompleted, skipTip, nextTip, previousTip, userProgress } = helpContext
  const isInTour = !!userProgress.currentTour
  const tourInfo = userProgress.currentTour ? HELP_TOURS[userProgress.currentTour as keyof typeof HELP_TOURS] : null
  const tourProgress = userProgress.currentTour ? userProgress.tourProgress[userProgress.currentTour] || 0 : 0

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute top-4 right-4 pointer-events-auto">
        <Card className="w-80 shadow-xl border-2 border-purple-200 bg-white">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
                  {tip.estimatedReadTime && (
                    <div className="text-xs text-gray-500">{tip.estimatedReadTime}</div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTip(tip.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tour Progress */}
            {isInTour && tourInfo && (
              <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between text-xs text-purple-700 mb-1">
                  <span>{tourInfo.name}</span>
                  <span>{tourProgress + 1} of {tourInfo.tips.length}</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-1">
                  <div 
                    className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((tourProgress + 1) / tourInfo.tips.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {tip.content}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={getDifficultyColor(tip.difficulty)}>
                {tip.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tip.category.replace('-', ' ')}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isInTour && tourProgress > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousTip}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => skipTip(tip.id)}
                  className="h-8 px-3 text-xs"
                >
                  Skip
                </Button>
                {isInTour ? (
                  <Button
                    size="sm"
                    onClick={nextTip}
                    className="h-8 px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {tourProgress + 1 < tourInfo!.tips.length ? (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Finish
                        <CheckCircle className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => markTipCompleted(tip.id)}
                    className="h-8 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Got it
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HelpOverlay() {
  const helpContext = useContext(HelpContext)
  if (!helpContext) return null

  const { toggleHelpMode, getRecommendedTips, startTour, userProgress } = helpContext
  const recommendedTips = getRecommendedTips()

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              Help & Guidance
            </h2>
            <Button variant="outline" onClick={toggleHelpMode}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Quick Tours */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Tours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(HELP_TOURS).map(([tourId, tour]) => (
                <Card key={tourId} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-1">{tour.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{tour.description}</p>
                    <Button
                      size="sm"
                      onClick={() => startTour(tourId)}
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Tour
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommended Tips */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Recommended for You</h3>
            <div className="space-y-2">
              {recommendedTips.map((tip) => (
                <div
                  key={tip.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                  onClick={() => {
                    helpContext.showTip(tip.id)
                    toggleHelpMode()
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                      <p className="text-xs text-gray-600">{tip.content.slice(0, 100)}...</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Your Progress</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{userProgress.completedTips.length}</div>
                <div className="text-xs text-gray-600">Tips Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {Object.keys(userProgress.tourProgress).length}
                </div>
                <div className="text-xs text-gray-600">Tours Started</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {userProgress.preferences.difficulty}
                </div>
                <div className="text-xs text-gray-600">Skill Level</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function useContextualHelp() {
  const context = useContext(HelpContext)
  if (!context) {
    throw new Error('useContextualHelp must be used within a ContextualHelpProvider')
  }
  return context
}