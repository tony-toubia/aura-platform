import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, Brain, Wifi, MessageCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Aura Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Create Living Personalities for Your World
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Design AI-powered personalities that inhabit physical objects, creating meaningful connections through real-world data and contextual awareness.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              <Zap className="w-4 h-4" />
              Start Creating
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </Link>
          <Link href="/vessels">
            <Button size="lg" variant="outline">
              Browse Vessels
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personality Matrix</h3>
            <p className="text-muted-foreground">
              Define unique personalities with customizable traits that shape every interaction
            </p>
          </Card>
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-World Senses</h3>
            <p className="text-muted-foreground">
              Connect to live data streams from weather to wildlife tracking
            </p>
          </Card>
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Natural Conversations</h3>
            <p className="text-muted-foreground">
              Engage in contextual conversations influenced by real-time conditions
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to bring your ideas to life?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands creating meaningful connections between AI and the physical world.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              <Zap className="w-4 h-4" />
              Create Your First Aura
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}
