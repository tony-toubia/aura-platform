// apps/web/components/aura/dashboard-content.tsx

'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  MessageSquare, 
  Crown, 
  Plus, 
  ArrowRight,
  Sparkles,
  Activity,
  TrendingUp,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuras } from '@/lib/hooks/use-auras'
import type { DashboardStats } from '@/types/dashboard'

interface DashboardContentProps {
  stats: DashboardStats
}

export function DashboardContent({ stats: initialStats }: DashboardContentProps) {
  const router = useRouter()
  const { auras, loading, refresh } = useAuras({ autoRefresh: false })
  
  // Calculate stats from current auras data
  const stats = React.useMemo(() => {
    if (auras.length > 0) {
      return {
        auras: auras.filter(a => a.enabled).length,
        totalAuras: auras.length,
        conversations: initialStats.conversations,
        subscription: initialStats.subscription
      }
    }
    return initialStats
  }, [auras, initialStats])

  // Check for refresh parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('refresh') === 'true' || params.get('created') === 'true') {
      refresh()
    }
  }, [refresh])

  const subscriptionColors = {
    free: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-700', badge: 'bg-gray-100' },
    personal: { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-700', badge: 'bg-blue-100' },
    family: { bg: 'from-purple-500 to-pink-600', text: 'text-purple-700', badge: 'bg-purple-100' },
    business: { bg: 'from-amber-500 to-orange-600', text: 'text-amber-700', badge: 'bg-amber-100' }
  }

  const colors = subscriptionColors[stats.subscription as keyof typeof subscriptionColors] || subscriptionColors.free

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
          <Activity className="w-4 h-4" />
          Dashboard Overview
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Welcome to Your Aura Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Monitor your AI companions, track conversations, and manage your subscription
        </p>
        
        {/* Manual refresh button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            refresh()
            router.refresh()
          }}
          disabled={loading}
          className="mt-2"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          {loading ? "Refreshing..." : "Refresh Stats"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Auras */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <span>Active Auras</span>
              <Brain className="w-5 h-5 text-purple-600" />
            </CardTitle>
            <CardDescription>Currently enabled AI companions</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-purple-700">{stats.auras}</div>
            <p className="text-sm text-gray-600 mt-2">
              of {stats.totalAuras} total
            </p>
            <Link href="/auras" className="absolute bottom-4 right-4">
              <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Conversations */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <span>Conversations</span>
              <MessageSquare className="w-5 h-5 text-green-600" />
            </CardTitle>
            <CardDescription>Total chat sessions</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-700">{stats.conversations}</div>
            <p className="text-sm text-gray-600 mt-2">
              across all auras
            </p>
            <Link href="/conversations" className="absolute bottom-4 right-4">
              <Button variant="ghost" size="sm" className="hover:bg-green-50">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", colors.bg)} />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <span>Subscription</span>
              <Crown className="w-5 h-5" style={{ color: colors.text.replace('text-', '') }} />
            </CardTitle>
            <CardDescription>Current plan tier</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Badge className={cn("text-lg px-3 py-1", colors.badge, colors.text)}>
              {stats.subscription.charAt(0).toUpperCase() + stats.subscription.slice(1)}
            </Badge>
            <Link href="/subscription" className="absolute bottom-4 right-4">
              <Button variant="ghost" size="sm" className={cn("hover:bg-opacity-50", colors.badge)}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <span>Quick Actions</span>
              <Zap className="w-5 h-5 text-amber-600" />
            </CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-2">
            <Link href="/auras/create-select" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start hover:bg-amber-50">
                <Plus className="w-4 h-4 mr-2" />
                Create Aura
              </Button>
            </Link>
            <Link href="/auras" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start hover:bg-amber-50">
                <Brain className="w-4 h-4 mr-2" />
                Manage Auras
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity or Getting Started */}
      {stats.auras === 0 ? (
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Create Your First Aura</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              Start your journey with AI companions. Create a digital being that understands and interacts with your world.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auras/create-select">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Aura
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Activity Overview
            </CardTitle>
            <CardDescription>
              Your Aura ecosystem at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Total Auras Created</p>
                    <p className="text-sm text-gray-600">{stats.totalAuras} digital companions</p>
                  </div>
                </div>
                <Badge variant="secondary">{stats.auras} active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Conversations Started</p>
                    <p className="text-sm text-gray-600">{stats.conversations} total chats</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {stats.conversations > 0 ? 'Active' : 'No chats yet'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Subscription Status</p>
                    <p className="text-sm text-gray-600">
                      {stats.subscription === 'free' ? 'Upgrade for more features' : 'Premium features unlocked'}
                    </p>
                  </div>
                </div>
                <Link href="/subscription">
                  <Button variant="outline" size="sm">
                    {stats.subscription === 'free' ? 'Upgrade' : 'Manage'}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to expand your AI companion collection?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Each Aura has its own personality, senses, and behaviors. Create unique digital beings that enhance your daily life.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auras/create-select">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <Plus className="w-5 h-5 mr-2" />
                Create New Aura
              </Button>
            </Link>
            <Link href="/auras">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                View All Auras
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}