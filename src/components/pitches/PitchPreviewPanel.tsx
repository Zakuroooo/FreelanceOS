'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, MessageCircle, Link2, Camera, Copy, Check, Star } from 'lucide-react'
const LinkedinIcon = Link2
const InstagramIcon = Camera


interface PitchData {
  _id: string
  businessName: string
  businessLocation?: string
  emailSubject?: string
  emailBody?: string
  whatsappMsg?: string
  linkedinDm?: string
  instagramDm?: string
  qualityScore?: number
  createdAt: string
}

const TABS = [
  { key: 'emailBody',   label: 'Email',     Icon: Mail,           color: '#60a5fa' },
  { key: 'whatsappMsg', label: 'WhatsApp',  Icon: MessageCircle,  color: '#4ade80' },
  { key: 'linkedinDm',  label: 'LinkedIn',  Icon: Link2,       color: '#60a5fa' },
  { key: 'instagramDm', label: 'Instagram', Icon: Camera,      color: '#e879f9' },
] as const

type TabKey = typeof TABS[number]['key']

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hrs > 0)  return `${hrs}h ago`
  return 'just now'
}

export default function PitchPreviewPanel({
  pitch, onClose,
}: {
  pitch: PitchData | null
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('emailBody')
  const [copied, setCopied]       = useState(false)

  const copyContent = async () => {
    const text = pitch?.[activeTab] ?? ''
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {pitch && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 800 }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 480, maxWidth: '100vw',
              background: 'rgba(8,8,14,0.98)', backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              zIndex: 850, display: 'flex', flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '22px 24px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#E5484D', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Pitch Preview
                  </div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#FAFAFA' }}>
                    {pitch.businessName}
                  </h2>
                  {pitch.businessLocation && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{pitch.businessLocation}</div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Quality score */}
                  {pitch.qualityScore !== undefined && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 20,
                      background: 'rgba(196,20,37,0.15)', border: '1px solid rgba(196,20,37,0.3)',
                      fontSize: 12, fontWeight: 700, color: '#ff4455',
                    }}>
                      <Star size={10} fill='#ff4455' /> {pitch.qualityScore}
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '6px', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.6)', display: 'flex',
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>
                Generated {timeAgo(pitch.createdAt)}
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 2, padding: '12px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
            }}>
              {TABS.map(({ key, label, Icon, color }) => {
                const isActive = activeTab === key
                const hasContent = !!pitch[key]
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
                      background: isActive ? `${color}18` : 'transparent',
                      border: `1px solid ${isActive ? `${color}35` : 'transparent'}`,
                      color: isActive ? color : 'rgba(255,255,255,0.35)',
                      fontSize: 12, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 5,
                      opacity: hasContent ? 1 : 0.4,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={11} /> {label}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: '100%', overflowY: 'auto', padding: '20px 24px' }}
                >
                  {/* Email subject line */}
                  {activeTab === 'emailBody' && pitch.emailSubject && (
                    <div style={{
                      padding: '12px 16px', borderRadius: 8, marginBottom: 16,
                      background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)',
                    }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subject</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{pitch.emailSubject}</div>
                    </div>
                  )}

                  {/* Pitch body */}
                  {pitch[activeTab] ? (
                    <div style={{
                      fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.8)',
                      whiteSpace: 'pre-wrap', fontFamily: activeTab === 'emailBody' ? 'inherit' : 'inherit',
                    }}>
                      {pitch[activeTab]}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center', padding: '60px 20px',
                      color: 'rgba(255,255,255,0.25)', fontSize: 13,
                    }}>
                      No {TABS.find(t => t.key === activeTab)?.label} version generated
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer — Copy button */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={copyContent}
                disabled={!pitch[activeTab]}
                style={{
                  width: '100%', padding: '11px', borderRadius: 10, cursor: 'pointer',
                  background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: copied ? '#4ade80' : 'rgba(255,255,255,0.7)',
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy to Clipboard</>}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
