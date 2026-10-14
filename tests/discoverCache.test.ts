import { describe, expect, it } from 'vitest'
import DiscoverCache from '../src/lib/models/DiscoverCache'

describe('DiscoverCache model', () => {
  it('exposes the enriched-place schema paths', () => {
    const paths = Object.keys(DiscoverCache.schema.paths)
    const expected = [
      'placeId', 'businessName', 'industry', 'location', 'website', 'websiteLive',
      'metaDescription', 'email', 'emailConfidence', 'phone',
      'socials.instagram', 'socials.facebook', 'socials.linkedin',
      'socials.twitter', 'socials.youtube', 'socials.whatsapp',
      'socialCount', 'detectedGaps', 'source', 'opportunityScore',
      'rating', 'reviewCount', 'googleMapsUrl', 'category', 'updatedAt',
    ]
    for (const path of expected) {
      expect(paths, `missing schema path: ${path}`).toContain(path)
    }
  })

  it('has a 30-day TTL index on updatedAt', () => {
    const indexes = DiscoverCache.schema.indexes() as Array<
      [Record<string, unknown>, { expireAfterSeconds?: number }]
    >
    const ttl = indexes.find(
      ([keys, opts]) => keys.updatedAt !== undefined && typeof opts.expireAfterSeconds === 'number'
    )
    expect(ttl).toBeDefined()
    expect(ttl?.[1].expireAfterSeconds).toBe(2592000)
  })
})
