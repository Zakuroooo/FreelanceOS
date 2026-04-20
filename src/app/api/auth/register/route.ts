import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      )
    }
    await dbConnect()
    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, role })
    
    // Trigger n8n welcome email — fire and forget
    if (process.env.N8N_SIGNUP_WEBHOOK_URL) {
      fetch(process.env.N8N_SIGNUP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      }).catch(() => {})
    }

    return NextResponse.json(
      { success: true, userId: user._id.toString() },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
