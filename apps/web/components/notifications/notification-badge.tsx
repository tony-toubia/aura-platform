// components/notifications/notification-badge.tsx

import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  count: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'red' | 'blue' | 'green' | 'orange'
  className?: string
  showZero?: boolean
}

export function NotificationBadge({ 
  count, 
  size = 'md', 
  color = 'red',
  className,
  showZero = false
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) return null

  const sizeClasses = {
    sm: 'h-4 w-4 text-xs min-w-[16px]',
    md: 'h-5 w-5 text-xs min-w-[20px]', 
    lg: 'h-6 w-6 text-sm min-w-[24px]'
  }

  const colorClasses = {
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    orange: 'bg-orange-500 text-white'
  }

  // Format count (999+ for large numbers)
  const displayCount = count > 999 ? '999+' : count.toString()

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium',
        sizeClasses[size],
        colorClasses[color],
        'animate-in zoom-in-75 duration-200',
        className
      )}
      title={`${count} unread notification${count !== 1 ? 's' : ''}`}
    >
      {displayCount}
    </div>
  )
}

/**
 * Wrapper component that positions the badge relative to another element
 */
interface NotificationBadgeWrapperProps {
  children: React.ReactNode
  count: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  offset?: string
  badgeProps?: Omit<NotificationBadgeProps, 'count'>
}

export function NotificationBadgeWrapper({ 
  children, 
  count,
  position = 'top-right',
  offset = '-translate-y-1/2 translate-x-1/2',
  badgeProps = {}
}: NotificationBadgeWrapperProps) {
  const positionClasses = {
    'top-right': `absolute top-0 right-0 ${offset}`,
    'top-left': `absolute top-0 left-0 ${offset}`,
    'bottom-right': `absolute bottom-0 right-0 ${offset}`,
    'bottom-left': `absolute bottom-0 left-0 ${offset}`
  }

  return (
    <div className="relative inline-block">
      {children}
      {count > 0 && (
        <NotificationBadge
          count={count}
          className={positionClasses[position]}
          {...badgeProps}
        />
      )}
    </div>
  )
}