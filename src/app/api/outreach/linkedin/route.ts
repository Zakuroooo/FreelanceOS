import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { pitchId: string; linkedinUrl: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { pitchId, linkedinUrl } = body
  if (!pitchId) return NextResponse.json({ error: 'pitchId required' }, { status: 400 })

  await connectDB()
  const pitch = await Pitch.findOne({ _id: pitchId, userId: session.user.id })
  if (!pitch) return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })

  const message = pitch.linkedinDm
    || `Hi! I noticed your business and wanted to reach out.\n\n${(pitch.emailBody ?? '').slice(0, 700)}`

  // Mark linkedin as copied
  await Pitch.findByIdAndUpdate(pitchId, {
    $set: { 'sentChannels.linkedin': { sentAt: new Date(), status: 'copied' } }
  })

  return NextResponse.json({
    message,
    profileUrl: linkedinUrl || pitch.businessLinkedin,
    instruction: 'Message copied to clipboard. Profile opened in new tab.',
  })
}
