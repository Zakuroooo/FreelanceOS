'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Mail, Send, MessageCircle, Trophy, RefreshCw,
  Copy, Check, RotateCcw, Crown, ShieldCheck, User as UserIcon,
  TrendingUp, IndianRupee,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, GlassCard, GhostButton, Badge } from '@/components/ui/kit'
import { SkeletonRows } from '@/components/ui/Skeleton'

interface MemberStats {
  id: string
  name: string
  email: string
  orgRole: string
  joinedAt?: string | null
  clientsSaved: number
  pitchesGenerated: number
  pitchesSent: number
  replies: number
  activeDeals: number
  dealsWon: number
  dealsLost: number
  revenue: number
}

interface OrgInfo {
  id: string
  name: string
  plan: string
  seats: number
  inviteCode: string | null
}

const ROLE_BADGE: Record<string, { color: string; Icon: typeof Crown }> = {
  owner:  { color: '#E5484D', Icon: Crown },
  admin:  { color: '#a78bfa', Icon: ShieldCheck },
  member: { color: '#8A8A9A', Icon: UserIcon },
}

function formatMoney(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

export default function TeamPage() {
  const [members, setMembers]   = useState<MemberStats[]>([])
  const [org, setOrg]           = useState<OrgInfo | null>(null)
  const [myRole, setMyRole]     = useState<string>('member')
  const [loading, setLoading]   = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)

  // load() is called from mount effect and after mutations only.
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, orgRes] = await Promise.all([
        fetch('/api/org/stats'),
        fetch('/api/org'),
      ])
      if (!statsRes.ok || !orgRes.ok) throw new Error('Failed to load team data')
      const stats = await statsRes.json()
      const orgData = await orgRes.json()
      setMembers(stats.members ?? [])
      setMyRole(stats.role ?? 'member')
      setOrg(orgData.org ?? null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([fetch('/api/org/stats'), fetch('/api/org')])
      .then(async ([s, o]) => ({ s: await s.json(), o: await o.json(), sOk: s.ok, oOk: o.ok }))
      .then(({ s, o, sOk, oOk }) => {
        if (!active) return
        if (!sOk || !oOk) throw new Error('Failed to load team data')
        setMembers(s.members ?? [])
        setMyRole(s.role ?? 'member')
        setOrg(o.org ?? null)
        setLoading(false)
      })
      .catch(() => { if (active) { toast.error('Failed to load team'); setLoading(false) } })
    return () => { active = false }
  }, [])

  const canManage = myRole === 'owner' || myRole === 'admin'

  const rotateInvite = async () => {
    try {
      const res = await fetch('/api/org/invite', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to rotate code')
      setOrg(prev => prev ? { ...prev, inviteCode: data.inviteCode } : prev)
      toast.success('New invite code generated — the old one no longer works')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rotate code')
    }
  }

  const manageMember = async (userId: string, action: 'promote' | 'demote' | 'remove') => {
    try {
      const res = await fetch('/api/org/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      toast.success(
        action === 'promote' ? 'Member promoted to admin'
        : action === 'demote' ? 'Member changed to regular access'
        : 'Member removed from workspace',
      )
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const totals = members.reduce(
    (acc, m) => ({
      pitchesSent: acc.pitchesSent + m.pitchesSent,
      replies: acc.replies + m.replies,
      dealsWon: acc.dealsWon + m.dealsWon,
      revenue: acc.revenue + m.revenue,
    }),
    { pitchesSent: 0, replies: 0, dealsWon: 0, revenue: 0 },
  )

  return (
    <div style={{ minHeight: '100vh', color: '#FAFAFA' }}>
      <PageHeader
        eyebrow="Workspace"
        title="Team"
        subtitle={org ? `${org.name} · ${members.length}/${org.seats} seats used` : 'Your agency workspace'}
        actions={<GhostButton onClick={() => void load()}><RefreshCw size={13} /> Refresh</GhostButton>}
      />

      {/* Totals strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Pitches sent', value: totals.pitchesSent, color: '#60a5fa', Icon: <Send size={15} /> },
          { label: 'Replies', value: totals.replies, color: '#4ade80', Icon: <MessageCircle size={15} /> },
          { label: 'Deals won', value: totals.dealsWon, color: '#f59e0b', Icon: <Trophy size={15} /> },
          { label: 'Revenue', value: formatMoney(totals.revenue), color: '#E5484D', Icon: <IndianRupee size={15} /> },
        ].map(({ label, value, color, Icon }, i) => (
          <GlassCard key={label} delay={i * 0.06} style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `${color}14`, border: `1px solid ${color}2e`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color,
              }}>{Icon}</div>
              <div>
                <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em', color }}>{value}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Invite code */}
      {canManage && org?.inviteCode && (
        <GlassCard delay={0.1} style={{ padding: '16px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
              Invite code — share with teammates to add them here
            </div>
            <code style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.3em', color: '#E5484D', fontFamily: "'JetBrains Mono', monospace" }}>
              {org.inviteCode}
            </code>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostButton
              onClick={async () => {
                const { ok } = await (await import('@/lib/handoff')).copyText(org.inviteCode!)
                if (ok) { setCopiedCode(true); toast.success('Code copied'); setTimeout(() => setCopiedCode(false), 2000) }
                else toast.error('Copy blocked')
              }}
            >
              {copiedCode ? <Check size={13} color="#4ade80" /> : <Copy size={13} />} {copiedCode ? 'Copied' : 'Copy'}
            </GhostButton>
            <GhostButton onClick={() => void rotateInvite()} title="Invalidate the current code and generate a fresh one">
              <RotateCcw size={13} /> Rotate
            </GhostButton>
          </div>
        </GlassCard>
      )}

      {/* Members leaderboard */}
      <GlassCard delay={0.15} style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 2fr) repeat(7, minmax(70px, 1fr)) minmax(110px, 1fr)',
          padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.02)',
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.32)', minWidth: 860,
        }}>
          <div>Member</div>
          <div>Saved</div>
          <div>Gen.</div>
          <div>Sent</div>
          <div>Replies</div>
          <div>Active</div>
          <div>Won</div>
          <div>Revenue</div>
          <div>{canManage ? 'Manage' : ''}</div>
        </div>

        {loading ? (
          <div style={{ padding: '18px 20px' }}><SkeletonRows rows={4} height={46} /></div>
        ) : (
          <AnimatePresence initial={false}>
            {members.map((m, idx) => {
              const roleMeta = ROLE_BADGE[m.orgRole] ?? ROLE_BADGE.member
              const RoleIcon = roleMeta.Icon
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(180px, 2fr) repeat(7, minmax(70px, 1fr)) minmax(110px, 1fr)',
                    alignItems: 'center',
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    minWidth: 860,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#FAFAFA',
                    }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.name}
                        </span>
                        <Badge color={roleMeta.color}><RoleIcon size={9} /> {m.orgRole}</Badge>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.email}
                      </div>
                    </div>
                  </div>

                  <StatCell value={m.clientsSaved} />
                  <StatCell value={m.pitchesGenerated} />
                  <StatCell value={m.pitchesSent} color="#60a5fa" strong />
                  <StatCell value={m.replies} color="#4ade80" strong />
                  <StatCell value={m.activeDeals} />
                  <StatCell value={m.dealsWon} color="#f59e0b" />
                  <StatCell value={formatMoney(m.revenue)} color={m.revenue > 0 ? '#4ade80' : undefined} strong />

                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {canManage && m.orgRole !== 'owner' && (
                      <>
                        {m.orgRole === 'member' ? (
                          <MiniAction label="Make admin" onClick={() => void manageMember(m.id, 'promote')} />
                        ) : (
                          <MiniAction label="Set member" onClick={() => void manageMember(m.id, 'demote')} />
                        )}
                        <MiniAction label="Remove" danger onClick={() => void manageMember(m.id, 'remove')} />
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </GlassCard>

      {!loading && members.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
          <Users size={22} style={{ marginBottom: 8, opacity: 0.5 }} />
          No members yet — share the invite code above.
        </div>
      )}

      <style>{`
        .team-spin { animation: team-rotate 1s linear infinite; }
        @keyframes team-rotate { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function StatCell({ value, color, strong }: { value: string | number; color?: string; strong?: boolean }) {
  return (
    <div style={{
      fontSize: strong ? 15 : 14, fontWeight: strong ? 800 : 600,
      letterSpacing: '-0.02em',
      color: color ?? 'rgba(255,255,255,0.75)',
    }}>
      {value}
    </div>
  )
}

function MiniAction({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="kit-ghost-btn"
      style={{
        padding: '4px 9px', borderRadius: 6, fontSize: 10, fontWeight: 600,
        color: danger ? '#ef4444' : 'rgba(255,255,255,0.5)',
        background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
