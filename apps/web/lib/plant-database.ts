// apps/web/lib/plant-database.ts

export interface PlantIdealConditions {
  temperature: { min: number; max: number; unit: '°C' }
  lightLevel: { min: number; max: number; description: string }
  soilMoisture: { min: number; max: number; description: string }
  humidity?: { min: number; max: number }
  wateringFrequency: string
  difficulty: 'easy' | 'moderate' | 'hard'
}

export interface PlantInfo {
  id: string
  name: string
  scientificName: string
  category: 'houseplant' | 'herb' | 'vegetable' | 'succulent' | 'flower' | 'tree'
  icon: string
  description: string
  idealConditions: PlantIdealConditions
  tips: string[]
}

export const PLANT_DATABASE: Record<string, PlantInfo> = {
  // Houseplants
  'pothos': {
    id: 'pothos',
    name: 'Pothos',
    scientificName: 'Epipremnum aureum',
    category: 'houseplant',
    icon: '🌿',
    description: 'A hardy trailing plant perfect for beginners',
    idealConditions: {
      temperature: { min: 18, max: 27, unit: '°C' },
      lightLevel: { min: 30, max: 70, description: 'Indirect light' },
      soilMoisture: { min: 30, max: 60, description: 'Slightly moist' },
      humidity: { min: 40, max: 60 },
      wateringFrequency: 'Every 1-2 weeks',
      difficulty: 'easy'
    },
    tips: [
      'Very forgiving and can tolerate neglect',
      'Propagates easily in water',
      'Can survive in low light conditions'
    ]
  },
  'snake-plant': {
    id: 'snake-plant',
    name: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    category: 'houseplant',
    icon: '🌱',
    description: 'Nearly indestructible plant that purifies air',
    idealConditions: {
      temperature: { min: 16, max: 30, unit: '°C' },
      lightLevel: { min: 20, max: 80, description: 'Tolerates most light' },
      soilMoisture: { min: 10, max: 30, description: 'Dry soil' },
      humidity: { min: 30, max: 50 },
      wateringFrequency: 'Every 2-3 weeks',
      difficulty: 'easy'
    },
    tips: [
      'Let soil dry completely between waterings',
      'Tolerates low light but grows faster in bright light',
      'Perfect for forgetful waterers'
    ]
  },
  'monstera': {
    id: 'monstera',
    name: 'Monstera',
    scientificName: 'Monstera deliciosa',
    category: 'houseplant',
    icon: '🌴',
    description: 'Stunning tropical plant with split leaves',
    idealConditions: {
      temperature: { min: 18, max: 27, unit: '°C' },
      lightLevel: { min: 40, max: 70, description: 'Bright indirect light' },
      soilMoisture: { min: 40, max: 60, description: 'Evenly moist' },
      humidity: { min: 60, max: 80 },
      wateringFrequency: 'Weekly',
      difficulty: 'moderate'
    },
    tips: [
      'Loves humidity - mist regularly',
      'Provide a moss pole for climbing',
      'Wipe leaves to keep them shiny'
    ]
  },
  'fiddle-leaf-fig': {
    id: 'fiddle-leaf-fig',
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    category: 'houseplant',
    icon: '🌳',
    description: 'Dramatic plant with large violin-shaped leaves',
    idealConditions: {
      temperature: { min: 16, max: 24, unit: '°C' },
      lightLevel: { min: 60, max: 80, description: 'Bright light' },
      soilMoisture: { min: 40, max: 60, description: 'Evenly moist' },
      humidity: { min: 50, max: 70 },
      wateringFrequency: 'Weekly',
      difficulty: 'hard'
    },
    tips: [
      'Dislikes being moved',
      'Sensitive to overwatering',
      'Dust leaves regularly'
    ]
  },
  
  // Herbs
  'basil': {
    id: 'basil',
    name: 'Basil',
    scientificName: 'Ocimum basilicum',
    category: 'herb',
    icon: '🌿',
    description: 'Aromatic herb perfect for cooking',
    idealConditions: {
      temperature: { min: 18, max: 27, unit: '°C' },
      lightLevel: { min: 70, max: 90, description: 'Full sun' },
      soilMoisture: { min: 50, max: 70, description: 'Consistently moist' },
      humidity: { min: 40, max: 60 },
      wateringFrequency: 'Every 2-3 days',
      difficulty: 'easy'
    },
    tips: [
      'Pinch flowers to encourage bushier growth',
      'Harvest frequently for best flavor',
      'Sensitive to cold temperatures'
    ]
  },
  'mint': {
    id: 'mint',
    name: 'Mint',
    scientificName: 'Mentha',
    category: 'herb',
    icon: '🍃',
    description: 'Fast-growing aromatic herb',
    idealConditions: {
      temperature: { min: 15, max: 21, unit: '°C' },
      lightLevel: { min: 50, max: 80, description: 'Partial to full sun' },
      soilMoisture: { min: 60, max: 80, description: 'Moist soil' },
      humidity: { min: 50, max: 70 },
      wateringFrequency: 'Every 1-2 days',
      difficulty: 'easy'
    },
    tips: [
      'Can be invasive - contain in pots',
      'Harvest regularly to prevent flowering',
      'Grows well in partial shade'
    ]
  },
  'rosemary': {
    id: 'rosemary',
    name: 'Rosemary',
    scientificName: 'Rosmarinus officinalis',
    category: 'herb',
    icon: '🌾',
    description: 'Woody Mediterranean herb',
    idealConditions: {
      temperature: { min: 10, max: 25, unit: '°C' },
      lightLevel: { min: 70, max: 90, description: 'Full sun' },
      soilMoisture: { min: 20, max: 40, description: 'Well-drained, dry' },
      humidity: { min: 30, max: 50 },
      wateringFrequency: 'Every 1-2 weeks',
      difficulty: 'moderate'
    },
    tips: [
      'Prefers dry conditions',
      'Needs excellent drainage',
      'Can survive light frost'
    ]
  },
  
  // Vegetables
  'tomato': {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'vegetable',
    icon: '🍅',
    description: 'Popular fruiting vegetable',
    idealConditions: {
      temperature: { min: 18, max: 29, unit: '°C' },
      lightLevel: { min: 80, max: 100, description: 'Full sun' },
      soilMoisture: { min: 50, max: 70, description: 'Evenly moist' },
      humidity: { min: 40, max: 70 },
      wateringFrequency: 'Daily in hot weather',
      difficulty: 'moderate'
    },
    tips: [
      'Needs support stakes or cages',
      'Remove suckers for better fruit',
      'Consistent watering prevents splitting'
    ]
  },
  'lettuce': {
    id: 'lettuce',
    name: 'Lettuce',
    scientificName: 'Lactuca sativa',
    category: 'vegetable',
    icon: '🥬',
    description: 'Fast-growing salad green',
    idealConditions: {
      temperature: { min: 10, max: 21, unit: '°C' },
      lightLevel: { min: 40, max: 70, description: 'Partial sun' },
      soilMoisture: { min: 60, max: 80, description: 'Consistently moist' },
      humidity: { min: 50, max: 70 },
      wateringFrequency: 'Daily',
      difficulty: 'easy'
    },
    tips: [
      'Prefers cooler temperatures',
      'Harvest outer leaves first',
      'Bolts in hot weather'
    ]
  },
  
  // Succulents
  'aloe-vera': {
    id: 'aloe-vera',
    name: 'Aloe Vera',
    scientificName: 'Aloe barbadensis',
    category: 'succulent',
    icon: '🌵',
    description: 'Medicinal succulent with healing properties',
    idealConditions: {
      temperature: { min: 13, max: 27, unit: '°C' },
      lightLevel: { min: 60, max: 80, description: 'Bright indirect light' },
      soilMoisture: { min: 10, max: 30, description: 'Very dry' },
      humidity: { min: 30, max: 50 },
      wateringFrequency: 'Every 2-3 weeks',
      difficulty: 'easy'
    },
    tips: [
      'Let soil dry completely between waterings',
      'Use well-draining cactus soil',
      'Harvest leaves for burns and cuts'
    ]
  },
  'jade-plant': {
    id: 'jade-plant',
    name: 'Jade Plant',
    scientificName: 'Crassula ovata',
    category: 'succulent',
    icon: '💎',
    description: 'Lucky plant with thick, glossy leaves',
    idealConditions: {
      temperature: { min: 15, max: 24, unit: '°C' },
      lightLevel: { min: 70, max: 90, description: 'Bright light' },
      soilMoisture: { min: 10, max: 30, description: 'Dry between waterings' },
      humidity: { min: 30, max: 50 },
      wateringFrequency: 'Every 2-3 weeks',
      difficulty: 'easy'
    },
    tips: [
      'Can live for decades',
      'Propagates easily from leaves',
      'Prune to maintain shape'
    ]
  },
  
  // Flowers
  'orchid': {
    id: 'orchid',
    name: 'Orchid',
    scientificName: 'Phalaenopsis',
    category: 'flower',
    icon: '🌺',
    description: 'Elegant flowering plant',
    idealConditions: {
      temperature: { min: 18, max: 27, unit: '°C' },
      lightLevel: { min: 30, max: 60, description: 'Indirect light' },
      soilMoisture: { min: 40, max: 60, description: 'Slightly moist' },
      humidity: { min: 60, max: 80 },
      wateringFrequency: 'Weekly',
      difficulty: 'moderate'
    },
    tips: [
      'Water by soaking, then drain',
      'Use orchid bark, not soil',
      'Blooms can last months'
    ]
  },
  'peace-lily': {
    id: 'peace-lily',
    name: 'Peace Lily',
    scientificName: 'Spathiphyllum',
    category: 'flower',
    icon: '🌸',
    description: 'Air-purifying plant with white blooms',
    idealConditions: {
      temperature: { min: 18, max: 26, unit: '°C' },
      lightLevel: { min: 20, max: 50, description: 'Low to medium light' },
      soilMoisture: { min: 50, max: 70, description: 'Evenly moist' },
      humidity: { min: 50, max: 70 },
      wateringFrequency: 'Weekly',
      difficulty: 'easy'
    },
    tips: [
      'Droops when thirsty',
      'Toxic to pets',
      'Remove spent blooms'
    ]
  },
  
  // Custom/Other
  'custom': {
    id: 'custom',
    name: 'Custom Plant',
    scientificName: 'User specified',
    category: 'houseplant',
    icon: '🌱',
    description: 'Set your own ideal conditions',
    idealConditions: {
      temperature: { min: 18, max: 25, unit: '°C' },
      lightLevel: { min: 40, max: 70, description: 'Medium light' },
      soilMoisture: { min: 40, max: 60, description: 'Moderate moisture' },
      humidity: { min: 40, max: 60 },
      wateringFrequency: 'As needed',
      difficulty: 'moderate'
    },
    tips: [
      'Research your specific plant\'s needs',
      'Observe how it responds to conditions',
      'Adjust care based on seasons'
    ]
  }
}

export const getPlantsByCategory = (category: PlantInfo['category']): PlantInfo[] => {
  return Object.values(PLANT_DATABASE).filter(plant => plant.category === category)
}

export const getPlantById = (id: string): PlantInfo | undefined => {
  return PLANT_DATABASE[id]
}