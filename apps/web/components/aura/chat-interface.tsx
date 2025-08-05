// apps/web/components/aura/chat-interface.tsx
"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  Mic,
  Volume2,
  Eye,
  EyeOff,
  Brain,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { SenseDataService } from "@/lib/services/sense-data-service"
import { SenseStatus } from "@/components/chat/sense-status"
import { MessageInfluence } from "@/components/chat/message-influence"
import { SENSE_ICONS, CHAT_REFRESH_INTERVAL } from "@/lib/constants/chat"
import type { Aura, Message } from "@/types"
import type { ChatInterfaceProps } from "@/types/chat"

export function ChatInterface({
  aura,
  conversationId: initialConversationId,
  showInfluenceLog = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showInfluence, setShowInfluence] = useState(showInfluenceLog)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [conversationId, setConversationId] = useState(initialConversationId)
  const [senseData, setSenseData] = useState<Record<string, any>>({})
  const [isLoadingSenses, setIsLoadingSenses] = useState(false)
  const [showSenseStatus, setShowSenseStatus] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Note: Conversation creation is now handled by the chat API
  // This prevents duplicate conversation creation

  // Load existing conversation messages if conversationId is provided
  useEffect(() => {
    if (conversationId) {
      loadConversationMessages(conversationId)
    }
  }, [conversationId])

  // Load sense data periodically
  useEffect(() => {
    loadSenseData()
    const interval = setInterval(loadSenseData, CHAT_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [aura.senses])

  const loadConversationMessages = async (convId: string) => {
    try {
      console.log('Loading conversation messages for:', convId)
      const response = await fetch(`/api/conversations/${convId}/messages`)
      if (!response.ok) {
        throw new Error('Failed to load conversation')
      }
      const data = await response.json()
      console.log('Loaded conversation data:', data)
      
      // Transform the messages to match our Message interface
      const transformedMessages: Message[] = (data.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at,
        metadata: msg.metadata || {}
      }))
      
      setMessages(transformedMessages)
    } catch (error) {
      console.error('Failed to load conversation messages:', error)
    }
  }

  async function loadSenseData() {
    setIsLoadingSenses(true)
    try {
      const data = await SenseDataService.getSenseData(aura.senses)
      const map = data.reduce((acc, item) => {
        acc[item.senseId] = item.data
        return acc
      }, {} as Record<string, any>)
      setSenseData(map)
    } catch (err) {
      console.error("Failed to load sense data:", err)
    } finally {
      setIsLoadingSenses(false)
    }
  }

  const handleSend = async () => {
    console.log('handleSend called', { input: input.trim(), conversationId })
    if (!input.trim()) return
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    }
    
    setMessages((m) => [...m, userMsg])
    setInput("")
    setIsTyping(true)
    
    try {
      const res = await fetch("/api/aura/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auraId: aura.id,
          userMessage: input,
          conversationId,
          senseData,
        }),
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Chat failed")
      
      // Update conversationId if it was created by the API
      if (json.conversationId && !conversationId) {
        setConversationId(json.conversationId)
      }
      
      const auraMsg: Message = {
        id: Date.now().toString() + "_aura",
        role: "aura",
        content: json.reply as string,
        created_at: new Date().toISOString(),
        metadata: {
          influences: json.influences || json.metadata?.influences || [],
          triggeredRule: json.triggeredRule || json.metadata?.triggeredRule,
          senseData: json.senseData || json.metadata?.senseData || [],
          senseInfluences: json.metadata?.senseInfluences,
          personalityFactors: json.metadata?.personalityFactors,
        },
      }
      
      setMessages((m) => [...m, auraMsg])
    } catch (err: any) {
      console.error("Chat API error:", err)
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString() + "_err",
          role: "aura",
          content: "I'm having trouble connecting right now. Please try again.",
          created_at: new Date().toISOString(),
          metadata: { isError: true },
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const renderMessage = (message: Message) => (
    <div
      key={message.id}
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl shadow-md",
          isMobile ? "max-w-[85%] px-4 py-3" : "max-w-[80%] px-6 py-4",
          message.role === "user"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            : "bg-white border border-gray-200"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* Rule Trigger Display */}
        {message.metadata?.triggeredRule && (
          <div className={cn(
            "flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg",
            isMobile ? "mt-2 p-1.5" : "mt-3 p-2"
          )}>
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">
              Rule: {message.metadata.triggeredRule}
            </span>
          </div>
        )}

        {/* Influence Display */}
        {showInfluence && <MessageInfluence message={message} />}

        <p className={cn("text-xs opacity-60", isMobile ? "mt-2" : "mt-3")}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )

  // Use dynamic height for mobile
  const containerHeight = isMobile ? "h-[calc(100vh-4rem)]" : "h-[700px]"
  
  return (
    <Card className={cn("flex flex-col border-2 border-purple-100 shadow-xl overflow-hidden", containerHeight)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 p-3 sm:p-6 text-white">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Top row - Avatar and Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="text-2xl sm:text-4xl bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
                {aura.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl font-bold truncate">{aura.name}</h3>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/80 sm:hidden">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span>Online</span>
                  {!showSenseStatus && aura.senses.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{aura.senses.length} senses</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Control buttons - Compact on mobile */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={cn(
                  "text-white hover:bg-white/20 border border-white/30",
                  isMobile ? "w-8 h-8" : "w-9 h-9",
                  voiceEnabled && "bg-white/20"
                )}
                title={voiceEnabled ? "Voice On" : "Voice Off"}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfluence((s) => !s)}
                className={cn(
                  "text-white hover:bg-white/20 border border-white/30",
                  isMobile ? "w-8 h-8" : "w-9 h-9",
                  showInfluence && "bg-white/20"
                )}
                title={showInfluence ? "Hide insights" : "Show insights"}
              >
                {showInfluence ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSenseStatus((v) => !v)}
                className={cn(
                  "text-white hover:bg-white/20 border border-white/30",
                  isMobile ? "w-8 h-8" : "w-9 h-9",
                  showSenseStatus && "bg-white/20"
                )}
                title={showSenseStatus ? "Hide senses" : "Show senses"}
              >
                <Brain className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status row - Desktop only */}
          {!isMobile && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Online & Sensing</span>
                {!showSenseStatus && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-2">
                      {aura.senses.slice(0, 5).map((id: string) => {
                        const Icon = SENSE_ICONS[id as keyof typeof SENSE_ICONS]
                        return Icon ? (
                          <Icon key={id} className="w-4 h-4 text-white opacity-80" />
                        ) : null
                      })}
                      {aura.senses.length > 5 && (
                        <span className="text-xs opacity-70">+{aura.senses.length - 5}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Live Awareness - Responsive */}
          {showSenseStatus && (
            <div className={cn("border-t border-white/20", isMobile ? "pt-3" : "pt-4")}>
              <SenseStatus
                senses={aura.senses}
                senseData={senseData}
                isLoading={isLoadingSenses}
                onRefresh={loadSenseData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
        {messages.length === 0 ? (
          <div className={cn("text-center", isMobile ? "py-8" : "py-12")}>
            <div className={cn(
              "bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto",
              isMobile ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"
            )}>
              <MessageCircle className={isMobile ? "w-6 h-6" : "w-8 h-8"} />
            </div>
            <h4 className={cn("font-semibold text-gray-800", isMobile ? "text-base mb-1" : "text-lg mb-2")}>
              Start chatting with {aura.name}
            </h4>
            <p className={cn("text-gray-600", isMobile ? "text-sm mb-3" : "mb-4")}>
              I can sense: {aura.senses.join(", ")}
            </p>
            <div className={cn(
              "inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full",
              isMobile ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
            )}>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Ready to chat!
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className={cn(
                  "bg-white border border-gray-200 rounded-2xl shadow-md",
                  isMobile ? "px-4 py-3" : "px-6 py-4"
                )}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={isMobile ? "text-xl" : "text-2xl"}>{aura.avatar}</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    {!isMobile && <span className="text-xs text-gray-500">{aura.name} is thinking...</span>}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={cn("border-t bg-white", isMobile ? "p-3" : "p-6")}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className={cn("flex", isMobile ? "space-x-2" : "space-x-3")}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${aura.name}...`}
            className={cn(
              "flex-1 border-2 border-purple-200 focus:border-purple-400",
              isMobile
                ? "py-2.5 text-base rounded-full px-4"
                : "py-6 text-lg rounded-xl"
            )}
            disabled={isTyping}
          />
          <Button
            type="submit"
            size={isMobile ? "icon" : "lg"}
            disabled={isTyping || !input.trim()}
            className={cn(
              "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg",
              isMobile
                ? "h-10 w-10 rounded-full"
                : "px-6 py-6 rounded-xl"
            )}
          >
            <Send className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
          </Button>
        </form>
        
        {/* Active Features Indicator - Mobile */}
        {isMobile && (voiceEnabled || showInfluence || showSenseStatus) && (
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
            {voiceEnabled && (
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Voice
              </span>
            )}
            {showInfluence && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Insights
              </span>
            )}
            {showSenseStatus && (
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Senses
              </span>
            )}
          </div>
        )}
        
        {/* Desktop influence indicator */}
        {!isMobile && showInfluence && (
          <div className="mt-3 text-center">
            <span className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              <Eye className="w-3 h-3 inline mr-1" />
              Influence tracking enabled
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}