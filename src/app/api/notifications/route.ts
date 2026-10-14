import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Notification from '@/lib/models/Notification'
import { ensureSessionScope } from '@/lib/scope'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

function positiveInt(raw: string | null, fallback: number, max: number): number {
  const n = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(n, max)
}

// GET /api/notifications — feed + unread count for the TopBar badge
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = positiveInt(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT)

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ $or: [{ orgId: scope.orgId }, { userId: session.user.id, orgId: { $exists: false } }] })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId: session.user.id, read: false }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

// PATCH /api/notifications — mark one ({ id }) or all ({ all: true }) as read
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await connectDB()

  if (body.all === true) {
    await Notification.updateMany({ userId: session.user.id, read: false }, { $set: { read: true } })
    return NextResponse.json({ success: true })
  }

  if (typeof body.id !== 'string' || !body.id) {
    return NextResponse.json({ error: 'id or all is required' }, { status: 400 })
  }

  // Scoped by userId — a crafted id must never flip another user's notification
  const updated = await Notification.findOneAndUpdate(
    { _id: body.id, userId: session.user.id },
    { $set: { read: true } },
    { new: true }
  )
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true, notification: updated })
}

// DELETE /api/notifications — clear the whole feed
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  await Notification.deleteMany({ userId: session.user.id })
  return NextResponse.json({ success: true })
}
