/**
 * Live website observation — the "act/observe" tool of the pitch agent.
 *
 * Before this, the "researcher" stage reasoned purely over scraped metadata and
 * could only guess. Feeding it the site's actual HTML signals (title, meta,
 * headings, tech hints, SSL state) grounds every downstream prompt in facts the
 * lead can verify about themselves — the difference between "I noticed you exist"
 * and "your homepage title still says 'coming soon'".
 *
 * Deliberately defensive: business websites are hostile territory (huge pages,
 * dead hosts, redirect loops), so everything is capped and every failure is
 * non-throwing — a dead site is itself an outreach signal.
 */

export interface SiteResearch {
  reachable: boolean
  finalUrl?: string
  https?: boolean
  title?: string
  metaDescription?: string
  headings: string[]
  generator?: string
  socialLinks: string[]
  /** Short text sample for tone/product hints. */
  textSample?: string
  /** What went wrong, when not reachable — itself useful to the copywriter. */
  error?: string
}

const FETCH_TIMEOUT_MS = 8000
const MAX_HTML_BYTES = 400_000

function absoluteUrl(base: string, href: string): string | null {
  try {
    const url = new URL(href, base)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

/** Extracts the signals the LLM stages actually read. Pure — unit-testable. */
export function extractSiteSignals(html: string, baseUrl: string): Omit<SiteResearch, 'reachable' | 'error'> {
  const pick = (pattern: RegExp): string | undefined => {
    const m = html.match(pattern)
    const v = m?.[1]?.trim()
    return v ? v.slice(0, 300) : undefined
  }

  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i)?.replace(/\s+/g, ' ')
  const metaDescription = pick(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i
  ) ?? pick(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i)
  const generator = pick(/<meta[^>]+name=["']generator["'][^>]*content=["']([^"']*)["']/i)

  const headings = Array.from(html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi))
    .map(m => m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim())
    .filter(h => h.length > 2 && h.length < 120)
    .slice(0, 8)

  const socialLinks = Array.from(html.matchAll(/href=["']([^"']*(?:instagram|facebook|linkedin|twitter|x\.com|wa\.me|youtube)[^"']*)["']/gi))
    .map(m => absoluteUrl(baseUrl, m[1]))
    .filter((u): u is string => u !== null)
    .slice(0, 6)

  // Visible-text sample: strip tags/styles/scripts, collapse whitespace.
  const textSample = html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 900) || undefined

  return {
    finalUrl: baseUrl,
    https: baseUrl.startsWith('https:'),
    title,
    metaDescription,
    headings,
    generator,
    socialLinks,
    textSample,
  }
}

export async function researchWebsite(rawUrl: string): Promise<SiteResearch> {
  let url = rawUrl.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreelanceOSBot/1.0; +research)' },
    })

    // Read at most MAX_HTML_BYTES so a 50 MB page can't stall the pipeline.
    const reader = res.body?.getReader()
    let html = ''
    if (reader) {
      const decoder = new TextDecoder()
      while (html.length < MAX_HTML_BYTES) {
        const { done, value } = await reader.read()
        if (done) break
        html += decoder.decode(value, { stream: true })
      }
      await reader.cancel().catch(() => { })
    } else {
      html = await res.text()
    }
    html = html.slice(0, MAX_HTML_BYTES)

    if (!res.ok) {
      return { reachable: false, error: `HTTP ${res.status}`, headings: [], socialLinks: [] }
    }

    return {
      reachable: true,
      ...extractSiteSignals(html, res.url || url),
    }
  } catch (err) {
    const msg = err instanceof Error
      ? (err.name === 'AbortError' ? `Timed out after ${FETCH_TIMEOUT_MS / 1000}s` : err.message)
      : 'Unknown fetch failure'
    // A dead/unreachable site is a finding, not an exception.
    return { reachable: false, error: msg, headings: [], socialLinks: [] }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Ground-truth flaws — concrete, evidence-backed problems found on the live site.
 *
 * These are derived deterministically from the fetched HTML (not hallucinated by an
 * LLM), so every flaw the pitch cites is something the lead can go verify about
 * themselves in ten seconds. That verifiability is what makes "you have these flaws"
 * land as helpful instead of insulting.
 */
export interface SiteFlaw {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  /** Short human headline, e.g. "Homepage title still says Coming Soon". */
  title: string
  /** Why it hurts them, grounded in the evidence. */
  detail: string
  /** Raw quote/signal from the site backing the claim, when available. */
  evidence?: string
}

const PLACEHOLDER_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /coming\s*soon/i, label: '"Coming Soon"' },
  { re: /under\s*construction/i, label: '"Under Construction"' },
  { re: /lorem\s+ipsum/i, label: 'Lorem Ipsum placeholder text' },
  { re: /default\s+page|parked\s+domain|future\s+home/i, label: 'a default/parked page' },
]

