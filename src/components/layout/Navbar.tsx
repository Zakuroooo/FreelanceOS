'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, X, Menu } from 'lucide-react'
import type { Variants } from 'framer-motion'

const navLinks = [
  { label: 'Features',     href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing',      href: '/#pricing' },
]

const dropVariants: Variants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      {/*
        Raw CSS injected — 100% bulletproof responsive,
        no Tailwind class conflicts possible
      */}
      <style>{`
        .fo-desktop-nav  { display: none; }
        .fo-desktop-cta  { display: none; }
        .fo-hamburger    { display: flex; }
        @media (min-width: 768px) {
          .fo-desktop-nav { display: flex; }
          .fo-desktop-cta { display: flex; }
          .fo-hamburger   { display: none; }
        }
        .fo-nav-link {
          font-size: 13px;
          font-weight: 400;
          color: #8A8A9A;
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 4px;
          transition: color 0.15s ease, background 0.15s ease;
          letter-spacing: -0.01em;
        }
        .fo-nav-link:hover {
          color: #FAFAFA;
          background: rgba(255,255,255,0.05);
        }
        .fo-login-link {
          font-size: 13px;
          font-weight: 400;
          color: #8A8A9A;
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 4px;
          transition: color 0.15s ease;
          letter-spacing: -0.01em;
        }
        .fo-login-link:hover { color: #FAFAFA; }
        .fo-cta-link {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          background-color: #C41425;
          text-decoration: none;
          padding: 7px 16px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          letter-spacing: -0.01em;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .fo-cta-link:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .fo-logo {
          font-size: 15px;
          font-weight: 700;
          color: #FAFAFA;
          text-decoration: none;
          letter-spacing: -0.04em;
          display: flex;
          align-items: center;
        }
        .fo-logo-accent { color: #C41425; }
      `}</style>

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '58px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 220ms ease, border-bottom 220ms ease',
          background: scrolled ? 'rgba(5,5,7,0.9)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1160px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Logo */}
          <Link href="/" className="fo-logo">
            Freelance<span className="fo-logo-accent">OS</span>
          </Link>

          {/* Center nav — desktop only (raw CSS, not Tailwind) */}
          <nav className="fo-desktop-nav" style={{ alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="fo-nav-link">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right CTAs — desktop only (raw CSS) */}
          <div className="fo-desktop-cta" style={{ alignItems: 'center', gap: '2px' }}>
            <Link href="/login" className="fo-login-link">Log in</Link>
            <Link href="/signup" className="fo-cta-link">
              Get Started <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* Hamburger — mobile only (raw CSS) */}
          <button
            className="fo-hamburger"
            onClick={() => setMobileOpen(v => !v)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#FAFAFA',
              padding: '4px',
              borderRadius: '4px',
              lineHeight: 0,
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropVariants}
            style={{
              position: 'fixed',
              top: '58px',
              left: 0,
              right: 0,
              zIndex: 99,
              background: 'rgba(5,5,7,0.97)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              padding: '12px 24px 20px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '16px' }}>
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: '15px',
                    fontWeight: 400,
                    color: '#8A8A9A',
                    textDecoration: 'none',
                    padding: '10px 2px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#8A8A9A',
                  textDecoration: 'none',
                  padding: '10px 0',
                  textAlign: 'center',
                }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: '#C41425',
                  textDecoration: 'none',
                  padding: '12px',
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
