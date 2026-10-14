/**
 * Minimal SMTP submission client.
 *
 * This exists because Gmail sending cannot be the only way to send. `gmail.send` is a
 * *restricted* OAuth scope — Google's strictest tier — so while the app's publishing
 * status is "Testing" only accounts on a hand-maintained test-user list (100 max) can
 * connect one, and moving to Production needs OAuth verification plus an annual paid
 * third-party security assessment. Sign-in is unaffected because it only asks for the
 * non-sensitive `openid email profile` scopes through the same client, which is why
 * logging in works for anyone while connecting Gmail returns `403 access_denied`.
 *
 * Bring-your-own SMTP has none of that gatekeeping: the user pastes the host, port and an
 * app password from whatever mailbox they already own, and it works immediately.
 *
 * Written against `node:net` / `node:tls` rather than nodemailer on purpose — it is one
 * command exchange over a socket, and it keeps the dependency list where it is. Only what
 * submission actually needs is implemented: EHLO, STARTTLS, AUTH PLAIN/LOGIN, one
 * recipient, one message. No pooling, no queueing, no DSN, no attachments.
 */

import net from 'node:net'
import tls from 'node:tls'
import { buildMimeMessage, isValidEmail } from './gmail'
import { decrypt } from './encryption'
import User from './models/User'

export interface SmtpConfig {
  host: string
  /** 465 for implicit TLS, 587 for STARTTLS. 25 works but is blocked by most networks. */
  port: number
  /** True = wrap the socket in TLS immediately (465). False = connect plain, then STARTTLS. */
  secure: boolean
  user: string
  pass: string
}

/** A stored SMTP connection plus the address it sends as. */
export interface StoredSmtp {
  config: SmtpConfig
  fromAddress: string
}

/**
 * Load and decrypt a user's saved SMTP credentials. Returns null when none are stored.
 *
 * Mirrors `getGmailTokens`, including how it handles a ciphertext it cannot read: a
 * rotated `TOKEN_ENCRYPTION_KEY` used to throw out of the equivalent Gmail path and
 * surface as an unhandled 500, so a failure here is logged and reported as "not
 * connected" — the remedy the user needs is the same either way, which is to re-enter
 * the password.
 */
export async function getUserSmtpConfig(userId: string): Promise<StoredSmtp | null> {
  const user = await User.findById(userId).select('smtp').lean()
  const smtp = user?.smtp
  if (!smtp?.host || !smtp.user || !smtp.pass) return null

  try {
    return {
      config: {
        host:   smtp.host,
        port:   smtp.port,
        secure: smtp.secure,
        user:   smtp.user,
        pass:   decrypt(smtp.pass),
      },
      fromAddress: smtp.fromAddress || smtp.user,
    }
  } catch (err) {
    console.error('[smtp] Could not decrypt stored password for user', userId, err)
    return null
  }
}

export interface SmtpResult {
  success: boolean
  messageId?: string
  error?: string
}

const CONNECT_TIMEOUT_MS = 15_000
const REPLY_TIMEOUT_MS = 30_000

interface Reply {
  code: number
  /** All lines of the reply, joined with newlines, with the numeric prefixes stripped. */
  text: string
}

/**
 * An error whose message is safe to show a user. Everything else that escapes this module
 * gets a generic message, because a raw socket or TLS error can carry internal detail and
 * an SMTP transcript can carry a base64 credential.
 */
class SmtpError extends Error {}

/**
 * Reads SMTP replies off a socket, and survives being re-pointed at a new one when the
 * connection is upgraded by STARTTLS.
 */
class SmtpConnection {
  private sock: net.Socket | null = null
  private buf = ''
  private waiters: Array<{ resolve: (r: Reply) => void; reject: (e: Error) => void }> = []
  private failure: Error | null = null

  constructor(sock: net.Socket) {
    this.bind(sock)
  }

  /**
   * Point the parser at `sock`. Note the deliberate absence of `setEncoding('utf8')`:
   * after STARTTLS this same socket carries TLS records, and a string encoding on it
   * would corrupt them. Decoding happens per chunk instead.
   */
  bind(sock: net.Socket) {
    if (this.sock) {
      this.sock.removeAllListeners('data')
      this.sock.removeAllListeners('error')
      this.sock.removeAllListeners('close')
    }
    this.sock = sock
    sock.on('data', (chunk: Buffer) => {
      this.buf += chunk.toString('utf8')
      this.drain()
    })
    sock.on('error', (err: unknown) => {
      this.fail(err instanceof Error ? err : new Error(String(err)))
    })
    sock.on('close', () => {
      // Only a failure if something is still waiting to hear back. A clean shutdown after
      // QUIT arrives here too.
      if (this.waiters.length) this.fail(new SmtpError('The mail server closed the connection'))
    })
  }

