'use client'

import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    num: '01',
    title: 'AI Client Discovery',
    desc: 'Scan thousands of platforms and surface high-fit leads in your niche. AI scores every company by budget signals, tech stack, and conversion likelihood.',
    wide: true,
  },
  {
    num: '02',
    title: 'Pitch Automation',
    desc: 'Generate hyper-personalized outreach in seconds. AI studies each client and crafts pitches that speak directly to their pain points.',
    wide: false,
  },
  {
    num: '03',
    title: 'Multi-Channel Outreach',
    desc: 'Email, LinkedIn, and cold DM — all from one dashboard. No switching tabs, no lost leads.',
    wide: false,
  },
  {
    num: '04',
    title: 'Smart Sequences',
    desc: 'Set automatic follow-up sequences that trigger based on client behaviour. Stay top of mind without manual effort.',
    wide: true,
  },
  {
    num: '05',
    title: 'Deal Pipeline',
    desc: 'Track every opportunity from first message to signed contract. Know exactly where each deal stands.',
    wide: false,
  },
  {
    num: '06',
    title: 'Revenue Analytics',
    desc: 'See what strategies are converting. Know your best-performing pitch types, outreach channels, and reply times.',
    wide: false,
  },
]

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{
        background: '#040408',
        padding: '120px 24px 140px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top separator */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.05)' }} />

      {/* Subtle ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '0', right: '-100px',
        width: '500px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(90,13,12,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{
          marginBottom: '72px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.55s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            fontSize: '9px', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(190,72,68,0.9)',
            marginBottom: '18px',
          }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '1px', background: '#5A0D0C', display: 'inline-block' }} />
            Features
          </div>
          <h2 style={{
            fontSize: 'clamp(30px, 4.5vw, 50px)',
            fontWeight: 800,
            color: '#F5F5F8',
            letterSpacing: '-0.04em',
            lineHeight: 1.06,
            margin: 0,
          }}>
            Built for serious<br />freelancers.
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.36)',
            marginTop: '14px',
            letterSpacing: '-0.01em',
            maxWidth: '380px',
            lineHeight: 1.6,
          }}>
            One platform to find clients, pitch, follow up, and get paid — without the grind.
          </p>
        </div>

        {/* Bento grid */}
        {/* Row 1: 3fr | 2fr */}
        <div style={{
          display: 'grid', gridTemplateColumns: '3fr 2fr',
          gap: '1px', background: 'rgba(255,255,255,0.05)',
          marginBottom: '1px',
        }}>
          <FeatureCard f={FEATURES[0]} visible={visible} delay={0.06} />
          <FeatureCard f={FEATURES[1]} visible={visible} delay={0.12} />
        </div>

        {/* Row 2: 2fr | 3fr */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 3fr',
          gap: '1px', background: 'rgba(255,255,255,0.05)',
          marginBottom: '1px',
        }}>
          <FeatureCard f={FEATURES[2]} visible={visible} delay={0.18} />
          <FeatureCard f={FEATURES[3]} visible={visible} delay={0.24} />
        </div>

        {/* Row 3: 1fr | 1fr */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '1px', background: 'rgba(255,255,255,0.05)',
        }}>
          <FeatureCard f={FEATURES[4]} visible={visible} delay={0.30} />
          <FeatureCard f={FEATURES[5]} visible={visible} delay={0.36} />
        </div>

      </div>

      {/* Hover styles */}
      <style>{`
        .fo-feat-card { transition: background 0.2s ease; }
        .fo-feat-card:hover { background: rgba(255,255,255,0.02) !important; }
        .fo-feat-arrow { transition: opacity 0.2s ease; opacity: 0.2; }
        .fo-feat-card:hover .fo-feat-arrow { opacity: 0.5; }
        .fo-feat-card:hover .fo-feat-num-bg { opacity: 0.06 !important; }
      `}</style>
    </section>
  )
}

function FeatureCard({ f, visible, delay }: {
  f: typeof FEATURES[0]
  visible: boolean
  delay: number
}) {
  return (
    <div
      className="fo-feat-card"
      style={{
        background: '#040408',
        padding: '40px 36px',
        position: 'relative',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* FIG label */}
      <div style={{
        fontSize: '9.5px', fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.15)',
        marginBottom: '32px',
      }}>
        FIG.{f.num}
      </div>

      {/* Decorative large number */}
      <div
        className="fo-feat-num-bg"
        aria-hidden
        style={{
          position: 'absolute', top: '8px', right: '20px',
          fontSize: '88px', fontWeight: 900,
          letterSpacing: '-0.06em',
          color: 'rgba(255,255,255,0.03)',
          lineHeight: 1, pointerEvents: 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        {f.num}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '18px', fontWeight: 700,
        color: '#F5F5F8', letterSpacing: '-0.03em',
        margin: '0 0 10px', lineHeight: 1.2,
      }}>
        {f.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.36)',
        lineHeight: 1.72,
        letterSpacing: '-0.01em',
        margin: 0,
        maxWidth: '340px',
        flex: 1,
      }}>
        {f.desc}
      </p>

      {/* Arrow icon */}
      <div className="fo-feat-arrow" style={{ position: 'absolute', bottom: '22px', right: '24px' }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2.5 2.5H10.5M10.5 2.5V10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}
