import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { AuraLimitService } from '@/lib/services/aura-limit-service'

export async function auraLimitMiddleware(request: NextRequest) {
  // Only apply to aura-related routes
  const auraRoutes = ['/auras/', '/api/aura/', '/api/auras/']
  const isAuraRoute = auraRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  
  if (!isAuraRoute) {
    return NextResponse.next()
  }

  // Skip limit checks for certain endpoints
  const skipRoutes = [
    '/api/auras/limit-management', // Our own limit management API
    '/auras/create', // Creation is handled by subscription guards
    '/auras/page' // List page should always be accessible
  ]
  
  const shouldSkip = skipRoutes.some(route => request.nextUrl.pathname.includes(route))
  if (shouldSkip) {
    return NextResponse.next()
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Middleware can't set cookies, so we skip this
          },
          remove(name: string, options: any) {
            // Middleware can't remove cookies, so we skip this
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.next() // Let auth middleware handle this
    }

    // Check if user is over their aura limit
    const limitStatus = await AuraLimitService.checkAuraLimitStatus(user.id)
    
    // If user is over limit and trying to access specific aura functionality
    if (limitStatus.isOverLimit) {
      const isAuraInteraction = request.nextUrl.pathname.match(/\/auras\/[^\/]+\/(chat|edit|rules)/)
      const isAuraAPI = request.nextUrl.pathname.startsWith('/api/aura/') && 
                       !request.nextUrl.pathname.includes('/limit-management')
      
      if (isAuraInteraction || isAuraAPI) {
        // Extract aura ID from the path
        const auraIdMatch = request.nextUrl.pathname.match(/\/auras\/([^\/]+)/) || 
                           request.nextUrl.pathname.match(/\/api\/aura\/([^\/]+)/)
        
        if (auraIdMatch) {
          const auraId = auraIdMatch[1]
          
          // Check if this specific aura is enabled
          const { data: aura } = await supabase
            .from('auras')
            .select('enabled')
            .eq('id', auraId)
            .eq('user_id', user.id)
            .single()
          
          // If aura is disabled due to limits, redirect to management page
          if (aura && !aura.enabled && auraId) {
            const redirectUrl = new URL('/auras', request.url)
            redirectUrl.searchParams.set('limitExceeded', 'true')
            redirectUrl.searchParams.set('disabledAura', auraId)
            return NextResponse.redirect(redirectUrl)
          }
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Aura limit middleware error:', error)
    // Don't block the request on middleware errors
    return NextResponse.next()
  }
}