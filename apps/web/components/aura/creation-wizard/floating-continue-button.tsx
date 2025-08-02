// apps/web/components/aura/creation-wizard/floating-continue-button.tsx

"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingContinueButtonProps {
  show: boolean
  onContinue: () => void
  disabled?: boolean
  staticButtonSelector?: string // CSS selector for the static button to track
  label?: string
}

export function FloatingContinueButton({
  show,
  onContinue,
  disabled = false,
  staticButtonSelector = '[data-static-continue]',
  label = 'Continue'
}: FloatingContinueButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isStaticVisible, setIsStaticVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Only show if the condition is met and static button is not visible
    setIsVisible(show && !isStaticVisible && !disabled)
  }, [show, isStaticVisible, disabled])

  useEffect(() => {
    // Set up intersection observer to track static button visibility
    const findAndObserveButton = () => {
      const staticButton = document.querySelector(staticButtonSelector)
      
      if (staticButton) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            const entry = entries[0]
            if (entry) {
              // Button is considered visible if any part is in viewport
              // Use a more sensitive threshold to hide floating button earlier
              setIsStaticVisible(entry.intersectionRatio > 0.1)
            }
          },
          {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            rootMargin: '0px 0px -100px 0px' // Hide floating button when static is 100px from bottom
          }
        )

        observerRef.current.observe(staticButton)
        return true
      }
      return false
    }

    // Try to find the button immediately
    if (!findAndObserveButton()) {
      // If not found, try again after a short delay (for dynamic content)
      const timeout = setTimeout(() => {
        findAndObserveButton()
      }, 100)
      
      return () => {
        clearTimeout(timeout)
        if (observerRef.current) {
          observerRef.current.disconnect()
        }
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [staticButtonSelector])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300 ease-in-out">
      <Button
        onClick={onContinue}
        disabled={disabled}
        size="lg"
        className={cn(
          "px-6 py-4 text-lg shadow-xl border-2 border-white",
          "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
          "transform transition-all duration-300 ease-in-out",
          "hover:scale-105 hover:shadow-2xl",
          "animate-in slide-in-from-bottom-4 fade-in duration-500"
        )}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        {label}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}