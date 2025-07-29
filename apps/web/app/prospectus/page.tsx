// app/prospectus/page.tsx

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Brain,
  Cpu,
  Database,
  Zap,
  Building2,
  Car,
  Heart,
  Factory,
  Home,
  TrendingUp,
  Users,
  Globe,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Sparkles,
  Activity,
  Shield,
  Rocket,
  Mail,
  Phone,
  ChevronRight,
  Code,
  Gauge,
  Network,
  Bot,
  Waves,
  Timer,
  Target,
  Award,
  LineChart as LineChartIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for charts
const marketGrowthData = [
  { year: "2023", iot: 120, ai: 45, combined: 165 },
  { year: "2024", iot: 145, ai: 62, combined: 207 },
  { year: "2025", iot: 178, ai: 89, combined: 267 },
  { year: "2026", iot: 215, ai: 125, combined: 340 },
  { year: "2027", iot: 260, ai: 168, combined: 428 },
]

const revenueProjections = [
  { quarter: "Q1 2024", revenue: 50, users: 500 },
  { quarter: "Q2 2024", revenue: 150, users: 1500 },
  { quarter: "Q3 2024", revenue: 400, users: 4000 },
  { quarter: "Q4 2024", revenue: 800, users: 8000 },
  { quarter: "Q1 2025", revenue: 1500, users: 15000 },
  { quarter: "Q2 2025", revenue: 2500, users: 25000 },
]

const applicationSectors = [
  { name: "Smart Home", value: 30, color: "#FFD700" },
  { name: "Healthcare", value: 25, color: "#FFA500" },
  { name: "Automotive", value: 20, color: "#FF8C00" },
  { name: "Industrial", value: 15, color: "#FF6347" },
  { name: "Enterprise", value: 10, color: "#FFB347" },
]

