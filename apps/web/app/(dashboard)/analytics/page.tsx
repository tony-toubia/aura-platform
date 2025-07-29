// app/analytics/page.tsx

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  Activity,
  Heart,
  MessageCircle,
  Sparkles,
  Sun,
  Droplets,
  ThermometerSun,
  Zap,
  Calendar,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Share2,
  Info,
  Leaf,
  Star,
  Award,
  Target,
  Brain,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TimeRange, AnalyticsTab } from "@/types/analytics"
import {
  generateTimeSeriesData,
  AURA_ACTIVITY_DATA,
  SENSOR_USAGE_DATA,
  PERSONALITY_TRAITS_DATA,
  RULE_PERFORMANCE_DATA,
  WEEKLY_ENGAGEMENT_DATA,
  MILESTONES,
} from "@/lib/mock-data/analytics"

// Enhanced StatCard component with better mobile support
const EnhancedStatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color 
}: {
  title: string
  value: string
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: any
  color: string
}) => {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        {/* Background decoration - consistent across all cards */}
        <div className="absolute -top-8 -right-8 w-24 h-24 sm:w-32 sm:h-32 opacity-10">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-2xl" />
            <div className="absolute inset-2 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-xl" />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              "p-2 sm:p-2.5 rounded-lg bg-gradient-to-br",
              color === "text-blue-600" && "from-blue-50 to-blue-100",
              color === "text-purple-600" && "from-purple-50 to-purple-100",
              color === "text-yellow-600" && "from-yellow-50 to-yellow-100",
              color === "text-red-600" && "from-red-50 to-red-100"
            )}>
              <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", color)} />
            </div>
            {trend !== 'neutral' && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend === 'up' ? "text-green-600" : "text-red-600"
              )}>
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [selectedTab, setSelectedTab] = useState<AnalyticsTab>("overview")
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData(7))

  useEffect(() => {
    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    setTimeSeriesData(generateTimeSeriesData(days))
  }, [timeRange])

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Aura Analytics
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Discover insights about your magical connections
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Select
                value={timeRange}
                onValueChange={(value: string) => {
                  setTimeRange(value as TimeRange)
                }}>
                <SelectTrigger className="w-28 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Download className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Time Range Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Calendar className="w-3 h-3 mr-1" />
              {timeRange === "24h" ? "Today" : 
               timeRange === "7d" ? "This Week" :
               timeRange === "30d" ? "This Month" : "Last 3 Months"}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Activity className="w-3 h-3 mr-1" />
              3 Active Auras
            </Badge>
          </div>
        </div>

        {/* Enhanced Tabs with better mobile layout */}
        <Tabs
          value={selectedTab}
          onValueChange={(value: string) => {
            setSelectedTab(value as AnalyticsTab)
          }}
          className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 gap-1">
            <TabsTrigger 
              value="overview" 
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="engagement" 
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Engagement</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sensors" 
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
            >
              <Activity className="w-4 h-4" />
              <span>Sensors</span>
            </TabsTrigger>
            <TabsTrigger 
              value="personality" 
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
            >
              <Brain className="w-4 h-4" />
              <span>Personality</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Key Metrics with enhanced cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <EnhancedStatCard
                title="Total Messages"
                value="1,284"
                change={12}
                trend="up"
                icon={MessageCircle}
                color="text-blue-600"
              />
              <EnhancedStatCard
                title="Daily Active Auras"
                value="3"
                change={0}
                trend="neutral"
                icon={Sparkles}
                color="text-purple-600"
              />
              <EnhancedStatCard
                title="Rule Triggers"
                value="456"
                change={8}
                trend="up"
                icon={Zap}
                color="text-yellow-600"
              />
              <EnhancedStatCard
                title="Engagement Rate"
                value="87%"
                change={3}
                trend="down"
                icon={Heart}
                color="text-red-600"
              />
            </div>

            {/* Activity Timeline with improved mobile layout */}
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <LineChartIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span>Activity Timeline</span>
                  </CardTitle>
                  <CardDescription className="mt-1 sm:mt-0 text-sm">
                    Track your daily interactions across all Auras
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-2 sm:pt-4">
                <div className="w-full -mx-2 sm:mx-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="messages"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorMessages)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="sensorActivity"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorEngagement)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Milestones with improved mobile scroll */}
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="w-5 h-5 text-purple-600" />
                  Milestones & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {MILESTONES.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={cn(
                        "flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all",
                        milestone.achieved
                          ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                          : "border-gray-200 bg-gray-50 opacity-60"
                      )}
                    >
                      <div className="text-2xl sm:text-3xl mb-2">{milestone.icon}</div>
                      <h4 className="font-semibold text-xs sm:text-sm text-center">{milestone.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{milestone.date}</p>
                      {milestone.achieved && (
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Engagement by Time of Day with improved mobile layout */}
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Activity by Time of Day</span>
                  </CardTitle>
                  <CardDescription className="mt-1 sm:mt-0 text-sm">
                    When are your Auras most active?
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-2 sm:pt-4">
                <div className="w-full -mx-2 sm:mx-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={AURA_ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Terra" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Companion" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Digital" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Engagement Heatmap with improved mobile layout */}
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span>Weekly Engagement Pattern</span>
                  </CardTitle>
                  <CardDescription className="mt-1 sm:mt-0 text-sm">
                    Interaction intensity throughout the week
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-2 sm:pt-4">
                <div className="w-full -mx-2 sm:mx-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={WEEKLY_ENGAGEMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="day" 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="morning" stackId="a" fill="#FFD93D" />
                      <Bar dataKey="afternoon" stackId="a" fill="#FF6B6B" />
                      <Bar dataKey="evening" stackId="a" fill="#6C5CE7" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Rule Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Target className="w-5 h-5 text-green-600" />
                  Top Performing Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RULE_PERFORMANCE_DATA.map((rule, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm sm:text-base">{rule.name}</span>
                        <span className="text-xs sm:text-sm text-gray-600">{rule.triggers} triggers</span>
                      </div>
                      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "absolute top-0 left-0 h-full rounded-full transition-all",
                            rule.success >= 90 ? "bg-green-500" :
                            rule.success >= 80 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${rule.success}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{rule.success}% success rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensors" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Sensor Usage Distribution with improved mobile layout */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <PieChartIcon className="w-5 h-5 text-purple-600" />
                    Sensor Usage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                    <PieChart>
                      <Pie
                        data={SENSOR_USAGE_DATA}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {SENSOR_USAGE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                    {SENSOR_USAGE_DATA.map((sensor) => (
                      <div key={sensor.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: sensor.color }}
                        />
                        <span className="text-xs sm:text-sm">{sensor.name}</span>
                        <span className="text-xs sm:text-sm text-gray-500 ml-auto">{sensor.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <ThermometerSun className="w-5 h-5 text-orange-600" />
                    Environmental Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <ThermometerSun className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        <span className="font-medium text-sm sm:text-base">Temperature</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold">23°C</p>
                      <p className="text-xs sm:text-sm text-gray-600">Optimal range</p>
                    </div>
                    
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <span className="font-medium text-sm sm:text-base">Humidity</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold">65%</p>
                      <p className="text-xs sm:text-sm text-gray-600">Slightly high</p>
                    </div>
                    
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                        <span className="font-medium text-sm sm:text-base">Light Level</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold">75%</p>
                      <p className="text-xs sm:text-sm text-gray-600">Bright</p>
                    </div>
                    
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <span className="font-medium text-sm sm:text-base">Air Quality</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold">Good</p>
                      <p className="text-xs sm:text-sm text-gray-600">AQI: 42</p>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <p className="text-xs sm:text-sm text-purple-700">
                      <Info className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Your environment has been stable and healthy this week!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sensor Alerts */}
            <Card className="border-2 border-yellow-100">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Recent Sensor Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="space-y-3">
                  {[
                    { time: "2 hours ago", sensor: "Soil Moisture", message: "Low moisture detected (22%)", severity: "warning" as const },
                    { time: "Yesterday", sensor: "Temperature", message: "Temperature spike to 32°C", severity: "error" as const },
                    { time: "2 days ago", sensor: "Light Level", message: "Extended darkness period", severity: "info" as const },
                  ].map((alert, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                        alert.severity === "error" ? "bg-red-500" :
                        alert.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{alert.sensor}</span>
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personality" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Personality Comparison */}
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Star className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span>Personality Traits Comparison</span>
                  </CardTitle>
                  <CardDescription className="mt-1 sm:mt-0 text-sm">
                    Compare personality traits across your Auras
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-2 sm:pt-4">
                <ResponsiveContainer width="100%" height={350} className="sm:h-[400px]">
                  <RadarChart data={PERSONALITY_TRAITS_DATA}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="trait" stroke="#6B7280" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" tick={{ fontSize: 10 }} />
                    <Radar
                      name="Terra Aura"
                      dataKey="A"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Digital Aura"
                      dataKey="B"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Personality Insights */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-2 border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Personality Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                        <span className="font-medium text-sm">Most Empathetic</span>
                      </div>
                      <span className="text-xs sm:text-sm text-green-700">Terra Spirit (85%)</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                        <span className="font-medium text-sm">Most Creative</span>
                      </div>
                      <span className="text-xs sm:text-sm text-purple-700">Digital Being (80%)</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="font-medium text-sm">Most Verbose</span>
                      </div>
                      <span className="text-xs sm:text-sm text-blue-700">Digital Being (85%)</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
                        <span className="font-medium text-sm">Most Playful</span>
                      </div>
                      <span className="text-xs sm:text-sm text-yellow-700">Terra Spirit (80%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communication Style */}
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Communication Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Average Message Length</span>
                        <span className="text-xs sm:text-sm text-gray-600">47 words</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Emoji Usage</span>
                        <span className="text-xs sm:text-sm text-gray-600">High</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Question Frequency</span>
                        <span className="text-xs sm:text-sm text-gray-600">Moderate</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-700">
                      <Info className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Your Auras have developed unique and engaging communication styles!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Section */}
        <Card className="border-2 border-purple-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">Want deeper insights?</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Export your data or share your analytics dashboard</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-initial text-sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Share Dashboard</span>
                  <span className="sm:hidden">Share</span>
                </Button>
                <Button className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export Data</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default AnalyticsPage