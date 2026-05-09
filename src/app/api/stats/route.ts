import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/db'
import mongoose from 'mongoose'

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

    const userId = new mongoose.Types.ObjectId(session.user.id)

    const [totalClients, pitchesSent, activeDeals, earningsAgg] = await Promise.all([
      Client.countDocuments({ userId }),
      Pitch.countDocuments({ userId, status: 'sent' }),
      Deal.countDocuments({ userId, status: { $in: ['funded', 'in_progress'] } }),
      Deal.aggregate([
        { $match: { userId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$payoutAmount' } } },
      ]),
    ])

    const totalEarned = earningsAgg.length > 0 ? earningsAgg[0].total : 0

    return NextResponse.json({
      totalClients,
      pitchesSent,
      activeDeals,
      totalEarned,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
