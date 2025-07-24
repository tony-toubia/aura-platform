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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Aura Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Discover insights about your magical connections
              </p>
            </div>
            
            <div className="flex items-center gap-3">
            <Select
              value={timeRange}
              onValueChange={(value: string) => {
                setTimeRange(value as TimeRange)
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center gap-2">
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

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={(value: string) => {
            setSelectedTab(value as AnalyticsTab)
          }}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="sensors" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Sensors
            </TabsTrigger>
            <TabsTrigger value="personality" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Personality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Messages"
                value="1,284"
                change={12}
                trend="up"
                icon={MessageCircle}
                color="text-blue-600"
              />
              <StatCard
                title="Daily Active Auras"
                value="3"
                change={0}
                trend="neutral"
                icon={Sparkles}
                color="text-purple-600"
              />
              <StatCard
                title="Rule Triggers"
                value="456"
                change={8}
                trend="up"
                icon={Zap}
                color="text-yellow-600"
              />
              <StatCard
                title="Engagement Rate"
                value="87%"
                change={-3}
                trend="down"
                icon={Heart}
                color="text-red-600"
              />
            </div>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-purple-600" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  Track your daily interactions across all Auras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
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
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
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
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Milestones & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {MILESTONES.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                        milestone.achieved
                          ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                          : "border-gray-200 bg-gray-50 opacity-60"
                      )}
                    >
                      <div className="text-3xl mb-2">{milestone.icon}</div>
                      <h4 className="font-semibold text-sm text-center">{milestone.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{milestone.date}</p>
                      {milestone.achieved && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6 mt-6">
            {/* Engagement by Time of Day */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Activity by Time of Day
                </CardTitle>
                <CardDescription>
                  When are your Auras most active?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={AURA_ACTIVITY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="hour" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Terra" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Companion" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Digital" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Engagement Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Weekly Engagement Pattern
                </CardTitle>
                <CardDescription>
                  Interaction intensity throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={WEEKLY_ENGAGEMENT_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="morning" stackId="a" fill="#FFD93D" />
                    <Bar dataKey="afternoon" stackId="a" fill="#FF6B6B" />
                    <Bar dataKey="evening" stackId="a" fill="#6C5CE7" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rule Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Top Performing Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RULE_PERFORMANCE_DATA.map((rule, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rule.name}</span>
                        <span className="text-sm text-gray-600">{rule.triggers} triggers</span>
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

          <TabsContent value="sensors" className="space-y-6 mt-6">
            {/* Sensor Usage Distribution */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600" />
                    Sensor Usage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={SENSOR_USAGE_DATA}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
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
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {SENSOR_USAGE_DATA.map((sensor) => (
                      <div key={sensor.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: sensor.color }}
                        />
                        <span className="text-sm">{sensor.name}</span>
                        <span className="text-sm text-gray-500 ml-auto">{sensor.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThermometerSun className="w-5 h-5 text-orange-600" />
                    Environmental Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <ThermometerSun className="w-5 h-5 text-orange-600" />
                        <span className="font-medium">Temperature</span>
                      </div>
                      <p className="text-2xl font-bold">23°C</p>
                      <p className="text-sm text-gray-600">Optimal range</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Humidity</span>
                      </div>
                      <p className="text-2xl font-bold">65%</p>
                      <p className="text-sm text-gray-600">Slightly high</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Light Level</span>
                      </div>
                      <p className="text-2xl font-bold">75%</p>
                      <p className="text-sm text-gray-600">Bright</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Air Quality</span>
                      </div>
                      <p className="text-2xl font-bold">Good</p>
                      <p className="text-sm text-gray-600">AQI: 42</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <p className="text-sm text-purple-700">
                      <Info className="w-4 h-4 inline mr-1" />
                      Your environment has been stable and healthy this week!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sensor Alerts */}
            <Card className="border-2 border-yellow-100">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Recent Sensor Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {[
                    { time: "2 hours ago", sensor: "Soil Moisture", message: "Low moisture detected (22%)", severity: "warning" as const },
                    { time: "Yesterday", sensor: "Temperature", message: "Temperature spike to 32°C", severity: "error" as const },
                    { time: "2 days ago", sensor: "Light Level", message: "Extended darkness period", severity: "info" as const },
                  ].map((alert, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5",
                        alert.severity === "error" ? "bg-red-500" :
                        alert.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{alert.sensor}</span>
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personality" className="space-y-6 mt-6">
            {/* Personality Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Personality Traits Comparison
                </CardTitle>
                <CardDescription>
                  Compare personality traits across your Auras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={PERSONALITY_TRAITS_DATA}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="trait" stroke="#6B7280" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
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
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Personality Insights */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-2 border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Personality Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Most Empathetic</span>
                      </div>
                      <span className="text-sm text-green-700">Terra Spirit (85%)</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Most Creative</span>
                      </div>
                      <span className="text-sm text-purple-700">Digital Being (80%)</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Most Verbose</span>
                      </div>
                      <span className="text-sm text-blue-700">Digital Being (85%)</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">Most Playful</span>
                      </div>
                      <span className="text-sm text-yellow-700">Terra Spirit (80%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communication Style */}
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Communication Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Average Message Length</span>
                        <span className="text-sm text-gray-600">47 words</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Emoji Usage</span>
                        <span className="text-sm text-gray-600">High</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Question Frequency</span>
                        <span className="text-sm text-gray-600">Moderate</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <Info className="w-4 h-4 inline mr-1" />
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
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Want deeper insights?</h3>
                  <p className="text-sm text-gray-600">Export your data or share your analytics dashboard</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Dashboard
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
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