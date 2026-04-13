'use client'

import Link from 'next/link'
import Container from './Container'

const footerLinks = {
  Product: [
    { label: 'Features',    href: '/#features' },
    { label: 'How It Works',href: '/#how-it-works' },
    { label: 'Pricing',     href: '/#pricing' },
    { label: 'Changelog',   href: '/changelog' },
  ],
  Company: [
    { label: 'About',       href: '/about' },
    { label: 'Blog',        href: '/blog' },
    { label: 'Careers',     href: '/careers' },
    { label: 'Contact',     href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy',     href: '/privacy' },
    { label: 'Terms',       href: '/terms' },
    { label: 'Cookies',     href: '/cookies' },
  ],
  Connect: [
    { label: 'GitHub',      href: 'https://github.com/Zakuroooo' },
    { label: 'Twitter',     href: '#' },
    { label: 'LinkedIn',    href: '#' },
    { label: 'Discord',     href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backgroundColor: 'var(--color-bg)',
        paddingTop: '64px',
        paddingBottom: '40px',
      }}
    >
      <Container>
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr repeat(4, 1fr)',
            gap: '48px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
          className="grid-cols-2 md:grid-cols-5"
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '12px',
                letterSpacing: '-0.02em',
              }}
            >
              Freelance
              <span style={{ color: 'var(--color-accent)' }}>OS</span>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
                maxWidth: '200px',
              }}
            >
              Your entire freelance business, on autopilot.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '16px',
                }}
              >
                {category}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      fontSize: '13px',
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
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '28px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            © 2026 FreelanceOS. All rights reserved.
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            Built by{' '}
            <Link
              href="https://github.com/Zakuroooo"
              style={{
                color: 'var(--color-accent)',
                textDecoration: 'none',
              }}
            >
              Pranay Sarkar
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  )
}
