import { ImageResponse } from 'next/og'

/**
 * Branded OG card rendered at request time by next/og — same signal-arc mark,
 * dark surface, red accent. No binary asset to keep in sync.
 */
export const runtime = 'edge'
export const alt = 'FreelanceOS — Your entire freelance business, on autopilot'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #101018 0%, #060608 60%)',
          position: 'relative',
        }}
      >
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        {/* accent glow */}
        <div style={{
          position: 'absolute', top: -160,
          width: 700, height: 400,
          background: 'radial-gradient(ellipse, rgba(229,72,77,0.16) 0%, transparent 65%)',
        }} />

        {/* Signal mark */}
        <div style={{ display: 'flex', marginBottom: 36 }}>
          <svg width="120" height="104" viewBox="0 0 40 32" fill="none">
            <path d="M1 31 A27 27 0 0 1 39 31" stroke="rgba(229,72,77,0.3)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M7 22 A18 18 0 0 1 33 22" stroke="rgba(229,72,77,0.65)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M13 13 A11 11 0 0 1 27 13" stroke="#E5484D" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="20" cy="31" r="2.5" fill="#E5484D" />
            <line x1="20" y1="13" x2="20" y2="28.5" stroke="rgba(229,72,77,0.35)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{
          display: 'flex',
          fontSize: 76, fontWeight: 800, letterSpacing: '-0.04em', color: '#FAFAFA',
        }}>
          Freelance<span style={{ color: '#E5484D' }}>OS</span>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)', marginTop: 14 }}>
          Discover · Pitch with ground truth · Close
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 44 }}>
          {['Live site audits', 'Own your channels', 'Team workspaces'].map(chip => (
            <div key={chip} style={{
              display: 'flex',
              padding: '10px 22px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.03)',
              fontSize: 19, color: 'rgba(255,255,255,0.7)',
            }}>
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
