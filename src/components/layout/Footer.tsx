'use client'

import Link from 'next/link'

const LINKS = {
  Product: [
    { label: 'Features',     href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing',      href: '/#pricing' },
    { label: 'Changelog',    href: '/changelog' },
    { label: 'Roadmap',      href: '/roadmap' },
  ],
  Company: [
    { label: 'About',        href: '/about' },
    { label: 'Blog',         href: '/blog' },
    { label: 'Careers',      href: '/careers' },
    { label: 'Contact',      href: '/contact' },
  ],
  Developers: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference',  href: '/api' },
    { label: 'Status',         href: '/status' },
    { label: 'GitHub',         href: 'https://github.com', target: '_blank' },
  ],
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#030305', position: 'relative', overflow: 'hidden' }}>

      {/* Large watermark — very low opacity, premium detail */}
      <div aria-hidden style={{
        position: 'absolute',
        bottom: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '160px',
        fontWeight: 900,
        letterSpacing: '-0.06em',
        color: 'rgba(255,255,255,0.012)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
        lineHeight: 1,
      }}>
        FreelanceOS
      </div>

      {/* Top border */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      <div style={{
        maxWidth: '1160px',
        margin: '0 auto',
        padding: '64px 28px 44px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Main grid: brand left + links right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '60px',
          marginBottom: '56px',
        }}>

          {/* Brand column */}
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#F0EEF8',
              marginBottom: '12px',
            }}>
              Freelance<span style={{ color: '#c30101' }}>OS</span>
            </div>
            <p style={{
              fontSize: '13px',
              lineHeight: 1.65,
              color: '#3A3A5A',
              maxWidth: '220px',
              letterSpacing: '-0.01em',
            }}>
              The operating system for modern freelancers. Find clients, pitch automatically, get paid.
            </p>

            {/* Status badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '20px',
              padding: '5px 10px',
              background: 'rgba(0,201,167,0.06)',
              border: '1px solid rgba(0,201,167,0.12)',
              borderRadius: '4px',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#00C9A7',
                display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#00C9A7', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                All systems operational
              </span>
            </div>
          </div>

          {/* Link columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {(Object.entries(LINKS) as [string, { label: string; href: string; target?: string }[]][]).map(([section, items]) => (
              <div key={section}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#F0EEF8',
                  marginBottom: '14px',
                }}>
                  {section}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {items.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={link.target}
                      rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                      style={{
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#3A3A5A',
                        textDecoration: 'none',
                        letterSpacing: '-0.01em',
                        transition: 'color 0.14s ease',
                        display: 'inline-block',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#8A8AA8' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#3A3A5A' }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '24px' }} />

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <span style={{
            fontSize: '12px',
            color: '#2A2A3A',
            letterSpacing: '-0.01em',
          }}>
            © {year} FreelanceOS. All rights reserved.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cookies', href: '/cookies' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontSize: '12px',
                  color: '#2A2A3A',
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#6A6A8A' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#2A2A3A' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .fo-footer-grid {
            grid-template-columns: 1fr !important;
          }
          .fo-footer-links {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </footer>
  )
}
