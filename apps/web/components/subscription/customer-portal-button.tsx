'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { openCustomerPortal } from '@/lib/stripe/upgrade'

interface CustomerPortalButtonProps {
  className?: string
  size?: 'sm' | 'lg' | 'default'
  variant?: 'default' | 'outline' | 'ghost'
}

export function CustomerPortalButton({
  className,
  size = 'lg',
  variant = 'outline'
}: CustomerPortalButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => openCustomerPortal()}
      className={`inline-flex items-center gap-2 ${className || ''}`}
    >
      <ExternalLink className="w-5 h-5" />
      Manage Billing
    </Button>
  )
}