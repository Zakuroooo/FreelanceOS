'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Sparkles, Search, PenLine, CheckCircle, AlertTriangle,
  Copy, Check, Loader2, Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { copyText, claimPopup, navigatePopup } from '@/lib/handoff'
import { instagramProfileUrl, linkedinProfileUrl } from '@/lib/socials'
import { Mail, MessageCircle, Link2 as LinkIcon2, Camera as CameraIcon } from 'lucide-react'

/* ── Types ─────────────────────────────────────────────── */
interface ServiceOption { id: string; label: string }
interface FlawItem { id: string; severity: string; title: string; detail: string }

type Phase = 'pick-service' | 'auditing' | 'audited' | 'writing' | 'done'

interface Msg {
  id: number
  role: 'copilot' | 'user' | 'system'
  text?: string
  findings?: FlawItem[]
  pitch?: string
}

export interface PitchChatResult {
  pitch: string
  serviceId: string
  flawsCited: number
}

interface Props {
  client: {
    id: string
    businessName: string
    website?: string | null
    industry?: string | null
    location?: string | null
    detectedGaps?: string[]
    email?: string | null
    phone?: string | null
    socials?: { instagram?: string | null; linkedin?: string | null } | null
  }
  onClose: () => void
  onComplete: (clientId: string, result: PitchChatResult) => void
}

let msgId = 0
const nextMsg = () => ++msgId

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#60a5fa',
  low: 'rgba(255,255,255,0.45)',
}

