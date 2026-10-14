import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LandingShell from '@/components/layout/LandingShell'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'FreelanceOS — Your entire freelance business, on autopilot',
    template: '%s · FreelanceOS',
  },
  description:
    'Find local businesses with digital gaps, generate AI pitches grounded in live website audits, run email & WhatsApp outreach from your own accounts, and close deals in one pipeline.',
  keywords: [
    'freelance CRM', 'client acquisition', 'AI pitch generator', 'cold outreach',
    'lead generation', 'agency workspace', 'freelancer tools',
  ],
  authors: [{ name: 'FreelanceOS' }],
  applicationName: 'FreelanceOS',
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'FreelanceOS',
    title: 'FreelanceOS — Your entire freelance business, on autopilot',
    description:
      'Discover clients with real digital gaps, send ground-truth AI pitches from your own Gmail and WhatsApp, and track every deal to close — solo or with your whole team.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreelanceOS — Your entire freelance business, on autopilot',
    description:
      'Discover clients with real digital gaps, send ground-truth AI pitches, and close deals — solo or with your team.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Dashboard pages opt out individually via /dashboard/layout-level noindex? The
  // proxy already gates them behind auth; robots defaults stay permissive for the
  // public landing + legal pages that Google verification requires.
  category: 'business',
}

export const viewport: Viewport = {
  themeColor: '#060608',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable} style={{ backgroundColor: '#060608', fontFamily: 'Inter, -apple-system, sans-serif' }} suppressHydrationWarning>
        <Toaster theme="dark" toastOptions={{ style: { background: '#0D0D12', border: '1px solid rgba(255,255,255,0.08)', color: '#FAFAFA' } }} />
        <LandingShell>{children}</LandingShell>
      </body>
    </html>
  )
}
