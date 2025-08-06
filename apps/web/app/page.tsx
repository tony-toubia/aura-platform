import PublicHomePage from './(public)/page'
import Header from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function RootPage() {
  // Temporarily show public page without auth check to debug
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PublicHomePage />
      </main>
      <Footer />
    </div>
  )
}