// apps/web/lib/ui-constants.ts

export const TIER_CONFIG = {
  free: {
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: '✨',
    description: 'Available to everyone'
  },
  vessel: {
    color: 'from-blue-500 to-sky-600',
    bgColor: 'from-blue-50 to-sky-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: '🔮',
    description: 'Requires physical vessel'
  },
  premium: {
    color: 'from-orange-500 to-red-600',
    bgColor: 'from-orange-50 to-red-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    icon: '💎',
    description: 'Premium subscription'
  },
  personal: {
    color: 'from-purple-500 to-pink-600',
    bgColor: 'from-purple-50 to-pink-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: '👤',
    description: 'Personal data sensors'
  }
}

export const DIFFICULTY_CONFIG = {
  easy: { 
    label: 'Easy', 
    color: 'bg-green-100 text-green-700', 
    icon: '🌱' 
  },
  moderate: { 
    label: 'Moderate', 
    color: 'bg-yellow-100 text-yellow-700', 
    icon: '🌿' 
  },
  hard: { 
    label: 'Challenging', 
    color: 'bg-red-100 text-red-700', 
    icon: '🌳' 
  }
}

export const CATEGORY_CONFIG = {
  houseplant: {
    name: 'Houseplants',
    icon: '🏠',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    description: 'Indoor plants that thrive in homes'
  },
  herb: {
    name: 'Herbs',
    icon: '🌿',
    color: 'from-lime-500 to-green-600',
    bgColor: 'from-lime-50 to-green-50',
    description: 'Culinary and aromatic herbs'
  },
  vegetable: {
    name: 'Vegetables',
    icon: '🥬',
    color: 'from-orange-500 to-red-600',
    bgColor: 'from-orange-50 to-red-50',
    description: 'Edible plants for your garden'
  },
  succulent: {
    name: 'Succulents',
    icon: '🌵',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'from-purple-50 to-pink-50',
    description: 'Low-maintenance desert plants'
  },
  flower: {
    name: 'Flowers',
    icon: '🌸',
    color: 'from-pink-500 to-purple-600',
    bgColor: 'from-pink-50 to-purple-50',
    description: 'Beautiful blooming plants'
  }
}

// Common gradient classes
export const GRADIENTS = {
  primary: 'from-purple-600 to-blue-600',
  success: 'from-green-600 to-emerald-600',
  warning: 'from-yellow-600 to-orange-600',
  danger: 'from-red-600 to-pink-600',
  
  primaryHover: 'hover:from-purple-700 hover:to-blue-700',
  successHover: 'hover:from-green-700 hover:to-emerald-700',
  warningHover: 'hover:from-yellow-700 hover:to-orange-700',
  dangerHover: 'hover:from-red-700 hover:to-pink-700',
}