// apps/web/components/ui/stat-card.tsx

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StatCardProps } from '@/types/analytics'

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  trend 
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
          {title}
          <Icon className={cn("w-4 h-4", color)} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && trend && trend !== 'neutral' && (
          <div className={cn(
            "flex items-center gap-1 text-sm mt-1",
            trend === "up" ? "text-green-600" : "text-red-600"
          )}>
            {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change}% from last period</span>
          </div>
        )}
      </CardContent>
      <div className={cn(
        "absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 transform translate-x-8 -translate-y-8",
        color.replace("text-", "bg-")
      )} />
    </Card>
  )
}