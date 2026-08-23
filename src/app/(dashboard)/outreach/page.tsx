'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, MessageCircle, Link2, Camera,
  Zap, CheckCircle, XCircle, Clock, RefreshCw,
  ChevronRight, Users, Send,
} from 'lucide-react'


interface Lead { _id: string; businessName: string; businessLocation?: string; opportunityScore?: number; businessEmail?: string; businessPhone?: string; businessInstagram?: string; businessLinkedin?: string; detectedGaps?: string[]; website?: string }
interface Channels { email: boolean; whatsapp: boolean; linkedin: boolean; instagram: boolean }
interface LeadStatus { name: string; status: 'waiting' | 'generating' | 'done' | 'error'; time?: number }
interface FeedEvent { type: string; businessName?: string; timestamp: Date; channel?: string; success?: boolean; error?: string; pitchId?: string }

const CHANNEL_CONFIG = [
  { key: 'email' as const,     Icon: Mail,          label: 'Email',     color: '#60a5fa', note: 'Requires Gmail connection' },
  { key: 'whatsapp' as const,  Icon: MessageCircle, label: 'WhatsApp',  color: '#4ade80', note: 'One-tap send' },
  { key: 'linkedin' as const,  Icon: Link2,         label: 'LinkedIn',  color: '#60a5fa', note: 'Copy + open' },
  { key: 'instagram' as const, Icon: Camera,        label: 'Instagram', color: '#e879f9', note: 'Copy + open' },
]

