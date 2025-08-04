// apps/web/components/aura/aura-configuration-agent.tsx

"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  MessageCircle,
  Settings,
  CheckCircle,
  ArrowRight,
  Wand2,
  Save,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { countAuraSenses } from '@/lib/utils/sense-counting'
import type { Personality, BehaviorRule, Aura } from '@/types'

interface AgentMessage {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: Date
  metadata?: {
    suggestedActions?: string[]
    configurationUpdate?: Partial<AuraConfiguration>
    requiresUserInput?: boolean
    step?: ConfigurationStep
  }
}

interface AuraConfiguration {
  name: string
  vesselType: 'digital' | 'terra' | 'companion' | 'memory' | 'sage'
  vesselCode?: string
  personality: Personality
  rules: BehaviorRule[]
  availableSenses: string[]
}

type ConfigurationStep = 
  | 'introduction'
  | 'vessel_selection' 
  | 'personality_discovery'
  | 'rule_creation'
  | 'review_and_save'
  | 'complete'

interface AuraConfigurationAgentProps {
  onConfigurationComplete: (config: AuraConfiguration) => void
  onConfigurationUpdate?: (config: Partial<AuraConfiguration>) => void
  initialConfig?: Partial<AuraConfiguration>
  initialAura?: Aura
  availableSenses: string[]
  isEditMode?: boolean
}

