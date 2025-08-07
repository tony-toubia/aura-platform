import PublicHomePage from './(public)/page'
import Header from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function RootPage() {
  // Show public page for unauthenticated users
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