/**
 * Multi-tenant scoping — every team shares one workspace.
 *
 * The SaaS model: an Organization (agency) owns leads, pitches and deals; Users
 * belong to that org via `orgId`, and `userId` becomes ATTRIBUTION (who did what)
 * rather than a visibility wall. Admins track per-member activity from /team.
 *
 * `ensureSessionScope()` is the single entry point every API route calls instead
 * of reading `session.user.id` directly. It:
 *   1. guarantees the caller belongs to an organization (auto-creates a solo
 *      workspace on first touch), and
 *   2. backfills orgId onto that user's pre-SaaS records once, lazily, so no
 *      migration script is needed for existing data.
 */

import mongoose from 'mongoose'
import Organization, { generateInviteCode, type IOrganization } from './models/Organization'
// Static imports — dynamic template-literal imports resolve at runtime and can
// break under production bundling; an explicit map costs nothing.
import ClientModel from './models/Client'
import PitchModel from './models/Pitch'
import DealModel from './models/Deal'
import NotificationModel from './models/Notification'

export interface SessionScope {
  userId: string
  orgId: string
  orgRole: 'owner' | 'admin' | 'member'
  org: IOrganization
}

const SEAT_LIMITS: Record<IOrganization['plan'], number> = {
  free: 3,
  pro: 10,
  agency: 100,
}

export function seatLimitFor(plan: IOrganization['plan']): number {
  return SEAT_LIMITS[plan] ?? 3
}

/** Idempotently attaches the user to an org and backfills their historical rows.
 *
 * Concurrency-safe: on a cold dashboard several API calls fire simultaneously and
 * every one of them runs this function. The old version had a read-then-create
 * race — five calls each saw "no org", each created one, and the user's history
 * landed in whichever workspace lost the pointer swap (the "my pitches vanished"
 * bug). The claim below is atomic: exactly ONE concurrent caller wins the
 * conditional update; losers delete their duplicate and adopt the winner's org.
 */
export async function ensureSessionScope(
  userId: string,
  fallbackName = 'My Workspace',
): Promise<SessionScope> {
  const User = (await import('./models/User')).default

  for (let attempt = 0; attempt < 5; attempt++) {
    const user = await User.findById(userId).select('name orgId orgRole').lean<{
      _id: mongoose.Types.ObjectId
      name?: string
      orgId?: mongoose.Types.ObjectId
      orgRole?: 'owner' | 'admin' | 'member'
    } | null>()
    if (!user) throw new Error('User not found')

    // Fast path — membership already settled by us or a racing caller.
    if (user.orgId) {
      const org = await Organization.findById(user.orgId)
      if (org) {
        return { userId, orgId: String(org._id), orgRole: user.orgRole ?? 'member', org }
      }
      // Dangling pointer (org deleted) — fall through and re-provision.
    }

    // Provision a candidate workspace (invite-code collisions regenerate).
    let created: IOrganization | null = null
    for (let i = 0; i < 5 && !created; i++) {
      try {
        created = await Organization.create({
          name: `${user.name ?? fallbackName}'s Workspace`,
          ownerUserId: new mongoose.Types.ObjectId(userId),
          inviteCode: generateInviteCode(),
          plan: 'free',
          seats: seatLimitFor('free'),
        })
      } catch (err) {
        if (!(err instanceof Error && 'code' in err && (err as { code?: number }).code === 11000)) throw err
      }
    }
    if (!created) throw new Error('Could not provision workspace')

    // ATOMIC CLAIM — only the first concurrent caller wins this update.
    const claimed = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId), orgId: { $exists: false } },
      { $set: { orgId: created._id, orgRole: 'owner' as const } },
      { new: true },
    )

    if (!claimed) {
      // Lost the race — remove our duplicate and adopt the winner's org on the
      // next loop iteration.
      await Organization.deleteOne({ _id: created._id })
      continue
    }

    const orgId = created._id
    const ownerFilter = { userId: new mongoose.Types.ObjectId(userId), orgId: { $exists: false } }
    await Promise.all([
      ClientModel.updateMany(ownerFilter, { $set: { orgId } }),
      PitchModel.updateMany(ownerFilter, { $set: { orgId } }),
      DealModel.updateMany(ownerFilter, { $set: { orgId } }),
      NotificationModel.updateMany(ownerFilter, { $set: { orgId } }),
    ])

    return { userId, orgId: String(orgId), orgRole: 'owner', org: created }
  }

  throw new Error('Could not resolve workspace after repeated attempts')
}

/** Role helpers used by the org management routes. */
export function canManageMembers(role: SessionScope['orgRole']): boolean {
  return role === 'owner' || role === 'admin'
}
