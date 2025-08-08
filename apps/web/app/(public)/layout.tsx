import { Footer } from "@/components/layout/footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Public pages handle their own headers to avoid server-side auth issues */}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