const SentientSystemsPage = () => {
  const [activeSection, setActiveSection] = useState("overview")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 via-transparent to-orange-600/20 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/10 via-transparent to-yellow-500/10 animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "max-w-5xl mx-auto text-center space-y-8 transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            {/* Logo/Brand */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
                <Brain className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                Sentient Systems
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-2xl sm:text-3xl text-gray-300 font-light">
              Making the Non-Human, <span className="text-yellow-400 font-semibold">Human</span>
            </p>

            {/* Value Proposition */}
            <div className="max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                We transform any device, system, or data stream into an intelligent entity 
                with personality, emotions, and natural communication abilities.
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { value: "$178B", label: "IoT Market Size", icon: Globe },
                { value: "75B", label: "Devices by 2025", icon: Cpu },
                { value: "87%", label: "User Retention", icon: Heart },
                { value: "40+", label: "Daily Interactions", icon: Activity },
              ].map((stat, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-900/20 rounded-2xl p-6 transition-all duration-300 group-hover:scale-105 group-hover:border-yellow-600/40">
                    <stat.icon className="w-6 h-6 text-yellow-500 mb-3 mx-auto" />
                    <div className="text-3xl font-bold text-yellow-400">{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-semibold px-8 py-6 text-lg shadow-lg shadow-yellow-500/25"
                onClick={() => setActiveSection("technology")}
              >
                Explore Technology
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10 px-8 py-6 text-lg"
                onClick={() => setActiveSection("investment")}
              >
                Investment Opportunity
                <DollarSign className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-yellow-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-yellow-500" />
                <span className="font-semibold text-yellow-400">Sentient Systems</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                {[
                  { id: "technology", label: "Technology" },
                  { id: "applications", label: "Applications" },
                  { id: "market", label: "Market" },
                  { id: "business", label: "Business Model" },
                  { id: "investment", label: "Investment" },
                  { id: "team", label: "Team" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      activeSection === item.id
                        ? "text-yellow-400"
                        : "text-gray-400 hover:text-yellow-500"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </nav>

        {/* Technology Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                The Technology Stack
              </h2>
              <p className="text-xl text-gray-400">
                Four pillars that bring intelligence to everything
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Database,
                  title: "Data Integration",
                  description: "Connect any sensor, API, or data stream in real-time",
                  features: ["IoT Sensors", "APIs", "Databases", "Live Streams"],
                },
                {
                  icon: Brain,
                  title: "AI Processing",
                  description: "Advanced LLMs with contextual understanding",
                  features: ["GPT Integration", "Context Engine", "Pattern Learning", "Memory State"],
                },
                {
                  icon: Sparkles,
                  title: "Personality Engine",
                  description: "User-tunable traits and behaviors",
                  features: ["Trait Matrix", "Voice Tuning", "Quirk System", "Emotion Layer"],
                },
                {
                  icon: Zap,
                  title: "Rule Automation",
                  description: "Intelligent responses based on conditions",
                  features: ["If-Then Logic", "Threshold Alerts", "Pattern Detection", "Auto Actions"],
                },
              ].map((pillar, idx) => (
                <Card key={idx} className="bg-gray-900/50 border-yellow-900/20 hover:border-yellow-600/40 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <pillar.icon className="w-6 h-6 text-black" />
                    </div>
                    <CardTitle className="text-yellow-400">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">{pillar.description}</p>
                    <ul className="space-y-2">
                      {pillar.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="w-3 h-3 text-yellow-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Architecture Diagram */}
            <Card className="mt-12 bg-gray-900/30 border-yellow-900/20">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  {["Data Sources", "AI Processing", "Personality", "Communication"].map((stage, idx) => (
                    <React.Fragment key={stage}>
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center mb-3 mx-auto border border-yellow-600/30">
                          <span className="text-2xl font-bold text-yellow-400">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-gray-400">{stage}</p>
                      </div>
                      {idx < 3 && (
                        <ChevronRight className="w-6 h-6 text-yellow-600 hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Applications Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900/20 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Market Applications
              </h2>
              <p className="text-xl text-gray-400">
                Transform every industry with sentient technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Home,
                  sector: "Smart Home & IoT",
                  title: "Your House Becomes a Caring Companion",
                  examples: [
                    "HVAC explains comfort decisions conversationally",
                    "Security systems with reassuring communication",
                    "Appliances that build relationships with users",
                  ],
                  gradient: "from-blue-600 to-cyan-600",
                },
                {
                  icon: Heart,
                  sector: "Healthcare & Wellness",
                  title: "Medical Devices as Supportive Coaches",
                  examples: [
                    "Glucose monitors with empathetic guidance",
                    "Mental health companions with consistency",
                    "Elderly care systems providing companionship",
                  ],
                  gradient: "from-red-600 to-pink-600",
                },
                {
                  icon: Car,
                  sector: "Automotive",
                  title: "Vehicles as Trusted Co-Pilots",
                  examples: [
                    "Cars that adapt to driver personality",
                    "Fleet management with vehicle personalities",
                    "Public transit with helpful personas",
                  ],
                  gradient: "from-green-600 to-emerald-600",
                },
                {
                  icon: Factory,
                  sector: "Industrial & Enterprise",
                  title: "Humanized Operations",
                  examples: [
                    "Manufacturing systems explain issues naturally",
                    "Supply chains that communicate clearly",
                    "Building management with personality",
                  ],
                  gradient: "from-purple-600 to-violet-600",
                },
              ].map((app, idx) => (
                <Card key={idx} className="bg-gray-900/50 border-yellow-900/20 hover:border-yellow-600/40 transition-all duration-300 overflow-hidden group">
                  <div className={cn(
                    "h-2 bg-gradient-to-r",
                    app.gradient
                  )} />
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <app.icon className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <Badge variant="outline" className="border-yellow-600/50 text-yellow-500 mb-2">
                          {app.sector}
                        </Badge>
                        <CardTitle className="text-xl text-yellow-400">{app.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {app.examples.map((example, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Market Distribution Chart */}
            <Card className="mt-12 bg-gray-900/30 border-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Target Market Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={applicationSectors}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {applicationSectors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    <p className="text-gray-400 mb-4">
                      Our technology addresses multiple billion-dollar markets, with smart home 
                      and healthcare leading initial adoption.
                    </p>
                    {applicationSectors.map((sector) => (
                      <div key={sector.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: sector.color }}
                          />
                          <span className="text-gray-300">{sector.name}</span>
                        </div>
                        <span className="text-yellow-400 font-semibold">{sector.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Market Opportunity Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Market Opportunity
              </h2>
              <p className="text-xl text-gray-400">
                The intersection of IoT, AI, and human psychology
              </p>
            </div>

            {/* Market Growth Chart */}
            <Card className="bg-gray-900/30 border-yellow-900/20 mb-12">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5" />
                  Total Addressable Market Growth (in Billions)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={marketGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="year" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                        border: '1px solid #FFD700',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="iot" 
                      stroke="#FFD700" 
                      strokeWidth={2}
                      name="IoT Market"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ai" 
                      stroke="#FFA500" 
                      strokeWidth={2}
                      name="Conversational AI"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="combined" 
                      stroke="#FF6347" 
                      strokeWidth={3}
                      name="Combined Opportunity"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Market Drivers */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Globe,
                  title: "75B IoT Devices",
                  description: "Expected by 2025, each one a potential sentient system",
                  stat: "3x Growth",
                },
                {
                  icon: Brain,
                  title: "$15.7B Conversational AI",
                  description: "Market size by 2024, growing at 23% CAGR",
                  stat: "23% CAGR",
                },
                {
                  icon: Users,
                  title: "87% User Retention",
                  description: "Compared to 15% industry average for IoT apps",
                  stat: "5.8x Better",
                },
              ].map((driver, idx) => (
                <Card key={idx} className="bg-gradient-to-br from-gray-900 to-gray-800 border-yellow-900/20 hover:border-yellow-600/40 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <driver.icon className="w-8 h-8 text-yellow-500" />
                      <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-600/50">
                        {driver.stat}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">{driver.title}</h3>
                    <p className="text-gray-400 text-sm">{driver.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Business Model Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900/20 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Business Model
              </h2>
              <p className="text-xl text-gray-400">
                Multiple revenue streams with high margins
              </p>
            </div>

            {/* Pricing Tiers */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  name: "Starter",
                  price: "$99",
                  period: "per month",
                  features: [
                    "Single entity",
                    "Basic sensors",
                    "Standard personality",
                    "Email support",
                  ],
                  gradient: "from-gray-600 to-gray-700",
                  popular: false,
                },
                {
                  name: "Professional",
                  price: "$499",
                  period: "per month",
                  features: [
                    "Up to 10 entities",
                    "Advanced sensors",
                    "Custom personalities",
                    "Priority support",
                    "API access",
                  ],
                  gradient: "from-yellow-500 to-amber-600",
                  popular: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  period: "contact us",
                  features: [
                    "Unlimited entities",
                    "White label option",
                    "Custom integrations",
                    "Dedicated support",
                    "SLA guarantee",
                  ],
                  gradient: "from-orange-600 to-red-600",
                  popular: false,
                },
              ].map((tier, idx) => (
                <Card 
                  key={idx} 
                  className={cn(
                    "relative border-2 transition-all",
                    tier.popular 
                      ? "border-yellow-500 scale-105 shadow-2xl shadow-yellow-500/20" 
                      : "border-yellow-900/20 hover:border-yellow-600/40"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-yellow-500 text-black">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className={cn(
                    "text-center pb-6 bg-gradient-to-br rounded-t-lg",
                    tier.gradient
                  )}>
                    <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-white/80 text-sm ml-2">{tier.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 bg-gray-900">
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={cn(
                        "w-full mt-6",
                        tier.popular 
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black"
                          : "bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-900/50"
                      )}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Revenue Projections */}
            <Card className="bg-gray-900/30 border-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={revenueProjections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="quarter" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#666" />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                        border: '1px solid #FFD700',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar yAxisId="left" dataKey="revenue" fill="#FFD700" name="Revenue ($K)" />
                    <Bar yAxisId="right" dataKey="users" fill="#FFA500" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Investment Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Investment Opportunity
              </h2>
              <p className="text-xl text-gray-400">
                Join us in humanizing the digital world
              </p>
            </div>

            {/* Investment Overview */}
            <Card className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-600/50 mb-12">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6">Series A Round</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-yellow-900/30">
                        <span className="text-gray-400">Seeking</span>
                        <span className="text-xl font-semibold text-yellow-400">$5M</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-yellow-900/30">
                        <span className="text-gray-400">Pre-money Valuation</span>
                        <span className="text-xl font-semibold text-yellow-400">$20M</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-yellow-900/30">
                        <span className="text-gray-400">Target Close</span>
                        <span className="text-xl font-semibold text-yellow-400">Q2 2024</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-400">Lead Investor</span>
                        <span className="text-xl font-semibold text-yellow-400">TBD</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6">Use of Funds</h3>
                    <div className="space-y-4">
                      {[
                        { category: "Engineering", percentage: 40, description: "LLM optimization, platform scaling" },
                        { category: "Business Dev", percentage: 30, description: "Enterprise partnerships" },
                        { category: "Marketing", percentage: 20, description: "Developer ecosystem" },
                        { category: "Operations", percentage: 10, description: "Infrastructure & team" },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300">{item.category}</span>
                            <span className="text-yellow-400 font-semibold">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[
                { target: "10K", metric: "Active Entities", timeline: "Q2 2024", icon: Bot },
                { target: "3", metric: "Enterprise Pilots", timeline: "Q3 2024", icon: Building2 },
                { target: "SDK", metric: "Developer Launch", timeline: "Q4 2024", icon: Code },
                { target: "$2M", metric: "ARR Target", timeline: "End 2024", icon: DollarSign },
              ].map((milestone, idx) => (
                <Card key={idx} className="bg-gray-900/50 border-yellow-900/20 hover:border-yellow-600/40 transition-all group">
                  <CardContent className="p-6 text-center">
                    <milestone.icon className="w-8 h-8 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{milestone.target}</div>
                    <div className="text-sm text-gray-400 mb-2">{milestone.metric}</div>
                    <Badge variant="outline" className="border-yellow-600/30 text-yellow-600">
                      {milestone.timeline}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Why Now */}
            <Card className="bg-gray-900/30 border-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Why Now?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4">Perfect Storm of Technologies</h4>
                    <ul className="space-y-3">
                      {[
                        "LLMs finally capable of nuanced personality",
                        "IoT sensors ubiquitous and affordable",
                        "Users comfortable with AI interaction",
                        "5G enabling real-time processing",
                        "Society craving more human connection",
                      ].map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4">Competitive Advantages</h4>
                    <ul className="space-y-3">
                      {[
                        "First-mover in Personality IoT",
                        "Emotional lock-in creates moat",
                        "Platform network effects",
                        "Proprietary personality engine",
                        "87% retention vs 15% average",
                      ].map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900/20 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                The Team
              </h2>
              <p className="text-xl text-gray-400">
                Proven track record in AI, IoT, and consumer products
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  name: "[Your Name]",
                  role: "CEO & Founder",
                  bio: "Previously built and sold IoT startup. 10+ years in connected devices.",
                  expertise: ["Business Strategy", "Product Vision", "Fundraising"],
                },
                {
                  name: "[CTO Name]",
                  role: "Chief Technology Officer",
                  bio: "Ex-Google AI researcher. Published papers on LLM personality systems.",
                  expertise: ["AI/ML", "System Architecture", "Research"],
                },
                {
                  name: "[CPO Name]",
                  role: "Chief Product Officer",
                  bio: "Designed personality systems for major gaming studios. Expert in human-AI interaction.",
                  expertise: ["UX Design", "Personality Systems", "User Psychology"],
                },
                {
                  name: "[Head of Growth]",
                  role: "Head of Growth",
                  bio: "Scaled consumer app to 10M users. Expert in viral growth and retention.",
                  expertise: ["Marketing", "User Acquisition", "Analytics"],
                },
              ].map((member, idx) => (
                <Card key={idx} className="bg-gray-900/50 border-yellow-900/20 hover:border-yellow-600/40 transition-all">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-10 h-10 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-400 text-center mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-400 text-center mb-3">{member.role}</p>
                    <p className="text-xs text-gray-500 mb-4">{member.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise.map((skill, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="border-yellow-900/50 text-yellow-600 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Advisors */}
            <Card className="bg-gray-900/30 border-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Advisory Board
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { name: "Former VP, iRobot", expertise: "Consumer Robotics" },
                    { name: "Ex-Director, Nest", expertise: "Smart Home Products" },
                    { name: "Senior Researcher, OpenAI", expertise: "Large Language Models" },
                  ].map((advisor, idx) => (
                    <div key={idx} className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="w-12 h-12 bg-yellow-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Users className="w-6 h-6 text-yellow-500" />
                      </div>
                      <p className="font-medium text-yellow-400">{advisor.name}</p>
                      <p className="text-sm text-gray-500">{advisor.expertise}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-600/50 rounded-3xl p-12">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Ready to Transform the Future?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join us in making every object, system, and data stream deserve a voice.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-semibold px-8 py-6 text-lg shadow-lg shadow-yellow-500/25"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Schedule a Meeting
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10 px-8 py-6 text-lg"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Request Demo
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
                <a href="mailto:invest@sentientsystems.ai" className="hover:text-yellow-400 transition-colors">
                  invest@sentientsystems.ai
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="tel:+1234567890" className="hover:text-yellow-400 transition-colors">
                  +1 (234) 567-890
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Download Deck (PDF)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-yellow-900/20">
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            <p>© 2025 Sentient Systems. Confidential and Proprietary.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default SentientSystemsPage