// apps/web/components/dashboard/dashboard-content.tsx

import React from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  MessageCircle,
  Crown,
  Plus,
  Sparkles,
  Heart,
  TrendingUp,
  Eye,
  ShoppingBag,
  Settings,
  Star,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardStatCard } from '@/components/dashboard/dashboard-stat-card'
import { SUBSCRIPTION_CONFIG, EMPTY_STATE_MESSAGES } from '@/lib/constants/dashboard'
import type { DashboardStats, SubscriptionTier } from '@/types/dashboard'

interface DashboardContentProps {
  stats: DashboardStats
}

export function DashboardContent({ stats }: DashboardContentProps) {
  const subConfig =
    SUBSCRIPTION_CONFIG[stats.subscription as SubscriptionTier] ||
    SUBSCRIPTION_CONFIG.free

  const getAuraMessage = () => {
    if (stats.auras === 0) return EMPTY_STATE_MESSAGES.auras.zero
    if (stats.auras === 1) return EMPTY_STATE_MESSAGES.auras.one
    return EMPTY_STATE_MESSAGES.auras.multiple(stats.auras)
  }

  const getConversationMessage = () => {
    if (stats.conversations === 0) return EMPTY_STATE_MESSAGES.conversations.zero
    if (stats.conversations === 1) return EMPTY_STATE_MESSAGES.conversations.one
    return EMPTY_STATE_MESSAGES.conversations.multiple(stats.conversations)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Activity className="w-4 h-4" />
          Dashboard Overview
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Here's what's happening with your digital Aura collection today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* --- TOP ROW (3 CARDS) --- */}

        {/* Auras Card */}
        <div className="md:col-span-6 lg:col-span-4">
          <DashboardStatCard
            title="Auras Created"
            value={stats.auras}
            description="Auras Created"
            iconName="Brain"
            primaryColor="purple"
            message={getAuraMessage()}
            primaryAction={{
              href: "/auras",
              label: "View Auras",
              iconName: "Eye",
            }}
            secondaryAction={{
              href: "/auras/create-select-digital",
              iconName: "Plus",
            }}
          />
        </div>

        {/* Conversations Card */}
        <div className="md:col-span-6 lg:col-span-4">
          <DashboardStatCard
            title="Conversations"
            value={stats.conversations}
            description="Conversations"
            iconName="MessageCircle"
            primaryColor="blue"
            message={getConversationMessage()}
            primaryAction={{
              href: "/conversations",
              label: "View Chats",
              iconName: "MessageCircle",
            }}
            secondaryAction={{
              href: "/auras",
              iconName: "Heart",
            }}
          />
        </div>

        {/* Subscription Card */}
        <Card
          className={cn(
            "border-2 hover:border-opacity-70 transition-colors shadow-lg hover:shadow-xl group md:col-span-12 lg:col-span-4",
            `border-${subConfig!.color.split('-')[1]}-200`
          )}
        >
          <CardHeader className="text-center pb-2">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg bg-gradient-to-r",
                subConfig!.color
              )}
            >
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <span>{subConfig!.icon}</span>
              <span className="capitalize">{subConfig!.name}</span>
            </CardTitle>
            <CardDescription className="text-lg">
              {subConfig!.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4">
            <div className="space-y-3">
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r",
                  subConfig!.bgColor,
                  `text-${subConfig!.color.split('-')[1]}-700`
                )}
              >
                Current Plan
              </div>
              <Button
                asChild
                className={cn(
                  "w-full bg-gradient-to-r text-white shadow-md",
                  subConfig!.color,
                  `hover:from-${subConfig!.color.split('-')[1]}-700 hover:to-${subConfig!.color.split(
                    '-'
                  )[2]}-700`
                )}
              >
                <Link href="/subscription">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Plan
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- MIDDLE ROW (2 CARDS) --- */}

        {/* Activity or Empty State Card */}
        {stats.auras === 0 ? (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 md:col-span-6">
            <CardContent className="p-8 text-center flex flex-col justify-center items-center h-full">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Create Your First Aura
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Bring your first AI personality to life! Choose from plant
                companions, wildlife spirits, or digital beings.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Link href="/auras/create">
                  <Plus className="w-5 h-5 mr-2" />
                  Start Creating Magic
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 md:col-span-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Auras created</div>
                    <div className="text-xs text-gray-500">
                      Your magical collection
                    </div>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {stats.auras}
                  </div>
                </div>

                {stats.conversations > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Conversations</div>
                      <div className="text-xs text-gray-500">
                        Magical interactions
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {stats.conversations}
                    </div>
                  </div>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-2 border-blue-200 hover:border-blue-400"
                >
                  <Link href="/analytics">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explore Vessels */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 md:col-span-6">
          <CardContent className="p-8 text-center flex flex-col justify-center items-center h-full">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Explore Vessels
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Discover physical vessels to house your Auras. From smart plant
              pots to wildlife trackers!
            </p>
            <div className="relative">
              <Button
                size="lg"
                disabled
                className="bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Vessel Shop
              </Button>
              <Badge className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5">
                Coming Soon
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* --- BOTTOM ROW (1 CARD) --- */}

        {/* Enhanced Footer CTA */}
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-3xl p-8 text-white text-center md:col-span-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready for More Magic?</h2>
            <p className="text-xl mb-8 opacity-90">
              Your journey with AI companions is just beginning. Explore new
              possibilities!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg px-8"
              >
                <Link href="/auras/create">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Another Aura
                </Link>
              </Button>
              <div className="relative">
                <Button
                  size="lg"
                  variant="outline"
                  disabled
                  className="border-2 border-white text-gray-400 cursor-not-allowed px-8"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Explore Vessels
                </Button>
                <Badge className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5">
                  Coming Soon
                </Badge>
              </div>
            </div>
            <div className="mt-6 text-sm opacity-75">
              ✨ Join thousands creating magical AI relationships
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
