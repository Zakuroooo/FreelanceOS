import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import { encrypt } from '@/lib/encryption'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')   // userId passed as state
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/pitches?gmail=error`)
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
      console.error('Token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${appUrl}/pitches?gmail=error`)
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
    const profile = await profileRes.json() as { email: string }

    // 3. Encrypt tokens and save to User document
    const tokenExpiry = Date.now() + (tokens.expires_in * 1000)

    await connectDB()
    await User.findByIdAndUpdate(state, {
      'gmailOAuth.accessToken':  encrypt(tokens.access_token),
      'gmailOAuth.refreshToken': tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
      'gmailOAuth.tokenExpiry':  tokenExpiry,
      'gmailOAuth.gmailAddress': profile.email,
      'gmailOAuth.connectedAt':  new Date(),
    })

    return NextResponse.redirect(`${appUrl}/pitches?gmail=connected`)
  } catch (err) {
    console.error('Gmail callback error:', err)
    return NextResponse.redirect(`${appUrl}/pitches?gmail=error`)
  }
}
