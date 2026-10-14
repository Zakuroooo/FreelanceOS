'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Search, Users, FileText,
  Send, Handshake, Bell, Settings, LogOut, Zap, UsersRound } from 'lucide-react'
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'

const navItems = [
  { label: 'Overview',   href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Discover',   href: '/discover',      icon: Search },
  { label: 'Clients',    href: '/clients',       icon: Users },
  { label: 'Pitches',    href: '/pitches',       icon: FileText },
  { label: 'Outreach',   href: '/outreach',      icon: Send },
  { label: 'Deals',      href: '/deals',         icon: Handshake },
  { label: 'Alerts',     href: '/notifications', icon: Bell },
  { label: 'Team',       href: '/team',          icon: UsersRound },
  { label: 'Settings',   href: '/settings',      icon: Settings },
]

function NavItem({
  href, icon: Icon, label, isActive, expanded,
}: {
  href: string; icon: React.ElementType; label: string; isActive: boolean; expanded: boolean;
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
    >
      <motion.div
        animate={{
          backgroundColor: isActive
            ? 'rgba(196,20,37,0.10)'
            : hovered
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Active indicator glow line */}
        {isActive && (
          <motion.div
            layoutId="activeBar"
            style={{
              position: 'absolute', left: 0, top: '20%', bottom: '20%',
              width: 3, borderRadius: '0 3px 3px 0',
              background: 'linear-gradient(180deg, #ff2d40, #C41425)',
              boxShadow: '0 0 12px rgba(196,20,37,0.6)',
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}

        {/* Icon */}
        <motion.div
          animate={{
            color: isActive ? '#ff4455' : hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
            scale: hovered ? 1.1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ flexShrink: 0, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
        </motion.div>

        {/* Label */}
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#FAFAFA' : hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Hover tooltip when collapsed */}
        <AnimatePresence>
          {hovered && !expanded && (
            <motion.div
              initial={{ opacity: 0, x: -4, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -4, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                left: 46,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(10,10,16,0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: 12,
                fontWeight: 600,
                color: '#FAFAFA',
                whiteSpace: 'nowrap',
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {label}
              <div style={{
                position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
                width: 0, height: 0,
                borderTop: '4px solid transparent', borderBottom: '4px solid transparent',
                borderRight: '4px solid rgba(255,255,255,0.1)',
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  const width = useSpring(60, { stiffness: 280, damping: 28 })

  function handleMouseEnter() {
    setExpanded(true)
    width.set(220)
  }
  function handleMouseLeave() {
    setExpanded(false)
    width.set(60)
  }

  return (
    <motion.aside
      style={{
        width,
        minHeight: '100vh',
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glass background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(6,6,10,0.92)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.4)',
      }} />

      {/* Subtle top-red glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        background: 'radial-gradient(ellipse at 30% 0%, rgba(196,20,37,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Logo */}
        <div style={{ padding: '20px 14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
              <svg width="26" height="26" viewBox="0 0 22 22" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="2.5" fill="#C41425" />
                <path d="M7 11a4 4 0 0 1 4-4" stroke="#C41425" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                <path d="M4 11a7 7 0 0 1 7-7" stroke="#C41425" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
                <path d="M15 11a4 4 0 0 0-4-4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M18 11a7 7 0 0 0-7-7" stroke="rgba(255,255,255,0.08)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </motion.div>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}
                >
                  <span style={{ color: '#FAFAFA' }}>Freelance</span>
                  <span style={{ color: '#C41425' }}>OS</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navItems.map(({ label, href, icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href + '/'))
            return (
              <NavItem key={href} href={href} icon={icon} label={label} isActive={isActive} expanded={expanded} />
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Upgrade */}
          <Link href="/#pricing" style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}>
            <motion.div
              whileHover={{ backgroundColor: 'rgba(196,20,37,0.18)' }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8,
                background: 'rgba(196,20,37,0.08)',
                border: '1px solid rgba(196,20,37,0.2)',
                color: '#C41425',
              }}
            >
              <motion.div whileHover={{ scale: 1.15 }} style={{ flexShrink: 0 }}>
                <Zap size={16} strokeWidth={2.2} />
              </motion.div>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}
                  >
                    Upgrade to Pro
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          {/* Logout */}
          <motion.button
            whileHover={{ backgroundColor: 'rgba(196,20,37,0.06)' }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(196,20,37,0)', border: 'none', cursor: 'pointer', width: '100%',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            <motion.div whileHover={{ scale: 1.1, color: '#C41425' }} style={{ flexShrink: 0 }}>
              <LogOut size={16} strokeWidth={1.8} />
            </motion.div>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 13, fontWeight: 400, letterSpacing: '-0.01em', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.35)' }}
                >
                  Log out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  )
}
