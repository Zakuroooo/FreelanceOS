import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

const ROLES = [
  'web-dev', 'video-creator', 'designer', 'copywriter',
  'social-media', 'ai-integrator', 'other',
] as const

/** Deliberately permissive — real validation is the confirmation email, not a regex. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name     = typeof body.name === 'string' ? body.name.trim() : ''
  const rawEmail = typeof body.email === 'string' ? body.email : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const role     = typeof body.role === 'string' ? body.role : ''

  if (!name || !rawEmail || !password || !role) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  // Stored lowercase so that Ravi@Gmail.com and ravi@gmail.com are one account.
  // Sign-in normalises the same way; without this the two diverge and login fails
  // for whichever casing was not used at signup.
  const email = rawEmail.toLowerCase().trim()

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return NextResponse.json({ error: 'Select a valid role' }, { status: 400 })
  }

  try {
    await dbConnect()

    if (await User.exists({ email })) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, role })

    // n8n welcome email — fire and forget, never awaited (CLAUDE.md rule 20).
    if (process.env.N8N_SIGNUP_WEBHOOK_URL) {
      fetch(process.env.N8N_SIGNUP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, userId: user._id.toString() }, { status: 201 })
  } catch (err) {
    // Two requests can pass the `exists` check at once; the unique index is what
    // actually decides. Report that as a conflict, not a 500.
    if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: 'Invalid signup details' }, { status: 400 })
    }
    console.error('[auth/register] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
