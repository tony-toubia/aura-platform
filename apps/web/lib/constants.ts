export const VESSEL_TYPES = [
  { id: 'terra', name: 'Terra', icon: '🌱', description: 'Plant Companion', price: 79 },
  { id: 'companion', name: 'Companion', icon: '🐘', description: 'Wildlife Connection', price: 149 },
  { id: 'memory', name: 'Memory', icon: '💎', description: 'Digital Keepsake', price: 99 },
  { id: 'sage', name: 'Sage', icon: '📚', description: 'Knowledge Artifact', price: 129 }
] as const

export const PERSONALITY_TRAITS = [
  { id: 'warmth', name: 'Warmth', low: 'Analytical', high: 'Warm' },
  { id: 'playfulness', name: 'Playfulness', low: 'Serious', high: 'Playful' },
  { id: 'verbosity', name: 'Verbosity', low: 'Concise', high: 'Verbose' },
  { id: 'empathy', name: 'Empathy', low: 'Objective', high: 'Empathetic' },
  { id: 'creativity', name: 'Creativity', low: 'Factual', high: 'Creative' }
] as const

export const AVAILABLE_SENSES = [
  { id: 'weather', name: 'Weather', category: 'Environmental', tier: 'free' },
  { id: 'soil_moisture', name: 'Soil Moisture', category: 'Sensors', tier: 'vessel' },
  { id: 'light_level', name: 'Light Level', category: 'Sensors', tier: 'vessel' },
  { id: 'news', name: 'News Feed', category: 'Knowledge', tier: 'free' },
  { id: 'wildlife', name: 'Wildlife Tracking', category: 'Nature', tier: 'premium' },
  { id: 'air_quality', name: 'Air Quality', category: 'Environmental', tier: 'free' }
] as const