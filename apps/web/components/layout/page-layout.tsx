// apps/web/components/layout/page-layout.tsx
// Common page layout component with consistent structure

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function PageLayout({
  children,
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  className,
  headerClassName,
  contentClassName
}: PageLayoutProps) {
  return (
    <div className={cn("container mx-auto py-8 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {crumb.href ? (
                    <a 
                      href={crumb.href} 
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Page Header */}
        <div className={cn("mb-8", headerClassName)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {Icon && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <Icon className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                {description && (
                  <p className="text-gray-600 max-w-3xl">
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
        </div>

        {/* Page Content */}
        <div className={cn("space-y-6", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Specialized layouts for common patterns
interface DashboardPageLayoutProps extends Omit<PageLayoutProps, 'icon'> {
  stats?: Array<{
    title: string
    value: string | number
    description?: string
    icon?: LucideIcon
  }>
}

export function DashboardPageLayout({ stats, children, ...props }: DashboardPageLayoutProps) {
  return (
    <PageLayout {...props}>
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  )}
                </div>
                {stat.icon && (
                  <stat.icon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {children}
    </PageLayout>
  )
}

interface FormPageLayoutProps extends PageLayoutProps {
  onCancel?: () => void
  onSave?: () => void
  isSaving?: boolean
  saveLabel?: string
  cancelLabel?: string
  showActions?: boolean
}

export function FormPageLayout({
  children,
  onCancel,
  onSave,
  isSaving,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  showActions = true,
  ...props
}: FormPageLayoutProps) {
  const actions = showActions ? (
    <div className="flex items-center space-x-2">
      {onCancel && (
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          {cancelLabel}
        </Button>
      )}
      {onSave && (
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : saveLabel}
        </Button>
      )}
    </div>
  ) : props.actions

  return (
    <PageLayout {...props} actions={actions}>
      {children}
    </PageLayout>
  )
}