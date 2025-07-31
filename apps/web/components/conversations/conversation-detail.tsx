"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  MessageCircle, 
  Calendar, 
  Clock,
  User,
  Bot,
  Copy,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import type { Message } from '@/types'

interface ConversationDetailProps {
  conversationId: string
  onBack: () => void
}

interface ConversationData {
  id: string
  aura: {
    id: string
    name: string
    user_id: string
  }
}

export function ConversationDetail({ conversationId, onBack }: ConversationDetailProps) {
  const [conversation, setConversation] = useState<ConversationData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConversationDetails()
  }, [conversationId])

  const fetchConversationDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversation details')
      }

      const data = await response.json()
      setConversation(data.conversation)
      setMessages(data.messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy message:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Conversation</h3>
          <p className="text-gray-600 mb-4">{error || 'Conversation not found'}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Conversations
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Conversation with {conversation.aura.name}
            </h1>
            <p className="text-gray-600">{messages.length} messages</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/auras/${conversation.aura.id}/chat?conversation=${conversationId}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue Chat
            </Link>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No messages in this conversation</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : message.role === 'aura'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : message.role === 'aura' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {message.role === 'aura' ? conversation.aura.name : message.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs ${
                        message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {format(new Date(message.timestamp), 'HH:mm')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 ${
                          message.role === 'user' 
                            ? 'hover:bg-purple-700 text-purple-200 hover:text-white' 
                            : 'hover:bg-gray-200'
                        }`}
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>

                  {/* Message metadata */}
                  {message.metadata && (
                    <div className="mt-3 pt-2 border-t border-opacity-20 border-current">
                      {message.metadata.influences && message.metadata.influences.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium mb-1">Influences:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.metadata.influences.map((influence, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {influence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.metadata.senseData && message.metadata.senseData.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Sense Data:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.metadata.senseData.map((sense, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-xs"
                              >
                                {sense.sense}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}