/** Pure — derives flaws from a SiteResearch result. Unit-testable without network. */
export function deriveSiteFlaws(r: SiteResearch): SiteFlaw[] {
  const flaws: SiteFlaw[] = []

  if (!r.reachable) {
    flaws.push({
      id: 'site-down',
      severity: 'critical',
      title: r.error?.startsWith('HTTP') ? `Website returns ${r.error}` : 'Website is down or unreachable',
      detail:
        'Anyone who Googles them right now hits a dead page — every bit of ad spend, word-of-mouth and review traffic bounces straight off it.',
      evidence: r.error,
    })
    return flaws
  }

  // Placeholder / unfinished pages
  const haystack = [r.title, r.textSample].filter(Boolean).join(' ')
  for (const { re, label } of PLACEHOLDER_PATTERNS) {
    if (re.test(haystack)) {
      flaws.push({
        id: 'placeholder-page',
        severity: 'critical',
        title: `Homepage still shows ${label}`,
        detail:
          'Visitors read that as "closed" or "not ready" and leave — the site actively repels the customers it was built to attract.',
        evidence: r.title,
      })
      break
    }
  }

  // Title tag quality
  if (r.title && r.title.length < 12) {
    flaws.push({
      id: 'weak-title',
      severity: 'medium',
      title: `Title tag is nearly empty ("${r.title}")`,
      detail:
        'The browser tab and Google result both show this — it tells search engines and customers almost nothing about what they do.',
      evidence: r.title,
    })
  } else if (!r.title) {
    flaws.push({
      id: 'no-title',
      severity: 'high',
      title: 'Page has no <title> tag',
      detail:
        'Google shows "Untitled" in results and the tab says the raw URL — instant credibility loss before the page even loads.',
    })
  }

  // Meta description
  if (!r.metaDescription) {
    flaws.push({
      id: 'no-meta',
      severity: 'medium',
      title: 'No meta description',
      detail:
        'Google invents its own snippet from random page text for their listing — they are leaving their first impression to an algorithm.',
    })
  }

  // SSL
  if (r.https === false) {
    flaws.push({
      id: 'no-ssl',
      severity: 'high',
      title: 'Served over plain HTTP — no SSL',
      detail:
        'Chrome flags the site "Not Secure" in the address bar. For any business taking bookings or payments, that warning alone kills conversions.',
    })
  }

  // Heading structure
  if (r.headings.length === 0) {
    flaws.push({
      id: 'no-headings',
      severity: 'medium',
      title: 'No real headings on the homepage',
      detail:
        'Neither visitors skimming the page nor search engines can tell what the business actually offers within five seconds.',
    })
  } else if (r.headings.length > 0 && r.headings.every(h => /^(home|welcome|menu|about us?)$/i.test(h.trim()))) {
    flaws.push({
      id: 'generic-headings',
      severity: 'medium',
      title: `Headings are generic (${r.headings.slice(0, 3).join(', ')})`,
      detail:
        'Every competitor could use the exact same headings — nothing on the page explains why this business specifically.',
    })
  }

  // Thin content
  if (r.textSample && r.textSample.length < 200) {
    flaws.push({
      id: 'thin-content',
      severity: 'medium',
      title: 'Homepage has almost no text content',
      detail:
        'With under a couple hundred words on the page, there is nothing for Google to rank and nothing to convince a visitor to call.',
    })
  }

  // Social presence on site
  if (r.socialLinks.length === 0) {
    flaws.push({
      id: 'no-social-links',
      severity: 'low',
      title: 'No social links anywhere on the homepage',
      detail:
        'Visitors who want to check them out on Instagram/Facebook before buying have nowhere to go — the trust loop breaks.',
    })
  }

  return flaws
}

/** Renders flaws into compact prompt-ready lines. */
export function formatSiteFlaws(flaws: SiteFlaw[]): string {
  if (flaws.length === 0) return 'GROUND-TRUTH AUDIT: no concrete flaws found on the live site.'
  return [
    'GROUND-TRUTH AUDIT (verified against the live site just now):',
    ...flaws.map(
      f => `- [${f.severity.toUpperCase()}] ${f.title} — ${f.detail}${f.evidence ? ` (evidence: "${String(f.evidence).slice(0, 120)}")` : ''}`
    ),
  ].join('\n')
}

/** Renders research into compact prompt-ready lines. Empty research → empty string. */
export function formatSiteResearch(r: SiteResearch): string {
  if (!r.reachable) {
    return `LIVE SITE CHECK: UNREACHABLE (${r.error ?? 'unknown reason'}) — the website being down or misconfigured is itself a talking point.`
  }
  const lines = ['LIVE SITE CHECK (fetched just now):']
  if (r.title) lines.push(`- Title tag: "${r.title}"`)
  if (r.metaDescription) lines.push(`- Meta description: "${r.metaDescription}"`)
  if (r.generator) lines.push(`- Built with: ${r.generator}`)
  if (r.https === false) lines.push('- Served over plain HTTP (no SSL)')
  if (r.headings.length > 0) lines.push(`- Headings: ${r.headings.join(' | ')}`)
  if (r.socialLinks.length > 0) lines.push(`- Social links found: ${r.socialLinks.join(', ')}`)
  if (r.textSample) lines.push(`- Homepage excerpt: "${r.textSample}"`)
  return lines.join('\n')
}
