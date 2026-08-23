'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageCircle, Link2, Camera, X, Send, ExternalLink, Copy, Check, Zap, AlertCircle } from 'lucide-react'
const LinkedinIcon = Link2
const InstagramIcon = Camera


interface PitchData {
  _id: string
  businessName: string
  businessEmail?: string
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
  gmailAddress: string | null
  onClose: () => void
  onSuccess: (msg: string) => void
}

type ChannelState = 'idle' | 'loading' | 'success' | 'error'

export default function SendModal({ pitch, gmailAddress, onClose, onSuccess }: Props) {
  const [emailState, setEmailState]   = useState<ChannelState>('idle')
  const [waState, setWaState]         = useState<ChannelState>('idle')
  const [liState, setLiState]         = useState<ChannelState>('idle')
  const [igState, setIgState]         = useState<ChannelState>('idle')
  const [copiedKey, setCopiedKey]     = useState<string | null>(null)
  const [errorMsg, setErrorMsg]       = useState<string>('')

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {}
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
        if (data.action === 'connect_gmail') {
          setTimeout(() => window.location.href = '/api/gmail/connect', 1500)
        }
      } else {
        setEmailState('success')
        onSuccess(`✅ Email sent to ${pitch.businessEmail}`)
      }
    } catch {
      setEmailState('error')
      setErrorMsg('Network error')
    }
  }

  const openWhatsApp = async () => {
    if (!pitch.businessPhone) return
    setWaState('loading')
    try {
      const res  = await fetch('/api/outreach/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch._id, phone: pitch.businessPhone }),
      })
      const data = await res.json()
      if (res.ok && data.waUrl) {
        window.open(data.waUrl, '_blank')
        setWaState('success')
        onSuccess('WhatsApp opened with pitch pre-filled')
      } else {
        setWaState('error')
      }
    } catch {
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
        await copyToClipboard(data.message, 'li')
        if (data.profileUrl) window.open(data.profileUrl, '_blank')
        setLiState('success')
        onSuccess('LinkedIn pitch copied & profile opened')
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
        await copyToClipboard(data.message, 'ig')
        if (data.profileUrl) window.open(data.profileUrl, '_blank')
        setIgState('success')
        onSuccess('Instagram pitch copied & DM opened')
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
      info:      pitch.businessEmail ?? 'No email found for this business',
      state:     emailState,
      action:    sendEmail,
      actionLabel: 'Send Email Now',
      actionIcon:  Send,
      disabled:  !pitch.businessEmail || !gmailAddress || emailState === 'success',
      extra: !gmailAddress ? (
        <a
          href='/api/gmail/connect'
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, marginTop: 10,
            background: 'rgba(196,20,37,0.15)', border: '1px solid rgba(196,20,37,0.3)',
            color: '#ff4455', fontSize: 12, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <Zap size={11} /> Connect Gmail to send →
        </a>
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
