import React from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server.server";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";

// Server action for signing out
async function signOut() {
  "use server";
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/auras", label: "Auras" },
      { href: "/vessels", label: "Vessel Shop" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Aura Engine</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop User Info & Sign Out */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {user.email}
            </span>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNav navItems={navItems} userEmail={user.email} signOutAction={signOut} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}