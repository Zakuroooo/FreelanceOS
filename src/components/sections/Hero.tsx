'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Variants } from 'framer-motion'
import { SparklesCore } from '@/components/ui/sparkles'
import AnimatedDashboard from '@/components/sections/AnimatedDashboard'

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

const container: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const dashboardIn: Variants = {
  hidden:  { opacity: 0, y: 52 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const ROLES = [
  'Web Developers.',
  'Video Creators.',
  'UI Designers.',
  'Copywriters.',
  'Marketing Pros.',
]

function TypewriterCycle({ words, speed = 80, pause = 1800 }: { words: string[]; speed?: number; pause?: number }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIndex]
    let timer: NodeJS.Timeout

    if (!deleting && charIndex < word.length) {
      timer = setTimeout(() => setCharIndex((c) => c + 1), speed)
    } else if (!deleting && charIndex === word.length) {
      timer = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timer = setTimeout(() => setCharIndex((c) => c - 1), speed / 2)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setWordIndex((i) => (i + 1) % words.length)
    }

    return () => clearTimeout(timer)
  }, [charIndex, deleting, wordIndex, words, speed, pause])

  const current = words[wordIndex].slice(0, charIndex)

  return (
    <span style={{ color: '#C41425' }}>
      {current}
      <span style={{
        display: 'inline-block',
        width: '2px',
        height: '0.85em',
        background: '#C41425',
        marginLeft: '2px',
        verticalAlign: 'text-bottom',
        animation: 'tw-blink 0.65s step-end infinite',
      }} />
      <style>{`@keyframes tw-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  )
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
        paddingTop: '84px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── DIAGONAL LIGHT TRAIL 1 — top-left sweep (primary) ── */}
      {/* Halo layer — wide soft glow */}
      <div aria-hidden className="light-trail-halo" style={{
        width: '900px',
        height: '90px',
        top: '10%',
        left: '-18%',
        animation: 'trail-drift 10s ease-in-out infinite',
      }} />
      {/* Core beam — sharp bright line */}
      <div aria-hidden className="light-trail" style={{
        width: '900px',
        height: '3px',
        top: 'calc(10% + 43px)',
        left: '-18%',
        animation: 'trail-drift 10s ease-in-out infinite',
      }} />

      {/* ── DIAGONAL LIGHT TRAIL 2 — top-right sweep (secondary, fainter) ── */}
      {/* Halo */}
      <div aria-hidden className="light-trail-halo" style={{
        width: '700px',
        height: '70px',
        top: '8%',
        right: '-14%',
        opacity: 0.55,
        animation: 'trail-drift-r 12s ease-in-out infinite',
      }} />
      {/* Core */}
      <div aria-hidden className="light-trail" style={{
        width: '700px',
        height: '2px',
        top: 'calc(8% + 34px)',
        right: '-14%',
        opacity: 0.6,
        animation: 'trail-drift-r 12s ease-in-out infinite',
      }} />

      {/* ── SUBTLE GRID BACKGROUND ── */}
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

      {/* ── CRIMSON GLOW ORB — top center, larger than before ── */}
      <div aria-hidden className="glow-orb" style={{
        width: '680px',
        height: '520px',
        top: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
      }} />

      {/* ── SPARKLES — behind headline ── */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1100px',
        height: '500px',
        pointerEvents: 'none',
        zIndex: 1,
        maskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%)',
      }}>
        <SparklesCore
          background="transparent"
          minSize={1}
          maxSize={2.5}
          particleDensity={120}
          particleColor="#C41425"
          speed={0.8}
        />
      </div>

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
            padding: '72px 24px 0',
            maxWidth: '860px',
            width: '100%',
          }}
        >
          {/* Badge — plain text, no box */}
          <motion.div variants={fadeUp} style={{ marginBottom: '28px' }}>
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
                boxShadow: '0 0 6px rgba(196,20,37,0.8)',
                flexShrink: 0,
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

          {/* Subline with typewriter */}
          <motion.p
            variants={fadeUp}
            style={{
              marginTop: '28px',
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: '520px',
              marginLeft: 'auto',
              marginRight: 'auto',
              letterSpacing: '-0.01em',
            }}
          >
            Built for{' '}
            <TypewriterCycle words={ROLES} speed={75} pause={2000} />
            <br />
            Find clients. AI-pitch. Get paid.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            style={{
              marginTop: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {/* Primary — crimson with glow */}
            <Link
              href="/signup"
              className="fo-hero-cta-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '13px 24px',
                background: '#C41425',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 0 24px rgba(196,20,37,0.28), 0 1px 2px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.88'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 0 40px rgba(196,20,37,0.45), 0 4px 16px rgba(0,0,0,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 24px rgba(196,20,37,0.28), 0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              Get Started Free
              <ArrowRight size={14} />
            </Link>

            {/* Secondary — ghost */}
            <Link
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '13px 24px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.45)',
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
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
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
            width: '75%',
            height: '140px',
            background: 'radial-gradient(ellipse, rgba(196,20,37,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          <AnimatedDashboard />
        </motion.div>
      )}
    </section>
  )
}
