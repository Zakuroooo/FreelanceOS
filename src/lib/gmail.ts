/**
 * Shared Gmail API utility
 * - Decrypts stored OAuth tokens
 * - Auto-refreshes expired access tokens
 * - Sends emails via Gmail API (RFC 2822, base64url encoded)
 */

import { decrypt, encrypt } from './encryption'
import User from './models/User'

interface GmailTokens {
  accessToken: string
  refreshToken: string
  tokenExpiry: number
  gmailAddress: string
}

/** Load and decrypt Gmail tokens for a user. Returns null if not connected. */
export async function getGmailTokens(userId: string): Promise<GmailTokens | null> {
  const user = await User.findById(userId).select('gmailOAuth').lean() as any
  const oauth = user?.gmailOAuth
  if (!oauth?.accessToken) return null

  return {
    accessToken:  decrypt(oauth.accessToken),
    refreshToken: oauth.refreshToken ? decrypt(oauth.refreshToken) : '',
    tokenExpiry:  oauth.tokenExpiry,
    gmailAddress: oauth.gmailAddress,
  }
}

/** Refresh access token if expired. Updates DB automatically. */
export async function getFreshAccessToken(userId: string, tokens: GmailTokens): Promise<string> {
  // If token is still valid (with 5 min buffer) — return as-is
  if (tokens.tokenExpiry > Date.now() + 300_000) {
    return tokens.accessToken
  }

  if (!tokens.refreshToken) throw new Error('No refresh token available — user must reconnect Gmail')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokens.refreshToken,
      grant_type:    'refresh_token',
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Token refresh failed: ${txt}`)
  }

  const data = await res.json() as { access_token: string; expires_in: number }
  const newExpiry = Date.now() + (data.expires_in * 1000)

  // Persist updated token
  await User.findByIdAndUpdate(userId, {
    'gmailOAuth.accessToken': encrypt(data.access_token),
    'gmailOAuth.tokenExpiry': newExpiry,
  })

  return data.access_token
}

/** Build RFC 2822 email and base64url-encode it for Gmail API */
export function buildRawEmail({
  from, fromName, to, subject, html,
}: {
  from: string
  fromName: string
  to: string
  subject: string
  html: string
}): string {
  const boundary = `freelanceos_${Date.now()}`
  const email = [
    `From: ${fromName} <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    html.replace(/<[^>]+>/g, ''),   // Plain text fallback
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ].join('\r\n')

  // base64url encode (Gmail API requirement)
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Send an email using the Gmail API */
export async function sendViaGmail({
  accessToken, from, fromName, to, subject, html,
}: {
  accessToken: string
  from: string
  fromName: string
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const raw = buildRawEmail({ from, fromName, to, subject, html })

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  if (!res.ok) {
    const err = await res.text()
    return { success: false, error: err }
  }

  const data = await res.json() as { id: string }
  return { success: true, messageId: data.id }
}

/** Convert plain pitch text into a nicely formatted HTML email */
export function pitchToHtml(pitchBody: string, senderName: string): string {
  const paragraphs = pitchBody
    .split(/\n{2,}/)
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 16px;line-height:1.7;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:28px 40px;">
              <span style="color:#ff4455;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">FreelanceOS</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;color:#1a1a2e;font-size:15px;">
              ${paragraphs}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#999;">
                Sent by ${senderName} via FreelanceOS
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
