import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import * as cheerio from 'cheerio'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
/* eslint-disable @typescript-eslint/no-explicit-any */

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
export interface EnrichedClient {
  id:               string
  businessName:     string
  industry:         string
  location:         string
  website:          string
  websiteLive:      boolean
  metaDescription:  string
  email:            string
  phone:            string
  socials:          { instagram: string; facebook: string; linkedin: string; twitter?: string; youtube?: string; whatsapp?: string }
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
function calcScore(gaps: string[]): number {
  return gaps.length >= 3 ? 85 + Math.floor(Math.random() * 15)
    : gaps.length === 2   ? 60 + Math.floor(Math.random() * 24)
    : gaps.length === 1   ? 30 + Math.floor(Math.random() * 29)
    : 10
}

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
   WEBSITE HEAD CHECK
═══════════════════════════════════════════════════════ */
async function extractFromPage(html: string, socials: Record<string, string>, baseUrl: string): Promise<void> {
  const $ = cheerio.load(html)

  $('a').each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return

    const normalized = href.startsWith('http') ? href : new URL(href, baseUrl).href
    const lower = normalized.toLowerCase()

    if (!socials.instagram && (lower.includes('instagram.com') || lower.includes('instagr.am'))) socials.instagram = normalized
    if (!socials.facebook && (lower.includes('facebook.com') || lower.includes('fb.com'))) socials.facebook = normalized
    if (!socials.linkedin && lower.includes('linkedin.com')) socials.linkedin = normalized
    if (!socials.twitter && (lower.includes('twitter.com') || lower.includes('x.com'))) socials.twitter = normalized
    if (!socials.youtube && (lower.includes('youtube.com') || lower.includes('youtu.be'))) socials.youtube = normalized
    if (!socials.whatsapp && (lower.includes('wa.me') || lower.includes('api.whatsapp.com') || lower.includes('whatsapp.com'))) socials.whatsapp = normalized
    if (!socials.email && lower.startsWith('mailto:')) socials.email = normalized.replace('mailto:', '').split('?')[0]
  })
}

async function fetchPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    return res.ok ? await res.text() : ''
  } catch {
    return ''
  }
}

