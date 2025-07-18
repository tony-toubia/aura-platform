// apps/web/components/dashboard/dashboard-content.tsx
import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  auras: number
  conversations: number
  subscription: string
}

interface DashboardContentProps {
  stats: DashboardStats
}

export function DashboardContent({ stats }: DashboardContentProps) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Auras Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{stats.auras}</CardTitle>
            <CardDescription>Auras Created</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="sm">
              <Link href="/auras">View Auras</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Conversations Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{stats.conversations}</CardTitle>
            <CardDescription>Conversations</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="sm">
              <Link href="/dashboard">View Chats</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="capitalize">{stats.subscription}</CardTitle>
            <CardDescription>Subscription Tier</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="sm">
              <Link href="/account">Manage Subscription</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
