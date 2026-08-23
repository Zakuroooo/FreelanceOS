import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Deal from '@/lib/models/Deal'

// GET /api/deals — returns deals grouped by stage for Kanban
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage') // optional filter

  await connectDB()

  const query: Record<string, unknown> = { userId: session.user.id }
  if (stage) query.stage = stage

  const deals = await Deal.find(query).sort({ createdAt: -1 }).lean()

  // Group by stage for Kanban rendering
  const grouped = {
    pitched:   deals.filter(d => d.stage === 'pitched'),
    responded: deals.filter(d => d.stage === 'responded'),
    meeting:   deals.filter(d => d.stage === 'meeting'),
    proposal:  deals.filter(d => d.stage === 'proposal'),
    won:       deals.filter(d => d.stage === 'won'),
    lost:      deals.filter(d => d.stage === 'lost'),
  }

  // Revenue stats
  const pipeline = deals
    .filter(d => !['won','lost'].includes(d.stage))
    .reduce((sum, d) => sum + (d.estimatedValue ?? 0), 0)
  const wonRevenue = deals
    .filter(d => d.stage === 'won')
    .reduce((sum, d) => sum + (d.wonValue ?? d.estimatedValue ?? 0), 0)

  return NextResponse.json({ deals, grouped, stats: { total: deals.length, pipeline, wonRevenue } })
}

// POST /api/deals — create a new deal
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await connectDB()

  const deal = await Deal.create({
    userId: session.user.id,
    stage:  'pitched',
    pitchedAt: new Date(),
    currency: 'INR',
    notes: [],
    ...body,
  })

  return NextResponse.json({ deal }, { status: 201 })
}
