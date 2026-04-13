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
        gap: '7px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--color-accent)',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
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
