import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'
import { GROQ_MODEL } from '@/lib/groq'

/**
 * The subset of a discovered lead this prompt actually reads. Named rather than left as
 * `any` so that a rename on the discover side surfaces here instead of quietly
 * interpolating `undefined` into the prompt. Every field is still unverified request
 * JSON — each one is either guarded below or has a fallback.
 */
interface IntelInput {
  businessName?: string
  industry?: string
  location?: string
  metaDescription?: string
  detectedGaps?: string[]
  opportunityScore?: number
}

async function callGroq(prompt: string, systemPrompt: string) {
  const keys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_FALLBACK,
  ].filter(Boolean) as string[]

  if (keys.length === 0) throw new Error('No Groq API keys configured')

  // Try keys in order until one works
  for (let i = 0; i < keys.length; i++) {
    try {
      const groq = new Groq({ apiKey: keys[i] })
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        model: GROQ_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      })
      const rawContent = completion.choices[0]?.message?.content
      if (!rawContent) throw new Error('Empty response from Groq')
      return rawContent
    } catch (err) {
      console.warn(`[intel] Key ${i + 1} failed:`, (err as Error).message)
      if (i === keys.length - 1) throw err // last key, rethrow
    }
  }
  throw new Error('All Groq keys exhausted')
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { clientData?: IntelInput }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { clientData } = body
    if (typeof clientData?.businessName !== 'string' || !clientData.businessName.trim()) {
      return NextResponse.json({ error: 'clientData is required' }, { status: 400 })
    }

    const prompt = `
You are an expert sales analyst for a digital agency. Analyze this lead and provide structured intel in JSON format.
Client: ${clientData.businessName}
Industry: ${clientData.industry || 'Unknown'}
Location: ${clientData.location || 'Unknown'}
Description: ${clientData.metaDescription || 'None'}
Gaps Detected: ${Array.isArray(clientData.detectedGaps) ? clientData.detectedGaps.join(', ') || 'None' : 'None'}
Opportunity Score: ${clientData.opportunityScore || 0}/100

Return a JSON object with EXACTLY these keys:
{
  "whyThisLead": "One short paragraph summary of why this is a good lead based on their specific gaps.",
  "serviceMatch": ["Service 1", "Service 2", "Service 3"],
  "readiness": {
    "service": "Primary service to pitch",
    "complexity": "LOW | MEDIUM | HIGH",
    "estimatedWork": "Time estimate (e.g., 2-3 weeks)",
    "label": "STRONG FIT | PARTIAL FIT | NOT YOUR LANE",
    "reason": "Why this label applies"
  },
  "requirements": ["Requirement 1", "Requirement 2"],
  "pitchAngle": "One sentence pitch angle focusing on the core problem, e.g., 'Lead with lost bookings from poor mobile UX, not visual aesthetics.'",
  "icebreaker": "Short personalized cold email opening line mentioning a specific gap or detail."
}
Output valid JSON only. Do not wrap it in markdown block quotes.
`

    const rawContent = await callGroq(prompt, 'You are a helpful data processing assistant that strictly outputs JSON.')

    let result
    try {
      result = JSON.parse(rawContent)
    } catch {
      console.error('[intel] Failed to parse Groq response:', rawContent)
      return NextResponse.json({ error: 'AI returned invalid data. Please try again.' }, { status: 502 })
    }

    // Validate the response has at least some expected keys
    if (!result.whyThisLead && !result.serviceMatch) {
      return NextResponse.json({ error: 'AI returned empty intel. Please try again.' }, { status: 502 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[intel/POST] error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

