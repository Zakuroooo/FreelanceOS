import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import { seatLimitFor } from '@/lib/scope'

/**
 * POST /api/org/join — whitelist-style onboarding: an agency hands a teammate the
 * invite code; joining moves the user out of their solo workspace into the org.
 *
 * Seat-capped by plan. The caller's previous solo workspace is left untouched —
 * its records stay with their original owner, so nothing is lost or merged.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { code?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const code = body.code?.trim().toUpperCase()
  if (!code || !/^[A-Z0-9]{8}$/.test(code)) {
    return NextResponse.json({ error: 'Enter the 8-character invite code' }, { status: 400 })
  }

  await connectDB()
  const Organization = (await import('@/lib/models/Organization')).default
  const User = (await import('@/lib/models/User')).default

  const org = await Organization.findOne({ inviteCode: code })
  if (!org) return NextResponse.json({ error: 'Invite code not found' }, { status: 404 })

  // Already there?
  const me = await User.findById(session.user.id).select('orgId orgRole').lean<{ orgId?: unknown } | null>()
  if (me?.orgId && String(me.orgId) === String(org._id)) {
    return NextResponse.json({ success: true, alreadyMember: true })
  }

  const seatCount = await User.countDocuments({ orgId: org._id })
  const cap = org.seats ?? seatLimitFor(org.plan)
  if (seatCount >= cap) {
    return NextResponse.json(
      { error: `This workspace is full (${cap} seats on the ${org.plan} plan). Ask the owner to upgrade or free a seat.` },
      { status: 403 },
    )
  }

  // Owners leaving their own workspace would orphan it — block explicitly.
  if (me && 'orgId' in me) {
    const currentOrg = me.orgId ? await Organization.findById(me.orgId).select('ownerUserId') : null
    if (currentOrg && String(currentOrg.ownerUserId) === session.user.id) {
      return NextResponse.json(
        { error: 'You own your current workspace. Transfer ownership or create a new account to join another.' },
        { status: 400 },
      )
    }
  }

  await User.findByIdAndUpdate(session.user.id, { $set: { orgId: org._id, orgRole: 'member' } })

  return NextResponse.json({ success: true, org: { id: String(org._id), name: org.name } })
}
