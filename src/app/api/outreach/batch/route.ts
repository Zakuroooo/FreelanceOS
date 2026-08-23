import { auth } from '@/auth'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'
import Deal from '@/lib/models/Deal'
import Client from '@/lib/models/Client'
import { getGmailTokens, getFreshAccessToken, sendViaGmail, pitchToHtml } from '@/lib/gmail'
import Groq from 'groq-sdk'

const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1!,
  process.env.GROQ_API_KEY_2!,
  process.env.GROQ_API_KEY_3!,
  process.env.GROQ_API_KEY_4!,
].filter(Boolean)

const FALLBACK_KEY = process.env.GROQ_API_KEY_FALLBACK!

function getGroqForIndex(i: number) {
  const key = GROQ_KEYS[i % GROQ_KEYS.length] || FALLBACK_KEY
  return new Groq({ apiKey: key })
}

type BatchLead = {
  clientId?: string
  businessName: string
  businessEmail?: string
  businessPhone?: string
  businessInstagram?: string
  businessLinkedin?: string
  businessLocation?: string
  detectedGaps?: string[]
  website?: string
}

type Channels = {
  email?: boolean
  whatsapp?: boolean
  linkedin?: boolean
  instagram?: boolean
}

async function generatePitch(lead: BatchLead, groq: Groq, userName: string): Promise<{
  emailSubject: string
  emailBody: string
  whatsappMsg: string
  linkedinDm: string
  instagramDm: string
}> {
  const gaps = lead.detectedGaps?.join(', ') || 'multiple digital marketing opportunities'

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [{
      role: 'system',
      content: `You are an expert freelance sales copywriter. Generate a personalized outreach pitch for a local business.
Return ONLY valid JSON with these exact keys: emailSubject, emailBody, whatsappMsg, linkedinDm, instagramDm.
- emailBody: Professional 200-250 word email pitch (no subject line)
- whatsappMsg: Casual 80-word WhatsApp version
- linkedinDm: Professional 100-word LinkedIn version
- instagramDm: Casual Instagram DM (60 words, use emoji naturally)
The sender's name is: ${userName}`
    }, {
      role: 'user',
      content: `Business: ${lead.businessName}
Location: ${lead.businessLocation || 'India'}
Website: ${lead.website || 'none'}
Identified gaps: ${gaps}`
    }],
    temperature: 0.7,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  return JSON.parse(raw)
}

// POST /api/outreach/batch — SSE streaming batch send
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let body: { leads: BatchLead[]; channels: Channels }
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { leads, channels } = body
  if (!leads?.length) {
    return new Response(JSON.stringify({ error: 'No leads provided' }), { status: 400 })
  }

  await connectDB()

  // Load Gmail tokens if email channel selected
  let accessToken: string | null = null
  let gmailAddress: string | null = null
  if (channels.email) {
    const tokens = await getGmailTokens(session.user.id)
    if (tokens) {
      try {
        accessToken = await getFreshAccessToken(session.user.id, tokens)
        gmailAddress = tokens.gmailAddress
      } catch { /* will fail gracefully per-lead */ }
    }
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      send({ type: 'start', total: leads.length })

      // Run pitches in parallel — 4 at a time (one per Groq key)
      const results: Array<{ success: boolean; businessName: string; error?: string }> = []

      for (let batchStart = 0; batchStart < leads.length; batchStart += GROQ_KEYS.length) {
        const batch = leads.slice(batchStart, batchStart + GROQ_KEYS.length)

        const batchPromises = batch.map(async (lead, i) => {
          const globalIndex = batchStart + i
          send({ type: 'generating', index: globalIndex, businessName: lead.businessName })

          try {
            const groq = getGroqForIndex(globalIndex)
            const pitchData = await generatePitch(lead, groq, session.user!.name ?? 'Freelancer')

            // Save pitch to DB
            const pitch = await Pitch.create({
              userId:           session.user!.id,
              clientId:         lead.clientId,
              businessName:     lead.businessName,
              businessEmail:    lead.businessEmail,
              businessPhone:    lead.businessPhone,
              businessInstagram: lead.businessInstagram,
              businessLinkedin:  lead.businessLinkedin,
              businessLocation:  lead.businessLocation,
              emailSubject:     pitchData.emailSubject,
              emailBody:        pitchData.emailBody,
              whatsappMsg:      pitchData.whatsappMsg,
              linkedinDm:       pitchData.linkedinDm,
              instagramDm:      pitchData.instagramDm,
              overallStatus:    'draft',
              sentChannels:     {},
            })

            send({ type: 'pitch_generated', index: globalIndex, businessName: lead.businessName, pitchId: pitch._id })

            let emailSent = false

            // Send email if channel selected + gmail connected + email available
            if (channels.email && accessToken && gmailAddress && lead.businessEmail) {
              const html = pitchToHtml(pitchData.emailBody, session.user!.name ?? 'Freelancer')
              const emailResult = await sendViaGmail({
                accessToken,
                from:     gmailAddress,
                fromName: session.user!.name ?? 'Freelancer',
                to:       lead.businessEmail,
                subject:  pitchData.emailSubject,
                html,
              })

              await Pitch.findByIdAndUpdate(pitch._id, {
                $set: {
                  'sentChannels.email': {
                    sentAt: new Date(),
                    status: emailResult.success ? 'sent' : 'failed',
                    error:  emailResult.success ? undefined : emailResult.error,
                  },
                  ...(emailResult.success ? { overallStatus: 'sent' } : {}),
                }
              })

              emailSent = emailResult.success
              send({ type: 'email_sent', index: globalIndex, businessName: lead.businessName, success: emailResult.success })
            }

            // Auto-create deal
            const existingDeal = await Deal.findOne({ pitchId: pitch._id, userId: session.user!.id })
            if (!existingDeal) {
              await Deal.create({
                userId:           session.user!.id,
                pitchId:          pitch._id,
                clientId:         lead.clientId,
                businessName:     lead.businessName,
                businessLocation: lead.businessLocation,
                stage:            'pitched',
                channel:          emailSent ? 'email' : undefined,
                estimatedValue:   0,
                currency:         'INR',
                pitchedAt:        new Date(),
                notes:            [],
              })
            }

            // Update client status if clientId provided
            if (lead.clientId) {
              await Client.findByIdAndUpdate(lead.clientId, { status: 'pitched' })
            }

            results.push({ success: true, businessName: lead.businessName })
            send({ type: 'done', index: globalIndex, businessName: lead.businessName, pitchId: String(pitch._id) })

          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            results.push({ success: false, businessName: lead.businessName, error: msg })
            send({ type: 'error', index: globalIndex, businessName: lead.businessName, error: msg })
          }
        })

        await Promise.all(batchPromises)
      }

      send({
        type:    'complete',
        total:   leads.length,
        success: results.filter(r => r.success).length,
        failed:  results.filter(r => !r.success).length,
      })

      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  })
}
