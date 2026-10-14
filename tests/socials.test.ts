import { describe, expect, it } from 'vitest'
import { instagramProfileUrl, linkedinProfileUrl } from '../src/lib/socials'

describe('instagramProfileUrl', () => {
  it('passes full scraped URLs straight through (the production bug)', () => {
    // Discovery stores full URLs — the old code concatenated them into
    // instagram.com/https://www.instagram.com/... → "page isn't available".
    expect(instagramProfileUrl('https://www.instagram.com/acecafe/')).toBe('https://www.instagram.com/acecafe/')
  })

  it('builds clean URLs from bare handles and @handles', () => {
    expect(instagramProfileUrl('acecafe')).toBe('https://www.instagram.com/acecafe/')
    expect(instagramProfileUrl('@acecafe')).toBe('https://www.instagram.com/acecafe/')
  })

  it('rejects garbage that would 404', () => {
    expect(instagramProfileUrl('https://instagram.com/p/reel123')).toBe('https://instagram.com/p/reel123') // full URL: caller's choice
    expect(instagramProfileUrl('not a handle!')).toBeNull()
    expect(instagramProfileUrl('')).toBeNull()
    expect(instagramProfileUrl(null)).toBeNull()
  })
})

describe('linkedinProfileUrl', () => {
  it('passes through stored company URLs', () => {
    expect(linkedinProfileUrl('https://www.linkedin.com/company/acecafe/'))
      .toBe('https://www.linkedin.com/company/acecafe/')
  })

  it('maps bare slugs to company paths', () => {
    expect(linkedinProfileUrl('acecafe')).toBe('https://www.linkedin.com/company/acecafe/')
  })

  it('returns null for unusable values', () => {
    expect(linkedinProfileUrl('has spaces in it')).toBeNull()
    expect(linkedinProfileUrl(null)).toBeNull()
  })
})
