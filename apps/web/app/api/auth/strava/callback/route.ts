// app/api/auth/strava/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  // Create the callback HTML that communicates with the parent window
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Strava OAuth Callback</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #fc4c02 0%, #e34402 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          .success {
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container ${error ? 'error' : 'success'}">
          ${error ? `
            <h2>❌ Authorization Failed</h2>
            <p>Strava authorization was denied or failed.</p>
            <p><small>Error: ${error}</small></p>
          ` : `
            <div class="spinner"></div>
            <h2>✅ Authorization Successful</h2>
            <p>Connecting to Strava...</p>
          `}
        </div>
        
        <script>
          try {
            if (window.opener && window.opener.postMessage) {
              const errorParam = '${error || ''}';
              const codeParam = '${code || ''}';
              const stateParam = '${state || ''}';
              
              if (errorParam && errorParam !== 'null' && errorParam !== '') {
                window.opener.postMessage({
                  type: 'STRAVA_OAUTH_ERROR',
                  error: errorParam,
                  state: stateParam
                }, window.location.origin);
              } else if (codeParam && codeParam !== 'null' && codeParam !== '') {
                window.opener.postMessage({
                  type: 'STRAVA_OAUTH_SUCCESS',
                  code: codeParam,
                  state: stateParam
                }, window.location.origin);
              } else {
                // No code or error - something went wrong
                window.opener.postMessage({
                  type: 'STRAVA_OAUTH_ERROR',
                  error: 'No authorization code received',
                  state: stateParam
                }, window.location.origin);
              }
              
              // Close the popup after a short delay
              setTimeout(() => {
                window.close();
              }, 1500);
            } else {
              console.error('No opener window found');
              setTimeout(() => {
                window.close();
              }, 3000);
            }
          } catch (err) {
            console.error('Callback error:', err);
            if (window.opener && window.opener.postMessage) {
              try {
                window.opener.postMessage({
                  type: 'STRAVA_OAUTH_ERROR',
                  error: 'Callback processing failed: ' + (err.message || 'Unknown error'),
                  state: '${state || ''}'
                }, window.location.origin);
              } catch (postErr) {
                console.error('Failed to post error message:', postErr);
              }
            }
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        </script>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}