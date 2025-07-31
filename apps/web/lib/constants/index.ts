// apps/web/lib/constants/index.ts
// Centralized constants export

// Re-export all constants from individual files
export * from './aura'
export * from './chat'
export * from './cooldown'
export * from './dashboard'
export * from './personality'
export * from './rules'

// Re-export from main constants file
export * from '../constants'

// ============================================================================
// COMMON APPLICATION CONSTANTS
// ============================================================================

export const APP_CONFIG = {
  name: 'Aura Platform',
  version: '1.0.0',
  description: 'AI-powered companion platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  api: {
    baseUrl: '/api',
    timeout: 30000,
  },
} as const

export const STORAGE_KEYS = {
  userPreferences: 'user-preferences',
  authToken: 'auth-token',
  lastVisitedPage: 'last-visited-page',
  draftAura: 'draft-aura',
  chatHistory: 'chat-history',
} as const

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  auras: '/auras',
  createAura: '/auras/create',
  createWithAgent: '/auras/create-with-agent',
  analytics: '/analytics',
  subscription: '/subscription',
  vessels: '/vessels',
  meetAnimals: '/meet-the-animals',
  login: '/login',
  register: '/register',
} as const

export const API_ENDPOINTS = {
  auras: '/api/auras',
  createAura: '/api/auras/create-agent-aura',
  chat: '/api/aura/chat',
  rules: '/api/behavior-rules',
  personality: '/api/personality',
  subscription: '/api/subscription',
  wildlife: '/api/wildlife',
  news: '/api/news',
} as const

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONFIG = {
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  colors: {
    primary: {
      purple: 'from-purple-600 to-purple-700',
      blue: 'from-blue-600 to-blue-700',
      green: 'from-green-600 to-green-700',
    },
    gradients: {
      primary: 'from-purple-600 to-blue-600',
      secondary: 'from-blue-600 to-indigo-600',
      success: 'from-green-500 to-emerald-500',
      warning: 'from-yellow-500 to-orange-500',
      error: 'from-red-500 to-pink-500',
    },
  },
} as const

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION_LIMITS = {
  aura: {
    nameMinLength: 1,
    nameMaxLength: 50,
    descriptionMaxLength: 500,
    maxRules: 20,
    maxSenses: 10,
  },
  rule: {
    nameMinLength: 1,
    nameMaxLength: 100,
    messageMaxLength: 500,
  },
  user: {
    nameMinLength: 1,
    nameMaxLength: 100,
    passwordMinLength: 8,
  },
} as const

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableWildlifeTracking: process.env.NEXT_PUBLIC_ENABLE_WILDLIFE === 'true',
  enableSubscriptions: process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'true',
  enableBetaFeatures: process.env.NEXT_PUBLIC_ENABLE_BETA === 'true',
  debugMode: process.env.NODE_ENV === 'development',
} as const

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  server: 'Server error. Please try again later.',
  timeout: 'Request timed out. Please try again.',
} as const

export const SUCCESS_MESSAGES = {
  auraCreated: 'Aura created successfully!',
  auraUpdated: 'Aura updated successfully!',
  auraDeleted: 'Aura deleted successfully!',
  ruleCreated: 'Rule created successfully!',
  ruleUpdated: 'Rule updated successfully!',
  ruleDeleted: 'Rule deleted successfully!',
  settingsSaved: 'Settings saved successfully!',
} as const

// ============================================================================
// SUBSCRIPTION TIERS
// ============================================================================

export const SUBSCRIPTION_LIMITS = {
  free: {
    maxAuras: 1,
    maxRulesPerAura: 3,
    maxSensesPerAura: 3,
    features: ['basic-chat', 'weather', 'news'],
  },
  personal: {
    maxAuras: 5,
    maxRulesPerAura: 10,
    maxSensesPerAura: 8,
    features: ['advanced-chat', 'all-senses', 'analytics'],
  },
  family: {
    maxAuras: 15,
    maxRulesPerAura: 20,
    maxSensesPerAura: 12,
    features: ['family-sharing', 'priority-support'],
  },
  business: {
    maxAuras: -1, // unlimited
    maxRulesPerAura: -1,
    maxSensesPerAura: -1,
    features: ['api-access', 'custom-integrations', 'dedicated-support'],
  },
} as const