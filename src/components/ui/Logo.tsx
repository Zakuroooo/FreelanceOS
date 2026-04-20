'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  showTagline?: boolean
}

export default function Logo({ 
  size = 'md', 
  showWordmark = true,
  showTagline = false
}: LogoProps) {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.3 : 1

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: `${Math.round(12 * scale)}px` 
    }}>
      {/* Signal arc SVG mark — wide elegant spread */}
      <svg
        width={Math.round(40 * scale)}
        height={Math.round(32 * scale)}
        viewBox="0 0 40 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer arc — widest, most faded */}
        <path
          d="M1 31 A27 27 0 0 1 39 31"
          stroke="rgba(196,20,37,0.22)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Middle arc */}
        <path
          d="M7 22 A18 18 0 0 1 33 22"
          stroke="rgba(196,20,37,0.55)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Inner arc — sharpest */}
        <path
          d="M13 13 A11 11 0 0 1 27 13"
          stroke="#c41425"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle 
          cx="20" 
          cy="31" 
          r="2.5" 
          fill="#c41425" 
        />
        {/* Subtle vertical stem from dot to inner arc */}
        <line
          x1="20"
          y1="13"
          x2="20"
          y2="28.5"
          stroke="rgba(196,20,37,0.2)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark + optional tagline */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
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
          {showTagline && (
            <span
              style={{
                fontSize: `${Math.round(9 * scale)}px`,
                fontWeight: 500,
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.28)',
                fontFamily: '"SF Mono","JetBrains Mono",monospace',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Find. Pitch. Get Paid.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
