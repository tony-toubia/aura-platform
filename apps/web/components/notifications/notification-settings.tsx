// components/notifications/notification-settings.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { useNotifications } from '@/hooks/use-notifications'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Bell, BellOff, Clock, MessageSquare, Smartphone, Mail, MessageCircle, Sparkles, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import type { NotificationChannel, UpdatePreferencesRequest } from '@/types/notifications'

interface ChannelConfig {
  channel: NotificationChannel
  label: string
  description: string
  icon: React.ReactNode
  tier: string[]
}

const CHANNELS: ChannelConfig[] = [
  {
    channel: 'IN_APP',
    label: 'In-App Messages',
    description: 'Messages appear in your conversations with auras',
    icon: <MessageSquare className="h-4 w-4" />,
    tier: ['FREE', 'PERSONAL', 'FAMILY', 'BUSINESS']
  },
  {
    channel: 'WEB_PUSH',
    label: 'Web Push Notifications', 
    description: 'Browser notifications when app is closed',
    icon: <Bell className="h-4 w-4" />,
    tier: ['PERSONAL', 'FAMILY', 'BUSINESS']
  },
  {
    channel: 'SMS',
    label: 'SMS Messages',
    description: 'Text messages to your phone',
    icon: <Smartphone className="h-4 w-4" />,
    tier: ['FAMILY', 'BUSINESS']
  },
  {
    channel: 'WHATSAPP',
    label: 'WhatsApp',
    description: 'Messages via WhatsApp Business',
    icon: <MessageCircle className="h-4 w-4" />,
    tier: ['BUSINESS']
  },
  {
    channel: 'EMAIL',
    label: 'Email',
    description: 'Email notifications',
    icon: <Mail className="h-4 w-4" />,
    tier: ['BUSINESS']
  }
]

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
]

interface NotificationSettingsProps {
  auraId?: string
  auraName?: string
}

