import { describe, expect, it } from 'vitest'
import { getContactability } from '../src/lib/leads'

describe('getContactability', () => {
  it('scores each channel once, max 5', () => {
    expect(getContactability({
      website: 'x.com',
      email: 'a@x.com',
      phone: '+91',
      socials: { instagram: '@x', whatsapp: 'wa.me/x' },
    })).toBe(5)
  })

  it('does not double-count a shared WhatsApp number (the M4 regression)', () => {
    // A phone-only lead used to score 2/5 because `whatsapp || phone` counted again.
    expect(getContactability({ phone: '+91' })).toBe(1)
    expect(getContactability({ phone: '+91', socials: { whatsapp: '+91' } })).toBe(1)
  })

  it('counts WhatsApp as its own signal when it differs from the phone', () => {
    expect(getContactability({ socials: { whatsapp: 'wa.me/x' } })).toBe(1)
    expect(getContactability({ phone: '+91', socials: { whatsapp: 'wa.me/x' } })).toBe(2)
  })

  it('empty lead scores zero and never throws on missing socials', () => {
    expect(getContactability({})).toBe(0)
    expect(getContactability({ website: 'x.com' })).toBe(1)
  })
})
