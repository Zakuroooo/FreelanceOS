import { describe, expect, it } from 'vitest'
import { extractSiteSignals, formatSiteResearch } from '../src/lib/research'

const PAGE = `
<html><head>
  <title>Ace Cafe — Coming Soon</title>
  <meta name="description" content="Best coffee in Pune">
  <meta name="generator" content="Wix Website Builder">
</head>
<body>
  <h1>Welcome</h1>
  <h2>Our Menu</h2>
  <a href="https://instagram.com/acecafe">IG</a>
  <a href="/contact">Contact</a>
  <p>Freshly roasted beans since 2014. Walk ins welcome.</p>
</body></html>`

describe('extractSiteSignals', () => {
  it('pulls title, meta, generator, headings, socials and text', () => {
    const s = extractSiteSignals(PAGE, 'https://acecafe.in/')
    expect(s.title).toContain('Ace Cafe')
    expect(s.metaDescription).toBe('Best coffee in Pune')
    expect(s.generator).toBe('Wix Website Builder')
    expect(s.headings).toEqual(['Welcome', 'Our Menu'])
    expect(s.socialLinks).toEqual(['https://instagram.com/acecafe'])
    expect(s.textSample).toContain('Freshly roasted beans')
    expect(s.https).toBe(true)
  })

  it('flags plain HTTP sites (the no-ssl talking point)', () => {
    const s = extractSiteSignals('<title>x</title>', 'http://oldshop.com/')
    expect(s.https).toBe(false)
  })

  it('never throws on empty or binary-ish input', () => {
    const s = extractSiteSignals('', 'https://x.com/')
    expect(s.title).toBeUndefined()
    expect(s.headings).toEqual([])
  })
})

describe('formatSiteResearch', () => {
  it('turns an unreachable site into a talking point, not silence', () => {
    const out = formatSiteResearch({ reachable: false, error: 'Timed out after 8s', headings: [], socialLinks: [] })
    expect(out).toContain('UNREACHABLE')
    expect(out).toContain('talking point')
  })

  it('lists concrete facts when reachable', () => {
    const s = extractSiteSignals(PAGE, 'https://acecafe.in/')
    const out = formatSiteResearch({ ...s, reachable: true })
    expect(out).toContain('LIVE SITE CHECK')
    expect(out).toContain('Title tag')
  })
})
