// apps/web/components/ui/empty-state.tsx

import React from 'react'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  iconGradient?: string
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryText?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  iconGradient = 'from-purple-500 to-blue-500',
  title,
  description,
  primaryAction,
  secondaryText,
  children
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className={`w-24 h-24 bg-gradient-to-r ${iconGradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
          <Icon className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {title}
        </h3>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>
        
        {primaryAction && (
          <div className="space-y-4">
            <Button 
              onClick={primaryAction.onClick}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg px-8 py-6 text-lg"
            >
              {primaryAction.icon && <primaryAction.icon className="w-5 h-5 mr-2" />}
              {primaryAction.label}
            </Button>
            
            {secondaryText && (
              <div className="text-sm text-gray-500">
                {secondaryText}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}