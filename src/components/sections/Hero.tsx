'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Variants } from 'framer-motion'
import AnimatedDashboard from '@/components/sections/AnimatedDashboard'

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

const container: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const dashboardIn: Variants = {
  hidden:  { opacity: 0, y: 52 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay: 0.6 } },
}

export default function Hero() {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  return (
    <section
      id="hero"
      style={{
        background: '#050507',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '58px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Very subtle grid background — Raycast-style */}
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Barely-there red glow at top center */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '-80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(196,20,37,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── TEXT CONTENT ── */}
      {ready && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            padding: '64px 24px 0',
            maxWidth: '840px',
            width: '100%',
          }}
        >
          {/* Tiny badge */}
          <motion.div variants={fadeUp} style={{ marginBottom: '24px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C41425',
            }}>
              <span style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#C41425',
                display: 'inline-block',
              }} />
              Freelancer Automation
            </span>
          </motion.div>

          {/* Display headline */}
          <motion.h1 variants={fadeUp} style={{ margin: 0 }}>
            <span style={{
              display: 'block',
              fontSize: 'clamp(44px, 8vw, 96px)',
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: '-0.05em',
              color: '#FAFAFA',
            }}>
              Grow your freelance
            </span>
            <span style={{
              display: 'block',
              fontSize: 'clamp(44px, 8vw, 96px)',
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: '-0.05em',
              color: '#FAFAFA',
              marginTop: '6px',
            }}>
              business —
            </span>
            <span style={{
              display: 'block',
              fontSize: 'clamp(44px, 8vw, 96px)',
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: '-0.05em',
              color: '#C41425',
              marginTop: '6px',
            }}>
              on autopilot.
            </span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            variants={fadeUp}
            style={{
              marginTop: '28px',
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              lineHeight: 1.6,
              color: '#6A6A7A',
              maxWidth: '460px',
              marginLeft: 'auto',
              marginRight: 'auto',
              letterSpacing: '-0.01em',
            }}
          >
            Find real clients. Generate AI-personalized pitches.
            {' '}Send automatically. Get paid.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            style={{
              marginTop: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '12px 22px',
                background: '#C41425',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
                boxShadow: '0 0 20px rgba(196,20,37,0.25)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.88'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Get Started Free
              <ArrowRight size={14} />
            </Link>

            <Link
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 22px',
                background: 'transparent',
                color: '#6A6A7A',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                e.currentTarget.style.color = '#FAFAFA'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#6A6A7A'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              See It Live
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* ── ANIMATED DASHBOARD ── */}
      {ready && (
        <motion.div
          variants={dashboardIn}
          initial="hidden"
          animate="visible"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            padding: '52px 24px 0',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {/* Glow under the dashboard */}
          <div aria-hidden style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: '120px',
            background: 'radial-gradient(ellipse, rgba(196,20,37,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          <AnimatedDashboard />
        </motion.div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .fo-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
