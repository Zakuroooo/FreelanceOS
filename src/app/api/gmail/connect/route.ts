import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { GMAIL_STATE_COOKIE } from '@/lib/gmail'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ')

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Single-use nonce. It is NOT the userId — the callback resolves the owner from
  // the session and only uses `state` to prove the round trip started here.
  const state = randomBytes(32).toString('hex')

  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID!,
    redirect_uri:  process.env.GMAIL_REDIRECT_URI!,
    response_type: 'code',
    scope:         SCOPES,
    access_type:   'offline',
    prompt:        'consent',           // Always show consent — needed for refresh token
    state,
  })

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )

  // sameSite:'lax' so the cookie still rides along on Google's top-level redirect back.
  res.cookies.set(GMAIL_STATE_COOKIE, state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   600,
  })

  return res
}