async function checkWebsite(
  url: string
): Promise<{ live: boolean; description: string; hasSSL: boolean; hasViewport: boolean; extractedSocials: { instagram: string; facebook: string; linkedin: string; twitter: string; youtube: string; whatsapp: string; email: string } }> {
  const extractedSocials = { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '', whatsapp: '', email: '' }
  if (!url) return { live: false, description: '', hasSSL: false, hasViewport: false, extractedSocials }

  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`
    const baseUrl = new URL(targetUrl).origin

    const getRes = await fetch(targetUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
    })

    if (!getRes.ok)
      return { live: true, description: '', hasSSL: getRes.url.startsWith('https'), hasViewport: false, extractedSocials }

    const html = await getRes.text()
    const $ = cheerio.load(html)

    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || ''
    const hasViewport = $('meta[name="viewport"]').length > 0

    extractFromPage(html, extractedSocials, targetUrl)

    if (Object.values(extractedSocials).some(v => v)) {
      return {
        live: true,
        description: description.trim().substring(0, 200),
        hasSSL: getRes.url.startsWith('https'),
        hasViewport,
        extractedSocials
      }
    }

    const internalPaths = ['/contact', '/contact-us', '/about', '/about-us', '/footer']
    const internalUrls = internalPaths.map(p => baseUrl + p).slice(0, 3)
    const pageHtmls = await Promise.all(internalUrls.map(fetchPage))

    for (const pageHtml of pageHtmls) {
      if (pageHtml) extractFromPage(pageHtml, extractedSocials, baseUrl)
      if (extractedSocials.instagram && extractedSocials.email) break
    }

    return {
      live:        true,
      description: description.trim().substring(0, 200),
      hasSSL:      getRes.url.startsWith('https'),
      hasViewport,
      extractedSocials
    }
  } catch {
    return { live: false, description: '', hasSSL: false, hasViewport: false, extractedSocials }
  }
}

/* ═══════════════════════════════════════════════════════
   ENRICH A RAW PLACE RESULT
═══════════════════════════════════════════════════════ */
async function enrichPlace(
  raw: any,
  idx: number,
  businessType: string,
  location: string
): Promise<EnrichedClient> {
  const website = raw.website || ''
  const phone   = raw.phone || raw.phoneUnformatted || ''
  const email   = raw.email || ''

  const webCheck = await checkWebsite(website)

  const gaps: string[] = []
  if (!website || !webCheck.live) gaps.push('no-website')
  else {
    if (!webCheck.hasSSL)      gaps.push('no-ssl')
    if (!webCheck.hasViewport) gaps.push('no-mobile')
  }
  const instagram = raw.instagram || webCheck.extractedSocials.instagram || ''
  const facebook  = raw.facebook  || webCheck.extractedSocials.facebook || ''
  const linkedin  = raw.linkedin  || webCheck.extractedSocials.linkedin || ''
  const twitter   = raw.twitter   || webCheck.extractedSocials.twitter || ''
  const youtube   = raw.youtube   || webCheck.extractedSocials.youtube || ''
  const whatsapp  = raw.whatsapp  || webCheck.extractedSocials.whatsapp || ''
  const finalEmail = email || webCheck.extractedSocials.email || ''

  if (!instagram && !facebook) gaps.push('no-social')
  if (!raw.videos?.length && !youtube) gaps.push('no-video')

  return {
    id:               raw.placeId || raw.place_id || String(idx),
    businessName:     raw.title   || raw.name || '',
    industry:         businessType,
    location:         raw.address || raw.full_address || location,
    website,
    websiteLive:      webCheck.live,
    metaDescription:  webCheck.description,
    email:            finalEmail,
    phone,
    socials:          { instagram, facebook, linkedin, twitter, youtube, whatsapp },
    detectedGaps:     gaps,
    source:           raw._source || 'scraped',
    opportunityScore: calcScore(gaps),
    rating:           raw.totalScore ?? raw.rating ?? null,
    reviewCount:      raw.reviewsCount ?? raw.reviews ?? 0,
    googleMapsUrl:    raw.url || raw.place_link || '',
    category:         raw.category || raw.type || businessType,
  }
}

/* ═══════════════════════════════════════════════════════
   SOURCE 1: SerpAPI Google Maps (fast, synchronous)
═══════════════════════════════════════════════════════ */
async function fetchViaSerpApi(
  query: string,
  serpapiKey: string
): Promise<any[]> {
  console.log('[discover] Trying SerpAPI Google Maps for:', query)

  const params = new URLSearchParams({
    engine:  'google_maps',
    q:       query,
    num:     '20',
    api_key: serpapiKey,
  })

  const res = await fetch(`https://serpapi.com/search.json?${params}`, {
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`SerpAPI error ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = await res.json()

  if (data.error) {
    throw new Error(`SerpAPI: ${data.error}`)
  }

  const places: any[] = data.local_results || data.place_results || []
  console.log(`[discover] SerpAPI returned ${places.length} places`)

  // Normalize SerpAPI shape to our common shape
  return places.map((p: any) => ({
    placeId:      p.place_id  || p.data_id || '',
    title:        p.title     || p.name    || '',
    address:      p.address   || p.full_address || '',
    phone:        p.phone     || '',
    website:      p.website   || '',
    email:        p.email     || '',
    totalScore:   p.rating    ?? null,
    reviewsCount: p.reviews   ?? 0,
    url:          p.place_link || p.link || '',
    category:     p.type      || '',
    instagram:    '',
    facebook:     '',
    linkedin:     '',
    videos:       [],
    _source:      'serpapi',
  }))
}

/* ═══════════════════════════════════════════════════════
   SOURCE 2: Apify Google Maps Scraper (poll-based)
═══════════════════════════════════════════════════════ */
async function fetchViaApify(
  query: string,
  apifyToken: string
): Promise<any[]> {
  console.log('[discover] Trying Apify Google Maps scraper for:', query)

  const startRes = await fetch(
    'https://api.apify.com/v2/acts/compass~google-maps-extractor/runs',
    {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${apifyToken}`,
      },
      body: JSON.stringify({
        searchStringsArray:  [query],
        maxCrawledPlaces:    20,
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
    throw new Error(`Apify start failed (${startRes.status}): ${body.slice(0, 300)}`)
  }

  const runData = await startRes.json()
  const runId   = runData?.data?.id
  if (!runId) throw new Error('Apify did not return a run ID')
  console.log('[discover] Apify run ID:', runId)

  // Poll for up to 90 seconds
  for (let attempt = 0; attempt < 45; attempt++) {
    await new Promise(r => setTimeout(r, 2000))
    const stRes   = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: { Authorization: `Bearer ${apifyToken}` },
    })
    const stData    = await stRes.json()
    const runStatus = stData?.data?.status as string
    console.log('[discover] Apify run status:', runStatus)

    if (runStatus === 'SUCCEEDED') {
      const items = await (
        await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?limit=30`, {
          headers: { Authorization: `Bearer ${apifyToken}` },
        })
      ).json()
      const arr = Array.isArray(items) ? items : []
      console.log('[discover] Apify returned', arr.length, 'items')
      return arr.map((p: any) => ({ ...p, _source: 'apify' }))
    }

    if (runStatus === 'FAILED' || runStatus === 'ABORTED')
      throw new Error(`Apify actor ${runStatus}`)
  }

  throw new Error('Apify timed out after 90s')
}

/* ═══════════════════════════════════════════════════════
   ROUTE
═══════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { businessType, location, query: rawQuery } = body

  const query = rawQuery || (businessType ? `${businessType} in ${location || 'India'}` : '')
  if (!query)
    return NextResponse.json({ error: 'query or businessType is required' }, { status: 400 })

  const APIFY_TOKEN = process.env.APIFY_API_TOKEN  || ''
  const SERPAPI_KEY = process.env.SERPAPI_KEY       || ''

  if (!APIFY_TOKEN && !SERPAPI_KEY) {
    return NextResponse.json(
      { error: 'No API keys configured. Add APIFY_API_TOKEN or SERPAPI_KEY to .env.local' },
      { status: 503 }
    )
  }

  let rawResults: any[] = []
  const errors: string[] = []

  /* ── Try Apify first (real Google Maps scraper) ──── */
  if (APIFY_TOKEN) {
    try {
      rawResults = await fetchViaApify(query, APIFY_TOKEN)
    } catch (e: any) {
      console.error('[discover] Apify failed:', e.message)
      errors.push(`Apify: ${e.message}`)
    }
  }

  /* ── Fall back to SerpAPI if Apify gave nothing ──── */
  if (rawResults.length === 0 && SERPAPI_KEY) {
    try {
      rawResults = await fetchViaSerpApi(query, SERPAPI_KEY)
    } catch (e: any) {
      console.error('[discover] SerpAPI failed:', e.message)
      errors.push(`SerpAPI: ${e.message}`)
    }
  }

  /* ── Both failed — return a real error, NOT mock data ─ */
  if (rawResults.length === 0) {
    console.error('[discover] All sources failed:', errors)
    return NextResponse.json(
      {
        error:   'Could not fetch real business data. Check your API keys and credits.',
        details: errors,
      },
      { status: 502 }
    )
  }

  /* ── Enrich results ─────────────────────────────────── */
  console.log('[discover] Enriching', rawResults.length, 'results…')
  const clients = await pMap(
    rawResults,
    (raw, i) => enrichPlace(raw, i, businessType || query.split(' in ')[0] || 'Business', location || 'India'),
    6
  )

  const finalClients = clients.map(client => {
    const hasSocial = client.socials.instagram || 
                      client.socials.facebook ||
                      client.socials.linkedin
    const gaps = [
      ...(!client.website ? ['no-website'] : []),
      ...(!hasSocial ? ['no-social'] : []),
      ...(!client.socials.youtube ? ['no-video'] : []),
    ]
    
    const score = gaps.length === 3 
      ? 85 + Math.floor(Math.random() * 15)
      : gaps.length === 2 
      ? 60 + Math.floor(Math.random() * 24)
      : gaps.length === 1 
      ? 30 + Math.floor(Math.random() * 29)
      : 10

    return { ...client, detectedGaps: gaps, opportunityScore: score }
  })

  finalClients.sort((a, b) => b.opportunityScore - a.opportunityScore)
  console.log('[discover] Done. Returning', finalClients.length, 'real clients.')

  const dataSource = rawResults[0]?._source || 'scraped'
  return NextResponse.json({
    clients: finalClients,
    total:  finalClients.length,
    source: dataSource,
    ...(errors.length ? { warnings: errors } : {}),
  })
}
