import { describe, expect, it } from 'vitest'
import { pick, PITCH_WRITABLE_FIELDS } from '../src/lib/sanitize'

describe('pick', () => {
  it('copies only whitelisted keys', () => {
    const out = pick<{ businessName: string; stage: string }>(
      { businessName: 'Ace Cafe', stage: 'won', userId: 'evil' },
      ['businessName']
    )
    expect(out).toEqual({ businessName: 'Ace Cafe' })
  })

  it('drops Mongo operator keys and dotted paths (the M8 regression)', () => {
    const out = pick<Record<string, unknown>>(
      { $set: { role: 'admin' }, 'notes.injected': true, name: 'ok' },
      ['$set', 'notes.injected' as never, 'name']
    )
    expect(out).toEqual({ name: 'ok' })
  })

  it('ignores undefined values and non-object sources', () => {
    expect(pick<{ a?: string }>({ a: undefined }, ['a'])).toEqual({})
    expect(pick(null as unknown as Record<string, unknown>, ['a'] as never)).toEqual({})
    expect(pick('string' as unknown as Record<string, unknown>, ['a'] as never)).toEqual({})
  })

  it('pitch whitelist keeps server-owned fields out', () => {
    expect(PITCH_WRITABLE_FIELDS).not.toContain('userId')
    expect(PITCH_WRITABLE_FIELDS).not.toContain('sentChannels')
  })
})
