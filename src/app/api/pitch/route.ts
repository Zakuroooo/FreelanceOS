/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

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

    const gapsStr = clientData.detectedGaps && clientData.detectedGaps.length > 0
      ? clientData.detectedGaps.join(', ')
      : 'no major digital gaps'

    const senderName = session.user.name || 'Your Name'

    const prompt = `
You are an elite, top-tier sales representative for a premium digital growth agency.
Your task is to write a highly converting, hyper-personalized, and professional cold email pitch for a potential client.

Client details:
- Business Name: ${clientData.businessName}
- Industry: ${clientData.industry || 'Unknown'}
- Location: ${clientData.location || 'Unknown'}
- Detected Digital Gaps: ${gapsStr}
- Current Website: ${clientData.website || 'None'}
- Business Description: ${clientData.metaDescription || 'None'}

Sender details:
- Name: ${senderName}

Guidelines:
1. Subject line should be catchy, natural, and directly relevant to their business.
2. The email MUST be short, punchy, and highly readable (under 120 words). No fluff.
3. Naturally mention their specific business name and location in the opening.
4. If a Business Description is provided, use a specific detail from it to show you have done your research.
5. Softly point out the digital gaps we found (e.g. if they have no website, no social presence, or missing video content) as an "opportunity for growth" rather than an insult.
6. Propose a clear, low-friction call to action (e.g. asking if they are open to a quick 5-minute chat next week).
7. Sign off professionally using the exact name: ${senderName}. DO NOT use brackets like [Your Name].
8. Return the output in plain text format, starting with "Subject: " on the first line, followed by the body.
`

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 400,
    })

    const pitch = chatCompletion.choices[0]?.message?.content || ''

    return NextResponse.json({ pitch }, { status: 200 })
  } catch (error: any) {
    console.error('[pitch/POST] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
