import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
interface EnrichedClient {
  id:               string
  businessName:     string
  industry:         string
  location:         string
  website:          string
  websiteLive:      boolean
  metaDescription:  string
  email:            string
  phone:            string
  socials:          { instagram: string; facebook: string; linkedin: string }
  detectedGaps:     string[]
  source:           string
  opportunityScore: number
  rating:           number | null
  reviewCount:      number
  googleMapsUrl:    string
  category:         string
}

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function extractSocial(arr: any[], platform: string): string {
  if (!Array.isArray(arr)) return ''
  const hit = arr.find((s: any) =>
    s?.url?.toLowerCase().includes(platform) ||
    s?.type?.toLowerCase() === platform
  )
  return hit?.url || hit?.handle || ''
}

function calcScore(gaps: string[]): number {
  return gaps.length >= 3 ? 85 + Math.floor(Math.random() * 15)
    : gaps.length === 2   ? 60 + Math.floor(Math.random() * 24)
    : gaps.length === 1   ? 30 + Math.floor(Math.random() * 29)
    : 10
}

/** Run tasks with max N concurrent */
async function pMap<T, R>(
  items: T[],
  fn: (item: T, i: number) => Promise<R>,
  concurrency = 6
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let idx = 0
  async function worker() {
    while (idx < items.length) {
      const i = idx++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

/* ═══════════════════════════════════════════════════════
   SOURCE 2 — Website HEAD check + meta description
═══════════════════════════════════════════════════════ */
async function checkWebsite(url: string): Promise<{ live: boolean; description: string }> {
  if (!url) return { live: false, description: '' }
  try {
    // HEAD to confirm server responds
    const headRes = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreelanceOS/1.0)' },
    })
    if (!headRes.ok && headRes.status !== 405) return { live: false, description: '' }

    // GET for meta description — read only first 8 KB
    const getRes = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreelanceOS/1.0)' },
    })
    if (!getRes.ok) return { live: true, description: '' }

    const reader = getRes.body?.getReader()
    if (!reader) return { live: true, description: '' }

    let chunk = ''
    let bytes  = 0
    while (bytes < 8192) {
      const { done, value } = await reader.read()
      if (done) break
      chunk += new TextDecoder().decode(value)
      bytes += value?.length ?? 0
    }
    reader.cancel()

    const match = chunk.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,200})/i)
              || chunk.match(/<meta[^>]+content=["']([^"']{0,200})["'][^>]+name=["']description["']/i)
    return { live: true, description: match?.[1]?.trim() || '' }

  } catch {
    return { live: false, description: '' }
  }
}

