'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCheck, Trash2, RefreshCw, Inbox,
  Trophy, Skull, MailWarning, Sparkles, Megaphone,
} from 'lucide-react'
import { toast } from 'sonner'
import { timeAgo } from '@/lib/format'
import { PageHeader, GhostButton } from '@/components/ui/kit'

interface NotificationItem {
  _id: string
  type: string
  message: string
  dealId?: string
  clientId?: string
  read: boolean
  createdAt: string
}

const TYPE_META: Record<string, { color: string; Icon: typeof Bell; label: string }> = {
  deal_won:          { color: '#4ade80', Icon: Trophy,      label: 'Deal Won' },
  deal_lost:         { color: '#9ca3af', Icon: Skull,       label: 'Deal Lost' },
  email_failed:      { color: '#ef4444', Icon: MailWarning, label: 'Delivery Issue' },
  campaign_complete: { color: '#60a5fa', Icon: Megaphone,   label: 'Campaign' },
  pitch_generated:   { color: '#a78bfa', Icon: Sparkles,    label: 'Pitch' },
}

function fallbackMeta(type: string) {
  return { color: '#E5484D', Icon: Bell, label: type.replaceAll('_', ' ') }
}

export default function NotificationsPage() {
  const [items, setItems]       = useState<NotificationItem[]>([])
  const [unread, setUnread]     = useState(0)
  const [loading, setLoading]   = useState(true)
  const [clearConfirm, setClearConfirm] = useState(false)

  // Event-handler reload (refresh button). The mount effect below mirrors this
  // logic as a promise chain, since synchronous setState inside an effect body
  // causes cascading renders.
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error(`Failed to load notifications (${res.status})`)
      const data = await res.json()
      setItems(data.notifications ?? [])
      setUnread(data.unreadCount ?? 0)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/notifications')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load notifications (${res.status})`)
        return res.json()
      })
      .then(data => {
        if (!active) return
        setItems(data.notifications ?? [])
        setUnread(data.unreadCount ?? 0)
      })
      .catch((err: unknown) => {
        if (active) toast.error(err instanceof Error ? err.message : 'Failed to load notifications')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const markRead = async (id: string) => {
    setItems(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)))
    setUnread(u => Math.max(0, u - 1))
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Mark-read failed')
    } catch {
      load() // resync with the server state on failure
    }
  }

  const markAllRead = async () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      if (!res.ok) throw new Error('Failed to mark all read')
    } catch {
      toast.error('Could not mark all as read')
      load()
    }
  }

  const clearAll = async () => {
    setClearConfirm(false)
    const previous = items
    setItems([])
    setUnread(0)
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear')
      toast.success('Notifications cleared')
    } catch {
      setItems(previous)
      toast.error('Could not clear notifications')
    }
  }

  return (
    <div style={{ minHeight: '100vh', color: '#FAFAFA' }}>
      <PageHeader
        eyebrow="Inbox"
        title="Alerts"
        subtitle="Campaign results, deal outcomes and delivery issues — everything that needs your eye"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostButton onClick={() => load()} title='Refresh' style={{ padding: '9px 12px' }}>
              <RefreshCw size={14} />
            </GhostButton>
            {unread > 0 && (
              <GhostButton onClick={markAllRead} style={{
                background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)',
                color: '#60a5fa',
              }}>
                <CheckCheck size={13} /> Mark all read ({unread})
              </GhostButton>
            )}
            {items.length > 0 && (
              <GhostButton onClick={() => setClearConfirm(true)} style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
              }}>
                <Trash2 size={13} /> Clear
              </GhostButton>
            )}
          </div>
        }
      />

      {/* Feed */}
      <div style={{
        background: 'rgba(12,12,20,0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden',
        minHeight: 300,
      }}>
        {loading ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <div>Loading alerts...</div>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 72, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'rgba(196,20,37,0.1)', border: '1px solid rgba(196,20,37,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Inbox size={24} color='#E5484D' />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>All caught up</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Alerts appear here after outreach campaigns finish or deals change stage
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((n, idx) => {
              const meta = TYPE_META[n.type] ?? fallbackMeta(n.type)
              const { Icon } = meta
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.5), duration: 0.2 }}
                  onClick={() => !n.read && markRead(n._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: n.read ? 'default' : 'pointer',
                    background: n.read ? 'transparent' : 'rgba(196,20,37,0.04)',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${meta.color}15`, border: `1px solid ${meta.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={meta.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: meta.color,
                      }}>{meta.label}</span>
                      {!n.read && (
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%', background: '#E5484D',
                          boxShadow: '0 0 8px rgba(229,72,77,0.6)',
                        }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: 13, lineHeight: 1.5,
                      color: n.read ? 'rgba(255,255,255,0.55)' : '#FAFAFA',
                    }}>{n.message}</div>
                  </div>

                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Clear confirm */}
      <AnimatePresence>
        {clearConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => setClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'rgba(10,10,16,0.98)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 16, padding: 28, width: 360,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <Trash2 size={22} color='#ef4444' />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Clear all notifications?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                This removes every alert permanently.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setClearConfirm(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                    color: '#ef4444', fontWeight: 700, fontSize: 13,
                  }}
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-track { background: transparent } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px }
      `}</style>
    </div>
  )
}
