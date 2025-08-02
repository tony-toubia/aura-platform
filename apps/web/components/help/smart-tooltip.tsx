// apps/web/components/help/smart-tooltip.tsx

"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  X,
  Lightbulb,
  ExternalLink,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContextualHelp } from './contextual-help-provider'

interface SmartTooltipProps {
  children: React.ReactNode
  helpId?: string
  title?: string
  content?: string
  category?: 'info' | 'tip' | 'warning' | 'success'
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  trigger?: 'hover' | 'click' | 'focus'
  showOnce?: boolean
  delay?: number
  className?: string
  disabled?: boolean
}

export function SmartTooltip({
  children,
  helpId,
  title,
  content,
  category = 'info',
  position = 'auto',
  trigger = 'hover',
  showOnce = false,
  delay = 500,
  className,
  disabled = false
}: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const helpContext = useContextualHelp()

  // Get help tip if helpId is provided
  const helpTip = helpId ? helpContext.availableTips.find(tip => tip.id === helpId) : null
  const shouldShowHelp = helpId ? helpContext.shouldShowTip(helpId) : true

  // Use help tip content if available, otherwise use props
  const displayTitle = helpTip?.title || title
  const displayContent = helpTip?.content || content

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      let newPosition = position

      if (position === 'auto') {
        // Auto-determine best position
        const spaceTop = triggerRect.top
        const spaceBottom = viewport.height - triggerRect.bottom
        const spaceLeft = triggerRect.left
        const spaceRight = viewport.width - triggerRect.right

        if (spaceBottom >= tooltipRect.height + 10) {
          newPosition = 'bottom'
        } else if (spaceTop >= tooltipRect.height + 10) {
          newPosition = 'top'
        } else if (spaceRight >= tooltipRect.width + 10) {
          newPosition = 'right'
        } else if (spaceLeft >= tooltipRect.width + 10) {
          newPosition = 'left'
        } else {
          newPosition = 'bottom' // Default fallback
        }
      }

      setActualPosition(newPosition)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [isVisible, position])

  const showTooltip = () => {
    if (disabled || !shouldShowHelp) return
    
    if (showOnce && helpId && helpContext.userProgress.completedTips.includes(helpId)) {
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, trigger === 'hover' ? delay : 0)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const handleMarkCompleted = () => {
    if (helpId) {
      helpContext.markTipCompleted(helpId)
    }
    hideTooltip()
  }

  const handleTriggerEvent = (eventType: string) => {
    if (trigger === eventType) {
      if (eventType === 'click') {
        setIsVisible(!isVisible)
      } else {
        showTooltip()
      }
    }
  }

  const getCategoryIcon = () => {
    switch (category) {
      case 'tip': return <Lightbulb className="w-4 h-4 text-yellow-600" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      default: return <Info className="w-4 h-4 text-blue-600" />
    }
  }

  const getCategoryColors = () => {
    switch (category) {
      case 'tip': return 'border-yellow-200 bg-yellow-50'
      case 'warning': return 'border-orange-200 bg-orange-50'
      case 'success': return 'border-green-200 bg-green-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const getTooltipPosition = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
    }
  }

  const getArrowPosition = () => {
    switch (actualPosition) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-white border-l-4 border-r-4 border-t-4'
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-white border-l-4 border-r-4 border-b-4'
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-white border-t-4 border-b-4 border-l-4'
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-white border-t-4 border-b-4 border-r-4'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-white border-l-4 border-r-4 border-b-4'
    }
  }

  if (!displayContent) return <>{children}</>

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        ref={triggerRef}
        onMouseEnter={() => handleTriggerEvent('hover')}
        onMouseLeave={() => trigger === 'hover' && hideTooltip()}
        onClick={() => handleTriggerEvent('click')}
        onFocus={() => handleTriggerEvent('focus')}
        onBlur={() => trigger === 'focus' && hideTooltip()}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <>
          {/* Backdrop for click-triggered tooltips */}
          {trigger === 'click' && (
            <div
              className="fixed inset-0 z-40"
              onClick={hideTooltip}
            />
          )}

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={cn(
              "absolute z-50 w-80 max-w-sm",
              getTooltipPosition()
            )}
          >
            {/* Arrow */}
            <div className={cn("absolute w-0 h-0", getArrowPosition())} />
            
            {/* Content */}
            <Card className={cn("shadow-lg border-2", getCategoryColors())}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon()}
                    {displayTitle && (
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {displayTitle}
                      </h4>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={hideTooltip}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {displayContent}
                </p>

                {helpTip && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {helpTip.difficulty}
                      </Badge>
                      {helpTip.estimatedReadTime && (
                        <span className="text-xs text-gray-500">
                          {helpTip.estimatedReadTime}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={handleMarkCompleted}
                      className="h-7 px-3 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Got it
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

// Convenience component for help icons
export function HelpIcon({
  helpId,
  title,
  content,
  category = 'info',
  className
}: {
  helpId?: string
  title?: string
  content?: string
  category?: 'info' | 'tip' | 'warning' | 'success'
  className?: string
}) {
  return (
    <SmartTooltip
      helpId={helpId}
      title={title}
      content={content}
      category={category}
      trigger="hover"
      position="auto"
      className={className}
    >
      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
    </SmartTooltip>
  )
}

// Component for inline help text with expandable details
export function InlineHelp({
  children,
  helpId,
  title,
  content,
  expandable = true
}: {
  children: React.ReactNode
  helpId?: string
  title?: string
  content?: string
  expandable?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const helpContext = useContextualHelp()
  
  const helpTip = helpId ? helpContext.availableTips.find(tip => tip.id === helpId) : null
  const displayContent = helpTip?.content || content

  if (!displayContent) return <>{children}</>

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {children}
        {expandable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
          >
            <BookOpen className="w-3 h-3 mr-1" />
            {isExpanded ? 'Less' : 'More'}
          </Button>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 leading-relaxed">
            {displayContent}
          </p>
          {helpTip && (
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                {helpTip.difficulty}
              </Badge>
              <Button
                size="sm"
                onClick={() => {
                  helpContext.markTipCompleted(helpTip.id)
                  setIsExpanded(false)
                }}
                className="h-6 px-2 text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Got it
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}