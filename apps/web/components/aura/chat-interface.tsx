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
  Activity,
  RefreshCw,
  Cloud,
  Droplets,
  Sun,
  Globe,
  Wind,
  Brain,
  MessageCircle,
  Sparkles,
  Zap,
  Heart,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ConversationService } from "@/lib/services/conversation-service"
import { SenseDataService } from "@/lib/services/sense-data-service"
import type { Aura, Message, NewsArticle } from "@/types"

interface ChatInterfaceProps {
  aura: Aura
  conversationId?: string
  showInfluenceLog?: boolean
}

const senseIcons = {
  weather: Cloud,
  soil_moisture: Droplets,
  light_level: Sun,
  news: Globe,
  wildlife: Activity,
  air_quality: Wind,
}

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
  const [showSenseStatus, setShowSenseStatus] = useState(true) // toggle Live Awareness section
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // create conversation
  useEffect(() => {
    if (!conversationId) {
      ConversationService.createConversation(aura.id)
        .then(setConversationId)
        .catch(console.error)
    }
  }, [aura.id, conversationId])

  // load sense data periodically
  useEffect(() => {
    loadSenseData()
    const iv = setInterval(loadSenseData, 60_000)
    return () => clearInterval(iv)
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

  // send & receive
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
          content:
            "I'm having trouble connecting right now. Please try again.",
          timestamp: new Date(),
          metadata: { isError: true },
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  // Full Live Awareness panel (with sense cards)
  const renderSenseStatus = () => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-purple-800 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Live Awareness
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSenseData}
          disabled={isLoadingSenses}
          className="hover:bg-purple-100"
        >
          <RefreshCw
            className={cn("w-4 h-4", isLoadingSenses && "animate-spin")}
          />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Weather */}
        {aura.senses.includes("weather") && senseData.weather && (
          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg border border-blue-200">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Weather</div>
              <div className="text-xs text-gray-600">
                {senseData.weather.main?.temp
                  ? `${Math.round(senseData.weather.main.temp)}°C, ${senseData.weather.weather[0]?.description}`
                  : senseData.weather.temperature
                  ? `${senseData.weather.temperature}°C, ${senseData.weather.description}`
                  : "Loading..."}
              </div>
            </div>
          </div>
        )}

        {/* Soil Moisture */}
        {aura.senses.includes("soil_moisture") && senseData.soil_moisture && (
          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Soil Moisture</div>
              <div className="text-xs text-gray-600">
                {Math.round(senseData.soil_moisture)}%
              </div>
            </div>
          </div>
        )}

        {/* Light Level */}
        {aura.senses.includes("light_level") && senseData.light_level && (
          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg border border-yellow-200">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Light Level</div>
              <div className="text-xs text-gray-600">
                {Math.round(senseData.light_level)} lux
              </div>
            </div>
          </div>
        )}

        {/* News */}
        {aura.senses.includes("news") && senseData.news && (
          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg border border-purple-200">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">News</div>
              <div className="text-xs text-gray-600">
                {(senseData.news.articles as NewsArticle[])?.length || 0} articles
              </div>
            </div>
          </div>
        )}

        {/* Air Quality */}
        {aura.senses.includes("air_quality") && senseData.air_quality && (
          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Air Quality</div>
              <div className="text-xs text-gray-600">
                AQI {senseData.air_quality.aqi || "Unknown"}
              </div>
            </div>
          </div>
        )}

        {/* Wildlife */}
        {aura.senses.includes("wildlife") && senseData.wildlife && (
          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg border border-emerald-200">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Wildlife</div>
              <div className="text-xs text-gray-600">
                Activity: {senseData.wildlife.activity || "Unknown"}%
              </div>
            </div>
          </div>
        )}
      </div>

      {Object.keys(senseData).length === 0 && (
        <div className="text-center py-2 text-gray-500">
          <AlertCircle className="w-5 h-5 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No sense data available</p>
        </div>
      )}
    </div>
  )

  return (
    <Card className="flex flex-col h-[700px] border-2 border-purple-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-4xl bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              {aura.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold">{aura.name}</h3>
              <div className="flex items-center space-x-2 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm">Online &amp; Sensing</span>
                {!showSenseStatus && (
                  <div className="flex items-center space-x-1 ml-3">
                    {aura.senses.map((id) => {
                      const key = id as keyof typeof senseIcons
                      const Icon = senseIcons[key]
                      return (
                        <Icon
                          key={id}
                          className="w-4 h-4 text-white opacity-80"
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVoiceEnabled((v) => !v)}
              className={cn(
                "text-white hover:bg-white/20 border border-white/30",
                voiceEnabled && "bg-white/20"
              )}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfluence((s) => !s)}
              className={cn(
                "text-white hover:bg-white/20 border border-white/30",
                showInfluence && "bg-white/20"
              )}
              title={showInfluence ? "Hide influence details" : "Show influence details"}
            >
              {showInfluence ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            {/* Brain toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSenseStatus((v) => !v)}
              className={cn(
                "text-white hover:bg-white/20 border border-white/30",
                !showSenseStatus && "opacity-60"
              )}
              title={showSenseStatus ? "Hide Live Awareness" : "Show Live Awareness"}
            >
              <Brain className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* conditional Live Awareness */}
        {showSenseStatus && renderSenseStatus()}
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
          messages.map((message) => (
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

                {/* Enhanced Rule Trigger Display */}
                {message.metadata?.triggeredRule && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-700 font-medium">
                      Rule triggered: {message.metadata.triggeredRule}
                    </span>
                  </div>
                )}

                {/* Enhanced Influence Display */}
                {showInfluence && message.metadata && message.role === "aura" && (
                  <div className="mt-4 space-y-2">
                    {/* General Influences */}
                    {message.metadata.influences && message.metadata.influences.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          Response Influences
                        </h5>
                        <div className="space-y-1">
                          {message.metadata.influences.map((inf: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-blue-700">
                              <TrendingUp className="w-3 h-3" />
                              <span>{inf}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sense Influences */}
                    {message.metadata.senseInfluences && message.metadata.senseInfluences.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h5 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Sensor Data Used
                        </h5>
                        <div className="space-y-1">
                          {message.metadata.senseInfluences.map((sense: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              <span>{sense}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personality Factors */}
                    {message.metadata.personalityFactors && message.metadata.personalityFactors.length > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <h5 className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          Personality Traits
                        </h5>
                        <div className="space-y-1">
                          {message.metadata.personalityFactors.map((factor: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-purple-700">
                              <Sparkles className="w-3 h-3" />
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {message.metadata.isError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-red-700">
                          <AlertCircle className="w-3 h-3" />
                          <span>Connection error occurred</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
          ))
        )}

        {/* Enhanced Typing Indicator */}
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
