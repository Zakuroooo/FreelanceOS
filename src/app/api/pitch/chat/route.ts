/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/auth'
import Groq from 'groq-sdk'
import { GROQ_MODEL, GROQ_MODEL_FALLBACKS, isModelUnavailableError } from '@/lib/groq'
import { researchWebsite, formatSiteResearch } from '@/lib/research'
import { deriveSiteFlaws, formatSiteFlaws, type SiteFlaw } from '@/lib/audit'
import { getService, type ServiceDef } from '@/lib/services'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'
import Client from '@/lib/models/Client'
import { ensureSessionScope } from '@/lib/scope'

/**
 * Chat-driven pitch generation — a two-phase conversation:
 *
 *   phase "audit" → the agent visits the lead's LIVE website, derives ground-truth
 *                   flaws through the lens of the service the freelancer picked,
 *                   and reports them back as a chat message.
 *   phase "write" → the agent turns those verified flaws into a pitch that names
 *                   them specifically ("your homepage still says Coming Soon…")
 *                   and offers the chosen service as the fix.
 *
 * The flaws are derived deterministically from fetched HTML, not hallucinated —
 * every claim in the pitch is something the lead can verify about themselves.
 */

const NL = String.fromCharCode(10)

async function runAgent(
    apiKey: string | undefined,
    messages: { role: 'system' | 'user'; content: string }[],
    fallbackKey: string | undefined,
    maxTokens = 1500,
    temperature = 0.6,
) {
    async function call(key: string) {
        const groq = new Groq({ apiKey: key })
        const models = [GROQ_MODEL, ...GROQ_MODEL_FALLBACKS.filter(m => m !== GROQ_MODEL)]
        let lastErr: unknown
        for (const model of models) {
            try {
                const res = await groq.chat.completions.create({
                    messages,
                    model,
                    temperature,
                    max_tokens: maxTokens,
                })
                return res.choices[0]?.message?.content || ''
            } catch (err) {
                lastErr = err
                if (!isModelUnavailableError(err)) throw err
                console.warn(`[pitch/chat] model "${model}" unavailable, falling back...`, (err as any)?.message)
            }
        }
        throw lastErr instanceof Error ? lastErr : new Error('All Groq models failed')
    }

    try {
        if (!apiKey) throw new Error('Primary API key missing')
        return await call(apiKey)
    } catch (err) {
        console.warn('[pitch/chat] Primary key failed, trying fallback...', (err as any)?.message)
        if (!fallbackKey) throw err
        return await call(fallbackKey)
    }
}

function buildBrief(c: any): string {
    const lines = [
        `BUSINESS NAME: ${c.businessName}`,
        `INDUSTRY / CATEGORY: ${c.industry || c.category || 'Unknown'}`,
        `LOCATION: ${c.location || 'Unknown'}`,
        `WEBSITE: ${c.website || 'No website found'}`,
        `GOOGLE RATING: ${c.rating ? `${c.rating}/5 (${c.reviewCount || 0} reviews)` : 'No Google reviews found'}`,
    ]
    const socials = c.socials || {}
    const socialList = ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'whatsapp']
        .filter(k => socials[k])
        .map(k => `${k}: ${socials[k]}`)
    lines.push(`SOCIAL PRESENCE: ${socialList.length > 0 ? socialList.join(', ') : 'NONE detected'}`)
    if (Array.isArray(c.detectedGaps) && c.detectedGaps.length > 0) {
        lines.push(`DISCOVERY GAPS: ${c.detectedGaps.join(', ')}`)
    }
    return lines.join(NL)
}

/** Validates that findings sent back from the client are well-formed SiteFlaw objects. */
function sanitizeFindings(raw: unknown): SiteFlaw[] {
    if (!Array.isArray(raw)) return []
    return raw
        .filter((f): f is Record<string, unknown> => !!f && typeof f === 'object')
        .slice(0, 12)
        .map(f => ({
            id: typeof f.id === 'string' ? f.id.slice(0, 64) : 'unknown',
            severity: (['critical', 'high', 'medium', 'low'] as const).includes(f.severity as any)
                ? (f.severity as SiteFlaw['severity'])
                : 'medium',
            title: typeof f.title === 'string' ? f.title.slice(0, 200) : 'Issue found',
            detail: typeof f.detail === 'string' ? f.detail.slice(0, 500) : '',
            ...(typeof f.evidence === 'string' ? { evidence: f.evidence.slice(0, 300) } : {}),
        }))
}

function splitSubject(text: string): { subject?: string; body: string } {
    if (!/^Subject:/i.test(text)) return { body: text.trim() }
    const newline = text.indexOf(NL)
    if (newline === -1) return { body: text.trim() }
    const subject = text.slice('Subject:'.length, newline).trim()
    const body = text.slice(newline + 1).trim()
    if (!body) return { body: text.trim() }
    return { subject: subject || undefined, body }
}

