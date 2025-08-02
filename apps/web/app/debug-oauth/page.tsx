'use client'

import { useState } from 'react'

export default function DebugOAuthPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testAPIDirectly = async () => {
    setLoading(true)
    addLog('🧪 Starting direct API test...')

    try {
      const testData = {
        provider: 'test_provider',
        sense_type: 'fitness',
        provider_user_id: 'test@example.com',
        access_token: 'test_access_token_' + Date.now(),
        refresh_token: 'test_refresh_token_' + Date.now(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        scope: 'test_scope',
        aura_id: null // Test without aura_id first
      }

      addLog(`📤 Sending request: ${JSON.stringify(testData, null, 2)}`)

      const response = await fetch('/api/oauth-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })

      const result = await response.json()

      addLog(`📥 Response status: ${response.status} ${response.statusText}`)
      addLog(`📋 Response body: ${JSON.stringify(result, null, 2)}`)

      if (response.ok) {
        addLog('✅ Direct API test successful!', 'success')
      } else {
        addLog(`❌ Direct API test failed: ${result.error}`, 'error')
      }
    } catch (error: any) {
      addLog(`❌ Direct API test error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const testWithAuraId = async () => {
    setLoading(true)
    addLog('🧪 Testing with aura_id...')

    try {
      // First, get an aura ID
      const auraResponse = await fetch('/api/auras')
      const auras = await auraResponse.json()
      
      if (!auras || auras.length === 0) {
        addLog('❌ No auras found. Create an aura first.', 'error')
        return
      }

      const auraId = auras[0].id
      addLog(`📋 Using aura_id: ${auraId}`)

      const testData = {
        provider: 'test_provider_with_aura',
        sense_type: 'fitness',
        provider_user_id: 'test@example.com',
        access_token: 'test_access_token_' + Date.now(),
        refresh_token: 'test_refresh_token_' + Date.now(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        scope: 'test_scope',
        aura_id: auraId
      }

      addLog(`📤 Sending request with aura_id: ${JSON.stringify(testData, null, 2)}`)

      const response = await fetch('/api/oauth-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })

      const result = await response.json()

      addLog(`📥 Response status: ${response.status} ${response.statusText}`)
      addLog(`📋 Response body: ${JSON.stringify(result, null, 2)}`)

      if (response.ok) {
        addLog('✅ API test with aura_id successful!', 'success')
      } else {
        addLog(`❌ API test with aura_id failed: ${result.error}`, 'error')
      }
    } catch (error: any) {
      addLog(`❌ API test with aura_id error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const checkExistingConnections = async () => {
    setLoading(true)
    addLog('🔍 Checking existing connections...')

    try {
      const response = await fetch('/api/oauth-connections')
      const result = await response.json()

      addLog(`📥 GET Response status: ${response.status} ${response.statusText}`)
      addLog(`📋 Existing connections: ${JSON.stringify(result, null, 2)}`)

      if (response.ok) {
        addLog(`✅ Found ${Array.isArray(result) ? result.length : 0} existing connections`, 'success')
      } else {
        addLog(`❌ Failed to fetch connections: ${result.error}`, 'error')
      }
    } catch (error: any) {
      addLog(`❌ Error fetching connections: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Connection Debug Tool</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testAPIDirectly}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Directly (no aura_id)'}
        </button>
        
        <button
          onClick={testWithAuraId}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API with aura_id'}
        </button>
        
        <button
          onClick={checkExistingConnections}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Existing Connections'}
        </button>
        
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Logs:</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Click a test button to start debugging.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
          <li>First, check your browser's Network tab (F12 → Network)</li>
          <li>Click "Test API Directly" to see if the API endpoint is reachable</li>
          <li>Check the server console for detailed logs with request IDs</li>
          <li>If the API works, try "Test API with aura_id"</li>
          <li>Check "Existing Connections" to see what's in the database</li>
        </ol>
      </div>
    </div>
  )
}