# Contextual Help and Guidance System Technical Specifications

## Overview
This document provides detailed technical specifications for implementing **UX Recommendation 3: Contextual Help and Guidance System** to reduce the learning curve and improve user onboarding through intelligent, progressive help features.

## Current State Analysis

### Identified Problems
1. **Complex Concepts**: Terms like "senses", "vessels", "rules", "auras" lack clear explanations
2. **No Progressive Onboarding**: Users face full complexity immediately
3. **Hidden Advanced Features**: Power user features are not discoverable
4. **High Support Burden**: Many tickets related to basic usage questions
5. **Poor Feature Adoption**: Advanced features underutilized due to lack of awareness

## Proposed Contextual Help Architecture

### 1. Core Help System Components

```
apps/web/components/help/
├── index.tsx                    # Main help system provider
├── smart-tooltip.tsx           # Contextual tooltips with concept explanations
├── product-tour.tsx            # Interactive guided tours
├── help-widget.tsx             # Floating help widget
├── concept-explainer.tsx       # Rich concept explanation modals
├── progress-tracker.tsx        # User learning progress tracking
├── feature-spotlight.tsx       # New feature announcements
└── help-search.tsx            # Searchable help content
```

### 2. Help System Provider

#### Main Help Context Provider

```typescript
// apps/web/components/help/index.tsx
interface HelpContextValue {
  // User progress tracking
  userProgress: UserHelpProgress
  hasSeenConcept: (conceptId: string) => boolean
  markConceptSeen: (conceptId: string) => void
  
  // Tour management
  startTour: (tourId: string) => void
  completeTour: (tourId: string) => void
  
  // Feature discovery
  unlockFeature: (featureId: string) => void
  isFeatureUnlocked: (featureId: string) => boolean
  
  // Help content
  getConceptExplanation: (conceptId: string) => ConceptExplanation
  searchHelp: (query: string) => HelpSearchResult[]
}

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [userProgress, setUserProgress] = useState<UserHelpProgress>({
    seenConcepts: new Set(),
    completedTours: new Set(),
    unlockedFeatures: new Set(),
    onboardingStep: 0,
    lastActiveDate: new Date()
  })

  const hasSeenConcept = useCallback((conceptId: string) => {
    return userProgress.seenConcepts.has(conceptId)
  }, [userProgress.seenConcepts])

  const markConceptSeen = useCallback((conceptId: string) => {
    setUserProgress(prev => ({
      ...prev,
      seenConcepts: new Set([...prev.seenConcepts, conceptId])
    }))
    
    // Persist to backend
    persistUserProgress({ conceptSeen: conceptId })
  }, [])

  // Auto-save progress to localStorage and backend
  useEffect(() => {
    localStorage.setItem('help-progress', JSON.stringify({
      ...userProgress,
      seenConcepts: Array.from(userProgress.seenConcepts),
      completedTours: Array.from(userProgress.completedTours),
      unlockedFeatures: Array.from(userProgress.unlockedFeatures)
    }))
  }, [userProgress])

  const contextValue: HelpContextValue = {
    userProgress,
    hasSeenConcept,
    markConceptSeen,
    startTour,
    completeTour,
    unlockFeature,
    isFeatureUnlocked,
    getConceptExplanation,
    searchHelp
  }

  return (
    <HelpContext.Provider value={contextValue}>
      {children}
      <HelpWidget />
      <TourManager />
      <FeatureSpotlight />
    </HelpContext.Provider>
  )
}
```

### 3. Smart Tooltip System

#### Contextual Tooltip Component

