'use client'

import { useRef } from 'react'
import SectionBadge from '@/components/ui/SectionBadge'
import WobbleCard from '@/components/ui/WobbleCard'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import FreelancerCharacter from '@/components/anime/FreelancerCharacter'

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      {/* Hero section — tall enough to scroll and trigger character states */}
      <section
        ref={heroRef}
        style={{
          minHeight: '400vh',
          paddingTop: '120px',
          paddingBottom: '120px',
          paddingLeft: '48px',
          paddingRight: '48px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ position: 'sticky', top: '120px', display: 'flex', gap: '80px', alignItems: 'flex-start' }}>
          {/* Left: Text */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '32px', fontFamily: 'monospace' }}>
              T6 — FreelancerCharacter + T5 Component Preview
            </p>

            {/* SectionBadge */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>SectionBadge</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <SectionBadge label="Features" />
                <SectionBadge label="How It Works" />
                <SectionBadge label="Pricing" />
              </div>
            </div>

            {/* WobbleCard */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>WobbleCard (hover)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '480px' }}>
                <WobbleCard style={{ padding: '24px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700 }}>Client Discovery</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Find real businesses with gaps.</p>
                </WobbleCard>
                <WobbleCard style={{ padding: '24px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700 }}>AI Pitches</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Personalized in 10 seconds.</p>
                </WobbleCard>
              </div>
            </div>

            {/* AnimatedCounter */}
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>AnimatedCounter</p>
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div>
                  <AnimatedCounter target={2400} suffix="+" style={{ fontSize: '40px', fontWeight: 700, color: 'var(--color-accent)' }} />
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Freelancers</p>
                </div>
                <div>
                  <AnimatedCounter target={94} suffix="%" style={{ fontSize: '40px', fontWeight: 700, color: 'var(--color-accent)' }} />
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Open Rate</p>
                </div>
                <div>
                  <AnimatedCounter target={12} suffix="x" style={{ fontSize: '40px', fontWeight: 700, color: 'var(--color-accent)' }} />
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Faster</p>
                </div>
              </div>
            </div>

            <p style={{ marginTop: '48px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              ↓ Scroll down to see the character change states
            </p>
          </div>

          {/* Right: Character */}
          <div style={{ position: 'sticky', top: '160px' }}>
            <FreelancerCharacter heroRef={heroRef} />
          </div>
        </div>
      </section>

      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
          T5 + T6 verified. Landing page assembles in T17.
        </p>
      </div>
    </div>
  )
}
