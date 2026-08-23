import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IPitch extends Document {
  userId: mongoose.Types.ObjectId
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
  sentChannels: {
    email:     { sentAt: Date, status: String, error: String },
    whatsapp:  { sentAt: Date, status: String },
    linkedin:  { sentAt: Date, status: String },
    instagram: { sentAt: Date, status: String },
  },
  overallStatus: {
    type: String,
    enum: ['draft', 'sent', 'replied', 'approved'],
    default: 'draft',
  },
  createdAt: { type: Date, default: Date.now },
})

PitchSchema.index({ userId: 1, createdAt: -1 })

const Pitch = models.Pitch || model<IPitch>('Pitch', PitchSchema)
export default Pitch
