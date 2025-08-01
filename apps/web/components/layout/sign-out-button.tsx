"use client"

import { LogOut } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

interface SignOutButtonProps {
  variant?: 'dropdown' | 'mobile'
  className?: string
}

export function SignOutButton({ variant = 'dropdown', className }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleSignOut}
        disabled={isPending}
        className={cn(
          "w-full justify-start text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 disabled:opacity-50 py-2 px-4 border rounded-md text-sm font-medium flex items-center",
          className
        )}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isPending ? "Signing out..." : "Sign Out"}
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(
        "flex w-full items-center text-red-600 hover:text-red-700 disabled:opacity-50",
        className
      )}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isPending ? "Signing out..." : "Sign Out"}</span>
    </button>
  )
}