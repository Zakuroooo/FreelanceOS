/**
 * Pitch Memory — retrieval-augmented generation over your own outreach history.
 *
 * The idea: every pitch you send teaches the next one. When a new lead comes in,
 * retrieve your most relevant past pitches (same industry, shared gaps) weighted
 * by what HAPPENED next (won > replied > sent > draft), and inject them into the
 * prompt as few-shot examples with their outcomes. The model stops inventing an
 * angle and starts reusing the voice that already closed deals.
 *
 * Retrieval is deliberately score-based (industry/gap/channel overlap + recency)
 * rather than embedding-similarity: it needs no vector database, runs in the same
 * Mongo instance, and the signals that matter here are categorical anyway.
 */

import mongoose from 'mongoose'
import type { IDeal } from './models/Deal'

export interface MemoryQuery {
  industry?: string | null
  category?: string | null
  gaps?: string[]
  location?: string | null
}

export interface MemoryHit {
  businessName: string
  industry?: string
  subject: string
  bodyExcerpt: string
  /** won=3, replied=2.4, approved=1, sent=0.6, draft=0 */
  outcomeWeight: number
  outcomeLabel: string
  relevance: number
}

const OUTCOME_WEIGHTS: Record<string, { weight: number; label: string }> = {
  won:      { weight: 3,   label: 'CLOSED THIS DEAL' },
  replied:  { weight: 2.4, label: 'GOT A REPLY' },
  approved: { weight: 1,   label: 'was approved' },
  sent:     { weight: 0.6, label: 'was sent' },
  draft:    { weight: 0,   label: '' },
}

/** Pure scoring — unit-tested. Industry match dominates, then shared gaps, then outcome. */
export function scoreMemory(params: {
  sameIndustry: boolean
  sharedGapCount: number
  outcomeWeight: number
}): number {
  let score = params.outcomeWeight
  if (params.sameIndustry) score += 2
  score += Math.min(params.sharedGapCount, 3) * 0.5 // cap so gap spam can't dominate
  return score
}

export async function findSimilarPitches(
  userId: string,
  query: MemoryQuery,
  limit = 2,
): Promise<MemoryHit[]> {
  const { default: Pitch } = await import('./models/Pitch')
  const { default: Deal } = await import('./models/Deal')

  // Outcomes live on Deal (stage), text lives on Pitch. Join via pitchId.
  const [deals, recentPitches] = await Promise.all([
    Deal.find({ userId }).select('pitchId stage businessName').lean(),
    Pitch.find({ userId })
      .sort({ createdAt: -1 })
      .limit(150)
      .select('businessName businessLocation emailSubject emailBody overallStatus createdAt')
      .lean(),
  ])

  const outcomeByPitch = new Map<string, { weight: number; label: string }>()
  for (const deal of deals as Array<Pick<IDeal, 'pitchId' | 'stage'>> & Array<{ _id?: unknown }>) {
    const key = deal.pitchId?.toString()
    if (!key) continue
    const known = OUTCOME_WEIGHTS[deal.stage]
    if (!known) continue
    const existing = outcomeByPitch.get(key)
    if (!existing || known.weight > existing.weight) {
      outcomeByPitch.set(key, known)
    }
  }

  const qIndustry = (query.industry ?? query.category ?? '').toLowerCase().trim()
  const qGaps = new Set((query.gaps ?? []).map(g => g.toLowerCase()))

  // Drafts never carry an outcome, so they can't teach anything — filter early.
  const candidateIds = recentPitches
    .filter(p => outcomeByPitch.has((p as unknown as { _id: mongoose.Types.ObjectId })._id.toString()))
    .map(p => (p as unknown as { _id: mongoose.Types.ObjectId })._id)

  if (candidateIds.length === 0) return []

  const full = await Pitch.find({ _id: { $in: candidateIds } })
    .select('businessName industry detectedGaps emailSubject emailBody overallStatus createdAt')
    .lean()

  const hits: MemoryHit[] = []
  for (const p of full) {
    const doc = p as unknown as {
      _id: mongoose.Types.ObjectId
      businessName: string
      industry?: string
      detectedGaps?: string[]
      emailSubject?: string
      emailBody?: string
    }
    const outcome = outcomeByPitch.get(doc._id.toString()) ?? OUTCOME_WEIGHTS.draft
    const pIndustry = (doc.industry ?? '').toLowerCase()
    const sameIndustry = qIndustry.length > 0 && pIndustry.includes(qIndustry.split(' ')[0])
    const sharedGaps = (doc.detectedGaps ?? []).filter(g => qGaps.has(g.toLowerCase())).length

    const relevance = scoreMemory({
      sameIndustry,
      sharedGapCount: sharedGaps,
      outcomeWeight: outcome.weight,
    })

    hits.push({
      businessName: doc.businessName,
      industry: doc.industry,
      subject: doc.emailSubject ?? '',
      bodyExcerpt: (doc.emailBody ?? '').slice(0, 600),
      outcomeWeight: outcome.weight,
      outcomeLabel: outcome.label,
      relevance,
    })
  }

  return hits
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
}

/** Renders retrieved memory into a prompt block. No hits → empty string. */
export function formatMemoryBlock(hits: MemoryHit[]): string {
  if (hits.length === 0) return ''
  const blocks = hits.map((h, i) =>
    [
      `Example ${i + 1} — ${h.businessName}${h.industry ? ` (${h.industry})` : ''}: this pitch ${h.outcomeLabel}.`,
      `Subject was: "${h.subject}"`,
      `Body opened: "${h.bodyExcerpt}..."`,
    ].join('\n')
  )
  return [
    'YOUR PAST PITCHES THAT WORKED (match their voice and specificity — do not copy):',
    ...blocks,
  ].join('\n\n')
}
