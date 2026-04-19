'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import WorldMap from '@/components/ui/world-map'

const FLIGHT_PATHS = [
  { start: { lat: 40.71, lng: -74.01 }, end: { lat: 51.51, lng: -0.13 } },   // NYC → London
  { start: { lat: 37.77, lng: -122.42 }, end: { lat: 35.68, lng: 139.65 } },  // SF → Tokyo
  { start: { lat: -22.91, lng: -43.17 }, end: { lat: 38.72, lng: -9.14 } },   // Rio → Lisbon
  { start: { lat: 28.61, lng: 77.21 }, end: { lat: 1.35, lng: 103.82 } },     // Delhi → Singapore
  { start: { lat: 48.86, lng: 2.35 }, end: { lat: 25.20, lng: 55.27 } },      // Paris → Dubai
]

export default function GlobalReach() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="global"
      ref={ref}
      style={{
        background: '#050507',
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 24px',
      }}
    >
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(196,20,37,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
        filter: 'blur(80px)',
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1.3fr',
        gap: '60px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left: Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-badge" style={{ marginBottom: '20px', display: 'inline-flex' }}>
            Global Reach
          </span>

          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.06,
            color: '#FAFAFA',
            marginTop: '16px',
            marginBottom: '24px',
          }}>
            Find clients from<br />
            every corner of<br />
            <span style={{ color: '#C41425' }}>the world.</span>
          </h2>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '40px',
            maxWidth: '420px',
          }}>
            FreelanceOS scans platforms globally — surface high-fit leads from New York to Singapore, and pitch them automatically.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '13px 24px',
                background: '#C41425',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                borderRadius: '4px',
                boxShadow: '0 0 24px rgba(196,20,37,0.28), 0 1px 2px rgba(0,0,0,0.4)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 0 40px rgba(196,20,37,0.45), 0 4px 16px rgba(0,0,0,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 24px rgba(196,20,37,0.28), 0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              Get Started Free
            </Link>
            <Link
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '13px 24px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                e.currentTarget.style.color = '#FAFAFA'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Right: World Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 40%, transparent 100%)',
          }}
        >
          <WorldMap dots={FLIGHT_PATHS} />
        </motion.div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          #global > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
