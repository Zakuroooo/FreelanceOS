import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { resolveMailer } from '@/lib/mailer'

/**
 * The single source of truth for "can this user send email, and how?"
 *
 * The old gmail-only status endpoint reported `connected: false` for SMTP-only
 * users, which both triggered a wrong "connect Gmail" banner and DISABLED the
 * Send Email button in SendModal — even though resolveMailer would have happily
 * sent through their configured SMTP server.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resolved = await resolveMailer(session.user.id)
  if (!resolved.ok) {
    return NextResponse.json({
      connected: false,
      channel: null,
      fromAddress: null,
      hint: 'Connect Gmail or add SMTP in Settings to start sending.',
    })
  }

  return NextResponse.json({
    connected: true,
    channel: resolved.mailer.channel,
    fromAddress: resolved.mailer.fromAddress,
  })
}