  private fail(err: Error) {
    this.failure = err
    const waiting = this.waiters
    this.waiters = []
    for (const w of waiting) w.reject(err)
  }

  /**
   * Index just past the end of the first complete reply in the buffer, or -1.
   *
   * A reply is one or more lines; continuation lines are `250-text` and the last one is
   * `250 text`. Treating every line as terminal would leave the EHLO extension list
   * queued up and desynchronise every command after it.
   */
  private replyEnd(): number {
    let offset = 0
    for (;;) {
      const nl = this.buf.indexOf('\n', offset)
      if (nl === -1) return -1
      const line = this.buf.slice(offset, nl).replace(/\r$/, '')
      if (line.length === 3 || (line.length > 3 && line[3] === ' ')) return nl + 1
      offset = nl + 1
    }
  }

  private drain() {
    while (this.waiters.length) {
      const end = this.replyEnd()
      if (end < 0) return
      const raw = this.buf.slice(0, end)
      this.buf = this.buf.slice(end)
      this.waiters.shift()!.resolve(parseReply(raw))
    }
  }

  readReply(): Promise<Reply> {
    if (this.failure) return Promise.reject(this.failure)

    return new Promise<Reply>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.fail(new SmtpError('The mail server stopped responding'))
      }, REPLY_TIMEOUT_MS)

      this.waiters.push({
        resolve: (r) => { clearTimeout(timer); resolve(r) },
        reject:  (e) => { clearTimeout(timer); reject(e) },
      })
      // A reply may already be sitting in the buffer — the server greeting usually is.
      this.drain()
    })
  }

  write(data: string | Buffer) {
    if (!this.sock) throw new SmtpError('The connection is not open')
    this.sock.write(data)
  }

  /** Send one command line and read its reply. */
  async command(line: string): Promise<Reply> {
    this.write(`${line}\r\n`)
    return this.readReply()
  }

  get socket(): net.Socket {
    if (!this.sock) throw new SmtpError('The connection is not open')
    return this.sock
  }

  close() {
    if (!this.sock) return
    this.sock.removeAllListeners()
    this.sock.destroy()
    this.sock = null
  }
}

function parseReply(raw: string): Reply {
  const lines = raw.split('\n').map(l => l.replace(/\r$/, '')).filter(Boolean)
  const code = Number.parseInt(lines[0]?.slice(0, 3) ?? '', 10)
  const text = lines.map(l => l.slice(4)).join('\n').trim()
  return { code: Number.isFinite(code) ? code : 0, text }
}

/** Throw unless the reply code is in the 2xx/3xx range the caller expects. */
function demand(reply: Reply, expected: number, step: string): Reply {
  if (Math.floor(reply.code / 100) === Math.floor(expected / 100)) return reply
  throw new SmtpError(`${step} failed (${reply.code}): ${reply.text || 'no detail given'}`)
}

function tcpConnect(host: string, port: number, secure: boolean): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const sock = secure
      ? tls.connect({ host, port, servername: host })
      : net.connect({ host, port })

    const timer = setTimeout(() => {
      sock.destroy()
      reject(new SmtpError(`Could not reach ${host}:${port} — connection timed out`))
    }, CONNECT_TIMEOUT_MS)

    const ready = secure ? 'secureConnect' : 'connect'
    sock.once(ready, () => {
      clearTimeout(timer)
      resolve(sock)
    })
    sock.once('error', (err: NodeJS.ErrnoException) => {
      clearTimeout(timer)
      // The raw messages here are cryptic ("ENOTFOUND", "ECONNREFUSED") but the mapping to
      // a cause is exact, so it is worth translating rather than passing through.
      const reason =
        err.code === 'ENOTFOUND' ? `no such host as "${host}"`
        : err.code === 'ECONNREFUSED' ? `nothing is listening on port ${port}`
        : err.code === 'ETIMEDOUT' ? 'the connection timed out'
        : err.message
      reject(new SmtpError(`Could not reach ${host}:${port} — ${reason}`))
    })
  })
}