```typescript
// apps/web/components/help/smart-tooltip.tsx
interface SmartTooltipProps {
  conceptId: string
  children: React.ReactNode
  trigger?: 'hover' | 'click' | 'focus' | 'auto'
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  showOnFirstVisit?: boolean
  delay?: number
  className?: string
}

export function SmartTooltip({
  conceptId,
  children,
  trigger = 'hover',
  position = 'auto',
  showOnFirstVisit = true,
  delay = 500,
  className
}: SmartTooltipProps) {
  const { hasSeenConcept, markConceptSeen, getConceptExplanation } = useHelp()
  const [isVisible, setIsVisible] = useState(false)
  const [shouldAutoShow, setShouldAutoShow] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const concept = getConceptExplanation(conceptId)
  const hasBeenSeen = hasSeenConcept(conceptId)

  // Auto-show logic for first-time users
  useEffect(() => {
    if (showOnFirstVisit && !hasBeenSeen) {
      const timer = setTimeout(() => {
        setShouldAutoShow(true)
        setIsVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [showOnFirstVisit, hasBeenSeen, delay])

  const handleShow = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(true)
    if (!hasBeenSeen) {
      markConceptSeen(conceptId)
    }
  }, [hasBeenSeen, markConceptSeen, conceptId])

  const handleHide = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
      setShouldAutoShow(false)
    }, 100)
  }, [])

  return (
    <Tooltip
      content={<ConceptExplanation concept={concept} />}
      isVisible={isVisible}
      position={position}
      className={className}
      onShow={handleShow}
      onHide={handleHide}
    >
      <div
        className={cn(
          "relative",
          shouldAutoShow && "animate-pulse ring-2 ring-purple-400 ring-opacity-50 rounded"
        )}
        onMouseEnter={trigger === 'hover' ? handleShow : undefined}
        onMouseLeave={trigger === 'hover' ? handleHide : undefined}
        onClick={trigger === 'click' ? handleShow : undefined}
        onFocus={trigger === 'focus' ? handleShow : undefined}
      >
        {children}
        {shouldAutoShow && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping" />
        )}
      </div>
    </Tooltip>
  )
}
```

#### Concept Explanation Component

```typescript
// apps/web/components/help/concept-explainer.tsx
interface ConceptExplanationProps {
  concept: ConceptExplanation
  onClose?: () => void
  showRelated?: boolean
}

export function ConceptExplanation({
  concept,
  onClose,
  showRelated = true
}: ConceptExplanationProps) {
  return (
    <div className="max-w-sm p-4 bg-white rounded-lg shadow-xl border">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {concept.icon && <concept.icon className="w-5 h-5 text-purple-600" />}
          <h3 className="font-semibold text-gray-900">{concept.title}</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
        {concept.description}
      </p>

      {/* Example */}
      {concept.example && (
        <div className="mb-3 p-3 bg-purple-50 rounded border-l-4 border-purple-400">
          <div className="text-xs font-medium text-purple-700 mb-1">Example:</div>
          <div className="text-sm text-purple-600">{concept.example}</div>
        </div>
      )}

      {/* Quick Actions */}
      {concept.actions && concept.actions.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Quick Actions:</div>
          <div className="flex flex-wrap gap-1">
            {concept.actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className="text-xs h-6 px-2"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Related Concepts */}
      {showRelated && concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">Related:</div>
          <div className="flex flex-wrap gap-1">
            {concept.relatedConcepts.map((relatedId) => (
              <SmartTooltip key={relatedId} conceptId={relatedId} trigger="click">
                <button className="text-xs text-purple-600 hover:text-purple-700 underline">
                  {CONCEPT_DEFINITIONS[relatedId]?.title || relatedId}
                </button>
              </SmartTooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 4. Interactive Product Tours

#### Tour Manager Component

```typescript
// apps/web/components/help/product-tour.tsx
interface ProductTourProps {
  tourId: string
  autoStart?: boolean
  onComplete?: () => void
  onSkip?: () => void
}

export function ProductTour({
  tourId,
  autoStart = false,
  onComplete,
  onSkip
}: ProductTourProps) {
  const { completeTour, userProgress } = useHelp()
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const tour = TOUR_DEFINITIONS[tourId]
  const hasCompleted = userProgress.completedTours.has(tourId)

  useEffect(() => {
    if (autoStart && !hasCompleted && tour) {
      setIsActive(true)
    }
  }, [autoStart, hasCompleted, tour])

  const handleNext = useCallback(() => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep, tour.steps.length])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    setIsActive(false)
    completeTour(tourId)
    onComplete?.()
  }, [tourId, completeTour, onComplete])

  const handleSkip = useCallback(() => {
    setIsActive(false)
    onSkip?.()
  }, [onSkip])

  if (!isActive || !tour || hasCompleted) {
    return null
  }

  const currentTourStep = tour.steps[currentStep]

  return (
    <TourOverlay>
      <TourSpotlight target={currentTourStep.target} />
      <TourPopover
        step={currentTourStep}
        currentStep={currentStep + 1}
        totalSteps={tour.steps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onComplete={handleComplete}
      />
    </TourOverlay>
  )
}
```

#### Tour Step Component

```typescript
// Tour step popover component
interface TourPopoverProps {
  step: TourStep
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onComplete: () => void
}

