import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'
import { instagramProfileUrl } from '@/lib/socials'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { pitchId: string; instagramHandle: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { pitchId, instagramHandle } = body
  if (!pitchId) return NextResponse.json({ error: 'pitchId required' }, { status: 400 })

  await connectDB()
  const { ensureSessionScope } = await import('@/lib/scope')
  const scope = await ensureSessionScope(session.user.id)
  const pitch = await Pitch.findOne({ _id: pitchId, orgId: scope.orgId })
  if (!pitch) return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })

  const message = pitch.instagramDm
    || `Hey! 👋 I came across your page and love what you're building. I'd love to chat about how I can help grow your digital presence.\n\n${(pitch.emailBody ?? '').slice(0, 400)}`

  // Discovery stores full URLs; older rows may hold @handles. Normalize both —
  // concatenating a URL onto instagram.com produced "page isn't available".
  const raw = instagramHandle || pitch.businessInstagram || ''
  const profileUrl = instagramProfileUrl(raw)

  // Mark instagram as copied
  await Pitch.findByIdAndUpdate(pitchId, {
    $set: { 'sentChannels.instagram': { sentAt: new Date(), status: 'copied' } }
  })

  return NextResponse.json({
    message,
    profileUrl,
    handle: raw ? raw.replace(/^@/, '') : null,
    instruction: 'Message copied to clipboard. Instagram DM opened in new tab.',
  })
}
