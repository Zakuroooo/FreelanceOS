import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(session.user.id).select('gmailOAuth').lean()

  const gmail = user?.gmailOAuth
  if (!gmail?.accessToken) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected:    true,
    gmailAddress: gmail.gmailAddress,
    connectedAt:  gmail.connectedAt,
    // Check if token is about to expire (within 5 minutes)
    needsRefresh: gmail.tokenExpiry < Date.now() + 300_000,
  })
}
