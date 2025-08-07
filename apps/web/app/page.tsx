import PublicHomePage from './(public)/page'
import PublicLayout from './(public)/layout'

export default function RootPage() {
  // Show public page for unauthenticated users with proper layout
  return (
    <PublicLayout>
      <PublicHomePage />
    </PublicLayout>
  )
}