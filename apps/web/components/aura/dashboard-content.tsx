// apps/web/components/dashboard/dashboard-content.tsx
import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  MessageCircle, 
  Crown, 
  Plus, 
  Sparkles, 
  Heart, 
  Zap,
  TrendingUp,
  Calendar,
  Activity,
  ArrowRight,
  Eye,
  ShoppingBag,
  Settings,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  auras: number
  conversations: number
  subscription: string
}

interface DashboardContentProps {
  stats: DashboardStats
}

const subscriptionConfig = {
  free: {
    icon: '✨',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    name: 'Free Tier',
    description: 'Getting started with Aura magic'
  },
  personal: {
    icon: '⭐',
    color: 'from-blue-500 to-sky-600',
    bgColor: 'from-blue-50 to-sky-50',
    name: 'Personal',
    description: 'Enhanced features for creators'
  },
  family: {
    icon: '👑',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'from-purple-50 to-violet-50',
    name: 'Family',
    description: 'Share the magic with loved ones'
  },
  business: {
    icon: '💎',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'from-amber-50 to-orange-50',
    name: 'Business',
    description: 'Enterprise-grade capabilities'
  }
}

// apps/web/components/dashboard/dashboard-content.tsx

export function DashboardContent({ stats }: DashboardContentProps) {
  const subConfig = subscriptionConfig[stats.subscription as keyof typeof subscriptionConfig] || subscriptionConfig.free

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
          Here's what's happening with your Aura collection today
        </p>
      </div>

      {/* ✅ MODIFIED: Use a single, unified 12-column grid for all cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* --- TOP ROW (3 CARDS) --- */}
        
        {/* Auras Card */}
        <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors shadow-lg hover:shadow-xl group md:col-span-6 lg:col-span-4">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-purple-700 mb-2">{stats.auras}</CardTitle>
            <CardDescription className="text-lg">Auras Created</CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 min-h-[40px] flex items-center justify-center">
                {stats.auras === 0 
                  ? "Ready to create your first magical companion?"
                  : stats.auras === 1
                  ? "Your Aura is waiting to chat!"
                  : `${stats.auras} personalities ready to interact`
                }
              </p>
              <div className="flex gap-2">
                <Button asChild className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Link href="/auras">
                    <Eye className="w-4 h-4 mr-2" />
                    View Auras
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-2 border-purple-200 hover:border-purple-400">
                  <Link href="/auras/create">
                    <Plus className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversations Card */}
        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors shadow-lg hover:shadow-xl group md:col-span-6 lg:col-span-4">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-blue-700 mb-2">{stats.conversations}</CardTitle>
            <CardDescription className="text-lg">Conversations</CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 min-h-[40px] flex items-center justify-center">
                {stats.conversations === 0 
                  ? "Start your first magical conversation"
                  : stats.conversations === 1
                  ? "Keep the conversation going!"
                  : `${stats.conversations} conversations and counting`
                }
              </p>
              <div className="flex gap-2">
                <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700">
                  <Link href="/conversations">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    View Chats
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-2 border-blue-200 hover:border-blue-400">
                  <Link href="/auras">
                    <Heart className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className={cn(
          "border-2 hover:border-opacity-70 transition-colors shadow-lg hover:shadow-xl group md:col-span-12 lg:col-span-4", // Spans full width on medium, 1/3 on large
          `border-${subConfig.color.split('-')[1]}-200`
        )}>
          <CardHeader className="text-center pb-2">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg bg-gradient-to-r",
              subConfig.color
            )}>
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <span>{subConfig.icon}</span>
              <span className="capitalize">{subConfig.name}</span>
            </CardTitle>
            <CardDescription className="text-lg">{subConfig.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4">
            <div className="space-y-3">
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r",
                subConfig.bgColor,
                `text-${subConfig.color.split('-')[1]}-700`
              )}>
                Current Plan
              </div>
              <Button asChild className={cn(
                "w-full bg-gradient-to-r text-white shadow-md",
                subConfig.color,
                `hover:from-${subConfig.color.split('-')[1]}-700 hover:to-${subConfig.color.split('-')[2]}-700`
              )}>
                <Link href="/subscription">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Plan
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- MIDDLE ROW (2 CARDS) --- */}

        {/* ✅ MODIFIED: Conditionally swap this card's content instead of adding a new one */}
        {stats.auras === 0 ? (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 md:col-span-6">
            <CardContent className="p-8 text-center flex flex-col justify-center items-center h-full">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Create Your First Aura</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Bring your first AI personality to life! Choose from plant companions, wildlife spirits, or digital beings.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
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
                <Button asChild variant="outline" className="w-full border-2 border-blue-200 hover:border-blue-400">
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Explore Vessels</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Discover physical vessels to house your Auras. From smart plant pots to wildlife trackers!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Link href="/vessels">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Vessel Shop
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* --- BOTTOM ROW (1 CARD) --- */}
        
        {/* Enhanced Footer CTA */}
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-3xl p-8 text-white text-center md:col-span-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready for More Magic?</h2>
            <p className="text-xl mb-8 opacity-90">
              Your journey with AI companions is just beginning. Explore new possibilities!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg px-8">
                <Link href="/auras/create">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Another Aura
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8">
                <Link href="/vessels">
                  <Star className="w-5 h-5 mr-2" />
                  Explore Vessels
                </Link>
              </Button>
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