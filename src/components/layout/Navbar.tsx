'use client'

import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const NAV_LINKS = [
  { name: 'Features',     link: '#features' },
  { name: 'How It Works', link: '#how-it-works' },
  { name: 'Pricing',      link: '#pricing' },
  { name: 'FAQ',          link: '#faq' },
]

export default function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useMotionValueEvent(scrollY, 'change', (val) => {
    setScrolled(val > 80)
  })

  return (
    <nav
      style={{
        position: 'fixed',
        top: '16px',
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px',
        pointerEvents: 'none',
      }}
    >
      {/* Desktop Navbar — Framer Motion animated width */}
      <motion.div
        animate={{
          maxWidth: scrolled ? 860 : 1050,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 30,
          mass: 0.8,
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: scrolled ? '10px 22px' : '14px 28px',
          borderRadius: '9999px',
          background: 'rgba(6, 6, 8, 0.35)',
          backdropFilter: 'blur(32px) saturate(190%)',
          WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          pointerEvents: 'auto',
          transition: 'padding 0.3s ease',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            color: '#F0EEF8',
            textDecoration: 'none',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          Freelance<span style={{ color: '#c30101' }}>OS</span>
        </Link>

        {/* Nav Links — Desktop */}
        <div
          onMouseLeave={() => setHoveredIdx(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            position: 'relative',
          }}
          className="nav-links-desktop"
        >
          {NAV_LINKS.map((item, idx) => (
            <Link
              key={item.link}
              href={item.link}
              onMouseEnter={() => setHoveredIdx(idx)}
              style={{
                position: 'relative',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 400,
                color: hoveredIdx === idx ? 'rgba(240,238,248,0.88)' : 'rgba(240,238,248,0.38)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
                borderRadius: '6px',
              }}
            >
              {hoveredIdx === idx && (
                <motion.span
                  layoutId="nav-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} className="nav-cta-desktop">
          <Link
            href="/login"
            style={{
              fontSize: '13px',
              fontWeight: 400,
              color: 'rgba(240,238,248,0.38)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'color 0.15s, background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(240,238,248,0.88)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,238,248,0.38)'; e.currentTarget.style.background = 'transparent' }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              background: '#c30101',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              textDecoration: 'none',
              borderRadius: '4px',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(195,1,1,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Get Started
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1.5 7.5L7.5 1.5M7.5 1.5H2.5M7.5 1.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="nav-hamburger"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#F0EEF8',
            padding: '4px',
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
          )}
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 16,
              right: 16,
              marginTop: '8px',
              borderRadius: '12px',
              background: 'rgba(6,6,8,0.97)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
              padding: '16px 20px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
              pointerEvents: 'auto',
            }}
            className="nav-mobile-menu"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '10px 0',
                  fontSize: '14px',
                  color: 'rgba(240,238,248,0.45)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(240,238,248,0.88)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,238,248,0.45)' }}
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
