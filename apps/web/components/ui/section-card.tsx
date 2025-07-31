// apps/web/components/ui/section-card.tsx
// Reusable section card component with consistent styling

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  actions?: React.ReactNode
  gradient?: string
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  headerClassName,
  contentClassName,
  actions,
  gradient
}: SectionCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader 
        className={cn(
          "pb-4",
          gradient && `bg-gradient-to-r ${gradient}`,
          headerClassName
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={cn(
                "p-2 rounded-lg",
                gradient ? "bg-white/20" : "bg-muted"
              )}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <p className={cn(
                  "text-sm mt-1",
                  gradient ? "text-white/80" : "text-muted-foreground"
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn("pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}