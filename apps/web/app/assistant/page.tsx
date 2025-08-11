// apps/web/app/assistant/page.tsx

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bot,
  Brain,
  Calendar,
  Activity,
  MapPin,
  Zap,
  Target,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  Database,
  Workflow,
  Eye,
  Plus,
  Star,
  TrendingUp,
  Heart,
  MessageSquare,
  Settings,
  Lightbulb
} from 'lucide-react'

export default function AssistantLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Assistant Studio
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/assistant-studio">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Assistant
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <div className="mb-8">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Introducing Assistant Studio
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block text-gray-900">Build Your</span>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Perfect AI Assistant
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-10">
              Create an intelligent companion that truly understands your world. Connect your data, 
              define behaviors, and deploy an AI assistant that grows with you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/assistant-studio">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <Bot className="w-5 h-5 mr-2" />
                  Start Building Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Eye className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative mt-16">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-12 flex items-center px-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-white font-medium">Assistant Studio</span>
                </div>
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Define Personality</h3>
                    <p className="text-sm text-gray-600 mt-2">Customize how your assistant thinks and responds</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Database className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Connect Data</h3>
                    <p className="text-sm text-gray-600 mt-2">Link calendars, fitness, location, and more</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Workflow className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Set Behaviors</h3>
                    <p className="text-sm text-gray-600 mt-2">Create rules for intelligent automation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Assistant Studio?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlike generic AI chatbots, Assistant Studio creates truly personalized AI companions 
              that understand your unique context and help you achieve your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="border-2 hover:border-blue-200 transition-colors group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Personalized Intelligence</CardTitle>
                <CardDescription>
                  Your assistant learns your communication style, preferences, and goals to provide 
                  truly personalized interactions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Rich Data Integration</CardTitle>
                <CardDescription>
                  Connect calendars, fitness trackers, location services, and more to give your 
                  assistant complete context about your life.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Workflow className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Intelligent Automation</CardTitle>
                <CardDescription>
                  Create custom rules and behaviors that trigger based on your data, schedule, 
                  location, and activities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-colors group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Goal-Oriented</CardTitle>
                <CardDescription>
                  Your assistant actively helps you build habits, reach goals, and make positive 
                  changes in your life.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-teal-200 transition-colors group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle>Privacy First</CardTitle>
                <CardDescription>
                  Your data stays secure and private. You control what information your assistant 
                  can access and how it's used.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-200 transition-colors group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Always Evolving</CardTitle>
                <CardDescription>
                  Your assistant grows smarter over time, learning from your interactions and 
                  adapting to your changing needs.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Building your perfect AI assistant is simple with our guided studio experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Welcome & Setup</h3>
              <p className="text-gray-600">
                Give your assistant a name and describe what you want it to help you with.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Define Personality</h3>
              <p className="text-gray-600">
                Customize how your assistant communicates, thinks, and responds to you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <Database className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Connect Data</h3>
              <p className="text-gray-600">
                Link your calendars, fitness data, location, and other services for context.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Deploy & Chat</h3>
              <p className="text-gray-600">
                Launch your assistant and start having intelligent conversations right away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Perfect For Every Lifestyle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a busy professional, health enthusiast, or lifelong learner, 
              Assistant Studio adapts to your unique needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Use Case 1 */}
            <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Busy Professional</CardTitle>
                    <Badge variant="secondary" className="text-xs">Productivity</Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  "My assistant manages my calendar, reminds me of important meetings, 
                  and helps me stay on top of deadlines. It even suggests optimal times 
                  for focused work based on my schedule patterns."
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Use Case 2 */}
            <Card className="border-2 hover:border-green-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Health Enthusiast</CardTitle>
                    <Badge variant="secondary" className="text-xs">Wellness</Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  "Connected to my fitness tracker and sleep data, my assistant provides 
                  personalized health insights, workout suggestions, and helps me maintain 
                  healthy habits throughout the day."
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Use Case 3 */}
            <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Lifelong Learner</CardTitle>
                    <Badge variant="secondary" className="text-xs">Growth</Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  "My assistant tracks my learning goals, suggests relevant articles based 
                  on my interests, and helps me build consistent study habits. It's like 
                  having a personal learning coach."
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Build Your Perfect Assistant?
            </h2>
            <p className="text-xl mb-10 opacity-90">
              Join thousands of users who have already created their personalized AI companions. 
              Start building yours today – it only takes a few minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/assistant-studio">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <Bot className="w-5 h-5 mr-2" />
                  Start Building Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg">
                <MessageSquare className="w-5 h-5 mr-2" />
                See Examples
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm opacity-75">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Free to start
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                No coding required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Deploy in minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">Assistant Studio</span>
              </div>
              <p className="text-gray-400 text-sm">
                Build intelligent AI companions that understand your world and help you achieve your goals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/assistant-studio" className="hover:text-white transition-colors">Create Assistant</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/auras" className="hover:text-white transition-colors">My Auras</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Assistant Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}