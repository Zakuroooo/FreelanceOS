'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type BulkAction = 'save' | 'ignore' | 'queue' | 'tag'

export function BulkActionBar({ count, onAction, onClear }: {
  count: number
  onAction: (action: BulkAction) => void
  onClear: () => void
}) {
  return (
    <AnimatePresence>
      {count >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: 'fixed',
            left: 'clamp(16px, 4vw, 76px)',
            right: 16,
            bottom: 'calc(24px + env(safe-area-inset-bottom))',
            zIndex: 30,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            width: 'min(720px, 100%)',
            pointerEvents: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(145deg, rgba(22,22,28,0.95) 0%, rgba(10,10,15,0.98) 100%)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginRight: 'auto', letterSpacing: '0.01em', paddingLeft: 4 }}>
              {count} <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>leads selected</span>
            </span>
            {([
              { key: 'save',   label: 'Save all'   },
              { key: 'ignore', label: 'Ignore all', red: true },
              { key: 'queue',  label: 'Add to queue' },
              { key: 'tag',    label: 'Tag ▾' },
            ] as { key: BulkAction; label: string; red?: boolean }[]).map(({ key, label, red }) => (
              <Btn key={key} label={label} red={red} onClick={() => onAction(key)} />
            ))}
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <Btn label="Clear" onClick={onClear} subtle />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Btn({ label, onClick, red, subtle }: { label: string; onClick: () => void; red?: boolean; subtle?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <button type="button" onClick={onClick} style={{
      height: 28, padding: '0 12px', borderRadius: 6, cursor: 'pointer',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap',
      border: red
        ? (hover ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(239,68,68,0.2)')
        : subtle
          ? '1px solid transparent'
          : (hover ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)'),
      background: red
        ? (hover ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)')
        : subtle
          ? (hover ? 'rgba(255,255,255,0.1)' : 'transparent')
          : (hover ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'),
      color: red ? '#FCA5A5' : hover ? '#fff' : 'rgba(255,255,255,0.7)',
      transform: hover ? 'translateY(-1px)' : 'none',
      boxShadow: hover && !subtle ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
      transition: 'all 0.2s cubic-bezier(0.2,0.8,0.2,1)',
    }}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {label}
    </button>
  )
}
