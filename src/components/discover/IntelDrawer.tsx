'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ArrowRight, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { type Client } from './DiscoverRow'
import { ScoreRing } from './ScoreRing'

interface IntelDrawerProps {
  client: Client | null
  onClose: () => void
  onSave: (client: Client) => void
  onIgnore: (client: Client) => void
  onPitch: (client: Client) => void
  onSimilar: (client: Client) => void
}

export function IntelDrawer({ client, onClose, onSave, onIgnore, onPitch, onSimilar }: IntelDrawerProps) {
  const [intel, setIntel] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!client) {
      setIntel(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setIntel(null)

    fetch('/api/intel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientData: client })
    })
      .then(r => r.json())
      .then(data => {
        if (isMounted) {
          if (data.error) toast.error(data.error)
          else setIntel(data)
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

    return () => { isMounted = false }
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
      transition: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.4 } 
    },
    exit: { 
      x: '100%', 
      transition: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 } 
    }
  }

  // Common staggered item animation
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  }
  
  // Stagger container
  const listVariants = {
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.2
      }
    }
  }

  if (!client) return null

  const domainLabel = client.website ? new URL(client.website.startsWith('http') ? client.website : `https://${client.website}`).hostname.replace('www.', '') : ''

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex justify-end"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      >
        <motion.div 
          className="w-full max-w-[500px] h-full overflow-y-auto flex flex-col shadow-2xl relative"
          style={{ background: '#0a0a0a', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
          variants={drawerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <motion.div className="p-6 pb-24" variants={listVariants} initial="hidden" animate="visible">
            
            {/* 1. HEADER */}
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight mb-2 pr-8">{client.businessName}</h2>
              <div className="flex items-center gap-3 text-xs text-white/40 mb-4 font-mono uppercase tracking-wider">
                <span>{client.category || client.industry || 'Unknown'}</span>
                <span>•</span>
                <span>{client.location || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black border border-white/10">
                    <ScoreRing score={client.opportunityScore} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Opp Score</span>
                    <span className="text-white font-bold text-lg">{client.opportunityScore}</span>
                  </div>
                </div>
                {client.leadState && client.leadState !== 'new' && (
                  <div className="px-2 py-1 bg-white/5 text-white border border-white/10 rounded text-[9px] font-mono uppercase tracking-widest">
                    {client.leadState}
                  </div>
                )}
              </div>
            </motion.div>

            {loading ? (
              <motion.div variants={itemVariants} className="flex flex-col gap-4 py-8 items-center text-white/30 text-xs font-mono uppercase tracking-widest">
                <div className="w-4 h-4 border-2 border-white/20 border-t-accent rounded-full animate-spin mb-2" />
                Generating Intel...
              </motion.div>
            ) : intel ? (
              <div className="flex flex-col gap-8">
                {/* 2. WHY THIS LEAD */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Why This Lead</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{intel.whyThisLead}</p>
                </motion.div>

                {/* 3. BUSINESS SNAPSHOT */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Snapshot</h3>
                    <div className="flex flex-col gap-2 text-xs text-white/60">
                      <div className="flex justify-between"><span>Rating:</span> <span className="text-yellow-500 font-bold">{client.rating || 'N/A'} ({client.reviewCount || 0})</span></div>
                      <div className="flex justify-between"><span>Website:</span> <span>{domainLabel || 'Missing'}</span></div>
                      <div className="flex justify-between"><span>Source:</span> <span className="uppercase text-amber-500 font-mono text-[10px]">{client.sourceOrigin || client.source || 'Scraped'}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Contacts</h3>
                    <div className="flex flex-col gap-2 text-xs text-white/60">
                      <div className="flex justify-between"><span>Email:</span> <span>{client.email ? 'Found' : 'Missing'}</span></div>
                      <div className="flex justify-between"><span>Phone:</span> <span>{client.phone ? 'Found' : 'Missing'}</span></div>
                      <div className="flex justify-between"><span>Socials:</span> <span>{client.socialCount || 0} Links</span></div>
                    </div>
                  </div>
                </motion.div>

                {/* 4. DETECTED PROBLEMS */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Detected Problems</h3>
                  <div className="flex flex-col gap-2">
                    {client.detectedGaps.length === 0 ? (
                      <span className="text-xs text-white/30 italic">No explicit problems detected.</span>
                    ) : (
                      client.detectedGaps.map((gap: string) => (
                        <div key={gap} className="flex items-start gap-2 text-sm text-red-400">
                          <Check size={14} className="mt-0.5 text-red-500" />
                          <span className="capitalize">{gap.replace('no-', 'Missing ')}</span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* 6 & 7. READINESS GATE */}
                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-md p-4">
                  <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">Freelancer Readiness Gate</h3>
                  <div className="text-sm font-bold text-white mb-1">{intel.readiness?.service || 'General Consulting'}</div>
                  <div className="flex items-center gap-3 text-xs text-white/50 mb-3 font-mono">
                    <span>Complexity: {intel.readiness?.complexity || 'UNKNOWN'}</span>
                    <span>•</span>
                    <span>Work: {intel.readiness?.estimatedWork || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/10">
                    <span className={`px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded ${
                      intel.readiness?.label?.includes('STRONG') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      intel.readiness?.label?.includes('PARTIAL') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {intel.readiness?.label || 'UNKNOWN FIT'}
                    </span>
                    <span className="text-xs text-white/60 truncate">{intel.readiness?.reason}</span>
                  </div>
                </motion.div>

                {/* 8. REQUIREMENTS NEEDED */}
                {intel.requirements && intel.requirements.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Requirements Needed</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {intel.requirements.map((req: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                          <div className="w-1 h-1 bg-white/20 rounded-full" />
                          {req}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 9 & 10. PITCH STRATEGY */}
                <motion.div variants={itemVariants} className="bg-accent/10 border border-accent/20 rounded-md p-4">
                  <h3 className="text-[10px] font-mono text-accent uppercase tracking-widest mb-3">Pitch Strategy</h3>
                  <div className="mb-4">
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Angle</div>
                    <div className="text-sm text-white/90 italic">"{intel.pitchAngle}"</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Icebreaker</div>
                    <div className="text-sm text-white/90">"{intel.icebreaker}"</div>
                  </div>
                </motion.div>

              </div>
            ) : null}

          </motion.div>

          {/* 11. ACTION CLUSTER */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-2">
             <div className="flex gap-2">
                <button 
                  onClick={() => { onPitch(client); onClose() }} 
                  className="px-4 py-2 bg-accent text-white text-xs font-bold font-mono uppercase tracking-widest rounded hover:bg-red-500 transition-colors flex items-center gap-2"
                >
                  Write Pitch <ArrowRight size={14} />
                </button>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => { onSave(client) }} 
                  className="px-3 py-2 border border-white/20 text-white/70 hover:text-white hover:border-white/50 text-xs font-bold font-mono uppercase tracking-widest rounded transition-colors"
                >
                  Save
                </button>
                <button 
                  onClick={() => { onIgnore(client); onClose() }} 
                  className="px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold font-mono uppercase tracking-widest rounded transition-colors"
                >
                  Ignore
                </button>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
