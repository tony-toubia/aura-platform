// apps/web/app/(dashboard)/notifications/settings/page.tsx

import { createServerSupabase } from '@/lib/supabase/server.server'
import { redirect } from 'next/navigation'
import { NotificationSettings } from '@/components/notifications/notification-settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Bell, 
  Sparkles, 
  ArrowLeft, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  MessageCircle,
  Settings,
  Wand2,
  Star
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NotificationSettingsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's auras for selection
  const { data: auras } = await supabase
    .from('auras')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('enabled', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Magical Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <Button
            asChild
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Notification Settings
                <Badge className="bg-white/20 text-white border-white/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Magical
                </Badge>
              </h1>
              <p className="text-white/80 mt-1">
                Configure how your auras reach out to you proactively
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Guide Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            How Proactive Notifications Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Create Rules</p>
              <p className="text-sm text-gray-600">Set conditions for when your auras should notify you</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Background Monitoring</p>
              <p className="text-sm text-gray-600">Rules are evaluated every 5 minutes automatically</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Receive Notifications</p>
              <p className="text-sm text-gray-600">Get notified through your preferred channels when conditions are met</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Configuration */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Channel Configuration</h2>
          {auras && auras.length > 0 && (
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
              {auras.length} Active {auras.length === 1 ? 'Aura' : 'Auras'}
            </Badge>
          )}
        </div>

        {/* Notification Settings Component */}
        <NotificationSettings 
          auraId={undefined}
          auraName={undefined}
        />
      </div>

      {/* Available Channels Preview */}
      <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Available Notification Channels
          </CardTitle>
          <CardDescription>
            Different channels are available based on your subscription tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">In-App Messages</p>
                <p className="text-xs text-gray-500">Available on all plans</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <Bell className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Web Push</p>
                <p className="text-xs text-gray-500">Personal plan and above</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">Coming Soon</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">SMS</p>
                <p className="text-xs text-gray-500">Family plan and above</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">Coming Soon</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs text-gray-500">Business plan only</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">Coming Soon</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-pink-200">
              <Mail className="w-5 h-5 text-pink-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Email</p>
                <p className="text-xs text-gray-500">Business plan only</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure notification preferences for each aura individually or set global defaults that apply to all your auras.
              </p>
              <div className="flex gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/auras">
                    View Your Auras
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/help/notifications">
                    Read Documentation
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}