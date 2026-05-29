/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'

/* ── Helper: Run a prompt with automatic fallback ── */
async function runAgent(
  apiKey: string | undefined,
  messages: { role: 'system' | 'user'; content: string }[],
  fallbackKey: string | undefined,
  maxTokens = 800,
  temperature = 0.7,
) {
  async function call(key: string) {
    const groq = new Groq({ apiKey: key })
    const res = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature,
      max_tokens: maxTokens,
    })
    return res.choices[0]?.message?.content || ''
  }

  try {
    if (!apiKey) throw new Error('Primary API key missing')
    return await call(apiKey)
  } catch (err) {
    console.warn('[pitch] Primary key failed, trying fallback...', (err as any)?.message)
    if (!fallbackKey) throw err
    return await call(fallbackKey)
  }
}

/* ── Build a rich context block from the client data ── */
function buildClientBrief(c: any): string {
  const lines: string[] = []
  lines.push(`BUSINESS NAME: ${c.businessName}`)
  lines.push(`INDUSTRY / CATEGORY: ${c.industry || c.category || 'Unknown'}`)
  lines.push(`LOCATION: ${c.location || 'Unknown'}`)
  lines.push(`WEBSITE: ${c.website || 'No website found'}`)
  lines.push(`WEBSITE LIVE: ${c.websiteLive === false ? 'NO — website is DOWN or broken' : c.websiteLive ? 'Yes' : 'Unknown'}`)
  lines.push(`DESCRIPTION: ${c.metaDescription || 'No description available — business has poor SEO'}`)
  lines.push(`GOOGLE RATING: ${c.rating ? `${c.rating}/5 (${c.reviewCount || 0} reviews)` : 'No Google reviews found'}`)
  lines.push(`OPPORTUNITY SCORE: ${c.opportunityScore ?? 'N/A'}/100`)

  // Socials
  const socials = c.socials || {}
  const socialList: string[] = []
  if (socials.instagram) socialList.push(`Instagram: ${socials.instagram}`)
  if (socials.facebook) socialList.push(`Facebook: ${socials.facebook}`)
  if (socials.linkedin) socialList.push(`LinkedIn: ${socials.linkedin}`)
  if (socials.twitter) socialList.push(`Twitter/X: ${socials.twitter}`)
  if (socials.youtube) socialList.push(`YouTube: ${socials.youtube}`)
  if (socials.whatsapp) socialList.push(`WhatsApp: ${socials.whatsapp}`)
  lines.push(`SOCIAL MEDIA PRESENCE: ${socialList.length > 0 ? socialList.join(', ') : 'NONE — no social media accounts detected'}`)

  // Detected Gaps
  const gaps = c.detectedGaps && c.detectedGaps.length > 0 ? c.detectedGaps : []
  if (gaps.length > 0) {
    lines.push(`CRITICAL DIGITAL GAPS DETECTED:`)
    gaps.forEach((g: string, i: number) => lines.push(`  ${i + 1}. ${g}`))
  } else {
    lines.push(`CRITICAL DIGITAL GAPS: None explicitly detected — look for subtle issues from the data above`)
  }

  // Contact
  if (c.email) lines.push(`EMAIL: ${c.email}`)
  if (c.phone) lines.push(`PHONE: ${c.phone}`)

  return lines.join('\n')
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientData } = await req.json()
    if (!clientData?.businessName) {
      return NextResponse.json({ error: 'clientData is required' }, { status: 400 })
    }

    const senderName = session.user.name || 'Your Name'
    const brief = buildClientBrief(clientData)

    const key1 = process.env.GROQ_API_KEY_1
    const key2 = process.env.GROQ_API_KEY_2
    const key3 = process.env.GROQ_API_KEY_3
    const key4 = process.env.GROQ_API_KEY_4
    const fallback = process.env.GROQ_API_KEY_FALLBACK

    // ─────────────────────────────────────────────────────
    // AGENT 1 — THE RESEARCHER
    // Writes a detailed analysis of what this business
    // needs and what angles would work best for outreach.
    // ─────────────────────────────────────────────────────
    const research = await runAgent(key1, [
      {
        role: 'system',
        content: `You are a senior digital marketing strategist who analyzes businesses before outreach. You have been given raw data about a potential client. Your job is to write a detailed research brief that a sales copywriter will use to write the perfect cold email. Be specific — use actual data points, not generic observations.`,
      },
      {
        role: 'user',
        content: `Here is the raw data on the lead:\n\n${brief}\n\nWrite a research brief covering:\n1. HOOK: What specific detail about their business can we open with to show we actually looked at them? (Use their description, rating, location, or a specific social platform they use.)\n2. PAIN POINTS: Based on the detected gaps, what specific problems are they likely experiencing? (e.g., "No Instagram means they're invisible to the 18-34 demographic in ${clientData.location || 'their area'}" or "Website is down, they're losing walk-in customers who Google them first")\n3. VALUE PROPOSITION: What exact services would solve their top 2-3 gaps? Be specific (e.g., "Google Business Profile optimization to improve their ${clientData.rating || 'low'}-star visibility").\n4. SOCIAL PROOF ANGLE: What kind of result or metric should we reference? (e.g., "We helped a similar ${clientData.industry || 'local'} business increase foot traffic by X%")\n5. CTA STRATEGY: What is the lowest-friction ask for this specific type of business?\n\nBe concise but specific. No fluff.`,
      },
    ], fallback, 600, 0.5)

    // ─────────────────────────────────────────────────────
    // AGENT 2 — THE COPYWRITER
    // Uses the research brief to draft the actual email.
    // ─────────────────────────────────────────────────────
    const draft = await runAgent(key2, [
      {
        role: 'system',
        content: `You are an elite cold email copywriter who has written outreach for top agencies like Ogilvy and Wieden+Kennedy. You write emails that business owners actually reply to — not emails that get deleted.

Your rules:
- NEVER sound like a template. Every line must feel like it was written specifically for this one business.
- NEVER use corporate jargon ("synergy", "leverage", "unlock potential", "elevate", "amplify").
- NEVER use filler phrases ("I hope this finds you well", "I wanted to reach out", "As a digital marketing expert").
- Open with a SPECIFIC observation about THEIR business that proves you did research.
- Mention their EXACT gaps naturally — not as a list, but woven into the narrative.
- Include one specific, believable metric or result (not made-up round numbers like "increase by 300%").
- CTA must be dead simple — a question, not a demand.
- Tone: Friendly, direct, confident — like a smart friend giving advice, not a salesperson pushing.
- Length: 150-200 words. NOT shorter. Long enough to be substantive, short enough to be readable.`,
      },
      {
        role: 'user',
        content: `Write a cold email pitch for this business.

RESEARCH BRIEF:\n${research}\n\nCLIENT DATA:\n${brief}\n\nSENDER NAME: ${senderName}\n\nFormat: Start with "Subject: " on line 1, then the email body. Sign off with "${senderName}". Do NOT use brackets like [Your Name]. Do NOT add any text before "Subject:" or after the sign-off.`,
      },
    ], fallback, 800, 0.7)

    // ─────────────────────────────────────────────────────
    // AGENT 3 — THE CRITIC
    // Tears apart the draft and lists specific fixes.
    // ─────────────────────────────────────────────────────
    const critique = await runAgent(key3, [
      {
        role: 'system',
        content: `You are a brutal cold email critic. You have reviewed over 10,000 cold emails. You know exactly what makes business owners delete an email vs. reply to it. Your job is to find every weakness in this draft and provide SPECIFIC, actionable fixes. Do NOT rewrite the email — only provide the critique.`,
      },
      {
        role: 'user',
        content: `Review this cold email draft for "${clientData.businessName}" in ${clientData.location || 'Unknown'}.\n\nDRAFT:\n${draft}\n\nCLIENT DATA:\n${brief}\n\nScore the draft 1-10 on each criterion and provide specific fixes:\n1. PERSONALIZATION: Does it reference specific details about THIS business? Or could it be sent to anyone?\n2. GAP COVERAGE: Does it mention the actual detected gaps (${(clientData.detectedGaps || []).join(', ') || 'none listed'})? Does it explain WHY those gaps hurt them?\n3. CREDIBILITY: Does it sound like an expert or a random cold emailer? Is the social proof believable?\n4. CTA: Is the call to action low-friction? Would a busy restaurant/cafe/shop owner actually respond?\n5. TONE: Does it sound human or AI-generated? Any corporate buzzwords that need removing?\n6. SUBJECT LINE: Would YOU open this email? Is it specific or generic?\n\nList ONLY the specific lines that need changing and exactly HOW to change them.`,
      },
    ], fallback, 600, 0.4)

    // ─────────────────────────────────────────────────────
    // AGENT 4 — THE CLOSER
    // Takes the draft + critique and produces the final
    // perfected version.
    // ─────────────────────────────────────────────────────
    const finalPitch = await runAgent(key4, [
      {
        role: 'system',
        content: `You are the final-stage email closer. You take a draft and a critic's feedback and produce the absolute best version of the email. You are meticulous — every word earns its place.

Your non-negotiable rules:
- The email MUST mention at least 2 specific gaps or issues detected about the client's digital presence.
- The email MUST reference something specific about the business (their location, their product, their rating, their description).
- The email MUST NOT use any of these banned words/phrases: "unlock", "elevate", "leverage", "synergy", "amplify", "potential", "I hope this email finds you", "As a", "I wanted to reach out", "I noticed that".
- The email MUST sound like it was written by a real person, not an AI.
- The subject line MUST be specific to this business — not generic.
- Length: 150-220 words for the body. This is critical — do not write less.
- Sign off with EXACTLY: ${senderName}
- Output format: "Subject: " on line 1, then the body. NOTHING else — no preamble, no "Here is the email", no commentary after the sign-off.`,
      },
      {
        role: 'user',
        content: `Produce the final, perfect cold email.\n\nORIGINAL DRAFT:\n${draft}\n\nCRITIC'S FEEDBACK:\n${critique}\n\nCLIENT DATA:\n${brief}\n\nApply all valid critique points. Keep what works in the draft. Fix what doesn't. Output ONLY the final email.`,
      },
    ], fallback, 800, 0.65)

    // Clean the output — strip any preamble the model might add
    let cleaned = finalPitch.trim()
    const subjectIdx = cleaned.indexOf('Subject:')
    if (subjectIdx > 0) {
      cleaned = cleaned.substring(subjectIdx)
    }
    // Strip any trailing commentary after the sign-off
    const signOffPatterns = [senderName, 'Best regards', 'Best,', 'Cheers,', 'Warm regards', 'Thanks,']
    for (const pattern of signOffPatterns) {
      const lastIdx = cleaned.lastIndexOf(pattern)
      if (lastIdx > 0) {
        const afterSignOff = cleaned.substring(lastIdx + pattern.length).trim()
        // If there's substantial text after sign-off, it's likely AI commentary
        if (afterSignOff.length > 30 && !afterSignOff.startsWith('P.S.')) {
          cleaned = cleaned.substring(0, lastIdx + pattern.length)
        }
        break
      }
    }

    return NextResponse.json({ pitch: cleaned.trim() }, { status: 200 })
  } catch (error: any) {
    console.error('[pitch/POST] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