export function NotificationSettings({ auraId, auraName }: NotificationSettingsProps) {
  const { user } = useAuth()
  const { preferences, updatePreferences, sendTestNotification } = useNotifications()
  const [isTestingChannel, setIsTestingChannel] = useState<NotificationChannel | null>(null)
  const [userTier, setUserTier] = useState('FREE')

  // Get user's subscription tier
  useEffect(() => {
    async function fetchUserTier() {
      if (!user) return
      
      try {
        const response = await fetch('/api/subscription/check')
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.tier || 'FREE')
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error)
      }
    }

    fetchUserTier()
  }, [user])

  // Get preferences for current context (aura-specific or global)
  const currentPreferences = auraId 
    ? preferences.byAura[auraId] || []
    : preferences.global

  // Get preference for a specific channel
  const getChannelPreference = (channel: NotificationChannel) => {
    return currentPreferences.find(p => p.channel === channel) || {
      channel,
      enabled: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      timezone: 'UTC',
      maxPerDay: null,
      priorityThreshold: 5
    }
  }

  // Handle preference updates
  const handleUpdatePreference = async (updates: Partial<UpdatePreferencesRequest>) => {
    try {
      await updatePreferences({
        auraId,
        ...updates
      } as UpdatePreferencesRequest)
      
      toast.success('Notification preferences updated')
    } catch (error) {
      console.error('Failed to update preference:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update preferences')
    }
  }

  // Test notification
  const handleTestNotification = async (channel: NotificationChannel) => {
    if (!auraId) {
      toast.error('Please select an aura to test notifications')
      return
    }

    setIsTestingChannel(channel)
    
    try {
      await sendTestNotification(
        auraId,
        channel,
        `This is a test notification for ${channel.toLowerCase().replace('_', ' ')}`
      )
      
      toast.success(`Test notification sent via ${channel.toLowerCase().replace('_', ' ')}!`)
    } catch (error) {
      console.error('Failed to send test notification:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send test notification')
    } finally {
      setIsTestingChannel(null)
    }
  }

  if (preferences.loading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="ml-2 text-purple-700">Loading magical preferences...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            Channel Configuration
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              <Sparkles className="w-3 h-3 mr-1" />
              {auraId ? 'Aura-Specific' : 'Global'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {auraId
              ? `Configure how ${auraName || 'this aura'} reaches out to you`
              : 'Set default notification preferences for all your auras'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="channels" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-100 to-indigo-100">
              <TabsTrigger value="channels" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Bell className="w-4 h-4 mr-2" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="timing" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Clock className="w-4 h-4 mr-2" />
                Timing & Limits
              </TabsTrigger>
            </TabsList>

        <TabsContent value="channels" className="space-y-4">
          {CHANNELS.map((channelConfig) => {
            const preference = getChannelPreference(channelConfig.channel)
            const isAvailable = channelConfig.tier.includes(userTier)
            
            return (
              <Card
                key={channelConfig.channel}
                className={`border-2 transition-all duration-300 ${
                  preference.enabled && isAvailable
                    ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 mt-1 p-2 rounded-lg ${
                        preference.enabled && isAvailable
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {channelConfig.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{channelConfig.label}</h4>
                          {!isAvailable && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                              {channelConfig.tier[0]} plan required
                            </Badge>
                          )}
                          {preference.enabled && isAvailable && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {channelConfig.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={preference.enabled && isAvailable}
                        disabled={!isAvailable}
                        onCheckedChange={(enabled) => 
                          handleUpdatePreference({
                            channel: channelConfig.channel,
                            settings: { enabled }
                          })
                        }
                      />
                      
                      {preference.enabled && isAvailable && auraId && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isTestingChannel === channelConfig.channel}
                          onClick={() => handleTestNotification(channelConfig.channel)}
                          className="bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-purple-200"
                        >
                          {isTestingChannel === channelConfig.channel ? (
                            <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 mr-1" />
                              Test
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          {CHANNELS.filter(c => c.tier.includes(userTier)).map((channelConfig) => {
            const preference = getChannelPreference(channelConfig.channel)
            
            if (!preference.enabled) return null

            return (
              <Card
                key={channelConfig.channel}
                className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                      {channelConfig.icon}
                    </div>
                    <span>{channelConfig.label}</span>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs ml-auto">
                      Configured
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Quiet Hours */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <Label className="text-purple-900">Quiet Hours</Label>
                      </div>
                      <Switch
                        checked={preference.quietHoursEnabled}
                        onCheckedChange={(quietHoursEnabled) =>
                          handleUpdatePreference({
                            channel: channelConfig.channel,
                            settings: {
                              enabled: preference.enabled,
                              quietHours: {
                                enabled: quietHoursEnabled,
                                start: preference.quietHoursStart || '22:00',
                                end: preference.quietHoursEnd || '07:00',
                                timezone: preference.timezone
                              }
                            }
                          })
                        }
                      />
                    </div>
                    
                    {preference.quietHoursEnabled && (
                      <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-purple-50 rounded-lg">
                        <div>
                          <Label className="text-xs">Start Time</Label>
                          <Input
                            type="time"
                            value={preference.quietHoursStart || '22:00'}
                            onChange={(e) =>
                              handleUpdatePreference({
                                channel: channelConfig.channel,
                                settings: {
                                  enabled: preference.enabled,
                                  quietHours: {
                                    enabled: preference.quietHoursEnabled,
                                    start: e.target.value,
                                    end: preference.quietHoursEnd || '07:00',
                                    timezone: preference.timezone
                                  }
                                }
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">End Time</Label>
                          <Input
                            type="time"
                            value={preference.quietHoursEnd || '07:00'}
                            onChange={(e) =>
                              handleUpdatePreference({
                                channel: channelConfig.channel,
                                settings: {
                                  enabled: preference.enabled,
                                  quietHours: {
                                    enabled: preference.quietHoursEnabled,
                                    start: preference.quietHoursStart || '22:00',
                                    end: e.target.value,
                                    timezone: preference.timezone
                                  }
                                }
                              })
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Timezone</Label>
                          <Select
                            value={preference.timezone}
                            onValueChange={(timezone) =>
                              handleUpdatePreference({
                                channel: channelConfig.channel,
                                settings: {
                                  enabled: preference.enabled,
                                  quietHours: {
                                    enabled: preference.quietHoursEnabled,
                                    start: preference.quietHoursStart || '22:00',
                                    end: preference.quietHoursEnd || '07:00',
                                    timezone
                                  }
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map(tz => (
                                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Daily Limit */}
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <div className="flex items-center space-x-2 mb-3">
                      <BellOff className="h-4 w-4 text-indigo-600" />
                      <Label className="text-indigo-900">Daily Limit</Label>
                    </div>
                    <div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Slider
                            value={[preference.maxPerDay || 50]}
                            max={200}
                            min={1}
                            step={1}
                            onValueChange={([maxPerDay]) =>
                              handleUpdatePreference({
                                channel: channelConfig.channel,
                                settings: {
                                  enabled: preference.enabled,
                                  maxPerDay
                                }
                              })
                            }
                          />
                        </div>
                        <div className="text-sm font-medium w-12 text-right">
                          {preference.maxPerDay || 50}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum notifications per day via this channel
                      </p>
                    </div>
                  </div>

                  {/* Priority Threshold */}
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-2 mb-3">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <Label className="text-blue-900">Priority Threshold</Label>
                    </div>
                    <div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Slider
                            value={[preference.priorityThreshold]}
                            max={10}
                            min={1}
                            step={1}
                            onValueChange={([priorityThreshold]) =>
                              handleUpdatePreference({
                                channel: channelConfig.channel,
                                settings: {
                                  enabled: preference.enabled,
                                  priorityThreshold
                                }
                              })
                            }
                          />
                        </div>
                        <div className="text-sm font-medium w-12 text-right">
                          {preference.priorityThreshold}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only send notifications with priority {preference.priorityThreshold} or higher
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          </TabsContent>
        </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}