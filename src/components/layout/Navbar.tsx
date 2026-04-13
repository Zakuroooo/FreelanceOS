'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Container from './Container'

const navLinks = [
  { label: 'Features',   href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing',    href: '/#pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/(dashboard)') 
    || pathname?.includes('/dashboard')
    || pathname?.includes('/discover')
    || pathname?.includes('/pitches')
    || pathname?.includes('/outreach')
    || pathname?.includes('/deals')
    || pathname?.includes('/notifications')
    || pathname?.includes('/settings')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Don't show landing navbar inside dashboard
  if (isDashboard) return null

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background 300ms ease, border-color 300ms ease',
        background: scrolled
          ? 'rgba(8,8,15,0.85)'
          : 'transparent',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.07)'
          : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <Container>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '68px',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            Freelance
            <span style={{ color: 'var(--color-accent)' }}>OS</span>
          </Link>

          {/* Desktop nav links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
            className="hidden md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.color =
                    'var(--color-text-primary)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.color =
                    'var(--color-text-secondary)')
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            className="hidden md:flex"
          >
            <Link
              href="/login"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                padding: '8px 16px',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.color =
                  'var(--color-text-primary)')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.color =
                  'var(--color-text-secondary)')
              }
            >
              Log in
            </Link>
            <Link
              href="/signup"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#ffffff',
                backgroundColor: 'var(--color-accent)',
                textDecoration: 'none',
                padding: '9px 20px',
                borderRadius: '8px',
                transition: 'opacity 150ms ease, transform 150ms ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.88'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(8,8,15,0.98)',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              padding: '20px 24px 28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    padding: '10px 0',
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#ffffff',
                    backgroundColor: 'var(--color-accent)',
                    textDecoration: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
