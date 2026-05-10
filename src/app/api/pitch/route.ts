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

    const prompt = `
You are an expert sales representative for a digital marketing and development agency.
Write a personalized, concise, and highly converting cold email pitch for a potential client.

Client details:
- Business Name: ${clientData.businessName}
- Industry: ${clientData.industry || 'Unknown'}
- Location: ${clientData.location || 'Unknown'}
- Detected Digital Gaps: ${gapsStr}
- Current Website: ${clientData.website || 'None'}
- Business Description: ${clientData.metaDescription || 'None'}

Guidelines:
1. Subject line should be catchy and relevant.
2. The email should be short (under 150 words).
3. Mention their specific business name and location.
4. Point out the digital gaps we found (e.g. if they have no website, no social presence, or missing video content) and how we can solve them to bring them more customers.
5. If the Business Description is provided, use a detail from it to personalize the opening and show we've done our research.
6. End with a low-friction call to action (e.g. asking for a quick 5-minute chat).
7. Return the output in plain text format, starting with "Subject: " on the first line, followed by the body.
`

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 500,
    })

    const pitch = chatCompletion.choices[0]?.message?.content || ''

    return NextResponse.json({ pitch }, { status: 200 })
  } catch (error: any) {
    console.error('[pitch/POST] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
