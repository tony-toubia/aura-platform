import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assistant Studio | Aura Link',
  description: 'Build your intelligent AI assistant with personalized data sources and behaviors.',
}

export default function AssistantStudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}