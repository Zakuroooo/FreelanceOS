/**
 * Picks how a user's outbound email actually leaves the building.
 *
 * There are two transports and neither is universal:
 *
 *  - **Gmail API.** Nicest to set up — one OAuth click, no passwords — but `gmail.send` is a
 *    *restricted* scope. While the Google app's publishing status is "Testing" only accounts
 *    on a hand-maintained test-user list can connect, and reaching Production requires OAuth
 *    verification plus an annual paid third-party security assessment.
 *  - **The user's own SMTP server.** No gatekeeping at all, at the cost of asking for a host,
 *    a port and an app-specific password.
 *
 * Both routes that send mail need the same choice made the same way, so it is made here once
 * rather than twice, slightly differently.
 */

import { getGmailTokens, getFreshAccessToken, sendViaGmail } from './gmail'
import { getUserSmtpConfig, sendViaSmtp } from './smtp'

export interface MailResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface Mailer {
  channel: 'gmail' | 'smtp'
  /** The address mail will arrive from. Shown in the UI before sending. */
  fromAddress: string
  send(args: { to: string; subject: string; html: string; fromName: string }): Promise<MailResult>
}

export type MailerResolution =
  | { ok: true; mailer: Mailer }
  | { ok: false; error: string; action: 'connect_email' }

/**
 * A user-facing explanation of why nothing can be sent, and what to do about it. Both
 * transports are named because either one fixes it, and a user blocked by Google's
 * verification requirements needs to know the other door exists.
 */
const NOT_CONNECTED =
  'No email account is connected. Connect Gmail, or add your own SMTP server in Settings — ' +
  'SMTP works for any mailbox and does not need Google approval.'

/**
 * Resolve the transport to use for `userId`.
 *
 * Gmail wins when it is connected and its token still refreshes. That ordering keeps
 * behaviour identical for anyone already sending through Gmail today. If the refresh fails —
 * revoked access, a rotated secret — SMTP is tried rather than failing outright, because a
 * dead Gmail connection is not a reason to refuse to send for a user who also gave us a
 * working mail server.
 */
export async function resolveMailer(userId: string): Promise<MailerResolution> {
  const tokens = await getGmailTokens(userId)

  if (tokens) {
    try {
      const accessToken = await getFreshAccessToken(userId, tokens)
      const from = tokens.gmailAddress
      return {
        ok: true,
        mailer: {
          channel: 'gmail',
          fromAddress: from,
          send: ({ to, subject, html, fromName }) =>
            sendViaGmail({ accessToken, from, fromName, to, subject, html }),
        },
      }
    } catch (err) {
      // Logged rather than returned: the message from Google's token endpoint is for us, and
      // the user's next step depends on whether SMTP is configured, which is decided below.
      console.error('[mailer] Gmail token refresh failed, falling back to SMTP:', err)
    }
  }

  const smtp = await getUserSmtpConfig(userId)
  if (smtp) {
    return {
      ok: true,
      mailer: {
        channel: 'smtp',
        fromAddress: smtp.fromAddress,
        send: ({ to, subject, html, fromName }) =>
          sendViaSmtp({
            config: smtp.config,
            from: smtp.fromAddress,
            fromName,
            to,
            subject,
            html,
          }),
      },
    }
  }

  if (tokens) {
    // Gmail is connected but its token is dead, and there is no SMTP to fall back to. This
    // is a different problem from having connected nothing, and it has a different fix.
    return {
      ok: false,
      action: 'connect_email',
      error: 'Gmail authorisation expired. Reconnect Gmail, or add an SMTP server in Settings.',
    }
  }

  return { ok: false, action: 'connect_email', error: NOT_CONNECTED }
}
