import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientData } = await req.json()
    if (!clientData || !clientData.businessName) {
      return NextResponse.json({ error: 'clientData is required' }, { status: 400 })
    }

    const prompt = `
You are an expert sales analyst for a digital agency. Analyze this lead and provide structured intel in JSON format.
Client: ${clientData.businessName}
Industry: ${clientData.industry || 'Unknown'}
Location: ${clientData.location || 'Unknown'}
Description: ${clientData.metaDescription || 'None'}
Gaps Detected: ${clientData.detectedGaps?.join(', ') || 'None'}
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

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'You are a helpful data processing assistant that strictly outputs JSON.' }, { role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })

    const rawContent = completion.choices[0]?.message?.content || '{}'
    let result
    try {
      result = JSON.parse(rawContent)
    } catch (err) {
      console.error('Failed to parse Groq response:', rawContent)
      result = {}
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('[intel/POST] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
