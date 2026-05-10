import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LandingShell from '@/components/layout/LandingShell'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'FreelanceOS — Your entire freelance business, on autopilot.',
  description: 'Find clients, generate AI pitches, send automatically, get paid securely.',
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
