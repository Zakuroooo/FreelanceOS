'use client'

const QUICK_PRESETS = ['Dentists', 'Salons', 'Gyms', 'Realtors', 'Cafes']

export function DiscoverEmpty({
  locality,
  onPreset,
}: {
  locality: string
  onPreset: (preset: string) => void
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 400, padding: '48px 24px', gap: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <p style={{
          fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          No leads found{locality ? ` in ${locality}` : ''}
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
          Try broadening your search radius, checking your spelling, or switching to a different niche below.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onPreset(preset)}
            style={{
              height: 36, padding: '0 16px',
              borderRadius: 7,
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--color-text-secondary)',
              fontSize: 13, fontWeight: 500,
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)'
            }}
          >
            Try {preset}
          </button>
        ))}
      </div>
    </div>
  )
}
