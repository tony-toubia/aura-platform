import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

export function MainNav() {
  return (
    <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Aura Link
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          {/* NEW LINK ADDED HERE */}
          <Button asChild variant="ghost" size="sm">
            <Link href="/meet-the-animals">Meet the Animals</Link>
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled
              className="cursor-not-allowed opacity-60 relative"
            >
              Shop Vessels
            </Button>
            <Badge 
              className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5 pointer-events-none"
            >
              Coming Soon
            </Badge>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
