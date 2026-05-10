import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ─── helpers ──────────────────────────────────────── */
function extractSocial(socialMedia: any[], platform: string): string {
  if (!Array.isArray(socialMedia)) return ''
  const found = socialMedia.find((s: any) =>
    s?.url?.toLowerCase().includes(platform) || s?.type?.toLowerCase() === platform
  )
  return found?.url || found?.handle || ''
}

function calcScore(gaps: string[]): number {
  const base =
    gaps.length >= 3 ? 85 + Math.floor(Math.random() * 15)
    : gaps.length === 2 ? 60 + Math.floor(Math.random() * 24)
    : gaps.length === 1 ? 30 + Math.floor(Math.random() * 29)
    : 10
  return base
}

/* ─── mock fallback data ───────────────────────────── */
function buildMocks(businessType: string, location: string) {
  const names = [
    'Bright Smile Dental',  'City Health Clinic',    'Metro Fitness Studio',
    'Sunrise Bakery',       'Elite Law Group',        'Pixel Creative Agency',
    'Green Thumb Nursery',  'Harbour View Restaurant','Peak Performance Gym',
    'Urban Cuts Barbershop','Golden Gate Realty',     'Cloud Nine Spa',
    'Downtown Auto Repair', 'The Corner Bookshop',    'Fresh Press Juice Bar',
    'Apex Accounting',      'Blue Ridge Photography', 'Velocity Tech Repair',
    'The Wine Cellar',      'Silver Spoon Catering',
  ]

  return names.map((name, i) => {
    const hasWebsite   = Math.random() > 0.45
    const hasSocial    = Math.random() > 0.5
    const hasVideo     = Math.random() > 0.6
    const gaps: string[] = []
    if (!hasWebsite) gaps.push('no-website')
    if (!hasSocial)  gaps.push('no-social')
    if (!hasVideo)   gaps.push('no-video')

    return {
      id:              String(i),
      businessName:    name,
      industry:        businessType,
      location:        `${location}, ${['CA', 'NY', 'TX', 'FL', 'WA'][i % 5]}`,
      website:         hasWebsite ? `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com` : '',
      email:           Math.random() > 0.4 ? `info@${name.toLowerCase().replace(/\s+/g, '')}.com` : '',
      phone:           Math.random() > 0.3 ? `+1 (${300 + i}) 555-${1000 + i}` : '',
      socials: {
        instagram: hasSocial ? `https://instagram.com/${name.toLowerCase().replace(/\s+/g, '_')}` : '',
        linkedin:  Math.random() > 0.6 ? `https://linkedin.com/company/${name.toLowerCase().replace(/\s+/g, '-')}` : '',
        facebook:  hasSocial ? `https://facebook.com/${name.toLowerCase().replace(/\s+/g, '')}` : '',
      },
      detectedGaps:    gaps,
      source:          'mock',
      opportunityScore: calcScore(gaps),
      rating:          parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount:     Math.floor(Math.random() * 300),
      googleMapsUrl:   '',
      category:        businessType,
    }
  }).sort((a, b) => b.opportunityScore - a.opportunityScore)
}

/* ─── route ────────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessType, location } = await req.json()
  if (!businessType) return NextResponse.json({ error: 'businessType is required' }, { status: 400 })

  const APIFY_TOKEN = process.env.APIFY_API_TOKEN

  /* ─── mock path ─────────────────────────────────── */
  if (!APIFY_TOKEN) {
    const mocks = buildMocks(businessType, location || 'United States')
    return NextResponse.json({ clients: mocks, total: mocks.length, source: 'mock' })
  }

  /* ─── real Apify path ───────────────────────────── */
  try {
    console.log(`[discover] Starting Apify run: "${businessType} in ${location}"`)

    const runRes = await fetch(
      'https://api.apify.com/v2/acts/compass~crawler-google-places/runs',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${APIFY_TOKEN}` },
        body: JSON.stringify({
          searchStringsArray:    [`${businessType} in ${location}`],
          maxCrawledPlaces:      40,
          language:              'en',
          maxImages:             0,
          maxReviews:            0,
          scrapeContacts:        true,
          includeHistogram:      false,
          includeOpeningHours:   false,
        }),
      }
    )
    if (!runRes.ok) {
      const errBody = await runRes.text()
      console.error('[discover] Apify start failed:', runRes.status, errBody)
      throw new Error(`Apify start failed: ${runRes.status} — ${errBody}`)
    }
    const runData = await runRes.json()
    const runId   = runData?.data?.id
    console.log('[discover] Run started, runId:', runId)

    /* poll — 60 attempts × 2 s = 120 s max */
    let rawResults: any[] = []
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise(r => setTimeout(r, 2000))
      const statusRes  = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        { headers: { Authorization: `Bearer ${APIFY_TOKEN}` } }
      )
      const statusData = await statusRes.json()
      const runStatus  = statusData?.data?.status as string

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

    /* map */
    const clients = rawResults.map((place: any, i: number) => {
      const website   = place.website || ''
      const phone     = place.phone || place.phoneUnformatted || ''
      const email     = place.email || ''
      const instagram = place.instagram || extractSocial(place.socialMedia, 'instagram')
      const linkedin  = place.linkedin  || extractSocial(place.socialMedia, 'linkedin')
      const facebook  = place.facebook  || extractSocial(place.socialMedia, 'facebook')

      const gaps: string[] = []
      if (!website)               gaps.push('no-website')
      if (!instagram && !facebook) gaps.push('no-social')
      if (!place.videos?.length)  gaps.push('no-video')

      return {
        id:              place.placeId || String(i),
        businessName:    place.title || '',
        industry:        businessType,
        location:        place.address || place.city || location,
        website,
        email,
        phone,
        socials:         { instagram, linkedin, facebook },
        detectedGaps:    gaps,
        source:          'scraped',
        opportunityScore: calcScore(gaps),
        rating:          place.totalScore  ?? null,
        reviewCount:     place.reviewsCount ?? 0,
        googleMapsUrl:   place.url || '',
        category:        place.category || businessType,
      }
    })

    clients.sort((a, b) => b.opportunityScore - a.opportunityScore)
    return NextResponse.json({ clients, total: clients.length, source: 'scraped' })

  } catch (err) {
    console.error('[discover] Apify error:', err)
    /* graceful fallback to mocks on error */
    const mocks = buildMocks(businessType, location || 'United States')
    return NextResponse.json({ clients: mocks, total: mocks.length, source: 'mock-fallback' })
  }
}
