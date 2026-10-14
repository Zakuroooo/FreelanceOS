import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import { ensureSessionScope } from '@/lib/scope'

/**
 * GET /api/org/stats — the admin view's engine.
 *
 * Per-member attribution across the workspace: who generated/sent pitches, whose
 * leads replied, who closed what, and the money attached to each closer. All
 * aggregations run org-scoped and group by userId; a single $lookup-free pass
 * per collection keeps this fast enough to call on page load.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)

  const User = (await import('@/lib/models/User')).default
  const Client = (await import('@/lib/models/Client')).default
  const Pitch = (await import('@/lib/models/Pitch')).default
  const Deal = (await import('@/lib/models/Deal')).default

  const orgId = new mongoose.Types.ObjectId(scope.orgId)

  const [members, clientsByUser, pitchStats, dealStats] = await Promise.all([
    User.find({ orgId: scope.orgId }).select('name email orgRole createdAt').sort({ createdAt: 1 }).lean(),
    Client.aggregate<{ _id: mongoose.Types.ObjectId; saved: number }>([
      { $match: { orgId } },
      { $group: { _id: '$userId', saved: { $sum: 1 } } },
    ]),
    Pitch.aggregate<{
      _id: mongoose.Types.ObjectId
      generated: number
      sent: number
      replied: number
    }>([
      { $match: { orgId } },
      {
        $group: {
          _id: '$userId',
          generated: { $sum: 1 },
          // 'sent' or later means it actually left the building.
          sent: {
            $sum: {
              $cond: [{ $in: ['$overallStatus', ['sent', 'replied']] }, 1, 0],
            },
          },
          replied: { $sum: { $cond: [{ $eq: ['$overallStatus', 'replied'] }, 1, 0] } },
        },
      },
    ]),
    Deal.aggregate<{
      _id: mongoose.Types.ObjectId
      active: number
      won: number
      lost: number
      revenue: number
    }>([
      { $match: { orgId } },
      {
        $group: {
          _id: '$userId',
          active: { $sum: { $cond: [{ $in: ['$stage', ['pitched', 'responded', 'meeting', 'proposal']] }, 1, 0] } },
          won: { $sum: { $cond: [{ $eq: ['$stage', 'won'] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$stage', 'lost'] }, 1, 0] } },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$stage', 'won'] },
                { $ifNull: ['$wonValue', '$estimatedValue'] },
                0,
              ],
            },
          },
        },
      },
    ]),
  ])

  const clientMap = new Map(clientsByUser.map(r => [String(r._id), r.saved]))
  const pitchMap = new Map(pitchStats.map(r => [String(r._id), r]))
  const dealMap = new Map(dealStats.map(r => [String(r._id), r]))

  return NextResponse.json({
    role: scope.orgRole,
    members: members.map(m => {
      const id = String((m as unknown as { _id: unknown })._id)
      const p = pitchMap.get(id)
      const d = dealMap.get(id)
      return {
        id,
        name: (m as unknown as { name?: string }).name ?? 'Member',
        email: (m as unknown as { email?: string }).email ?? '',
        orgRole: (m as unknown as { orgRole?: string }).orgRole ?? 'member',
        joinedAt: (m as unknown as { createdAt?: Date }).createdAt ?? null,
        clientsSaved: clientMap.get(id) ?? 0,
        pitchesGenerated: p?.generated ?? 0,
        pitchesSent: p?.sent ?? 0,
        replies: p?.replied ?? 0,
        activeDeals: d?.active ?? 0,
        dealsWon: d?.won ?? 0,
        dealsLost: d?.lost ?? 0,
        revenue: Math.round(d?.revenue ?? 0),
      }
    }),
  })
}