export default function PitchChatModal({ client, onClose, onComplete }: Props) {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [phase, setPhase] = useState<Phase>('pick-service')
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: nextMsg(),
    role: 'copilot',
    text: `Before we write anything for ${client.businessName}, I'll audit their live website so every claim is real. First — what are you selling them?`,
  }])
  const [serviceId, setServiceId] = useState<string>('')
  const [findings, setFindings] = useState<FlawItem[]>([])
  const [finalPitch, setFinalPitch] = useState('')
  const [copied, setCopied] = useState(false)
  const [pitchId, setPitchId] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load catalog once
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(d => setServices(d.services ?? []))
      .catch(() => setServices([]))
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, phase])

  const push = (m: Omit<Msg, 'id'>) => setMsgs(prev => [...prev, { ...m, id: nextMsg() }])

  /* ── Phase 1: user picks a service → run ground-truth audit ── */
  const chooseService = async (svc: ServiceOption) => {
    if (phase !== 'pick-service') return
    setServiceId(svc.id)
    push({ role: 'user', text: svc.label })
    setPhase('auditing')

    try {
      const res = await fetch('/api/pitch/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'audit', serviceId: svc.id, clientData: client }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Audit failed')

      setFindings(data.findings ?? [])
      push({
        role: 'copilot',
        text: data.reply || 'Audit complete.',
        findings: data.findings ?? [],
      })
      setPhase('audited')
    } catch (err) {
      push({ role: 'system', text: err instanceof Error ? err.message : 'Audit failed' })
      setPhase('pick-service')
      setServiceId('')
    }
  }

  /* ── Phase 2: write the flaw-specific pitch ── */
  const writePitch = async () => {
    setPhase('writing')
    push({ role: 'system', text: 'Writing your pitch — naming the verified problems and offering your service as the fix…' })
    try {
      const res = await fetch('/api/pitch/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'write', serviceId, clientData: client, findings }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to write pitch')

      setFinalPitch(data.pitch)
      setPitchId(data.pitchId ?? null)
      push({ role: 'copilot', pitch: data.pitch })
      setPhase('done')
      onComplete(client.id, {
        pitch: data.pitch,
        serviceId,
        flawsCited: data.flawsCited ?? findings.length,
      })
    } catch (err) {
      push({ role: 'system', text: err instanceof Error ? err.message : 'Failed to write pitch' })
      setPhase('audited')
    }
  }

  const busy = phase === 'auditing' || phase === 'writing'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', zIndex: 1200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 18 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 560, height: 'min(640px, 90vh)',
            display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(135deg,#0D0D12 0%,#0A0A0F 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: 'rgba(229,72,77,0.1)', border: '1px solid rgba(229,72,77,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#E5484D" />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.01em' }}>
                  Pitch Copilot
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {client.businessName}{client.website ? ' · live audit enabled' : ''}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.55)', display: 'flex',
            }}>
              <X size={15} />
            </button>
          </div>

          {/* Transcript */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.map(m => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'stretch',
                  maxWidth: m.role === 'user' ? '85%' : '100%',
                }}
              >
                {m.role === 'user' && (
                  <div style={{
                    background: 'linear-gradient(135deg, #C41425, #E5484D)',
                    color: '#fff', padding: '9px 14px', borderRadius: '14px 14px 4px 14px',
                    fontSize: 13, fontWeight: 600, display: 'inline-block',
                  }}>
                    {m.text}
                  </div>
                )}

                {m.role === 'system' && (
                  <div style={{
                    textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,0.35)',
                    display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                    padding: '2px 0',
                  }}>
                    <Loader2 size={11} className="chat-spin" /> {m.text}
                  </div>
                )}

                {m.role === 'copilot' && (
                  <div style={{
                    background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px 14px 14px 14px', padding: '12px 14px',
                  }}>
                    {m.text && (
                      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.82)', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {m.text}
                      </p>
                    )}

                    {/* Verified findings list */}
                    {m.findings && m.findings.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {m.findings.map(f => (
                          <div key={f.id} style={{
                            display: 'flex', gap: 8, alignItems: 'flex-start',
                            padding: '8px 10px', borderRadius: 8,
                            background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)',
                          }}>
                            <span style={{ flexShrink: 0, marginTop: 1 }}>
                              {f.severity === 'critical' || f.severity === 'high'
                                ? <AlertTriangle size={12} color={SEVERITY_COLOR[f.severity]} />
                                : <Globe size={12} color={SEVERITY_COLOR[f.severity]} />}
                            </span>
                            <div>
                              <div style={{ fontSize: 11.5, fontWeight: 700, color: SEVERITY_COLOR[f.severity] }}>
                                {f.title}
                              </div>
                              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>
                                {f.detail}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Final pitch */}
                    {m.pitch && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: 8,
                        }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase', color: '#00C9A7',
                          }}>
                            <CheckCircle size={11} /> Ground-truth pitch ready
                          </span>
                          <button
                            onClick={async () => {
                              const { ok } = await copyText(finalPitch)
                              if (ok) { setCopied(true); toast.success('Pitch copied'); setTimeout(() => setCopied(false), 2000) }
                              else toast.error('Copy blocked — select the text manually')
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 6, padding: '4px 9px', cursor: 'pointer',
                              color: copied ? '#4ade80' : 'rgba(255,255,255,0.55)',
                              fontSize: 10, fontWeight: 600,
                            }}
                          >
                            {copied ? <Check size={10} /> : <Copy size={10} />} {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div style={{
                          padding: 14, borderRadius: 10,
                          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
                          fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {m.pitch}
                        </div>
                        <SendBar
                          pitchId={pitchId}
                          businessName={client.businessName}
                          email={client.email ?? null}
                          phone={client.phone ?? null}
                          instagram={client.socials?.instagram ?? null}
                          linkedin={client.socials?.linkedin ?? null}
                          pitchText={finalPitch}
                          emailSent={emailSent}
                          sendingEmail={sendingEmail}
                          onEmailSent={() => { setEmailSent(true); toast.success('Email sent — deal created') }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Auditing progress */}
            {phase === 'auditing' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(229,72,77,0.05)', border: '1px solid rgba(229,72,77,0.15)',
              }}>
                <Search size={13} color="#E5484D" className="chat-spin" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                  Auditing {client.website ? client.website.replace(/^https?:\/\//, '') : 'their online presence'} right now…
                </span>
              </motion.div>
            )}
          </div>

          {/* Composer zone */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {phase === 'pick-service' && (
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                  Choose your service
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  {services.length > 0 ? services.map(svc => (
                    <motion.button
                      key={svc.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => void chooseService(svc)}
                      style={{
                        textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                        background: serviceId === svc.id ? 'rgba(229,72,77,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${serviceId === svc.id ? 'rgba(229,72,77,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', lineHeight: 1.35,
                      }}
                    >
                      {svc.label}
                    </motion.button>
                  )) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 12, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                      Loading services…
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === 'audited' && (
              <div style={{ padding: '14px 16px' }}>
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => void writePitch()}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #C41425, #E5484D)',
                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 20px rgba(196,20,37,0.35)',
                  }}
                >
                  <PenLine size={14} />
                  Write the pitch — cite these {findings.length} verified problem{findings.length === 1 ? '' : 's'}
                </motion.button>
              </div>
            )}
          </div>

          <style>{`
            .chat-spin { animation: chat-rotate 1s linear infinite; }
            @keyframes chat-rotate { to { transform: rotate(360deg); } }
            ::-webkit-scrollbar { width: 5px }
            ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── SendBar: fire every channel straight from the chat result ── */
function SendBar(props: {
  pitchId: string | null
  businessName: string
  email: string | null
  phone: string | null
  instagram: string | null
  linkedin: string | null
  pitchText: string
  emailSent: boolean
  sendingEmail: boolean
  onEmailSent: () => void
}) {
  const { pitchId, businessName, email, phone, instagram, linkedin, pitchText, emailSent, sendingEmail, onEmailSent } = props

  const sendEmail = async () => {
    if (!pitchId || !email) return
    try {
      const res = await fetch('/api/outreach/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId, toEmail: email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      onEmailSent()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Email failed')
    }
  }

  const openWhatsApp = () => {
    if (!phone) return
    const tab = claimPopup()
    const waUrl = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(pitchText.slice(0, 900))}`
    if (!navigatePopup(tab, waUrl)) window.open(waUrl, '_blank')
    toast.success('WhatsApp opened — press Send')
  }

  const copyOpen = async (channel: 'linkedin' | 'instagram', profileUrl: string) => {
    const { ok } = await copyText(pitchText)
    if (!ok) {
      toast.error(`Copy blocked — select the pitch text above manually, then open ${channel}`)
      return
    }
    const tab = claimPopup()
    if (!navigatePopup(tab, profileUrl)) window.open(profileUrl, '_blank')
    toast.success(`Message copied — paste it in ${channel === 'linkedin' ? 'LinkedIn' : 'Instagram'}`)
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '7px 11px', borderRadius: 8, fontSize: 11, fontWeight: 700,
    cursor: 'pointer', textDecoration: 'none', border: '1px solid transparent',
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 7 }}>
        Send {businessName} this pitch now
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <button
          onClick={() => void sendEmail()}
          disabled={!email || !pitchId || emailSent || sendingEmail}
          style={{
            ...btnBase,
            background: emailSent ? 'rgba(74,222,128,0.12)' : 'linear-gradient(135deg, #C41425, #E5484D)',
            borderColor: emailSent ? 'rgba(74,222,128,0.3)' : 'transparent',
            color: emailSent ? '#4ade80' : '#fff',
            opacity: !email || !pitchId ? 0.4 : 1,
            cursor: !email || !pitchId || emailSent || sendingEmail ? 'not-allowed' : 'pointer',
          }}
          title={email ? `Send to ${email}` : 'No email found for this lead'}
        >
          {sendingEmail ? <Loader2 size={11} className="chat-spin" /> : emailSent ? <Check size={11} /> : <Mail size={11} />}
          {emailSent ? 'Sent' : sendingEmail ? 'Sending…' : email ? 'Email' : 'No email'}
        </button>

        <button
          onClick={openWhatsApp}
          disabled={!phone}
          style={{
            ...btnBase,
            background: phone ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
            borderColor: phone ? 'rgba(74,222,128,0.28)' : 'rgba(255,255,255,0.06)',
            color: phone ? '#4ade80' : 'rgba(255,255,255,0.25)',
            cursor: phone ? 'pointer' : 'not-allowed',
          }}
          title={phone ? `Open WhatsApp for ${phone}` : 'No phone number found'}
        >
          <MessageCircle size={11} /> WhatsApp
        </button>

        <button
          onClick={() => {
            const url = linkedinProfileUrl(linkedin)
            if (url) void copyOpen('linkedin', url)
          }}
          disabled={!linkedinProfileUrl(linkedin)}
          style={{
            ...btnBase,
            background: linkedin ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.03)',
            borderColor: linkedin ? 'rgba(96,165,250,0.28)' : 'rgba(255,255,255,0.06)',
            color: linkedin ? '#60a5fa' : 'rgba(255,255,255,0.25)',
            cursor: linkedin ? 'pointer' : 'not-allowed',
          }}
          title={linkedinProfileUrl(linkedin) ? 'Copy pitch + open LinkedIn profile' : 'No valid LinkedIn found'}
        >
          <LinkIcon2 size={11} /> LinkedIn
        </button>

        <button
          onClick={() => {
            const url = instagramProfileUrl(instagram)
            if (url) void copyOpen('instagram', url)
          }}
          disabled={!instagramProfileUrl(instagram)}
          style={{
            ...btnBase,
            background: instagram ? 'rgba(232,121,249,0.1)' : 'rgba(255,255,255,0.03)',
            borderColor: instagram ? 'rgba(232,121,249,0.28)' : 'rgba(255,255,255,0.06)',
            color: instagram ? '#e879f9' : 'rgba(255,255,255,0.25)',
            cursor: instagram ? 'pointer' : 'not-allowed',
          }}
          title={instagramProfileUrl(instagram) ? 'Copy pitch + open Instagram DM' : 'No valid Instagram found'}
        >
          <CameraIcon size={11} /> Instagram
        </button>
      </div>
    </div>
  )
}
