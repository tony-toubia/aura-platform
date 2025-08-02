// pages/api/auth/microsoft/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, error, error_description } = req.query

  // Handle OAuth errors
  if (error) {
    const errorMessage = error_description || error
    return res.send(`
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
    `)
  }

  // Handle successful authorization
  if (code) {
    return res.send(`
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
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth-success',
                code: '${code}',
                provider: 'microsoft'
              }, window.location.origin);
              window.close();
            } else {
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
    `)
  }

  // Handle missing code
  return res.send(`
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
  `)
}