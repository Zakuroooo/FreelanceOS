import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'
import Deal from '@/lib/models/Deal'
import { pitchToHtml, isValidEmail } from '@/lib/gmail'
import { resolveMailer } from '@/lib/mailer'
import { ensureSessionScope } from '@/lib/scope'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { pitchId: string; toEmail: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { pitchId, toEmail } = body
  if (!pitchId || !toEmail) {
    return NextResponse.json({ error: 'pitchId and toEmail required' }, { status: 400 })
  }

  // `pitchId` reaches three Mongoose calls below. A string that is not a valid ObjectId
  // throws a CastError inside the driver, which surfaced as an unhandled 500 rather than
  // the 400 it is.
  if (!mongoose.isValidObjectId(pitchId)) {
    return NextResponse.json({ error: 'Invalid pitchId' }, { status: 400 })
  }

  // Validated rather than merely sanitized: the address is interpolated into an RFC 2822
  // `To:` header, so a malformed value is either a wasted Gmail API call or an attempt at
  // header injection. `buildRawEmail` strips the dangerous characters as a second line of
  // defence; this rejects the request outright.
  if (!isValidEmail(toEmail)) {
    return NextResponse.json({ error: 'Invalid recipient email address' }, { status: 400 })
  }

  await connectDB()

  // Load pitch
  const pitch = await Pitch.findOne({ _id: pitchId, userId: session.user.id })
  if (!pitch) return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })

  // Pick a transport: the user's Gmail if it is connected and still refreshing, otherwise
  // their own SMTP server. Either one can carry the send, so a failure here means neither
  // is usable — which is a 403 the UI turns into a prompt to connect one.
  const resolved = await resolveMailer(session.user.id)
  if (!resolved.ok) {
    return NextResponse.json({
      error:      resolved.error,
      action:     resolved.action,
      connectUrl: '/api/gmail/connect',
      settingsUrl: '/settings',
    }, { status: 403 })
  }
  const { mailer } = resolved

  // Build HTML email
  const html = pitchToHtml(pitch.emailBody ?? pitch.fullProposal ?? '', session.user.name ?? 'FreelanceOS User')

  const result = await mailer.send({
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

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)

  // Mark email as sent in pitch
  await Pitch.findByIdAndUpdate(pitchId, {
    $set: {
      'sentChannels.email': { sentAt: new Date(), status: 'sent' },
      overallStatus: 'sent',
    }
  })

  // Auto-create deal if not already exists for this pitch (org-attributed)
  const existingDeal = await Deal.findOne({ pitchId: pitchId, orgId: scope.orgId })
  if (!existingDeal) {
    await Deal.create({
      userId:           session.user.id,
      orgId:            scope.orgId,
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
    from:      mailer.fromAddress,
    via:       mailer.channel,
    to:        toEmail,
  })
}
