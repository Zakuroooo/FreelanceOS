import { describe, expect, it } from 'vitest'
import { scoreMemory, formatMemoryBlock } from '../src/lib/memory'

describe('scoreMemory', () => {
  it('ranks a won same-industry pitch above everything', () => {
    const won = scoreMemory({ sameIndustry: true, sharedGapCount: 2, outcomeWeight: 3 })
    const replied = scoreMemory({ sameIndustry: true, sharedGapCount: 2, outcomeWeight: 2.4 })
    expect(won).toBeGreaterThan(replied)
  })

  it('industry match beats raw outcome alone', () => {
    const repliedSameIndustry = scoreMemory({ sameIndustry: true, sharedGapCount: 0, outcomeWeight: 2.4 })
    const sentDifferent = scoreMemory({ sameIndustry: false, sharedGapCount: 0, outcomeWeight: 0.6 })
    expect(repliedSameIndustry).toBeGreaterThan(sentDifferent)
  })

  it('caps gap overlap so gap spam cannot dominate industry', () => {
    const three = scoreMemory({ sameIndustry: false, sharedGapCount: 3, outcomeWeight: 0 })
    const ten = scoreMemory({ sameIndustry: false, sharedGapCount: 10, outcomeWeight: 0 })
    expect(ten).toBe(three)
  })

  it('a bare sent pitch still scores above zero', () => {
    expect(scoreMemory({ sameIndustry: false, sharedGapCount: 0, outcomeWeight: 0.6 })).toBeGreaterThan(0)
  })
})

describe('formatMemoryBlock', () => {
  it('renders nothing when there are no hits', () => {
    expect(formatMemoryBlock([])).toBe('')
  })

  it('includes the outcome label and subject so the model can mirror voice', () => {
    const out = formatMemoryBlock([{
      businessName: 'Bright Smile Dental',
      industry: 'dentist',
      subject: 'Your website is invisible to Maple Street',
      bodyExcerpt: 'I walked past your clinic...',
      outcomeWeight: 3,
      outcomeLabel: 'CLOSED THIS DEAL',
      relevance: 9,
    }])
    expect(out).toContain('CLOSED THIS DEAL')
    expect(out).toContain('Your website is invisible')
    expect(out).toContain('do not copy')
  })
})
