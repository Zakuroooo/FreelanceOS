import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Deal Pipeline' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
