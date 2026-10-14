import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/db'
import mongoose from 'mongoose'
// Type-only, so it does not undo the deliberate dynamic `import()` of the models below.
import type { IDeal } from '@/lib/models/Deal'
import { ensureSessionScope } from '@/lib/scope'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to MongoDB
    await dbConnect()

    // Import models to ensure they are registered
    const { default: Client } = await import('@/lib/models/Client')
    const { default: Pitch } = await import('@/lib/models/Pitch')
    const { default: Deal } = await import('@/lib/models/Deal')
    const { default: Notification } = await import('@/lib/models/Notification')

    // Workspace-level numbers: the whole team's activity rolls up here.
    const scope = await ensureSessionScope(session.user.id)
    const userId = new mongoose.Types.ObjectId(session.user.id)
    const orgId = new mongoose.Types.ObjectId(scope.orgId)

    // These three used to query `status`, which exists on neither schema — Pitch calls
    // it `overallStatus` and Deal calls it `stage`. Mongoose's default `strictQuery`
    // drops unknown paths instead of erroring, so the filters silently matched
    // everything and the counts came back 0. Field names now match the schemas.
    //
    // Typed as `IDeal['stage'][]` rather than left to inference: a bare string array
    // would let a stage that is not in the enum sit here unnoticed and match nothing.
    const ACTIVE_STAGES: IDeal['stage'][] = ['responded', 'meeting', 'proposal']

    // Week-over-week window for the trend lines — they used to be hardcoded
    // strings ("+12% vs last month") on every card.
    const weekAgo = new Date(Date.now() - 7 * 86400000)

    const [
      totalClients, pitchesSent, activeDeals, earningsAgg,
      weekClients, weekPitches, weekDeals,
      recentActivity,
    ] = await Promise.all([
      Client.countDocuments({ orgId }),
      Pitch.countDocuments({ orgId, overallStatus: 'sent' }),
      Deal.countDocuments({ orgId, stage: { $in: ACTIVE_STAGES } }),
      Deal.aggregate([
        { $match: { orgId, stage: 'won' } },
        // wonValue is what the deal actually closed at; fall back to the estimate.
        { $group: { _id: null, total: { $sum: { $ifNull: ['$wonValue', '$estimatedValue'] } } } },
      ]),
      Client.countDocuments({ orgId, createdAt: { $gte: weekAgo } }),
      Pitch.countDocuments({ orgId, createdAt: { $gte: weekAgo } }),
      Deal.countDocuments({ orgId, createdAt: { $gte: weekAgo } }),
      // Feed stays personal (your actions), but include org events too.
      Notification.find({ $or: [{ orgId }, { userId, orgId: { $exists: false } }] })
        .sort({ createdAt: -1 }).limit(8).lean(),
    ])

    const totalEarned = earningsAgg.length > 0 ? earningsAgg[0].total : 0

    return NextResponse.json({
      totalClients,
      pitchesSent,
      activeDeals,
      totalEarned,
      weekly: { clients: weekClients, pitches: weekPitches, deals: weekDeals },
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
