'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronRight, Mail, MessageCircle, Link2, Camera, TrendingUp, DollarSign, Target, Trophy, StickyNote, Calendar, AlertCircle } from 'lucide-react'

const LinkedinIcon = Link2
const InstagramIcon = Camera


interface Deal {
  _id: string
  businessName: string
  businessLocation?: string
  stage: 'pitched' | 'responded' | 'meeting' | 'proposal' | 'won' | 'lost'
  channel?: 'email' | 'whatsapp' | 'linkedin' | 'instagram'
  estimatedValue: number
  wonValue?: number
  currency: string
  pitchedAt?: string
  notes: Array<{ text: string; createdAt: string }>
  nextAction?: string
  nextActionDate?: string
  lostReason?: string
  createdAt: string
}

type Stage = Deal['stage']

const STAGES: Array<{ key: Stage; label: string; color: string; emoji: string }> = [
  { key: 'pitched',   label: 'Pitched',    color: '#60a5fa', emoji: '📨' },
  { key: 'responded', label: 'Responded',  color: '#a78bfa', emoji: '💬' },
  { key: 'meeting',   label: 'Meeting',    color: '#f59e0b', emoji: '📅' },
  { key: 'proposal',  label: 'Proposal',   color: '#fb923c', emoji: '📋' },
  { key: 'won',       label: 'Won 🎉',     color: '#4ade80', emoji: '🏆' },
  { key: 'lost',      label: 'Lost',       color: '#6b7280', emoji: '💀' },
]

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email:     <Mail size={10} />,
  whatsapp:  <MessageCircle size={10} />,
  linkedin:  <Link2 size={10} />,
  instagram: <Camera size={10} />,
}

function formatCurrency(val: number, currency = 'INR') {
  if (currency === 'INR') return `₹${val.toLocaleString('en-IN')}`
  return `$${val.toLocaleString()}`
}

function daysSince(dateStr?: string) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  return days === 0 ? 'Today' : `${days}d ago`
}

