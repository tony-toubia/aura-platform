"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MessageCircle, 
  Calendar, 
  Filter,
  ChevronRight,
  Clock,
  User,
  Bot,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ConversationDetail } from './conversation-detail'

interface ConversationData {
  id: string
  session_id: string
  created_at: string
  started_at: string
  aura_id: string
  aura: {
    id: string
    name: string
    vessel_type: string
    user_id: string
  }
  messages: { count: number }[]
}

interface AuraData {
  id: string
  name: string
  vessel_type: string
  conversations: { count: number }[]
}

interface ConversationsContentProps {
  auras: AuraData[]
  conversations: ConversationData[]
}

export function ConversationsContent({ auras, conversations }: ConversationsContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAura, setSelectedAura] = useState<string | null>(null)
  const [filteredConversations, setFilteredConversations] = useState(conversations)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  // Filter conversations based on search and aura selection
  useEffect(() => {
    let filtered = conversations

    // Filter by selected aura
    if (selectedAura) {
      filtered = filtered.filter(conv => conv.aura.id === selectedAura)
    }

    // Filter by search query (searches aura name and session ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(conv => 
        conv.aura.name.toLowerCase().includes(query) ||
        conv.session_id.toLowerCase().includes(query)
      )
    }

    setFilteredConversations(filtered)
  }, [searchQuery, selectedAura, conversations])

  const getVesselIcon = (vesselType: string) => {
    switch (vesselType) {
      case 'digital': return '💻'
      case 'terra': return '🌱'
      case 'companion': return '🤖'
      case 'memory': return '💭'
      case 'sage': return '🧙‍♂️'
      default: return '✨'
    }
  }

  const getVesselColor = (vesselType: string) => {
    switch (vesselType) {
      case 'digital': return 'bg-blue-100 text-blue-800'
      case 'terra': return 'bg-green-100 text-green-800'
      case 'companion': return 'bg-purple-100 text-purple-800'
      case 'memory': return 'bg-orange-100 text-orange-800'
      case 'sage': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalConversations = conversations.length
  const totalMessages = conversations.reduce((sum, conv) => sum + (conv.messages[0]?.count || 0), 0)

  // If a conversation is selected, show the detail view
  if (selectedConversationId) {
    return (
      <ConversationDetail 
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversations</h1>
        <p className="text-gray-600">
          Browse and search through your past conversations with your Auras
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Auras</p>
                <p className="text-2xl font-bold text-gray-900">{auras.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Aura Filter */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter by Aura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedAura === null ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedAura(null)}
              >
                All Auras ({totalConversations})
              </Button>
              {auras.map((aura) => {
                const conversationCount = conversations.filter(c => c.aura.id === aura.id).length
                return (
                  <Button
                    key={aura.id}
                    variant={selectedAura === aura.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedAura(aura.id)}
                  >
                    <span className="mr-2">{getVesselIcon(aura.vessel_type)}</span>
                    <span className="truncate">{aura.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {conversationCount}
                    </Badge>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations by aura name or session..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="space-y-4">
            {filteredConversations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedAura 
                      ? "Try adjusting your search or filter criteria."
                      : "Start chatting with your Auras to see conversations here."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredConversations.map((conversation) => (
                <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl">
                            {getVesselIcon(conversation.aura.vessel_type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {conversation.aura.name}
                            </h3>
                            <Badge className={getVesselColor(conversation.aura.vessel_type)}>
                              {conversation.aura.vessel_type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {conversation.messages[0]?.count || 0} messages
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(new Date(conversation.started_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Started {formatDistanceToNow(new Date(conversation.started_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedConversationId(conversation.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/auras/${conversation.aura.id}/chat?conversation=${conversation.id}`}>
                            Continue Chat
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Load More Button (for future pagination) */}
          {filteredConversations.length >= 50 && (
            <div className="mt-8 text-center">
              <Button variant="outline">
                Load More Conversations
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}