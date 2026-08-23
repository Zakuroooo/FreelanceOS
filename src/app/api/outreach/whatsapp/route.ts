import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { pitchId: string; phone: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { pitchId, phone } = body
  if (!pitchId || !phone) return NextResponse.json({ error: 'pitchId and phone required' }, { status: 400 })

  await connectDB()
  const pitch = await Pitch.findOne({ _id: pitchId, userId: session.user.id })
  if (!pitch) return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })

  // Use the short WhatsApp version if available, otherwise trim the email pitch
  const message = pitch.whatsappMsg
    || (pitch.emailBody ?? pitch.fullProposal ?? '').slice(0, 1000)

  // Clean phone number — remove spaces, dashes, leading +
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '')

  // Build wa.me URL with pre-filled message
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

  // Mark whatsapp as ready in pitch
  await Pitch.findByIdAndUpdate(pitchId, {
    $set: { 'sentChannels.whatsapp': { sentAt: new Date(), status: 'ready' } }
  })

  return NextResponse.json({ waUrl, message, phone: cleanPhone })
}
