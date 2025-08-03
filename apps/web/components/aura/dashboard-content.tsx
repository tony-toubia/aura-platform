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
  Wand2,
  Bot,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardStatCard } from '@/components/dashboard/dashboard-stat-card'
import { SUBSCRIPTION_CONFIG, EMPTY_STATE_MESSAGES } from '@/lib/constants/dashboard'
import { SubscriptionGuard } from '@/components/subscription/subscription-guard'
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
          {stats.auras === 0 
            ? "Start your magical journey by creating your first AI companion"
            : "Here's what's happening with your digital Aura collection today"}
        </p>
      </div>

      {/* Main Content Grid */}
      {stats.auras === 0 ? (
        // Empty State Layout - Balanced 3-column grid
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Aura Card - Spans 2 columns */}
          <Card className="lg:col-span-2 border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 hover:border-purple-300 transition-all hover:shadow-xl">
            <CardContent className="p-8">
              {/* Header Section */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Create Your First Aura
                  </h3>
                  <p className="text-gray-600">
                    Choose your path to bring an AI companion to life
                  </p>
                </div>
              </div>

              {/* Creation Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* AI-Guided Option */}
                <SubscriptionGuard feature="maxAuras">
                  <Link href="/auras/create-with-agent" className="block" data-help="create-aura-button">
                    <div className="bg-white/80 backdrop-blur border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group h-full">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">AI-Guided Creation</h4>
                          <p className="text-sm text-gray-600 mb-3">Let our AI assistant help you design the perfect companion through conversation</p>
                          <div className="inline-flex items-center gap-2 text-xs text-purple-600 font-medium">
                            <Sparkles className="w-3 h-3" />
                            <span>Recommended for beginners</span>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium text-sm group-hover:bg-purple-200 transition-colors">
                            Start with AI
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SubscriptionGuard>

                {/* Manual Option */}
                <SubscriptionGuard feature="maxAuras">
                  <Link href="/auras/create" className="block">
                    <div className="bg-white/80 backdrop-blur border-2 border-green-200 rounded-xl p-6 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group h-full">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                          <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">Custom Creation</h4>
                          <p className="text-sm text-gray-600 mb-3">Take full control and design every aspect of your Aura's personality</p>
                          <div className="inline-flex items-center gap-2 text-xs text-green-600 font-medium">
                            <Wand2 className="w-3 h-3" />
                          <span>For advanced users</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm group-hover:bg-green-200 transition-colors">
                          Create Manually
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                </SubscriptionGuard>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card - Single column */}
          <Card className="border-2 border-gray-200 hover:border-purple-300 transition-all hover:shadow-xl">
            <CardContent className="p-8 h-full flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg bg-gradient-to-r",
                  subConfig!.color
                )}>
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span>{subConfig!.icon}</span>
                  <span className="capitalize">{subConfig!.name} Plan</span>
                </h3>
                <p className="text-gray-600 mb-6">
                  {subConfig!.description}
                </p>
                <div className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r mb-6",
                  subConfig!.bgColor,
                  `text-${subConfig!.color.split('-')[1]}-700`
                )}>
                  Current Plan
                </div>
              </div>
              
              <Button
                asChild
                variant="outline"
                className="w-full border-2"
              >
                <Link href="/subscription">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Plan
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Normal Layout with Auras
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Auras Card */}
          <div className={cn(
            stats.conversations > 0
              ? "md:col-span-6 lg:col-span-4"
              : "md:col-span-8 lg:col-span-8"
          )}>
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
                href: "/auras/create-select",
                iconName: "Plus",
                requiresSubscription: true,
                subscriptionFeature: "maxAuras"
              }}
            />
          </div>

          {/* Conversations Card */}
          {stats.conversations > 0 && (
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
          )}

          {/* Subscription Card */}
          <Card
            className={cn(
              "border-2 hover:border-opacity-70 transition-colors shadow-lg hover:shadow-xl group",
              stats.conversations > 0
                ? "md:col-span-12 lg:col-span-4"
                : "md:col-span-4 lg:col-span-4",
              `border-${subConfig!.color.split('-')[1]}-200`
            )}
          >
            <CardHeader className="text-center">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg bg-gradient-to-r",
                subConfig!.color
              )}>
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
            <CardContent className="text-center">
              <div className="space-y-3">
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r",
                  subConfig!.bgColor,
                  `text-${subConfig!.color.split('-')[1]}-700`
                )}>
                  Current Plan
                </div>
                <Button
                  asChild
                  className={cn(
                    "w-full bg-gradient-to-r text-white shadow-md",
                    subConfig!.color
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
        </div>
      )}

      {/* Additional Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Activity Card */}
        {stats.auras > 0 && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
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
                    <div className="text-xs text-gray-500">Your magical collection</div>
                  </div>
                  <div className="text-lg font-bold text-purple-600">{stats.auras}</div>
                </div>

                {stats.conversations > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Conversations</div>
                      <div className="text-xs text-gray-500">Magical interactions</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">{stats.conversations}</div>
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
        <Card className={cn(
          "border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50",
          stats.auras === 0 && "md:col-span-2"
        )}>
          <CardContent className="p-8 text-center flex flex-col justify-center items-center h-full">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Explore Vessels
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Discover physical vessels to house your Auras. From smart plant pots to wildlife trackers!
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
      </div>

      {/* Enhanced Footer CTA */}
      <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-3xl p-8 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            {stats.auras === 0 ? "Begin Your Magical Journey" : "Ready for More Magic?"}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {stats.auras === 0 
              ? "Join thousands who are creating meaningful connections with AI companions"
              : "Your journey with AI companions is just beginning. Explore new possibilities!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SubscriptionGuard
              feature="maxAuras"
              fallback={
                <div className="inline-flex items-center gap-2 text-sm text-white/90 bg-white/20 px-6 py-4 rounded-lg border border-white/30 h-12">
                  <span>Upgrade to create more auras</span>
                  <Button asChild size="sm" className="bg-white text-purple-600 hover:bg-gray-100">
                    <Link href="/subscription">
                      View Plans
                    </Link>
                  </Button>
                </div>
              }
            >
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg px-8 h-12"
              >
                <Link href="/auras/create-select" data-help="create-aura-button">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {stats.auras === 0 ? "Create Your First Aura" : "Create Another Aura"}
                </Link>
              </Button>
            </SubscriptionGuard>
            <div className="relative">
              <Button
                size="lg"
                variant="outline"
                disabled
                className="border-2 border-white text-gray-400 cursor-not-allowed px-8 h-12"
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
            ✨ {stats.auras === 0 ? "Start creating magical AI relationships today" : "Join thousands creating magical AI relationships"}
          </div>
        </div>
      </div>
    </div>
  )
}