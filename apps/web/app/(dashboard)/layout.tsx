import React from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server.server";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Aura Engine</h1>
            <nav className="flex items-center space-x-6">
              <a href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </a>
              <a href="/auras" className="text-sm font-medium hover:text-primary">
                Auras
              </a>
              <a href="/analytics" className="text-sm font-medium hover:text-primary">
                Analytics
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* now your pages all get the same container + padding */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
