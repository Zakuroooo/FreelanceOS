'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import type { Variants } from 'framer-motion'

// Smooth stagger — Raycast-style entrance
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const fadeInVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

// 5 avatar initials for social proof
const avatars = ['P', 'S', 'K', 'A', 'M']

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  function scrollToNext() {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '60px', // navbar height
      }}
    >
      {/* Ambient red glow — very subtle, not in-your-face */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(232,39,31,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* TOP grid lines — horizontal rule Raycast-style subtle structure */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          zIndex: 0,
        }}
      />

      {/* Main content — centered */}
      {mounted && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <motion.div variants={fadeUpVariants} style={{ marginBottom: '28px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                padding: '5px 12px',
                border: '1px solid var(--color-accent-border)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-accent-dim)',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  display: 'inline-block',
                }}
                className="animate-glow-pulse"
              />
              Freelancer Automation Platform
            </span>
          </motion.div>

          {/* Display headline — massive, centered */}
          <motion.h1 variants={fadeUpVariants}>
            <span
              style={{
                display: 'block',
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.04em',
                fontSize: 'clamp(48px, 8.5vw, 92px)',
                color: 'var(--color-text-primary)',
              }}
            >
              Your entire freelance
            </span>
            <span
              style={{
                display: 'block',
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.04em',
                fontSize: 'clamp(48px, 8.5vw, 92px)',
                color: 'var(--color-text-primary)',
                marginTop: '4px',
              }}
            >
              business,{' '}
              <span
                style={{
                  color: 'var(--color-accent)',
                  // Neon-style — white text works with deep red
                  textShadow: '0 0 40px rgba(232,39,31,0.35)',
                }}
              >
                on autopilot.
              </span>
            </span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            variants={fadeUpVariants}
            style={{
              marginTop: '28px',
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              lineHeight: 1.65,
              color: 'var(--color-text-secondary)',
              maxWidth: '520px',
              margin: '28px auto 0',
              letterSpacing: '-0.01em',
            }}
          >
            Find real clients. Generate AI-personalized pitches.
            <br />
            Send automatically. Get paid securely.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUpVariants}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '36px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '12px 24px',
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                borderRadius: '4px',
                border: '1px solid transparent',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
                boxShadow: '0 0 24px rgba(232,39,31,0.2)',
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
              Get Started — It&apos;s free
              <ArrowRight size={14} />
            </Link>

            <Link
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.15s ease, color 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={fadeInVariants}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '32px',
            }}
          >
            {/* Stacked avatars */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {avatars.map((initial, i) => (
                <div
                  key={i}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: i === 0 ? 'var(--color-accent)' : `hsl(${220 + i * 30}, 15%, ${20 + i * 3}%)`,
                    border: '2px solid var(--color-bg)',
                    marginLeft: i === 0 ? 0 : '-8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                    letterSpacing: 0,
                    position: 'relative',
                    zIndex: avatars.length - i,
                  }}
                >
                  {initial}
                </div>
              ))}
            </div>

            {/* Divider dot */}
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--color-text-muted)', display: 'inline-block' }} />

            {/* Stars */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="var(--color-warning)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', letterSpacing: '-0.01em' }}>
              <strong style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>2,400+</strong> freelancers
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* BELOW FOLD — Dashboard Preview Card */}
      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '1100px',
            margin: '60px auto 0',
            padding: '0 24px',
          }}
        >
          {/* Product preview card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7)',
              position: 'relative',
            }}
          >
            {/* Browser chrome bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                backgroundColor: 'var(--color-surface-2)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 12px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-success)',
                      display: 'inline-block',
                      opacity: 0.8,
                    }}
                  />
                  app.freelanceos.io
                </div>
              </div>
            </div>

            {/* Dashboard mockup content */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                minHeight: '420px',
                backgroundColor: 'var(--color-bg)',
              }}
            >
              {/* Sidebar */}
              <div
                style={{
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  padding: '20px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    padding: '8px 10px',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Freelance<span style={{ color: 'var(--color-accent)' }}>OS</span>
                </div>
                {[
                  ['Overview', true],
                  ['Discover', false],
                  ['Clients', false],
                  ['Pitches', false],
                  ['Outreach', false],
                  ['Deals', false],
                ].map(([label, active]) => (
                  <div
                    key={String(label)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      backgroundColor: active ? 'var(--color-surface)' : 'transparent',
                      borderLeft: `2px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Total Clients', value: '247', delta: '+12 this week' },
                    { label: 'Pitches Sent', value: '1,840', delta: '+33 today' },
                    { label: 'Active Deals', value: '8', delta: '$12,400 value' },
                    { label: 'Total Earned', value: '$48K', delta: 'this month' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                      }}
                    >
                      <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 500 }}>
                        {stat.label}
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {stat.value}
                      </p>
                      <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {stat.delta}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Recent Pitches
                  </div>
                  {[
                    { client: 'Apex Digital Co.', status: 'Sent', score: '94%', type: 'Cold Email' },
                    { client: 'Bloom Creative',   status: 'Replied', score: '87%', type: 'LinkedIn DM' },
                    { client: 'Peak Commerce',    status: 'Deal',   score: '91%', type: 'Full Proposal' },
                    { client: 'Fresh Studio',     status: 'Queued', score: '89%', type: 'Cold Email' },
                  ].map((row) => (
                    <div
                      key={row.client}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto auto',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '10px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{row.client}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{row.type}</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{row.score}</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          backgroundColor:
                            row.status === 'Deal'    ? 'rgba(0,201,167,0.12)' :
                            row.status === 'Replied' ? 'rgba(245,158,11,0.12)' :
                            row.status === 'Sent'    ? 'rgba(232,39,31,0.12)' :
                            'rgba(255,255,255,0.06)',
                          color:
                            row.status === 'Deal'    ? 'var(--color-success)' :
                            row.status === 'Replied' ? 'var(--color-warning)' :
                            row.status === 'Sent'    ? 'var(--color-accent)' :
                            'var(--color-text-muted)',
                        }}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Scroll indicator */}
      {mounted && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          onClick={scrollToNext}
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '40px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'color 0.15s ease',
            paddingBottom: '24px',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <ChevronDown size={14} className="animate-float-bob" />
          Scroll to explore
        </motion.button>
      )}

      {/* Mobile styles */}
      <style>{`
        @media (max-width: 767px) {
          .dashboard-preview-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-preview-sidebar {
            display: none !important;
          }
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