/** Upgrade a plaintext connection in place after a 220 response to STARTTLS. */
function startTls(conn: SmtpConnection, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const plain = conn.socket
    // Detach the reply parser first: from here the raw socket carries TLS records, and
    // anything the parser appended from them would be garbage in the buffer.
    plain.removeAllListeners('data')
    plain.removeAllListeners('error')
    plain.removeAllListeners('close')

    const secured = tls.connect({ socket: plain, servername: host })
    const timer = setTimeout(() => {
      secured.destroy()
      reject(new SmtpError('The TLS handshake timed out'))
    }, CONNECT_TIMEOUT_MS)

    secured.once('secureConnect', () => {
      clearTimeout(timer)
      conn.bind(secured)
      resolve()
    })
    secured.once('error', (err: Error) => {
      clearTimeout(timer)
      reject(new SmtpError(`TLS negotiation failed: ${err.message}`))
    })
  })
}

/** Extension keywords advertised by EHLO, upper-cased. `AUTH` keeps its mechanism list. */
function parseExtensions(ehlo: Reply): Set<string> {
  const out = new Set<string>()
  for (const line of ehlo.text.split('\n')) {
    for (const token of line.trim().toUpperCase().split(/\s+/)) {
      if (token) out.add(token)
    }
  }
  return out
}

/**
 * Connect, secure the channel, and authenticate. The returned connection is sitting at
 * the point where a MAIL FROM would be accepted.
 */
async function open(config: SmtpConfig): Promise<SmtpConnection> {
  const sock = await tcpConnect(config.host, config.port, config.secure)
  const conn = new SmtpConnection(sock)

  try {
    demand(await conn.readReply(), 220, 'Server greeting')

    // The EHLO argument should identify the client. `localhost` is what a submission
    // server expects from a non-mail-server client and avoids leaking an internal
    // hostname into the recipient's Received chain.
    let ehlo = demand(await conn.command('EHLO localhost'), 250, 'EHLO')
    let ext = parseExtensions(ehlo)

    if (!config.secure) {
      // Refusing rather than falling back: continuing would put the user's mailbox
      // password on the wire in cleartext. If a host genuinely has no STARTTLS, the right
      // answer is its implicit-TLS port, not a downgrade.
      if (!ext.has('STARTTLS')) {
        throw new SmtpError(
          `${config.host}:${config.port} does not offer STARTTLS, so your password cannot be sent securely. ` +
          `Try port 465 with implicit TLS instead.`
        )
      }
      demand(await conn.command('STARTTLS'), 220, 'STARTTLS')
      await startTls(conn, config.host)
      // RFC 3207 §4.2: the server discards what it learned before TLS, so EHLO again.
      ehlo = demand(await conn.command('EHLO localhost'), 250, 'EHLO after STARTTLS')
      ext = parseExtensions(ehlo)
    }

    await authenticate(conn, ext, config)
    return conn
  } catch (err) {
    conn.close()
    throw err
  }
}

async function authenticate(conn: SmtpConnection, ext: Set<string>, config: SmtpConfig) {
  const mechanisms = ext
  const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64')

  let reply: Reply
  if (mechanisms.has('PLAIN')) {
    // The authzid is intentionally empty — submission uses the authenticated identity.
    reply = await conn.command(`AUTH PLAIN ${b64(`\0${config.user}\0${config.pass}`)}`)
  } else if (mechanisms.has('LOGIN')) {
    demand(await conn.command('AUTH LOGIN'), 334, 'AUTH LOGIN')
    demand(await conn.command(b64(config.user)), 334, 'AUTH LOGIN username')
    reply = await conn.command(b64(config.pass))
  } else {
    throw new SmtpError(
      'The mail server does not offer a password login method this app supports (PLAIN or LOGIN).'
    )
  }

  if (Math.floor(reply.code / 100) !== 2) {
    // 535 is "credentials rejected" and is by far the most common failure here, almost
    // always because the provider wants an app-specific password rather than the account
    // password. Say so instead of echoing the server's terse text.
    if (reply.code === 535 || reply.code === 534) {
      throw new SmtpError(
        'The mail server rejected those credentials. Most providers require an app-specific ' +
        'password here rather than your normal account password.'
      )
    }
    throw new SmtpError(`Login failed (${reply.code}): ${reply.text || 'no detail given'}`)
  }
}