export function TourPopover({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete
}: TourPopoverProps) {
  const isLastStep = currentStep === totalSteps

  return (
    <div className="fixed z-50 bg-white rounded-lg shadow-2xl border max-w-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {step.icon && <step.icon className="w-5 h-5 text-purple-600" />}
          <h3 className="font-semibold text-gray-900">{step.title}</h3>
        </div>
        <div className="text-xs text-gray-500">
          {currentStep} of {totalSteps}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {step.content}
        </p>
        
        {step.image && (
          <img
            src={step.image}
            alt={step.title}
            className="w-full rounded border"
          />
        )}
        
        {step.video && (
          <video
            src={step.video}
            autoPlay
            loop
            muted
            className="w-full rounded border"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" size="sm" onClick={onPrevious}>
              Previous
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip Tour
          </Button>
        </div>
        
        <Button
          size="sm"
          onClick={isLastStep ? onComplete : onNext}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isLastStep ? 'Finish' : 'Next'}
          {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex gap-1">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded",
              index < currentStep ? "bg-purple-600" : "bg-gray-200"
            )}
          />
        ))}
      </div>
    </div>
  )
}
```

### 5. Progressive Feature Unlocking

#### Feature Unlock System

```typescript
// apps/web/hooks/use-progressive-features.ts
export function useProgressiveFeatures() {
  const { userProgress, unlockFeature, isFeatureUnlocked } = useHelp()
  const { user, auras } = useUserContext()

  const checkFeatureUnlocks = useCallback(() => {
    const newUnlocks: string[] = []

    // Basic progression
    if (auras.length >= 1 && !isFeatureUnlocked('rule-creation')) {
      newUnlocks.push('rule-creation')
    }

    if (auras.some(a => a.rules.length >= 3) && !isFeatureUnlocked('advanced-rules')) {
      newUnlocks.push('advanced-rules')
    }

    if (auras.length >= 3 && !isFeatureUnlocked('aura-management')) {
      newUnlocks.push('aura-management')
    }

    // Subscription-based unlocks
    if (user.subscription.tier !== 'free' && !isFeatureUnlocked('premium-features')) {
      newUnlocks.push('premium-features')
    }

    // Time-based unlocks
    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceSignup >= 7 && !isFeatureUnlocked('advanced-customization')) {
      newUnlocks.push('advanced-customization')
    }

    // Apply unlocks
    newUnlocks.forEach(featureId => {
      unlockFeature(featureId)
    })

    return newUnlocks
  }, [user, auras, isFeatureUnlocked, unlockFeature])

  useEffect(() => {
    checkFeatureUnlocks()
  }, [checkFeatureUnlocks])

  return {
    isFeatureUnlocked,
    checkFeatureUnlocks,
    getFeatureProgress: (featureId: string) => {
      return FEATURE_UNLOCK_CONDITIONS[featureId]?.getProgress?.(user, auras) || 0
    }
  }
}
```

#### Feature Spotlight Component

```typescript
// apps/web/components/help/feature-spotlight.tsx
export function FeatureSpotlight() {
  const { userProgress } = useHelp()
  const [activeSpotlight, setActiveSpotlight] = useState<FeatureSpotlight | null>(null)

  // Check for new feature unlocks
  useEffect(() => {
    const newFeatures = Array.from(userProgress.unlockedFeatures).filter(
      featureId => !userProgress.seenSpotlights?.has(featureId)
    )

    if (newFeatures.length > 0) {
      const feature = FEATURE_SPOTLIGHTS[newFeatures[0]]
      if (feature) {
        setActiveSpotlight(feature)
      }
    }
  }, [userProgress.unlockedFeatures, userProgress.seenSpotlights])

  if (!activeSpotlight) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md p-8 mx-4">
        {/* Celebration Animation */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 New Feature Unlocked!
          </h2>
        </div>

        {/* Feature Details */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeSpotlight.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {activeSpotlight.description}
          </p>
        </div>

        {/* Feature Preview */}
        {activeSpotlight.preview && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <img
              src={activeSpotlight.preview}
              alt={activeSpotlight.title}
              className="w-full rounded"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveSpotlight(null)}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              setActiveSpotlight(null)
              activeSpotlight.onTryNow?.()
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Try It Now
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 6. Help Content Database

#### Concept Definitions

```typescript
// apps/web/lib/help/concept-definitions.ts
export const CONCEPT_DEFINITIONS: Record<string, ConceptExplanation> = {
  'aura': {
    id: 'aura',
    title: 'Aura',
    description: 'An AI-powered digital companion with a unique personality that can interact with you and respond to various inputs from sensors and data sources.',
    icon: Sparkles,
    example: 'Your Aura might send you an encouraging message when it detects you\'ve reached your daily step goal.',
    actions: [
      { label: 'Create Aura', onClick: () => router.push('/auras/create-unified') },
      { label: 'Learn More', onClick: () => openHelpArticle('what-is-an-aura') }
    ],
    relatedConcepts: ['vessel', 'personality', 'senses', 'rules']
  },
  
  'vessel': {
    id: 'vessel',
    title: 'Vessel',
    description: 'The physical or digital form your Aura inhabits. Digital vessels live in the cloud, while physical vessels connect to real-world objects.',
    icon: Package,
    example: 'A Terra vessel connects your Aura to a plant, allowing it to monitor soil moisture and growth.',
    actions: [
      { label: 'Browse Vessels', onClick: () => router.push('/vessels') }
    ],
    relatedConcepts: ['aura', 'senses', 'digital-vessel', 'physical-vessel']
  },
  
  'senses': {
    id: 'senses',
    title: 'Senses',
    description: 'Data sources that allow your Aura to perceive and understand the world around you, from weather to your fitness data.',
    icon: Eye,
    example: 'Weather sense lets your Aura know it\'s raining and suggest you bring an umbrella.',
    actions: [
      { label: 'Add Senses', onClick: () => openSenseSelector() }
    ],
    relatedConcepts: ['aura', 'rules', 'triggers']
  },
  
  'rules': {
    id: 'rules',
    title: 'Behavior Rules',
    description: 'Instructions that tell your Aura how to respond to different situations and sensor data.',
    icon: Zap,
    example: 'A rule might say "When my heart rate is above 150 BPM, send me a reminder to take a break."',
    actions: [
      { label: 'Create Rule', onClick: () => openRuleBuilder() }
    ],
    relatedConcepts: ['aura', 'senses', 'triggers', 'actions']
  },
  
  'personality': {
    id: 'personality',
    title: 'Personality',
    description: 'The unique character traits that define how your Aura communicates and behaves.',
    icon: Heart,
    example: 'A playful Aura might use emojis and jokes, while a formal Aura speaks professionally.',
    actions: [
      { label: 'Customize Personality', onClick: () => openPersonalityEditor() }
    ],
    relatedConcepts: ['aura', 'communication-style', 'tone']
  }
}
```

#### Tour Definitions

```typescript
// apps/web/lib/help/tour-definitions.ts
export const TOUR_DEFINITIONS: Record<string, Tour> = {
  'first-aura-creation': {
    id: 'first-aura-creation',
    title: 'Create Your First Aura',
    description: 'Learn how to create and configure your first AI companion',
    steps: [
      {
        target: '[data-tour="create-button"]',
        title: 'Welcome to Aura!',
        content: 'Let\'s create your first AI companion. Click this button to get started.',
        icon: Sparkles,
        position: 'bottom'
      },
      {
        target: '[data-tour="vessel-selection"]',
        title: 'Choose a Vessel',
        content: 'Vessels are how your Aura experiences the world. Start with Digital for the full experience.',
        icon: Package,
        position: 'right'
      },
      {
        target: '[data-tour="personality-matrix"]',
        title: 'Shape Their Personality',
        content: 'Adjust these sliders to give your Aura a unique personality that matches your preferences.',
        icon: Heart,
        position: 'left'
      },
      {
        target: '[data-tour="sense-selector"]',
        title: 'Connect Senses',
        content: 'Senses let your Aura understand your world. Try adding weather or fitness data.',
        icon: Eye,
        position: 'top'
      },
      {
        target: '[data-tour="rule-builder"]',
        title: 'Create Smart Rules',
        content: 'Rules tell your Aura how to respond to different situations. Start with a simple template.',
        icon: Zap,
        position: 'bottom'
      }
    ],
    triggers: ['first-visit', 'empty-aura-list'],
    category: 'onboarding'
  },
  
  'advanced-rules': {
    id: 'advanced-rules',
    title: 'Advanced Rule Building',
    description: 'Learn to create sophisticated behavior rules',
    steps: [
      {
        target: '[data-tour="visual-rule-builder"]',
        title: 'Visual Rule Builder',
        content: 'Drag sensors and actions to create complex rules visually.',
        icon: Workflow,
        position: 'center'
      },
      {
        target: '[data-tour="rule-templates"]',
        title: 'Rule Templates',
        content: 'Start with pre-built templates and customize them for your needs.',
        icon: Template,
        position: 'right'
      },
      {
        target: '[data-tour="rule-testing"]',
        title: 'Test Your Rules',
        content: 'Simulate different scenarios to see how your rules will behave.',
        icon: TestTube,
        position: 'bottom'
      }
    ],
    triggers: ['rule-count-3', 'advanced-features-unlocked'],
    category: 'advanced'
  }
}
```

### 7. Implementation Timeline

#### Week 1: Core Help Infrastructure
- [ ] Implement help context provider and state management
- [ ] Create smart tooltip system with concept explanations
- [ ] Build concept definition database
- [ ] Add user progress tracking

#### Week 2: Interactive Tours
- [ ] Implement tour system using Shepherd.js or custom solution
- [ ] Create onboarding tours for key user journeys
- [ ] Add tour triggering logic and completion tracking
- [ ] Build tour management interface

#### Week 3: Progressive Features & Spotlights
- [ ] Implement feature unlock system based on user progress
- [ ] Create feature spotlight announcements
- [ ] Add achievement system for learning milestones
- [ ] Build help search functionality

#### Week 4: Integration & Analytics
- [ ] Integrate help system throughout the application
- [ ] Add analytics tracking for help system usage
- [ ] A/B test different help approaches
- [ ] Optimize based on user behavior data

### 8. Success Metrics

#### User Experience Metrics
- **Onboarding Completion Rate**: Target 85%+ completion of first Aura creation
- **Feature Discovery**: 50% increase in advanced feature usage
- **Time to Competency**: Reduce time to create first rule from 20+ minutes to <10 minutes
- **Help System Engagement**: 70%+ of users interact with contextual help

#### Support Metrics
- **Support Ticket Reduction**: 40% reduction in basic usage questions
- **Self-Service Success**: 80% of help searches result in successful task completion
- **User Satisfaction**: 4.5+ stars for help system usefulness

#### Technical Metrics
- **Help Content Coverage**: 95% of UI elements have contextual help
- **Performance**: Help system adds <100ms to page load times
- **Accessibility**: Full screen reader and keyboard navigation support

### 9. Content Strategy

#### Help Content Types
1. **Concept Explanations**: Clear definitions with examples
2. **Interactive Tours**: Step-by-step guided experiences
3. **Video Tutorials**: Visual demonstrations of complex features
4. **Quick Tips**: Contextual micro-learning moments
5. **Progressive Disclosure**: Information revealed as users advance

#### Content Maintenance
- **Regular Updates**: Help content updated with each feature release
- **User Feedback Integration**: Continuous improvement based on user questions
- **Analytics-Driven Optimization**: Content refined based on usage patterns
- **Multilingual Support**: Prepared for internationalization

This comprehensive contextual help system will significantly reduce the learning curve for new users while providing advanced users with the guidance they need to unlock the platform's full potential.