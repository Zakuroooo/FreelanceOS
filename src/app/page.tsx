'use client'

import SectionBadge from '@/components/ui/SectionBadge'
import WobbleCard from '@/components/ui/WobbleCard'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        padding: '120px 48px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '64px',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* T5 Verification */}
      <section>
        <h2 style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px', fontFamily: 'monospace' }}>
          T5 — Component Preview
        </h2>

        {/* SectionBadge */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>SectionBadge</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <SectionBadge label="Features" />
            <SectionBadge label="How It Works" />
            <SectionBadge label="Pricing" />
            <SectionBadge label="The Problem" />
          </div>
        </div>

        {/* WobbleCard */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>WobbleCard (hover me)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <WobbleCard style={{ padding: '32px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Feature Card</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Client Discovery</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Find real businesses with detected gaps.</p>
            </WobbleCard>
            <WobbleCard style={{ padding: '32px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Feature Card</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>AI Pitch Engine</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Generate personalized pitches in seconds.</p>
            </WobbleCard>
          </div>
        </div>

        {/* AnimatedCounter */}
        <div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>AnimatedCounter (scroll to trigger)</p>
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <AnimatedCounter
                target={2400}
                suffix="+"
                style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-accent)' }}
              />
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Freelancers</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <AnimatedCounter
                target={94}
                suffix="%"
                style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-accent)' }}
              />
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Open Rate</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <AnimatedCounter
                target={12}
                suffix="x"
                style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-accent)' }}
              />
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Faster</p>
            </div>
          </div>
        </div>
      </section>

      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
        Landing page assembles in T17. This is T5 component verification only.
      </p>
    </div>
  )
}
