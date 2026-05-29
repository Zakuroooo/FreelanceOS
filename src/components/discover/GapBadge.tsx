'use client'
import { Globe, Share2, Video, Lock, Smartphone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, type ElementType } from 'react'

type GapIcon = ElementType

export const GAP_META: Record<string, { label: string; Icon: GapIcon; color: string }> = {
  'no-website': { label: 'No Website',  Icon: Globe,       color: 'var(--color-accent)' },
  'no-social':  { label: 'No Social',   Icon: Share2,      color: 'var(--color-warning)' },
  'no-video':   { label: 'No Video',    Icon: Video,       color: 'rgb(34 211 238)' },
  'no-ssl':     { label: 'No SSL',      Icon: Lock,        color: 'rgba(245, 158, 11, 0.9)' },
  'no-mobile':  { label: 'Not Mobile',  Icon: Smartphone,  color: 'rgb(34 211 238)' },
  'no-email':   { label: 'No Email',    Icon: Mail,        color: 'rgba(59, 130, 246, 0.92)' },
}

export function GapBadge({ gap, compact = false }: { gap: string; compact?: boolean }) {
  const [tip, setTip] = useState(false)
  const meta = GAP_META[gap]
  if (!meta) return null
  const { label, Icon, color } = meta

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        style={{
          display: 'flex', alignItems: 'center', gap: compact ? 0 : 5,
          padding: compact ? '3px 5px' : '3px 8px',
          borderRadius: 5,
          background: `${color}14`,
          border: `1px solid ${color}30`,
          color, fontSize: 10, fontWeight: 600,
          cursor: 'default',
        }}
      >
        <Icon size={10} strokeWidth={2.2} />
        {!compact && <span>{label}</span>}
      </motion.div>
      {tip && compact && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 6, background: 'rgba(10,10,16,0.95)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 5, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: '#FAFAFA',
          whiteSpace: 'nowrap', zIndex: 99, pointerEvents: 'none',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
