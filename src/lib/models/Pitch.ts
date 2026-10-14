import mongoose, { Schema, models, model, type Document } from 'mongoose'

/**
 * The `overallStatus` values, in one place. API routes accept a status as a query filter,
 * and a hand-written copy of this list there would be free to drift away from the schema.
 */
export const PITCH_STATUSES = ['draft', 'sent', 'replied', 'approved'] as const
export type PitchStatus = typeof PITCH_STATUSES[number]

/** Narrow an untrusted string — a query parameter, typically — to a known status. */
export function isPitchStatus(value: string): value is PitchStatus {
  return (PITCH_STATUSES as readonly string[]).includes(value)
}

export interface IPitch extends Document {
  userId: mongoose.Types.ObjectId
  orgId: mongoose.Types.ObjectId
  clientId?: mongoose.Types.ObjectId
  // Business snapshot at time of pitch generation
  businessName: string
  businessEmail?: string
  businessPhone?: string
  businessInstagram?: string
  businessLinkedin?: string
  businessWhatsapp?: string
  businessLocation?: string
  // Pitch content
  emailSubject?: string
  emailBody?: string        // Full email pitch
  whatsappMsg?: string      // Shortened WhatsApp version
  linkedinDm?: string       // LinkedIn-adapted version
  instagramDm?: string      // Instagram-adapted version (casual)
  fullProposal?: string
  whyThem?: string
  qualityScore?: number
  tone?: 'professional' | 'friendly' | 'bold'
  // Send tracking per channel
  sentChannels: {
    email?: { sentAt: Date; status: 'sent' | 'failed'; error?: string }
    whatsapp?: { sentAt: Date; status: 'ready' }
    linkedin?: { sentAt: Date; status: 'copied' }
    instagram?: { sentAt: Date; status: 'copied' }
  }
  overallStatus: 'draft' | 'sent' | 'replied' | 'approved'
  createdAt: Date
}

const PitchSchema = new Schema<IPitch>({
  userId:             { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orgId:              { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  clientId:           { type: Schema.Types.ObjectId, ref: 'Client' },
  businessName:       { type: String, required: true },
  businessEmail:      { type: String },
  businessPhone:      { type: String },
  businessInstagram:  { type: String },
  businessLinkedin:   { type: String },
  businessWhatsapp:   { type: String },
  businessLocation:   { type: String },
  emailSubject:       { type: String },
  emailBody:          { type: String },
  whatsappMsg:        { type: String },
  linkedinDm:         { type: String },
  instagramDm:        { type: String },
  fullProposal:       { type: String },
  whyThem:            { type: String },
  qualityScore:       { type: Number, min: 0, max: 100 },
  tone: {
    type: String,
    enum: ['professional', 'friendly', 'bold'],
  },
  // The `status` values are a closed set per channel and the interface above already
  // says so; the schema said bare `String`, so the two could drift silently. Enums make
  // the type declaration enforceable on `create()`. The `findByIdAndUpdate` calls in
  // app/api/outreach skip validators by default, so this is a contract for new documents
  // rather than a gate on every write.
  sentChannels: {
    email:     { sentAt: Date, status: { type: String, enum: ['sent', 'failed'] }, error: String },
    whatsapp:  { sentAt: Date, status: { type: String, enum: ['ready'] } },
    linkedin:  { sentAt: Date, status: { type: String, enum: ['copied'] } },
    instagram: { sentAt: Date, status: { type: String, enum: ['copied'] } },
  },
  overallStatus: {
    type: String,
    enum: [...PITCH_STATUSES],
    default: 'draft',
  },
  createdAt: { type: Date, default: Date.now },
})

PitchSchema.index({ userId: 1, createdAt: -1 })
PitchSchema.index({ orgId: 1, overallStatus: 1, createdAt: -1 })
// The pitches list also runs a status-filtered variant (`?status=` in app/api/pitches),
// which the index above cannot serve past the first key — the filter would be applied
// after the scan and the sort done in memory.
PitchSchema.index({ userId: 1, overallStatus: 1, createdAt: -1 })

const Pitch: mongoose.Model<IPitch> = models.Pitch || model<IPitch>('Pitch', PitchSchema)
export default Pitch