export function AuraConfigurationAgent({
  onConfigurationComplete,
  onConfigurationUpdate,
  initialConfig,
  initialAura,
  availableSenses,
  isEditMode = false
}: AuraConfigurationAgentProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [currentStep, setCurrentStep] = useState<ConfigurationStep>('introduction')
  const [configuration, setConfiguration] = useState<AuraConfiguration>({
    name: '',
    vesselType: 'digital',
    vesselCode: '',
    personality: {
      persona: '',
      warmth: 50,
      playfulness: 50,
      verbosity: 50,
      empathy: 50,
      creativity: 50,
      tone: 'casual',
      vocabulary: 'simple',
      quirks: []
    },
    rules: [],
    availableSenses: [] // Start with empty, will be populated as user selects
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const configurationRef = useRef(configuration)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  
  // Keep ref in sync with state
  useEffect(() => {
    configurationRef.current = configuration
  }, [configuration])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
      
      // Fallback: also try scrolling the container directly
      if (chatContainerRef.current) {
        const container = chatContainerRef.current
        container.scrollTop = container.scrollHeight
      }
    })
  }, [])

  // Handle scroll detection to know if user has manually scrolled
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold
      const wasScrolled = userHasScrolled
      const nowScrolled = !isAtBottom
      
      if (wasScrolled !== nowScrolled) {
        console.log('🔄 Scroll state changed:', { wasScrolled, nowScrolled, scrollTop, scrollHeight, clientHeight })
        setUserHasScrolled(nowScrolled)
      }
    }
  }, [userHasScrolled])

  // Auto-scroll when new messages arrive (only if user hasn't manually scrolled up)
  useEffect(() => {
    console.log('📜 Auto-scroll effect triggered:', { messagesCount: messages.length, userHasScrolled })
    if (!userHasScrolled) {
      console.log('📜 Auto-scrolling to bottom...')
      // Longer delay to ensure DOM has fully updated with new content
      const timer = setTimeout(() => {
        scrollToBottom()
        // Double-check scroll after a bit more time for complex content
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      console.log('📜 Skipping auto-scroll - user has scrolled up')
    }
  }, [messages, userHasScrolled, scrollToBottom])

  // Also scroll when loading state changes (important for when responses replace loading messages)
  useEffect(() => {
    if (!userHasScrolled && !isLoading) {
      console.log('📜 Loading finished, ensuring scroll to bottom...')
      // Extra delay for loading->response transition
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isLoading, userHasScrolled, scrollToBottom])

  // Reset scroll state when user scrolls back to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      if (isAtBottom && userHasScrolled) {
        setUserHasScrolled(false)
      }
    }
  }, [messages, userHasScrolled])

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeMessage: AgentMessage;
      
      if (isEditMode && initialConfig?.name) {
        // Edit mode - context-aware welcome message
        const existingFeatures = [];
        if (initialConfig.personality?.persona) existingFeatures.push(`personality: ${initialConfig.personality.persona}`);
        if (initialConfig.rules && initialConfig.rules.length > 0) existingFeatures.push(`${initialConfig.rules.length} behavior rules`);
        if (initialConfig.availableSenses && initialConfig.availableSenses.length > 0) existingFeatures.push(`${initialConfig.availableSenses.length} connected senses`);
        
        const featuresText = existingFeatures.length > 0 ? `\n\nI can see ${initialConfig.name} currently has: ${existingFeatures.join(', ')}.` : '';
        
        welcomeMessage = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: `Hello! I'm here to help you enhance and refine ${initialConfig.name}. I can see you're editing an existing aura, and I'm ready to help you make any adjustments or improvements you'd like.${featuresText}\n\nWhat would you like to work on today? Would you like to adjust their personality, add new behaviors, connect more senses, or something else entirely?`,
          timestamp: new Date(),
          metadata: {
            step: 'personality_discovery', // Skip introduction for edit mode
            requiresUserInput: true,
            suggestedActions: [
              "Adjust their personality",
              "Add new behavior rules",
              "Connect more senses",
              "Review everything and make changes"
            ]
          }
        };
        
        // Set appropriate step for editing
        setCurrentStep('personality_discovery');
      } else {
        // Create mode - original welcome message
        welcomeMessage = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: "Hello! I'm your Aura Configuration Assistant. I'm here to help you create a personalized AI companion that perfectly matches your needs and personality. Let's start by getting to know what you're looking for.\n\nWhat kind of AI companion are you hoping to create? Are you looking for someone to help with daily motivation, creative projects, productivity, or something else entirely?",
          timestamp: new Date(),
          metadata: {
            step: 'introduction',
            requiresUserInput: true,
            suggestedActions: [
              "I want a productivity assistant",
              "I need emotional support",
              "I'm interested in wellness coaching",
              "Show me character options"
            ]
          }
        };
      }
      
      setMessages([welcomeMessage]);
      
      // Focus input and scroll to bottom on initial load
      setTimeout(() => {
        inputRef.current?.focus()
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }
  }, [isEditMode, initialConfig])

  // Apply any initial configuration
  useEffect(() => {
    if (initialConfig) {
      setConfiguration(prev => ({
        ...prev,
        ...initialConfig,
        personality: {
          ...prev.personality,
          ...initialConfig.personality
        }
      }))
    }
  }, [initialConfig])

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return

    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)
    
    // Keep focus on input after sending message
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)

    try {
      console.log('📤 Sending to agent with configuration:', configurationRef.current)
      
      // Send to agent processing
      const response = await fetch('/api/aura-agent/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userInput.trim(),
          currentStep,
          configuration: configurationRef.current, // Use ref to get most up-to-date config
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          availableSenses: availableSenses // Send available senses separately for agent context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process message')
      }

      const result = await response.json()
      
      // Apply configuration updates BEFORE creating the agent message
      let finalConfig = configuration
      if (result.configurationUpdate) {
        console.log('🔄 Applying configuration updates:', result.configurationUpdate)
        console.log('🔄 Current configuration before update:', configuration)
        const updatedConfig = {
          ...configuration,
          ...result.configurationUpdate,
          personality: {
            ...configuration.personality,
            ...(result.configurationUpdate.personality || {})
          },
          // Handle senses specially - if update includes senses, use those, otherwise keep existing
          availableSenses: result.configurationUpdate.availableSenses !== undefined ? result.configurationUpdate.availableSenses : configuration.availableSenses,
          // Handle rules - append new rules if provided
          rules: result.configurationUpdate.rules !== undefined ? result.configurationUpdate.rules : configuration.rules
        }
        
        console.log('✅ Updated configuration:', updatedConfig)
        finalConfig = updatedConfig
        
        // Update state immediately and synchronously for next render
        setConfiguration(updatedConfig)
        
        // CRITICAL: Store the updated config in a ref so it's available for the next message
        configurationRef.current = updatedConfig
        
        // 🔄 Notify parent component of configuration updates for real-time sync
        if (onConfigurationUpdate) {
          onConfigurationUpdate(updatedConfig)
        }
        
        // Debug logging
        console.log('🔍 Configuration state after update:', {
          name: updatedConfig.name,
          vesselType: updatedConfig.vesselType,
          vesselCode: updatedConfig.vesselCode,
          sensesCount: updatedConfig.availableSenses.length,
          rulesCount: updatedConfig.rules.length,
          senses: updatedConfig.availableSenses,
          rules: updatedConfig.rules.map((r: any) => r.name)
        })
      }
      
      // If we're at the complete step, trigger the completion callback with the final config
      if (result.nextStep === 'complete') {
        console.log('🎯 Agent reached complete step, triggering completion callback')
        setIsCompleting(true)
        
        // Validate required fields before completing
        if (finalConfig.name && finalConfig.vesselType && 
            (finalConfig.vesselCode || finalConfig.vesselType === 'digital')) {
          
          // Ensure digital vessels have proper vessel code
          if (finalConfig.vesselType === 'digital' && !finalConfig.vesselCode) {
            finalConfig.vesselCode = 'digital-only'
          }
          
          console.log('Completing configuration:', finalConfig)
          
          try {
            await onConfigurationComplete(finalConfig)
          } catch (error) {
            console.error('Failed to complete configuration:', error)
            // Add error message to chat
            const errorMessage: AgentMessage = {
              id: `agent-error-${Date.now()}`,
              role: 'agent',
              content: "I encountered an issue saving your Aura. Let me try again, or you can use the retry button that should appear.",
              timestamp: new Date(),
              metadata: {
                requiresUserInput: false,
                suggestedActions: ["Try again", "Let me review the configuration"]
              }
            }
            setMessages(prev => [...prev, errorMessage])
            setCurrentStep('review_and_save')
          } finally {
            setIsCompleting(false)
          }
        } else {
          console.warn('Configuration incomplete, cannot complete:', {
            name: finalConfig.name,
            vesselType: finalConfig.vesselType,
            vesselCode: finalConfig.vesselCode
          })
          
          // Add helpful message about missing fields
          const missingFields = []
          if (!finalConfig.name) missingFields.push('name')
          if (!finalConfig.vesselType) missingFields.push('vessel type')
          if (!finalConfig.vesselCode && finalConfig.vesselType !== 'digital') missingFields.push('vessel selection')
          
          const helpMessage: AgentMessage = {
            id: `agent-help-${Date.now()}`,
            role: 'agent',
            content: `I notice we're missing some required information: ${missingFields.join(', ')}. Let me help you complete these details first.`,
            timestamp: new Date(),
            metadata: {
              requiresUserInput: true,
              suggestedActions: missingFields.includes('name') ? ["Let's name them Luna", "Call them Nova"] : ["Continue setup"]
            }
          }
          setMessages(prev => [...prev, helpMessage])
          
          // Force back to appropriate step
          if (!finalConfig.name) {
            setCurrentStep('personality_discovery')
          } else if (!finalConfig.vesselType) {
            setCurrentStep('vessel_selection')
          } else {
            setCurrentStep('review_and_save')
          }
          setIsCompleting(false)
        }
      }
      
      const agentMessage: AgentMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: result.response,
        timestamp: new Date(),
        metadata: result.metadata
      }

      setMessages(prev => [...prev, agentMessage])

      // Update step if provided
      if (result.nextStep) {
        setCurrentStep(result.nextStep)
      }

    } catch (error) {
      console.error('Agent processing error:', error)
      const errorMessage: AgentMessage = {
        id: `agent-error-${Date.now()}`,
        role: 'agent',
        content: "I apologize, but I encountered an issue processing your request. Could you please try rephrasing that, or let me know if you'd like to continue with a different aspect of your Aura configuration?",
        timestamp: new Date(),
        metadata: {
          requiresUserInput: true,
          suggestedActions: ["Let's continue", "Start over", "I need help"]
        }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      // Re-focus input after processing is complete
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [userInput, isLoading, currentStep, configuration, messages, onConfigurationComplete, availableSenses])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedAction = (action: string) => {
    setUserInput(action)
    // Focus input and then send message
    inputRef.current?.focus()
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  // Force completion function for emergency cases
  const forceCompletion = useCallback(async () => {
    if (configuration.name && configuration.vesselType) {
      console.log('🚨 Force completing configuration:', configuration)
      setIsCompleting(true)
      
      const finalConfig = {
        ...configuration,
        vesselCode: configuration.vesselCode || (configuration.vesselType === 'digital' ? 'digital-only' : '')
      }
      
      try {
        await onConfigurationComplete(finalConfig)
      } catch (error) {
        console.error('Force completion failed:', error)
      } finally {
        setIsCompleting(false)
      }
    }
  }, [configuration, onConfigurationComplete])

  const getStepProgress = () => {
    const steps: ConfigurationStep[] = ['introduction', 'vessel_selection', 'personality_discovery', 'rule_creation', 'review_and_save', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    return {
      current: currentIndex + 1,
      total: steps.length,
      percentage: ((currentIndex + 1) / steps.length) * 100
    }
  }

  const progress = getStepProgress()

  return (
    <div className="max-w-4xl mx-auto min-h-[600px] max-h-[calc(100vh-8rem)] h-[80vh] flex flex-col p-4">
      {/* Header with Progress - Fixed at top */}
      <Card className="mb-4 flex-shrink-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-600" />
              Aura Configuration Assistant
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wand2 className="w-4 h-4" />
              Step {progress.current} of {progress.total}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* Current Configuration Preview */}
          {(configuration.name || configuration.vesselType !== 'digital' || configuration.availableSenses.length > 0) && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Current Configuration</span>
                </div>
                {/* Force Create Button - only show in rule creation or review steps */}
                {configuration.name && configuration.vesselType && !isCompleting && 
                 (currentStep === 'rule_creation' || currentStep === 'review_and_save') && (
                  <Button
                    onClick={forceCompletion}
                    size="sm"
                    variant="outline"
                    className="text-xs px-3 py-1 border-green-300 text-green-700 hover:bg-green-50"
                    disabled={isLoading}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Create Now
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <div className="font-medium">{configuration.name || 'Not set'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Vessel:</span>
                  <div className="font-medium capitalize">{configuration.vesselType}</div>
                </div>
                <div>
                  <span className="text-gray-600">Personality:</span>
                  <div className="font-medium">
                    {configuration.personality.persona ? (
                      <span title={`${configuration.personality.tone} tone, ${configuration.personality.vocabulary} vocabulary`}>
                        {configuration.personality.persona}
                      </span>
                    ) : (
                      'Not configured'
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Senses:</span>
                  <div className="font-medium">
                    {initialAura ? countAuraSenses(initialAura) : configuration.availableSenses.length} selected
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Rules:</span>
                  <div className="font-medium">{configuration.rules.length} configured</div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col min-h-0 relative">
        <CardContent 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'agent' && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === 'user'
                    ? "bg-purple-600 text-white ml-auto"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {/* Suggested Actions */}
                {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.metadata.suggestedActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedAction(action)}
                        className="text-xs h-7 border-purple-300 hover:border-purple-400 hover:bg-purple-50"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {(isLoading || isCompleting) && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {isCompleting ? 'Creating your Aura...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          
          {/* Scroll to bottom button - positioned within the scrollable area */}
          {userHasScrolled && (
            <div className="sticky bottom-4 w-full z-10 flex justify-center pointer-events-none">
              <Button
                onClick={() => {
                  setUserHasScrolled(false)
                  scrollToBottom()
                }}
                size="sm"
                className="rounded-full w-10 h-10 p-0 shadow-lg bg-purple-600 hover:bg-purple-700 pointer-events-auto"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4 flex-shrink-0 bg-white">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what you're looking for or ask me anything..."
                className="pr-12 py-3 text-base"
                disabled={isLoading || isCompleting}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading || isCompleting}
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
              >
                {(isLoading || isCompleting) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSuggestedAction("I want to start over")}
              className="text-xs h-7"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Start Over
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSuggestedAction("Skip to personality configuration")}
              className="text-xs h-7"
              disabled={!configuration.vesselType}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Skip to Personality
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSuggestedAction("I need help understanding the options")}
              className="text-xs h-7"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Need Help
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}