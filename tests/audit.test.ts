import { describe, expect, it } from 'vitest'
import { detectFlaws } from '../src/lib/audit'

const base = {
  reachable: true as const,
  title: 'Ace Cafe',
  metaDescription: 'Best coffee',
  headings: ['Welcome'],
  https: true,
}

describe('detectFlaws', () => {
  it('flags an unreachable site as the single high-severity flaw', () => {
    const flaws = detectFlaws({ ...base, reachable: false, error: 'Timed out after 8s' })
    expect(flaws).toHaveLength(1)
    expect(flaws[0].id).toBe('unreachable')
    expect(flaws[0].severity).toBe('high')
    expect(flaws[0].evidence).toContain('Timed out')
  })

  it('catches coming-soon placeholder content (the ground-truth case)', () => {
    const flaws = detectFlaws({
      ...base,
      title: 'Ace Cafe — Coming Soon',
      textSample: 'Our new website is almost ready. Come back soon!',
    })
    expect(flaws.some(f => f.id === 'placeholder')).toBe(true)
  })

  it('catches a stale copyright year', () => {
    const flaws = detectFlaws({
      ...base,
      textSample: `© ${new Date().getFullYear() - 4} Ace Cafe. All rights reserved.`,
    })
    const stale = flaws.find(f => f.id === 'stale-copyright')
    expect(stale).toBeDefined()
    expect(String(new Date().getFullYear() - 4)).toContain('')
    expect(stale!.evidence).toContain(`${new Date().getFullYear() - 4}`)
  })

  it('does not flag the current copyright year', () => {
    const flaws = detectFlaws({
      ...base,
      textSample: `© ${new Date().getFullYear()} Ace Cafe.`,
    })
    expect(flaws.find(f => f.id === 'stale-copyright')).toBeUndefined()
  })

  it('flags plain HTTP and missing meta', () => {
    const flaws = detectFlaws({ ...base, https: false, metaDescription: undefined })
    expect(flaws.map(f => f.id)).toContain('no-ssl')
    expect(flaws.map(f => f.id)).toContain('no-meta')
  })

  it('flags slow loads with measured timing', () => {
    const flaws = detectFlaws(base, { loadMs: 3200 })
    const slow = flaws.find(f => f.id === 'slow')
    expect(slow).toBeDefined()
    expect(slow!.evidence).toContain('3.2s')
  })

  it('sorts by severity: high first', () => {
    const flaws = detectFlaws({
      reachable: false,
      error: 'HTTP 500',
      headings: [],
    })
    expect(flaws[0].severity).toBe('high')
  })
})
