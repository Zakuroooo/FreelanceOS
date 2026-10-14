'use client'

import { motion } from 'framer-motion'
import type { ReactNode, CSSProperties } from 'react'

/**
 * Dashboard design kit — the difference between "works" and "$10k".
 *
 * Every dashboard page used to hand-roll its own header, cards and buttons with
 * slightly different spacing/radii/shadows. These primitives encode one system:
 * - Header: eyebrow + 28px tight title + muted subtitle + right-aligned actions
 * - Cards: layered glass (gradient surface, inner top highlight, hairline border)
 * - Motion: one shared spring so nothing feels bolted on
 */

export const SPRING_EASE = [0.16, 1, 0.3, 1] as const

/* ── PageHeader ─────────────────────────────────────────── */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: SPRING_EASE }}
      style={{
        marginBottom: 28,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
        paddingBottom: 20,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#E5484D',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E5484D', boxShadow: '0 0 8px rgba(229,72,77,0.7)' }} />
            {eyebrow}
          </div>
        )}
        <h1 style={{
          fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', margin: 0,
          lineHeight: 1.15,
          background: 'linear-gradient(180deg, #FFFFFF 60%, rgba(255,255,255,0.72))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '7px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.42)', letterSpacing: '-0.01em' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{actions}</div>
      )}
    </motion.div>
  )
}

/* ── GlassCard ──────────────────────────────────────────── */
export function GlassCard({
  children,
  style,
  delay = 0,
}: {
  children: ReactNode
  style?: CSSProperties
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: SPRING_EASE }}
      className="kit-glass"
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ── StatTile ───────────────────────────────────────────── */
export function StatTile({
  label,
  value,
  Icon,
  color = '#FAFAFA',
  sub,
}: {
  label: string
  value: string | number
  Icon?: ReactNode
  color?: string
  sub?: string
}) {
  return (
    <GlassCard style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
      {Icon && (
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `${color}14`, border: `1px solid ${color}2e`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          {Icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color, lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
          {sub ?? label}
        </div>
      </div>
    </GlassCard>
  )
}

/* ── Buttons ────────────────────────────────────────────── */
export function PrimaryButton({
  children,
  onClick,
  href,
  disabled,
  style,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
  style?: CSSProperties
  title?: string
}) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '10px 18px', borderRadius: 10,
    background: disabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #C41425, #E5484D)',
    border: 'none', color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
    fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
    textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
    boxShadow: disabled ? 'none' : '0 4px 20px rgba(196,20,37,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
    ...style,
  }
  if (href) return <a href={href} style={base} title={title}>{children}</a>
  return <button onClick={onClick} disabled={disabled} style={base} title={title}>{children}</button>
}

export function GhostButton({
  children,
  onClick,
  style,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  style?: CSSProperties
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="kit-ghost-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 14px', borderRadius: 10,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
        color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/* ── Badge ──────────────────────────────────────────────── */
export function Badge({
  children,
  color = '#8A8A9A',
  filled = false,
}: {
  children: ReactNode
  color?: string
  filled?: boolean
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      color: filled ? '#fff' : color,
      background: filled ? color : `${color}14`,
      border: `1px solid ${color}${filled ? '' : '33'}`,
    }}>
      {children}
    </span>
  )
}