export default function DealsPage() {
  const [deals, setDeals]           = useState<Deal[]>([])
  const [grouped, setGrouped]       = useState<Record<Stage, Deal[]>>({} as Record<Stage, Deal[]>)
  const [stats, setStats]           = useState({ total: 0, pipeline: 0, wonRevenue: 0 })
  const [loading, setLoading]       = useState(true)
  const [detailDeal, setDetailDeal] = useState<Deal | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [noteInput, setNoteInput]   = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [valueInput, setValueInput] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/deals')
      const data = await res.json()
      setDeals(data.deals ?? [])
      setGrouped(data.grouped ?? {})
      setStats(data.stats ?? { total: 0, pipeline: 0, wonRevenue: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const moveStage = async (dealId: string, newStage: Stage) => {
    // Optimistic update
    setGrouped(prev => {
      const allDeals = Object.values(prev).flat()
      const deal = allDeals.find(d => d._id === dealId)
      if (!deal) return prev

      const updated = { ...deal, stage: newStage }
      const next: Record<Stage, Deal[]> = {} as Record<Stage, Deal[]>
      STAGES.forEach(s => {
        next[s.key] = (prev[s.key] ?? []).filter(d => d._id !== dealId)
      })
      next[newStage] = [...(next[newStage] ?? []), updated]
      return next
    })

    await fetch(`/api/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })

    if (detailDeal?._id === dealId) setDetailDeal(d => d ? { ...d, stage: newStage } : null)
  }

  const addNote = async () => {
    if (!detailDeal || !noteInput.trim()) return
    setNoteLoading(true)
    const res  = await fetch(`/api/deals/${detailDeal._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteInput.trim() }),
    })
    const data = await res.json()
    setDetailDeal(data.deal)
    setNoteInput('')
    setNoteLoading(false)
    load()
  }

  const updateValue = async (dealId: string, value: number) => {
    await fetch(`/api/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimatedValue: value }),
    })
    load()
  }

  const wonDeals   = grouped['won']?.length ?? 0
  const totalDeals = stats.total

  return (
    <div style={{ minHeight: '100vh', color: '#FAFAFA' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>Deal Pipeline</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          Track every pitched lead from first contact to closed deal
        </p>
      </div>

      {/* Revenue stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { icon: <Target size={14} />,      label: 'Total Deals',    value: totalDeals.toString(),                     color: '#FAFAFA' },
          { icon: <TrendingUp size={14} />,  label: 'Active Pipeline', value: formatCurrency(stats.pipeline),            color: '#60a5fa' },
          { icon: <Trophy size={14} />,      label: 'Revenue Won',    value: formatCurrency(stats.wonRevenue),           color: '#4ade80' },
          { icon: <DollarSign size={14} />,  label: 'Deals Won',      value: `${wonDeals} deal${wonDeals !== 1 ? 's' : ''}`, color: '#f59e0b' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ color: 'rgba(255,255,255,0.35)' }}>{icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: '-0.03em' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div style={{
        display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16,
        WebkitOverflowScrolling: 'touch',
      }}>
        {STAGES.map(({ key: stage, label, color, emoji }) => {
          const col = grouped[stage] ?? []
          return (
            <div
              key={stage}
              style={{
                minWidth: 240, width: 240, flexShrink: 0,
                background: 'rgba(12,12,20,0.85)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
                display: 'flex', flexDirection: 'column', maxHeight: 700,
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const id = (e as React.DragEvent).dataTransfer.getData('dealId')
                if (id) moveStage(id, stage)
                setDraggingId(null)
              }}
            >
              {/* Column header */}
              <div style={{
                padding: '14px 16px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  borderRadius: 20, padding: '2px 8px',
                }}>
                  {col.length}
                </div>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                  {col.map(deal => (
                    <div
                      key={deal._id}
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData('dealId', deal._id)
                        setDraggingId(deal._id)
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => setDetailDeal(deal)}
                      style={{ cursor: 'grab' }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                          background: draggingId === deal._id ? 'rgba(196,20,37,0.1)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${draggingId === deal._id ? 'rgba(196,20,37,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: 10, padding: '12px',
                          transition: 'border 0.15s, background 0.15s',
                        }}
                      >
                      {/* Business name */}
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA', marginBottom: 4, lineHeight: 1.3 }}>
                        {deal.businessName}
                      </div>

                      {deal.businessLocation && (
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                          {deal.businessLocation}
                        </div>
                      )}

                      {/* Value */}
                      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 8 }}>
                        {formatCurrency(deal.estimatedValue, deal.currency)}
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                          {daysSince(deal.pitchedAt ?? deal.createdAt)}
                        </div>
                        {deal.channel && (
                          <div style={{
                            padding: '2px 6px', borderRadius: 4,
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.5)', fontSize: 10,
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}>
                            {CHANNEL_ICONS[deal.channel]} {deal.channel}
                          </div>
                        )}
                      </div>

                      {/* Notes indicator */}
                      {deal.notes?.length > 0 && (
                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                          <StickyNote size={9} /> {deal.notes.length} note{deal.notes.length > 1 ? 's' : ''}
                        </div>
                      )}
                      </motion.div>
                    </div>
                  ))}
                </AnimatePresence>

                {col.length === 0 && (
                  <div style={{ padding: '20px 10px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Deal Detail Panel */}
      <AnimatePresence>
        {detailDeal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetailDeal(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 900 }}
            />
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw',
                background: 'rgba(8,8,14,0.98)', backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                zIndex: 910, display: 'flex', flexDirection: 'column',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Panel header */}
              <div style={{ padding: '22px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#E5484D', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Deal Detail</div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#FAFAFA' }}>{detailDeal.businessName}</h2>
                    {detailDeal.businessLocation && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{detailDeal.businessLocation}</div>}
                  </div>
                  <button
                    onClick={() => setDetailDeal(null)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
                {/* Stage selector */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Stage</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {STAGES.map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => moveStage(detailDeal._id, key)}
                        style={{
                          padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                          background: detailDeal.stage === key ? `${color}20` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${detailDeal.stage === key ? `${color}50` : 'rgba(255,255,255,0.08)'}`,
                          color: detailDeal.stage === key ? color : 'rgba(255,255,255,0.4)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated value */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Estimated Value</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      defaultValue={detailDeal.estimatedValue}
                      onChange={e => setValueInput(e.target.value)}
                      placeholder='0'
                      type='number'
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, padding: '9px 12px', color: '#FAFAFA', fontSize: 14, fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => valueInput && updateValue(detailDeal._id, Number(valueInput))}
                      style={{
                        padding: '9px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        background: 'rgba(196,20,37,0.2)', border: '1px solid rgba(196,20,37,0.35)', color: '#ff4455',
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Channel */}
                {detailDeal.channel && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Reached via</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                      {CHANNEL_ICONS[detailDeal.channel]} {detailDeal.channel}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Timeline</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    Pitched: {detailDeal.pitchedAt ? new Date(detailDeal.pitchedAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Notes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                    {detailDeal.notes?.map((note, i) => (
                      <div key={i} style={{
                        padding: '10px 12px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                      }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 4, lineHeight: 1.6 }}>{note.text}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{new Date(note.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                    {(!detailDeal.notes || detailDeal.notes.length === 0) && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No notes yet</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <textarea
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder='Add a note...'
                      rows={2}
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, padding: '9px 12px', color: '#FAFAFA', fontSize: 12,
                        outline: 'none', resize: 'none', fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={addNote}
                      disabled={!noteInput.trim() || noteLoading}
                      style={{
                        padding: '9px 14px', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-end',
                        background: noteInput.trim() ? 'rgba(196,20,37,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${noteInput.trim() ? 'rgba(196,20,37,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        color: noteInput.trim() ? '#ff4455' : 'rgba(255,255,255,0.3)',
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Move stage quick actions */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick Actions</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { moveStage(detailDeal._id, 'won'); setDetailDeal(d => d ? { ...d, stage: 'won' } : null) }}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80',
                      }}
                    >
                      🎉 Mark Won
                    </button>
                    <button
                      onClick={() => { moveStage(detailDeal._id, 'lost'); setDetailDeal(d => d ? { ...d, stage: 'lost' } : null) }}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.3)', color: '#9ca3af',
                      }}
                    >
                      Mark Lost
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        ::-webkit-scrollbar { width:4px; height:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.25) }
        textarea:focus, input:focus { border-color: rgba(196,20,37,0.4) !important; }
      `}</style>
    </div>
  )
}
