/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'

async function runPrompt(apiKey: string | undefined, prompt: string, fallbackKey: string | undefined) {
  if (!apiKey) throw new Error('API key is missing')
  
  try {
    const groq = new Groq({ apiKey })
    const res = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 400,
    })
    return res.choices[0]?.message?.content || ''
  } catch (error) {
    console.warn('Groq request failed, using fallback key...')
    if (!fallbackKey) throw error
    const groqFallback = new Groq({ apiKey: fallbackKey })
    const res = await groqFallback.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 400,
    })
    return res.choices[0]?.message?.content || ''
  }
}

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

    // Key Assignments
    const key1 = process.env.GROQ_API_KEY_1
    const key2 = process.env.GROQ_API_KEY_2
    const key3 = process.env.GROQ_API_KEY_3
    const key4 = process.env.GROQ_API_KEY_4
    const fallback = process.env.GROQ_API_KEY_FALLBACK

    // ---------------------------------------------------------
    // Step 1: The Writer
    // ---------------------------------------------------------
    const prompt1 = `
You are a sales representative. Write a cold email pitch for this potential client.
Business Name: ${clientData.businessName}
Location: ${clientData.location || 'Unknown'}
Detected Digital Gaps: ${gapsStr}
Business Description: ${clientData.metaDescription || 'None'}

Mention the gaps as an opportunity for growth and ask for a 5-minute chat.
`
    const draft1 = await runPrompt(key1, prompt1, fallback)

    // ---------------------------------------------------------
    // Step 2: The Editor
    // ---------------------------------------------------------
    const prompt2 = `
You are an expert copywriter. Review this cold email draft:
"${draft1}"

Rewrite it to be much shorter, punchier, and highly conversational. Remove any fluff or corporate jargon. Make it sound like it was written by a real human, not an AI. Keep it under 100 words.
`
    const draft2 = await runPrompt(key2, prompt2, fallback)

    // ---------------------------------------------------------
    // Step 3: The Critic
    // ---------------------------------------------------------
    const prompt3 = `
You are a harsh sales critic. Review this cold email pitch:
"${draft2}"

The client is ${clientData.businessName} in ${clientData.location || 'Unknown'}. 
The gaps we detected are: ${gapsStr}.

Identify any problems with this pitch. Is it too spammy? Does it fail to mention the specific gaps? Write a short bulleted list of strict instructions on exactly how to fix the pitch so it converts better. Do not write a new pitch, only the critique instructions.
`
    const critique = await runPrompt(key3, prompt3, fallback)

    // ---------------------------------------------------------
    // Step 4: The Closer
    // ---------------------------------------------------------
    const prompt4 = `
You are an elite, top-tier sales closer for a premium digital growth agency.
Your task is to write the absolute final, perfect cold email pitch.

Here is the current draft:
"${draft2}"

Here is the Critic's feedback on how to improve it:
"${critique}"

Client Name: ${clientData.businessName}

Synthesize everything into the ultimate cold email.
Guidelines:
1. Subject line should be catchy, natural, and highly relevant.
2. The email MUST be short, punchy, and highly readable (under 120 words). No fluff.
3. It must address the Critic's feedback perfectly.
4. Softly point out the digital gaps as an "opportunity for growth".
5. Sign off professionally using exactly: ${senderName}. DO NOT use brackets like [Your Name].
6. Return ONLY the plain text format, starting with "Subject: " on the first line, followed by the body. No introductory or concluding text.
`
    const finalPitch = await runPrompt(key4, prompt4, fallback)

    return NextResponse.json({ pitch: finalPitch.trim() }, { status: 200 })
  } catch (error: any) {
    console.error('[pitch/POST] error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
