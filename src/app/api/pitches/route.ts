import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/db'
import Pitch, { isPitchStatus, type IPitch } from '@/lib/models/Pitch'
import { pick, PITCH_WRITABLE_FIELDS } from '@/lib/sanitize'
import { ensureSessionScope } from '@/lib/scope'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Pagination values arrive as raw query strings, and `parseInt` is happy to hand back
 * `NaN` for `?page=abc` or a negative number for `?page=-5` — both of which reach
 * `.skip()` and fail inside the driver. `?limit=0` is worse than it looks: Mongo reads
 * `limit(0)` as "no limit" and returns the entire collection.
 */
function positiveInt(raw: string | null, fallback: number, max: number): number {
  const n = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(n, max)
}

// GET /api/pitches — list all pitches for current user
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page  = positiveInt(searchParams.get('page'),  1,             Number.MAX_SAFE_INTEGER)
  const limit = positiveInt(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT)
  const status = searchParams.get('status') // optional filter

  await connectDB()
  // Team-shared pitch library; per-member filters arrive via ?member=<userId>.
  const scope = await ensureSessionScope(session.user.id)

  const { searchParams: memberParams } = new URL(req.url)
  const memberFilter = memberParams.get('member')

  const query: Record<string, unknown> = { orgId: scope.orgId }
  if (memberFilter && mongoose.isValidObjectId(memberFilter)) {
    query.userId = new mongoose.Types.ObjectId(memberFilter)
  }
  // Only the four statuses the schema knows about. An unrecognised value used to become a
  // filter that matched nothing, which reads as "you have no pitches" rather than as the
  // bad request it is.
  if (status) {
    if (!isPitchStatus(status)) {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
    }
    query.overallStatus = status
  }

  const [pitches, total] = await Promise.all([
    Pitch.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Pitch.countDocuments(query),
  ])

  // Stats are computed over the whole collection, never the filtered page — the
  // client used to derive them from the filtered subset, so picking "Draft" made
  // Total drop and Sent/Replied hit zero.
  const orgScope = { orgId: scope.orgId }
  const [sent, replied, approved, totalAll] = await Promise.all([
    Pitch.countDocuments({ ...orgScope, overallStatus: 'sent' }),
    Pitch.countDocuments({ ...orgScope, overallStatus: 'replied' }),
    Pitch.countDocuments({ ...orgScope, overallStatus: 'approved' }),
    Pitch.countDocuments(orgScope),
  ])

  return NextResponse.json({
    pitches,
    total,
    page,
    pages: Math.ceil(total / limit),
    stats: { total: totalAll, sent, replied, approved },
  })
}

// POST /api/pitches — save a generated pitch
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (typeof body?.businessName !== 'string' || !body.businessName.trim()) {
    return NextResponse.json({ error: 'businessName is required' }, { status: 400 })
  }

  await connectDB()

  const scope = await ensureSessionScope(session.user.id)
  const pitch = await Pitch.create({
    ...pick<IPitch>(body, PITCH_WRITABLE_FIELDS),
    userId: session.user.id,
    orgId: scope.orgId,
    overallStatus: 'draft',
    sentChannels: {},
  })

  return NextResponse.json({ pitch }, { status: 201 })
}
