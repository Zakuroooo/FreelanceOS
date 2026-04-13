'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Menu } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features',     href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing',      href: '/#pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <style>{`
        /* BULLETPROOF — raw CSS, no Tailwind interference */
        .fo-right   { display: none; }
        .fo-burger  { display: flex; }
        @media (min-width: 768px) {
          .fo-right  { display: flex; }
          .fo-burger { display: none; }
        }

        .fo-logo {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #F0EEF8;
          text-decoration: none;
          flex-shrink: 0;
        }
        .fo-logo em { color: #c30101; font-style: normal; }

        .fo-link {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0em;
          color: rgba(240,238,248,0.38);
          text-decoration: none;
          padding: 5px 11px;
          border-radius: 4px;
          transition: color 0.14s;
          white-space: nowrap;
        }
        .fo-link:hover { color: rgba(240,238,248,0.85); }

        .fo-sep {
          width: 1px;
          height: 16px;
          background: rgba(255,255,255,0.08);
          margin: 0 6px;
          flex-shrink: 0;
        }

        .fo-login {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0em;
          color: rgba(240,238,248,0.38);
          text-decoration: none;
          padding: 5px 10px;
          transition: color 0.14s;
          white-space: nowrap;
        }
        .fo-login:hover { color: rgba(240,238,248,0.85); }

        .fo-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #c30101;
          color: #fff;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 4px;
          transition: opacity 0.14s, transform 0.14s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .fo-cta:hover { opacity: 0.84; transform: translateY(-1px); }
        .fo-cta svg { flex-shrink: 0; }
      `}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '56px', zIndex: 100,
        display: 'flex', alignItems: 'center',
        transition: 'background 220ms ease, border-color 220ms ease',
        background: scrolled ? 'rgba(5,5,7,0.92)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: '1160px',
          margin: '0 auto', padding: '0 28px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
        }}>
          {/* Logo — LEFT */}
          <Link href="/" className="fo-logo">
            Freelance<em>OS</em>
          </Link>

          {/* All nav + CTA — RIGHT (desktop only via raw CSS) */}
          <div className="fo-right" style={{ alignItems: 'center', gap: '0' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="fo-link">{l.label}</Link>
            ))}
            <div className="fo-sep" />
            <Link href="/login" className="fo-login">Log in</Link>
            <div style={{ width: '8px' }} />
            <Link href="/signup" className="fo-cta">
              Get Started
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 7.5L7.5 1.5M7.5 1.5H2.5M7.5 1.5V6.5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Hamburger — mobile only (raw CSS) */}
          <button
            className="fo-burger"
            onClick={() => setMobileOpen(v => !v)}
            style={{
              alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#F0EEF8', padding: '4px', lineHeight: 0,
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
            style={{
              position: 'fixed', top: '56px', left: 0, right: 0,
              zIndex: 99, background: 'rgba(5,5,7,0.97)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)', padding: '10px 28px 24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: '15px', fontWeight: 400, color: 'rgba(240,238,248,0.5)',
                    textDecoration: 'none', padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <Link href="/login" onClick={() => setMobileOpen(false)}
                style={{ fontSize: '13px', fontWeight: 400, color: 'rgba(240,238,248,0.45)',
                  textDecoration: 'none', textAlign: 'center', padding: '10px' }}>
                Log in
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}
                style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em',
                  textTransform: 'uppercase', color: '#fff', background: '#c30101',
                  textDecoration: 'none', padding: '13px', borderRadius: '4px',
                  textAlign: 'center', display: 'block' }}>
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
