import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // App pages are auth-gated; keep crawlers on the public surfaces.
      disallow: ['/api/', '/dashboard', '/discover', '/clients', '/pitches', '/outreach', '/deals', '/notifications', '/settings', '/team'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
