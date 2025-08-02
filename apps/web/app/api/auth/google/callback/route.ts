// app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Error</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_OAUTH_ERROR',
                  error: '${error}'
                }, '*');
                window.close();
              } else {
                document.body.innerHTML = '<h1>Authorization failed</h1><p>Error: ${error}</p>';
              }
            </script>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      })
    }

    if (!code) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Error</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_OAUTH_ERROR',
                  error: 'No authorization code received'
                }, '*');
                window.close();
              } else {
                document.body.innerHTML = '<h1>Authorization failed</h1><p>No authorization code received</p>';
              }
            </script>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Return success HTML that communicates with parent window
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_SUCCESS',
                code: '${code}'
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = '<h1>Authorization successful!</h1><p>You can close this window.</p>';
            }
          </script>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_ERROR',
                error: 'Internal server error'
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = '<h1>Authorization failed</h1><p>Internal server error</p>';
            }
          </script>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}