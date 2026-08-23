import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'
import Deal from '@/lib/models/Deal'
import { getGmailTokens, getFreshAccessToken, sendViaGmail, pitchToHtml } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { pitchId: string; toEmail: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { pitchId, toEmail } = body
  if (!pitchId || !toEmail) {
    return NextResponse.json({ error: 'pitchId and toEmail required' }, { status: 400 })
  }

  await connectDB()

  // Load pitch
  const pitch = await Pitch.findOne({ _id: pitchId, userId: session.user.id })
  if (!pitch) return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })

  // Load Gmail tokens
  const tokens = await getGmailTokens(session.user.id)
  if (!tokens) {
    return NextResponse.json({
      error: 'Gmail not connected',
      action: 'connect_gmail',
      connectUrl: '/api/gmail/connect',
    }, { status: 403 })
  }

  // Refresh token if needed
  const accessToken = await getFreshAccessToken(session.user.id, tokens)

  // Build HTML email
  const html = pitchToHtml(pitch.emailBody ?? pitch.fullProposal ?? '', session.user.name ?? 'FreelanceOS User')

  // Send via Gmail API
  const result = await sendViaGmail({
    accessToken,
    from:     tokens.gmailAddress,
    fromName: session.user.name ?? 'FreelanceOS',
    to:       toEmail,
    subject:  pitch.emailSubject ?? `Opportunity for ${pitch.businessName}`,
    html,
  })

  if (!result.success) {
    // Mark as failed in pitch
    await Pitch.findByIdAndUpdate(pitchId, {
      $set: {
        'sentChannels.email': { sentAt: new Date(), status: 'failed', error: result.error },
        overallStatus: 'draft',
      }
    })
    return NextResponse.json({ error: 'Email send failed', detail: result.error }, { status: 500 })
  }

  // Mark email as sent in pitch
  await Pitch.findByIdAndUpdate(pitchId, {
    $set: {
      'sentChannels.email': { sentAt: new Date(), status: 'sent' },
      overallStatus: 'sent',
    }
  })

  // Auto-create deal if not already exists for this pitch
  const existingDeal = await Deal.findOne({ pitchId: pitchId, userId: session.user.id })
  if (!existingDeal) {
    await Deal.create({
      userId:           session.user.id,
      pitchId:          pitchId,
      clientId:         pitch.clientId,
      businessName:     pitch.businessName,
      businessLocation: pitch.businessLocation,
      stage:            'pitched',
      channel:          'email',
      estimatedValue:   0,
      currency:         'INR',
      pitchedAt:        new Date(),
      notes:            [],
    })
  }

  return NextResponse.json({
    success:   true,
    messageId: result.messageId,
    from:      tokens.gmailAddress,
    to:        toEmail,
  })
}
