'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, User, Menu } from 'lucide-react'

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname()
  
  // Create a readable title from pathname
  let pageTitle = 'Overview'
  if (pathname) {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      pageTitle = segments[segments.length - 1]
      pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(6, 6, 8, 0.4)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'none', // Hidden on desktop, shown via CSS media query
          }}
        >
          <Menu size={20} />
        </button>
        <h1 style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          margin: 0,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em'
        }}>
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notification Bell */}
        <button 
          className="bell-btn"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <Bell size={16} />
          {/* Unread indicator */}
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--color-accent)',
            borderRadius: '50%',
            border: '2px solid var(--color-bg)'
          }} />
        </button>

        {/* Avatar */}
        <button
          className="avatar-btn"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <User size={16} />
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .bell-btn:hover {
          color: var(--color-text-primary) !important;
          border-color: rgba(255,255,255,0.15) !important;
        }
        .bell-btn:hover svg {
          animation: shake 0.4s ease-in-out;
        }
        .avatar-btn:hover {
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 0 1px var(--color-accent);
        }
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </motion.header>
  )
}
