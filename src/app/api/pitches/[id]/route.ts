import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'

type Params = { params: Promise<{ id: string }> }

// GET /api/pitches/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()

  const pitch = await Pitch.findOne({ _id: id, userId: session.user.id }).lean()
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

  const pitch = await Pitch.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: body },
    { new: true }
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

  await Pitch.findOneAndDelete({ _id: id, userId: session.user.id })
  return NextResponse.json({ success: true })
}
