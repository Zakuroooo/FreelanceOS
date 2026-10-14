import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Pitch, { type IPitch } from '@/lib/models/Pitch'
import { ensureSessionScope } from '@/lib/scope'
import { pick, PITCH_PATCHABLE_FIELDS } from '@/lib/sanitize'

type Params = { params: Promise<{ id: string }> }

// GET /api/pitches/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const scope = await ensureSessionScope(session.user.id)
  const pitch = await Pitch.findOne({ _id: id, orgId: scope.orgId }).lean()
  if (!pitch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ pitch })
}

// PATCH /api/pitches/[id] — update status, mark channel sent, etc.
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)

  // Only whitelisted paths reach the update document — `userId` and `sentChannels`
  // stay server-owned, and a `$`-prefixed key can never become a Mongo operator.
  const update = pick<IPitch>(body, PITCH_PATCHABLE_FIELDS)
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const pitch = await Pitch.findOneAndUpdate(
    { _id: id, orgId: scope.orgId },
    { $set: update },
    { new: true, runValidators: true }
  )
  if (!pitch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ pitch })
}

// DELETE /api/pitches/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const scope = await ensureSessionScope(session.user.id)

  await Pitch.findOneAndDelete({ _id: id, orgId: scope.orgId })
  return NextResponse.json({ success: true })
}
