'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import FloatingDock from './FloatingDock'

const DASHBOARD_PREFIXES = [
  '/dashboard',
  '/discover',
  '/clients',
  '/pitches',
  '/outreach',
  '/deals',
  '/notifications',
  '/settings',
  // Keep in sync with src/proxy.ts — /team was missing here and rendered with
  // BOTH the landing chrome and the dashboard sidebar.
  '/team',
]

export default function LandingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname?.startsWith(p))

  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
      {!isDashboard && <FloatingDock />}
    </>
  )
}
