'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import type { Variants } from 'framer-motion'

const navLinks = [
  { label: 'Features',      href: '/#features' },
  { label: 'How It Works',  href: '/#how-it-works' },
  { label: 'Pricing',       href: '/#pricing' },
]

const DASHBOARD_PATHS = [
  '/dashboard', '/discover', '/clients',
  '/pitches', '/outreach', '/deals',
  '/notifications', '/settings',
]

const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isDashboard = DASHBOARD_PATHS.some(p =>
    pathname?.includes(p)
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (isDashboard) return null

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 250ms ease, border-bottom-color 250ms ease',
          backgroundColor: scrolled ? 'rgba(6, 6, 8, 0.88)' : 'transparent',
          borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '1px',
            }}
          >
            Freelance
            <span style={{ color: 'var(--color-accent)' }}>OS</span>
          </Link>

          {/* Desktop Nav — always visible on ≥ 768px */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            className="hidden md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs — always visible on ≥ 768px */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            className="hidden md:flex"
          >
            <Link
              href="/login"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)' }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: 'var(--color-accent)',
                textDecoration: 'none',
                padding: '7px 16px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
                letterSpacing: '-0.01em',
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
              Get Started
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* Mobile hamburger — ONLY on < 768px */}
          <button
            className="flex md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              padding: '4px',
              borderRadius: '4px',
              lineHeight: 0,
            }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown — only renders on mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              right: 0,
              zIndex: 99,
              backgroundColor: 'rgba(6, 6, 8, 0.97)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '16px 24px 24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '20px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    display: 'block',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center',
                }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: 'var(--color-accent)',
                  textDecoration: 'none',
                  padding: '11px 12px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
