import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Deal from '@/lib/models/Deal'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/deals/[id] — move stage, add note, update value, mark won/lost
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await connectDB()

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
    { _id: id, userId: session.user.id },
    mongoUpdate,
    { new: true }
  )
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ deal })
}

// DELETE /api/deals/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  await Deal.findOneAndDelete({ _id: id, userId: session.user.id })
  return NextResponse.json({ success: true })
}