export default function OutreachPage() {
  const [leads, setLeads]             = useState<Lead[]>([])
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [channels, setChannels]       = useState<Channels>({ email: true, whatsapp: false, linkedin: false, instagram: false })
  const [launching, setLaunching]     = useState(false)
  const [started, setStarted]         = useState(false)
  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([])
  const [feedEvents, setFeedEvents]   = useState<FeedEvent[]>([])
  const [summary, setSummary]         = useState<{ success: number; failed: number } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const feedEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(data => {
      setLeads(data.clients ?? [])
    })
  }, [])

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [feedEvents])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleChannel = (key: keyof Channels) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectedLeads = leads.filter(l => selected.has(l._id))
  const hasChannels   = Object.values(channels).some(Boolean)

  const launchCampaign = async () => {
    setConfirmOpen(false)
    setLaunching(true)
    setStarted(true)
    setSummary(null)
    setFeedEvents([])

    // Initialize lead statuses
    const statuses: LeadStatus[] = selectedLeads.map(l => ({ name: l.businessName, status: 'waiting' }))
    setLeadStatuses(statuses)

    const startTimes: Record<number, number> = {}

    try {
      const res = await fetch('/api/outreach/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: selectedLeads.map(l => ({
            clientId:         l._id,
            businessName:     l.businessName,
            businessEmail:    l.businessEmail,
            businessPhone:    l.businessPhone,
            businessInstagram: l.businessInstagram,
            businessLinkedin:  l.businessLinkedin,
            businessLocation:  l.businessLocation,
            detectedGaps:      l.detectedGaps,
            website:           l.website,
          })),
          channels,
        }),
      })

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'generating') {
              startTimes[event.index] = Date.now()
              setLeadStatuses(prev => {
                const next = [...prev]
                if (next[event.index]) next[event.index] = { ...next[event.index], status: 'generating' }
                return next
              })
              setFeedEvents(prev => [...prev, { type: 'info', businessName: event.businessName, timestamp: new Date() }])
            }

            if (event.type === 'pitch_generated') {
              setFeedEvents(prev => [...prev, { type: 'pitch', businessName: event.businessName, timestamp: new Date() }])
            }

            if (event.type === 'email_sent') {
              setFeedEvents(prev => [...prev, {
                type: 'email', businessName: event.businessName,
                timestamp: new Date(), channel: 'email', success: event.success,
              }])
            }

            if (event.type === 'done') {
              const elapsed = startTimes[event.index] ? (Date.now() - startTimes[event.index]) / 1000 : undefined
              setLeadStatuses(prev => {
                const next = [...prev]
                if (next[event.index]) next[event.index] = { ...next[event.index], status: 'done', time: elapsed }
                return next
              })
            }

            if (event.type === 'error') {
              setLeadStatuses(prev => {
                const next = [...prev]
                if (next[event.index]) next[event.index] = { ...next[event.index], status: 'error' }
                return next
              })
              setFeedEvents(prev => [...prev, {
                type: 'error', businessName: event.businessName,
                timestamp: new Date(), error: event.error,
              }])
            }

            if (event.type === 'complete') {
              setSummary({ success: event.success, failed: event.failed })
              setLaunching(false)
            }
          } catch { /* skip malformed SSE line */ }
        }
      }
    } catch (err) {
      setLaunching(false)
      setFeedEvents(prev => [...prev, { type: 'error', timestamp: new Date(), error: 'Campaign failed to start' }])
    }
  }

  const doneCount = leadStatuses.filter(s => s.status === 'done' || s.status === 'error').length
  const progress  = leadStatuses.length > 0 ? (doneCount / leadStatuses.length) * 100 : 0

  return (
    <div style={{ minHeight: '100vh', color: '#FAFAFA' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>Outreach Control Room</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          Select leads, choose channels, launch your campaign
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT — Campaign Builder */}
        <div style={{
          background: 'rgba(12,12,20,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Step 1 — Select Leads */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Step 1 — Select Leads
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setSelected(new Set(leads.map(l => l._id)))} style={pillBtnStyle}>All</button>
                <button onClick={() => setSelected(new Set())} style={pillBtnStyle}>Clear</button>
              </div>
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {leads.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  No saved leads. <a href='/discover' style={{ color: '#E5484D', textDecoration: 'none' }}>Discover leads →</a>
                </div>
              ) : leads.map(lead => {
                const isSelected = selected.has(lead._id)
                return (
                  <div
                    key={lead._id}
                    onClick={() => toggleSelect(lead._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                      borderRadius: 8, cursor: 'pointer', transition: 'background 0.1s',
                      background: isSelected ? 'rgba(196,20,37,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(196,20,37,0.25)' : 'transparent'}`,
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: isSelected ? '#C41425' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${isSelected ? '#C41425' : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isSelected && <svg width='8' height='6' viewBox='0 0 8 6' fill='none'><path d='M1 3l2 2 4-4' stroke='#fff' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.businessName}</div>
                      {lead.businessLocation && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{lead.businessLocation}</div>}
                    </div>
                    {lead.opportunityScore && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ff4455', flexShrink: 0 }}>{lead.opportunityScore}</div>
                    )}
                  </div>
                )
              })}
            </div>

            {selected.size > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#E5484D', fontWeight: 600 }}>
                {selected.size} lead{selected.size > 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Step 2 — Channels */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Step 2 — Channels
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CHANNEL_CONFIG.map(({ key, Icon, label, color, note }) => {
                const active = channels[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggleChannel(key)}
                    style={{
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <Icon size={12} color={active ? color : 'rgba(255,255,255,0.3)'} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: active ? color : 'rgba(255,255,255,0.5)' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{note}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Launch Button */}
          <div style={{ padding: '16px 20px' }}>
            <motion.button
              whileHover={selected.size > 0 && hasChannels ? { scale: 1.01 } : {}}
              whileTap={selected.size > 0 && hasChannels ? { scale: 0.99 } : {}}
              onClick={() => selected.size > 0 && hasChannels && setConfirmOpen(true)}
              disabled={selected.size === 0 || !hasChannels || launching}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, cursor: selected.size > 0 && hasChannels ? 'pointer' : 'not-allowed',
                background: selected.size > 0 && hasChannels
                  ? 'linear-gradient(135deg, #C41425, #E5484D)'
                  : 'rgba(255,255,255,0.05)',
                border: 'none',
                color: selected.size > 0 && hasChannels ? '#fff' : 'rgba(255,255,255,0.25)',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: selected.size > 0 && hasChannels ? '0 4px 20px rgba(196,20,37,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {launching ? (
                <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Sending...</>
              ) : (
                <><Zap size={14} /> Launch Campaign → {selected.size > 0 ? `${selected.size} leads` : 'Select leads'}</>
              )}
            </motion.button>
          </div>
        </div>

        {/* RIGHT — Activity Feed */}
        <div style={{
          background: 'rgba(12,12,20,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
          minHeight: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {!started ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(196,20,37,0.1)', border: '1px solid rgba(196,20,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={24} color='#E5484D' />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Ready to launch</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Select leads and channels, then click Launch Campaign</div>
              </div>
            </div>
          ) : (
            <>
              {/* Progress */}
              {leadStatuses.length > 0 && (
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA' }}>
                      Generating pitches
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                      {doneCount} / {leadStatuses.length}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #C41425, #E5484D)', borderRadius: 3 }}
                    />
                  </div>
                  {/* Lead list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                    {leadStatuses.map((ls, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                        <StatusIcon status={ls.status} />
                        <span style={{ fontSize: 12, color: ls.status === 'waiting' ? 'rgba(255,255,255,0.3)' : '#FAFAFA', flex: 1 }}>
                          {ls.name}
                        </span>
                        {ls.time && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{ls.time.toFixed(1)}s</span>}
                        {ls.status === 'generating' && <div style={{ fontSize: 11, color: '#E5484D', animation: 'pulse 1s infinite' }}>generating...</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feed */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  Activity Log
                </div>
                <AnimatePresence initial={false}>
                  {feedEvents.map((ev, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 8,
                        background: ev.type === 'error' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${ev.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)'}`,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{ev.type === 'error' ? '❌' : ev.type === 'email' ? (ev.success ? '✉️' : '⚠️') : ev.type === 'pitch' ? '✍️' : '⟳'}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                        {ev.type === 'email' && ev.success ? `Email sent → ${ev.businessName}` : ''}
                        {ev.type === 'email' && !ev.success ? `Email failed → ${ev.businessName}` : ''}
                        {ev.type === 'pitch' ? `Pitch generated → ${ev.businessName}` : ''}
                        {ev.type === 'info' ? `Generating pitch for ${ev.businessName}...` : ''}
                        {ev.type === 'error' ? `Error: ${ev.businessName ?? ''} — ${ev.error}` : ''}
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                        {ev.timestamp.toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={feedEndRef} />
              </div>

              {/* Summary */}
              {summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    margin: '0 20px 20px',
                    padding: '16px', borderRadius: 12,
                    background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 3 }}>
                      ✅ Campaign Complete
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      {summary.success} sent • {summary.failed} failed
                    </div>
                  </div>
                  <a
                    href='/deals'
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
                      borderRadius: 8, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
                      color: '#4ade80', textDecoration: 'none', fontSize: 12, fontWeight: 700,
                    }}
                  >
                    View in Deals <ChevronRight size={12} />
                  </a>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(10,10,16,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
            >
              <div style={{ fontSize: 20, marginBottom: 12 }}>🚀</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Launch this campaign?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.6 }}>
                This will generate AI pitches and send them to <strong style={{ color: '#FAFAFA' }}>{selected.size} business{selected.size > 1 ? 'es' : ''}</strong> via {Object.entries(channels).filter(([,v]) => v).map(([k]) => k).join(', ')}.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmOpen(false)} style={{ flex: 1, ...cancelBtnStyle }}>Cancel</button>
                <button onClick={launchCampaign} style={{ flex: 1, ...launchBtnStyle }}>Launch →</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-track { background: transparent } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px }
      `}</style>
    </div>
  )
}

function StatusIcon({ status }: { status: LeadStatus['status'] }) {
  if (status === 'done')  return <CheckCircle size={13} color='#4ade80' />
  if (status === 'error') return <XCircle size={13} color='#ef4444' />
  if (status === 'generating') return <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#E5484D', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
  return <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
}

const pillBtnStyle: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 11,
  cursor: 'pointer', fontWeight: 600,
}
const cancelBtnStyle: React.CSSProperties = {
  padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
}
const launchBtnStyle: React.CSSProperties = {
  padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
  background: 'linear-gradient(135deg, #C41425, #E5484D)', border: 'none', color: '#fff',
  boxShadow: '0 4px 16px rgba(196,20,37,0.4)',
}
