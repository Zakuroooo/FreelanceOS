import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IPitch extends Document {
  userId: mongoose.Types.ObjectId
  clientId: mongoose.Types.ObjectId
  emailSubject?: string
  emailBody?: string
  linkedinDm?: string
  instagramDm?: string
  whatsappMsg?: string
  fullProposal?: string
  whyThem?: string
  qualityScore?: number
  tone?: 'professional' | 'friendly' | 'bold'
  status: 'draft' | 'approved' | 'sent'
  createdAt: Date
}

const PitchSchema = new Schema<IPitch>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId:     { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  emailSubject: { type: String },
  emailBody:    { type: String },
  linkedinDm:   { type: String },
  instagramDm:  { type: String },
  whatsappMsg:  { type: String },
  fullProposal: { type: String },
  whyThem:      { type: String },
  qualityScore: { type: Number, min: 0, max: 100 },
  tone: {
    type: String,
    enum: ['professional', 'friendly', 'bold'],
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'sent'],
    default: 'draft',
  },
  createdAt:    { type: Date, default: Date.now },
})

const Pitch = models.Pitch || model<IPitch>('Pitch', PitchSchema)
export default Pitch
