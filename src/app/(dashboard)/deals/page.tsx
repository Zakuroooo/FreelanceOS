'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, MessageCircle, Link2, Camera, TrendingUp, DollarSign, Target, Trophy, StickyNote, AlertCircle, RefreshCw, AlarmClock, Download, Send, Calendar, FileText, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { daysSince, formatCurrency } from '@/lib/format'
import { downloadCsv, todayStamp } from '@/lib/csv'
import { PageHeader, GhostButton } from '@/components/ui/kit'

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

/**
 * Follow-up triage for a card. Returns null when there is nothing to nudge about:
 * closed deals, no date set, or a date more than 3 days out. Overdue = amber,
 * upcoming (≤3 days) = blue.
 */
function followUpState(deal: Deal): { text: string; action?: string; overdue: boolean } | null {
  if (deal.stage === 'won' || deal.stage === 'lost') return null
  if (!deal.nextActionDate) return null
  const due = new Date(deal.nextActionDate).getTime()
  if (!Number.isFinite(due)) return null
  const diffDays = Math.floor((Date.now() - due) / 86400000)
  if (diffDays < -3) return null
  const label = diffDays >= 1 ? `${diffDays}d overdue` : diffDays === 0 || diffDays < 0 ? 'Today' : `${-diffDays}d`
  return { text: label, action: deal.nextAction?.slice(0, 40), overdue: diffDays >= 0 }
}

const STAGES: Array<{ key: Stage; label: string; color: string; Icon: typeof Send }> = [
  { key: 'pitched',   label: 'Pitched',    color: '#60a5fa', Icon: Send          },
  { key: 'responded', label: 'Responded',  color: '#a78bfa', Icon: MessageCircle },
  { key: 'meeting',   label: 'Meeting',    color: '#f59e0b', Icon: Calendar      },
  { key: 'proposal',  label: 'Proposal',   color: '#fb923c', Icon: FileText      },
  { key: 'won',       label: 'Won',        color: '#4ade80', Icon: Trophy        },
  { key: 'lost',      label: 'Lost',       color: '#6b7280', Icon: XCircle       },
]

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email:     <Mail size={10} />,
  whatsapp:  <MessageCircle size={10} />,
  linkedin:  <Link2 size={10} />,
  instagram: <Camera size={10} />,
}

