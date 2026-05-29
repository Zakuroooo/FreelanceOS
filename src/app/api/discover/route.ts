import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import * as cheerio from 'cheerio'
import dbConnect from '@/lib/db'
import DiscoverCache from '@/lib/models/DiscoverCache'


/* eslint-disable @typescript-eslint/no-explicit-any */

export interface EnrichedClient {
  id: string; businessName: string; industry: string; location: string
  website: string; websiteLive: boolean; metaDescription: string
  email: string; emailConfidence: 'confirmed' | 'guessed' | 'none'
  phone: string
  socials: { instagram: string; facebook: string; linkedin: string; twitter: string; youtube: string; whatsapp: string }
  socialCount: number; detectedGaps: string[]; source: string
  opportunityScore: number; rating: number | null; reviewCount: number
  googleMapsUrl: string; category: string
  leadState: 'new' | 'seen' | 'saved' | 'pitched' | 'responded' | 'won' | 'lost' | 'ignored'
  intelStatus: 'light_scan' | 'prefetching' | 'ready' | 'stale'
  sourceConfidence: 'verified' | 'scraped' | 'inferred' | 'guessed'
  sourceOrigin: string
}

async function pMap<T, R>(items: T[], fn: (item: T, i: number) => Promise<R>, concurrency = 5): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let idx = 0
  async function worker() { while (idx < items.length) { const i = idx++; results[i] = await fn(items[i], i) } }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

function countSocials(s: Record<string, string>) {
  return Object.values(s).filter(v => v && v.length > 0).length
}

/* ── URL sanity check ─────────────────────────────────── */
function isValidBusinessWebsite(url: string): boolean {
  if (!url) return false
  try {
    const h = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase()
    const BAD = ['google.com','maps.google','goo.gl','googleapis','googleusercontent','apple.com','microsoft.com','facebook.com','instagram.com','twitter.com','x.com','linkedin.com','youtube.com','yelp.com','tripadvisor.com','foursquare.com','zomato.com']
    if (BAD.some(b => h.includes(b))) return false
    return h.includes('.')
  } catch { return false }
}

