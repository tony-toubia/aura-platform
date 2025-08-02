import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  // Return HTML page that communicates with parent window
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Apple Health Authorization</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          .note {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>Processing Apple Health Authorization...</h2>
          <p>This window will close automatically.</p>
          <div class="note">
            Note: Full Apple Health integration requires an iOS app with HealthKit.
          </div>
        </div>
        
        <script>
          try {
            if (window.opener && window.opener.postMessage) {
              const errorParam = '${error || ''}';
              const codeParam = '${code || ''}';
              const stateParam = '${state || ''}';
              
              if (errorParam && errorParam !== 'null' && errorParam !== '') {
                window.opener.postMessage({
                  type: 'APPLE_HEALTH_OAUTH_ERROR',
                  error: errorParam,
                  state: stateParam
                }, window.location.origin);
              } else if (codeParam && codeParam !== 'null' && codeParam !== '') {
                window.opener.postMessage({
                  type: 'APPLE_HEALTH_OAUTH_SUCCESS',
                  code: codeParam,
                  state: stateParam
                }, window.location.origin);
              } else {
                // No code or error - something went wrong
                window.opener.postMessage({
                  type: 'APPLE_HEALTH_OAUTH_ERROR',
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
                  type: 'APPLE_HEALTH_OAUTH_ERROR',
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
    `,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}