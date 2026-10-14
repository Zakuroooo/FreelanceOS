import { NextResponse } from 'next/server'
import { SERVICE_CATALOG } from '@/lib/services'

/** Public catalog for the pitch chat's service picker. No secrets, no auth needed. */
export async function GET() {
  return NextResponse.json({
    services: SERVICE_CATALOG.map(s => ({ id: s.id, label: s.label })),
  })
}
