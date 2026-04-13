import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
