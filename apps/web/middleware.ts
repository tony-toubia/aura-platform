import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/config/env'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return response
  }

  // Get the host to determine domain-specific behavior
  const host = request.headers.get('host')
  
  // Handle cross-domain redirects first (before creating Supabase client)
  // Redirect auth pages from marketing site to app subdomain
  if (host === 'aura-link.app' && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    const appUrl = new URL(request.url)
    appUrl.host = 'app.aura-link.app'
    return NextResponse.redirect(appUrl)
  }

  // Define public routes that don't need authentication
  const publicRoutes = ['/', '/vessels', '/meet-the-animals']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  )

  // For public routes on the marketing domain, skip Supabase authentication entirely
  if (host === 'aura-link.app' && isPublicRoute) {
    return response
  }

  // Only create Supabase client for routes that need authentication
  try {
    const supabase = createServerClient(
      env.SUPABASE.URL,
      env.SUPABASE.ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/auras', '/conversations', '/subscription', '/account', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Handle remaining domain-specific redirects
  if (host === 'aura-link.app' && isProtectedRoute) {
    // Redirect from marketing site to dashboard subdomain for protected routes
    const dashboardUrl = new URL(request.url)
    dashboardUrl.host = 'app.aura-link.app'
    return NextResponse.redirect(dashboardUrl)
  }

  // Redirect unauthenticated users from app subdomain root to login
  if (host === 'app.aura-link.app' && request.nextUrl.pathname === '/' && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's an error in middleware, just continue without blocking
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
}