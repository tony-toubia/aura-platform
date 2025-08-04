import React from "react";
import Header from "@/components/layout/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-blue-50/50 to-pink-50/50">
      {/* The entire header is now handled by this single component */}
      <Header />
      <main className="container mx-auto px-2 py-4">{children}</main>
    </div>
  );
}
