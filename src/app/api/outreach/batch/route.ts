import { auth } from '@/auth'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Pitch from '@/lib/models/Pitch'
import Deal from '@/lib/models/Deal'
import Client from '@/lib/models/Client'
import Notification from '@/lib/models/Notification'
import { ensureSessionScope } from '@/lib/scope'
import { pitchToHtml, isValidEmail } from '@/lib/gmail'
import { resolveMailer, type Mailer } from '@/lib/mailer'
import Groq from 'groq-sdk'
import { GROQ_MODEL, GROQ_MODEL_FALLBACKS, isModelUnavailableError } from '@/lib/groq'
import { researchWebsite, formatSiteResearch } from '@/lib/research'
import { findSimilarPitches, formatMemoryBlock } from '@/lib/memory'

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
  /** 'confirmed' = scraped from their own site; 'guessed' = info@domain pattern (MX-verified but unconfirmed). */
  businessEmailConfidence?: string
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

async function generatePitch(
  lead: BatchLead,
  groq: Groq,
  userName: string,
  context: { liveResearch: string; memoryBlock: string },
): Promise<{
  emailSubject: string
  emailBody: string
  whatsappMsg: string
  linkedinDm: string
  instagramDm: string
}> {
  const gaps = lead.detectedGaps?.join(', ') || 'multiple digital marketing opportunities'

  const messages = [{
    role: 'system' as const,
    content: `You are an expert freelance sales copywriter. Generate a personalized outreach pitch for a local business.
Return ONLY valid JSON with these exact keys: emailSubject, emailBody, whatsappMsg, linkedinDm, instagramDm.
- emailBody: Professional 200-250 word email pitch (no subject line)
- whatsappMsg: Casual 80-word WhatsApp version
- linkedinDm: Professional 100-word LinkedIn version
- instagramDm: Casual Instagram DM (60 words)
The sender's name is: ${userName}`
  }, {
    role: 'user' as const,
    content: `Business: ${lead.businessName}
Location: ${lead.businessLocation || 'India'}
Website: ${lead.website || 'none'}
Identified gaps: ${gaps}
${context.liveResearch ? `\n${context.liveResearch}` : ''}
${context.memoryBlock ? `\n${context.memoryBlock}` : ''}`
  }]

  // Walk the model chain: GROQ_MODEL first, then the fallbacks. Groq retires hosted
  // models without notice — this exact failure (404 model_not_found on
  // llama-3.3-70b-versatile) took the whole pipeline down once already.
  const models = [GROQ_MODEL, ...GROQ_MODEL_FALLBACKS.filter(m => m !== GROQ_MODEL)]
  let lastErr: unknown
  for (const model of models) {
    try {
      // gpt-oss / qwen are reasoning models — reasoning tokens count against the
      // budget, so the cap must cover thinking plus ~500 words of JSON output.
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })
      const raw = completion.choices[0]?.message?.content ?? '{}'
      return JSON.parse(raw) as {
        emailSubject: string
        emailBody: string
        whatsappMsg: string
        linkedinDm: string
        instagramDm: string
      }
    } catch (err) {
      lastErr = err
      if (!isModelUnavailableError(err)) throw err
      console.warn(`[outreach/batch] model "${model}" unavailable, falling back:`, err instanceof Error ? err.message : err)
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('All Groq models failed')
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
  const scope = await ensureSessionScope(session.user.id)

  // Narrowed once — inside the stream closure TS loses the `session.user` guarantee.
  const userId = session.user.id
  const orgId = scope.orgId
  const userName = session.user.name ?? 'Freelancer'

  // Resolve a transport if the email channel is selected — the user's Gmail if it is
  // connected and still refreshing, otherwise their own SMTP server.
  let mailer: Mailer | null = null
  // A dead Gmail connection used to be swallowed here, so the run reported every lead
  // as generated and the user never learned that nothing was actually emailed. The
  // reason is carried into the stream and announced instead.
  let mailerError: string | null = null
  if (channels.email) {
    const resolved = await resolveMailer(session.user.id)
    if (resolved.ok) {
      mailer = resolved.mailer
    } else {
      mailerError = `${resolved.error} Pitches will still be generated and saved.`
    }
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      send({ type: 'start', total: leads.length })

      // Reuse the `error` event the feed already renders rather than inventing a type
      // the client would silently drop. No `index`, so no lead row is marked failed.
      if (mailerError) {
        send({ type: 'error', businessName: 'Email', error: mailerError })
      }

      // Run pitches in parallel — 4 at a time (one per Groq key)
      const results: Array<{ success: boolean; businessName: string; error?: string }> = []

      for (let batchStart = 0; batchStart < leads.length; batchStart += GROQ_KEYS.length) {
        const batch = leads.slice(batchStart, batchStart + GROQ_KEYS.length)

        const batchPromises = batch.map(async (lead, i) => {
          const globalIndex = batchStart + i
          send({ type: 'generating', index: globalIndex, businessName: lead.businessName })

          try {
            // Per-lead agent context: live site observation + retrieved memory.
            // Both are best-effort — a slow/dead site must never stall a campaign.
            let liveResearch = ''
            try {
              if (lead.website) {
                liveResearch = formatSiteResearch(await researchWebsite(lead.website))
              }
            } catch { /* non-throwing by design */ }
            let memoryBlock = ''
            try {
              memoryBlock = formatMemoryBlock(await findSimilarPitches(userId, {
                gaps: lead.detectedGaps ?? [],
                location: lead.businessLocation ?? null,
              }))
            } catch { /* memory is an enhancement, not a dependency */ }

            const groq = getGroqForIndex(globalIndex)
            const context = { liveResearch, memoryBlock }
            let pitchData
            try {
              pitchData = await generatePitch(lead, groq, userName, context)
            } catch (pitchErr) {
              // Rate limits and transient 5xxs are routine across a batch. A spare
              // key sits one rotation away — retry there before failing the lead.
              console.warn(
                `[outreach/batch] ${lead.businessName}: first attempt failed, retrying on next key:`,
                pitchErr instanceof Error ? pitchErr.message : pitchErr
              )
              const nextGroq = getGroqForIndex(globalIndex + 1)
              pitchData = await generatePitch(lead, nextGroq, userName, context)
            }

            // Save pitch to DB
            const pitch = await Pitch.create({
              userId:           userId,
              orgId:            orgId,
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

            // Send email if channel selected + a transport resolved + email available.
            // Addresses come from scraped listings, so a malformed one is routine; check
            // the shape here rather than spending an API call to be told the same.
            // Auto-send ONLY verified addresses. Guessed info@domains bounce with
            // "address does not exist" — those become handoff-queue items instead.
            const emailVerified = lead.businessEmailConfidence !== 'guessed'
            if (channels.email && mailer && lead.businessEmail && isValidEmail(lead.businessEmail) && emailVerified) {
              const html = pitchToHtml(pitchData.emailBody, userName)
              const emailResult = await mailer.send({
                fromName: userName,
                to:       lead.businessEmail,
                subject:  pitchData.emailSubject,
                html,
              })

              // `error: undefined` used to be written into `$set` on the success path,
              // which is a stored field on some driver/schema paths and reads back as a
              // failure marker. Only set it when there is something to record.
              await Pitch.findByIdAndUpdate(pitch._id, {
                $set: {
                  'sentChannels.email': emailResult.success
                    ? { sentAt: new Date(), status: 'sent' }
                    : { sentAt: new Date(), status: 'failed', error: emailResult.error },
                  ...(emailResult.success ? { overallStatus: 'sent' } : {}),
                }
              })

              emailSent = emailResult.success
              send({ type: 'email_sent', index: globalIndex, businessName: lead.businessName, success: emailResult.success })
            } else if (channels.email && mailer && lead.businessEmail && !emailVerified) {
              // Guessed address — pitch is saved and lands in the send queue with a
              // verify-first warning instead of a guaranteed bounce.
              send({
                type: 'channel_ready',
                index: globalIndex,
                businessName: lead.businessName,
                pitchId: String(pitch._id),
                channel: 'email-unverified',
                url: `mailto:${lead.businessEmail}?subject=${encodeURIComponent(pitchData.emailSubject)}&body=${encodeURIComponent(pitchData.emailBody.slice(0, 1800))}`,
                message: `${lead.businessEmail} is an unverified guess (info@domain pattern). Confirm the address, then send.`,
              })
            }

            // Non-email channels have no sanctioned silent-send API. Instead of the
            // campaign pretending they went out, hand the user a ready-to-fire
            // deep link per lead — one tap opens the chat/app with text pre-filled.
            const channelLinks: Array<{ channel: string; url: string }> = []
            if (channels.whatsapp && lead.businessPhone) {
              const phone = lead.businessPhone.replace(/[\s\-()]/g, '').replace(/^\+/, '')
              channelLinks.push({
                channel: 'whatsapp',
                url: `https://wa.me/${phone}?text=${encodeURIComponent(pitchData.whatsappMsg || pitchData.emailBody.slice(0, 900))}`,
              })
            }
            if (channels.linkedin && lead.businessLinkedin) {
              channelLinks.push({ channel: 'linkedin', url: lead.businessLinkedin })
            }
            if (channels.instagram && lead.businessInstagram) {
              // Discovery stores full URLs — never concatenate handles onto them.
              const igUrl = lead.businessInstagram.startsWith('http')
                ? lead.businessInstagram
                : `https://www.instagram.com/${lead.businessInstagram.replace(/^@/, '').replace(/\/+$/, '')}/`
              channelLinks.push({ channel: 'instagram', url: igUrl })
            }
            for (const link of channelLinks) {
              await Pitch.findByIdAndUpdate(pitch._id, {
                $set: { [`sentChannels.${link.channel}`]: { sentAt: new Date(), status: 'ready' } },
              })
              send({
                type: 'channel_ready',
                index: globalIndex,
                businessName: lead.businessName,
                pitchId: String(pitch._id),
                channel: link.channel,
                url: link.url,
                message:
                  link.channel === 'whatsapp' ? pitchData.whatsappMsg :
                  link.channel === 'linkedin' ? pitchData.linkedinDm :
                  pitchData.instagramDm,
              })
            }

            // Auto-create deal
            const existingDeal = await Deal.findOne({ pitchId: pitch._id, userId })
            if (!existingDeal) {
              await Deal.create({
                userId:           userId,
                orgId:            orgId,
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
              // Scoped by userId: `findByIdAndUpdate` took an id straight from the
              // request body, so a crafted `clientId` could flip another user's client
              // to 'pitched'.
              await Client.findOneAndUpdate(
                { _id: lead.clientId, userId },
                { status: 'pitched' }
              )
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

      const successCount = results.filter(r => r.success).length
      const failedCount  = results.filter(r => !r.success).length

      // Feed the notifications inbox (Module 4) so campaigns leave a trace outside
      // this ephemeral SSE window.
      try {
        await Notification.create({
          userId,
          orgId,
          type: 'campaign_complete',
          message: failedCount > 0
            ? `Campaign finished: ${successCount} sent, ${failedCount} failed across ${leads.length} lead${leads.length > 1 ? 's' : ''}.`
            : `Campaign complete: ${successCount} pitch${successCount === 1 ? '' : 'es'} sent successfully.`,
        })
        const failedEmails = results.filter(r => !r.success && r.error)
        if (failedEmails.length > 0) {
          await Notification.create({
            userId,
            orgId,
            type: 'email_failed',
            message: `${failedEmails.length} lead${failedEmails.length > 1 ? 's' : ''} could not be processed — check the campaign log for details.`,
          })
        }
      } catch { /* a feed write must never fail the campaign response */ }

      send({
        type:    'complete',
        total:   leads.length,
        success: successCount,
        failed:  failedCount,
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
