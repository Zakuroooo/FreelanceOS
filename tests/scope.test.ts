import { describe, expect, it } from 'vitest'
import { seatLimitFor } from '../src/lib/scope'
import { generateInviteCode } from '../src/lib/models/Organization'
import { scoreMemory } from '../src/lib/memory'

describe('workspace scoping', () => {
  it('enforces seat caps by plan', () => {
    expect(seatLimitFor('free')).toBe(3)
    expect(seatLimitFor('pro')).toBe(10)
    expect(seatLimitFor('agency')).toBe(100)
    // Unknown plan falls back to the safest cap
    expect(seatLimitFor('unknown' as never)).toBe(3)
  })

  it('generates unambiguous 8-char invite codes', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode()
      expect(code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/)
      // No confusables ever
      expect(code).not.toMatch(/[0O1IL]/)
    }
  })

  it('produces distinct codes across draws (collision sanity)', () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateInviteCode()))
    expect(codes.size).toBeGreaterThan(195)
  })
})

// Re-imported here so one file covers both SaaS-critical pure modules.
describe('attribution scoring (SaaS leaderboard relevance)', () => {
  it('a closer outranks a generator', () => {
    expect(scoreMemory({ sameIndustry: false, sharedGapCount: 0, outcomeWeight: 3 }))
      .toBeGreaterThan(scoreMemory({ sameIndustry: false, sharedGapCount: 0, outcomeWeight: 0.6 }))
  })
})
