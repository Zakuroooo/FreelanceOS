'use client'

export type SourceConfidence = 'verified' | 'scraped' | 'inferred' | 'guessed'

const CONFIG: Record<SourceConfidence, { label: string; color: string; bg: string; border: string }> = {
  verified: { label: 'Verified',  color: '#00C9A7', bg: 'rgba(0,201,167,0.10)',  border: 'rgba(0,201,167,0.24)' },
  scraped:  { label: 'Scraped',   color: 'rgb(34,211,238)', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.2)' },
  inferred: { label: 'Inferred',  color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.24)' },
  guessed:  { label: 'Estimated', color: 'var(--color-text-secondary)', bg: 'rgba(255,255,255,0.04)', border: 'var(--color-border)' },
}

export function SourceChip({ confidence }: { confidence: SourceConfidence }) {
  const c = CONFIG[confidence]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: 20, padding: '0 8px', borderRadius: 5,
      border: `1px solid ${c.border}`, background: c.bg, color: c.color,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  )
}
