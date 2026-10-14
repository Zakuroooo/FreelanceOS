'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageCircle, Link2, Camera, X, Send, ExternalLink, Copy, Check, Zap, AlertCircle } from 'lucide-react'
import { copyText, claimPopup, navigatePopup } from '@/lib/handoff'
const LinkedinIcon = Link2
const InstagramIcon = Camera


interface PitchData {
  _id: string
  businessName: string
  businessEmail?: string
  businessEmailConfidence?: string
  businessPhone?: string
  businessInstagram?: string
  businessLinkedin?: string
  emailSubject?: string
  emailBody?: string
  whatsappMsg?: string
  linkedinDm?: string
  instagramDm?: string
  overallStatus: string
  sentChannels: Record<string, { sentAt: string; status: string } | undefined>
}

interface Props {
  pitch: PitchData
  /** True when ANY transport (Gmail or SMTP) is live — not Gmail-specific. */
  emailReady: boolean
  emailFrom: string | null
  onClose: () => void
  onSuccess: (msg: string) => void
}

type ChannelState = 'idle' | 'loading' | 'success' | 'error'

export default function SendModal({ pitch, emailReady, emailFrom, onClose, onSuccess }: Props) {
  const [emailState, setEmailState]   = useState<ChannelState>('idle')
  const [waState, setWaState]         = useState<ChannelState>('idle')
  const [liState, setLiState]         = useState<ChannelState>('idle')
  const [igState, setIgState]         = useState<ChannelState>('idle')
  const [copiedKey, setCopiedKey]     = useState<string | null>(null)
  const [errorMsg, setErrorMsg]       = useState<string>('')
  /** The message text stays visible so manual copy is ALWAYS possible. */
  const [manualCopy, setManualCopy]   = useState<{ key: string; text: string; ok: boolean } | null>(null)

  // Copy with explicit success/failure — the old silent catch is what produced
  // "half-copied" reports: the toast lied while the clipboard write had failed.
  const copyReliably = async (text: string, key: string) => {
    const { ok } = await copyText(text)
    setCopiedKey(ok ? key : null)
    setManualCopy({ key, text, ok })
    return ok
  }

  const sendEmail = async () => {
    if (!pitch.businessEmail) return
    setEmailState('loading')
    setErrorMsg('')
    try {
      const res  = await fetch('/api/outreach/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch._id, toEmail: pitch.businessEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailState('error')
        setErrorMsg(data.error ?? 'Send failed')
        if (data.action === 'connect_email') {
          setErrorMsg(`${data.error ?? 'No mailbox connected.'} Fastest fix: Settings → SMTP — works instantly with any email provider.`)
          if (data.action === 'connect_gmail') {
            setTimeout(() => window.location.href = '/api/gmail/connect', 2500)
          }
        }
      } else {
        setEmailState('success')
        onSuccess(`Email sent to ${pitch.businessEmail}`)
      }
    } catch {
      setEmailState('error')
      setErrorMsg('Network error')
    }
  }

  // Popup blockers kill window.open after an await — claim the tab synchronously
  // inside the click, then navigate it once the URL is ready.
  const openWhatsApp = async () => {
    if (!pitch.businessPhone) return
    setWaState('loading')
    const tab = claimPopup()
    try {
      const res  = await fetch('/api/outreach/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch._id, phone: pitch.businessPhone }),
      })
      const data = await res.json()
      if (res.ok && data.waUrl) {
        const opened = tab ? navigatePopup(tab, data.waUrl) : false
        if (!opened) {
          // Blocked even on direct click — surface a real link instead of lying.
          window.open(data.waUrl, '_blank') ?? setManualCopy({ key: 'wa-fallback', text: data.waUrl, ok: false })
        }
        setWaState('success')
        onSuccess('WhatsApp opened with pitch pre-filled — press Send in WhatsApp')
      } else if (tab) {
        tab.close()
        setWaState('error')
      } else {
        setWaState('error')
      }
    } catch {
      tab?.close()
      setWaState('error')
    }
  }

  const openLinkedIn = async () => {
    setLiState('loading')
    try {
      const res  = await fetch('/api/outreach/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch._id, linkedinUrl: pitch.businessLinkedin }),
      })
      const data = await res.json()
      if (res.ok) {
        // Copy FIRST and verify it actually landed before opening anything.
        const copied = await copyReliably(data.message, 'li')
        const tab = claimPopup()
        if (data.profileUrl) {
          const opened = tab ? navigatePopup(tab, data.profileUrl) : false
          if (!opened && data.profileUrl) window.open(data.profileUrl, '_blank')
        } else {
          tab?.close()
        }
        setLiState(copied ? 'success' : 'error')
        if (!copied) setErrorMsg('Automatic copy was blocked by the browser — use the message box below to copy manually.')
        else onSuccess('Message copied — paste it in the LinkedIn chat that just opened')
      } else {
        setLiState('error')
      }
    } catch {
      setLiState('error')
    }
  }

  const openInstagram = async () => {
    setIgState('loading')
    try {
      const res  = await fetch('/api/outreach/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch._id, instagramHandle: pitch.businessInstagram }),
      })
      const data = await res.json()
      if (res.ok) {
        const copied = await copyReliably(data.message, 'ig')
        const tab = claimPopup()
        if (data.profileUrl) {
          const opened = tab ? navigatePopup(tab, data.profileUrl) : false
          if (!opened && data.profileUrl) window.open(data.profileUrl, '_blank')
        } else {
          tab?.close()
        }
        setIgState(copied ? 'success' : 'error')
        if (!copied) setErrorMsg('Automatic copy was blocked by the browser — use the message box below to copy manually.')
        else onSuccess('Message copied — paste it in the Instagram DM that just opened')
      } else {
        setIgState('error')
      }
    } catch {
      setIgState('error')
    }
  }

  const channels = [
    {
      key:       'email',
      Icon:      Mail,
      label:     'Email',
      color:     '#60a5fa',
      available: !!pitch.businessEmail,
      info:      pitch.businessEmail
        ? `${pitch.businessEmail}${pitch.businessEmailConfidence === 'guessed' ? '  ·  unverified guess — confirm before sending' : ''}${emailFrom ? `  ·  via ${emailFrom}` : ''}`
        : 'No email found for this business',
      state:     emailState,
      action:    sendEmail,
      actionLabel: 'Send Email Now',
      actionIcon:  Send,
      disabled:  !pitch.businessEmail || !emailReady || emailState === 'success',
      extra: !emailReady ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <a
            href='/api/gmail/connect'
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 8,
              background: 'linear-gradient(135deg, #C41425, #E5484D)',
              border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <Zap size={11} /> Connect Gmail — one tap →
          </a>
          <a
            href='/settings'
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 500,
              textDecoration: 'none',
            }}
            title='Works instantly with any provider while Gmail verification is pending'
          >
            SMTP
          </a>
        </div>
      ) : null,
    },
    {
      key:       'whatsapp',
      Icon:      MessageCircle,
      label:     'WhatsApp',
      color:     '#4ade80',
      available: !!pitch.businessPhone,
      info:      pitch.businessPhone ?? 'No phone number found',
      state:     waState,
      action:    openWhatsApp,
      actionLabel: 'Open WhatsApp ↗',
      actionIcon:  ExternalLink,
      disabled:  !pitch.businessPhone || waState === 'success',
      extra: null,
    },
    {
      key:       'linkedin',
      Icon:      Link2,
      label:     'LinkedIn',
      color:     '#60a5fa',
      available: !!pitch.businessLinkedin,
      info:      pitch.businessLinkedin ?? 'No LinkedIn found',
      state:     liState,
      action:    openLinkedIn,
      actionLabel: 'Copy + Open Profile ↗',
      actionIcon:  Copy,
      disabled:  liState === 'success',
      extra: null,
    },
    {
      key:       'instagram',
      Icon:      Camera,
      label:     'Instagram',
      color:     '#e879f9',
      available: !!pitch.businessInstagram,
      info:      pitch.businessInstagram ? `@${pitch.businessInstagram.replace('@', '')}` : 'No Instagram found',
      state:     igState,
      action:    openInstagram,
      actionLabel: 'Copy + Open DM ↗',
      actionIcon:  Copy,
      disabled:  igState === 'success',
      extra: null,
    },
  ]

  const StateIcon = ({ state }: { state: ChannelState }) => {
    if (state === 'loading') return <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
    if (state === 'success') return <Check size={14} color='#4ade80' />
    if (state === 'error')   return <AlertCircle size={14} color='#ef4444' />
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
          background: 'rgba(8,8,14,0.98)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#E5484D', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              Send Pitch
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: '#FAFAFA' }}>
              {pitch.businessName}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            margin: '12px 24px 0', padding: '10px 14px', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            fontSize: 12, color: '#ef4444', display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <AlertCircle size={12} /> {errorMsg}
          </div>
        )}

        {/* Manual-copy box — the guaranteed fallback when browser clipboard is blocked */}
        {manualCopy && (
          <div style={{
            margin: '12px 24px 0', padding: '12px 14px', borderRadius: 8,
            background: manualCopy.ok ? 'rgba(74,222,128,0.06)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${manualCopy.ok ? 'rgba(74,222,128,0.25)' : 'rgba(245,158,11,0.35)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: manualCopy.ok ? '#4ade80' : '#f59e0b' }}>
                {manualCopy.ok ? 'Copied to clipboard — paste it in the opened app' : 'Auto-copy blocked — select all and copy manually'}
              </span>
              <button
                onClick={async () => {
                  const { ok } = await copyText(manualCopy.text)
                  setManualCopy({ ...manualCopy, ok })
                }}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 5, padding: '3px 8px', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600 }}
              >
                Copy again
              </button>
            </div>
            {!manualCopy.ok && (
              <textarea
                readOnly
                value={manualCopy.text}
                onFocus={e => e.currentTarget.select()}
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'vertical',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: 8, color: 'rgba(255,255,255,0.8)',
                  fontSize: 11, fontFamily: 'inherit',
                }}
              />
            )}
          </div>
        )}

        {/* Channels */}
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {channels.map(({ key, Icon, label, color, available, info, state, action, actionLabel, actionIcon: ActionIcon, disabled, extra }) => (
            <div
              key={key}
              style={{
                border: `1px solid ${state === 'success' ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, padding: '16px',
                background: state === 'success' ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.03)',
                opacity: !available && key !== 'linkedin' && key !== 'instagram' ? 0.5 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={13} color={color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{label}</span>
                </div>
                <StateIcon state={state} />
              </div>

              <div style={{ fontSize: 12, color: available ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)', marginBottom: 12, fontFamily: 'monospace' }}>
                {info}
              </div>

              <motion.button
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
                onClick={!disabled ? action : undefined}
                disabled={disabled || state === 'loading'}
                style={{
                  width: '100%', padding: '9px 16px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
                  background: state === 'success'
                    ? 'rgba(74,222,128,0.15)'
                    : disabled
                    ? 'rgba(255,255,255,0.04)'
                    : `${color}20`,
                  border: `1px solid ${state === 'success' ? 'rgba(74,222,128,0.3)' : disabled ? 'rgba(255,255,255,0.06)' : `${color}35`}`,
                  color: state === 'success' ? '#4ade80' : disabled ? 'rgba(255,255,255,0.25)' : color,
                  fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                {state === 'loading'
                  ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: color, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Sending...</>
                  : state === 'success'
                  ? <><Check size={12} /> Sent!</>
                  : <><ActionIcon size={12} /> {actionLabel}</>
                }
              </motion.button>

              {extra}
            </div>
          ))}
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </motion.div>
  )
}
