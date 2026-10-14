'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  Search, MapPin, Globe, ScanSearch, Star, Check,
} from 'lucide-react'

const PHASES = [
  { Icon: Search,     text: 'Firing discovery engines' },
  { Icon: MapPin,     text: 'Extracting business listings' },
  { Icon: Globe,      text: 'Enriching business data' },
  { Icon: ScanSearch, text: 'Detecting website gaps' },
  { Icon: Star,       text: 'Scoring opportunities' },
]

export function DiscoverLoading() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPhase(p => Math.min(p + 1, PHASES.length - 1)), 8000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 340, padding: '48px 24px', gap: 32,
    }}>
      {/* Pulse ring */}
      <div style={{ position: 'relative', width: 52, height: 52 }}>
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid var(--color-accent)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Search size={20} color="var(--color-accent)" />
        </motion.div>
      </div>

      {/* Phases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 280 }}>
        {PHASES.map((p, i) => (
          <AnimatePresence key={p.text}>
            {i <= phase && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: i === phase ? 1 : 0.3, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                  color: i === phase ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  fontWeight: i === phase ? 500 : 400,
                }}
              >
                <span style={{ display: 'inline-flex', lineHeight: 1 }}>
                  <p.Icon size={16} />
                </span>
                <span style={{ letterSpacing: '-0.01em' }}>{p.text}</span>
                {i === phase && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    style={{ color: 'var(--color-accent)', marginLeft: 2 }}
                  >…</motion.span>
                )}
                {i < phase && (
                  <Check size={13} strokeWidth={3} style={{ marginLeft: 'auto', color: '#00C9A7' }} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, letterSpacing: '-0.01em' }}>
        This usually takes 10-30 seconds across all sources
      </p>
    </div>
  )
}
