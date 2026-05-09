import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessType, location } = await req.json()

  if (!businessType || !location) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const APIFY_TOKEN = process.env.APIFY_API_TOKEN

  if (!APIFY_TOKEN) {
    // Graceful fallback — return empty so UI shows error state
    return NextResponse.json({ error: 'Apify not configured', clients: [], total: 0 }, { status: 500 })
  }

  try {
    // 1. Start Apify Google Maps Scraper
    const runRes = await fetch(
      'https://api.apify.com/v2/acts/compass~crawler-google-places/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${APIFY_TOKEN}`,
        },
        body: JSON.stringify({
          searchStringsArray: [`${businessType} in ${location}`],
          maxCrawledPlaces: 20,
          language: 'en',
          maxImages: 0,
          maxReviews: 0,
        }),
      }
    )

    if (!runRes.ok) throw new Error(`Apify start failed: ${runRes.status}`)

    const runData = await runRes.json()
    const runId: string = runData.data.id

    // 2. Poll for completion — max 30 attempts × 2s = 60s
    let attempts = 0
    let rawResults: any[] = []

    while (attempts < 30) {
      await new Promise(r => setTimeout(r, 2000))

      const statusRes  = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        { headers: { Authorization: `Bearer ${APIFY_TOKEN}` } }
      )
      const statusData = await statusRes.json()
      const status     = statusData.data?.status as string

      if (status === 'SUCCEEDED') {
        const datasetRes = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?limit=20`,
          { headers: { Authorization: `Bearer ${APIFY_TOKEN}` } }
        )
        rawResults = await datasetRes.json()
        break
      }

      if (status === 'FAILED' || status === 'ABORTED') {
        throw new Error(`Apify actor ${status}`)
      }

      attempts++
    }

    // 3. Map to Client shape
    const clients = rawResults.map((place: any) => ({
      id:            place.placeId || String(Math.random()),
      businessName:  place.title   || 'Unknown Business',
      industry:      businessType,
      location:      place.address || location,
      website:       place.website || '',
      email:         place.email   || '',
      phone:         place.phone   || '',
      socials:       { linkedin: '', instagram: '' },
      detectedGaps: [
        ...(!place.website ? ['no-website'] : []),
        ...(!place.email   ? ['no-social']  : []),
      ],
      source:      'scraped',
      rating:      place.totalScore  ?? null,
      reviewCount: place.reviewsCount ?? null,
    }))

    return NextResponse.json({ clients, total: clients.length })

  } catch (err) {
    console.error('[discover] Apify error:', err)
    return NextResponse.json(
      { error: 'Search failed. Try again.', clients: [], total: 0 },
      { status: 500 }
    )
  }
}
