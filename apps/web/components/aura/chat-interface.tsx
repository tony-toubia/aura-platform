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
  Info,
  Zap, // ← imported for rule-triggered indicator
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // auto-scroll on new messages
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
    const iv = setInterval(loadSenseData, 30_000)
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

  // send & receive messages
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
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Chat failed")

      const auraMsg: Message = {
        id: Date.now().toString() + "_aura",
        role: "aura",
        content: json.reply as string,
        timestamp: new Date(),
        metadata: json.metadata ?? {},
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
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const renderSenseStatus = () => (
    <div className="flex items-center space-x-4 text-sm">
      <span className="font-medium text-gray-700">Live Senses:</span>
      {/* weather, soil, light omitted for brevity */}
      {aura.senses.includes("news") && senseData.news && (
        <div className="flex flex-col text-sm text-gray-700">
          <span className="font-medium">Top headlines:</span>
          <ul className="list-disc ml-4">
            {(
              senseData.news.articles as NewsArticle[]
            )
              .slice(0, 3)
              .map((article, idx) => (
                <li key={idx}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.title}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={loadSenseData}
        disabled={isLoadingSenses}
        className="ml-auto"
      >
        <RefreshCw
          className={cn("w-4 h-4", isLoadingSenses && "animate-spin")}
        />
      </Button>
    </div>
  )

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{aura.avatar}</div>
            <div>
              <h3 className="font-semibold">{aura.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVoiceEnabled((v) => !v)}
              className={cn(voiceEnabled && "bg-primary/10")}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfluence((s) => !s)}
              className={cn(showInfluence && "bg-primary/10")}
            >
              {showInfluence ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        {renderSenseStatus()}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Start a conversation with {aura.name}</p>
            <p className="text-sm mt-2">
              I can sense: {aura.senses.join(", ")}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg px-4 py-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>

                { /* show which rule triggered, if any */ }
                {message.metadata?.triggeredRule && (
                  <div className="flex items-center space-x-1 text-xs mt-2 text-amber-600">
                    <Zap className="w-3 h-3" />
                    <span>Rule triggered: {message.metadata.triggeredRule}</span>
                  </div>
                )}

                {/* existing influences log */}
                {message.metadata?.influences && showInfluence && (
                  <div className="text-xs mt-2 opacity-70 space-y-1">
                    {message.metadata.influences.map((inf, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>{inf}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${aura.name}...`}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!conversationId || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
