import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import { ensureSessionScope, canManageMembers } from '@/lib/scope'

/**
 * PATCH /api/org/members — owner/admin manage a member:
 *   { userId, action: 'promote' | 'demote' | 'remove' }
 *
 * Guards: cannot touch the owner, cannot act on yourself, and removal simply
 * detaches (their historical rows keep their own userId attribution; the org's
 * shared records stay with the org).
 */
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { userId?: string; action?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { userId, action } = body
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return NextResponse.json({ error: 'Valid userId required' }, { status: 400 })
  }
  if (!['promote', 'demote', 'remove'].includes(action ?? '')) {
    return NextResponse.json({ error: 'action must be promote|demote|remove' }, { status: 400 })
  }

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)
  if (!canManageMembers(scope.orgRole)) {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  }
  if (userId === session.user.id) {
    return NextResponse.json({ error: 'You cannot manage your own membership here' }, { status: 400 })
  }

  const User = (await import('@/lib/models/User')).default
  const target = await User.findOne({ _id: userId, orgId: scope.orgId }).select('orgRole')
  if (!target) return NextResponse.json({ error: 'Member not found in this workspace' }, { status: 404 })
  if (target.orgRole === 'owner') {
    return NextResponse.json({ error: 'The workspace owner cannot be modified' }, { status: 400 })
  }

  if (action === 'promote') {
    await User.findByIdAndUpdate(userId, { $set: { orgRole: 'admin' } })
    return NextResponse.json({ success: true, orgRole: 'admin' })
  }
  if (action === 'demote') {
    await User.findByIdAndUpdate(userId, { $set: { orgRole: 'member' } })
    return NextResponse.json({ success: true, orgRole: 'member' })
  }

  // remove — detach from the workspace; their solo workspace is provisioned on
  // next login by ensureSessionScope.
  await User.findByIdAndUpdate(userId, { $unset: { orgId: '' }, $set: { orgRole: 'member' } })
  return NextResponse.json({ success: true })
}