/**
 * SMTP reads a line containing only "." as end-of-message, so any body line that starts
 * with a dot has to be doubled (RFC 5321 §4.5.2). Skipping this truncates a message at
 * the first such line — and a generated pitch can easily contain one.
 */
function dotStuff(message: string): string {
  const stuffed = message.replace(/\r\n\./g, '\r\n..')
  return stuffed.startsWith('.') ? `.${stuffed}` : stuffed
}

/** Take the connection through MAIL FROM / RCPT TO / DATA and hand back the server's id. */
async function transmit(
  conn: SmtpConnection,
  envelopeFrom: string,
  to: string,
  message: string,
): Promise<string | undefined> {
  demand(await conn.command(`MAIL FROM:<${envelopeFrom}>`), 250, 'MAIL FROM')

  const rcpt = await conn.command(`RCPT TO:<${to}>`)
  if (Math.floor(rcpt.code / 100) !== 2) {
    // Separated from the generic path because this one is about the *recipient*, and the
    // address came off a scraped listing — a rejection here is routine, not a misconfig.
    throw new SmtpError(`The server rejected the recipient ${to} (${rcpt.code}): ${rcpt.text}`)
  }

  demand(await conn.command('DATA'), 354, 'DATA')

  // The terminator is a line containing a single dot, and it must be preceded by CRLF —
  // `buildMimeMessage` ends on `--boundary--` with no trailing break, so one is added.
  const body = dotStuff(message)
  conn.write(`${body.endsWith('\r\n') ? body : `${body}\r\n`}.\r\n`)
  const accepted = demand(await conn.readReply(), 250, 'Message body')

  // Most servers answer "250 OK id=1abc…" or "250 2.0.0 OK <id@host>". Worth surfacing
  // when present for tracing a delivery, but it is not mandated, so it stays optional.
  const match = accepted.text.match(/(?:id[= ]|<)([^\s<>]+@?[^\s<>]*)>?\s*$/i)
  return match?.[1]
}

/**
 * Open a connection, authenticate, and close again without sending anything.
 *
 * Used when saving SMTP settings, so a typo in the host or a wrong password is reported
 * while the user is looking at the form rather than silently much later, in the middle of
 * a batch run, as a per-lead failure.
 */
export async function verifySmtp(config: SmtpConfig): Promise<{ ok: true } | { ok: false; error: string }> {
  let conn: SmtpConnection | null = null
  try {
    conn = await open(config)
    await conn.command('QUIT').catch(() => {})
    return { ok: true }
  } catch (err) {
    return { ok: false, error: userMessage(err, '[smtp] verify failed') }
  } finally {
    conn?.close()
  }
}

/** Send one message through the user's own SMTP server. Mirrors `sendViaGmail`. */
export async function sendViaSmtp({
  config, from, fromName, to, subject, html,
}: {
  config: SmtpConfig
  from: string
  fromName: string
  to: string
  subject: string
  html: string
}): Promise<SmtpResult> {
  // Checked before opening a socket: the address ends up in both a `RCPT TO:<…>` envelope
  // command and a `To:` header, and a value containing CRLF or a second address is either
  // a wasted connection or an injection attempt.
  if (!isValidEmail(to)) return { success: false, error: `Invalid recipient address: ${to}` }
  if (!isValidEmail(from)) return { success: false, error: `Invalid sender address: ${from}` }

  const message = buildMimeMessage({
    from, fromName, to, subject, html,
    // Not optional here — SMTP rejects lines over 1000 octets and a single escaped
    // paragraph of a generated pitch can exceed that on its own.
    transferEncoding: 'base64',
  })

  let conn: SmtpConnection | null = null
  try {
    conn = await open(config)
    const messageId = await transmit(conn, from, to, message)
    await conn.command('QUIT').catch(() => {})
    return { success: true, messageId }
  } catch (err) {
    return { success: false, error: userMessage(err, '[smtp] send failed') }
  } finally {
    conn?.close()
  }
}

/**
 * Only `SmtpError` messages are written for a user to read. Anything else could be a
 * socket or TLS internal — or, worse, carry part of an AUTH exchange — so it is logged
 * and replaced.
 */
function userMessage(err: unknown, logPrefix: string): string {
  if (err instanceof SmtpError) return err.message
  console.error(logPrefix, err)
  return 'The mail server could not be reached. Check the host and port and try again.'
}
