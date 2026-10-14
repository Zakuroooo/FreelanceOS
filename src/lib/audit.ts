/**
 * Ground-truth website audit — the agent's "look before you speak" step.
 *
 * research.ts answers "what is on this site"; this file answers "what is WRONG
 * with it", as a list of specific, verifiable flaws. The pitch then cites real
 * evidence ("your footer still says (c) 2021") instead of generic flattery.
 *
 * detectFlaws is pure and unit-tested; runAudit adds the network timing.
 */

import { researchWebsite, type SiteResearch } from './research'
import type { ServiceDef } from './services'

export interface Flaw {
  id: string
  /** Shown to the user in the chat transcript. */
  label: string
  /** Exact evidence quoted into the pitch. */
  evidence: string
  severity: 'high' | 'medium' | 'low'
}

export interface AuditResult {
  reachable: boolean
  loadMs: number
  flaws: Flaw[]
  /** Raw signals kept for the researcher prompt. */
  research: SiteResearch
}

/** Pure flaw detection from site signals — unit-tested, no network. */
export function detectFlaws(
  r: Pick<SiteResearch, 'reachable' | 'error' | 'title' | 'metaDescription' | 'headings' | 'generator' | 'https' | 'textSample'>,
  opts: { loadMs?: number; currentYear?: number } = {},
): Flaw[] {
  const flaws: Flaw[] = []
  const year = opts.currentYear ?? new Date().getFullYear()

  if (!r.reachable) {
    flaws.push({
      id: 'unreachable',
      label: 'Website does not load',
      evidence: `their website ${r.error ? `fails to load (${r.error})` : 'is unreachable'} — every customer who Googles them hits a dead end`,
      severity: 'high',
    })
    return flaws
  }

  // Placeholder / unfinished content
  const text = (r.textSample ?? '').toLowerCase()
  const titleLower = (r.title ?? '').toLowerCase()
  if (
    titleLower.includes('coming soon') ||
    text.includes('coming soon') ||
    text.includes('lorem ipsum') ||
    text.includes('under construction')
  ) {
    flaws.push({
      id: 'placeholder',
      label: 'Placeholder content live',
      evidence:
        r.title && titleLower.includes('coming soon')
          ? `the browser tab still says "${(r.title ?? '').trim()}"`
          : 'the homepage still contains placeholder copy ("coming soon" / lorem ipsum)',
      severity: 'high',
    })
  }

  // Outdated copyright year in footer text
  const years = Array.from(text.matchAll(/(?:©|\(c\)|copyright)\s*(20\d{2})/gi)).map(m => Number(m[1]))
  const latestYear = years.length > 0 ? Math.max(...years) : null
  if (latestYear !== null && latestYear < year) {
    flaws.push({
      id: 'stale-copyright',
      label: `Footer says ©${latestYear}`,
      evidence: `the footer still reads "${latestYear}" — visitors read stale years as an abandoned business`,
      severity: 'medium',
    })
  }

  if (r.https === false) {
    flaws.push({
      id: 'no-ssl',
      label: 'No HTTPS',
      evidence: 'the site loads over plain HTTP — browsers flag it "Not secure" before anyone reads a word',
      severity: 'high',
    })
  }

  // Dated builder platforms
  if (r.generator && /wix|weebly|godaddy|jimdo|wordpress\s*[1-5]\b/i.test(r.generator)) {
    flaws.push({
      id: 'dated-builder',
      label: `Built with ${r.generator}`,
      evidence: `the site announces it was built with "${r.generator}" — template-era look customers recognise instantly`,
      severity: 'low',
    })
  }

  // Missing/weak meta description (SEO lens)
  if (!r.metaDescription) {
    flaws.push({
      id: 'no-meta',
      label: 'No meta description',
      evidence: 'there is no meta description — Google invents its own snippet for their listing',
      severity: 'medium',
    })
  }

  // Weak/missing headings structure
  if (r.headings.length === 0) {
    flaws.push({
      id: 'no-headings',
      label: 'No page headings',
      evidence: 'the homepage has no H1-H3 structure — nothing for visitors (or Google) to scan',
      severity: 'medium',
    })
  }

  // Slow first byte
  if ((opts.loadMs ?? 0) > 2500) {
    flaws.push({
      id: 'slow',
      label: `Slow load (${Math.round((opts.loadMs ?? 0) / 100) / 10}s)`,
      evidence: `the homepage took ${(opts.loadMs! / 1000).toFixed(1)}s to respond on our test — mobile visitors bounce long before that`,
      severity: 'medium',
    })
  }

  return flaws.sort((a, b) => ({ high: 0, medium: 1, low: 2 } as const)[a.severity] - ({ high: 0, medium: 1, low: 2 } as const)[b.severity])
}

/** Network step: fetch + time the request + detect. Non-throwing by contract. */
export async function runAudit(url: string): Promise<AuditResult> {
  const started = Date.now()
  const research = await researchWebsite(url)
  const loadMs = Date.now() - started
  return {
    reachable: research.reachable,
    loadMs,
    flaws: detectFlaws(research, { loadMs }),
    research,
  }
}

/** Renders findings for the LLM prompts through the chosen service's lens. */
export function formatAuditForPrompt(audit: AuditResult, service: ServiceDef): string {
  const lines = [`GROUND-TRUTH AUDIT (performed just now, service lens: ${service.label}):`]
  if (audit.flaws.length === 0) {
    lines.push('- No critical flaws detected; angle on polish/speed/conversion improvements.')
  } else {
    lines.push('Verified problems, cite them EXACTLY as written:')
    audit.flaws.forEach((f, i) => {
      lines.push(`  ${i + 1}. [${f.severity.toUpperCase()}] ${f.evidence}`)
    })
  }
  lines.push(`Audited with attention to: ${service.auditFocus}.`)
  return lines.join('\n')
}

/* ── Chat-pipeline compatibility types ─────────────────────── */

export interface SiteFlaw {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  detail: string
  evidence?: string
}

/** Maps audit flaws into the chat pipeline's flaw shape (severity gains 'critical'). */
export function deriveSiteFlaws(research: SiteResearch): SiteFlaw[] {
  const flaws = detectFlaws(research)
  if (!research.reachable) {
    return [{
      id: 'unreachable',
      severity: 'critical',
      title: 'Website does not load',
      detail: research.error
        ? `The site fails to load (${research.error}) — customers who search for them hit a dead end.`
        : 'The site is unreachable — customers who search hit a dead end.',
    }]
  }
  const map = { high: 'high', medium: 'medium', low: 'low' } as const
  return flaws.map(f => ({
    id: f.id,
    severity: map[f.severity],
    title: f.label,
    detail: f.evidence,
    evidence: f.evidence,
  }))
}

export function formatSiteFlaws(flaws: SiteFlaw[]): string {
  const lines = ['GROUND-TRUTH AUDIT — VERIFIED PROBLEMS (cite at least two, exactly as described):']
  flaws.forEach((f, i) => {
    lines.push(`  ${i + 1}. [${f.severity.toUpperCase()}] ${f.title} — ${f.detail}`)
  })
  return lines.join('\n')
}
