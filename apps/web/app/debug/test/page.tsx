// app/debug/test/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'

interface TestResult {
  success: boolean
  error?: string
  timestamp?: string
  user?: any
  tests?: any
  details?: any
  stack?: string
}

export default function DiagnosticsTestPage() {
  const [basicTest, setBasicTest] = useState<TestResult | null>(null)
  const [diagnosticsTest, setDiagnosticsTest] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const runBasicTest = async () => {
    setLoading('basic')
    try {
      const response = await fetch('/api/debug/test-basic')
      const result = await response.json()
      setBasicTest(result)
    } catch (error) {
      setBasicTest({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(null)
    }
  }

  const runDiagnosticsTest = async () => {
    setLoading('diagnostics')
    try {
      const response = await fetch('/api/debug/senses-diagnostics')
      const result = await response.json()
      setDiagnosticsTest(result)
    } catch (error) {
      setDiagnosticsTest({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Diagnostics System Tests</h1>
        <p className="text-gray-600 mt-2">
          Test the diagnostic endpoints to identify any issues
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Basic System Test
              <Button
                onClick={runBasicTest}
                disabled={loading === 'basic'}
                size="sm"
              >
                {loading === 'basic' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Run Test'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {basicTest && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {basicTest.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Badge variant={basicTest.success ? 'default' : 'destructive'}>
                    {basicTest.success ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>

                {basicTest.success && basicTest.tests && (
                  <div className="space-y-2">
                    <p className="font-medium">Test Results:</p>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Auth:</span>
                        <Badge variant={basicTest.tests.auth ? 'default' : 'destructive'}>
                          {basicTest.tests.auth ? 'OK' : 'FAIL'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Auras:</span>
                        <Badge variant={basicTest.tests.auras ? 'default' : 'destructive'}>
                          {basicTest.tests.auras ? `${basicTest.tests.aurasCount} found` : 'FAIL'}
                        </Badge>
                      </div>
                      {basicTest.tests.tables && (
                        <div className="mt-2">
                          <p className="font-medium text-xs">Database Tables:</p>
                          {basicTest.tests.tables.map((table: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span>{table.table}:</span>
                              <Badge 
                                variant={table.accessible ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {table.accessible ? `${table.count} rows` : 'ERROR'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {basicTest.error && (
                  <div className="bg-red-50 p-3 rounded text-sm">
                    <p className="font-medium text-red-800">Error:</p>
                    <p className="text-red-600">{basicTest.error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Diagnostics Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Full Diagnostics Test
              <Button
                onClick={runDiagnosticsTest}
                disabled={loading === 'diagnostics'}
                size="sm"
              >
                {loading === 'diagnostics' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Run Test'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diagnosticsTest && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {diagnosticsTest.success !== false ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Badge variant={diagnosticsTest.success !== false ? 'default' : 'destructive'}>
                    {diagnosticsTest.success !== false ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>

                {diagnosticsTest.success !== false && (
                  <div className="text-sm">
                    <p>Diagnostics endpoint working correctly!</p>
                    {diagnosticsTest.systemStatus && (
                      <div className="mt-2 space-y-1">
                        <div>Total Senses: {diagnosticsTest.systemStatus.totalSenses}</div>
                        <div>Active Senses: {diagnosticsTest.systemStatus.activeSenses}</div>
                        <div>Total Rules: {diagnosticsTest.systemStatus.totalRules}</div>
                      </div>
                    )}
                  </div>
                )}

                {diagnosticsTest.error && (
                  <div className="bg-red-50 p-3 rounded text-sm">
                    <p className="font-medium text-red-800">Error:</p>
                    <p className="text-red-600 mb-2">{diagnosticsTest.error}</p>
                    {diagnosticsTest.message && (
                      <p className="text-red-600 text-xs">{diagnosticsTest.message}</p>
                    )}
                    {diagnosticsTest.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-red-700 font-medium">Stack Trace</summary>
                        <pre className="text-xs mt-1 bg-red-100 p-2 rounded overflow-auto">
                          {diagnosticsTest.details}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Run the <strong>Basic System Test</strong> first to verify authentication and database access</li>
            <li>If the basic test passes, run the <strong>Full Diagnostics Test</strong></li>
            <li>Check browser console and server logs for detailed error information</li>
            <li>If both tests pass, try accessing <code>/senses-diagnostics</code> directly</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}