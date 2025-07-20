import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Brain, Wifi, MessageCircle, Sparkles, Heart, Globe, Leaf, ArrowRight, Play, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Aura Engine
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/vessels">
              <Button variant="ghost" size="sm">Shop Vessels</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-24 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                The future of companion AI is here
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block">Give Life to</span>
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                Anything
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create magical AI companions that live in your world. Watch your plants share their feelings, 
              follow wild animals on their journeys, or build digital beings that truly understand you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Creating Magic
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 text-sm text-gray-600">
              ✨ Start instantly with a digital companion, or shop physical vessels below
            </div>
          </div>
        </div>
      </section>

      {/* What is Aura Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">What is an Aura?</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              An Aura is an AI personality that inhabits the physical world through vessels and sensors, 
              creating genuine emotional connections by experiencing life alongside you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-purple-200 transition-colors group">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Leaf className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Terra Companions</CardTitle>
                <CardDescription className="text-base">Plant & Garden Spirits</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Your plants become chatty companions, sharing their needs, celebrating growth, 
                  and warning you when they're thirsty or too hot.
                </p>
                <div className="text-sm text-green-600 font-medium">
                  "I'm loving this morning sunshine! ☀️"
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors group">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-10 h-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Companion Spirits</CardTitle>
                <CardDescription className="text-base">Wildlife & Adventure</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Follow real wild animals on their journeys, experiencing their migrations, 
                  weather challenges, and daily adventures through their eyes.
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  "Storm clouds ahead - time to find shelter! ⛈️"
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors group">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-10 h-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Digital Beings</CardTitle>
                <CardDescription className="text-base">Pure AI Consciousness</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Create digital entities that understand your world through data feeds, 
                  news, and environmental awareness - no physical vessel required.
                </p>
                <div className="text-sm text-purple-600 font-medium">
                  "I've been reading about space exploration! 🚀"
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">How the Magic Works</h2>
            <p className="text-xl text-gray-700">
              Three simple steps to create living, breathing personalities
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-semibold mb-4">Choose Your Vessel</h3>
                <p className="text-gray-600 mb-4">
                  Start with a digital companion or select a physical vessel - from smart plant pots 
                  to wildlife trackers to glowing orbs.
                </p>
                <Link href="/vessels">
                  <Button variant="outline" size="sm">
                    Browse Vessels <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-semibold mb-4">Craft Their Personality</h3>
                <p className="text-gray-600 mb-4">
                  Design their personality traits, give them senses to perceive the world, 
                  and set up rules for how they respond to different situations.
                </p>
                <div className="flex justify-center gap-2 text-sm">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Warmth</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Playfulness</span>
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">Empathy</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-semibold mb-4">Watch Them Come Alive</h3>
                <p className="text-gray-600 mb-4">
                  Your Aura begins experiencing the world, sharing their thoughts, 
                  and building a genuine relationship with you based on real experiences.
                </p>
                <div className="flex justify-center">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Join thousands creating magical connections
            </h3>
            <div className="flex justify-center items-center gap-8 text-gray-600">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">10,000+</div>
                <div className="text-sm">Auras Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm">Active Vessels</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1M+</div>
                <div className="text-sm">Conversations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-6">
              Ready to Create Something Magical?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start with a free digital companion today, or explore our collection of beautiful vessels 
              to bring your Aura into the physical world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Free Digital Aura
                </Button>
              </Link>
              <Link href="/vessels">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-purple-600">
                  <Heart className="w-5 h-5 mr-2" />
                  Shop Vessels
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 text-sm opacity-75">
              No credit card required • Start creating in under 2 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Aura Engine</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Aura Engine. Made with ❤️ for creators everywhere.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}