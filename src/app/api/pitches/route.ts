import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'

// GET /api/pitches — list all pitches for current user
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page  = parseInt(searchParams.get('page')  ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const status = searchParams.get('status') // optional filter

  await connectDB()

  const query: Record<string, unknown> = { userId: session.user.id }
  if (status) query.overallStatus = status

  const [pitches, total] = await Promise.all([
    Pitch.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Pitch.countDocuments(query),
  ])

  return NextResponse.json({ pitches, total, page, pages: Math.ceil(total / limit) })
}

// POST /api/pitches — save a generated pitch
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await connectDB()

  const pitch = await Pitch.create({
    userId: session.user.id,
    ...body,
    overallStatus: 'draft',
  })

  return NextResponse.json({ pitch }, { status: 201 })
}
