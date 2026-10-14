import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import { ensureSessionScope, canManageMembers } from '@/lib/scope'

/** POST /api/org/invite — rotate the invite code (owner/admin). Old code dies instantly. */
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)
  if (!canManageMembers(scope.orgRole)) {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  }

  const Organization = (await import('@/lib/models/Organization')).default
  const { generateInviteCode } = await import('@/lib/models/Organization')
  const inviteCode = generateInviteCode()
  await Organization.findByIdAndUpdate(scope.orgId, { $set: { inviteCode } })

  return NextResponse.json({ success: true, inviteCode })
}
