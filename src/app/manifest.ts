import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FreelanceOS — Freelance business on autopilot',
    short_name: 'FreelanceOS',
    description:
      'Find clients with real digital gaps, send ground-truth AI pitches, and close deals — solo or with your team.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#060608',
    theme_color: '#060608',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
