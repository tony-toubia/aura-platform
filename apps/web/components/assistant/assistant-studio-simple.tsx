"use client"

import React from "react"

interface AssistantStudioProps {
  canCreate: boolean
}

export function AssistantStudio({ canCreate }: AssistantStudioProps) {
  if (!canCreate) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Upgrade Required</h2>
            <p className="text-gray-600">You need to upgrade your plan to create AI assistants.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Assistant Studio</h1>
          <p className="text-xl text-gray-600 mb-8">
            Build your intelligent AI assistant with personalized data sources and behaviors.
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-gray-600">
              The Assistant Studio is currently under development. 
              This will be your hub for creating and managing AI assistants.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}