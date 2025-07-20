"use client"

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, User, LogOut, X, ArrowRight } from "lucide-react"

interface NavItem { href: string; label: string }
interface MobileNavProps {
  navItems: NavItem[]
  userEmail?: string | null
  signOutAction: () => Promise<void>
}

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
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="py-3 px-4 rounded-md text-base font-medium hover:bg-accent hover:text-primary transition-colors"
              >
                {item.label}
              </a>
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
                <form action={signOutAction}>
                  <Button
                    variant="outline"
                    size="sm"
                    type="submit"
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </form>
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
