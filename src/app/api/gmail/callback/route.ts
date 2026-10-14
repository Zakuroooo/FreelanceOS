import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import { encrypt } from '@/lib/encryption'
import { GMAIL_STATE_COOKIE } from '@/lib/gmail'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function fail(appUrl: string, reason: string) {
  const res = NextResponse.redirect(`${appUrl}/pitches?gmail=error&reason=${reason}`)
  res.cookies.delete(GMAIL_STATE_COOKIE)
  return res
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { searchParams } = new URL(req.url)
  const code       = searchParams.get('code')
  const state      = searchParams.get('state')
  const oauthError = searchParams.get('error')

  // The mailbox is attached to whoever is signed in right now. `state` used to carry
  // the userId, which let anyone bind their Gmail to another account by editing the URL.
  const session = await auth()
  if (!session?.user?.id) return fail(appUrl, 'unauthenticated')

  const expectedState = req.cookies.get(GMAIL_STATE_COOKIE)?.value
  if (oauthError) return fail(appUrl, 'denied')
  if (!code || !state || !expectedState || !safeEqual(state, expectedState)) {
    return fail(appUrl, 'state')
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  process.env.GMAIL_REDIRECT_URI!,
        grant_type:    'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      console.error('[gmail/callback] Token exchange failed:', await tokenRes.text())
      return fail(appUrl, 'token_exchange')
    }

    const tokens = await tokenRes.json() as {
      access_token: string
      refresh_token?: string
      expires_in: number
      token_type: string
    }

    // 2. Get the user's Gmail address
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!profileRes.ok) {
      console.error('[gmail/callback] Profile fetch failed:', await profileRes.text())
      return fail(appUrl, 'profile')
    }
    const profile = await profileRes.json() as { email: string }

    // 3. Encrypt tokens and save to the signed-in user's document
    const update: Record<string, unknown> = {
      'gmailOAuth.accessToken':  encrypt(tokens.access_token),
      'gmailOAuth.tokenExpiry':  Date.now() + (tokens.expires_in * 1000),
      'gmailOAuth.gmailAddress': profile.email,
      'gmailOAuth.connectedAt':  new Date(),
    }
    // Google only returns a refresh token on first consent — never clobber a stored one.
    if (tokens.refresh_token) {
      update['gmailOAuth.refreshToken'] = encrypt(tokens.refresh_token)
    }

    await connectDB()
    await User.findByIdAndUpdate(session.user.id, update)

    const res = NextResponse.redirect(`${appUrl}/pitches?gmail=connected`)
    res.cookies.delete(GMAIL_STATE_COOKIE)
    return res
  } catch (err) {
    console.error('[gmail/callback] error:', err)
    return fail(appUrl, 'unexpected')
  }
}
