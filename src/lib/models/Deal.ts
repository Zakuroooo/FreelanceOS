import mongoose, { Schema, models, model, type Document } from 'mongoose'

export interface IDeal extends Document {
  userId: mongoose.Types.ObjectId
  clientId?: mongoose.Types.ObjectId
  pitchId?: mongoose.Types.ObjectId
  businessName: string
  businessLocation?: string
  // Sales pipeline stage
  stage: 'pitched' | 'responded' | 'meeting' | 'proposal' | 'won' | 'lost'
  // Channel that got the response
  channel?: 'email' | 'whatsapp' | 'linkedin' | 'instagram'
  // Financials
  estimatedValue: number
  wonValue?: number
  currency: string
  // Timeline
  pitchedAt?: Date
  respondedAt?: Date
  meetingAt?: Date
  wonAt?: Date
  lostAt?: Date
  // Notes & actions
  notes: Array<{ text: string; createdAt: Date }>
  nextAction?: string
  nextActionDate?: Date
  lostReason?: string
  createdAt: Date
  updatedAt: Date
}

const DealSchema = new Schema<IDeal>({
  userId:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId:         { type: Schema.Types.ObjectId, ref: 'Client' },
  pitchId:          { type: Schema.Types.ObjectId, ref: 'Pitch' },
  businessName:     { type: String, required: true },
  businessLocation: { type: String },
  stage: {
    type: String,
    enum: ['pitched', 'responded', 'meeting', 'proposal', 'won', 'lost'],
    default: 'pitched',
  },
  channel: {
    type: String,
    enum: ['email', 'whatsapp', 'linkedin', 'instagram'],
  },
  estimatedValue: { type: Number, default: 0 },
  wonValue:       { type: Number },
  currency:       { type: String, default: 'INR' },
  pitchedAt:      { type: Date },
  respondedAt:    { type: Date },
  meetingAt:      { type: Date },
  wonAt:          { type: Date },
  lostAt:         { type: Date },
  notes: [{
    text:      { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  nextAction:     { type: String },
  nextActionDate: { type: Date },
  lostReason:     { type: String },
}, { timestamps: true })

DealSchema.index({ userId: 1, stage: 1 })
DealSchema.index({ userId: 1, createdAt: -1 })

const Deal = models.Deal || model<IDeal>('Deal', DealSchema)
export default Deal
