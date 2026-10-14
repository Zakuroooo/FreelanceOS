import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/** Public surfaces only — everything else is behind auth and disallowed in robots. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: APP_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_URL}/privacy`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/terms`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/login`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/signup`, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