async function resolveClientId(raw: unknown, userId: string) {
    if (typeof raw !== 'string' || !mongoose.isValidObjectId(raw)) return undefined
    const owned = await Client.exists({ _id: raw, userId })
    return owned ? new mongoose.Types.ObjectId(raw) : undefined
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: any
        try {
            body = await req.json()
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const { clientData, phase } = body
        if (!clientData?.businessName) {
            return NextResponse.json({ error: 'clientData is required' }, { status: 400 })
        }

        const service: ServiceDef | undefined = getService(body.serviceId)
        if (!service) {
            return NextResponse.json({ error: 'A valid serviceId is required' }, { status: 400 })
        }

        const senderName = session.user.name || 'Your Name'
        const brief = buildBrief(clientData)

        /* ─────────────────────────────────────────────
         * PHASE 1 — AUDIT (ground truth)
         * Visit the site NOW, derive real flaws through
         * the chosen service's lens, report to the chat.
         * ───────────────────────────────────────────── */
        let researchBlock = ''
        let flaws: SiteFlaw[] = []
        if (phase === 'audit') {
            if (clientData.website && typeof clientData.website === 'string') {
                const site = await researchWebsite(clientData.website)
                researchBlock = formatSiteResearch(site)
                flaws = deriveSiteFlaws(site)
            } else {
                flaws = [
                    {
                        id: 'no-website',
                        severity: 'critical',
                        title: 'No website at all',
                        detail:
                            'The business has no website we could find — every search for their category sends customers to competitors instead.',
                    },
                ]
            }

            // The analyst speaks as the chat copilot: walks through what it actually saw.
            const flawLines = flaws.map(f => `- [${f.severity}] ${f.title}: ${f.detail}`).join(NL) || '- none found'
            const reply = await runAgent(
                process.env.GROQ_API_KEY_1,
                [
                    {
                        role: 'system',
                        content: [
                            `You are Pitch Copilot, an outreach strategist chatting with a freelancer who is about to pitch a local business.`,
                            `You just performed a LIVE audit of the business's website. You are talking TO THE FREELANCER (not the business), so be candid and tactical.`,
                            `The freelancer has chosen to sell: "${service.label}".`,
                            ``,
                            `Rules:`,
                            `- Reference ONLY what appears in the audit data below — never invent flaws.`,
                            `- Speak naturally, like a sharp colleague. No corporate jargon.`,
                            `- Structure: one short opening line about what you checked, then the concrete problems you found (cite the actual evidence — titles, missing meta, HTTP, placeholder text), then one line on how this maps to the ${service.label} angle.`,
                            `- Keep it under 180 words.`,
                        ].join(NL),
                    },
                    {
                        role: 'user',
                        content: [
                            `LEAD DATA:`,
                            brief,
                            ``,
                            researchBlock,
                            ``,
                            `VERIFIED FLAWS:`,
                            flawLines,
                            ``,
                            `Report your audit findings to the freelancer.`,
                        ].join(NL),
                    },
                ],
                process.env.GROQ_API_KEY_FALLBACK,
                800,
                0.5,
            )

            return NextResponse.json({
                reply: reply.trim(),
                findings: flaws,
                audited: researchBlock.length > 0 || flaws.length > 0,
            })
        }

        /* ─────────────────────────────────────────────
         * PHASE 2 — WRITE (flaw-specific pitch)
         * Turn the verified flaws into an email that
         * names them and offers the chosen service.
         * ───────────────────────────────────────────── */
        flaws = sanitizeFindings(body.findings)
        if (flaws.length === 0) {
            return NextResponse.json(
                { error: 'Run the audit phase first — no findings to write from' },
                { status: 400 },
            )
        }

        const flawBlock = formatSiteFlaws(flaws)

        const draft = await runAgent(
            process.env.GROQ_API_KEY_2,
            [
                {
                    role: 'system',
                    content: [
                        `You are an elite cold email copywriter. You are writing for a freelancer whose service is: "${service.label}" (${service.offer}).`,
                        ``,
                        `Your rules:`,
                        `- The email MUST cite at least two of the VERIFIED FLAWS by name, phrased as helpful observations ("your homepage still says Coming Soon"), never as a cold list of accusations.`,
                        `- Every flaw mentioned must come from the GROUND-TRUTH AUDIT block — do not invent problems.`,
                        `- Frame each flaw around what it COSTS the business (lost trust, lost rankings, lost bookings).`,
                        `- Present the freelancer's service as the natural fix, using this capability framing: ${service.offer}.`,
                        `- NEVER use: "unlock", "elevate", "leverage", "synergy", "amplify", "I hope this email finds you", "I wanted to reach out", "I noticed that".`,
                        `- One believable metric or outcome tied to fixing the flaws (no made-up round numbers like 300%).`,
                        `- CTA: a simple question.`,
                        `- Tone: friendly expert, like a smart friend giving advice.`,
                        `- Length: 150-220 words.`,
                    ].join(NL),
                },
                {
                    role: 'user',
                    content: [
                        `Write the cold email.`,
                        ``,
                        `CLIENT DATA:`,
                        brief,
                        ``,
                        flawBlock,
                        ``,
                        `SENDER NAME: ${senderName}`,
                        ``,
                        `Format: Start with "Subject: " on line 1, then the email body. Sign off with "${senderName}". Nothing before "Subject:" or after the sign-off.`,
                    ].join(NL),
                },
            ],
            process.env.GROQ_API_KEY_FALLBACK,
            1600,
            0.7,
        )

        // A quick polish pass keeps quality parity with the non-chat pipeline.
        const finalPitch = await runAgent(
            process.env.GROQ_API_KEY_4,
            [
                {
                    role: 'system',
                    content: [
                        `You are the final-stage email closer. Take the draft and produce the best version. Non-negotiables:`,
                        `- Keeps at least two specific verified flaws cited concretely.`,
                        `- Sounds human; zero AI tells or banned phrases ("unlock", "elevate", "leverage", "synergy", "amplify").`,
                        `- Subject line specific to THIS business.`,
                        `- Body 150-220 words. Sign off EXACTLY: ${senderName}`,
                        `- Output ONLY the email: "Subject: " on line 1, then the body.`,
                    ].join(NL),
                },
                {
                    role: 'user',
                    content: [
                        `DRAFT:`,
                        draft,
                        ``,
                        `VERIFIED FLAWS:`,
                        flawBlock,
                        ``,
                        `CLIENT DATA:`,
                        brief,
                        ``,
                        `Output only the final email.`,
                    ].join(NL),
                },
            ],
            process.env.GROQ_API_KEY_FALLBACK,
            1600,
            0.65,
        )

        // Clean output — same hygiene as /api/pitch.
        let cleaned = finalPitch.trim()
        const subjectIdx = cleaned.indexOf('Subject:')
        if (subjectIdx > 0) cleaned = cleaned.substring(subjectIdx)
        for (const pattern of [senderName, 'Best regards', 'Best,', 'Cheers,', 'Warm regards', 'Thanks,']) {
            const lastIdx = cleaned.lastIndexOf(pattern)
            if (lastIdx > 0) {
                const after = cleaned.substring(lastIdx + pattern.length).trim()
                if (after.length > 30 && !after.startsWith('P.S.')) {
                    cleaned = cleaned.substring(0, lastIdx + pattern.length)
                }
                break
            }
        }

        const finalText = cleaned.trim()

        /* ── Persist (same contract as /api/pitch) ── */
        const { subject, body: emailBody } = splitSubject(finalText)
        let pitchId: string | null = null

        try {
            await connectDB()
            const userId = session.user.id
            const clientId = await resolveClientId(clientData._id ?? clientData.clientId, userId)

            const scope = await ensureSessionScope(userId)
            const snapshot: Record<string, unknown> = {
                businessName: String(clientData.businessName),
                orgId: new mongoose.Types.ObjectId(scope.orgId),
                emailBody,
                ...(clientId ? { clientId } : {}),
                ...(subject ? { emailSubject: subject } : {}),
                ...(clientData.email ? { businessEmail: String(clientData.email) } : {}),
                ...(clientData.phone ? { businessPhone: String(clientData.phone) } : {}),
                ...(clientData.location ? { businessLocation: String(clientData.location) } : {}),
                ...(clientData.socials?.instagram ? { businessInstagram: String(clientData.socials.instagram) } : {}),
                ...(clientData.socials?.linkedin ? { businessLinkedin: String(clientData.socials.linkedin) } : {}),
                ...(clientData.socials?.whatsapp ? { businessWhatsapp: String(clientData.socials.whatsapp) } : {}),
            }

            const existing = await Pitch.findOne({
                userId,
                overallStatus: 'draft',
                ...(clientId ? { clientId } : { businessName: String(snapshot.businessName) }),
            }).sort({ createdAt: -1 })

            if (existing) {
                existing.set(snapshot)
                await existing.save()
                pitchId = String(existing._id)
            } else {
                const created = await Pitch.create({ ...snapshot, userId, overallStatus: 'draft', sentChannels: {} })
                pitchId = String(created._id)
            }
        } catch (err) {
            console.error('[pitch/chat] failed to save pitch:', err)
        }

        return NextResponse.json({
            pitch: finalText,
            pitchId,
            saved: pitchId !== null,
            service: service.id,
            flawsCited: flaws.length,
        })
    } catch (error: any) {
        console.error('[pitch/chat] error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}