export default function DealsPage() {
  const [grouped, setGrouped]       = useState<Record<Stage, Deal[]>>({} as Record<Stage, Deal[]>)
  const [stats, setStats]           = useState({ total: 0, pipeline: 0, wonRevenue: 0 })
  const [loading, setLoading]       = useState(true)
  const [loadError, setLoadError]   = useState('')
  const [detailDeal, setDetailDeal] = useState<Deal | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [noteInput, setNoteInput]   = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [valueInput, setValueInput] = useState('')
  const [actionInput, setActionInput]     = useState('')
  const [actionDateInput, setactionDateInput] = useState('')
  // When a deal is marked won we ask for what it actually closed at — revenue
  // stats prefer `wonValue`, but nothing ever collected it.
  const [wonPrompt, setWonPrompt]   = useState<{ dealId: string; name: string } | null>(null)
  const [wonValueInput, setWonValueInput] = useState('')

  // Event-handler reload (Retry button). The mount effect below mirrors this logic
  // as a promise chain, since synchronous setState inside an effect body causes
  // cascading renders.
  const load = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res  = await fetch('/api/deals')
      if (!res.ok) throw new Error(`Failed to load deals (${res.status})`)
      const data = await res.json()
      setGrouped(data.grouped ?? {})
      setStats(data.stats ?? { total: 0, pipeline: 0, wonRevenue: 0 })
    } catch (err) {
      // An empty board used to be indistinguishable from a failed fetch
      setLoadError(err instanceof Error ? err.message : 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetch('/api/deals')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load deals (${res.status})`)
        return res.json()
      })
      .then(data => {
        if (!active) return
        setGrouped(data.grouped ?? {})
        setStats(data.stats ?? { total: 0, pipeline: 0, wonRevenue: 0 })
      })
      .catch((err: unknown) => {
        if (active) setLoadError(err instanceof Error ? err.message : 'Failed to load deals')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const moveStage = async (dealId: string, newStage: Stage) => {
    // Snapshot the previous grouping so a failed PATCH can roll the card back —
    // it used to sit in the new stage until a full reload while the DB kept the old one.
    let previous: Record<Stage, Deal[]> | null = null
    setGrouped(prev => {
      previous = prev
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

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (!res.ok) throw new Error(`Move failed (${res.status})`)
      if (detailDeal?._id === dealId) setDetailDeal(d => d ? { ...d, stage: newStage } : null)
    } catch (err) {
      if (previous) setGrouped(previous)
      toast.error(err instanceof Error ? err.message : 'Failed to move deal')
    }
  }

  const addNote = async () => {
    if (!detailDeal || !noteInput.trim()) return
    setNoteLoading(true)
    try {
      const res  = await fetch(`/api/deals/${detailDeal._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.deal) throw new Error(data.error || `Failed to add note (${res.status})`)
      // Setting the raw response used to crash when an error body had no `deal`
      setDetailDeal(data.deal)
      setNoteInput('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add note')
    } finally {
      setNoteLoading(false)
    }
  }

  const updateValue = async (dealId: string, value: number) => {
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimatedValue: value }),
      })
      const data = await res.json()
      if (!res.ok || !data.deal) throw new Error(data.error || `Failed to update value (${res.status})`)
      // Keep the open panel in sync — it used to show the stale value until reopened
      setDetailDeal((d: Deal | null) => (d && d._id === dealId ? data.deal : d))
      setValueInput('')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update value')
    }
  }

  // Saves the follow-up reminder. An empty date with an action keeps just the text;
  // both empty is blocked by the button's disabled state.
  const saveNextAction = async (dealId: string, action?: string, date?: string) => {
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextAction: action,
          ...(date ? { nextActionDate: new Date(`${date}T12:00:00`).toISOString() } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.deal) throw new Error(data.error || `Failed to save reminder (${res.status})`)
      setDetailDeal((d: Deal | null) => (d && d._id === dealId ? data.deal : d))
      setActionInput('')
      setactionDateInput('')
      toast.success(action && date ? 'Reminder saved' : date ? 'Reminder date saved' : 'Action saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save reminder')
    }
  }

  // Stage change entry point — intercepting `won` lets us capture the real closed value.
  const changeStage = (dealId: string, newStage: Stage) => {
    const deal = detailDeal?._id === dealId
      ? detailDeal
      : Object.values(grouped).flat().find(d => d._id === dealId)
    if (newStage === 'won') {
      setWonPrompt({ dealId, name: deal?.businessName ?? 'this deal' })
      return
    }
    moveStage(dealId, newStage)
  }

  const confirmWon = async () => {
    if (!wonPrompt) return
    const value = Number(wonValueInput)
    setWonPrompt(null)
    setWonValueInput('')
    if (!wonValueInput || !Number.isFinite(value)) {
      await moveStage(wonPrompt.dealId, 'won')
      return
    }
    // Optimistic move + wonValue in one PATCH; rollback lives in moveStage's catch,
    // so here we only handle the combined call's failure.
    try {
      const res = await fetch(`/api/deals/${wonPrompt.dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'won', wonValue: value }),
      })
      const data = await res.json()
      if (!res.ok || !data.deal) throw new Error(data.error || `Failed to close deal (${res.status})`)
      setGrouped(prev => {
        const next: Record<Stage, Deal[]> = {} as Record<Stage, Deal[]>
        STAGES.forEach(s => { next[s.key] = (prev[s.key] ?? []).filter(d => d._id !== wonPrompt.dealId) })
        next.won = [...(next.won ?? []), data.deal]
        return next
      })
      setDetailDeal((d: Deal | null) => (d && d._id === wonPrompt.dealId ? data.deal : d))
      toast.success(`Won at ${formatCurrency(value)} — added to revenue`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to close deal')
      load()
    }
  }

  const wonDeals   = grouped['won']?.length ?? 0
  const totalDeals = stats.total

  const allDealRows = Object.values(grouped).flat()

  const exportCsv = () => {
    if (allDealRows.length === 0) return
    downloadCsv(
      `freelanceos-pipeline-${todayStamp()}.csv`,
      ['Business', 'Location', 'Stage', 'Estimated Value', 'Won Value', 'Currency', 'Channel', 'Next Action', 'Next Action Date', 'Notes', 'Pitched At', 'Created'],
      allDealRows.map(d => [
        d.businessName, d.businessLocation ?? '', d.stage,
        d.estimatedValue, d.wonValue ?? '', d.currency,
        d.channel ?? '', d.nextAction ?? '',
        d.nextActionDate ? new Date(d.nextActionDate).toISOString().slice(0, 10) : '',
        (d.notes ?? []).map(n => n.text).join(' | '),
        d.pitchedAt ? new Date(d.pitchedAt).toISOString().slice(0, 10) : '',
        new Date(d.createdAt).toISOString().slice(0, 10),
      ])
    )
    toast.success(`Exported ${allDealRows.length} deals`)
  }

  return (
    <div style={{ minHeight: '100vh', color: '#FAFAFA' }}>
      <PageHeader
        eyebrow="Pipeline"
        title="Deal Pipeline"
        subtitle="Track every pitched lead from first contact to closed deal"
        actions={allDealRows.length > 0 ? (
          <GhostButton onClick={exportCsv} title="Download the full pipeline as CSV">
            <Download size={13} /> Export CSV
          </GhostButton>
        ) : undefined}
      />

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

      {/* Load error — an empty board used to be indistinguishable from a failed fetch */}
      {loadError && (
        <div style={{
          marginBottom: 24, padding: '14px 20px', borderRadius: 12,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={16} color='#ef4444' />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{loadError}</span>
          </div>
          <button
            onClick={() => load()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Loading strip */}
      {!loadError && loading && (
        <div style={{
          marginBottom: 24, padding: '12px 20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.45)',
        }}>
          <RefreshCw size={13} style={{ animation: 'deal-spin 1s linear infinite' }} />
          Loading pipeline…
        </div>
      )}

      {/* Kanban */}
      <div style={{
        display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16,
        WebkitOverflowScrolling: 'touch',
      }}>
        {STAGES.map(({ key: stage, label, color, Icon: StageIcon }) => {
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
                if (id) changeStage(id, stage)
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
                  <StageIcon size={14} color={color} strokeWidth={2.2} />
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
                        className="deal-card"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.01 }}
                        style={{
                          background: draggingId === deal._id
                            ? 'rgba(196,20,37,0.1)'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.03))',
                          border: `1px solid ${draggingId === deal._id ? 'rgba(196,20,37,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: 12, padding: '13px',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.25)',
                          cursor: 'grab',
                          transition: 'border 0.15s, background 0.15s, box-shadow 0.15s',
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

                      {/* Follow-up badge — the whole point of a pipeline is knowing who to nudge */}
                      {followUpState(deal) !== null && (() => {
                        const fu = followUpState(deal)!
                        return (
                          <div style={{
                            marginTop: 8, display: 'flex', alignItems: 'center', gap: 4,
                            padding: '3px 7px', borderRadius: 5, width: 'fit-content',
                            fontSize: 10, fontWeight: 700,
                            color: fu.overdue ? '#f59e0b' : '#60a5fa',
                            background: fu.overdue ? 'rgba(245,158,11,0.1)' : 'rgba(96,165,250,0.1)',
                            border: `1px solid ${fu.overdue ? 'rgba(245,158,11,0.3)' : 'rgba(96,165,250,0.25)'}`,
                          }}>
                            <AlarmClock size={9} />
                            {fu.overdue ? 'Follow up' : 'Next'} · {fu.text}
                            {fu.action && <span style={{ fontWeight: 500, opacity: 0.75 }}>· {fu.action}</span>}
                          </div>
                        )
                      })()}
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
                        onClick={() => changeStage(detailDeal._id, key)}
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

                {/* Next action — the follow-up engine. Fields existed on the model
                    and PATCH long before any UI could set them. */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Next Action</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      defaultValue={detailDeal.nextAction}
                      onChange={e => setActionInput(e.target.value)}
                      placeholder='e.g. Call to confirm proposal'
                      type='text'
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, padding: '9px 12px', color: '#FAFAFA', fontSize: 13,
                        outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <AlarmClock size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                      <input
                        type='date'
                        defaultValue={detailDeal.nextActionDate ? new Date(detailDeal.nextActionDate).toISOString().slice(0, 10) : ''}
                        onChange={e => setactionDateInput(e.target.value)}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8, padding: '9px 12px', colorScheme: 'dark', color: '#FAFAFA', fontSize: 12,
                          outline: 'none',
                        }}
                      />
                      {detailDeal.nextActionDate && (
                        <button
                          onClick={() => saveNextAction(detailDeal._id, undefined, '')}
                          title='Clear reminder'
                          style={{
                            padding: '9px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.4)',
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => saveNextAction(detailDeal._id, actionInput.trim() || undefined, actionDateInput)}
                      disabled={!actionInput.trim() && !actionDateInput}
                      style={{
                        alignSelf: 'flex-end', padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                        fontSize: 12, fontWeight: 700,
                        background: (actionInput.trim() || actionDateInput) ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${(actionInput.trim() || actionDateInput) ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        color: (actionInput.trim() || actionDateInput) ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      Save reminder
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
                      onClick={() => changeStage(detailDeal._id, 'won')}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80',
                      }}
                    >
                      <Trophy size={12} style={{ display: 'inline' }} /> Mark Won
                    </button>
                    <button
                      onClick={() => changeStage(detailDeal._id, 'lost')}
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

      {/* Won-value prompt — captures what the deal actually closed at */}
      <AnimatePresence>
        {wonPrompt && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)', zIndex: 1100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => setWonPrompt(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'rgba(10,10,16,0.98)', border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: 16, padding: 28, width: 380,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <Trophy size={24} color='#4ade80' />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA', marginBottom: 8 }}>
                Close {wonPrompt.name} as won
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                What did it actually close at? This is what your revenue stats will count.
              </div>
              <input
                autoFocus
                value={wonValueInput}
                onChange={e => setWonValueInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmWon() }}
                placeholder='0'
                type='number'
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8,
                  padding: '11px 12px', color: '#FAFAFA', fontSize: 18, fontWeight: 700,
                  outline: 'none', boxSizing: 'border-box', marginBottom: 20,
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setWonPrompt(null)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmWon}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)',
                    color: '#4ade80', fontWeight: 700, fontSize: 13,
                  }}
                >
                  Mark Won
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .deal-card:hover { border-color: rgba(255,255,255,0.16) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4) !important; }
        @keyframes deal-spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width:4px; height:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.25) }
        textarea:focus, input:focus { border-color: rgba(196,20,37,0.4) !important; }
      `}</style>
    </div>
  )
}
