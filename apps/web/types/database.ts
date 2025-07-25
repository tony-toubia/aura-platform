export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
        }
      }

      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: Database['public']['Enums']['subscription_tier']
          status: Database['public']['Enums']['subscription_status']
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier?: Database['public']['Enums']['subscription_tier']
          status?: Database['public']['Enums']['subscription_status']
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          tier?: Database['public']['Enums']['subscription_tier']
          status?: Database['public']['Enums']['subscription_status']
          expires_at?: string | null
        }
      }

      auras: {
        Row: {
          id: string
          user_id: string
          name: string
          vessel_type: Database['public']['Enums']['vessel_type']
          senses: string
          personality: Json
          communication_style: string
          voice_profile: string
          avatar: string | null
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          vessel_type: Database['public']['Enums']['vessel_type']
          personality: Json
          communication_style?: string
          voice_profile?: string
          avatar?: string | null
          enabled?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          vessel_type?: Database['public']['Enums']['vessel_type']
          personality?: Json
          communication_style?: string
          voice_profile?: string
          avatar?: string | null
          enabled?: boolean
        }
      }

      senses: {
        Row: {
          id: string
          code: string
          name: string
          category: string
          tier: Database['public']['Enums']['sense_tier']
          config: Json
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          category: string
          tier: Database['public']['Enums']['sense_tier']
          config?: Json
        }
        Update: {
          id?: string
          code?: string
          name?: string
          category?: string
          tier?: Database['public']['Enums']['sense_tier']
          config?: Json
        }
      }

      aura_senses: {
        Row: {
          id: string
          aura_id: string
          sense_id: string
          config: Json
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          aura_id: string
          sense_id: string
          config?: Json
          enabled?: boolean
        }
        Update: {
          id?: string
          aura_id?: string
          sense_id?: string
          config?: Json
          enabled?: boolean
        }
      }

      behavior_rules: {
        Row: {
          id: string
          aura_id: string
          name: string
          trigger: Json
          action: Json
          priority: number
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          aura_id: string
          name: string
          trigger: Json
          action: Json
          priority?: number
          enabled?: boolean
        }
        Update: {
          id?: string
          aura_id?: string
          name?: string
          trigger?: Json
          action?: Json
          priority?: number
          enabled?: boolean
        }
      }

      conversations: {
        Row: {
          id: string
          aura_id: string
          session_id: string
          context: Json | null
          started_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          aura_id: string
          session_id: string
          context?: Json | null
          started_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          aura_id?: string
          session_id?: string
          context?: Json | null
          started_at?: string
          ended_at?: string | null
        }
      }

      messages: {
        Row: {
          id: string
          conversation_id: string
          role: Database['public']['Enums']['message_role']
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: Database['public']['Enums']['message_role']
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: Database['public']['Enums']['message_role']
          content?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }

    Enums: {
      subscription_tier: 'free' | 'personal' | 'family' | 'business'
      subscription_status: 'active' | 'cancelled' | 'expired'
      vessel_type: 'terra' | 'companion' | 'memory' | 'sage' | 'custom'
      sense_tier: 'free' | 'vessel' | 'premium' | 'enterprise'
      message_role: 'user' | 'aura' | 'system'
    }

    Views: {}
    Functions: {}
  }
}
