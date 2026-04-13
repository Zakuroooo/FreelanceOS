'use client'

interface SectionBadgeProps {
  label: string
  className?: string
}

export default function SectionBadge({ label, className = '' }: SectionBadgeProps) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-accent)',
      }}
    >
      {/* Red dot */}
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      {label}
    </div>
  )
}