/* ── LAYER 1: Website scraping ─────────────────────────── */
async function scrapeWebsite(url: string): Promise<{ socials: Record<string, string>; websiteLive: boolean; metaDescription: string; phone: string }> {
  const socials: Record<string, string> = {}
  let websiteLive = false; let metaDescription = ''; let phone = ''
  if (!url || !isValidBusinessWebsite(url)) return { socials, websiteLive, metaDescription, phone }
  const base = url.startsWith('http') ? url : `https://${url}`
  const pages = [base, base.replace(/\/$/, '') + '/contact', base.replace(/\/$/, '') + '/about']
  const htmlParts: string[] = []
  await Promise.allSettled(pages.map(async (u, pageIdx) => {
    try {
      // ScrapingBee fallback for JS-heavy sites if direct fetch fails
      let html = ''
      let ok = false
      const directRes = await fetch(u, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }).catch(() => null)
      if (directRes?.ok) { html = await directRes.text(); ok = true }
      
      if (!ok && process.env.SCRAPINGBEE_KEY) {
        const sbRes = await fetch(`https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPINGBEE_KEY}&url=${encodeURIComponent(u)}&render_js=false`, { signal: AbortSignal.timeout(10000) }).catch(() => null)
        if (sbRes?.ok) { html = await sbRes.text(); ok = true }
      }

      if (!ok && process.env.SCRAPINGANT_KEY) {
        const saRes = await fetch(`https://api.scrapingant.com/v2/general?url=${encodeURIComponent(u)}&x-api-key=${process.env.SCRAPINGANT_KEY}&browser=false`, { signal: AbortSignal.timeout(10000) }).catch(() => null)
        if (saRes?.ok) { html = await saRes.text(); ok = true }
      }

      if (!ok && process.env.ZENROWS_KEY) {
        const zrRes = await fetch(`https://api.zenrows.com/v1/?apikey=${process.env.ZENROWS_KEY}&url=${encodeURIComponent(u)}`, { signal: AbortSignal.timeout(10000) }).catch(() => null)
        if (zrRes?.ok) { html = await zrRes.text(); ok = true }
      }
      if (!ok || !html) return
      htmlParts.push(html)
      if (pageIdx === 0) {
        websiteLive = true
        const $m = cheerio.load(html)
        metaDescription = ($m('meta[name="description"]').attr('content') || $m('meta[property="og:description"]').attr('content') || '').substring(0, 200)
      }
    } catch { /* ignore */ }
  }))
  const html = htmlParts.join('\n')
  if (!html) return { socials, websiteLive, metaDescription, phone }
  const $ = cheerio.load(html)

  // JSON-LD sameAs
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '')
      const items = Array.isArray(data) ? data : [data]
      items.forEach((d: any) => {
        const sameAs: string[] = Array.isArray(d.sameAs) ? d.sameAs : (d.sameAs ? [d.sameAs] : [])
        sameAs.forEach(u => {
          const l = u.toLowerCase()
          if (!socials.instagram && l.includes('instagram.com')) socials.instagram = u
          if (!socials.facebook && l.includes('facebook.com') && !l.includes('sharer')) socials.facebook = u
          if (!socials.linkedin && l.includes('linkedin.com')) socials.linkedin = u
          if (!socials.youtube && l.includes('youtube.com') && !l.includes('watch')) socials.youtube = u
          if (!socials.twitter && (l.includes('twitter.com') || l.includes('x.com'))) socials.twitter = u
        })
        if (!socials.email && d.email) socials.email = d.email
      })
    } catch { /* ignore */ }
  })

  // <a> tags (filtered)
  $('a[href]').each((_, el) => {
    const h = ($(el).attr('href') || '').toLowerCase()
    
    // ignore builder default socials
    const isBad = h.includes('wix.com') || h.includes('shopify.com') || h.includes('squarespace.com') || h.includes('wordpress.com') || h.includes('yelp.com')
    if (isBad) return

    const isTwitterShare = h.includes('twitter.com/intent') || h.includes('twitter.com/share') || h.includes('x.com/intent') || h.includes('x.com/share')
    const isLinkedinShare = h.includes('linkedin.com/shareArticle') || h.includes('linkedin.com/sharing')

    if (!socials.instagram && h.includes('instagram.com/') && !h.includes('/p/') && !h.match(/\/p[\/?#]/) && !h.includes('/reel') && !h.includes('/wix') && !h.includes('/shopify')) socials.instagram = $(el).attr('href')!
    if (!socials.facebook && h.includes('facebook.com/') && !h.includes('sharer') && !h.includes('share?') && !h.includes('groups/') && !h.includes('/wix') && !h.includes('/shopify')) socials.facebook = $(el).attr('href')!
    if (!socials.linkedin && h.includes('linkedin.com/') && !h.includes('/wix') && !isLinkedinShare) socials.linkedin = $(el).attr('href')!
    if (!socials.twitter && (h.includes('twitter.com/') || h.includes('x.com/')) && !h.includes('/wix') && !isTwitterShare) socials.twitter = $(el).attr('href')!
    if (!socials.youtube && h.includes('youtube.com/') && !h.includes('watch') && !h.includes('/wix')) socials.youtube = $(el).attr('href')!
    if (!socials.whatsapp && (h.includes('wa.me/') || h.includes('whatsapp.com/'))) socials.whatsapp = $(el).attr('href')!
    if (!socials.email && h.startsWith('mailto:')) socials.email = h.replace('mailto:', '').split('?')[0]
  })

  // raw text regex for @handles and phone
  const bodyText = $('body').text()
  if (!socials.instagram) {
    const m = bodyText.match(/instagram\.com\/([a-zA-Z0-9_.]{2,30})/)
    if (m) {
      const p = m[1].toLowerCase()
      if (!['p','reel','reels','explore','stories','tags','tv'].includes(p)) {
        socials.instagram = `https://www.instagram.com/${m[1]}/`
      }
    }
  }

  // Phone number extraction from page text
  if (!socials.phone) {
    const phoneMatch = bodyText.match(/(?:(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,5})/)
    if (phoneMatch) {
      const cleaned = phoneMatch[0].replace(/[^\d+]/g, '')
      if (cleaned.length >= 7 && cleaned.length <= 15) phone = phoneMatch[0].trim()
    }
  }

  return { socials, websiteLive, metaDescription, phone }
}

/* ── LAYER 2: SERP Knowledge Graph (with fallback chain) ── */
async function serpKnowledgeGraph(name: string, location: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  const q = encodeURIComponent(`${name} ${location}`)

  const providers = [
    { name: 'serper', url: `https://google.serper.dev/search`, method: 'POST', body: JSON.stringify({ q: `${name} ${location}` }), headers: { 'X-API-KEY': process.env.SERPER_API_KEY || '', 'Content-Type': 'application/json' }, kg: 'knowledgeGraph', active: !!process.env.SERPER_API_KEY },
    { name: 'serpapi', url: `https://serpapi.com/search.json?engine=google&q=${q}&api_key=${process.env.SERPAPI_KEY}`, kg: 'knowledge_graph', active: !!process.env.SERPAPI_KEY },
    { name: 'scaleserp', url: `https://api.scaleserp.com/search?api_key=${process.env.SCALESERP_KEY}&q=${q}`, kg: 'knowledge_graph', active: !!process.env.SCALESERP_KEY },
    { name: 'valueserp', url: `https://api.valueserp.com/search?api_key=${process.env.VALUESERP_KEY}&q=${q}`, kg: 'knowledge_graph', active: !!process.env.VALUESERP_KEY },
    { name: 'serpstack', url: `https://api.serpstack.com/search?access_key=${process.env.SERPSTACK_KEY}&query=${q}`, kg: 'knowledge_graph', active: !!process.env.SERPSTACK_KEY },
  ].filter(p => p.active)

  for (const k of providers) {
    let data: any = null
    let success = false
    if (k.method === 'POST') {
      try {
        const r = await fetch(k.url, { method: 'POST', body: k.body, headers: k.headers as any, signal: AbortSignal.timeout(8000) })
        if (r.ok) { data = await r.json(); success = true }
      } catch { /* ignore */ }
    } else {
      try {
        const r = await fetch(k.url, { signal: AbortSignal.timeout(8000) })
        if (r.ok) { data = await r.json(); success = true }
      } catch { /* ignore */ }
    }

    if (success && data) {
      const kg = data[k.kg] || {}

      // KG profiles array (SerpAPI/ScaleSerp/ValueSERP)
      const profiles: any[] = kg.profiles || kg.social_links || []
      profiles.forEach((p: any) => {
        const link = (p.link || p.url || '').toLowerCase()
        if (!out.instagram && link.includes('instagram')) out.instagram = p.link || p.url
        if (!out.facebook && link.includes('facebook') && !link.includes('sharer')) out.facebook = p.link || p.url
        if (!out.linkedin && link.includes('linkedin')) out.linkedin = p.link || p.url
        if (!out.youtube && link.includes('youtube')) out.youtube = p.link || p.url
        if (!out.twitter && (link.includes('twitter') || link.includes('x.com'))) out.twitter = p.link || p.url
      })

      // Organic results — main path for Serper (no kg.profiles on Serper)
      const organic: any[] = data.organic || data.organic_results || []
      organic.forEach((res: any) => {
        const lnk = res.link || ''; const l = lnk.toLowerCase()
        if (!out.instagram && l.includes('instagram.com/') && !l.includes('/p/') && !l.includes('/reel')) out.instagram = lnk
        if (!out.facebook && l.includes('facebook.com/') && !l.includes('share')) out.facebook = lnk
        if (!out.linkedin && l.includes('linkedin.com/')) out.linkedin = lnk
        if (!out.youtube && l.includes('youtube.com/') && !l.includes('watch')) out.youtube = lnk
        if (!out.twitter && (l.includes('twitter.com/') || l.includes('x.com/'))) out.twitter = lnk
      })

      if (!out.email && kg.email) out.email = kg.email
      if (!out.phone && kg.phone) out.phone = kg.phone

      // ALWAYS break if API call was successful, even if no social links were found.
      // This prevents useless fallbacks that burn credits and cause huge latency.
      break
    }
  }

  return out
}

/* ── LAYER 3: Targeted social search ──────────────────── */
async function targetedSocialSearch(name: string, location: string, needIG: boolean, needFB: boolean, needLI: boolean): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  const searches: { platform: string; q: string }[] = []
  if (needIG) searches.push({ platform: 'instagram', q: `"${name}" site:instagram.com` })
  if (needFB) searches.push({ platform: 'facebook', q: `"${name}" "${location}" site:facebook.com` })
  if (needLI) searches.push({ platform: 'linkedin', q: `"${name}" "${location}" site:linkedin.com/company` })

  await Promise.all(searches.map(async ({ platform, q }) => {
    const eq = encodeURIComponent(q)
    let success = false

    // Try Serper first (2500 free/month)
    if (process.env.SERPER_API_KEY) {
      try {
        const r = await fetch('https://google.serper.dev/search', {
          method: 'POST', signal: AbortSignal.timeout(8000),
          headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q })
        })
        if (r.ok) {
          success = true
          const d = await r.json()
          const link = d.organic?.[0]?.link
          if (link) out[platform] = link
        }
      } catch { /* ignore */ }
    }

    // Fallback: SerpAPI
    if (!success && process.env.SERPAPI_KEY) {
      try {
        const r = await fetch(`https://serpapi.com/search.json?engine=google&q=${eq}&api_key=${process.env.SERPAPI_KEY}`, { signal: AbortSignal.timeout(8000) })
        if (r.ok) {
          success = true
          const d = await r.json()
          const link = d.organic_results?.[0]?.link
          if (link) out[platform] = link
        }
      } catch { /* ignore */ }
    }

    // Fallback: Google CSE
    if (!success && process.env.GOOGLE_CSE_KEY && process.env.GOOGLE_CSE_ID) {
      try {
        const r = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${eq}`, { signal: AbortSignal.timeout(8000) })
        if (r.ok) {
          success = true
          const d = await r.json()
          const link = d.items?.[0]?.link
          if (link) out[platform] = link
        }
      } catch { /* ignore */ }
    }
  }))
  return out
}

/* ── LAYER 4: HEAD-verified handle guess ───────────────── */
async function guessHandle(name: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30)
  if (!slug) return out

  // Instagram guess
  const igUrl = `https://www.instagram.com/${slug}/`
  try {
    const r = await fetch(igUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    if (r.status === 200) out.instagram = igUrl
  } catch { /* ignore */ }

  // Facebook guess (common username pattern)
  const fbUrl = `https://www.facebook.com/${slug}`
  try {
    const r = await fetch(fbUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    if (r.status === 200) out.facebook = fbUrl
  } catch { /* ignore */ }

  // LinkedIn company guess
  const liUrl = `https://www.linkedin.com/company/${slug}/`
  try {
    const r = await fetch(liUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    if (r.status === 200) out.linkedin = liUrl
  } catch { /* ignore */ }

  return out
}

/* ── LAYER 5: TripAdvisor scrape ───────────────────────── */
async function scrapeAggregator(name: string, location: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  try {
    const q = encodeURIComponent(`${name} ${location} site:tripadvisor.com`)
    let listingUrl = ''
    let success = false

    if (process.env.SERPER_API_KEY) {
      try {
        const r = await fetch('https://google.serper.dev/search', {
          method: 'POST', signal: AbortSignal.timeout(6000),
          headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: `${name} ${location} site:tripadvisor.com` })
        })
        if (r.ok) { 
          success = true
          const d = await r.json()
          listingUrl = d.organic?.[0]?.link || '' 
        }
      } catch { /* ignore */ }
    }
    if (!success && process.env.SERPAPI_KEY) {
      try {
        const r = await fetch(`https://serpapi.com/search.json?engine=google&q=${q}&api_key=${process.env.SERPAPI_KEY}`, { signal: AbortSignal.timeout(6000) })
        if (r.ok) { 
          success = true
          const d = await r.json()
          listingUrl = d.organic_results?.[0]?.link || '' 
        }
      } catch { /* ignore */ }
    }
    
    if (!listingUrl) return out
    const pageRes = await fetch(listingUrl, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!pageRes.ok) return out
    const html = await pageRes.text()
    const $ = cheerio.load(html)
    $('a[href]').each((_, el) => {
      const h = ($(el).attr('href') || '').toLowerCase()
      const isAggregatorSocial = h.includes('/tripadvisor') || h.includes('/yelp')
      if (isAggregatorSocial) return
      
      if (!out.instagram && h.includes('instagram.com/')) out.instagram = $(el).attr('href')!
      if (!out.facebook && h.includes('facebook.com/') && !h.includes('sharer')) out.facebook = $(el).attr('href')!
      if (!out.linkedin && h.includes('linkedin.com/')) out.linkedin = $(el).attr('href')!
      if (!out.youtube && h.includes('youtube.com/') && !h.includes('watch')) out.youtube = $(el).attr('href')!
      if (!out.twitter && (h.includes('twitter.com/') || h.includes('x.com/'))) out.twitter = $(el).attr('href')!
    })
  } catch { /* ignore */ }
  return out
}

/* ── MAIN ENRICHMENT FUNCTION ──────────────────────────── */
async function enrichPlace(raw: any, idx: number, businessType: string, location: string): Promise<EnrichedClient> {
  const website = raw.website || ''
  let phone = raw.phone || raw.phoneUnformatted || ''
  let email = raw.email || ''
  let emailConfidence: 'confirmed' | 'guessed' | 'none' = email ? 'confirmed' : 'none'

  const socials: Record<string, string> = {
    instagram: raw.instagram || '', facebook: raw.facebook || '',
    linkedin: raw.linkedin || '', twitter: raw.twitter || '',
    youtube: raw.youtube || '', whatsapp: raw.whatsapp || ''
  }

  const merge = (data: Record<string, string>) => {
    Object.keys(data).forEach(k => {
      if (k === 'email') { if (!email && data.email) { email = data.email; emailConfidence = 'confirmed' } }
      else if (k === 'phone') { if (!phone && data.phone) phone = data.phone }
      else if (!socials[k] && data[k]) socials[k] = data[k]
    })
  }

  // Layer 1: Website (scrapeWebsite returns { socials, websiteLive, metaDescription, phone })
  let websiteLive = false; let metaDescription = ''; let layer1Found = false
  const validWebsite = isValidBusinessWebsite(website) ? website : ''
  if (validWebsite) {
    const webData = await scrapeWebsite(validWebsite)
    layer1Found = Object.values(webData.socials).some(v => v && v.length > 0)
    merge(webData.socials)
    if (!phone && webData.phone) phone = webData.phone
    websiteLive = webData.websiteLive
    metaDescription = webData.metaDescription
  }

  // Layer 2: SERP KG (always run)
  const name = raw.title || raw.name || ''
  const loc = raw.address || location
  const kgData = await serpKnowledgeGraph(name, loc)
  merge(kgData)

  // Layer 3: Targeted search if IG, FB, or LinkedIn missing
  if (!socials.instagram || !socials.facebook || !socials.linkedin) {
    const searchData = await targetedSocialSearch(name, loc, !socials.instagram, !socials.facebook, !socials.linkedin)
    merge(searchData)
  }

  // Layer 4: Handle guess if still no IG
  if (!socials.instagram) {
    const guessed = await guessHandle(name)
    merge(guessed)
  }

  // Layer 5: Aggregator if no website or website returned 0 socials
  if ((!website || !layer1Found) && (!socials.instagram || !socials.facebook)) {
    const aggData = await scrapeAggregator(name, loc)
    merge(aggData)
  }

  // Layer 6: Email guess
  if (!email && website) {
    try {
      const domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname
      email = `info@${domain}`
      emailConfidence = 'guessed'
    } catch { /* ignore */ }
  }

  const socialCount = countSocials(socials)
  const gaps: string[] = []
  if (!website || !websiteLive) gaps.push('no-website')
  if (!socials.instagram && !socials.facebook) gaps.push('no-social')
  if (!socials.youtube) gaps.push('no-video')
  if (!email) gaps.push('no-email')

  // Sort by social count first, then opportunity score
  const opportunityScore = socialCount * 10 + gaps.length * 5

  return {
    id: raw.placeId || raw.place_id || String(idx),
    businessName: name,
    industry: businessType,
    location: raw.address || raw.full_address || location,
    website, websiteLive, metaDescription,
    email, emailConfidence, phone,
    socials: socials as any,
    socialCount,
    detectedGaps: gaps,
    source: raw._source || 'scraped',
    opportunityScore,
    rating: raw.totalScore ?? raw.rating ?? null,
    reviewCount: raw.reviewsCount ?? raw.reviews ?? 0,
    googleMapsUrl: raw.url || raw.place_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (raw.address || location))}`,
    category: raw.category || raw.type || businessType,
    leadState: 'new',
    intelStatus: 'light_scan',
    sourceConfidence: 'scraped',
    sourceOrigin: raw._source || 'scraped',
  }
}

/* ── DISCOVERY: Apify ──────────────────────────────────── */
async function fetchViaApify(query: string, token: string, offset: number = 0): Promise<any[]> {
  console.log('[discover] Trying Apify for:', query)
  const startRes = await fetch('https://api.apify.com/v2/acts/apify~google-maps-scraper/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ 
      searchStringsArray: [query], 
      maxCrawledPlaces: offset + 40, 
      language: 'en', 
      maxImages: 0, 
      maxReviews: 0, 
      scrapeContacts: true,
      includeHistogram: false,
      includeOpeningHours: false
    }),
  })
  if (!startRes.ok) throw new Error(`Apify start failed (${startRes.status})`)
  const runId = (await startRes.json())?.data?.id
  if (!runId) throw new Error('Apify: no run ID')
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const st = await (await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, { headers: { Authorization: `Bearer ${token}` } })).json()
    const status = st?.data?.status
    if (status === 'SUCCEEDED') {
      const items = await (await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?limit=40&offset=${offset}`, { headers: { Authorization: `Bearer ${token}` } })).json()
      return (Array.isArray(items) ? items : []).map((p: any) => ({ ...p, _source: 'apify' }))
    }
    if (status === 'FAILED' || status === 'ABORTED') throw new Error(`Apify ${status}`)
  }
  throw new Error('Apify timed out')
}

