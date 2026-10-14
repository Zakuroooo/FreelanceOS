import { describe, expect, it } from 'vitest'
import { daysSince, timeAgo, formatCurrency } from '../src/lib/format'

const DAY = 86400000

describe('daysSince', () => {
  it('clamps future dates to Today instead of "-1d ago" (the L5 regression)', () => {
    const future = new Date(Date.now() + DAY).toISOString()
    expect(daysSince(future)).toBe('Today')
  })

  it('formats elapsed days', () => {
    expect(daysSince(new Date(Date.now() - 3 * DAY).toISOString())).toBe('3d ago')
    expect(daysSince(new Date().toISOString())).toBe('Today')
  })

  it('handles missing and invalid input', () => {
    expect(daysSince(undefined)).toBeNull()
    expect(daysSince(null)).toBeNull()
    expect(daysSince('not-a-date')).toBeNull()
  })
})

describe('timeAgo', () => {
  it('buckets by minute/hour/day', () => {
    expect(timeAgo(new Date().toISOString())).toBe('just now')
    expect(timeAgo(new Date(Date.now() - 5 * 60000).toISOString())).toBe('5m ago')
    expect(timeAgo(new Date(Date.now() - 3 * 3600000).toISOString())).toBe('3h ago')
    expect(timeAgo(new Date(Date.now() - 2 * DAY).toISOString())).toBe('2d ago')
  })

  it('treats future/invalid as just now', () => {
    expect(timeAgo(new Date(Date.now() + DAY).toISOString())).toBe('just now')
    expect(timeAgo(undefined)).toBe('just now')
  })
})

describe('formatCurrency', () => {
  it('formats INR with grouping', () => {
    expect(formatCurrency(125000)).toBe('₹1,25,000')
  })

  it('formats USD plainly', () => {
    expect(formatCurrency(125000, 'USD')).toBe('$125,000')
  })
})
