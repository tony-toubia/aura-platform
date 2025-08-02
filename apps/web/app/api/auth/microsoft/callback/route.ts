// app/api/auth/microsoft/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    const errorMessage = error_description || error
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Microsoft OAuth Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <script>
            console.log('Microsoft OAuth Error:', '${errorMessage}');
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth-error',
                error: '${errorMessage}'
              }, window.location.origin);
              window.close();
            } else {
              document.body.innerHTML = \`
                <div class="error">
                  <h2>❌ Microsoft OAuth Error</h2>
                  <p>${errorMessage}</p>
                  <p>Please close this window and try again.</p>
                </div>
              \`;
            }
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }

  // Handle successful authorization
  if (code) {
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Microsoft OAuth Success</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .success { color: #28a745; }
          </style>
        </head>
        <body>
          <script>
            console.log('Microsoft OAuth Success - Code received');
            if (window.opener) {
              console.log('Posting message to opener window');
              window.opener.postMessage({
                type: 'oauth-success',
                code: '${code}',
                provider: 'microsoft'
              }, window.location.origin);
              setTimeout(() => {
                window.close();
              }, 100);
            } else {
              console.log('No opener window found');
              document.body.innerHTML = \`
                <div class="success">
                  <h2>✅ Microsoft OAuth Successful</h2>
                  <p>Authorization completed. You can close this window.</p>
                </div>
              \`;
            }
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }

  // Handle missing code
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Microsoft OAuth Callback</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
        </style>
      </head>
      <body>
        <div>
          <h2>❌ Invalid OAuth Callback</h2>
          <p>Missing authorization code. Please try again.</p>
        </div>
      </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}