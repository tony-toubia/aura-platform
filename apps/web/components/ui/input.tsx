// apps/web/components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

// Tailwind classes for our size variants
const sizeClasses = {
  sm: "px-2 py-1 text-sm",
  md: "px-3 py-2 text-base",
  lg: "px-4 py-3 text-lg",
} as const

export type InputSize = keyof typeof sizeClasses

// Omit the native `size` prop, then add our own `size?: InputSize`
export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  size?: InputSize
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", size = "md", ...props }, ref) => {
    const sizeClass = sizeClasses[size] // now type-safe

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
         "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400",
         "focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-purple-700",
         className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
