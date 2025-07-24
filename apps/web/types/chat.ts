// apps/web/types/chat.ts

import type { LucideIcon } from 'lucide-react'
import type { Message } from '@/types'

export interface ChatInterfaceProps {
  aura: any
  conversationId?: string
  showInfluenceLog?: boolean
}

export interface SenseDisplayData {
  id: string
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  borderColor: string
}

export interface SenseIconMap {
  [key: string]: LucideIcon
}

export interface InfluenceCategory {
  type: 'general' | 'sense' | 'personality' | 'error'
  title: string
  icon: LucideIcon
  bgColor: string
  borderColor: string
  textColor: string
  iconColor: string
}

export interface ChatUIState {
  messages: Message[]
  input: string
  isTyping: boolean
  showInfluence: boolean
  voiceEnabled: boolean
  conversationId?: string
  senseData: Record<string, any>
  isLoadingSenses: boolean
  showSenseStatus: boolean
}