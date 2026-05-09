'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Search, FileText, Handshake, Bell } from 'lucide-react'

const bottomNavItems = [
  { label: 'Overview', href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Discover', href: '/discover',      icon: Search },
  { label: 'Pitches',  href: '/pitches',       icon: FileText },
  { label: 'Deals',    href: '/deals',         icon: Handshake },
  { label: 'Alerts',   href: '/notifications', icon: Bell },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="bottom-nav">
        {bottomNavItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/')
          return (
            <Link key={href} href={href} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
              <div className="icon-wrapper">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <style>{`
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          background: rgba(6, 6, 8, 0.85);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 50;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-decoration: none;
          color: var(--color-text-muted);
          transition: all 0.2s ease;
        }

        .bottom-nav-item span {
          font-size: 10px;
          font-weight: 500;
        }

        .bottom-nav-item.active {
          color: var(--color-text-primary);
        }

        .bottom-nav-item.active .icon-wrapper {
          color: var(--color-accent);
        }

        @media (max-width: 768px) {
          .bottom-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}
