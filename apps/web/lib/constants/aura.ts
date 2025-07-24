// apps/web/lib/constants/aura.ts

export const AURA_CARD_CONFIG = {
  maxVisibleSenses: 3,
  gradients: {
    header: 'from-primary/10 to-primary/5',
    sense: 'bg-primary/10 text-primary',
    moreIndicator: 'bg-muted text-muted-foreground'
  }
}

export const AURA_ACTIONS = {
  interact: {
    label: 'Interact',
    icon: 'MessageCircle',
    variant: 'default' as const
  },
  analytics: {
    label: 'Analytics',
    icon: 'BarChart3',
    variant: 'outline' as const
  },
  export: {
    label: 'Export',
    icon: 'Download',
    variant: 'ghost' as const
  },
  delete: {
    label: 'Delete',
    icon: 'Trash2',
    variant: 'ghost' as const
  }
}