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
import { Loader2, Bell, BellOff, Clock, MessageSquare, Smartphone, Mail, MessageCircle } from 'lucide-react'
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
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading preferences...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">
          {auraId 
            ? `Configure notifications for ${auraName || 'this aura'}`
            : 'Configure global notification preferences'
          }
        </p>
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="timing">Timing & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          {CHANNELS.map((channelConfig) => {
            const preference = getChannelPreference(channelConfig.channel)
            const isAvailable = channelConfig.tier.includes(userTier)
            
            return (
              <Card key={channelConfig.channel}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {channelConfig.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{channelConfig.label}</h4>
                          {!isAvailable && (
                            <Badge variant="outline" className="text-xs">
                              {channelConfig.tier[0]} required
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
                        >
                          {isTestingChannel === channelConfig.channel ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Test'
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
              <Card key={channelConfig.channel}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    {channelConfig.icon}
                    <span>{channelConfig.label}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Quiet Hours */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <Label>Quiet Hours</Label>
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
                      <div className="grid grid-cols-2 gap-4 pl-6">
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
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <BellOff className="h-4 w-4" />
                      <Label>Daily Limit</Label>
                    </div>
                    <div className="pl-6">
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
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <Label>Priority Threshold</Label>
                    </div>
                    <div className="pl-6">
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
    </div>
  )
}