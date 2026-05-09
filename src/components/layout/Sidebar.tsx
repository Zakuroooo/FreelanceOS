'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
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
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Overview',      href: '/dashboard',      icon: LayoutDashboard },
  { label: 'Discover',      href: '/discover',       icon: Search },
  { label: 'Clients',       href: '/clients',        icon: Users },
  { label: 'Pitches',       href: '/pitches',        icon: FileText },
  { label: 'Outreach',      href: '/outreach',       icon: Send },
  { label: 'Deals',         href: '/deals',          icon: Handshake },
  { label: 'Notifications', href: '/notifications',  icon: Bell },
  { label: 'Settings',      href: '/settings',       icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        width: 220,
        minHeight: '100vh',
        backgroundColor: '#060608',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0 0',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* ── Logo ───────────────────────────────────────── */}
      <div style={{ padding: '0 20px 28px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
          }}
        >
          {/* Signal arc SVG mark */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="2.5" fill="#C41425" />
            <path d="M7 11a4 4 0 0 1 4-4" stroke="#C41425" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
            <path d="M4 11a7 7 0 0 1 7-7" stroke="#C41425" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
            <path d="M15 11a4 4 0 0 0-4-4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M18 11a7 7 0 0 0-7-7" stroke="rgba(255,255,255,0.08)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>

          <span style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            <span style={{ color: '#FAFAFA' }}>Freelance</span>
            <span style={{ color: '#C41425' }}>OS</span>
          </span>
        </Link>
      </div>

      {/* ── Nav items ──────────────────────────────────── */}
      <nav style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '0 12px',
        overflowY: 'auto',
      }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname?.startsWith(href + '/'))

          const activeStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            color: '#FAFAFA',
            backgroundColor: 'rgba(196,20,37,0.06)',
            borderLeft: '3px solid #C41425',
            borderRadius: '0 4px 4px 0',
            transition: 'all 0.15s ease',
            letterSpacing: '-0.01em',
          }

          const inactiveStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            backgroundColor: 'transparent',
            borderLeft: '3px solid transparent',
            borderRadius: 4,
            transition: 'all 0.15s ease',
            letterSpacing: '-0.01em',
          }

          return (
            <Link
              key={href}
              href={href}
              style={isActive ? activeStyle : inactiveStyle}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                }
              }}
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ── Bottom section ─────────────────────────────── */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {/* Upgrade to Pro */}
        <Link
          href="/#pricing"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            borderRadius: 4,
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: 600,
            color: '#C41425',
            backgroundColor: 'rgba(196,20,37,0.08)',
            border: '1px solid rgba(196,20,37,0.2)',
            letterSpacing: '-0.01em',
            marginBottom: 2,
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(196,20,37,0.4)'
            e.currentTarget.style.backgroundColor = 'rgba(196,20,37,0.14)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(196,20,37,0.2)'
            e.currentTarget.style.backgroundColor = 'rgba(196,20,37,0.08)'
          }}
        >
          <Zap size={13} strokeWidth={2.2} />
          Upgrade to Pro
        </Link>

        {/* Log out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.3)',
            width: '100%',
            textAlign: 'left',
            letterSpacing: '-0.01em',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#C41425'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
          }}
        >
          <LogOut size={15} strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </motion.aside>
  )
}
