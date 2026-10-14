/**
 * Shared Gmail API utility
 * - Decrypts stored OAuth tokens
 * - Auto-refreshes expired access tokens
 * - Sends emails via Gmail API (RFC 2822, base64url encoded)
 */

import { randomBytes } from 'crypto'
import { decrypt, encrypt } from './encryption'
import User from './models/User'

/** httpOnly cookie holding the single-use OAuth nonce for the Gmail connect flow. */
export const GMAIL_STATE_COOKIE = 'gmail_oauth_state'

interface GmailTokens {
  accessToken: string
  refreshToken: string
  tokenExpiry: number
  gmailAddress: string
}

/** Load and decrypt Gmail tokens for a user. Returns null if not connected. */
export async function getGmailTokens(userId: string): Promise<GmailTokens | null> {
  const user = await User.findById(userId).select('gmailOAuth').lean()
  const oauth = user?.gmailOAuth
  if (!oauth?.accessToken) return null

  // A corrupt or key-rotated ciphertext used to throw out of here, and every caller
  // reads tokens outside a try block — so it surfaced as an unhandled 500. "Cannot
  // decrypt the stored token" and "no token stored" have the same remedy for the user,
  // which is to reconnect Gmail, so report them the same way.
  try {
    return {
      accessToken:  decrypt(oauth.accessToken),
      refreshToken: oauth.refreshToken ? decrypt(oauth.refreshToken) : '',
      tokenExpiry:  oauth.tokenExpiry,
      gmailAddress: oauth.gmailAddress,
    }
  } catch (err) {
    console.error('[gmail] Could not decrypt stored tokens for user', userId, err)
    return null
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

  const data = await res.json() as {
    access_token: string
    expires_in: number
    refresh_token?: string
  }
  const newExpiry = Date.now() + (data.expires_in * 1000)

  // Persist updated token. Google may hand back a rotated `refresh_token` on this
  // response; the old code did not read the field, so the superseded token stayed in
  // the database and Gmail sending silently died once Google stopped accepting it.
  const patch: Record<string, unknown> = {
    'gmailOAuth.accessToken': encrypt(data.access_token),
    'gmailOAuth.tokenExpiry': newExpiry,
  }
  if (data.refresh_token && data.refresh_token !== tokens.refreshToken) {
    patch['gmailOAuth.refreshToken'] = encrypt(data.refresh_token)
  }
  await User.findByIdAndUpdate(userId, patch)

  return data.access_token
}

/*
 * Header hygiene.
 *
 * Every header value below is attacker-influenced: `to` arrives in the request body,
 * `subject` comes out of an LLM and then out of the database, `fromName` is the user's
 * own profile name. RFC 2822 separates headers with CRLF, so a single "\r\n" inside any
 * of those values injects a header of the caller's choosing — `Bcc:` being the obvious
 * one, which would turn the sender's own Gmail account into a relay. These helpers are
 * the only place a value is allowed to become a header.
 */

/** Strip CR, LF and any other control character that could terminate a header. */
function sanitizeHeader(value: string): string {
  let out = ''
  for (const ch of value) {
    const code = ch.codePointAt(0)!
    // CR and LF collapse to a space so words do not run together; every other control
    // character, DEL included, is dropped. Written as a code-point test rather than a
    // regex so no literal control byte ever has to live in this file.
    if (code === 10 || code === 13) { out += ' '; continue }
    if (code < 32 || code === 127) continue
    out += ch
  }
  return out.trim()
}

/** Strip everything that would let an address break out of its `<...>`. */
function sanitizeAddress(value: string): string {
  return sanitizeHeader(value).replace(/[<>,;\s]/g, '')
}

/**
 * Shape check for a single recipient address. Deliberately loose — the authority on
 * deliverability is Gmail, not a regex — but it rejects the two things that matter:
 * anything that is not one `local@domain` pair, and anything carrying characters that
 * only make sense to someone trying to smuggle a second header or a second recipient.
 */
export function isValidEmail(value: string): boolean {
  return typeof value === 'string'
    && value.length <= 254
    && /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;".]+$/.test(value.trim())
}

/**
 * RFC 2047 encoded-word for a header containing non-ASCII (an emoji or a curly quote in
 * a generated subject line, most often). Chunked on code-point boundaries so a
 * multi-byte character is never split across two words, and folded so no line exceeds
 * the 76-character limit.
 */
function encodeHeaderWord(value: string): string {
  // 45 UTF-8 bytes encode to 60 base64 characters, which leaves room for the
  // `=?UTF-8?B?` … `?=` wrapper inside the line limit.
  const MAX_BYTES = 45
  const words: string[] = []
  let chunk = ''
  let bytes = 0

  for (const ch of value) {
    const size = Buffer.byteLength(ch, 'utf8')
    if (bytes + size > MAX_BYTES && chunk) {
      words.push(chunk)
      chunk = ''
      bytes = 0
    }
    chunk += ch
    bytes += size
  }
  if (chunk) words.push(chunk)

  return words
    .map(w => `=?UTF-8?B?${Buffer.from(w, 'utf8').toString('base64')}?=`)
    .join('\r\n ')
}

/** True when the value holds anything outside printable ASCII, so it needs encoding. */
function hasNonAscii(value: string): boolean {
  for (const ch of value) {
    const code = ch.codePointAt(0)!
    if (code < 32 || code > 126) return true
  }
  return false
}

/** Header-safe text: control characters removed, non-ASCII RFC 2047 encoded. */
function headerText(value: string): string {
  const clean = sanitizeHeader(value)
  return hasNonAscii(clean) ? encodeHeaderWord(clean) : clean
}

/**
 * Display name for a `From:` header. An encoded word must sit outside quotes to be
 * decoded, so non-ASCII names are encoded and plain ones are quoted — a name containing
 * a comma would otherwise parse as two separate addresses.
 */
function displayName(value: string): string {
  const clean = sanitizeHeader(value)
  if (hasNonAscii(clean)) return encodeHeaderWord(clean)
  return `"${clean.replace(/[\\"]/g, m => `\\${m}`)}"`
}

/**
 * Wrap base64 at 76 characters and encode a body part.
 *
 * SMTP forbids a line longer than 1000 octets (RFC 5321 §4.5.3.1), and a single escaped
 * 250-word paragraph in one `<p>` tag can pass that on its own. Base64 with a declared
 * `Content-Transfer-Encoding` sidesteps the limit and, separately, is the honest way to
 * carry the non-ASCII that turns up constantly in generated copy — curly quotes, en
 * dashes, the occasional emoji. A part with no CTE header implies 7bit, so those
 * characters are being sent today as undeclared 8-bit.
 */
function base64Part(text: string): string {
  const b64 = Buffer.from(text, 'utf8').toString('base64')
  const lines: string[] = []
  for (let i = 0; i < b64.length; i += 76) lines.push(b64.slice(i, i + 76))
  return lines.join('\r\n')
}

/**
 * Build an RFC 2822 message.
 *
 * Kept separate from `buildRawEmail` because the two transports want different things
 * from it: the Gmail API takes a base64url blob, SMTP writes the message bytes straight
 * down the socket. The header hygiene above has to apply to both, so it lives here rather
 * than in either caller.
 *
 * `transferEncoding` defaults to `'raw'`, which is byte-for-byte what the Gmail path has
 * always sent. SMTP passes `'base64'` because it has to — see `base64Part`.
 */
export function buildMimeMessage({
  from, fromName, to, subject, html, transferEncoding = 'raw',
}: {
  from: string
  fromName: string
  to: string
  subject: string
  html: string
  transferEncoding?: 'raw' | 'base64'
}): string {
  // Random rather than time-based: a boundary only has to be unique within one message,
  // but it must not appear in the body, and `Date.now()` is guessable enough that a
  // crafted pitch body could collide with it and split the message.
  const boundary = `freelanceos_${randomBytes(12).toString('hex')}`
  const plain = html.replace(/<[^>]+>/g, '')   // Plain text fallback
  const b64 = transferEncoding === 'base64'

  return [
    `From: ${displayName(fromName)} <${sanitizeAddress(from)}>`,
    `To: ${sanitizeAddress(to)}`,
    `Subject: ${headerText(subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ...(b64 ? [`Content-Transfer-Encoding: base64`] : []),
    ``,
    b64 ? base64Part(plain) : plain,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ...(b64 ? [`Content-Transfer-Encoding: base64`] : []),
    ``,
    b64 ? base64Part(html) : html,
    ``,
    `--${boundary}--`,
  ].join('\r\n')
}

/** Build RFC 2822 email and base64url-encode it for Gmail API */
export function buildRawEmail(input: {
  from: string
  fromName: string
  to: string
  subject: string
  html: string
}): string {
  // base64url encode (Gmail API requirement)
  return Buffer.from(buildMimeMessage(input))
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

/** Escape text destined for an HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Convert plain pitch text into a nicely formatted HTML email */
export function pitchToHtml(pitchBody: string, senderName: string): string {
  // The pitch body is plain text written by a model and the sender name comes from a
  // user profile, and both used to be interpolated raw. An angle bracket in either one
  // broke the markup, and anything deliberately shaped like a tag became live HTML in
  // the recipient's inbox. Escape first, then apply the intended `<br>`.
  const paragraphs = pitchBody
    .split(/\n{2,}/)
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 16px;line-height:1.7;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')

  const sender = escapeHtml(senderName)

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
                Sent by ${sender} via FreelanceOS
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
