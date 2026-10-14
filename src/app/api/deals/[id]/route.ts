import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Deal from '@/lib/models/Deal'
import Notification from '@/lib/models/Notification'
import { ensureSessionScope } from '@/lib/scope'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/deals/[id] — move stage, add note, update value, mark won/lost
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)

  const update: Record<string, unknown> = {}
  const push: Record<string, unknown> = {}

  // Stage transition — set timestamps automatically
  if (body.stage) {
    update.stage = body.stage
    const now = new Date()
    if (body.stage === 'responded') update.respondedAt = now
    if (body.stage === 'meeting')   update.meetingAt = now
    if (body.stage === 'won')       update.wonAt = now
    if (body.stage === 'lost')      update.lostAt = now
  }

  // Add a note
  if (body.note) {
    push.notes = { text: body.note, createdAt: new Date() }
  }

  // Other field updates
  const allowed = ['estimatedValue', 'wonValue', 'channel', 'nextAction', 'nextActionDate', 'lostReason']
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key]
  }

  const mongoUpdate: Record<string, unknown> = { $set: update }
  if (Object.keys(push).length) mongoUpdate.$push = push

  const deal = await Deal.findOneAndUpdate(
    { _id: id, orgId: scope.orgId },
    mongoUpdate,
    { new: true }
  )
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Won/lost are the two transitions worth surfacing in the feed. A failed write
  // here must never fail the PATCH the user is waiting on.
  try {
    if (deal.stage === 'won' || deal.stage === 'lost') {
      await Notification.create({
        userId: session.user.id,
        orgId: scope.orgId,
        type: deal.stage === 'won' ? 'deal_won' : 'deal_lost',
        dealId: deal._id,
        clientId: deal.clientId,
        message: deal.stage === 'won'
          ? `Deal won — ${deal.businessName} (${deal.wonValue ?? deal.estimatedValue} ${deal.currency}).`
          : `${deal.businessName} marked lost.`,
      })
    }
  } catch { /* non-critical */ }

  return NextResponse.json({ deal })
}

// DELETE /api/deals/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const scope = await ensureSessionScope(session.user.id)
  await Deal.findOneAndDelete({ _id: id, orgId: scope.orgId })
  return NextResponse.json({ success: true })
}