/* ── DISCOVERY: SerpAPI Google Maps ────────────────────── */
async function fetchViaSerpApi(query: string, key: string, offset: number = 0): Promise<any[]> {
  console.log('[discover] Trying SerpAPI for:', query)
  const p = new URLSearchParams({ engine: 'google_maps', q: query, num: '40', start: String(offset), api_key: key })
  const r = await fetch(`https://serpapi.com/search.json?${p}`, { signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(`SerpAPI ${r.status}`)
  const d = await r.json()
  if (d.error) throw new Error(`SerpAPI: ${d.error}`)
  return (d.local_results || d.place_results || []).map((p: any) => ({
    placeId: p.place_id || p.data_id || '', title: p.title || p.name || '',
    address: p.address || '', phone: p.phone || '', website: p.website || '',
    email: '', totalScore: p.rating ?? null, reviewsCount: p.reviews ?? 0,
    url: p.place_link || p.link || '', category: p.type || '',
    instagram: '', facebook: '', linkedin: '', videos: [], _source: 'serpapi'
  }))
}

/* ── DISCOVERY: Google Places API ──────────────────────── */
async function fetchViaGooglePlaces(query: string, key: string, offset: number = 0): Promise<any[]> {
  console.log('[discover] Trying Google Places for:', query)
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.primaryType'
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
    signal: AbortSignal.timeout(10000)
  })
  if (!r.ok) throw new Error(`Google Places ${r.status}`)
  const d = await r.json()
  return (d.places || []).map((p: any) => ({
    placeId: p.id || '', title: p.displayName?.text || '',
    address: p.formattedAddress || '', phone: p.nationalPhoneNumber || '', website: p.websiteUri || '',
    email: '', totalScore: p.rating ?? null, reviewsCount: p.userRatingCount ?? 0,
    url: `https://www.google.com/maps/place/?q=place_id:${p.id}`,
    category: p.primaryType || '', instagram: '', facebook: '', linkedin: '', videos: [],
    _source: 'google_places'
  }))
}

