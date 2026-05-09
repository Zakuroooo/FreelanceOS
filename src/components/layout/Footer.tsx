'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/ui/Logo'

const LINKS = {
  Pages: [
    { label: 'All Products', href: '/#products' },
    { label: 'Studio',       href: '/#studio' },
    { label: 'Clients',      href: '/#clients' },
    { label: 'Pricing',      href: '/#pricing' },
    { label: 'Blog',         href: '/blog' },
  ],
  Socials: [
    { label: 'Facebook',     href: 'https://facebook.com', target: '_blank' },
    { label: 'Instagram',    href: 'https://instagram.com', target: '_blank' },
    { label: 'Twitter',      href: 'https://twitter.com', target: '_blank' },
    { label: 'LinkedIn',     href: 'https://linkedin.com', target: '_blank' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy',  href: '/cookies' },
  ],
  Register: [
    { label: 'Sign Up',        href: '/signup' },
    { label: 'Login',          href: '/login' },
    { label: 'Forgot Password', href: '/forgot-password' },
  ]
}

export default function Footer() {
  const pathname = usePathname()
  const year = new Date().getFullYear()

  if (pathname?.startsWith('/dashboard')) return null

  return (
    <footer style={{ background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>

      {/* Top Border Line */}
       <div style={{
        height: '1px',
        background: 'rgba(255, 255, 255, 0.05)',
        width: 'calc(100% - 40px)',
        margin: '0 auto',
      }} />


      {/* Huge Background Watermark */}
       <div aria-hidden style={{
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '14vw',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        color: 'rgba(255,255,255,0.03)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
        lineHeight: 0.8,
        zIndex: 0,
        width: '100%',
        textAlign: 'center'
      }}>
        FreelanceOS
      </div>


      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px 100px',
        position: 'relative',
        zIndex: 1,
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(250px, 3.5fr) 1.5fr 1.5fr 1.5fr 1.5fr',
          gap: '40px',
        }}>

          {/* Column 1: Brand & Copyright */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Logo size="sm" showTagline={true} />
            </div>
            
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.4)',
              maxWidth: '280px',
              paddingRight: '20px'
            }}>
              © copyright FreelanceOS {year}. All rights reserved.
            </p>
          </div>


          {/* Link Columns */}
          {(Object.entries(LINKS) as [string, { label: string; href: string; target?: string }[]][]).map(([section, items]) => (
            <div key={section} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                marginBottom: '24px',
              }}>
                {section}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={link.target}
                    rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: 'rgba(255, 255, 255, 0.6)',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

        </div>

      </div>
      
       {/* Responsive adjustments */}
       <style>{`
        @media (max-width: 900px) {
           footer > div:nth-of-type(3) > div {
             grid-template-columns: 1fr 1fr !important;
           }
           footer > div:nth-of-type(3) > div > div:first-child {
             grid-column: 1 / -1;
             margin-bottom: 20px;
           }
        }
        @media (max-width: 500px) {
           footer > div:nth-of-type(3) > div {
             grid-template-columns: 1fr !important;
           }
        }
      `}</style>
      
    </footer>
  )
}
