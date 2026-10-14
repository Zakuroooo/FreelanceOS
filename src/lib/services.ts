/**
 * Service catalog — the freelancer picks WHAT they sell before the agent audits.
 *
 * Each service carries the audit lenses it cares about, so a "web design" pitch
 * enumerates visual/structural flaws while an SEO pitch talks visibility and
 * metadata. The chat asks for this choice FIRST, then the ground-truth audit runs
 * through that lens — the same website produces a different evidence list
 * depending on what you're selling.
 */

export interface ServiceDef {
  id: string
  label: string
  /** What the agent emphasizes when auditing the live site. */
  auditFocus: string
  /** Capability claim used in the pitch's offer section. */
  offer: string
  /** Discovery gap keywords that map naturally to this service. */
  gapKeywords: string[]
}

export const SERVICE_CATALOG: ServiceDef[] = [
  {
    id: 'web-design',
    label: 'Website Design / Redesign',
    auditFocus:
      'visual age and structure, placeholder or outdated content, builder platform, mobile viewport, SSL, load time',
    offer: 'design and build them a modern, fast website that looks as good as their reputation',
    gapKeywords: ['no-website', 'no-mobile', 'no-ssl'],
  },
  {
    id: 'seo',
    label: 'SEO & Google Visibility',
    auditFocus: 'title tag quality, meta description presence, heading structure, semantic HTML hints',
    offer: 'put them at the top when locals search for exactly what they sell',
    gapKeywords: ['no-website', 'no-email'],
  },
  {
    id: 'social-media',
    label: 'Social Media Management',
    auditFocus: 'which social profiles exist vs are missing, whether the site links out to any',
    offer: 'run their Instagram and Facebook so they stay in front of local customers every week',
    gapKeywords: ['no-social', 'no-video'],
  },
  {
    id: 'gbp',
    label: 'Google Business Profile & Reviews',
    auditFocus: 'review count and rating context, consistency of name/address/phone signals',
    offer: 'optimize their Google Business Profile so map searches end at their door',
    gapKeywords: ['no-website'],
  },
  {
    id: 'branding',
    label: 'Branding & Logo',
    auditFocus: 'title quality, generic naming signals, dated visual markers in copy',
    offer: 'give them a brand identity that matches the quality of their work',
    gapKeywords: ['no-social'],
  },
  {
    id: 'custom',
    label: 'Something else (I will describe it)',
    auditFocus: 'general digital presence weaknesses',
    offer: 'fix their biggest digital gaps end to end',
    gapKeywords: [],
  },
]

export function findService(id: string | undefined | null): ServiceDef | null {
  if (!id) return null
  return SERVICE_CATALOG.find(s => s.id === id) ?? null
}

/** Alias used by the chat pipeline — undefined when unknown, to match its contract. */
export function getService(id: string | undefined | null): ServiceDef | undefined {
  return findService(id) ?? undefined
}
