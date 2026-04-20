'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
}

export default function Logo({ size = 'md', showWordmark = true }: LogoProps) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.3 : 1
  const iconW = Math.round(44 * scale)
  const iconH = Math.round(38 * scale)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.round(10 * scale)}px` }}>
      {/* Signal arc SVG mark */}
      <svg
        width={iconW}
        height={iconH}
        viewBox="0 0 44 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer arc — faintest */}
        <path
          d="M2 36 A30 30 0 0 1 42 36"
          stroke="rgba(196,20,37,0.28)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Middle arc */}
        <path
          d="M8 27 A20 20 0 0 1 36 27"
          stroke="rgba(196,20,37,0.6)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Inner arc — brightest */}
        <path
          d="M14 18 A12 12 0 0 1 30 18"
          stroke="#c41425"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx="22" cy="36" r="3" fill="#c41425" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span
          style={{
            fontSize: `${Math.round(17 * scale)}px`,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#FAFAFA',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1,
          }}
        >
          Freelance
          <span style={{ color: '#c41425' }}>OS</span>
        </span>
      )}
    </div>
  )
}