/* ═══════════════════════════════════════════════════════
   SOURCE 3 — SerpAPI social discovery
═══════════════════════════════════════════════════════ */
async function searchSocials(
  name: string,
  city: string,
  serpapiKey: string
): Promise<{ instagram: string; facebook: string; linkedin: string }> {
  const result = { instagram: '', facebook: '', linkedin: '' }
  if (!serpapiKey || serpapiKey === 'your_serpapi_key_here') return result

  try {
    const q       = encodeURIComponent(`"${name}" ${city} instagram OR facebook OR linkedin`)
    const url     = `https://serpapi.com/search.json?engine=google&q=${q}&num=5&api_key=${serpapiKey}`
    const res     = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return result
    const data    = await res.json()
    const links   = (data.organic_results ?? []) as Array<{ link?: string }>

    for (const item of links) {
      const link = item.link || ''
      if (!result.instagram && /instagram\.com\//i.test(link)) result.instagram = link
      if (!result.facebook  && /facebook\.com\//i.test(link))  result.facebook  = link
      if (!result.linkedin  && /linkedin\.com\//i.test(link))  result.linkedin  = link
      if (result.instagram && result.facebook && result.linkedin) break
    }
  } catch { /* silent — enrichment is best-effort */ }

  return result
}

/* ═══════════════════════════════════════════════════════
   ENRICHMENT — combine sources 2 + 3
═══════════════════════════════════════════════════════ */
async function enrich(
  raw: any,
  idx: number,
  businessType: string,
  location: string,
  serpapiKey: string
): Promise<EnrichedClient> {
  const website   = raw.website || ''
  const phone     = raw.phone   || raw.phoneUnformatted || ''
  const email     = raw.email   || ''
  const city      = raw.city    || location.split(',')[0].trim()

  // Socials from Apify first
  let instagram = raw.instagram || extractSocial(raw.socialMedia, 'instagram')
  let facebook  = raw.facebook  || extractSocial(raw.socialMedia, 'facebook')
  let linkedin  = raw.linkedin  || extractSocial(raw.socialMedia, 'linkedin')

  // Run sources 2 + 3 in parallel
  const [webCheck, foundSocials] = await Promise.all([
    checkWebsite(website),
    (!instagram && !facebook)
      ? searchSocials(raw.title || '', city, serpapiKey)
      : Promise.resolve({ instagram: '', facebook: '', linkedin: '' }),
  ])

  // Merge social discovery
  if (!instagram && foundSocials.instagram) instagram = foundSocials.instagram
  if (!facebook  && foundSocials.facebook)  facebook  = foundSocials.facebook
  if (!linkedin  && foundSocials.linkedin)  linkedin  = foundSocials.linkedin

  // Gap detection (post-enrichment)
  const gaps: string[] = []
  if (!website || !webCheck.live)          gaps.push('no-website')
  if (!instagram && !facebook)             gaps.push('no-social')
  if (!raw.videos?.length)                 gaps.push('no-video')

  return {
    id:               raw.placeId || String(idx),
    businessName:     raw.title   || '',
    industry:         businessType,
    location:         raw.address || raw.city || location,
    website,
    websiteLive:      webCheck.live,
    metaDescription:  webCheck.description,
    email,
    phone,
    socials:          { instagram, facebook, linkedin },
    detectedGaps:     gaps,
    source:           'scraped',
    opportunityScore: calcScore(gaps),
    rating:           raw.totalScore   ?? null,
    reviewCount:      raw.reviewsCount ?? 0,
    googleMapsUrl:    raw.url          || '',
    category:         raw.category     || businessType,
  }
}

/* ═══════════════════════════════════════════════════════
   MOCK FALLBACK
═══════════════════════════════════════════════════════ */
function buildMocks(businessType: string, location: string): EnrichedClient[] {
  const names = [
    'Bright Smile Dental',   'City Health Clinic',     'Metro Fitness Studio',
    'Sunrise Bakery',        'Elite Law Group',         'Pixel Creative Agency',
    'Green Thumb Nursery',   'Harbour View Restaurant', 'Peak Performance Gym',
    'Urban Cuts Barbershop', 'Golden Gate Realty',      'Cloud Nine Spa',
    'Downtown Auto Repair',  'The Corner Bookshop',     'Fresh Press Juice Bar',
    'Apex Accounting',       'Blue Ridge Photography',  'Velocity Tech Repair',
    'The Wine Cellar',       'Silver Spoon Catering',
  ]
  return names.map((name, i) => {
    const hasWebsite = Math.random() > 0.45
    const hasSocial  = Math.random() > 0.50
    const hasVideo   = Math.random() > 0.60
    const gaps: string[] = []
    if (!hasWebsite) gaps.push('no-website')
    if (!hasSocial)  gaps.push('no-social')
    if (!hasVideo)   gaps.push('no-video')
    const slug = name.toLowerCase().replace(/\s+/g, '')
    return {
      id:               String(i),
      businessName:     name,
      industry:         businessType,
      location:         `${location}, ${['CA','NY','TX','FL','WA'][i % 5]}`,
      website:          hasWebsite ? `https://www.${slug}.com` : '',
      websiteLive:      hasWebsite,
      metaDescription:  hasWebsite ? `${name} — serving the community since 2010.` : '',
      email:            Math.random() > 0.4 ? `info@${slug}.com` : '',
      phone:            Math.random() > 0.3 ? `+1 (${300 + i}) 555-${1000 + i}` : '',
      socials: {
        instagram: hasSocial ? `https://instagram.com/${slug}` : '',
        linkedin:  Math.random() > 0.6 ? `https://linkedin.com/company/${slug}` : '',
        facebook:  hasSocial ? `https://facebook.com/${slug}` : '',
      },
      detectedGaps:     gaps,
      source:           'mock',
      opportunityScore: calcScore(gaps),
      rating:           parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount:      Math.floor(Math.random() * 300),
      googleMapsUrl:    '',
      category:         businessType,
    }
  }).sort((a, b) => b.opportunityScore - a.opportunityScore)
}

/* ═══════════════════════════════════════════════════════
   ROUTE
═══════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessType, location } = await req.json()
  if (!businessType) return NextResponse.json({ error: 'businessType is required' }, { status: 400 })

  const APIFY_TOKEN  = process.env.APIFY_API_TOKEN
  const SERPAPI_KEY  = process.env.SERPAPI_KEY || ''

  /* ── no token → instant mocks ──────────────────── */
  if (!APIFY_TOKEN) {
    const mocks = buildMocks(businessType, location || 'United States')
    return NextResponse.json({ clients: mocks, total: mocks.length, source: 'mock' })
  }

  /* ── Source 1: Apify ────────────────────────────── */
  try {
    console.log(`[discover] Starting run — "${businessType} in ${location}"`)

    const startRes = await fetch(
      'https://api.apify.com/v2/acts/compass~crawler-google-places/runs',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${APIFY_TOKEN}` },
        body: JSON.stringify({
          searchStringsArray:  [`${businessType} in ${location}`],
          maxCrawledPlaces:    40,
          language:            'en',
          maxImages:           0,
          maxReviews:          0,
          scrapeContacts:      true,
          includeHistogram:    false,
          includeOpeningHours: false,
        }),
      }
    )
    if (!startRes.ok) {
      const body = await startRes.text()
      console.error('[discover] Apify start failed:', startRes.status, body)
      throw new Error(`Apify start failed: ${startRes.status}`)
    }
    const runData = await startRes.json()
    const runId   = runData?.data?.id
    console.log('[discover] Run ID:', runId)

    /* ── poll 60 × 2s = 120s max ──────────────────── */
    let rawResults: any[] = []
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise(r => setTimeout(r, 2000))
      const stRes     = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
      })
      const stData    = await stRes.json()
      const runStatus = stData?.data?.status as string
      console.log(`[discover] Apify run status (attempt ${attempt + 1}):`, runStatus)

      if (runStatus === 'SUCCEEDED') {
        rawResults = await (await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?limit=40`,
          { headers: { Authorization: `Bearer ${APIFY_TOKEN}` } }
        )).json()
        console.log('[discover] Results count:', Array.isArray(rawResults) ? rawResults.length : 'not-array')
        break
      }
      if (runStatus === 'FAILED' || runStatus === 'ABORTED')
        throw new Error(`Apify actor ${runStatus}`)
    }

    /* ── Sources 2 + 3: parallel enrichment ─────────── */
    console.log('[discover] Enriching', rawResults.length, 'results (website + socials)...')
    const clients = await pMap(
      rawResults,
      (raw, i) => enrich(raw, i, businessType, location, SERPAPI_KEY),
      6
    )

    clients.sort((a, b) => b.opportunityScore - a.opportunityScore)
    console.log('[discover] Done. Returning', clients.length, 'enriched clients.')
    return NextResponse.json({ clients, total: clients.length, source: 'scraped' })

  } catch (err) {
    console.error('[discover] Error:', err)
    const mocks = buildMocks(businessType, location || 'United States')
    return NextResponse.json({ clients: mocks, total: mocks.length, source: 'mock-fallback' })
  }
}
