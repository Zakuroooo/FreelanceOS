'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, MessageCircle, Link2, Camera,
  Search, CheckCircle, RefreshCw,
  Zap, Trash2, Eye, Send,
  Wifi, WifiOff,
} from 'lucide-react'
// Link2 as LinkedIn icon, Camera as Instagram icon
const LinkedinIcon = Link2
const InstagramIcon = Camera

import SendModal from '@/components/pitches/SendModal'
import PitchPreviewPanel from '@/components/pitches/PitchPreviewPanel'

interface PitchData {
  _id: string
  businessName: string
  businessLocation?: string
  businessEmail?: string
  businessPhone?: string
  businessInstagram?: string
  businessLinkedin?: string
  emailSubject?: string
  emailBody?: string
  whatsappMsg?: string
  linkedinDm?: string
  instagramDm?: string
  qualityScore?: number
  overallStatus: 'draft' | 'sent' | 'replied' | 'approved'
  sentChannels: {
    email?: { sentAt: string; status: string }
    whatsapp?: { sentAt: string; status: string }
    linkedin?: { sentAt: string; status: string }
    instagram?: { sentAt: string; status: string }
  }
  createdAt: string
}

interface GmailStatus {
  connected: boolean
  gmailAddress?: string
  connectedAt?: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hrs > 0)  return `${hrs}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

const STATUS_CONFIG = {
  draft:    { label: 'Draft',   color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.06)' },
  sent:     { label: 'Sent',    color: '#4ade80',                bg: 'rgba(74,222,128,0.12)'  },
  replied:  { label: 'Replied', color: '#60a5fa',                bg: 'rgba(96,165,250,0.12)'  },
  approved: { label: 'Approved',color: '#a78bfa',                bg: 'rgba(167,139,250,0.12)' },
}

function ChannelDots({ sentChannels }: { sentChannels: PitchData['sentChannels'] }) {
  const channels = [
    { key: 'email',     Icon: Mail,          label: 'Email'     },
    { key: 'whatsapp',  Icon: MessageCircle, label: 'WhatsApp'  },
    { key: 'linkedin',  Icon: LinkedinIcon,  label: 'LinkedIn'  },
    { key: 'instagram', Icon: InstagramIcon, label: 'Instagram' },
  ] as const

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {channels.map(({ key, Icon, label }) => {
        const ch = sentChannels?.[key]
        const sent = !!ch
        return (
          <div
            key={key}
            title={sent ? `${label}: ${ch.status}` : `${label}: not sent`}
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: sent ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${sent ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon size={11} color={sent ? '#4ade80' : 'rgba(255,255,255,0.2)'} />
          </div>
        )
      })}
    </div>
  )
}

export default function PitchesPage() {
  const [pitches, setPitches]         = useState<PitchData[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null)
  const [selectedPitch, setSelectedPitch] = useState<PitchData | null>(null)
  const [previewPitch, setPreviewPitch]   = useState<PitchData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadPitches = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res  = await fetch(`/api/pitches?${params}`)
      const data = await res.json()
      setPitches(data.pitches ?? [])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { loadPitches() }, [loadPitches])

  useEffect(() => {
    fetch('/api/gmail/status').then(r => r.json()).then(setGmailStatus)
  }, [])

  const deletePitch = async (id: string) => {
    await fetch(`/api/pitches/${id}`, { method: 'DELETE' })
    setPitches(prev => prev.filter(p => p._id !== id))
    setDeleteConfirm(null)
    showToast('Pitch deleted')
  }

  const filtered = pitches.filter(p => {
    const q = search.toLowerCase()
    return p.businessName.toLowerCase().includes(q) || (p.businessLocation ?? '').toLowerCase().includes(q)
  })

  const stats = {
    total:   pitches.length,
    sent:    pitches.filter(p => p.overallStatus === 'sent' || p.overallStatus === 'replied').length,
    replied: pitches.filter(p => p.overallStatus === 'replied').length,
  }

  return (
    <div style={{ minHeight: '100vh', color: '#FAFAFA' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: 24, left: '50%',
              background: toast.type === 'success' ? 'rgba(74,222,128,0.95)' : 'rgba(239,68,68,0.95)',
              color: '#000', padding: '10px 20px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, zIndex: 9999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gmail Banner */}
      <AnimatePresence>
        {gmailStatus !== null && !gmailStatus.connected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              background: 'linear-gradient(135deg, rgba(196,20,37,0.15), rgba(196,20,37,0.08))',
              border: '1px solid rgba(196,20,37,0.3)',
              borderRadius: 12, padding: '14px 20px', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <WifiOff size={16} color='#E5484D' />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                Connect your Gmail to send pitches automatically from your own email
              </span>
            </div>
            <a
              href='/api/gmail/connect'
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                background: 'rgba(196,20,37,0.3)', border: '1px solid rgba(196,20,37,0.5)',
                color: '#ff4455', fontSize: 12, fontWeight: 700,
                textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Zap size={12} /> Connect Gmail →
            </a>
          </motion.div>
        )}
        {gmailStatus?.connected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              background: 'rgba(74,222,128,0.06)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 12, padding: '12px 20px', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wifi size={14} color='#4ade80' />
              <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 500 }}>
                Sending from: {gmailStatus.gmailAddress}
              </span>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/gmail/disconnect', { method: 'DELETE' })
                setGmailStatus({ connected: false })
                showToast('Gmail disconnected')
              }}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)', fontSize: 11, padding: '4px 10px',
                borderRadius: 6, cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', margin: 0, color: '#FAFAFA' }}>
          Pitch Command Center
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          Every AI-generated pitch, ready to send across any channel
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Pitches', value: stats.total, color: '#FAFAFA' },
          { label: 'Sent',          value: stats.sent,  color: '#4ade80' },
          { label: 'Replied',       value: stats.replied, color: '#60a5fa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '16px 24px', minWidth: 120,
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: '-0.04em' }}>{value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search pitches...'
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              padding: '10px 12px 10px 36px', color: '#FAFAFA', fontSize: 13,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'draft', 'sent', 'replied'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '8px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: statusFilter === s ? 'rgba(196,20,37,0.25)' : 'rgba(255,255,255,0.05)',
                color:      statusFilter === s ? '#ff4455' : 'rgba(255,255,255,0.5)',
                border:     statusFilter === s ? '1px solid rgba(196,20,37,0.4)' : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={loadPitches}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '9px 12px', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(12,12,20,0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 140px 90px 140px',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {['Business', 'Generated', 'Channels', 'Status', 'Actions'].map(col => (
            <div key={col} style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <div>Loading pitches...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✍️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
              {pitches.length === 0 ? 'No pitches yet' : 'No pitches match your filter'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
              {pitches.length === 0 ? 'Discover leads and generate your first AI pitch' : 'Try adjusting your search or filter'}
            </div>
            {pitches.length === 0 && (
              <a
                href='/discover'
                style={{
                  display: 'inline-block', padding: '10px 20px', borderRadius: 8,
                  background: 'rgba(196,20,37,0.2)', border: '1px solid rgba(196,20,37,0.4)',
                  color: '#ff4455', textDecoration: 'none', fontSize: 13, fontWeight: 600,
                }}
              >
                → Discover Leads
              </a>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((pitch, idx) => (
              <PitchRow
                key={pitch._id}
                pitch={pitch}
                onSend={() => setSelectedPitch(pitch)}
                onPreview={() => setPreviewPitch(pitch)}
                onDelete={() => setDeleteConfirm(pitch._id)}
                delay={idx * 0.03}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* SendModal */}
      <AnimatePresence>
        {selectedPitch && (
          <SendModal
            pitch={selectedPitch}
            gmailAddress={gmailStatus?.gmailAddress ?? null}
            onClose={() => {
              setSelectedPitch(null)
              loadPitches()
            }}
            onSuccess={msg => showToast(msg)}
          />
        )}
      </AnimatePresence>

      {/* Preview panel */}
      <AnimatePresence>
        {previewPitch && (
          <PitchPreviewPanel
            pitch={previewPitch}
            onClose={() => setPreviewPitch(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'rgba(10,10,16,0.98)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 16, padding: 28, width: 360,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 12 }}>🗑️</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Delete this pitch?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                This action cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deletePitch(deleteConfirm)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                    color: '#ef4444', fontWeight: 700, fontSize: 13,
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder { color: rgba(255,255,255,0.25) }
        input:focus { border-color: rgba(196,20,37,0.4) !important; }
      `}</style>
    </div>
  )
}

