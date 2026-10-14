'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, Copy, Check, RotateCcw, LogIn, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { copyText } from '@/lib/handoff'

/**
 * Workspace membership card for Settings.
 *
 * Every account already lives in a (solo) workspace via ensureSessionScope, so
 * this card covers the three SaaS actions: rename, share/rotate the invite
 * code, and join another workspace with a code. Joining is blocked server-side
 * when you own your current workspace — surfaced here as disabled state.
 */

interface OrgInfo {
  id: string
  name: string
  plan: string
  seats: number
  inviteCode: string | null
}

interface Member {
  id: string
  name: string
  orgRole: string
}

const CARD = {
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '20px 24px',
  marginBottom: 24,
  background: 'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)',
} as const

export function WorkspaceCard() {
  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [role, setRole] = useState<string>('member')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/org')
      if (!res.ok) throw new Error('Failed to load workspace')
      const data = await res.json()
      setOrg(data.org)
      setRole(data.role)
      setMembers(data.members ?? [])
    } catch {
      toast.error('Failed to load workspace')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/org')
      .then(r => r.json())
      .then(data => { if (active) { setOrg(data.org); setRole(data.role); setMembers(data.members ?? []) } })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const canManage = role === 'owner' || role === 'admin'

  const rotate = async () => {
    try {
      const res = await fetch('/api/org/invite', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setOrg(prev => prev ? { ...prev, inviteCode: data.inviteCode } : prev)
      toast.success('New invite code generated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rotate code')
    }
  }

  const rename = async () => {
    if (!org) return
    const name = prompt('Workspace name', org.name)?.trim()
    if (!name || name === org.name) return
    try {
      const res = await fetch('/api/org', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Rename failed')
      }
      setOrg({ ...org, name })
      toast.success('Workspace renamed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rename failed')
    }
  }

  const join = async () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    setJoining(true)
    try {
      const res = await fetch('/api/org/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Join failed')
      toast.success(`Joined ${data.org?.name ?? 'workspace'} — reloading…`)
      setTimeout(() => window.location.reload(), 900)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Join failed')
      setJoining(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(229,72,77,0.1)', border: '1px solid rgba(229,72,77,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={15} color="#E5484D" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>
              {loading ? 'Loading workspace…' : `${org?.name ?? 'Workspace'}`}
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)' }}>
              {org ? `${members.length}/${org.seats} seats · ${org.plan} plan · you are ${role}` : 'Team workspace'}
            </div>
          </div>
        </div>

        {canManage && (
          <button onClick={() => void rename()} className="kit-ghost-btn" style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
          }}>
            Rename
          </button>
        )}
      </div>

      {/* Invite code row */}
      {canManage && org?.inviteCode && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(229,72,77,0.05)', border: '1px solid rgba(229,72,77,0.18)',
          marginBottom: 14,
        }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
              Invite code
            </div>
            <code style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.25em', color: '#E5484D', fontFamily: "'JetBrains Mono', monospace" }}>
              {org.inviteCode}
            </code>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button
              onClick={async () => {
                const { ok } = await copyText(org.inviteCode!)
                if (ok) { setCopied(true); toast.success('Code copied'); setTimeout(() => setCopied(false), 2000) }
                else toast.error('Copy blocked')
              }}
              className="kit-ghost-btn"
              style={{ padding: '7px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600 }}
            >
              {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={() => void rotate()} className="kit-ghost-btn" style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
            }} title="Invalidate current code and generate a new one">
              <RotateCcw size={12} /> Rotate
            </button>
          </div>
        </div>
      )}

      {/* Members mini-list */}
      {!loading && members.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          {members.slice(0, 5).map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(255,255,255,0.65)' }}>
              <Users size={11} color="rgba(255,255,255,0.3)" />
              {m.name}
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.orgRole}</span>
            </div>
          ))}
          {members.length > 5 && (
            <a href="/team" style={{ fontSize: 11.5, color: '#E5484D', textDecoration: 'none' }}>
              View all in Team →
            </a>
          )}
        </div>
      )}

      {/* Join flow — only useful when NOT managing this workspace */}
      {role !== 'owner' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Have a code from another agency? Enter it"
            maxLength={8}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8,
              padding: '9px 12px', color: '#FAFAFA', fontSize: 13,
              letterSpacing: '0.15em', textTransform: 'uppercase', outline: 'none',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
          <button
            onClick={() => void join()}
            disabled={joining || joinCode.trim().length !== 8}
            className="kit-ghost-btn"
            style={{
              padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              opacity: joining || joinCode.trim().length !== 8 ? 0.5 : 1,
            }}
          >
            {joining ? <Loader2 size={13} className="ws-spin" /> : <LogIn size={13} />} Join
          </button>
        </div>
      )}

      <style>{`
        .ws-spin { animation: ws-rotate 1s linear infinite; }
        @keyframes ws-rotate { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  )
}
