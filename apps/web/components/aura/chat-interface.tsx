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
import { ConversationService } from "@/lib/services/conversation-service"
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Create conversation
  useEffect(() => {
    if (!conversationId) {
      ConversationService.createConversation(aura.id)
        .then(setConversationId)
        .catch(console.error)
    }
  }, [aura.id, conversationId])

  // Load sense data periodically
  useEffect(() => {
    loadSenseData()
    const interval = setInterval(loadSenseData, CHAT_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [aura.senses])

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
    if (!input.trim() || !conversationId) return
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
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
      
      const auraMsg: Message = {
        id: Date.now().toString() + "_aura",
        role: "aura",
        content: json.reply as string,
        timestamp: new Date(),
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
          timestamp: new Date(),
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
          "max-w-[80%] rounded-2xl px-6 py-4 shadow-md",
          message.role === "user"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            : "bg-white border border-gray-200"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* Rule Trigger Display */}
        {message.metadata?.triggeredRule && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">
              Rule triggered: {message.metadata.triggeredRule}
            </span>
          </div>
        )}

        {/* Influence Display */}
        {showInfluence && <MessageInfluence message={message} />}

        <p className="text-xs mt-3 opacity-60 flex items-center gap-1">
          <span>
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.role === "aura" && showInfluence && (
            <span className="ml-2 bg-black/10 px-2 py-0.5 rounded text-[10px]">
              AI Response
            </span>
          )}
        </p>
      </div>
    </div>
  )

  return (
    <Card className="flex flex-col h-[700px] border-2 border-purple-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 p-4 sm:p-6 text-white">
        <div className="flex flex-col space-y-4">
          {/* Top row - Avatar and Name only */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-3xl sm:text-4xl bg-white/20 p-2 sm:p-3 rounded-xl backdrop-blur-sm flex-shrink-0">
              {aura.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold truncate">{aura.name}</h3>
            </div>
          </div>

          {/* Status and Controls row */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between text-white/80 text-sm -mt-1">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="whitespace-nowrap">Online &amp; Sensing</span>
              </div>

              {/* Sense icons - show when SenseStatus is hidden */}
              {!showSenseStatus && (
                <div className="flex items-center space-x-2 overflow-hidden">
                  {aura.senses.slice(0, 5).map((id: string) => {
                    const Icon = SENSE_ICONS[id as keyof typeof SENSE_ICONS]
                    return Icon ? (
                      <Icon key={id} className="w-4 h-4 text-white opacity-80 flex-shrink-0" />
                    ) : null
                  })}
                  {aura.senses.length > 5 && (
                    <span className="text-xs opacity-70 flex-shrink-0">+{aura.senses.length - 5}</span>
                  )}
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={cn(
                  "text-white hover:bg-white/20 border border-white/30 w-8 h-8 sm:w-9 sm:h-9",
                  voiceEnabled && "bg-white/20"
                )}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfluence((s) => !s)}
                className={cn(
                  "text-white hover:bg-white/20 border border-white/30 w-8 h-8 sm:w-9 sm:h-9",
                  showInfluence && "bg-white/20"
                )}
                title={showInfluence ? "Hide influence details" : "Show influence details"}
              >
                {showInfluence ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSenseStatus((v) => !v)}
                className={cn(
                  "text-white hover:bg-white/20 border border-white/30 w-8 h-8 sm:w-9 sm:h-9",
                  !showSenseStatus && "opacity-60"
                )}
                title={showSenseStatus ? "Hide Live Awareness" : "Show Live Awareness"}
              >
                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
          </div>

          {/* Bottom row - Conditional Live Awareness */}
          {showSenseStatus && (
            <div className="border-t border-white/20 pt-4">
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Start a conversation with {aura.name}
            </h4>
            <p className="text-gray-600 mb-4">
              I can sense and respond to: {aura.senses.join(", ")}
            </p>
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              Ready to chat!
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{aura.avatar}</div>
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
                    <span className="text-xs text-gray-500">{aura.name} is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex space-x-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${aura.name}...`}
            className="flex-1 py-6 text-lg border-2 border-purple-200 focus:border-purple-400 rounded-xl"
            disabled={!conversationId || isTyping}
          />
          <Button
            type="submit"
            size="lg"
            disabled={!conversationId || isTyping || !input.trim()}
            className="px-6 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl shadow-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        {showInfluence && (
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