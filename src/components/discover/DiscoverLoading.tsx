'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const PHASES = [
  { icon: '🔍', text: 'Firing discovery engines' },
  { icon: '📍', text: 'Extracting business listings' },
  { icon: '🌐', text: 'Enriching business data' },
  { icon: '🔎', text: 'Detecting website gaps' },
  { icon: '⭐', text: 'Scoring opportunities' },
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
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 6, borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--color-accent)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 14, borderRadius: '50%',
          background: 'var(--color-accent)', opacity: 0.9,
        }} />
      </div>

      {/* Phase steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 340 }}>
        {PHASES.map((p, i) => (
          <AnimatePresence key={i}>
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
                <span style={{ fontSize: 16, lineHeight: 1 }}>{p.icon}</span>
                <span style={{ letterSpacing: '-0.01em' }}>{p.text}</span>
                {i === phase && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    style={{ color: 'var(--color-accent)', marginLeft: 2 }}
                  >…</motion.span>
                )}
                {i < phase && (
                  <span style={{ marginLeft: 'auto', color: '#00C9A7', fontSize: 12 }}>✓</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, letterSpacing: '-0.01em' }}>
        Scanning across multiple sources — this may take a few seconds
      </p>
    </div>
  )
}
