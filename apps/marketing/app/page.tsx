import Link from "next/link";
import { Sparkles, Shield, Zap, ArrowRight, Star, Cpu } from "lucide-react";
import { AuraButton } from "@/components/aura/AuraButton";

/**
 * Marketing homepage (public). Routing remains unchanged.
 * Implements Magical Aura system primitives and utilities defined in apps/web/app/globals.css
 * - aura-bg, aura-noise, aura-particles, aura-gradient-text, aura-glass, aura-surface, aura-card, aura-underline, aura-focus
 * - Respects prefers-reduced-motion via global rules
 */
export default function HomePage() {
  const dashboardUrl =
    process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.aura-link.app";

  return (
    <div className="min-h-screen">
      {/* Header - translucent glass topbar */}
      <header
        className="sticky top-0 z-50"
        aria-label="Top navigation"
        role="banner"
      >
        <div className="aura-glass border-b border-[color:var(--border-subtle)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="Home">
              <div className="w-8 h-8 rounded-lg aura-orb" aria-hidden />
              <span className="text-base sm:text-lg font-semibold aura-gradient-text">
                Aura Link
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
              <Link href="#features" className="text-sm text-[color:var(--aura-fg-muted)] hover:text-[color:var(--aura-fg)] transition-colors aura-underline">
                Features
              </Link>
              <Link href="#how" className="text-sm text-[color:var(--aura-fg-muted)] hover:text-[color:var(--aura-fg)] transition-colors aura-underline">
                How it works
              </Link>
              <Link href="#trust" className="text-sm text-[color:var(--aura-fg-muted)] hover:text-[color:var(--aura-fg)] transition-colors aura-underline">
                Trust
              </Link>
              <div className="flex items-center gap-3">
                <Link href={`${dashboardUrl}/login`} aria-label="Sign in">
                  <AuraButton variant="glass" className="h-9 px-3">
                    Sign In
                  </AuraButton>
                </Link>
                <Link href={`${dashboardUrl}/register`} aria-label="Get started">
                  <AuraButton variant="primary" className="h-9 px-4">
                    Get Started
                  </AuraButton>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero - full viewport with ambient visuals */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden aura-bg"
        aria-labelledby="hero-title"
      >
        {/* Noise and particles */}
        <div className="absolute inset-0 aura-noise pointer-events-none" aria-hidden />
        <div className="absolute inset-0 aura-particles pointer-events-none" aria-hidden>
          {/* lightweight static placeholder particles */}
          <div className="particle" style={{ top: "20%", left: "15%" }} />
          <div className="particle" style={{ top: "65%", left: "25%", animationDelay: "1.2s" }} />
          <div className="particle" style={{ top: "40%", left: "70%", animationDelay: "0.6s" }} />
          <div className="particle" style={{ top: "75%", left: "80%", animationDelay: "1.9s" }} />
        </div>

        {/* Aura orb decoration */}
        <div
          className="absolute -top-16 -right-16 w-72 h-72 opacity-25 aura-orb"
          aria-hidden
          style={{
            backgroundSize: "200% 200%",
            animation: "gradient-drift 18s var(--easing-standard) infinite",
            filter: "blur(6px)",
          }}
        />

        {/* Content */}
        <div className="relative z-[var(--z-surface)] mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 aura-glass px-3 py-1.5 rounded-[var(--radius-xl)] text-xs text-[color:var(--aura-fg-subtle)] mb-6">
            <Sparkles className="w-4 h-4 text-[color:var(--aura-primary)]" />
            Welcome to the Magical Aura system
          </div>

          <h1
            id="hero-title"
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold aura-gradient-text leading-[1.1] tracking-tight"
            style={{ animation: "aura-pulse 6s var(--easing-standard) infinite" }}
          >
            Meet your Digital Aura
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-[color:var(--aura-fg-muted)] max-w-3xl mx-auto">
            Create a personalized AI companion that learns from your world and helps you
            act with clarity—powered by ambient context and respectful automation.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`${dashboardUrl}/register`}>
              <AuraButton variant="primary" className="h-11 px-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Your Aura
                <ArrowRight className="w-4 h-4 ml-2" />
              </AuraButton>
            </Link>
            <Link href="#how">
              <AuraButton variant="glass" className="h-11 px-6">
                How it works
              </AuraButton>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex flex-col items-center">
            <div className="flex items-center justify-center gap-1 text-amber-400" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="mt-2 text-sm text-[color:var(--aura-fg-subtle)]">
              Trusted by creators and teams building meaningful assistants
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold aura-gradient-text">Powerful features</h2>
            <p className="mt-3 text-[color:var(--aura-fg-muted)] max-w-2xl mx-auto">
              Built with tokens, utilities, and primitives for performance and accessibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Cpu className="w-5 h-5" />,
                title: "Ambient Intelligence",
                copy:
                  "Your Aura synthesizes signals with privacy-respectful context to assist proactively.",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Privacy First",
                copy:
                  "Local-first decisions and explicit permissions keep you in control of your data.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Fast & Lightweight",
                copy:
                  "CSS-driven visuals, reduced motion support, and minimal runtime JavaScript.",
              },
            ].map((f, idx) => (
              <article
                key={idx}
                className="aura-card p-6 transition-transform duration-200 hover:-translate-y-1"
                role="article"
              >
                <div className="w-10 h-10 aura-glass rounded-lg flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[color:var(--aura-fg-muted)]">{f.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Logos */}
      <section id="trust" className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="aura-surface px-4 sm:px-6 py-6 sm:py-8 rounded-[var(--radius-lg)] border border-[color:var(--border-subtle)]">
            <p className="text-center text-xs sm:text-sm text-[color:var(--aura-fg-subtle)] mb-4">
              Backed by a growing community
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-80">
              <div className="aura-shimmer h-10 rounded-md" aria-hidden />
              <div className="aura-shimmer h-10 rounded-md" aria-hidden />
              <div className="aura-shimmer h-10 rounded-md" aria-hidden />
              <div className="aura-shimmer h-10 rounded-md" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold">How it works</h2>
            <p className="mt-3 text-[color:var(--aura-fg-muted)] max-w-2xl mx-auto">
              Three simple steps to bring your Aura to life.
            </p>
          </div>

          <ol className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Define intent",
                copy: "Describe your goals and boundaries. Your Aura sets a clear purpose.",
              },
              {
                step: "2",
                title: "Connect signals",
                copy: "Optionally link data sources. Stay private with explicit controls.",
              },
              {
                step: "3",
                title: "Act with clarity",
                copy: "Your Aura suggests or automates with your approval and oversight.",
              },
            ].map((s, idx) => (
              <li key={idx} className="aura-card p-6">
                <div className="aura-glass inline-flex items-center justify-center w-8 h-8 rounded-full mb-3 text-sm font-semibold">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-[color:var(--aura-fg-muted)]">{s.copy}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <Link href={`${dashboardUrl}/register`} className="inline-block">
              <AuraButton variant="primary" className="h-11 px-6">
                Start free
                <ArrowRight className="w-4 h-4 ml-2" />
              </AuraButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-[color:var(--border-subtle)] aura-surface">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md aura-orb" aria-hidden />
              <span className="text-sm font-medium">Aura Link</span>
            </div>
            <nav className="flex items-center gap-4 text-xs text-[color:var(--aura-fg-subtle)]" aria-label="Footer">
              <Link href="#features" className="hover:text-[color:var(--aura-fg)] aura-underline">Features</Link>
              <Link href="#how" className="hover:text-[color:var(--aura-fg)] aura-underline">How it works</Link>
              <Link href="#trust" className="hover:text-[color:var(--aura-fg)] aura-underline">Trust</Link>
            </nav>
            <p className="text-xs text-[color:var(--aura-fg-subtle)]">
              © {new Date().getFullYear()} Aura Link
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}