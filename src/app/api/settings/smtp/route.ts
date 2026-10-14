/**
 * Bring-your-own SMTP credentials.
 *
 * The reason this route exists: `gmail.send` is one of Google's *restricted* scopes, so
 * while the OAuth app's publishing status is "Testing" only accounts on a hand-maintained
 * test-user list (100 max) can connect a mailbox, and reaching Production needs OAuth
 * verification plus an annual paid third-party security assessment. Sign-in is unaffected
 * because it asks only for the non-sensitive `openid email profile` scopes through the same
 * client — which is why logging in works for anyone while connecting Gmail returns
 * `403 access_denied`.
 *
 * SMTP has none of that gatekeeping. A user pastes the host, the port and an app-specific
 * password for a mailbox they already own, and sending works immediately.
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import { encrypt } from '@/lib/encryption'
import { isValidEmail } from '@/lib/gmail'
import { verifySmtp, type SmtpConfig } from '@/lib/smtp'

/** Ports a submission server can plausibly be on. */
const ALLOWED_PORTS = new Set([25, 465, 587, 2525])

interface ParsedBody {
  config: SmtpConfig
  fromAddress: string
}

/**
 * Validate the request body into a connection config.
 *
 * The host goes into a DNS lookup and a TCP connect performed by the server, so it is
 * constrained to something hostname-shaped: a bare label list, no scheme, no port, no path,
 * no credentials. An unconstrained value here is an SSRF primitive — `http://169.254.169.254`
 * and friends — and while SMTP is a poor protocol for exfiltrating a metadata response, the
 * connect attempt itself is still the server reaching wherever it is told to.
 */
function parseBody(body: unknown): { ok: true; value: ParsedBody } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'Expected a JSON object' }
  const b = body as Record<string, unknown>

  const host = typeof b.host === 'string' ? b.host.trim().toLowerCase() : ''
  if (!/^(?=.{1,253}$)[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(host)) {
    return { ok: false, error: 'Enter the mail server hostname on its own, e.g. smtp.gmail.com' }
  }
  // Blocked before a socket opens rather than relying on the connect failing: on a hosted
  // deployment these resolve to something reachable from inside the network.
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
    return { ok: false, error: 'That hostname is not reachable as a mail server' }
  }

  const port = typeof b.port === 'number' ? b.port : Number.parseInt(String(b.port ?? ''), 10)
  if (!ALLOWED_PORTS.has(port)) {
    return { ok: false, error: 'Port must be 587 (STARTTLS), 465 (SSL), 2525 or 25' }
  }

  // Implicit TLS is the norm on 465 and is not offered on 587, so the port decides unless
  // the caller is explicit. Getting this wrong is the most common cause of a hung connect.
  const secure = typeof b.secure === 'boolean' ? b.secure : port === 465

  const user = typeof b.user === 'string' ? b.user.trim() : ''
  if (!user) return { ok: false, error: 'Username is required' }

  const pass = typeof b.pass === 'string' ? b.pass : ''
  if (!pass) return { ok: false, error: 'Password is required' }

  // Defaults to the username because for almost every provider they are the same address,
  // and a mismatch is usually a typo rather than an intentional alias.
  const fromAddress = (typeof b.fromAddress === 'string' && b.fromAddress.trim()) || user
  if (!isValidEmail(fromAddress)) {
    return { ok: false, error: `"${fromAddress}" is not a valid email address` }
  }

  return { ok: true, value: { config: { host, port, secure, user, pass }, fromAddress } }
}

/** Is SMTP configured, and as what. Never returns the password, encrypted or otherwise. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(session.user.id).select('smtp').lean()
  const smtp = user?.smtp

  // Presence is tested on `host`, not on the object: Mongoose materialises a nested path
  // as `{}` whether or not anything was ever written to it.
  if (!smtp?.host) return NextResponse.json({ connected: false })

  return NextResponse.json({
    connected:   true,
    host:        smtp.host,
    port:        smtp.port,
    secure:      smtp.secure,
    user:        smtp.user,
    fromAddress: smtp.fromAddress,
    connectedAt: smtp.connectedAt,
  })
}

/**
 * Validate credentials against the real server, then save them.
 *
 * The connection is tested before anything is written. A wrong password stored silently
 * would not surface until the middle of a batch run, as a string of per-lead failures with
 * no obvious common cause — far better to fail here, while the user is still looking at the
 * form that caused it.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseBody(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { config, fromAddress } = parsed.value

  const check = await verifySmtp(config)
  if (!check.ok) {
    // 400, not 502: the remedy is for the user to correct what they typed. The message is
    // already user-facing — `lib/smtp.ts` only surfaces its own `SmtpError` text and
    // replaces anything that might carry socket internals or part of an AUTH exchange.
    return NextResponse.json({ error: check.error, verified: false }, { status: 400 })
  }

  await connectDB()
  await User.findByIdAndUpdate(session.user.id, {
    smtp: {
      host:   config.host,
      port:   config.port,
      secure: config.secure,
      user:   config.user,
      // Encrypted at rest for the same reason the Gmail refresh tokens are: this is a live
      // mailbox credential, and a database dump should not hand over the ability to send
      // as every connected user.
      pass:        encrypt(config.pass),
      fromAddress,
      connectedAt: new Date(),
    },
  })

  return NextResponse.json({
    connected: true, verified: true,
    host: config.host, port: config.port, secure: config.secure,
    user: config.user, fromAddress,
  })
}

/** Forget the stored credentials. */
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  // `$unset` rather than writing nulls, so `smtp.host` is genuinely absent and every
  // `if (!smtp?.host)` check reads as not-connected.
  await User.findByIdAndUpdate(session.user.id, { $unset: { smtp: 1 } })

  return NextResponse.json({ connected: false })
}
