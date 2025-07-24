// apps/web/components/dashboard/dashboard-stat-card.tsx
"use client"

import React from "react"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PrimaryColor = "purple" | "blue" | "green"

interface DashboardStatCardProps {
  title: string
  value: number
  description: string
  iconName: keyof typeof LucideIcons
  primaryColor: PrimaryColor
  message: string
  primaryAction: {
    href: string
    label: string
    iconName?: keyof typeof LucideIcons
  }
  secondaryAction?: {
    href: string
    iconName: keyof typeof LucideIcons
  }
  className?: string
}

export function DashboardStatCard({
  title,
  value,
  description,
  iconName,
  primaryColor,
  message,
  primaryAction,
  secondaryAction,
  className,
}: DashboardStatCardProps) {
  // Cast each lookup to the icon‐component type
  const StatIcon = LucideIcons[iconName] as LucideIcon
  const PrimaryIcon = primaryAction.iconName
    ? (LucideIcons[primaryAction.iconName] as LucideIcon)
    : undefined
  const SecondaryIcon = secondaryAction
    ? (LucideIcons[secondaryAction.iconName] as LucideIcon)
    : undefined

  const colorMap: Record<PrimaryColor, string> = {
    purple:
      "from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
    blue:
      "from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700",
    green:
      "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
  }

  const borderColorMap: Record<PrimaryColor, string> = {
    purple: "border-purple-100 hover:border-purple-300",
    blue: "border-blue-100 hover:border-blue-300",
    green: "border-green-100 hover:border-green-300",
  }

  return (
    <Card
      className={cn(
        "border-2 transition-colors shadow-lg hover:shadow-xl group",
        borderColorMap[primaryColor],
        className
      )}
    >
      <CardHeader className="text-center pb-2">
        <div
          className={cn(
            "w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg",
            // split out the two color classes
            ...colorMap[primaryColor].split(" ")
          )}
        >
          <StatIcon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className={`text-4xl font-bold text-${primaryColor}-700 mb-2`}>
          {value}
        </CardTitle>
        <CardDescription className="text-lg">{title}</CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-4">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 min-h-[40px] flex items-center justify-center">
            {message}
          </p>
          <div className="flex gap-2">
            <Button asChild className={cn("flex-1 bg-gradient-to-r", colorMap[primaryColor])}>
              <Link href={primaryAction.href}>
                {PrimaryIcon && <PrimaryIcon className="w-4 h-4 mr-2" />}
                {primaryAction.label}
              </Link>
            </Button>
            {SecondaryIcon && secondaryAction && (
              <Button
                asChild
                variant="outline"
                className={`border-2 border-${primaryColor}-200 hover:border-${primaryColor}-400`}
              >
                <Link href={secondaryAction.href}>
                  <SecondaryIcon className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
