// pages/api/auth/google/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error, state } = req.query

  const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Error</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'oauth-error',
              error: '${error}'
            }, '${origin}')
            window.close()
          </script>
        </body>
      </html>
    `)
  }

  if (code) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Success</title>
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>✅ Authorization Successful</h2>
            <p>You can close this window now.</p>
          </div>
          <script>
            window.opener.postMessage({
              type: 'oauth-success',
              code: '${code}',
              state: '${state || ''}'
            }, '${origin}')
            window.close()
          </script>
        </body>
      </html>
    `)
  }

  res.status(400).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>OAuth Error</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>❌ Invalid OAuth Callback</h2>
          <p>Missing authorization code. Please try again.</p>
        </div>
      </body>
    </html>
  `)
}


