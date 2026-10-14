'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ArrowRight, Activity, Zap, ShieldAlert, Cpu } from 'lucide-react'
import { toast } from 'sonner'
import { type Client } from './DiscoverRow'
import { ScoreRing } from './ScoreRing'

interface IntelData {
  pitchAngle?: string
  icebreaker?: string
  whyThisLead?: string
  requirements?: string[]
  readiness?: {
    label?: string
    reason?: string
    complexity?: string
    estimatedWork?: string
    service?: string
  }
  [key: string]: unknown
}

// Session-level intel cache — survives drawer open/close cycles
const intelCache = new Map<string, IntelData>()

interface IntelDrawerProps {
  client: Client | null
  onClose: () => void
  onSave: (client: Client) => void
  onIgnore: (client: Client) => void
  onPitch: (client: Client) => void
  onSimilar: (client: Client) => void
}

export function IntelDrawer({ client, onClose, onSave, onIgnore, onPitch, onSimilar }: IntelDrawerProps) {
  const [intel, setIntel] = useState<IntelData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!client) {
      const clear = setTimeout(() => setIntel(null), 0)
      return () => clearTimeout(clear)
    }

    const cacheKey = client.id || client.businessName

    // Check cache first — instant load, zero tokens
    if (intelCache.has(cacheKey)) {
      const hit = setTimeout(() => {
        setIntel(intelCache.get(cacheKey) ?? null)
        setLoading(false)
      }, 0)
      return () => clearTimeout(hit)
    }

    let isMounted = true
    const start = setTimeout(() => {
      setLoading(true)
      setIntel(null)
    }, 0)

    fetch('/api/intel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientData: client })
    })
      .then(r => r.json())
      .then(data => {
        if (isMounted) {
          if (data.error) toast.error(data.error)
          else {
            setIntel(data)
            intelCache.set(cacheKey, data) // Cache for future opens
          }
          setLoading(false)
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(err)
          toast.error('Failed to load intel')
          setLoading(false)
        }
      })

    return () => { isMounted = false; clearTimeout(start) }
  }, [client])

  // Framer motion variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  }
  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0, 
      transition: { type: 'tween' as const, ease: [0.16, 1, 0.3, 1] as const, duration: 0.4 } 
    },
    exit: { 
      x: '100%', 
      transition: { type: 'tween' as const, ease: [0.16, 1, 0.3, 1] as const, duration: 0.3 } 
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
  }
  
  const listVariants = {
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  }

  // Escape key handler
  useEffect(() => {
    if (!client) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [client, onClose])

  let domainLabel = ''
  if (client?.website) {
    try { domainLabel = new URL(client.website.startsWith('http') ? client.website : `https://${client.website}`).hostname.replace('www.', '') } catch { domainLabel = client.website }
  }

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <AnimatePresence>
      {client && (
        <motion.div 
          key="intel-backdrop"
          className="fixed inset-0 z-50 flex justify-end"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
        <motion.div 
          className="w-full max-w-[540px] h-full flex flex-col shadow-2xl relative"
          style={{ background: '#060608', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
          variants={drawerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '24px 32px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>{client.businessName}</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>{client.category || client.industry || 'Unknown'}</span>
                <span>•</span>
                <span>{client.location || 'Unknown'}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <motion.div variants={listVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Score Vitals */}
              <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
                <div style={{ width: 56, height: 56, background: '#000', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScoreRing score={client.opportunityScore} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Opportunity Score</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>{client.opportunityScore}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/100</span></div>
                </div>
                <div style={{ flex: 1 }} />
                {client.leadState && client.leadState !== 'new' && (
                  <div style={{ padding: '4px 8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {client.leadState}
                  </div>
                )}
              </motion.div>

              {loading ? (
                <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Synthesizing Deep Intel...</div>
                </motion.div>
              ) : intel ? (
                <>
                  {/* Why this lead */}
                  <motion.div variants={itemVariants}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Zap size={14} color="var(--color-accent)" />
                      <h3 style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Why This Lead</h3>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{intel.whyThisLead}</p>
                  </motion.div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <motion.div variants={itemVariants}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Activity size={14} color="rgba(255,255,255,0.4)" />
                        <h3 style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Snapshot</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Rating</span> <span style={{ color: '#F59E0B', fontWeight: 500 }}>{client.rating || 'N/A'} ({client.reviewCount || 0})</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Website</span> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{domainLabel || 'Missing'}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Source</span> <span style={{ color: 'var(--color-accent)', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, textTransform: 'uppercase' }}>{client.sourceOrigin || client.source || 'Scraped'}</span></div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Cpu size={14} color="rgba(255,255,255,0.4)" />
                        <h3 style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Contacts</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Email</span> <span style={{ color: client.email ? '#00C9A7' : 'rgba(255,255,255,0.3)' }}>{client.email ? 'Found' : 'Missing'}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Phone</span> <span style={{ color: client.phone ? '#00C9A7' : 'rgba(255,255,255,0.3)' }}>{client.phone ? 'Found' : 'Missing'}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Socials</span> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{client.socialCount || 0} Links</span></div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Detected Problems */}
                  <motion.div variants={itemVariants}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <ShieldAlert size={14} color="var(--dash-red)" />
                      <h3 style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Critical Gaps</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {client.detectedGaps.length === 0 ? (
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No explicit problems detected.</span>
                      ) : (
                        client.detectedGaps.map((gap: string) => (
                          <div key={gap} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(229,72,77,0.05)', border: '1px solid rgba(229,72,77,0.1)', borderRadius: 4 }}>
                            <Check size={12} color="#E5484D" />
                            <span style={{ fontSize: 12, color: '#E5484D', textTransform: 'capitalize' }}>{gap.replace('no-', 'Missing ')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>

                  {/* Readiness Gate */}
                  <motion.div variants={itemVariants} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Readiness Gate</h3>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{intel.readiness?.service || 'General Consulting'}</div>
                      </div>
                      <div style={{ 
                        padding: '4px 8px', borderRadius: 4, fontSize: 9, fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: intel.readiness?.label?.includes('STRONG') ? 'rgba(0,201,167,0.1)' : intel.readiness?.label?.includes('PARTIAL') ? 'rgba(245,158,11,0.1)' : 'rgba(229,72,77,0.1)',
                        color: intel.readiness?.label?.includes('STRONG') ? '#00C9A7' : intel.readiness?.label?.includes('PARTIAL') ? '#F59E0B' : '#E5484D',
                        border: `1px solid ${intel.readiness?.label?.includes('STRONG') ? 'rgba(0,201,167,0.2)' : intel.readiness?.label?.includes('PARTIAL') ? 'rgba(245,158,11,0.2)' : 'rgba(229,72,77,0.2)'}`
                      }}>
                        {intel.readiness?.label || 'UNKNOWN FIT'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Complexity</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{intel.readiness?.complexity || 'UNKNOWN'}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Est. Work</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{intel.readiness?.estimatedWork || 'TBD'}</div>
                      </div>
                    </div>
                    <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 4, fontSize: 11, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.03)' }}>
                      {intel.readiness?.reason}
                    </div>
                  </motion.div>

                  {/* Requirements Needed */}
                  {intel.requirements && intel.requirements.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <h3 style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>Key Requirements</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {intel.requirements.map((req: string, i: number) => (
                          <div key={i} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                            {req}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Pitch Strategy */}
                  <motion.div variants={itemVariants} style={{ padding: 20, background: 'linear-gradient(180deg, rgba(229,72,77,0.05) 0%, rgba(229,72,77,0.01) 100%)', border: '1px solid rgba(229,72,77,0.15)', borderRadius: 8 }}>
                    <h3 style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0' }}>Pitch Strategy</h3>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(229,72,77,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>The Angle</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', lineHeight: 1.5 }}>“{intel.pitchAngle}”</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(229,72,77,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Icebreaker</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>“{intel.icebreaker}”</div>
                    </div>
                  </motion.div>

                </>
              ) : null}
            </motion.div>
          </div>

          {/* Action Footer */}
          <div style={{ padding: '20px 32px', background: 'rgba(6,6,8,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <button 
                onClick={() => { onPitch(client); onClose() }} 
                style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
             >
               Write Pitch <ArrowRight size={14} />
             </button>
             <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => { onSave(client) }} 
                  style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                  Save
                </button>
                <button 
                  onClick={() => { onIgnore(client); onClose() }} 
                  style={{ background: 'transparent', color: 'var(--color-error)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  Ignore
                </button>
             </div>
          </div>
        </motion.div>
      </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}
