import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  await User.findByIdAndUpdate(session.user.id, {
    $unset: { gmailOAuth: '' }
  })

  return NextResponse.json({ success: true, message: 'Gmail disconnected' })
}
