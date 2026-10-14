import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import { ensureSessionScope } from '@/lib/scope'
import { SERVICE_CATALOG } from '@/lib/services'

/**
 * GET /api/onboarding — activation state, computed LIVE from real system state.
 * Nothing is self-reported: a step lights up only when the underlying thing
 * actually exists (mailbox connected, org has leads, a pitch really left).
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)

  const User = (await import('@/lib/models/User')).default
  const Client = (await import('@/lib/models/Client')).default
  const Pitch = (await import('@/lib/models/Pitch')).default
  const { resolveMailer } = await import('@/lib/mailer')

  const [user, mailer, hasLeads, sentPitch] = await Promise.all([
    User.findById(session.user.id).select('services').lean<{ services?: string[] } | null>(),
    resolveMailer(session.user.id),
    Client.exists({ orgId: scope.orgId }),
    Pitch.findOne(
      { orgId: scope.orgId, $or: [{ overallStatus: { $in: ['sent', 'replied'] } }, { 'sentChannels.email.status': 'sent' }] },
      { _id: 1 },
    ).lean(),
  ])

  const validServices = (user?.services ?? []).filter(s => SERVICE_CATALOG.some(c => c.id === s))

  return NextResponse.json({
    steps: {
      emailConnected: mailer.ok,
      emailChannel: mailer.ok ? mailer.mailer.channel : null,
      servicesChosen: validServices.length > 0,
      services: validServices,
      firstScan: Boolean(hasLeads),
      firstPitchSent: Boolean(sentPitch),
    },
  })
}

/** POST /api/onboarding — persist the chosen services ({ services: string[] }). */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { services?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const requested = Array.isArray(body.services) ? body.services : []
  if (requested.length === 0) {
    return NextResponse.json({ error: 'Pick at least one service' }, { status: 400 })
  }
  // Whitelist against the real catalog so junk ids never reach prompts.
  const valid = [...new Set(requested.filter((s): s is string => typeof s === 'string' && SERVICE_CATALOG.some(c => c.id === s)))]
  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid services in list' }, { status: 400 })
  }

  await connectDB()
  const User = (await import('@/lib/models/User')).default
  await User.findByIdAndUpdate(session.user.id, { $set: { services: valid } })

  return NextResponse.json({ success: true, services: valid })
}
