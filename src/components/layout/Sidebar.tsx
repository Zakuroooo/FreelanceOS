'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import {
  LayoutDashboard,
  Search,
  Users,
  FileText,
  Send,
  Handshake,
  Bell,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Overview',      href: '/dashboard',       icon: LayoutDashboard },
  { label: 'Discover',      href: '/discover',        icon: Search },
  { label: 'Clients',       href: '/clients',         icon: Users },
  { label: 'Pitches',       href: '/pitches',         icon: FileText },
  { label: 'Outreach',      href: '/outreach',        icon: Send },
  { label: 'Deals',         href: '/deals',           icon: Handshake },
  { label: 'Notifications', href: '/notifications',   icon: Bell },
  { label: 'Settings',      href: '/settings',        icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 28px' }}>
        <Link
          href="/"
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          <Logo size="sm" />
        </Link>
      </div>

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '0 12px',
        }}
      >
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href ||
            pathname?.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? 500 : 400,
                color: isActive
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
                backgroundColor: isActive
                  ? 'var(--color-surface)'
                  : 'transparent',
                borderLeft: isActive
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-surface)'
                  e.currentTarget.style.color =
                    'var(--color-text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    'transparent'
                  e.currentTarget.style.color =
                    'var(--color-text-secondary)'
                }
              }}
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — upgrade + logout */}
      <div
        style={{
          padding: '16px 12px 0',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginTop: '16px',
        }}
      >
        {/* Upgrade pill */}
        <Link
          href="/#pricing"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-accent)',
            backgroundColor: 'var(--color-accent-dim)',
            border: '1px solid var(--color-accent-border)',
            marginBottom: '4px',
          }}
        >
          <Zap size={13} />
          Upgrade to Pro
        </Link>

        {/* Logout */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            width: '100%',
            textAlign: 'left',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.color =
              'var(--color-error)')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.color =
              'var(--color-text-muted)')
          }
        >
          <LogOut size={15} strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </aside>
  )
}
