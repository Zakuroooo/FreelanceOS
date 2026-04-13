'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import type { Variants } from 'framer-motion'
import FreelancerCharacter from '@/components/anime/FreelancerCharacter'

// Stagger variants — section entry per CLAUDE.md
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

// Avatar placeholders — 5 stacked circles
const avatarColors = [
  'var(--color-surface-2)',
  'var(--color-accent)',
  'var(--color-surface)',
  'var(--color-surface-2)',
  'var(--color-accent)',
]

export default function Hero() {
  // heroRef passed to the section for useScroll in FreelancerCharacter
  const heroRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={heroRef}
      id="hero"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '80px', // clear navbar
      }}
    >
      {/* Background radial glow — bottom center, subtle */}
      <div
        style={{
          position: 'absolute',
          bottom: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '600px',
          background:
            'radial-gradient(ellipse at center, rgba(255,45,45,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '60px 48px',
          display: 'grid',
          gridTemplateColumns: '55fr 45fr',
          gap: '64px',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        {/* LEFT — Text + CTAs + Social Proof */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Pre-headline badge */}
          <motion.div variants={itemVariants} style={{ marginBottom: '28px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'var(--color-accent-dim)',
                border: '1px solid var(--color-accent-border)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-accent)',
                letterSpacing: '0.04em',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  display: 'inline-block',
                  animation: 'glow-pulse 2s ease-in-out infinite',
                }}
              />
              Freelancer automation platform
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants}>
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(40px, 5.5vw, 72px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
              }}
            >
              Your entire freelance
            </span>
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(40px, 5.5vw, 72px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
              }}
            >
              business,{' '}
              <span style={{ color: 'var(--color-accent)' }}>on autopilot.</span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            style={{
              marginTop: '24px',
              fontSize: '18px',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              maxWidth: '480px',
            }}
          >
            Find clients, pitch automatically, get paid securely.
            <br />
            From zero to revenue — fully automated.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            style={{
              marginTop: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 26px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: 'var(--color-accent)',
                textDecoration: 'none',
                transition: 'opacity 150ms ease, transform 150ms ease',
                boxShadow: '0 0 24px rgba(255,45,45,0.25)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.88'
                e.currentTarget.style.transform = 'scale(1.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>

            <Link
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                border: '1px solid var(--color-border)',
                backgroundColor: 'transparent',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              See How It Works
              <ChevronDown size={15} />
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={itemVariants}
            style={{
              marginTop: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            {/* Avatar stack */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {avatarColors.map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '2px solid var(--color-bg)',
                    marginLeft: i === 0 ? '0' : '-10px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>

            {/* Stars + count */}
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '3px' }}>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="var(--color-warning)"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  2,400+
                </span>{' '}
                freelancers using FreelanceOS
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT — FreelancerCharacter */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Card frame */}
          <div
            style={{
              width: '280px',
              height: '380px',
              borderRadius: '24px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'visible',
              boxShadow:
                '0 0 80px rgba(255,45,45,0.06), 0 0 160px rgba(255,45,45,0.03)',
            }}
          >
            {/* Subtle ambient glow pulse */}
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '26px',
                background:
                  'linear-gradient(135deg, rgba(255,45,45,0.06) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            <FreelancerCharacter heroRef={heroRef} />
          </div>
        </motion.div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding: 40px 24px !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 375px) {
          .hero-grid {
            padding: 32px 16px !important;
          }
        }
      `}</style>
    </section>
  )
}
