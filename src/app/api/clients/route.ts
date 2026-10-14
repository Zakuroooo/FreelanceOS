/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/db'
import Client, { type IClient } from '@/lib/models/Client'
import { pick, CLIENT_WRITABLE_FIELDS } from '@/lib/sanitize'
import { ensureSessionScope } from '@/lib/scope'

// String fields get hard caps so one request can't park a 10 MB string in Mongo.
const MAX_STRING_LENGTH = 2000
const SHORT_STRING_LENGTH = 300

function cleanString(value: unknown, max = SHORT_STRING_LENGTH): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try { body = await req.json() } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Whitelist first — userId, status and timestamps are server-owned, and `$`/`.` keys
    // are dropped by `pick()` so nothing can smuggle a Mongo operator through.
    const data = pick<IClient>(body, CLIENT_WRITABLE_FIELDS)

    if (!data.businessName || typeof data.businessName !== 'string' || !data.businessName.trim()) {
      return NextResponse.json({ error: 'businessName is required' }, { status: 400 })
    }

    // Socials arrive as an object; keep only known string fields, capped
    const rawSocials = (typeof body.socials === 'object' && body.socials !== null ? body.socials : {}) as Record<string, unknown>
    const socials = Object.fromEntries(
      ['linkedin', 'instagram', 'facebook', 'twitter', 'youtube', 'whatsapp']
        .map(k => [k, cleanString(rawSocials[k], 500)])
        .filter(([, v]) => v !== undefined)
    )

    // detectedGaps must be a flat array of short strings, whatever the caller sends
    const detectedGaps = Array.isArray(data.detectedGaps)
      ? data.detectedGaps.slice(0, 20).map(g => cleanString(g, 100)).filter((g): g is string => !!g)
      : []

    const clampNumber = (v: unknown, min: number, max: number): number | undefined =>
      typeof v === 'number' && Number.isFinite(v) ? Math.min(Math.max(v, min), max) : undefined

    await dbConnect()
    const scope = await ensureSessionScope(session.user.id)

    // Duplicate guard — the same business found in two different searches used to
    // stack two rows. Match on place id when present, else name + location.
    const businessName = data.businessName.trim().slice(0, SHORT_STRING_LENGTH)
    const location = cleanString(data.location)
    const dupeFilter = data.googleMapsUrl
      ? { orgId: scope.orgId, googleMapsUrl: data.googleMapsUrl }
      : { orgId: scope.orgId, businessName, ...(location ? { location } : {}) }
    const existing = await Client.findOne(dupeFilter).lean()
    if (existing) {
      return NextResponse.json({ success: true, duplicate: true, client: existing }, { status: 200 })
    }

    // Create the client document
    const client = await Client.create({
      userId: session.user.id,
      orgId: scope.orgId,
      businessName,
      industry: cleanString(data.industry),
      location: cleanString(data.location),
      website: cleanString(data.website, 500),
      websiteLive: typeof data.websiteLive === 'boolean' ? data.websiteLive : undefined,
      metaDescription: cleanString(data.metaDescription, MAX_STRING_LENGTH),
      email: cleanString(data.email, 320),
      emailConfidence: ['confirmed', 'guessed', 'none'].includes(data.emailConfidence as string)
        ? (data.emailConfidence as 'confirmed' | 'guessed' | 'none')
        : data.email ? 'confirmed' : 'none',
      phone: cleanString(data.phone, 40),
      socials,
      detectedGaps,
      source: data.source === 'manual' ? 'manual' : 'scraped',
      status: 'saved',
      opportunityScore: clampNumber(data.opportunityScore, 0, 100),
      rating: clampNumber(data.rating, 0, 5),
      reviewCount: clampNumber(data.reviewCount, 0, 1_000_000),
      googleMapsUrl: cleanString(data.googleMapsUrl, 500),
      category: cleanString(data.category),
    })

    return NextResponse.json({ success: true, client }, { status: 201 })
  } catch (error: any) {
    console.error('[clients/POST] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })

    await dbConnect()
    const scope = await ensureSessionScope(session.user.id)
    const deleted = await Client.findOneAndDelete({ _id: id, orgId: scope.orgId })
    if (!deleted) return NextResponse.json({ error: 'Client not found or not authorized' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[clients/DELETE] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const scope = await ensureSessionScope(session.user.id)
    // Team-shared: everyone in the workspace works the same lead pool.
    const docs = await Client.find({ orgId: scope.orgId })
      .sort({ createdAt: -1 })
      .lean()

    // The Outreach page and /api/outreach/batch consume `businessEmail` /
    // `businessPhone` / `businessInstagram` / `businessLinkedin`, while the schema
    // persists `email` / `phone` / `socials.*`. That mismatch used to make every
    // email campaign a silent no-op. Normalize here so every consumer gets the
    // contact fields under the names the outreach pipeline expects.
    const clients = docs.map((doc) => {
      const socials = (doc.socials ?? {}) as Record<string, string | undefined>
      return {
        ...doc,
        savedBy: doc.userId, // attribution for the team view
        businessEmail: doc.email,
        businessEmailConfidence: doc.emailConfidence ?? (doc.email ? 'confirmed' : 'none'),
        businessPhone: doc.phone ?? socials.whatsapp,
        businessInstagram: socials.instagram,
        businessLinkedin: socials.linkedin,
        businessLocation: doc.location,
      }
    })

    return NextResponse.json({ clients }, { status: 200 })
  } catch (error: any) {
    console.error('[clients/GET] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
