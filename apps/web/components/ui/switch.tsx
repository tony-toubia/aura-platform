// apps/web/components/ui/switch.tsx

"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      // track
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full",
      "border-2 border-transparent transition-colors",
      "data-[state=unchecked]:bg-gray-300",                         // unchecked track
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      "data-[state=checked]:bg-purple-700",    // checked track
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        // thumb
        "block h-5 w-5 bg-white rounded-full shadow-md transition-transform",
        "data-[state=unchecked]:translate-x-0",
        "data-[state=checked]:translate-x-5"
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName
