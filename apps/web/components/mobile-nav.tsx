"use client"

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/layout/sign-out-button"
import { Menu, User, X, ArrowRight, Settings, CreditCard } from "lucide-react"
import type { MobileNavProps } from '@/types/components'

export function MobileNav({ navItems, userEmail, signOutAction }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [isOpen])

  // Lock body scrolling
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset"
  }, [isOpen])

  const drawer = (
    <>
      {/* full-screen backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />
      {/* slide-in panel */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-72
          bg-white           /* solid white in light mode */
          dark:bg-card       /* use your --card token in dark mode */
          border-l shadow-lg z-50
          transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Aura Engine</h2>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => (
              <div key={item.href} className="relative">
                {item.disabled ? (
                  <>
                    <span className="py-3 px-4 rounded-md text-base font-medium text-gray-400 cursor-not-allowed">
                      {item.label}
                    </span>
                    {item.comingSoon && (
                      <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5 pointer-events-none">
                        Coming Soon
                      </Badge>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="py-3 px-4 rounded-md text-base font-medium hover:bg-accent hover:text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto p-4 space-y-4 border-t">
            {/* FIX: Conditionally render based on user session */}
            {userEmail ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2 bg-accent rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {userEmail}
                  </span>
                </div>
                
                {/* User Menu Items */}
                <div className="space-y-2">
                  <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                    <Link href="/account" onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                    <Link href="/subscription" onClick={() => setIsOpen(false)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Subscription
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                    <Link href="/billing" onClick={() => setIsOpen(false)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing
                    </Link>
                  </Button>
                </div>
                
                <SignOutButton variant="mobile" />
              </>
            ) : (
              <div className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-center">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Link href="/register">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="p-2" onClick={() => setIsOpen((o) => !o)}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>
      {isOpen && createPortal(drawer, document.body)}
    </div>
  )
}