function PitchRow({ pitch, onSend, onPreview, onDelete, delay }: {
  pitch: PitchData
  onSend: () => void
  onPreview: () => void
  onDelete: () => void
  delay: number
}) {
  const [hovered, setHovered] = useState(false)
  const cfg = STATUS_CONFIG[pitch.overallStatus] ?? STATUS_CONFIG.draft

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 100px 140px 90px 140px',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: hovered ? 'rgba(255,255,255,0.025)' : 'transparent',
        transition: 'background 0.15s',
        alignItems: 'center',
      }}
    >
      {/* Business */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA', marginBottom: 2 }}>
          {pitch.businessName}
        </div>
        {pitch.businessLocation && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{pitch.businessLocation}</div>
        )}
      </div>

      {/* Date */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
        {timeAgo(pitch.createdAt)}
      </div>

      {/* Channels */}
      <ChannelDots sentChannels={pitch.sentChannels} />

      {/* Status */}
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '4px 10px', borderRadius: 20,
        background: cfg.bg, color: cfg.color,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
        width: 'fit-content',
      }}>
        {cfg.label}
      </div>

      {/* Actions */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.3 }}
        style={{ display: 'flex', gap: 6 }}
      >
        <ActionBtn icon={<Send size={12} />} label='Send'    onClick={onSend}    color='#C41425' />
        <ActionBtn icon={<Eye size={12} />}  label='Preview' onClick={onPreview} />
        <ActionBtn icon={<Trash2 size={12} />} label='Delete' onClick={onDelete} danger />
      </motion.div>
    </motion.div>
  )
}

function ActionBtn({ icon, label, onClick, color, danger }: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
  danger?: boolean
}) {
  const [h, setH] = useState(false)
  return (
    <button
      onClick={onClick}
      title={label}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h
          ? danger ? 'rgba(239,68,68,0.2)' : color ? `rgba(196,20,37,0.2)` : 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${h ? (danger ? 'rgba(239,68,68,0.4)' : color ? 'rgba(196,20,37,0.4)' : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
        color: h ? (danger ? '#ef4444' : color ?? '#FAFAFA') : 'rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {icon}
    </button>
  )
}
