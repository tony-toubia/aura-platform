'use client'

import { useEffect } from 'react'

export default function MicrosoftCallbackPage() {
  useEffect(() => {
    // Extract authorization code from URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    console.log('🔄 Microsoft Outlook OAuth callback received:', { code: !!code, error })

    if (error) {
      console.error('❌ OAuth error:', error)
      // Send error message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth-error',
          error: error
        }, window.location.origin)
      }
      window.close()
      return
    }

    if (code) {
      console.log('✅ OAuth code received, sending to parent window')
      // Send success message with code to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth-success',
          code: code
        }, window.location.origin)
      }
      window.close()
    } else {
      console.error('❌ No code or error received in callback')
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth-error',
          error: 'No authorization code received'
        }, window.location.origin)
      }
      window.close()
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Microsoft Outlook authorization...</p>
        <p className="text-sm text-gray-500 mt-2">This window will close automatically.</p>
      </div>
    </div>
  )
}