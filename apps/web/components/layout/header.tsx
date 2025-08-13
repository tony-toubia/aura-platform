import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileNav } from '@/components/mobile-nav'
import { SignOutButton } from '@/components/layout/sign-out-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sparkles, ChevronDown, User, Settings, CreditCard, Link2, Activity } from 'lucide-react'
import { signOut } from '@/app/actions/auth'  // pull in the server action

export default async function Header() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const publicNavItems = [
    { href: '/meet-the-animals', label: 'Meet the Animals', disabled: true, comingSoon: true },
    { href: '/vessels', label: 'Shop Vessels', disabled: true, comingSoon: true },
  ]

  const dashboardNavItems = [
    { href: '/dashboard', label: 'Dashboard', disabled: false, comingSoon: false },
    { href: '/auras', label: 'Auras', disabled: false, comingSoon: false },
  ]

  const vesselDropdownItems = [
    { href: '/vessels', label: 'Shop', disabled: true, comingSoon: true },
    { href: '/meet-the-animals', label: 'Meet the Animals', disabled: true, comingSoon: true },
    { href: '/wildlife-tracking', label: 'Wildlife Tracking', disabled: false, comingSoon: false },
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
            Aura Link
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <div key={item.href} className="relative">
              {item.disabled ? (
                <>
                  <span className="px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed rounded-lg">
                    {item.label}
                  </span>
                  {item.comingSoon && (
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5 pointer-events-none">
                      Coming Soon
                    </Badge>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          
          {/* Vessels Dropdown - only show for authenticated users */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                >
                  Vessels
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-white border border-gray-200 shadow-lg">
                {vesselDropdownItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild={!item.disabled}>
                    {item.disabled ? (
                      <div className="relative flex items-center">
                        <span className="text-gray-400 cursor-not-allowed">
                          {item.label}
                        </span>
                        {item.comingSoon && (
                          <Badge className="ml-2 bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Link href={item.href}>
                        {item.label}
                      </Link>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
              
              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user.email || "User"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="absolute -bottom-1 -right-1 h-3 w-3 text-gray-500 bg-white rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-gray-900">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/connections" className="flex items-center">
                      <Link2 className="mr-2 h-4 w-4" />
                      <span>Connected Services</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/subscription" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/billing" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/senses-diagnostics" className="flex items-center">
                      <Activity className="mr-2 h-4 w-4" />
                      <span>Senses Diagnostics</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="https://app.aura-link.app/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="https://app.aura-link.app/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav 
            navItems={user ? [...navItems, ...vesselDropdownItems] : navItems} 
            userEmail={user?.email} 
            signOutAction={signOut} 
          />
        </div>
      </div>
    </header>
)
}
