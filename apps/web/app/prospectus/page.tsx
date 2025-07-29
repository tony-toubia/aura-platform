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
  Leaf,
  MessageCircle,
  Package,
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
  { quarter: "Q1 2024", consumer: 50, enterprise: 0, total: 50 },
  { quarter: "Q2 2024", consumer: 150, enterprise: 50, total: 200 },
  { quarter: "Q3 2024", consumer: 400, enterprise: 200, total: 600 },
  { quarter: "Q4 2024", consumer: 800, enterprise: 500, total: 1300 },
  { quarter: "Q1 2025", consumer: 1200, enterprise: 1000, total: 2200 },
  { quarter: "Q2 2025", consumer: 1500, enterprise: 2000, total: 3500 },
]

const productAdoption = [
  { name: "Terra (Plants)", value: 45, color: "#10B981" },
  { name: "Companion (Wildlife)", value: 30, color: "#3B82F6" },
  { name: "Digital Beings", value: 20, color: "#8B5CF6" },
  { name: "Licensed Characters", value: 5, color: "#FFD700" },
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
                We've built a platform that transforms any device, system, or data stream into 
                an intelligent entity with personality. Our first product, <span className="text-yellow-400 font-semibold">Aura</span>, 
                is proving the market by bringing magical life to plants, wildlife connections, and digital companions.
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { value: "15K+", label: "Active Auras", icon: Sparkles },
                { value: "87%", label: "User Retention", icon: Heart },
                { value: "40+", label: "Daily Interactions", icon: MessageCircle },
                { value: "$178B", label: "IoT Market Size", icon: Globe },
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
                onClick={() => setActiveSection("product")}
              >
                See Aura in Action
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
                  { id: "product", label: "Aura Product" },
                  { id: "technology", label: "Technology" },
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

        {/* Aura Product Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-green-900/30 text-green-400 border-green-600/50 mb-4">
                Live Product
              </Badge>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Aura: Our Flagship Consumer Product
              </h2>
              <p className="text-xl text-gray-400">
                Proving product-market fit with magical companions
              </p>
            </div>

            {/* Aura Product Overview */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <Card className="bg-gray-900/30 border-yellow-900/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 text-2xl">What is Aura?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">
                      Aura brings personality to everyday objects through AI-powered companions. 
                      Users create unique personalities that inhabit physical vessels or exist as digital beings.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Leaf, title: "Terra Vessels", desc: "Smart plant companions" },
                        { icon: Heart, title: "Wildlife Connections", desc: "Track real animals" },
                        { icon: Bot, title: "Digital Beings", desc: "Pure AI companions" },
                        { icon: Award, title: "Licensed Characters", desc: "Famous personalities" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                          <item.icon className="w-6 h-6 text-yellow-500 mb-2" />
                          <h4 className="text-yellow-400 font-medium text-sm">{item.title}</h4>
                          <p className="text-gray-500 text-xs">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/30 border-yellow-900/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Current Traction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Launch Date</span>
                        <span className="text-yellow-400">November 2023</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Active Users</span>
                        <span className="text-yellow-400">15,000+</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Monthly Revenue</span>
                        <span className="text-yellow-400">$120K</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">User Growth</span>
                        <span className="text-green-400">+35% MoM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Product Adoption Chart */}
                <Card className="bg-gray-900/30 border-yellow-900/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Vessel Type Adoption
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={productAdoption}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {productAdoption.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* User Testimonials */}
                <Card className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-600/50">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">User Love</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-yellow-900/30">
                      <p className="text-gray-300 italic text-sm mb-2">
                        "My Terra plant 'Sage' reminds me to water it with personality. 
                        It's not just a notification—it's a conversation with a friend."
                      </p>
                      <p className="text-yellow-500 text-xs">— Sarah, Plant Parent</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-yellow-900/30">
                      <p className="text-gray-300 italic text-sm mb-2">
                        "Tracking real elephants and chatting with 'my' elephant daily 
                        has made me donate to conservation for the first time."
                      </p>
                      <p className="text-yellow-500 text-xs">— Michael, Wildlife Enthusiast</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Platform Vision */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-yellow-600/30">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">From Consumer Success to Platform Scale</h3>
                  <p className="text-gray-400">Aura proves the technology and market demand. Now we're ready to expand.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-yellow-400 mb-1">Phase 1: Aura</h4>
                    <p className="text-sm text-gray-400">Consumer product validation</p>
                    <p className="text-xs text-green-400 mt-1">✓ Complete</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Code className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h4 className="font-semibold text-yellow-400 mb-1">Phase 2: SDK</h4>
                    <p className="text-sm text-gray-400">Developer platform launch</p>
                    <p className="text-xs text-yellow-600 mt-1">In Progress</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="font-semibold text-yellow-400 mb-1">Phase 3: Enterprise</h4>
                    <p className="text-sm text-gray-400">B2B platform expansion</p>
                    <p className="text-xs text-gray-600 mt-1">Q2 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900/20 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                The Technology Platform
              </h2>
              <p className="text-xl text-gray-400">
                Built and proven through Aura, ready to power any application
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Database,
                  title: "Universal Data Integration",
                  description: "Connect any sensor, API, or data stream",
                  features: ["IoT Sensors", "APIs", "Real-time Streams", "Databases"],
                  proven: "15+ integrations live in Aura"
                },
                {
                  icon: Brain,
                  title: "Advanced AI Processing",
                  description: "LLMs with contextual understanding",
                  features: ["GPT-4 Integration", "Context Engine", "Memory State", "Learning"],
                  proven: "1M+ conversations processed"
                },
                {
                  icon: Sparkles,
                  title: "Personality Engine",
                  description: "User-configurable traits & behaviors",
                  features: ["5-axis personality", "Voice tuning", "Quirk system", "Emotions"],
                  proven: "87% user retention"
                },
                {
                  icon: Zap,
                  title: "Rule Automation",
                  description: "Intelligent conditional responses",
                  features: ["If-then logic", "Multi-sensor", "Time-based", "Webhooks"],
                  proven: "10K+ rules created by users"
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
                    <ul className="space-y-2 mb-4">
                      {pillar.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="w-3 h-3 text-yellow-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-xs text-green-400">{pillar.proven}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Platform Applications */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-center mb-8 text-yellow-400">
                Platform Applications Beyond Aura
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Home,
                    sector: "Smart Home & IoT",
                    example: "Imagine your home speaking to you with personality",
                    opportunity: "$50B market by 2025"
                  },
                  {
                    icon: Heart,
                    sector: "Healthcare Devices",
                    example: "Medical devices that coach with empathy",
                    opportunity: "$30B market by 2026"
                  },
                  {
                    icon: Car,
                    sector: "Automotive",
                    example: "Cars that understand their drivers",
                    opportunity: "$45B connected car market"
                  },
                  {
                    icon: Factory,
                    sector: "Industrial IoT",
                    example: "Equipment that explains its own maintenance",
                    opportunity: "$80B IIoT market"
                  },
                ].map((app, idx) => (
                  <Card key={idx} className="bg-gray-900/30 border-yellow-900/20 hover:border-yellow-600/40 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <app.icon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold text-yellow-400 mb-1">{app.sector}</h4>
                          <p className="text-sm text-gray-400 mb-2">{app.example}</p>
                          <Badge variant="outline" className="border-green-600/30 text-green-400">
                            {app.opportunity}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
                Massive markets converging at the perfect time
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

            {/* Why Now Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gray-900/30 border-yellow-900/20">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Why Now?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "LLMs finally capable of nuanced personality (GPT-4, Claude)",
                      "IoT devices ubiquitous and affordable (75B by 2025)",
                      "Consumers comfortable with AI relationships (ChatGPT adoption)",
                      "Proven demand through Aura's success (87% retention)",
                      "Enterprise actively seeking differentiation",
                    ].map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/30 border-yellow-900/20">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Competitive Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "First consumer product with personality AI",
                      "Proven platform with 15K+ active users",
                      "Patent-pending personality engine",
                      "Network effects from user-created content",
                      "B2C success enabling B2B expansion",
                    ].map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
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
                Proven consumer revenue expanding to enterprise
              </p>
            </div>

            {/* Current Revenue Streams */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-600/50">
                <CardHeader>
                  <CardTitle className="text-green-400">Current: Aura Consumer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-green-900/30">
                      <span className="text-gray-400">Hardware Sales</span>
                      <span className="text-green-400">$79-149/unit</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-900/30">
                      <span className="text-gray-400">Subscriptions</span>
                      <span className="text-green-400">$9.99/month</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-900/30">
                      <span className="text-gray-400">Licensed Characters</span>
                      <span className="text-green-400">$14.99/month</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Current MRR</span>
                      <span className="text-green-400 font-bold">$120K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-600/50">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Future: Platform Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-yellow-900/30">
                      <span className="text-gray-400">Developer SDK</span>
                      <span className="text-yellow-400">$99-499/month</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-yellow-900/30">
                      <span className="text-gray-400">Enterprise Platform</span>
                      <span className="text-yellow-400">$5K-50K/month</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-yellow-900/30">
                      <span className="text-gray-400">API Usage Fees</span>
                      <span className="text-yellow-400">Usage-based</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Projected 2025</span>
                      <span className="text-yellow-400 font-bold">$5M MRR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Projections */}
            <Card className="bg-gray-900/30 border-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Projections: Consumer + Enterprise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={revenueProjections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="quarter" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                        border: '1px solid #FFD700',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="consumer" stackId="a" fill="#10B981" name="Consumer (Aura)" />
                    <Bar dataKey="enterprise" stackId="a" fill="#FFD700" name="Enterprise Platform" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-400">
                    Consumer revenue proves the model while enterprise scales the business
                  </p>
                </div>
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
                Series A to scale proven technology across markets
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
                        <span className="text-xl font-semibold text-yellow-400">$8M</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-yellow-900/30">
                        <span className="text-gray-400">Pre-money Valuation</span>
                        <span className="text-xl font-semibold text-yellow-400">$32M</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-yellow-900/30">
                        <span className="text-gray-400">Previous Round</span>
                        <span className="text-xl font-semibold text-yellow-400">$2M Seed</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-400">Lead Investor</span>
                        <span className="text-xl font-semibold text-yellow-400">In Discussions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6">Use of Funds</h3>
                    <div className="space-y-4">
                      {[
                        { category: "Product Development", percentage: 40, description: "SDK, enterprise features" },
                        { category: "Sales & Marketing", percentage: 30, description: "B2B go-to-market" },
                        { category: "Team Expansion", percentage: 20, description: "Engineering, sales" },
                        { category: "Operations", percentage: 10, description: "Infrastructure, legal" },
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
                { target: "50K", metric: "Active Users", timeline: "Q4 2024", icon: Users },
                { target: "SDK", metric: "Developer Launch", timeline: "Q2 2024", icon: Code },
                { target: "5", metric: "Enterprise Pilots", timeline: "Q3 2024", icon: Building2 },
                { target: "$5M", metric: "ARR Target", timeline: "Q1 2025", icon: DollarSign },
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

            {/* Investor Benefits */}
            <Card className="bg-gray-900/30 border-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Why Invest Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-yellow-400 mb-2">Proven Product</h4>
                    <p className="text-sm text-gray-400">
                      Aura demonstrates product-market fit with exceptional metrics
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <Rocket className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-yellow-400 mb-2">Platform Ready</h4>
                    <p className="text-sm text-gray-400">
                      Technology built and proven, ready for enterprise scale
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-yellow-400 mb-2">Massive Market</h4>
                    <p className="text-sm text-gray-400">
                      $400B+ TAM at the intersection of IoT and AI
                    </p>
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
                Proven founders with deep expertise in AI, IoT, and consumer products
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  name: "[Your Name]",
                  role: "CEO & Founder",
                  bio: "Previously built and sold IoT startup to [Company]. 10+ years in connected devices and AI.",
                  expertise: ["Business Strategy", "Product Vision", "Fundraising"],
                },
                {
                  name: "[CTO Name]",
                  role: "Chief Technology Officer",
                  bio: "Ex-Google AI researcher. Published papers on LLM personality systems. PhD from Stanford.",
                  expertise: ["AI/ML", "System Architecture", "LLMs"],
                },
                {
                  name: "[CPO Name]",
                  role: "Chief Product Officer",
                  bio: "Designed AI companions at [Gaming Company]. Expert in human-AI interaction and gamification.",
                  expertise: ["UX Design", "Personality Systems", "User Psychology"],
                },
                {
                  name: "[VP Sales]",
                  role: "VP Sales",
                  bio: "Scaled B2B SaaS from $0 to $50M ARR at [Previous Company]. Enterprise IoT expertise.",
                  expertise: ["Enterprise Sales", "Channel Partners", "Go-to-Market"],
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

            {/* Notable Investors & Advisors */}
            <Card className="bg-gray-900/30 border-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Investors & Advisors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4">Seed Investors</h4>
                    <div className="space-y-3">
                      {[
                        "Former VP Product, Nest",
                        "Founder, [IoT Unicorn]",
                        "Partner, [VC Fund]",
                      ].map((investor, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-gray-300">{investor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4">Advisors</h4>
                    <div className="space-y-3">
                      {[
                        "Former CTO, iRobot",
                        "Head of AI, OpenAI",
                        "VP Marketing, Peloton",
                      ].map((advisor, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-gray-300">{advisor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-600/50 rounded-3xl p-12">
              <Badge className="bg-green-900/30 text-green-400 border-green-600/50 mb-6">
                Live Product • Growing Revenue • Ready to Scale
              </Badge>
              
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Join Us in Making Everything Sentient
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                We've proven the technology with Aura. Now let's bring personality to every device in the world.
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
                  Request Aura Demo
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

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {[
                { label: "Active Users", value: "15K+" },
                { label: "Monthly Revenue", value: "$120K" },
                { label: "User Retention", value: "87%" },
                { label: "Daily Interactions", value: "40+" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-yellow-900/20">
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            <p>© 2024 Sentient Systems. Confidential and Proprietary.</p>
            <p className="mt-2">
              Aura is a trademark of Sentient Systems, Inc. Patent pending on personality engine technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default SentientSystemsPage