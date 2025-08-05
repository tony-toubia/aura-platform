import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aura Link - Your Digital AI Companion',
  description: 'Connect with your personalized AI companion that lives in the cloud and integrates with your digital life.',
  keywords: ['AI', 'digital companion', 'artificial intelligence', 'personal assistant'],
  authors: [{ name: 'Aura Link Team' }],
  openGraph: {
    title: 'Aura Link - Your Digital AI Companion',
    description: 'Connect with your personalized AI companion that lives in the cloud and integrates with your digital life.',
    url: 'https://aura-link.app',
    siteName: 'Aura Link',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Link - Your Digital AI Companion',
    description: 'Connect with your personalized AI companion that lives in the cloud and integrates with your digital life.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}