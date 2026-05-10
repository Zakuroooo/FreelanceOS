/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/db'
import Client from '@/lib/models/Client'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    await dbConnect()

    // Create the client document
    const client = await Client.create({
      userId: session.user.id,
      businessName: data.businessName,
      industry: data.industry,
      location: data.location,
      website: data.website,
      websiteLive: data.websiteLive,
      metaDescription: data.metaDescription,
      email: data.email,
      phone: data.phone,
      socials: data.socials,
      detectedGaps: data.detectedGaps || [],
      source: data.source || 'scraped',
      status: data.status || 'saved',
      opportunityScore: data.opportunityScore,
      rating: data.rating,
      reviewCount: data.reviewCount,
      googleMapsUrl: data.googleMapsUrl,
      category: data.category,
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
    const deleted = await Client.findOneAndDelete({ _id: id, userId: session.user.id })
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
    const clients = await Client.find({ userId: session.user.id }).sort({ createdAt: -1 })
    return NextResponse.json({ clients }, { status: 200 })
  } catch (error: any) {
    console.error('[clients/GET] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
