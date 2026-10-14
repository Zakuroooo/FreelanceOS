import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import { ensureSessionScope } from '@/lib/scope'

/**
 * GET /api/org — current workspace: info + member roster + caller's role.
 * Every authenticated user has an org after ensureSessionScope (solo by default).
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)

  const User = (await import('@/lib/models/User')).default
  const members = await User.find({ orgId: scope.org._id })
    .select('name email orgRole createdAt')
    .sort({ createdAt: 1 })
    .lean()

  return NextResponse.json({
    org: {
      id: String(scope.org._id),
      name: scope.org.name,
      plan: scope.org.plan,
      seats: scope.org.seats,
      inviteCode: canSeeCode(scope.orgRole) ? scope.org.inviteCode : null,
    },
    role: scope.orgRole,
    members: members.map(m => ({
      id: String((m as unknown as { _id: unknown })._id),
      name: (m as unknown as { name?: string }).name ?? 'Member',
      email: (m as unknown as { email?: string }).email ?? '',
      orgRole: (m as unknown as { orgRole?: string }).orgRole ?? 'member',
      joinedAt: (m as unknown as { createdAt?: Date }).createdAt ?? null,
    })),
  })
}

function canSeeCode(role: string): boolean {
  return role === 'owner' || role === 'admin'
}

/** POST /api/org — rename workspace (owner/admin only). */
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const name = body.name?.trim()
  if (!name || name.length > 80) return NextResponse.json({ error: 'name required (max 80 chars)' }, { status: 400 })

  await connectDB()
  const scope = await ensureSessionScope(session.user.id)
  if (scope.orgRole === 'member') return NextResponse.json({ error: 'Admins only' }, { status: 403 })

  const Organization = (await import('@/lib/models/Organization')).default
  await Organization.findByIdAndUpdate(scope.orgId, { $set: { name } })
  return NextResponse.json({ success: true })
}