/* ── ROUTE HANDLER ─────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { businessType, location, query: rawQuery, plan = 'free', seenIds = [], actedIds = [], offset = 0 } = body
  const query = rawQuery || (businessType ? `${businessType} in ${location || 'worldwide'}` : '')
  if (!query) return NextResponse.json({ error: 'query or businessType is required' }, { status: 400 })

  // Plan-based result limits
  const PLAN_LIMITS: Record<string, number> = { free: 15, pro: 30, agency: 40 }
  const maxResults = PLAN_LIMITS[plan] || 15

  const APIFY  = process.env.APIFY_API_TOKEN    || ''
  const SERP   = process.env.SERPAPI_KEY         || ''
  const PLACES = process.env.GOOGLE_PLACES_API_KEY || ''

  let rawResults: any[] = []
  const errors: string[] = []

  // Discovery fallback chain
  for (const [label, fn] of [
    ['Apify',          APIFY  ? () => fetchViaApify(query, APIFY, offset)   : null],
    ['SerpAPI',        SERP   ? () => fetchViaSerpApi(query, SERP, offset)   : null],
    ['Google Places',  PLACES ? () => fetchViaGooglePlaces(query, PLACES, offset) : null],
  ] as [string, (() => Promise<any[]>) | null][]) {
    if (!fn || rawResults.length > 0) continue
    try { rawResults = await fn() }
    catch (e: any) { console.error(`[discover] ${label} failed:`, e.message); errors.push(`${label}: ${e.message}`) }
  }

  if (rawResults.length === 0) {
    return NextResponse.json({ error: 'All discovery sources failed', details: errors }, { status: 502 })
  }

  // Pre-filter raw results BEFORE expensive enrichment
  const getRawId = (r: any, idx: number) => r.placeId || r.place_id || r.id || r.fsq_id || String(idx)
  
  // 1. Remove businesses the user has already saved or pitched (actedIds)
  const availableRaw = rawResults.filter((r, i) => !actedIds.includes(getRawId(r, i)))

  // 2. Separate into completely new businesses vs ones we've shown before
  const newRaw = availableRaw.filter((r, i) => !seenIds.includes(getRawId(r, i)))
  const oldRaw = availableRaw.filter((r, i) => seenIds.includes(getRawId(r, i)))

  // 3. Prioritize new ones, then backfill with old unpitched ones
  const selectedRaw = [...newRaw, ...oldRaw].slice(0, maxResults)

  console.log(`[discover] Fetched ${rawResults.length} raw. Filtering -> ${newRaw.length} new, ${oldRaw.length} old. Selected ${selectedRaw.length} to enrich.`)

  if (selectedRaw.length === 0) {
    return NextResponse.json({ error: 'No more leads found for this search. Try a different location or industry.' }, { status: 404 })
  }

  console.log('[discover] Checking cache and enriching', selectedRaw.length, 'results...')
  await dbConnect()

  let cacheHits = 0
  let apiCalls = 0

  const clients = await pMap(
    selectedRaw,
    async (raw, i) => {
      const placeId = getRawId(raw, i)
      const cached = await DiscoverCache.findOne({ placeId }).lean()
      
      if (cached) {
        cacheHits++
        const cachedObj = { ...cached, id: cached.placeId }
        delete cachedObj._id
        delete cachedObj.__v
        cachedObj.leadState ??= 'new'
        cachedObj.intelStatus ??= 'light_scan'
        cachedObj.sourceConfidence ??= 'scraped'
        cachedObj.sourceOrigin ??= cachedObj.source || 'scraped'
        return cachedObj as EnrichedClient
      }

      apiCalls++
      const enriched = await enrichPlace(raw, i, businessType || 'Business', location || '')
      
      try {
        await DiscoverCache.updateOne(
          { placeId: enriched.id },
          {
            $set: {
              ...enriched,
              placeId: enriched.id,
              leadState: enriched.leadState ?? 'new',
              intelStatus: enriched.intelStatus ?? 'light_scan',
              sourceConfidence: enriched.sourceConfidence ?? 'scraped',
              sourceOrigin: enriched.sourceOrigin ?? enriched.source ?? 'scraped',
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        )
      } catch (err) {
        console.error('[discover] Cache save failed:', err)
      }

      return enriched
    },
    5
  )

  // Sort by social count DESC, then opportunity score DESC
  clients.sort((a, b) => b.socialCount - a.socialCount || b.opportunityScore - a.opportunityScore)

  console.log('[discover] Done. Returning', clients.length, `enriched results (plan: ${plan}, cacheHits: ${cacheHits}, apiCalls: ${apiCalls}).`)
  return NextResponse.json({
    clients,
    total: clients.length,
    source: rawResults[0]?._source || 'scraped',
    metrics: { cacheHits, apiCalls, savedCredits: cacheHits * 7 },
    ...(errors.length ? { warnings: errors } : {}),
  })
}
