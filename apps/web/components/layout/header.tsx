import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/mobile-nav'
import { Sparkles } from 'lucide-react'
import { redirect } from 'next/navigation'

// Server action for signing out, co-located for simplicity
async function signOut() {
  'use server'
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function Header() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const publicNavItems = [
    { href: '/meet-the-animals', label: 'Meet the Animals' },
    { href: '/vessels', label: 'Shop Vessels' },
  ]

  const dashboardNavItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/auras', label: 'Auras' },
    { href: '/vessels', label: 'Vessel Shop' },
    // ✨ FIX: Corrected typo from "lable" to "label"
    { href: '/meet-the-animals', label: 'Meet the Animals' },
//    { href: '/analytics', label: 'Analytics' },
    { href: '/subscription', label: 'Subscription' },
  ]

  const navItems = user ? dashboardNavItems : publicNavItems

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Aura Engine
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">Welcome back!</div>
                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                  {user.email}
                </div>
              </div>
              <form action={signOut}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="submit"
                  className="border-2 hover:border-purple-300 hover:bg-purple-50"
                >
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav navItems={navItems} userEmail={user?.email} signOutAction={signOut} />
        </div>
      </div>
    </header>
  )
}
